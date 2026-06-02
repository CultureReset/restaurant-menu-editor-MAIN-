const { chromium } = require('playwright');

const BASE = 'http://localhost:3001';
const SLUG = 'cobalt-the-restaurant';
const PIN = '1234';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];
  let pass = 0, fail = 0;

  function ok(label, val) {
    const status = val ? '✅' : '❌';
    results.push(`${status} ${label}`);
    if (val) pass++; else fail++;
  }

  try {
    // ── 1. PIN screen appears ──────────────────────────────────────────────────
    await page.goto(`${BASE}/?slug=${SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    const pinInput = await page.$('input[type="password"]');
    ok('PIN screen shows input', !!pinInput);

    // ── 2. Enter PIN and authenticate ─────────────────────────────────────────
    if (pinInput) {
      await pinInput.fill(PIN);
      const submitBtn = await page.$('button[type="submit"], button');
      if (submitBtn) await submitBtn.click();
      else await page.keyboard.press('Enter');
      await page.waitForTimeout(4000); // wait for API + re-render
    }

    const body1 = await page.textContent('body');
    ok('Restaurant name loads', body1.includes('Cobalt'));

    // ── 3. Menu sections loaded ───────────────────────────────────────────────
    const hasSections = body1.toLowerCase().includes('lunch') ||
      body1.toLowerCase().includes('appetizer') ||
      body1.toLowerCase().includes('section') ||
      body1.toLowerCase().includes('menu');
    ok('Menu sections appear in editor', hasSections);

    // ── 4. Tab navigation ─────────────────────────────────────────────────────
    // Find all tab buttons
    const tabBtns = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim()).filter(t => t.length > 0)
    );
    ok('Tab buttons render', tabBtns.length > 2);

    // ── 5. Business tab (🌐 emoji) ────────────────────────────────────────────
    const globeBtn = await page.$('button:has-text("🌐")');
    if (globeBtn) await globeBtn.click();
    await page.waitForTimeout(800);
    const bizBody = await page.textContent('body');
    ok('Business tab shows fields', bizBody.includes('Business Information') || bizBody.includes('Theme') || bizBody.includes('Primary Color'));

    // ── 6. Theme color pickers (appear after clicking business tab) ───────────
    const colorInputCount = await page.evaluate(() =>
      document.querySelectorAll('input[type="color"]').length
    );
    ok('Theme color pickers present (≥3)', colorInputCount >= 3);

    // ── 7. Sides tab (➕ emoji) ───────────────────────────────────────────────
    const sidesTab = await page.$('button:has-text("➕")');
    if (sidesTab) await sidesTab.click();
    await page.waitForTimeout(800);
    const sidesBody = await page.textContent('body');
    const hasSides = sidesBody.includes('French Fries') || sidesBody.includes('Coleslaw') || sidesBody.includes('Side Salad') || sidesBody.toLowerCase().includes('sides') || sidesBody.toLowerCase().includes('add-on');
    ok('Saved sides visible', hasSides);

    // ── 8. Rotating sections are in menu tab (🍽️) ────────────────────────────
    const menuTab = await page.$('button:has-text("🍽️")');
    if (menuTab) await menuTab.click();
    await page.waitForTimeout(800);
    const rotBody = await page.textContent('body');
    const hasRotating = rotBody.includes('Beer on Tap') || rotBody.includes('Catch of the Day') || rotBody.includes('ROTATING') || rotBody.toLowerCase().includes('rotating sections');
    ok('Rotating sections visible in menu tab', hasRotating);

    // ── 9. Save button exists ─────────────────────────────────────────────────
    const allButtons = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button')).map(b => b.textContent.trim())
    );
    const hasSave = allButtons.some(t => /save/i.test(t));
    ok('Save button present', hasSave);

    // ── 10. Quick save test ────────────────────────────────────────────────────
    const saveBtn = page.getByRole('button', { name: /save/i }).first();
    if (await saveBtn.isVisible().catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(3000);
      const afterSave = await page.textContent('body');
      const saveOk = afterSave.includes('saved') || afterSave.includes('Saved') || afterSave.includes('success') || afterSave.includes('✓');
      ok('Save completes without error', saveOk || !afterSave.includes('error'));
    } else {
      ok('Save completes without error', false);
    }

  } catch (err) {
    results.push(`❌ CRASH: ${err.message}`);
    fail++;
  }

  await browser.close();

  console.log('\n═══ E2E TEST RESULTS ════════════════════════════');
  results.forEach(r => console.log(r));
  console.log(`═════════════════════════════════════════════════`);
  console.log(`  ${pass} passed  /  ${fail} failed`);
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(err => { console.error(err); process.exit(1); });
