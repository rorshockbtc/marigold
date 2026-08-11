import { test, expect } from '@playwright/test';

test.describe('Zero-Knowledge Feed Tests', () => {
  test('promoting a ticket to the group emits a feed event', async ({ page }) => {
    // 1. Navigate to the dashboard
    await page.goto('http://localhost:3000/dashboard');

    // 2. Mock the active group in localStorage to bypass onboarding
    await page.evaluate(() => {
      window.localStorage.setItem('marigold_active_group', 'Test Group');
      window.localStorage.setItem('marigold_display_name', 'Test User');
    });

    // 3. Open a ticket from the Kanban board
    // Assuming there is at least one card on the board
    const firstTicket = page.locator('.kanban-card').first();
    if (await firstTicket.isVisible()) {
      await firstTicket.click();

      // 4. Click Promote to Group in the TicketRightPanel
      const promoteBtn = page.getByRole('button', { name: 'Promote ticket to active group' });
      await expect(promoteBtn).toBeVisible();
      await promoteBtn.click();
      
      // Wait for interaction micro-animation
      await page.waitForTimeout(200);
      
      // 5. Navigate to the feed page
      await page.goto('http://localhost:3000/feed');
      
      // 6. Verify the event appears in the timeline
      const feedItem = page.locator('text="pushed ticket"').first();
      await expect(feedItem).toBeVisible();
      
      // Screenshot for verification
      await page.screenshot({ path: 'artifacts/screenshot-ticket-feed.png' });
    }
  });
});
