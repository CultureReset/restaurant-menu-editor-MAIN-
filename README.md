# restaurant-menu-editor-MAIN-

A menu editor a restaurant can run from a phone: daily specials, menu items and photos behind a PIN, with a public menu page per restaurant.

Next.js (pages router) on Vercel. Last changed July 12, 2026, adding a camera button to the gallery and a compose step on the Share tab.

## How it works

- `pages/index.js` is the editor; `pages/new.js` adds a restaurant (name, slug, tagline, PIN) through the [GCR API](https://github.com/CultureReset/gcr-api-clean); `pages/[slug].js` is the public menu.
- `pages/api/data.js` reads and saves menu data, and `pages/api/upload.js` takes photos.
- `scripts/seed-menu.js` loads an example menu from `scripts/gulfislandgrill.json`.

## Run it

```bash
npm install
npm run dev
npm run build && npm start
```

The `*-test.js` files and `tests/` are Playwright checks used during development. The menu editor that grew inside the GCR working tree is [`restaurant-menu-editor`](https://github.com/CultureReset/restaurant-menu-editor).
