const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:3001/?slug=cobalt-the-restaurant', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const pin = await page.$('input[type="password"]');
  await pin.fill('1234');
  await (await page.$('button')).click();
  await page.waitForTimeout(4000);

  // Check business/globe tab
  const globeBtn = await page.$('button:has-text("🌐")');
  console.log('Globe btn found:', !!globeBtn);

  // Click globe
  if (globeBtn) {
    await globeBtn.click();
    await page.waitForTimeout(600);
    const body = await page.textContent('body');
    console.log('After globe click - Phone in body:', body.includes('Phone'));
    console.log('After globe click - Theme in body:', body.includes('Theme') || body.includes('color'));
    // Show relevant chunk
    const idx = body.toLowerCase().indexOf('theme');
    if (idx >= 0) console.log('Theme context:', body.slice(Math.max(0,idx-50), idx+200));
  }

  // Check rotating tab
  const rotBtn = await page.$('button:has-text("⭐")');
  console.log('Rotating (star) btn found:', !!rotBtn);
  if (rotBtn) {
    await rotBtn.click();
    await page.waitForTimeout(600);
    const body2 = await page.textContent('body');
    console.log('After star click - Beer on Tap:', body2.includes('Beer on Tap'));
    console.log('After star click - Rotating:', body2.toLowerCase().includes('rotating'));
    const idx2 = body2.toLowerCase().indexOf('beer');
    if (idx2 >= 0) console.log('Beer context:', body2.slice(Math.max(0,idx2-30), idx2+150));
  }

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
