# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux_scenarios.spec.ts >> Marigold Insights E2E Scenarios (JTBD Framework) >> JTBD 3: The Micro Investigation (Triage)
- Location: tests/e2e/ux_scenarios.spec.ts:36:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Record Insights' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Record Insights' })

```

```yaml
- complementary:
  - img
  - text: Marigold Insights
  - button "Collapse Sidebar"
  - button "🌲 Demo Workspace State of Roosevelt (Demo) ▼"
  - navigation:
    - text: Workspace Modules
    - link "Dashboard":
      - /url: /dashboard
    - link "Explore & Review":
      - /url: /explore
    - link "Guided Playbooks":
      - /url: /audit
    - link "Advanced Stats":
      - /url: /advanced-stats
    - link "Volunteer Team":
      - /url: /settings/group
  - link "Back to Marketing Site":
    - /url: /
  - text: Active Account
- main:
  - text: Demo Workspace
  - heading "Workspace Dashboard" [level=1]
  - text: State of Roosevelt (Demo) • 1,842 Active Records
  - button "Filter Board"
  - link "Run 360° Audit":
    - /url: /comprehensive-audit
  - button "Mission Kanban"
  - button "Data Overview"
  - button "Group Activity"
  - heading "Needs Triage" [level=3]
  - text: "1"
  - button "High Density 100 Campus Dr 64 registered voters at this single domicile. 2h ago":
    - text: High Density
    - heading "100 Campus Dr" [level=4]
    - paragraph: 64 registered voters at this single domicile.
    - text: 2h ago
  - heading "In Review" [level=3]
  - text: "1"
  - button "NCOA Move K Justin Murphy Flagged for out of state relocation to CA. 1 Note":
    - text: NCOA Move K
    - heading "Justin Murphy" [level=4]
    - paragraph: Flagged for out of state relocation to CA.
    - text: 1 Note
  - heading "Ready to Submit" [level=3]
  - text: 0 Empty
  - heading "Resolved" [level=3]
  - text: "1"
  - button "False Positive Andrew Young Confirmed military deployment via DoD list. Resolved":
    - text: False Positive
    - heading "Andrew Young" [level=4]
    - paragraph: Confirmed military deployment via DoD list.
    - text: Resolved
  - status: Draggable item card-1 was dropped over droppable area Needs Triage
- button "Ask Mari AI":
  - img
  - text: Ask Mari AI
- button "Testing Rails"
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Marigold Insights E2E Scenarios (JTBD Framework)', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Setup synthetic local state for testing
  6  |     await page.addInitScript(() => {
  7  |       window.localStorage.setItem('marigold_active_group', 'State of Roosevelt (Demo)');
  8  |       window.localStorage.setItem('marigold_file_connected', 'true');
  9  |       window.localStorage.setItem('marigold_file_rows', '1842');
  10 |     });
  11 |   });
  12 | 
  13 |   test('JTBD 1: The Trust Evaluation (Solo Explorer)', async ({ page }) => {
  14 |     await page.goto('/dashboard');
  15 |     
  16 |     // Assert Dashboard loads (since we injected connected state)
  17 |     await expect(page.locator('h1').filter({ hasText: 'Workspace Dashboard' })).toBeVisible();
  18 |     
  19 |     // Assert Demo Workspace badge is visible
  20 |     await expect(page.getByText('Demo Workspace')).toBeVisible();
  21 |     
  22 |     // Assert 1,842 Active Records count is displayed
  23 |     await expect(page.getByText('1,842 Active Records')).toBeVisible();
  24 |   });
  25 | 
  26 |   test('JTBD 2: Group Orientation', async ({ page }) => {
  27 |     await page.goto('/dashboard');
  28 |     
  29 |     // Click Group Activity Tab
  30 |     await page.getByRole('button', { name: /Group Activity/i }).click();
  31 |     
  32 |     // Assert feed placeholder (or future feed)
  33 |     await expect(page.getByText(/Group Chat & Activity Feed/i)).toBeVisible();
  34 |   });
  35 | 
  36 |   test('JTBD 3: The Micro Investigation (Triage)', async ({ page }) => {
  37 |     await page.goto('/dashboard');
  38 |     
  39 |     // Click Kanban Tab
  40 |     await page.getByRole('button', { name: /Mission Kanban/i }).click();
  41 |     
  42 |     // Verify columns exist
  43 |     await expect(page.getByText('Needs Triage')).toBeVisible();
  44 |     await expect(page.getByText('In Review')).toBeVisible();
  45 |     
  46 |     // Click a Kanban Card to open SideSheet
  47 |     await page.getByText('100 Campus Dr').click();
  48 |     
  49 |     // Verify SideSheet opens (not Mari)
> 50 |     await expect(page.getByRole('heading', { name: 'Record Insights' })).toBeVisible();
     |                                                                          ^ Error: expect(locator).toBeVisible() failed
  51 |     await expect(page.getByText('Save Notes')).toBeVisible();
  52 |   });
  53 | 
  54 |   test('JTBD 4: The Macro Investigation (Advanced Stats)', async ({ page }) => {
  55 |     await page.goto('/advanced-stats');
  56 |     
  57 |     // Verify the UI is framed properly
  58 |     await expect(page.getByRole('heading', { name: 'Playbook Builder / Linkage Lab' })).toBeVisible();
  59 |     
  60 |     // Check for the "I\'m just having fun" handle
  61 |     await expect(page.getByRole('button', { name: /I\'m just having fun!/i })).toBeVisible();
  62 |   });
  63 | 
  64 |   test('JTBD 5: The Final Output (Reporting/Export)', async ({ page }) => {
  65 |     await page.goto('/explore');
  66 |     
  67 |     // Verify export button exists
  68 |     const exportBtn = page.getByRole('button', { name: /Generate Report/i });
  69 |     await expect(exportBtn).toBeVisible();
  70 |   });
  71 | });
  72 | 
```