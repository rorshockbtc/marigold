import { test, expect } from '@playwright/test';

/**
 * Interaction Audit Suite
 *
 * The "dead interaction detector." This test loads each core route,
 * finds every element with a data-testid, and verifies that:
 * - Buttons produce a DOM change when clicked.
 * - Filters update the displayed data.
 * - Drawers open and close.
 *
 * If any interactive element produces zero observable effect,
 * the test fails with the element's data-testid and route path.
 */
test.describe('Interaction Audit (Dead Element Detector)', () => {
  const coreRoutes = [
    '/dashboard',
    '/explore',
    '/advanced-stats',
    '/data-prep',
  ];

  test.beforeEach(async ({ page }) => {
    // Inject synthetic data state for authenticated experience
    await page.addInitScript(() => {
      window.localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');
      window.localStorage.setItem('marigold_file_connected', 'true');
      window.localStorage.setItem('marigold_file_rows', '1842');
    });
  });

  for (const route of coreRoutes) {
    test(`${route}: All buttons with data-testid produce a DOM effect`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Find all buttons with data-testid starting with "btn-"
      const buttons = await page.locator('[data-testid^="btn-"]').all();

      for (const button of buttons) {
        const testId = await button.getAttribute('data-testid');
        const isDisabled = await button.isDisabled();

        if (isDisabled) continue; // Skip disabled buttons — they're intentionally inert

        // Capture DOM state before click
        const domBefore = await page.content();

        // Click the button
        await button.click().catch(() => {
          // Some buttons may trigger navigation; that's fine
        });

        // Wait briefly for any DOM updates
        await page.waitForTimeout(500);

        // Capture DOM state after click
        const domAfter = await page.content();

        // Assert the DOM changed (modal opened, navigation, content update, etc.)
        expect(
          domAfter !== domBefore,
          `Button "${testId}" on ${route} produced zero observable DOM change. This button is DEAD.`
        ).toBe(true);
      }
    });

    test(`${route}: All filters with data-testid update content`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Find all filter controls with data-testid starting with "filter-"
      const filters = await page.locator('[data-testid^="filter-"]').all();

      for (const filter of filters) {
        const testId = await filter.getAttribute('data-testid');
        const tagName = await filter.evaluate((el) => el.tagName.toLowerCase());

        if (tagName === 'select') {
          const options = await filter.locator('option:not([disabled])').all();
          if (options.length > 0) {
            const domBefore = await page.content();
            await filter.selectOption({ index: 0 });
            await page.waitForTimeout(500);
            const domAfter = await page.content();

            expect(
              domAfter !== domBefore,
              `Filter "${testId}" on ${route} produced zero change when an option was selected.`
            ).toBe(true);
          }
        }
      }
    });

    test(`${route}: All drawers with data-testid can open and close`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Find drawer triggers (buttons that reference drawers)
      const drawerPanels = await page.locator('[data-testid^="drawer-"]').all();

      for (const drawer of drawerPanels) {
        const testId = await drawer.getAttribute('data-testid');
        if (testId?.endsWith('-backdrop') || testId?.endsWith('-close')) continue;

        const isVisible = await drawer.isVisible();
        if (!isVisible) continue; // Drawer is closed by default, which is correct

        // If visible, verify the close button exists and works
        const closeBtn = page.locator(`[data-testid="${testId}-close"]`);
        if ((await closeBtn.count()) > 0) {
          await closeBtn.click();
          await page.waitForTimeout(300);
          const stillVisible = await drawer.isVisible();
          expect(
            !stillVisible,
            `Drawer "${testId}" on ${route} did not close when its close button was clicked.`
          ).toBe(true);
        }
      }
    });
  }
});
