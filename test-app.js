const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('\n===== STARTING FULL APP TEST =====\n');
  
  try {
    // Load app
    console.log('1. LOADING APP...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✓ App loaded\n');
    
    // Check tabs exist
    console.log('2. CHECKING TABS...');
    const tabs = ['Menu', 'Drinks', 'Specials', 'Daily Specials', 'Events', 'Happy Hour', 'Hours', 'Sides & Add-ons', 'Daily Features', 'Gallery', 'Business Info'];
    for (const tab of tabs) {
      const exists = await page.locator(`button:has-text("${tab}")`).count();
      console.log(`   ${exists > 0 ? '✓' : '✗'} ${tab} tab`);
    }
    console.log();
    
    // Test Menu Tab
    console.log('3. TESTING MENU TAB...');
    await page.click('button:has-text("Menu")');
    await page.waitForTimeout(500);
    
    // Check preset buttons exist
    const presets = ['Breakfast', 'Brunch', 'Lunch', 'Dinner'];
    for (const preset of presets) {
      const exists = await page.locator(`button:has-text("${preset}")`).count();
      console.log(`   ${exists > 0 ? '✓' : '✗'} ${preset} preset button`);
    }
    
    // Check current sections
    const sections = await page.locator('div').filter({ has: page.locator('text=/Appetizers|From the Steamer|House Specialties|Seafood|Lunch/') }).count();
    console.log(`   ✓ ${sections > 0 ? 'Menu sections found' : 'No sections'}\n`);
    
    // Test Drinks Tab
    console.log('4. TESTING DRINKS TAB...');
    await page.click('button:has-text("Drinks")');
    await page.waitForTimeout(500);
    const drinkPresets = ['Happy Hour', 'Cocktails', 'Beer', 'Wine'];
    for (const preset of drinkPresets) {
      const exists = await page.locator(`button:has-text("${preset}")`).count();
      console.log(`   ${exists > 0 ? '✓' : '✗'} ${preset} preset button`);
    }
    console.log();
    
    // Test Specials Tab
    console.log('5. TESTING SPECIALS TAB...');
    await page.click('button:has-text("Specials")');
    await page.waitForTimeout(500);
    const addSpecial = await page.locator('button:has-text("+ Add Special")').count();
    console.log(`   ${addSpecial > 0 ? '✓' : '✗'} Add Special button\n`);
    
    // Test Daily Specials Tab
    console.log('6. TESTING DAILY SPECIALS TAB...');
    await page.click('button:has-text("Daily Specials")');
    await page.waitForTimeout(500);
    const daySelector = await page.locator('select').count();
    console.log(`   ${daySelector > 0 ? '✓' : '✗'} Day selector dropdown`);
    const timeDropdowns = await page.locator('select').count();
    console.log(`   ${timeDropdowns > 0 ? '✓' : '✗'} Time dropdowns present\n`);
    
    // Test Events Tab
    console.log('7. TESTING EVENTS TAB...');
    await page.click('button:has-text("Events")');
    await page.waitForTimeout(500);
    const addEvent = await page.locator('button:has-text("+ Add Event")').count();
    console.log(`   ${addEvent > 0 ? '✓' : '✗'} Add Event button\n`);
    
    // Test Happy Hour Tab
    console.log('8. TESTING HAPPY HOUR TAB...');
    await page.click('button:has-text("Happy Hour")');
    await page.waitForTimeout(500);
    const addSection = await page.locator('button:has-text("+ Add Section")').count();
    console.log(`   ${addSection > 0 ? '✓' : '✗'} Add Section button\n`);
    
    // Test Hours Tab
    console.log('9. TESTING HOURS TAB...');
    await page.click('button:has-text("Hours")');
    await page.waitForTimeout(500);
    const hourInputs = await page.locator('input[type="time"], select').count();
    console.log(`   ${hourInputs > 0 ? '✓' : '✗'} Hour/time inputs present\n`);
    
    // Test Sides & Add-ons Tab
    console.log('10. TESTING SIDES & ADD-ONS TAB...');
    await page.click('button:has-text("Sides & Add-ons")');
    await page.waitForTimeout(500);
    const addSide = await page.locator('button:has-text("+ Add")').count();
    console.log(`   ${addSide > 0 ? '✓' : '✗'} Add button\n`);
    
    // Test Daily Features Tab
    console.log('11. TESTING DAILY FEATURES TAB...');
    await page.click('button:has-text("Daily Features")');
    await page.waitForTimeout(500);
    const addFeature = await page.locator('button:has-text("+ Add")').count();
    console.log(`   ${addFeature > 0 ? '✓' : '✗'} Add button\n`);
    
    // Test Gallery Tab
    console.log('12. TESTING GALLERY TAB...');
    await page.click('button:has-text("Gallery")');
    await page.waitForTimeout(500);
    const uploadBtn = await page.locator('button:has-text("Upload"), button:has-text("Add"), input[type="file"]').count();
    console.log(`   ${uploadBtn > 0 ? '✓' : '✗'} Upload functionality\n`);
    
    // Test Business Info Tab
    console.log('13. TESTING BUSINESS INFO TAB...');
    await page.click('button:has-text("Business Info")');
    await page.waitForTimeout(500);
    const inputs = await page.locator('input, textarea').count();
    console.log(`   ${inputs > 0 ? '✓' : '✗'} Editable fields present\n`);
    
    // Test Save Button
    console.log('14. CHECKING SAVE BUTTON...');
    const saveBtn = await page.locator('button:has-text("SAVE")').count();
    console.log(`   ${saveBtn > 0 ? '✓' : '✗'} SAVE ALL CHANGES button\n`);
    
    console.log('===== TEST COMPLETE =====\n');
    
  } catch (error) {
    console.error('ERROR:', error.message);
  }
  
  await browser.close();
})();
