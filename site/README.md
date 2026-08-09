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

## Motion

- **Hero** — 120 WebP frames drawn to a canvas, scrubbed by scroll. Frames load in a
  coarse-to-fine order so the whole range is scrubbable before everything has arrived;
  the nearest decoded frame is drawn in the meantime.
- **Network map** — the supplied Africa map is sampled into a ~5,250-point dot matrix
  (`_tools/map_dots.py`). Country borders survive as gaps in the field. Scroll zooms
  from the whole continent to the East African corridor while the routes draw with a
  travelling head, cities light up, and the kilometre readout counts. Real lat/lon is
  mapped onto the image, which is cropped to Africa's bounding box.
- **Fleet rail** — vertical scroll becomes horizontal travel; the section height is
  computed from the track width so the two stay 1:1.
- **Services** — hovering a row reveals an image that follows the cursor.

Add motion by putting `.rv` (word reveal), `.rise` or `.fade` on an element — the engine
picks them up. `data-par="10"` adds parallax; `data-count="100"` animates a number.
`prefers-reduced-motion` unpins everything and shows all content.

## Regenerating assets

```bash
python _tools/prep_assets.py    # hero frames + logo variants
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
