import { test, expect } from '@playwright/test';

const PLAYBOOKS = [
  "High-Density Residential Occupancy",
  "Missing Dorm / Unit #",
  "P.O. Box Residence",
  "Clerical Typo Check",
  "Intra-County Duplicates",
  "Commercial Disguises",
  "Registration Surges",
  "Phantom Precincts",
  "NCOA / Out of State"
];

test.describe('Explore Data Mapping & Playbook Sweep', () => {
  test('runs full 360 sweep and verifies all playbooks map correctly', async ({ page }) => {
    // Navigate to explore
    await page.goto('http://localhost:3001/explore', { timeout: 60000 });
    
    // Wait for the audit to finish. 
    await page.waitForSelector('text=Everything is up to date with the most current version', { timeout: 45000 }).catch(() => {});

    for (const playbook of PLAYBOOKS) {
      await test.step(`Verify Playbook: ${playbook}`, async () => {
        // Find the specific playbook card
        const playbookCard = page.locator('div').filter({ hasText: new RegExp(`^${playbook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).locator('..').locator('..').first();
        
        // Wait for it to be visible
        await playbookCard.waitFor({ state: 'visible', timeout: 10000 });
        
        // Log the anomaly status
        const statusText = await playbookCard.locator('.text-right span').first().innerText();
        console.log(`[${playbook}] Status: ${statusText}`);

        // Click Explore
        await playbookCard.locator('button:has-text("Explore Playbook")').click();

        // Check if there are records to display
        const noResults = await page.isVisible('text=No records found for this playbook');
        
        if (!noResults) {
          // Wait for the data table
          await page.waitForSelector('table', { timeout: 10000 });
          
          // Verify Target/Voter mapping header exists (ensuring UI mapping fix is applied)
          await expect(page.locator('th:has-text("Target / Voter")')).toBeVisible();
          
          // Screenshot each playbook's data mapping output
          await page.screenshot({ path: `/Users/kyle/.gemini/antigravity/brain/deddd153-81f7-4f77-a4ac-0747e3e664c9/artifacts/screenshot-${playbook.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png` });
        }

        // Return to 360 Audit view
        await page.locator('button:has-text("Back to 360º Audit")').click();
        await page.waitForSelector(`h2:has-text("Forensic Playbooks")`, { timeout: 5000 });
      });
    }
  });
});
