# Martin Logistics — website

Static site. No framework, no build step to serve it. Open `index.html` behind any
web server (a `file://` open will block the video and fonts).

```bash
python -m http.server 8123 --directory site
```

## Structure

```
site/
  index.html         hero (scroll-scrubbed video), corridor map, fleet rail, services
  about.html         story timeline, vision/mission, leadership, offices
  services.html      the four specializations + process
  fleet.html         fleet numbers, gallery, trailer types
  news.html          featured post + journal grid
  contact.html       quote form (mailto), contact details, map
  css/site.css       the whole design system — tokens at the top
  js/site.js         motion engine (Lenis smooth scroll + GSAP ScrollTrigger)
  assets/
    corridor.mp4     hero video, scrubbed by scroll
    img/             webp imagery + transparent cutouts + logo
  _build_pages.py    regenerates the five interior pages from one shared shell
```

### `_build_pages.py`

The nav, footer and script tags are identical on every interior page. Rather than
maintaining six copies by hand, that script stamps them out. Edit the page bodies
inside it and re-run:

```bash
python site/_build_pages.py
```

`index.html` is hand-authored and is **not** touched by the script.

## Design tokens

Everything keys off the custom properties at the top of `css/site.css`.

| Token | Value | Notes |
|---|---|---|
| `--yellow` | `#EDD836` | Brand yellow, sampled from the truck livery |
| `--ink` | `#0B0B0C` | Near-black ground |
| `--paper` | `#F4F1E8` | Warm off-white |
| `--red` | `#E0261A` | From the logo bar — accent only |
| `--bay` | `clamp(150px, 20vh, 300px)` | Section rhythm. Raise this to open the page up further |
| `--gap-h` | `clamp(56px, 8vh, 120px)` | Gap between a heading block and its content |

## Motion

Driven by GSAP ScrollTrigger, with Lenis for inertial scrolling.

- **Hero** — pinned for 340vh; scroll position sets `video.currentTime`, so the camera
  orbit is scrubbed by the wheel. Headline splits and drifts apart as it goes.
- **Corridor** — pinned; SVG routes draw via `stroke-dashoffset`, nodes pop in, and the
  stop list on the left lights up in sequence.
- **Convoy** — a cutout truck crosses the full viewport width as the band scrolls past.
- **Fleet rail** — vertical scroll translated into horizontal travel. Section height is
  computed in JS from the track width so the two stay 1:1.
- **Services** — hovering a row reveals an image that follows the cursor.
- Word-level reveals on anything with `.rv`, plus `.rise` / `.fade` for simpler entrances.

Add motion by putting `.rv`, `.rise` or `.fade` on an element — the engine picks them up
automatically. `data-par="12"` adds parallax. `data-count="100"` animates a number.

`prefers-reduced-motion` unpins everything, drops the scrub, and shows all content.

## Known trade-offs

- **`corridor.mp4` is 12.5 MB** and dominates page weight. It should be re-encoded before
  launch — target ~2–4 MB at 1280×720 with a dense keyframe interval (`-g 10`), which also
  makes scrubbing smoother. A WebM sibling would help too.
- The contact form opens the visitor's mail client via `mailto:`. Point it at a real
  endpoint (Formspree, Netlify Forms, or a backend) before launch.
- Social links in the footer are placeholders.
