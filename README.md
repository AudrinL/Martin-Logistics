# Martin Logistics

Marketing site for Martin Logistics — the transport division of Martin Hardware
Ltd, running freight from the ports at Mombasa and Dar es Salaam to Kigali and
onward into the DRC.

Built with the Next.js App Router. Heavy on scroll choreography: a scrubbed WebP
frame sequence, a canvas network map, a horizontal fleet rail and a WebGL dust
field, all driven by GSAP ScrollTrigger under Lenis smooth scroll.

## Getting started

```bash
npm install
```

```bash
npm run dev
```

The site runs at [localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build |
| `npm start` | Serve a production build (run `build` first) |
| `npm run lint` | ESLint, using `eslint-config-next` |
| `npm run typecheck` | `tsc --noEmit` — CI-friendly, no build required |

## Layout

```
app/                  One route per page, plus the root layout and globals.css
components/
  chrome/             Persistent shell: nav, footer, cursor, smooth scroll
  contact/            Quote form
  fx/                 Reusable motion primitives (Reveal, ScrollFX, Micro)
  home/               Index-only sections (Stage, Reel, Network, Rail, Services)
  sections/           Blocks shared by interior pages (PageHero, Cta)
  three/              React Three Fiber scenes (DustField)
  ui/                 Leaf presentational bits (Arrow)
lib/                  Shared logic — see below
public/assets/        Everything the site serves: img/, seq/, africa-dots.json
tools/                Python asset pipeline — see tools/README.md
```

### `lib/`

- **`site.ts`** — nav, contact details and services. Edit business facts here;
  every page reads from it.
- **`gsap.ts`** — registers ScrollTrigger and `useGSAP` exactly once. Import
  GSAP from here, never from `gsap` directly, so plugins can't double-register.
- **`hooks.ts`** — `useReducedMotion` and `useCoarsePointer`. Both return
  `false` on first render to avoid a hydration mismatch, so treat `false` as
  "not known yet" and let it fall through to the full-motion path.
- **`useFrameSequence.ts`** — canvas scrubber for the hero WebP sequence. Loads
  coarse-to-fine so the whole scroll range is usable almost immediately.
- **`networkMap.ts`** — canvas renderer for the Africa dot map and route legs.

## Assets

`public/assets/` is generated, but tracked — the site serves it directly, so a
clone builds without needing Python or the raw files.

The raw sources it is generated from live in `Martin logistics Assets/`, which
is **deliberately gitignored** (about 51 MB of Gemini renders, logo lockups and
raw hero frames). Back that folder up separately; it is not in the repo. See
[`tools/README.md`](tools/README.md) for what regenerates what.

## Conventions

- **Scroll-driven and entrance motion belongs to GSAP**, so ScrollTrigger stays
  the single timeline authority; CSS transitions are for hover and state changes
  only. `ScrollFX` owns the page-wide `.rise` / `.fade` / `.tick` behaviour,
  while per-component animation lives with its component.
- **`next/image` is deliberately off** for the cutout trucks and gallery
  figures — the stylesheet positions them by exact element structure, and the
  wrapper `next/image` injects moves them. `@next/next/no-img-element` is
  disabled in `eslint.config.mjs` for that reason. Revisit only as a deliberate
  pass with the layout re-verified in the browser.
- **Respect `prefers-reduced-motion`.** Anything that scrubs, parallaxes or
  autoplays should check `useReducedMotion` first.

## Deployment

Standard Next.js build with no custom server or environment variables — any
Node host or Vercel works:

```bash
npm run build
```
