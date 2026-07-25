import { test, expect } from '@playwright/test';

test.describe('Marigold Insights E2E Scenarios (JTBD Framework)', () => {
  test.beforeEach(async ({ page }) => {
    // Setup synthetic local state for testing
    await page.addInitScript(() => {
      window.localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');
      window.localStorage.setItem('marigold_file_connected', 'true');
      window.localStorage.setItem('marigold_file_rows', '1842');
    });
  });

  test('JTBD 1: The Trust Evaluation (Solo Explorer)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Assert Dashboard loads (since we injected connected state)
    await expect(page.locator('h1').filter({ hasText: 'Workspace Dashboard' })).toBeVisible();
    
    // Assert Demo Workspace badge is visible
    await expect(page.getByText('Demo Workspace').first()).toBeVisible();
    
    // Assert 1,842 Active Records count is displayed
    await expect(page.getByText('1,842 Active Records')).toBeVisible();
  });

  test('JTBD 2: Group Orientation', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click Group Activity Tab
    await page.getByRole('button', { name: /Group Activity/i }).click();
    
    // Assert feed placeholder (or future feed)
    await expect(page.getByText(/Group Chat & Activity Feed/i)).toBeVisible();
  });

  test('JTBD 3: The Micro Investigation (Triage)', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Click Kanban Tab
    await page.getByRole('button', { name: /Mission Kanban/i }).click();
    
    // Verify columns exist
    await expect(page.getByText('Needs Triage')).toBeVisible();
    await expect(page.getByText('In Review')).toBeVisible();
    
    // Click a Kanban Card to open SideSheet
    await page.locator('.card').filter({ hasText: '100 Campus Dr' }).click();
    
    // Verify SideSheet opens (not Mari)
    await expect(page.getByRole('heading', { name: 'Record Insights' })).toBeVisible();
    await expect(page.getByText('Save Notes')).toBeVisible();
  });

  test('JTBD 4: The Macro Investigation (Advanced Stats)', async ({ page }) => {
    await page.goto('/advanced-stats');
    
    // Verify the UI is framed properly
    await expect(page.getByRole('heading', { name: 'Playbook Builder / Linkage Lab' })).toBeVisible();
    
    // Check for the "I\'m just having fun" handle
    await expect(page.getByRole('button', { name: /I\'m just having fun!/i })).toBeVisible();
  });

  test('JTBD 5: The Final Output (Reporting/Export)', async ({ page }) => {
    await page.goto('/explore');
    
    // Verify export button exists
    const exportBtn = page.getByRole('button', { name: /Generate Report/i });
    await expect(exportBtn).toBeVisible();
  });
});
