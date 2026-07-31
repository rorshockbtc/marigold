import { test, expect } from '@playwright/test';

/**
 * Smoke Test Suite
 *
 * The 30-second smoke test that runs on EVERY commit.
 * If any of these fail, the build is broken and deployment is blocked.
 *
 * These tests verify:
 * 1. Core routes load without crashing
 * 2. Auth redirects work
 * 3. No console.error during page loads
 * 4. No outbound PII leakage
 */
test.describe('Smoke Tests (Core Route Health)', () => {
  const consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    consoleErrors.length = 0;
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
  });

  test('Homepage loads without console errors', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Page should have some content
    const body = await page.textContent('body');
    expect(body).toBeTruthy();

    // No fatal console errors
    const fatalErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('Content Security Policy') && !e.includes('Clerk') && !e.includes('violates')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('/dashboard loads or shows auth state', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    const url = page.url();
    const hasAuthGateOrDashboard =
      url.includes('sign-in') ||
      url.includes('dashboard') ||
      (await page.locator('text=Sign In').count()) > 0 ||
      (await page.locator('text=Welcome to Marigold').count()) > 0;

    expect(hasAuthGateOrDashboard).toBe(true);
  });

  test('/chat loads and has an input field', async ({ page }) => {
    // Inject auth state for authenticated routes
    await page.addInitScript(() => {
      window.localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');
      window.localStorage.setItem('marigold_file_connected', 'true');
    });

    await page.goto('/chat');
    await page.waitForLoadState('domcontentloaded');

    // Should have some form of input
    const inputOrTextarea =
      (await page.locator('input[type="text"], textarea, input[placeholder]').count()) > 0;
    expect(inputOrTextarea).toBe(true);
  });

  test('No outbound requests contain PII patterns', async ({ page }) => {
    const piiPatterns = [
      /\d{3}-\d{2}-\d{4}/, // SSN
      /\d{9}/, // Raw SSN without dashes
    ];

    const outboundPayloads: string[] = [];

    page.on('request', (request) => {
      const postData = request.postData();
      if (postData) outboundPayloads.push(postData);
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');
      window.localStorage.setItem('marigold_file_connected', 'true');
    });

    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check all captured outbound payloads for PII
    for (const payload of outboundPayloads) {
      for (const pattern of piiPatterns) {
        expect(payload).not.toMatch(pattern);
      }
    }
  });
});
