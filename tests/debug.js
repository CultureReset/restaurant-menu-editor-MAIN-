const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', m => console.log('CONSOLE:', m.text()));
  page.on('pageerror', e => console.log('PAGE ERROR:', e.message));

  await page.goto('http://localhost:3000/?slug=cobalt-the-restaurant', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const title = await page.title();
  const body = (await page.textContent('body') || '').slice(0, 800);
  const inputs = await page.evaluate(() =>
    Array.from(document.querySelectorAll('input')).map(e => ({ type: e.type, placeholder: e.placeholder, id: e.id }))
  );
  const buttons = await page.evaluate(() =>
    Array.from(document.querySelectorAll('button')).slice(0, 10).map(e => e.textContent.trim().slice(0, 40))
  );

  console.log('Title:', title);
  console.log('Body preview:', body);
  console.log('Inputs:', JSON.stringify(inputs, null, 2));
  console.log('Buttons:', JSON.stringify(buttons, null, 2));

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
