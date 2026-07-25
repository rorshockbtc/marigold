import { test, expect } from '@playwright/test';

test.describe('Marigold Architectural Invariants & Flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('Flow 1: Secure Workspace Join & PIN encryption', async ({ page }) => {
    await page.goto('http://localhost:3001/join#hash=test1234');
    await page.fill('input[type="password"]', '123456');
    await page.click('button:has-text("Set PIN")');
    await expect(page).toHaveURL(/.*\/dashboard/);
  });

  test('Flow 2: Roosevelt Demo Data Loading (Local & Web Workers)', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard');
    await page.click('button:has-text("Load DEMO_roosevelt")');
    // Ensure no crash and success message appears
    const successMsg = page.locator('text="Data loaded locally"');
    await expect(successMsg).toBeVisible();
    
    // Verify no outbound network requests with PII/data
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/telemetry') || url.includes('/api/upload')) {
        const postData = request.postData();
        expect(postData).not.toContain('roosevelt');
      }
    });
  });

  test('Flow 3: AI Chat Interface - PII Redaction', async ({ page }) => {
    await page.goto('http://localhost:3001/chat');
    
    // Listen to network requests to ensure PII is scrubbed BEFORE dispatch
    const requestPromise = page.waitForRequest(request => 
      request.url().includes('/api/chat') && request.method() === 'POST'
    );

    await page.fill('input[placeholder="Ask a question..."]', 'What is the SSN 999-99-9999?');
    await page.click('button[type="submit"]');

    const request = await requestPromise;
    const postData = request.postData();
    
    // Assert PII is scrubbed
    expect(postData).not.toContain('999-99-9999');
    expect(postData).toContain('[REDACTED]');
  });
});
