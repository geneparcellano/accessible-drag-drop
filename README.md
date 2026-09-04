# Accessible Drag & Drop

A reorderable list built with React + TypeScript that works for both mouse and keyboard/screen reader users.

Each row has a drag handle button:

- **Pointer users** drag a row's handle to reorder it.
- **Keyboard users** focus a handle, then press Arrow Up / Arrow Down to move that row.
- **Screen reader users** get a handle with `role="spinbutton"` and `aria-valuenow`/`aria-valuetext`, so the reader switches to focus mode and passes arrow keys through to the app; every move is also announced via an `aria-live` status region.

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
