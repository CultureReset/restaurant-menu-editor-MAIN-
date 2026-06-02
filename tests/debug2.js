const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001/?slug=cobalt-the-restaurant', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);

  // Enter PIN
  const pin = await page.$('input[type="password"]');
  await pin.fill('1234');
  await (await page.$('button')).click();
  await page.waitForTimeout(4000);

  const buttons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.length > 0 && t.length < 50)
  );
  console.log('All buttons after auth:', JSON.stringify(buttons, null, 2));

  const colorCount = await page.evaluate(() => document.querySelectorAll('input[type="color"]').length);
  console.log('Color inputs visible:', colorCount);

  const body = await page.textContent('body');
  console.log('Body has French Fries:', body.includes('French Fries'));
  console.log('Body has Sides:', body.toLowerCase().includes('sides'));
  console.log('Body has Coleslaw:', body.includes('Coleslaw'));

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
