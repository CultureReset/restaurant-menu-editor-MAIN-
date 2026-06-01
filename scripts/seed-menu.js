// Run this once to pre-populate a restaurant menu
// Usage: node scripts/seed-menu.js <slug> <name> <pin> <json-file>
// Example: node scripts/seed-menu.js gulfislandgrill "Gulf Island Grill" 1234 scripts/gulfislandgrill.json

const { put } = require('@vercel/blob');

const args = process.argv.slice(2);
if (args.length < 4) {
  console.error('Usage: node scripts/seed-menu.js <slug> <name> <pin> <json-file>');
  process.exit(1);
}

const [slug, name, pin, jsonFile] = args;

async function seed() {
  try {
    const menuData = require(`./${jsonFile}`);

    const data = {
      restaurant: {
        name,
        icon: '🍽️',
        tagline: 'Fresh Gulf Coast Flavors'
      },
      sections: menuData.sections,
      items: menuData.items,
      gallery: [],
      pin
    };

    const filename = `menus/${slug}.json`;
    await put(filename, JSON.stringify(data), { access: 'public' });

    console.log(`✅ Created: https://yourapp.vercel.app/?slug=${slug}`);
    console.log(`📋 PIN: ${pin}`);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();
