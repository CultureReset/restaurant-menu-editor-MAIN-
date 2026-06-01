# Restaurant Menu Editor

A simple, fast menu editor for restaurants to manage their daily specials, items, and images.

## Features

- 🔐 **PIN-Protected** - Secure access with 4-digit PIN (demo: 1234)
- 📷 **Image Gallery** - Upload and manage restaurant photos
- 🍽️ **Menu Items** - Add, edit, delete menu items with images
- 👁️ **Live Preview** - See exactly how customers will view your menu
- 📱 **Mobile-Friendly** - Works great on phones and tablets
- ⚡ **Real-Time Updates** - Changes show instantly (no API calls needed while editing)
- 📤 **Publish to API** - One-click publish when ready

## Getting Started

### Install

```bash
cd /Users/owner/restaurant-menu-editor
npm install
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo PIN
**PIN: 1234**

## How to Use

### 1. Upload Images
- Click "+ Upload Image" button
- Select photos from your phone or computer
- Images appear in the gallery immediately

### 2. Create Menu Items
- Select a section (Seafood, Drinks, Appetizers, Specials)
- Fill in: Name, Price, Description
- Choose an image from your gallery
- Click "Add Item"

### 3. Edit Items
- Click "Edit" on any item to modify it
- Click "Delete" to remove it

### 4. Preview
- Switch to "Preview" tab
- Swipe left/right through items
- Click on sections to filter
- See exactly how customers see your menu

### 5. Publish
- When happy with your menu, click "Publish to API"
- This sends all data to your backend
- Data is logged to console (check browser dev tools)

## Customizing for Your Restaurant

### Change Restaurant Info
Edit `pages/index.js` line 9-12:
```javascript
const [restaurant, setRestaurant] = useState({
  name: 'Your Restaurant Name',
  icon: '🍴', // Change emoji
  tagline: 'Your Tagline Here'
});
```

### Add More Sections
Edit `pages/index.js` line 14:
```javascript
const [sections, setSections] = useState(['Appetizers', 'Mains', 'Desserts', 'Drinks']);
```

### Modify Colors
Edit `styles/Home.module.css` - Look for color values like `#0b7a75`

## API Integration

When you click "Publish to API", the data looks like:
```javascript
{
  restaurant: { name, icon, tagline },
  sections: ['Seafood', 'Drinks', ...],
  items: [
    { id, section, name, price, desc, image: imageId },
    ...
  ],
  gallery: [
    { id, url: dataUrl, name },
    ...
  ]
}
```

### Send to Your Backend

Edit `pages/index.js` line 212, replace the alert with:
```javascript
const response = await fetch('YOUR_API_ENDPOINT', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
const result = await response.json();
alert('Published: ' + result.message);
```

## File Structure

```
restaurant-menu-editor/
├── pages/
│   ├── _app.js          (Next.js app wrapper)
│   └── index.js         (Main editor component)
├── styles/
│   ├── globals.css      (Global styles)
│   └── Home.module.css  (Component styles)
├── next.config.js       (Next.js config)
└── package.json
```

## Technologies

- **Next.js** - React framework
- **React Hooks** - State management
- **CSS Modules** - Scoped styling

## Demo Data

The app comes with sample items:
- Blackened Redfish ($24.99)
- Gulf Shrimp Plate ($18.99)
- Sunset Margarita ($9.00)

Edit or delete these and add your own!

## Troubleshooting

**Images not showing in preview?**
- Make sure you selected an image from the gallery when adding the item

**Can't add item?**
- All fields are required: Name, Price, and Image

**Want to reset everything?**
- Refresh the page (data is not saved to browser)

## Support

This is a demo. Customize as needed for your restaurant!
