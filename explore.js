const { chromium } = require('playwright');
const fs = require('fs');

async function explore() {
  console.log("Launching browser with proxy...");
  
  const proxyOptions = process.env.PROXY_HOST
    ? {
        server: `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
        username: process.env.PROXY_USERNAME,
        password: process.env.PROXY_PASSWORD,
      }
    : undefined;

  const browser = await chromium.launch({
    headless: true,
    proxy: proxyOptions,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to login page...");
  await page.goto('https://theelectorlist.com/app/admin/login', { waitUntil: 'networkidle' });

  // Dump initial login page HTML to figure out selector names
  const loginHtml = await page.content();
  fs.writeFileSync(__dirname + '/login_page.html', loginHtml);
  console.log("Saved login_page.html");

  // Attempt to guess login fields based on common patterns, or wait a bit
  try {
    console.log("Filling out credentials...");
    // Try to find email input
    await page.fill('input[type="email"]', 'rorshock@protonmail.com');
    await page.fill('input[type="password"]', 'HOP2itKKC!');
    
    // Find the submit button
    await page.click('button[type="submit"]');
    
    console.log("Waiting for navigation after login...");
    await page.waitForLoadState('networkidle', { timeout: 10000 });
  } catch (e) {
    console.log("Error filling out form, selectors might be different:", e.message);
  }

  // Dump dashboard HTML
  const dashboardHtml = await page.content();
  fs.writeFileSync(__dirname + '/dashboard_page.html', dashboardHtml);
  console.log("Saved dashboard_page.html");

  await browser.close();
}

explore().catch(console.error);
