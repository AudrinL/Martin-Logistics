"use client";

import { useEffect, useRef, useState } from "react";
import { prepareWithSegments, measureNaturalWidth } from "@chenglou/pretext";

/* The footer wordmark: "Martin Logistics" set to fill the column edge to edge,
   exactly, at whatever width the viewport happens to be.

   CSS cannot do this. `font-size: 9vw` is a guess that only lines up at one
   viewport, and the moment the heading font changes — as it just did, from
   MuseoModerno to ABeeZee — every hand-tuned vw number is wrong again. So the
   size is measured rather than guessed: pretext measures the string once per
   font at a reference size, and because text width scales linearly with
   font-size, the fitted size is one division. Resizing re-runs that division
   and nothing else — no reflow, no getBoundingClientRect, no measuring div.

   Below a legibility floor the mark stacks onto two lines and each word is
   fitted independently, which is why "Martin" ends up larger than
   "Logistics" — both are flush to the same two edges. */

const ONE_LINE = "Martin Logistics";
const STACKED = ["Martin", "Logistics"];

/* Measure at a reference size and scale the result. Any size works; 100 keeps
   the arithmetic legible when debugging. */
const REF = 100;
/* Must track .h in globals.css — see the accuracy contract in the pretext
   docs. Expressed in em so it scales with the fitted size the way CSS does. */
const TRACK_EM = -0.022;
/* Under this fitted size a single line reads as small print rather than as a
   mark, so stack instead. */
const STACK_BELOW = 56;

type Line = { text: string; size: number };

export default function FootMark() {
  const box = useRef<HTMLDivElement>(null);
  /* Carries the real .ftmark__l styles so the font can be read off something
     that is actually set in the heading face. Reading it off the container
     silently measures the inherited body font instead — the numbers still
     look plausible, which is what makes it a nasty bug. */
  const probe = useRef<HTMLSpanElement>(null);
  const [lines, setLines] = useState<Line[] | null>(null);

  useEffect(() => {
    const el = box.current;
    const ref = probe.current;
    if (!el || !ref) return;

    let alive = true;
    /* Prepared handles are keyed by text + font. prepare() is the expensive
       half of the library; layout is meant to be the only thing that repeats.
       Here every resize reuses these. */
    let cache = new Map<string, number>();
    let font = "";

    /* Read the font off the element itself rather than hardcoding it, so the
       measurement stays correct through font swaps without anyone remembering
       to update a string in two places. */
    const fontFor = (size: number) => {
      const cs = getComputedStyle(ref);
      return `${cs.fontWeight} ${size}px ${cs.fontFamily}`;
    };

    /* Natural width of a string at REF px, measured once and remembered. */
    const widthAt100 = (text: string) => {
      const hit = cache.get(text);
      if (hit !== undefined) return hit;
      const prepared = prepareWithSegments(text, font, {
        letterSpacing: TRACK_EM * REF,
      });
      const w = measureNaturalWidth(prepared);
      cache.set(text, w);
      return w;
    };

    const fit = () => {
      if (!alive) return;
      const avail = el.clientWidth;
      if (!avail) return;

      const size = (text: string) => (avail / widthAt100(text)) * REF;

      const single = size(ONE_LINE);
      setLines(
        single >= STACK_BELOW
          ? [{ text: ONE_LINE, size: single }]
          : STACKED.map((text) => ({ text, size: size(text) })),
      );
    };

    /* Canvas measureText silently measures the fallback face if the webfont
       has not landed, and every number after that is confidently wrong. */
    document.fonts.ready.then(() => {
      if (!alive) return;
      font = fontFor(REF);
      cache = new Map();
      fit();
    });

    const ro = new ResizeObserver(() => {
      if (font) fit();
    });
    ro.observe(el);

    return () => {
      alive = false;
      ro.disconnect();
    };
  }, []);

  return (
    <div className="ftmark" ref={box} aria-label="Martin Logistics" role="img">
      <span className="ftmark__l ftmark__probe" ref={probe} aria-hidden />
      {lines === null ? (
        /* Pre-measurement and pre-JS: a vw approximation, deliberately a
           little under so the fitted size only ever grows into place. */
        <span className="ftmark__l ftmark__l--est" aria-hidden>
          {ONE_LINE}
        </span>
      ) : (
        lines.map((l) => (
          <span
            className="ftmark__l"
            key={l.text}
            style={{ fontSize: `${l.size}px` }}
            aria-hidden
          >
            {l.text}
          </span>
        ))
      )}
    </div>
  );
}
