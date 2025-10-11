# Monthly Finance Dashboard

A small React + Vite dashboard for tracking monthly finances from an Excel workbook.

- Import an Excel file where each sheet name is a month (e.g., January, February, …)
- Each sheet must have two columns: Category and Expense (or Amount)
- Data is saved to Firestore per month, and the latest upload fully overrides existing data
- Categories are dynamic (no hardcoding); colors are stable and distinct per category
- Includes dark mode, stats, chart, table, and filters

## Quick start

1) Install

```bash
npm install
npm run dev
```

2) Configure Firebase

- Open `src/lib/firebase.js` and confirm the Firebase config matches your project
- Authentication: enable Anonymous sign-in in Firebase Console → Build → Authentication → Sign-in method → Anonymous → Enable
- Firestore: create the database in your project if you haven’t already

3) Firestore security rules (signed-in users only)

Rules are in `firestore.rules`. To deploy:

```bash
npm i -g firebase-tools
firebase login
firebase use dashboard-b8464
firebase deploy --only firestore:rules
```

The app signs in anonymously before any read/write.

## Excel format

- One sheet per month
- Two columns: `Category` and `Expense` (or `Amount`)
- Categories are aggregated per month

Tip: Sheet names should match English month names (January..December) for ordering.

## Features

- Upload Excel → parse → aggregate → save to Firestore (override mode)
- Dynamic categories with brand-safe, distinct colors
- Stats: Total spend, average per month (choose months-with-data vs all months)
- Filters: Month and category
- Table: Per-category totals and per-month columns
- Dark mode toggle (persists across reloads)

## Scripts

```bash
npm run dev       # start locally
npm run build     # production build
npm run preview   # preview the build
```

## Data model

Collection: `monthlyExpense_2025`

- Document ID: month name (e.g., `January`)
- Fields:
  - `month`: string (same as document ID)
  - Dynamic category fields: number (e.g., `Food`, `Charging`, `Fun`, `Girlfriend`, ...)

Uploads are overriding: existing docs in `monthlyExpense_2025` are deleted in the same batch before writing the new month docs.

## Architecture

See `docs/architecture.mmd` for the high-level Mermaid diagram of components and data flow.

## Troubleshooting

- Can’t read/write Firestore:
  - Ensure Anonymous sign-in is enabled and you’re logged in (`src/lib/firebase.js` signs in anonymously on load)
  - Deploy rules and confirm they allow authenticated users
- Months out of order:
  - Ensure sheet names match standard month names; the UI orders by a fixed Jan–Dec list
- Colors look the same:
  - The palette assigns unique colors per category; if you exceed 20 categories, expand the palette in `src/components/Components.tsx`
- Need merge behavior instead of override:
  - Currently, upload fully overrides; we can add a toggle to support a merge mode if needed

## Tech stack

- React, Vite, Tailwind
- Recharts for charting
- Radix UI for select primitives
- Firebase (Auth, Firestore)

