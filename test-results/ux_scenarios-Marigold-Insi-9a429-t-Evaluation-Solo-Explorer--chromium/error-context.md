# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ux_scenarios.spec.ts >> Marigold Insights E2E Scenarios (JTBD Framework) >> JTBD 1: The Trust Evaluation (Solo Explorer)
- Location: tests/e2e/ux_scenarios.spec.ts:13:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Demo Workspace')
Expected: visible
Error: strict mode violation: getByText('Demo Workspace') resolved to 2 elements:
    1) <div class="text-[10px] font-mono uppercase tracking-wider text-[#D96B27] font-extrabold leading-none">Demo Workspace</div> aka getByRole('button', { name: '🌲 Demo Workspace State of' })
    2) <div class="inline-block bg-[#D96B27]/10 text-[#D96B27] font-black text-[10px] px-2.5 py-1 rounded-sm uppercase tracking-widest mb-1 border border-[#D96B27]/20">Demo Workspace</div> aka getByRole('main').getByText('Demo Workspace')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Demo Workspace')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - generic [ref=e6]:
          - img [ref=e7]
          - generic [ref=e51]: Marigold Insights
        - button "Collapse Sidebar" [ref=e52] [cursor=pointer]:
          - img [ref=e53]
      - button "🌲 Demo Workspace State of Roosevelt (Demo) ▼" [ref=e56] [cursor=pointer]:
        - generic [ref=e57]:
          - generic [ref=e58]: 🌲
          - generic [ref=e59]:
            - generic [ref=e60]: Demo Workspace
            - generic [ref=e61]: State of Roosevelt (Demo)
        - generic [ref=e62]: ▼
      - navigation [ref=e63]:
        - generic [ref=e64]: Workspace Modules
        - link "Dashboard" [ref=e65] [cursor=pointer]:
          - /url: /dashboard
          - generic [ref=e67]:
            - img [ref=e68]
            - generic [ref=e73]: Dashboard
        - link "Explore & Review" [ref=e75] [cursor=pointer]:
          - /url: /explore
          - generic [ref=e77]:
            - img [ref=e78]
            - generic [ref=e83]: Explore & Review
        - link "Guided Playbooks" [ref=e84] [cursor=pointer]:
          - /url: /audit
          - generic [ref=e86]:
            - img [ref=e87]
            - generic [ref=e89]: Guided Playbooks
        - link "Advanced Stats" [ref=e90] [cursor=pointer]:
          - /url: /advanced-stats
          - generic [ref=e92]:
            - img [ref=e93]
            - generic [ref=e96]: Advanced Stats
        - link "Volunteer Team" [ref=e97] [cursor=pointer]:
          - /url: /settings/group
          - generic [ref=e99]:
            - img [ref=e100]
            - generic [ref=e105]: Volunteer Team
      - generic [ref=e106]:
        - link "Back to Marketing Site" [ref=e107] [cursor=pointer]:
          - /url: /
          - img [ref=e108]
          - generic [ref=e110]: Back to Marketing Site
        - generic [ref=e112]: Active Account
    - main [ref=e114]:
      - generic [ref=e115]:
        - generic [ref=e116]:
          - generic [ref=e117]:
            - generic [ref=e119]: Demo Workspace
            - heading "Workspace Dashboard" [level=1] [ref=e120]
            - generic [ref=e121]: State of Roosevelt (Demo) • 1,842 Active Records
          - generic [ref=e123]:
            - button "Filter Board" [ref=e125] [cursor=pointer]:
              - img [ref=e126]
              - text: Filter Board
            - link "Run 360° Audit" [ref=e128] [cursor=pointer]:
              - /url: /comprehensive-audit
        - generic [ref=e129]:
          - button "Mission Kanban" [ref=e130] [cursor=pointer]:
            - img [ref=e131]
            - text: Mission Kanban
          - button "Data Overview" [ref=e136] [cursor=pointer]:
            - img [ref=e137]
            - text: Data Overview
          - button "Group Activity" [ref=e141] [cursor=pointer]:
            - img [ref=e142]
            - text: Group Activity
        - generic [ref=e144]:
          - generic [ref=e145]:
            - generic [ref=e146]:
              - generic [ref=e147]:
                - heading "Needs Triage" [level=3] [ref=e148]
                - generic [ref=e149]: "1"
              - button "High Density 100 Campus Dr 64 registered voters at this single domicile. 2h ago" [ref=e152]:
                - generic [ref=e153]:
                  - generic [ref=e154]: High Density
                  - img [ref=e155]
                - heading "100 Campus Dr" [level=4] [ref=e157]
                - paragraph [ref=e158]: 64 registered voters at this single domicile.
                - generic [ref=e160]:
                  - img [ref=e161]
                  - text: 2h ago
            - generic [ref=e164]:
              - generic [ref=e165]:
                - heading "In Review" [level=3] [ref=e166]
                - generic [ref=e167]: "1"
              - button "NCOA Move K Justin Murphy Flagged for out of state relocation to CA. 1 Note" [ref=e170]:
                - generic [ref=e171]:
                  - generic [ref=e172]: NCOA Move
                  - generic [ref=e173]: K
                - heading "Justin Murphy" [level=4] [ref=e174]
                - paragraph [ref=e175]: Flagged for out of state relocation to CA.
                - generic [ref=e177]:
                  - img [ref=e178]
                  - text: 1 Note
            - generic [ref=e181]:
              - generic [ref=e182]:
                - heading "Ready to Submit" [level=3] [ref=e183]
                - generic [ref=e184]: "0"
              - generic [ref=e187]: Empty
            - generic [ref=e188]:
              - generic [ref=e189]:
                - heading "Resolved" [level=3] [ref=e190]
                - generic [ref=e191]: "1"
              - button "False Positive Andrew Young Confirmed military deployment via DoD list. Resolved" [ref=e194]:
                - generic [ref=e195]:
                  - generic [ref=e196]: False Positive
                  - img [ref=e197]
                - heading "Andrew Young" [level=4] [ref=e200]
                - paragraph [ref=e201]: Confirmed military deployment via DoD list.
                - generic [ref=e203]:
                  - img [ref=e204]
                  - text: Resolved
          - status [ref=e207]
    - button "Ask Mari AI" [ref=e208] [cursor=pointer]:
      - img [ref=e209]
      - generic [ref=e253]: Ask Mari AI
  - button "Testing Rails" [ref=e255] [cursor=pointer]:
    - img [ref=e256]
    - generic [ref=e265]: Testing Rails
  - button "Open Next.js Dev Tools" [ref=e271] [cursor=pointer]:
    - img [ref=e272]
  - alert [ref=e275]
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
> 20 |     await expect(page.getByText('Demo Workspace')).toBeVisible();
     |                                                    ^ Error: expect(locator).toBeVisible() failed
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
  50 |     await expect(page.getByRole('heading', { name: 'Record Insights' })).toBeVisible();
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