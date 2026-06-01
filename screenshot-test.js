const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Loading page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
    console.log('Page loaded. Waiting for content...');
    await page.waitForTimeout(3000);
    
    // Get all text on page
    const text = await page.textContent('body');
    console.log('\n=== PAGE CONTENT ===\n');
    console.log(text.substring(0, 1000));
    console.log('\n...\n');
    
    // Get all buttons
    const buttons = await page.locator('button').allTextContents();
    console.log('\n=== ALL BUTTONS ===\n');
    buttons.forEach(btn => console.log(`- ${btn}`));
    
    // Take screenshot
    await page.screenshot({ path: '/Users/owner/screenshot.png' });
    console.log('\n✓ Screenshot saved to /Users/owner/screenshot.png\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  await browser.close();
})();
