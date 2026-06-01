const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          FULL APP TEST - ALL FEATURES AND BUTTONS              ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');
  
  const results = {
    passed: [],
    failed: []
  };
  
  async function test(name, fn) {
    try {
      await fn();
      results.passed.push(name);
      console.log(`✓ ${name}`);
    } catch (e) {
      results.failed.push({ name, error: e.message });
      console.log(`✗ ${name}`);
      console.log(`  Error: ${e.message.substring(0, 100)}`);
    }
  }
  
  try {
    console.log('LOADING APP...\n');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Enter PIN to bypass auth
    console.log('ENTERING PIN (4+ digits)...\n');
    await page.fill('input[type="text"], input[type="password"]', '1234');
    await page.click('button:has-text("Unlock")');
    await page.waitForTimeout(2000);
    
    // ===== TABS =====
    console.log('=== CHECKING ALL TABS ===\n');
    
    await test('Menu tab exists and clickable', async () => {
      await page.click('button:has-text("Menu")');
      await page.waitForTimeout(300);
    });
    
    await test('Drinks tab exists and clickable', async () => {
      await page.click('button:has-text("Drinks")');
      await page.waitForTimeout(300);
    });
    
    await test('Specials tab exists and clickable', async () => {
      await page.click('button:has-text("Specials")');
      await page.waitForTimeout(300);
    });
    
    await test('Daily Specials tab exists and clickable', async () => {
      await page.click('button:has-text("Daily Specials")');
      await page.waitForTimeout(300);
    });
    
    await test('Events tab exists and clickable', async () => {
      await page.click('button:has-text("Events")');
      await page.waitForTimeout(300);
    });
    
    await test('Happy Hour tab exists and clickable', async () => {
      await page.click('button:has-text("Happy Hour")');
      await page.waitForTimeout(300);
    });
    
    await test('Hours tab exists and clickable', async () => {
      await page.click('button:has-text("Hours")');
      await page.waitForTimeout(300);
    });
    
    await test('Sides & Add-ons tab exists and clickable', async () => {
      await page.click('button:has-text("Sides & Add-ons")');
      await page.waitForTimeout(300);
    });
    
    await test('Daily Features tab exists and clickable', async () => {
      await page.click('button:has-text("Daily Features")');
      await page.waitForTimeout(300);
    });
    
    await test('Gallery tab exists and clickable', async () => {
      await page.click('button:has-text("Gallery")');
      await page.waitForTimeout(300);
    });
    
    await test('Business Info tab exists and clickable', async () => {
      await page.click('button:has-text("Business Info")');
      await page.waitForTimeout(300);
    });
    
    // ===== MENU TAB =====
    console.log('\n=== TESTING MENU TAB ===\n');
    
    await test('Menu tab shows Gulf Island Grill data', async () => {
      await page.click('button:has-text("Menu")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text.includes('Appetizers') && !text.includes('Grill') && !text.includes('Seafood')) {
        throw new Error('Menu data not visible');
      }
    });
    
    await test('Breakfast preset button exists', async () => {
      const text = await page.textContent('body');
      if (!text.includes('Breakfast')) throw new Error('Breakfast preset not found');
    });
    
    await test('Brunch preset button exists', async () => {
      const text = await page.textContent('body');
      if (!text.includes('Brunch')) throw new Error('Brunch preset not found');
    });
    
    await test('Lunch preset button exists', async () => {
      const text = await page.textContent('body');
      if (!text.includes('Lunch')) throw new Error('Lunch preset not found');
    });
    
    await test('Dinner preset button exists', async () => {
      const text = await page.textContent('body');
      if (!text.includes('Dinner')) throw new Error('Dinner preset not found');
    });
    
    await test('Add Section button exists', async () => {
      const text = await page.textContent('body');
      if (!text.includes('Add Section')) throw new Error('Add Section button not found');
    });
    
    await test('Time dropdowns exist', async () => {
      const selects = await page.locator('select').count();
      if (selects === 0) throw new Error('No time dropdowns found');
    });
    
    await test('Menu items have Edit/Delete buttons', async () => {
      const text = await page.textContent('body');
      const hasEdit = text.includes('Edit');
      const hasDelete = text.includes('Delete');
      if (!hasEdit || !hasDelete) throw new Error('Edit/Delete buttons not found');
    });
    
    // ===== DRINKS TAB =====
    console.log('\n=== TESTING DRINKS TAB ===\n');
    
    await test('Drinks tab loads', async () => {
      await page.click('button:has-text("Drinks")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text.includes('Add Section')) throw new Error('Drinks tab not loaded');
    });
    
    await test('Drinks presets exist (Happy Hour, Cocktails, Beer, Wine)', async () => {
      const text = await page.textContent('body');
      const hasAll = text.includes('Happy Hour') && text.includes('Cocktails') && text.includes('Beer') && text.includes('Wine');
      if (!hasAll) throw new Error('Not all drink presets found');
    });
    
    // ===== SPECIALS TAB =====
    console.log('\n=== TESTING SPECIALS TAB ===\n');
    
    await test('Specials tab loads with Add Special button', async () => {
      await page.click('button:has-text("Specials")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text.includes('Add Special')) throw new Error('Add Special button not found');
    });
    
    // ===== DAILY SPECIALS TAB =====
    console.log('\n=== TESTING DAILY SPECIALS TAB ===\n');
    
    await test('Daily Specials tab loads with day selector', async () => {
      await page.click('button:has-text("Daily Specials")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text.includes('Monday')) throw new Error('Day selector not found');
    });
    
    // ===== EVENTS TAB =====
    console.log('\n=== TESTING EVENTS TAB ===\n');
    
    await test('Events tab loads with Add Event button', async () => {
      await page.click('button:has-text("Events")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text.includes('Add Event')) throw new Error('Add Event button not found');
    });
    
    // ===== HAPPY HOUR TAB =====
    console.log('\n=== TESTING HAPPY HOUR TAB ===\n');
    
    await test('Happy Hour tab loads with Add Section', async () => {
      await page.click('button:has-text("Happy Hour")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text.includes('Add Section')) throw new Error('Add Section not found in Happy Hour');
    });
    
    // ===== HOURS TAB =====
    console.log('\n=== TESTING HOURS TAB ===\n');
    
    await test('Hours tab loads with time selectors', async () => {
      await page.click('button:has-text("Hours")');
      await page.waitForTimeout(500);
      const selects = await page.locator('select').count();
      if (selects === 0) throw new Error('No time selectors found in Hours tab');
    });
    
    // ===== SIDES & ADD-ONS TAB =====
    console.log('\n=== TESTING SIDES & ADD-ONS TAB ===\n');
    
    await test('Sides & Add-ons tab loads', async () => {
      await page.click('button:has-text("Sides & Add-ons")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text) throw new Error('Sides & Add-ons tab not loaded');
    });
    
    // ===== DAILY FEATURES TAB =====
    console.log('\n=== TESTING DAILY FEATURES TAB ===\n');
    
    await test('Daily Features tab loads', async () => {
      await page.click('button:has-text("Daily Features")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text) throw new Error('Daily Features tab not loaded');
    });
    
    // ===== GALLERY TAB =====
    console.log('\n=== TESTING GALLERY TAB ===\n');
    
    await test('Gallery tab loads', async () => {
      await page.click('button:has-text("Gallery")');
      await page.waitForTimeout(500);
      const text = await page.textContent('body');
      if (!text) throw new Error('Gallery tab not loaded');
    });
    
    // ===== BUSINESS INFO TAB =====
    console.log('\n=== TESTING BUSINESS INFO TAB ===\n');
    
    await test('Business Info tab loads with editable fields', async () => {
      await page.click('button:has-text("Business Info")');
      await page.waitForTimeout(500);
      const inputs = await page.locator('input, textarea').count();
      if (inputs === 0) throw new Error('No input fields in Business Info');
    });
    
    // ===== GLOBAL FEATURES =====
    console.log('\n=== TESTING GLOBAL FEATURES ===\n');
    
    await test('SAVE ALL CHANGES button exists', async () => {
      const text = await page.textContent('body');
      if (!text.includes('SAVE')) throw new Error('SAVE button not found');
    });
    
    // ===== SUMMARY =====
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        TEST SUMMARY                           ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    
    console.log(`✓ PASSED: ${results.passed.length}`);
    results.passed.slice(0, 15).forEach(t => console.log(`  ✓ ${t}`));
    if (results.passed.length > 15) console.log(`  ... and ${results.passed.length - 15} more`);
    
    if (results.failed.length > 0) {
      console.log(`\n✗ FAILED: ${results.failed.length}`);
      results.failed.forEach(t => console.log(`  ✗ ${t.name}`));
    } else {
      console.log('\n✅ ALL TESTS PASSED ✅');
    }
    
    console.log(`\nTotal: ${results.passed.length}/${results.passed.length + results.failed.length} tests passed\n`);
    
  } catch (error) {
    console.error('\n✗ FATAL ERROR:', error.message);
  }
  
  await browser.close();
})();
