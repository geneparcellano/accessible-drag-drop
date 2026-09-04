# Accessible Drag & Drop

A reorderable list built with React + TypeScript that works for both mouse and keyboard/screen reader users.

Each row has a drag handle button. Pointer users drag rows to reorder them; keyboard users focus a handle and press Arrow Up / Arrow Down to move that row. The handle uses `role="spinbutton"` with `aria-valuenow`/`aria-valuetext` so screen readers switch to focus mode and pass arrow keys to the app, and every move is announced through an `aria-live` status region.

## Setup

Requires Node.js 20+.

```bash
npm install
npm run dev
```

The dev server URL is printed in the terminal (default http://localhost:5173).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run Oxlint |
