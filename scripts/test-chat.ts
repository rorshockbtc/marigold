import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to /insights...");
  
  // Set localStorage before navigating so the app thinks we are connected to a DEMO file
  await page.addInitScript(() => {
    localStorage.setItem("marigold_file_name", "DEMO_roosevelt_2026.csv");
    localStorage.setItem("marigold_file_connected", "true");
    localStorage.setItem("marigold_active_group", "DEMO Workspace");
  });

  await page.goto('http://127.0.0.1:3001/insights', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/Users/kyle/.gemini/antigravity/brain/deddd153-81f7-4f77-a4ac-0747e3e664c9/artifacts/01-insights-landing.png' });

  console.log("Typing in chat...");
  // Find textarea and type
  const textarea = page.locator('textarea').first();
  await textarea.fill('Show me an anomaly data story about high density residents');
  
  console.log("Submitting chat...");
  const sendButton = page.locator('button[type="submit"]');
  await sendButton.click();

  // Wait for loading to finish (e.g., button is not disabled or specific element appears)
  console.log("Waiting for response...");
  await page.waitForTimeout(10000);
  
  await page.screenshot({ path: '/Users/kyle/.gemini/antigravity/brain/deddd153-81f7-4f77-a4ac-0747e3e664c9/artifacts/02-chat-response.png' });

  await browser.close();
  console.log("Done.");
})();
