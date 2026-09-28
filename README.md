# Arcane 3.0

A single-page application built with React, Vite, React Router, and Tailwind CSS v4.
The home page hero renders `ARCANE 3.0` ASCII art animated with a terminal-style
canvas text effect.

## Stack

- React 19 + TypeScript + Vite 8 (with React Compiler via Babel preset)
- React Router 8 (`react-router`) — `BrowserRouter` + declarative `<Routes>`
- Tailwind CSS v4 (via `@tailwindcss/vite`, theme in CSS with `@theme`)
- tte-js (vendored under `external/`) for the hero canvas text effect

## Getting started

```bash
npm install
npm run dev      # start dev server
npm run build    # sync events from Supabase, then type-check + production build
npm run preview  # preview the production build
npm run lint     # eslint
```

## Events data pipeline (Supabase → JSON → home page)

The home page events table is driven by `public/events.json`, generated at
build time — no Supabase credentials ever reach the browser.

1. Copy `.env.example` to `.env` and fill in `SUPABASE_URL` plus the
   secret `SUPABASE_SECRET_KEY` (`sb_secret_...`, server-side only, no `VITE_`
   prefix). On Vercel, set the same two variables in the dashboard.
2. `npm run build` triggers `prebuild` → `npm run fetch:events`, which runs
   `scripts/fetch-events.ts` (dependency-free, uses the Supabase REST API):
   - reads every row from the `events` table (override with
     `SUPABASE_EVENTS_TABLE`),
   - normalizes rows to the `EventItem` shape (`src/data/events.ts`):
     display-ready `title`/`prize`/`time`/`fee`/`squad`/`image` plus every
     raw column (`dbId`, `longDescription`, `feeAmount`, `prizeAmount`,
     `teamMin`/`teamMax`, `startsAt`, timestamps) for the detail pages,
     only `enabled` rows, ordered by `time`,
   - downloads remote `poster_img`/`payment_img` assets into `public/events/`
     and rewrites `image`/`paymentImage` to the local paths
     to the local path (already-local `/events/...` paths are kept;
     bare storage paths resolve via `SUPABASE_STORAGE_BUCKET`),
   - writes `public/events.json` (`{ updatedAt, count, events }`), which
     Vite copies into `dist/`.
3. `src/data/useEvents.ts` fetches `/events.json` at runtime. If the sync
   never ran (e.g. local dev without `.env`), it falls back to the bundled
   `DEFAULT_EVENTS`, so the page always renders. Filter pills are derived
   from the actual tracks, so new Supabase tracks appear automatically.

Without credentials the sync logs a warning and exits 0 (build still
succeeds on fallback data); with credentials but a failing query it exits 1
so bad data never ships silently.

To re-run the sync manually without a full build:

```bash
npx tsx scripts/fetch-events.ts
```

## Routes

| Path      | File                  | Description   |
| --------- | --------------------- | ------------- |
| `/`       | `src/pages/Home.tsx`  | Hero + About + Events sections |
| `/events/:slug` | `src/pages/Event.tsx` | Synced event detail (from `events.json`) |
| `/event1` | `src/pages/Event1.tsx`| Event 1 page  |
| `/event2` | `src/pages/Event2.tsx`| Event 2 page  |
| `/event3` | `src/pages/Event3.tsx`| Event 3 page  |
| `*`       | `src/pages/NotFound.tsx` | 404 fallback |

Routing lives in `src/App.tsx` (`BrowserRouter` + `<Routes>` with a shared
`<Route element={<Layout />}>`). `src/components/Layout.tsx` provides the page
shell (`Navbar` + `<Outlet />` + `Contact` footer).

## Project structure

```
src/
  App.tsx                 # BrowserRouter + route definitions
  main.tsx                # React root
  index.css               # Tailwind import + @theme tokens
  assets/arcane-3.0.txt   # Hero ASCII art (loaded with ?raw)
  components/
    Layout.tsx            # Page shell (nav + outlet + footer)
    Navbar.tsx            # Top navigation
    Contact.tsx           # Footer
    home/
      Hero.tsx            # Animated ASCII hero heading
      About.tsx           # About placeholder
      Events.tsx          # Event cards placeholder
  helpers/
    theme.ts              # Reads Tailwind theme colors at runtime
  pages/                  # Route components
external/
  tte-js/                 # Vendored terminal-text-effects library (see below)
```

## Theme

Fonts and colors are Tailwind v4 `@theme` tokens in `src/index.css`, loaded from
Google Fonts in `index.html`:

- Fonts: `font-heading` → Pixelify Sans, `font-content` → Geist Pixel
- Colors: `medium-red` `#AA3430`, `near-black` `#040203`,
  `dark-red` `#831B1C`, `mist` `#E7E5E8`
- Usage: `bg-medium-red`, `text-near-black`, `border-dark-red/30`,
  `dark:bg-near-black`, etc.

## Hero effect

`src/components/home/Hero.tsx` animates `src/assets/arcane-3.0.txt` with the
`thunderstorm` effect on an infinite fast loop (`duration: 1200`, `fps: 60`).

- The effect palette comes from the Tailwind theme at runtime via
  `themePalette()` (`src/helpers/theme.ts`), which reads the `--color-*` CSS
  variables — change the theme and the effect follows.
- tte-js is lazy-loaded (`await import(...)`) and only starts when the hero
  scrolls into view, so it stays off the critical path for initial page load
  (ships as its own chunk).
- The `<pre>` source text is `text-transparent` so the pre-effect static glyphs
  (which can misalign under system fallback fonts) never flash; the canvas
  forces strict grid positions. Keep every line of the `.txt` file at equal
  width (including trailing spaces) for the same reason.

## Vendored tte-js

`external/tte-js` is a clone of https://github.com/flaviocopes/tte-js
(dependency-free, browser Canvas text effects, MIT — see its
`THIRD_PARTY_NOTICES.md`). Per its README it is used by direct source import
(there is nothing to build).

The `external/` directory has an alias so imports stay short:

```tsx
import { createTextEffect } from '@external/tte-js/src/index.js'
```

- `vite.config.ts` → `resolve.alias: { '@external': ./external }`
- `tsconfig.app.json` → `paths: { "@external/*": ["../external/*"] }`
- `src/tte-js.d.ts` → ambient `declare module '@external/*'` types, since the
  vendored JS ships no type declarations
