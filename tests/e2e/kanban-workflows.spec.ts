import { test, expect } from '@playwright/test';

test.describe('Kanban & Group Experience Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Setup Demo state so we skip the connection gates
    await page.addInitScript(() => {
      window.localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');
      window.localStorage.setItem('marigold_file_connected', 'true');
      window.localStorage.setItem('marigold_file_name', 'DEMO_roosevelt_july_2026.csv');
      window.localStorage.setItem('marigold_file_rows', '1842');
      window.sessionStorage.setItem('marigold_zk_proceeded', 'true');
    });
  });

  test('Clicking a Kanban card opens the persistent right panel', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for the Kanban board to render cards
    const kanbanCard = page.locator('.card').first();
    await expect(kanbanCard).toBeVisible();

    // Click the first card
    await kanbanCard.click();

    // The TicketRightPanel should open and display "Record Insights"
    const recordInsightsTitle = page.getByRole('heading', { name: 'Record Insights' });
    await expect(recordInsightsTitle).toBeVisible();
    
    // Check that the panel contains the "Activity & Comments Feed" section
    await expect(page.getByText('Activity & Comments Feed')).toBeVisible();
  });

  test('Creating a private note works in the panel', async ({ page }) => {
    await page.goto('/dashboard');

    const kanbanCard = page.locator('.card').first();
    await kanbanCard.click();
    
    // Look for the textarea in the panel
    const textarea = page.getByPlaceholder('Draft a note...');
    await expect(textarea).toBeVisible();

    // Uncheck "Send to group" if it exists/checked (make it private)
    const sendToGroupCheckbox = page.locator('label', { hasText: 'Send to group' }).locator('input[type="checkbox"]');
    if (await sendToGroupCheckbox.isVisible() && await sendToGroupCheckbox.isChecked()) {
      await sendToGroupCheckbox.uncheck();
    }

    // Type a note
    const noteContent = `Test private note - ${Date.now()}`;
    await textarea.fill(noteContent);
    
    // Save note
    await page.getByRole('button', { name: /Save Private Note/i }).click();

    // Verify it appears in the panel
    await expect(page.getByText(noteContent).first()).toBeVisible();
    
    // Verify it has a "Private" indicator
    await expect(page.getByText('Private')).toBeVisible();
  });

  test('Push to Triage creates a card from Explore', async ({ page }) => {
    await page.goto('/explore');

    // Click the first playbook to run it
    const densityPlaybook = page.locator('div').filter({ hasText: /^High-Density Residential Occupancy/i }).first();
    await densityPlaybook.click();

    // Wait for results to render (Wait for "Push to Triage" button to become enabled)
    const pushToTriageBtn = page.getByRole('button', { name: 'Push to Triage' });
    await expect(pushToTriageBtn).toBeVisible();
    await expect(pushToTriageBtn).toBeEnabled({ timeout: 10000 });

    // Push to Triage
    await pushToTriageBtn.click();

    // The TicketRightPanel should open immediately
    const recordInsightsTitle = page.getByRole('heading', { name: 'Record Insights' });
    await expect(recordInsightsTitle).toBeVisible();

    // The new ticket should have "Drilldown Anomaly" or playbook name in the title
    const panelContent = page.locator('text=Match').first();
    await expect(panelContent).toBeVisible();
  });
});
