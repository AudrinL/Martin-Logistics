"use client";

import { useEffect, useRef } from "react";
import { prepareWithSegments, measureNaturalWidth } from "@chenglou/pretext";

/* The footer wordmark, built out of particles.

   The type is still measured rather than guessed: pretext measures the string
   once per font at a reference size, and because width scales linearly with
   font-size, the size that fills the column exactly is one division. That
   matters more here than it did for plain text — the particles are sampled
   from a canvas rendering of the mark, so if the size were a `vw` guess the
   sampled cloud would be cropped or float in dead space.

   Pipeline: fit with pretext -> draw the mark once to an offscreen canvas ->
   read the alpha channel -> every sufficiently opaque pixel on a grid becomes
   a particle target. From then on nothing touches text again; it is 8k points
   easing toward their targets, drifting, and pushing away from the cursor. */

const ONE_LINE = "Martin Logistics";
const STACKED = ["Martin", "Logistics"];

const REF = 100;
const TRACK_EM = -0.022;
const STACK_BELOW = 56;

/* Sampling grid in CSS px. Lower is denser and prettier and costs more; this
   is tuned to land near TARGET_MAX particles at desktop width. */
const STEP_MIN = 3;
const TARGET_MAX = 9000;
/* Alpha above which a sampled pixel counts as ink. */
const INK = 90;

const DOT = 1.6;          /* particle size in CSS px */
const EASE = 0.075;       /* pull toward target */
const FRICTION = 0.86;
/* Cursor repel radius in CSS px — this is the visible empty circle the
   pointer carves out of the cloud, so it reads as twice this number wide.
   Kept tight: a wide void erases whole letters and the mark stops being
   readable while the cursor is anywhere near it. */
const PUSH_R = 62;
const PUSH_F = 26;
const DRIFT = 0.22;       /* idle wander */

type P = {
  hx: number; hy: number;   /* home / target */
  x: number; y: number;
  vx: number; vy: number;
  ph: number;               /* drift phase */
  a: number;                /* alpha bucket 0..BUCKETS-1 */
  gold: boolean;
};

const BUCKETS = 5;

export default function FootMark() {
  const box = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  /* Carries the real heading styles so the font can be read off something
     actually set in the heading face. Reading it off the container silently
     measures the inherited body font instead, and the numbers still look
     plausible — which is what makes that bug nasty. */
  const probe = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = box.current;
    const canvas = cv.current;
    const ref = probe.current;
    if (!el || !canvas || !ref) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let alive = true;
    let raf = 0;
    let particles: P[] = [];
    let dpr = 1;
    let w = 0;
    let h = 0;
    let font = "";
    let entered = 0;        /* 0..1 assembly progress */
    let inView = false;
    const widths = new Map<string, number>();
    const pointer = { x: -9999, y: -9999 };

    const fontAt = (size: number) => {
      const cs = getComputedStyle(ref);
      return `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    };

    /* Natural width at REF px — the expensive pretext call, memoised. */
    const natural = (text: string) => {
      const hit = widths.get(text);
      if (hit !== undefined) return hit;
      const w0 = measureNaturalWidth(
        prepareWithSegments(text, font, { letterSpacing: TRACK_EM * REF }),
      );
      widths.set(text, w0);
      return w0;
    };

    /* Fit, draw, sample. Rebuilds the whole particle set — only on resize. */
    const build = () => {
      if (!alive) return;
      const avail = el.clientWidth;
      if (!avail || !font) return;

      const sizeOf = (t: string) => (avail / natural(t)) * REF;

      const single = sizeOf(ONE_LINE);
      const lines =
        single >= STACK_BELOW
          ? [{ text: ONE_LINE, size: single }]
          : STACKED.map((text) => ({ text, size: sizeOf(text) }));

      /* Vertical metrics from the font itself rather than a guessed
         multiplier, so descenders ("g") are never clipped. */
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.letterSpacing = `${TRACK_EM * lines[0].size}px`;

      const rows = lines.map((l) => {
        ctx.font = fontAt(l.size);
        ctx.letterSpacing = `${TRACK_EM * l.size}px`;
        const m = ctx.measureText(l.text);
        return {
          ...l,
          asc: m.actualBoundingBoxAscent,
          desc: m.actualBoundingBoxDescent,
          w: m.width,
        };
      });

      const GAP = 0.06;
      let total = 0;
      for (const r of rows) total += r.asc + r.desc + r.size * GAP;
      total -= rows[0].size * GAP;

      w = avail;
      h = Math.ceil(total);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;

      /* Draw the mark opaque; only the alpha channel is read. */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      let y = 0;
      for (const r of rows) {
        ctx.font = fontAt(r.size);
        ctx.letterSpacing = `${TRACK_EM * r.size}px`;
        y += r.asc;
        ctx.fillText(r.text, w / 2, y);   /* centred */
        y += r.desc + r.size * GAP;
      }

      const img = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

      /* Choose a grid step that keeps the count near TARGET_MAX regardless of
         viewport, so a wide desktop does not cost 40k points. */
      let step = STEP_MIN;
      /* Measured ink ratio for this mark at this weight: roughly 31% of the
         sampled grid lands on a glyph. Guessing low here is the failure that
         matters — the cap silently stops engaging and a wide viewport builds
         far more particles than intended. */
      const inkEst = ((w * h) / (step * step)) * 0.31;
      if (inkEst > TARGET_MAX) step = STEP_MIN * Math.sqrt(inkEst / TARGET_MAX);

      const next: P[] = [];
      for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
          const sx = Math.round(px * dpr);
          const sy = Math.round(py * dpr);
          const a = img[(sy * canvas.width + sx) * 4 + 3];
          if (a < INK) continue;
          /* Alpha bucket from vertical position reproduces the gradient the
             plain-text version had: bright at the top, dissolving downward. */
          const t = py / h;
          const bucket = Math.min(
            BUCKETS - 1,
            Math.floor((1 - t * 0.78) * BUCKETS * 0.999),
          );
          next.push({
            hx: px,
            hy: py,
            x: px,
            y: py,
            vx: 0,
            vy: 0,
            ph: Math.random() * Math.PI * 2,
            a: bucket,
            gold: Math.random() < 0.035,
          });
        }
      }

      /* Scatter for the assembly. Seeded from the home position so the cloud
         collapses inward rather than sliding in from one side. */
      for (const p of next) {
        const ang = Math.random() * Math.PI * 2;
        const r = 60 + Math.random() * 260;
        p.x = p.hx + Math.cos(ang) * r;
        p.y = p.hy + Math.sin(ang) * r * 0.45;
      }

      particles = next;

      /* The solid mark is still sitting on the canvas from the sampling pass.
         Clear it: the animation only paints once the footer is in view, so
         leaving it would show hard type that pops into particles on scroll. */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (reduced) {
        entered = 1;
        for (const p of particles) {
          p.x = p.hx;
          p.y = p.hy;
        }
        draw();
      }
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      /* Batched by alpha bucket: five globalAlpha changes per frame instead
         of one per particle. */
      for (let b = 0; b < BUCKETS; b++) {
        ctx.globalAlpha = (0.06 + (b / (BUCKETS - 1)) * 0.30) * entered;
        ctx.fillStyle = "#F4F1E8";
        for (const p of particles) {
          if (p.a !== b || p.gold) continue;
          ctx.fillRect(p.x, p.y, DOT, DOT);
        }
        ctx.fillStyle = "#EDD836";
        for (const p of particles) {
          if (p.a !== b || !p.gold) continue;
          ctx.fillRect(p.x, p.y, DOT, DOT);
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = () => {
      if (!alive) return;
      raf = requestAnimationFrame(tick);
      if (!inView) return;

      entered += (1 - entered) * 0.03;
      const t = performance.now() * 0.001;

      for (const p of particles) {
        /* home pull */
        p.vx += (p.hx - p.x) * EASE;
        p.vy += (p.hy - p.y) * EASE;

        /* idle drift, per-particle phase so it never reads as a single wave */
        p.vx += Math.cos(t * 0.7 + p.ph) * DRIFT * 0.5;
        p.vy += Math.sin(t * 0.9 + p.ph) * DRIFT * 0.5;

        /* cursor repel */
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < PUSH_R * PUSH_R) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / PUSH_R) * PUSH_F;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -9999;
    };

    /* Canvas measureText silently measures the fallback face if the webfont
       has not landed, and every number after that is confidently wrong. */
    document.fonts.ready.then(() => {
      if (!alive) return;
      font = fontAt(REF);
      widths.clear();
      build();
      if (!reduced) raf = requestAnimationFrame(tick);
    });

    const ro = new ResizeObserver(() => {
      if (font) build();
    });
    ro.observe(el);

    /* Only animate while the footer is actually on screen. */
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    io.observe(el);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="ftmark" ref={box} role="img" aria-label="Martin Logistics">
      <span className="ftmark__probe" ref={probe} aria-hidden />
      <canvas className="ftmark__cv" ref={cv} aria-hidden />
    </div>
  );
}
