# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e-mapping.spec.ts >> Explore Data Mapping & Playbook Sweep >> runs full 360 sweep and verifies all playbooks map correctly
- Location: tests/e2e/e2e-mapping.spec.ts:16:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3001/explore", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const PLAYBOOKS = [
  4  |   "High-Density Residential Occupancy",
  5  |   "Missing Dorm / Unit #",
  6  |   "P.O. Box Residence",
  7  |   "Clerical Typo Check",
  8  |   "Intra-County Duplicates",
  9  |   "Commercial Disguises",
  10 |   "Registration Surges",
  11 |   "Phantom Precincts",
  12 |   "NCOA / Out of State"
  13 | ];
  14 | 
  15 | test.describe('Explore Data Mapping & Playbook Sweep', () => {
  16 |   test('runs full 360 sweep and verifies all playbooks map correctly', async ({ page }) => {
  17 |     // Navigate to explore
> 18 |     await page.goto('http://localhost:3001/explore', { timeout: 60000 });
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  19 |     
  20 |     // Wait for the audit to finish. 
  21 |     await page.waitForSelector('text=Everything is up to date with the most current version', { timeout: 45000 }).catch(() => {});
  22 | 
  23 |     for (const playbook of PLAYBOOKS) {
  24 |       await test.step(`Verify Playbook: ${playbook}`, async () => {
  25 |         // Find the specific playbook card
  26 |         const playbookCard = page.locator('div').filter({ hasText: new RegExp(`^${playbook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).locator('..').locator('..').first();
  27 |         
  28 |         // Wait for it to be visible
  29 |         await playbookCard.waitFor({ state: 'visible', timeout: 10000 });
  30 |         
  31 |         // Log the anomaly status
  32 |         const statusText = await playbookCard.locator('.text-right span').first().innerText();
  33 |         console.log(`[${playbook}] Status: ${statusText}`);
  34 | 
  35 |         // Click Explore
  36 |         await playbookCard.locator('button:has-text("Explore Playbook")').click();
  37 | 
  38 |         // Check if there are records to display
  39 |         const noResults = await page.isVisible('text=No records found for this playbook');
  40 |         
  41 |         if (!noResults) {
  42 |           // Wait for the data table
  43 |           await page.waitForSelector('table', { timeout: 10000 });
  44 |           
  45 |           // Verify Target/Voter mapping header exists (ensuring UI mapping fix is applied)
  46 |           await expect(page.locator('th:has-text("Target / Voter")')).toBeVisible();
  47 |           
  48 |           // Screenshot each playbook's data mapping output
  49 |           await page.screenshot({ path: `/Users/kyle/.gemini/antigravity/brain/deddd153-81f7-4f77-a4ac-0747e3e664c9/artifacts/screenshot-${playbook.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png` });
  50 |         }
  51 | 
  52 |         // Return to 360 Audit view
  53 |         await page.locator('button:has-text("Back to 360º Audit")').click();
  54 |         await page.waitForSelector(`h2:has-text("Forensic Playbooks")`, { timeout: 5000 });
  55 |       });
  56 |     }
  57 |   });
  58 | });
  59 | 
```