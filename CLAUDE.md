# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Instagram-based Sales CRM for managing sales teams, inventory, delivery, and analytics. The UI is in Uzbek. The entire application is a single static HTML file deployed to Firebase Hosting.

## Development & Deployment

No build step — the app is pure HTML/CSS/JS served directly.

- **Local dev:** Open `public/index.html` in a browser
- **Deploy:** `firebase deploy` (requires Firebase CLI and login)
- **Firebase project:** `sales-crm-82b62`

No package.json, no bundler, no TypeScript, no test suite.

## Architecture

The entire application lives in **`public/index.html`** (~4,200 lines). It contains:
- Embedded CSS (mobile-first, bottom tab navigation)
- Embedded `<script type="module">` with all application logic
- Firebase SDK 10.12.0 loaded via CDN

### Global State

All runtime data lives in the global object `D`:
```js
D = {
  sellers, ig, products, sales,   // core collections
  admin, user,                     // auth state
  bonusConfig, expenses, activeAds // config/analytics
}
```

`D` is populated at startup by loading all Firestore collections. LocalStorage handles session persistence for auto-login.

### Firestore Collections

| Collection   | Purpose |
|-------------|---------|
| `sellers`   | Team members with roles, commission/salary config, start date |
| `instagram` | Instagram business accounts linked to sellers |
| `products`  | Catalog with pricing, stock levels, and images |
| `sales`     | Transaction records including receipt images (Cloud Storage URLs) |
| `settings`  | Global config: bonus thresholds, monthly expenses, counters |

### User Roles & Routing

The app renders a different UI based on the logged-in user's role. Five roles exist:

| Role | Uzbek label | Access |
|------|-------------|--------|
| Admin | — | Full access: team, products, analytics, expenses, config |
| `sotuvchi` | Sotuvchi | Sell products, view personal stats and orders |
| `targetolog` | Targetolog | Conversion analytics, bonus/fine reporting, Excel export |
| `omborchi` | Omborchi | Inventory management, stock levels |
| `yetkazuvchi` | Yetkazuvchi | Delivery status workflow (new → sent → delivered) |

### Key Subsystems

- **Bonus/fine system:** Automatically calculated from seller conversion rates against configurable thresholds stored in `settings`.
- **Analytics (Tahlil):** Date-range filtered views of sales trends, per-seller conversion rates, Instagram account performance, and product-level ad analysis. Supports Excel export.
- **Image uploads:** Product images and order receipt photos are stored in Firebase Cloud Storage; URLs saved to Firestore.
- **Telegram notifications:** Integrated notification hooks in the sales flow.

## Making Changes

Because everything is in one file, search with `Ctrl+F` / Grep for the relevant section by role name (e.g., `sotuvchi`, `omborchi`) or feature keyword (e.g., `tahlil`, `bonus`, `yetkazuvchi`). UI sections are rendered by JS functions that build and inject HTML strings into a container element.

## Critical Technical Rules

- **TDZ (Temporal Dead Zone):** Never place any code between `let D={` and its closing `}` — doing so causes a TDZ error and breaks the entire app.
- **`ic()` vs `ic2()`:** `ic()` is a global utility function. `ic2()` only works inside `buildSellerTabs` — do not call it elsewhere.
- **Template literals:** `${}` interpolation only works inside backtick strings. Never use `${}` inside single- or double-quoted strings.
- **After every change:** Verify JS syntax before saving — a single syntax error breaks the whole app since there is no build step to catch it.
- **Firebase config:** Do not modify the Firebase configuration object.
- **Before making changes:** Show the plan first and wait for confirmation.

## Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `farruh` | `1234` |
| Sotuvchi | `roziya`, `madina`, `marhabo`, `shahzoda` | `1234` |
| Targetolog | `target` | `1234` |
| Omborchi | `omborchi` | `1234` |
| Mobilograf | `mobilograf` | `1234` |
