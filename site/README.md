# Martin Logistics — website

Static site. No framework, no build step to serve it. It must be served over HTTP —
opening `index.html` from the filesystem blocks the fonts, the JSON map data and the
frame sequence.

```bash
python -m http.server 8123 --directory site
```

## Structure

```
site/
  index.html          hero frame sequence · network map · fleet rail · services
  about.html          story timeline, vision/mission, leadership, offices
  services.html       the four specialisations + process
  fleet.html          fleet numbers, gallery, trailer types
  news.html           featured post + journal grid
  contact.html        quote form (mailto), contact details, map
  css/site.css        the whole design system — tokens at the top
  js/site.js          motion engine (Lenis + GSAP, two canvas pieces)
  assets/
    seq/              120 hero frames, f000–f119.webp
    africa-dots.json  dot matrix + city coordinates for the network map
    img/              photography, cutouts, logos
  _tools/             asset prep + page generation (dev only, not served)
```

## Design system

Three colours, used deliberately. Yellow is the only accent — it marks the active
state, the route, and the primary action, and nothing else. Red exists only inside
the logo artwork and is never used as a UI colour.

| Token | Value | Role |
|---|---|---|
| `--ink` | `#0B0B0C` | Ground |
| `--paper` | `#F4F1E8` | Light sections |
| `--yellow` | `#EDD836` | Accent, sampled from the truck livery |

Type is **MuseoModerno** (headings, weights 500/600) with **Inter Tight** for body and
**JetBrains Mono** for labels. The scale is intentionally restrained — `.h1` tops out at
64px, not 200px. Use `.h` plus `.h1`–`.h4`; size is earned by the composition, not applied
by default.

Rhythm is controlled by `--bay` (section padding) and `--gap-h` (heading to content).

## Animation stack

| Library | Role |
|---|---|
| GSAP + ScrollTrigger | Pinned stages, scrubbed timelines, scroll sequences |
| Lenis | Smooth scrolling between chapters |
| Three.js | The hero's drifting mote field (WebGL) |
| Motion | UI micro-interactions: button press, nav hover, menu stagger, card lift |

All four load on every page.

**On React Three Fiber, Drei and Framer Motion specifically.** These three are React
packages — R3F and Drei are React renderers *for* Three.js, and Framer Motion is a React
library. They cannot run on a static HTML site without adding React plus a build step
(Vite or Next), which would mean rebuilding all six pages as components. Rather than bolt
in an in-browser Babel transform (a real production cost), this ships the equivalent
capability natively:

- **Three.js directly** instead of R3F/Drei — same renderer, same scene graph, no React.
- **Motion** (`motion` on npm) instead of Framer Motion — the vanilla build from the same
  team, with the same spring/stagger/inView API.

If you want the genuine R3F + Drei + Framer Motion stack, that is a deliberate migration
to Next.js and I can do it as its own piece of work — say the word.

> Gotcha worth knowing: vanilla Motion's `animate()` **silently no-ops when detached**
> from its namespace. `const { animate } = Motion` looks fine, throws nothing, and does
> nothing. Always call it as `Motion.animate(...)`.

## Motion design

- **Stage (hero)** — a locked camera. The truck's size is fixed in CSS (`--truck-w`) and
  the rig is only ever `translateX`-ed, so it can never zoom or shift perspective
  mid-run. At rest it holds the framing of the source photograph; scrolling drives it
  right to left until it clears the frame. Three chapter captions cross-fade on the road
  line and the odometer counts to 1,730 km. Following the RwandAir reference, the contact
  shadow uses `mix-blend-mode: multiply` — the truck itself is an alpha cutout, which
  gives exact edges on any background rather than depending on the plate being white.
- **Reel** — the 120-frame sequence, scrubbed, used as the transition that carries the
  site from the paper world into the dark one.
- **Network map** — the supplied Africa map is sampled into a ~5,250-point dot matrix
  (`_tools/map_dots.py`). Country borders survive as gaps in the field. Scroll zooms
  from the whole continent to the East African corridor while the routes draw with a
  travelling head, cities light up, and the kilometre readout counts. Real lat/lon is
  mapped onto the image, which is cropped to Africa's bounding box.
- **Fleet rail** — vertical scroll becomes horizontal travel; the section height is
  computed from the track width so the two stay 1:1.
- **Services** — hovering a row reveals an image that follows the cursor.

The page rhythm alternates light and dark: stage (paper) → statement (paper) → reel
(dark) → network (dark) → fleet (paper) → services (dark) → CTA (yellow).

Add motion by putting `.rv` (word reveal), `.rise` or `.fade` on an element — the engine
picks them up. `data-par="10"` adds parallax; `data-count="100"` animates a number.
`prefers-reduced-motion` unpins everything and shows all content.

## Regenerating assets

```bash
python _tools/prep_assets.py    # frame sequence + logo variants
python _tools/hero_truck.py     # hero-truck.webp + its contact shadow
python _tools/map_dots.py       # africa-dots.json (+ a _mapcheck.png to eyeball)
python _tools/build_pages.py    # the five interior pages
```

`index.html` is hand-authored and is **not** touched by `build_pages.py`.

## Asset notes

**Cutouts.** Only two background removals were good enough to ship:
`truck-side-twyford-02-cut.webp` and `truck-tractor-only-cut.webp`. Attempts on the
front-facing and 3/4 studio shots left grey haloes and ghosting around mirrors and
container ribs, so they were deleted rather than used. Anywhere else a truck appears,
it is the untouched photograph. Proper cutouts of the front view would unlock a
head-on hero treatment.

**Hero sequence.** 120 frames at 1152px, WebP q60 — 5.2 MB, replacing a 12.5 MB mp4.
Raising the frame count or width scales that roughly linearly.

## Before launch

- The contact form opens the visitor's mail client via `mailto:`. Point it at a real
  endpoint (Formspree, Netlify Forms, or a backend).
- Footer social links are placeholders.
- `martinhardware.rw` has an expired TLS certificate; the footer link will warn until
  that is renewed.
