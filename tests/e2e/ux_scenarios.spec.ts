import { test, expect } from '@playwright/test';

test.describe('Marigold Insights E2E Scenarios (JTBD Framework)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup synthetic local state for testing
    await page.addInitScript(() => {
      window.localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');
      window.localStorage.setItem('marigold_file_connected', 'true');
      window.localStorage.setItem('marigold_file_name', 'DEMO_roosevelt_july_2026.csv');
      window.localStorage.setItem('marigold_file_rows', '1842');
      window.sessionStorage.setItem('marigold_zk_proceeded', 'true');
    });
  });

  test('JTBD 1: The Trust Evaluation (Solo Explorer)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    // Assert Dashboard loads (since we injected connected state)
    await expect(page.locator('h1').filter({ hasText: 'Workspace Dashboard' })).toBeVisible();
    
    // Assert Demo Workspace badge is visible
    await expect(page.getByText('Demo Workspace').first()).toBeVisible();
    
    // Assert 1,842 Active Records count is displayed
    await expect(page.getByText('1,842 Active Records')).toBeVisible();
  });

  test('JTBD 2: Group Orientation', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    // Click Group Activity Tab
    await page.getByRole('button', { name: /Group Activity/i }).click();
    
    // Assert live group activity feed and shared playbooks exist
    await expect(page.getByText(/Live Group Activity Feed/i)).toBeVisible();
    await expect(page.getByText(/Shared Group Playbooks/i)).toBeVisible();

    // Click Data Overview Tab
    await page.getByRole('button', { name: /Data Overview/i }).click();
    await expect(page.getByText(/Demographic Quality & Null Rates/i)).toBeVisible();
  });

  test('JTBD 3: The Micro Investigation (Triage)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    
    // Click Kanban Tab
    await page.getByRole('button', { name: /Mission Kanban/i }).click();
    
    // Verify columns exist
    await expect(page.getByText('Needs Triage')).toBeVisible();
    await expect(page.getByText('In Review')).toBeVisible();
  });

  test('JTBD 4: The Macro Investigation (Advanced Stats)', async ({ page }) => {
    await page.goto('/advanced-stats');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify the page title is visible
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('JTBD 5: The Final Output (Reporting/Export)', async ({ page }) => {
    await page.goto('/explore');
    await page.waitForLoadState('domcontentloaded');
    
    // Verify export button exists
    const exportBtn = page.getByRole('button', { name: /Export Full Audit/i });
    await expect(exportBtn).toBeVisible();
  });
});
