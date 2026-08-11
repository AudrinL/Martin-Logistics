"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useCoarsePointer, useReducedMotion } from "@/lib/hooks";
import Arrow from "@/components/ui/Arrow";

/* ───────────────────────────────────────────────────────────────────────────
   GLASS HERO — the primary hero.

   A luminous field with frosted panels floating in front of it. The whole
   thing is built on one idea: glass is only glass if there is something behind
   it worth bending. So the backdrop is a slow aurora of brand-warm blobs, and
   every panel is a real backdrop-filter over it — no painted-on "glass" fills,
   which is what makes most glassmorphism read as a sticker.

   Three depth planes, moved at different rates by the pointer: aurora (slow),
   slab (medium), chips (fast). Parallax alone would be a gimmick; what sells
   the material is the specular — a highlight that tracks the cursor across
   each panel's own surface, so the light source stays consistent between
   panels that are moving at different speeds.

   Kept deliberately light. The nav sits transparent over this section with ink
   type, so a dark hero here would break the header on the most important
   screen of the site.
   ─────────────────────────────────────────────────────────────────────────── */

const CHIPS = [
  { v: "1,620", u: "km", l: "Mombasa → Kigali" },
  { v: "202", u: "units", l: "Tractors & trailers" },
  { v: "2", u: "ports", l: "Mombasa · Dar es Salaam" },
];

export default function GlassHero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      // Entrance. Runs off its own clock so the hero never opens on a blank
      // frame, and the panels arrive with a little depth rather than fading.
      const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
      intro
        .from(".gh__blob", { scale: 0.7, opacity: 0, duration: 1.6, stagger: 0.12 })
        .from(
          ".gh__slab",
          { y: 46, opacity: 0, filter: "blur(14px)", duration: 1.25 },
          "-=1.15",
        )
        .from(".gh__eyebrow", { y: 16, opacity: 0, duration: 0.8 }, "-=0.75")
        .from(".gh__word", { yPercent: 118, duration: 1.05, stagger: 0.07 }, "-=0.6")
        .from(".gh__sub", { y: 18, opacity: 0, duration: 0.85 }, "-=0.65")
        .from(".gh__acts", { y: 18, opacity: 0, duration: 0.85 }, "-=0.7")
        .from(
          ".gh__chip",
          { y: 26, opacity: 0, scale: 0.94, duration: 0.9, stagger: 0.1 },
          "-=0.7",
        )
        .from(".gh__cue", { opacity: 0, duration: 0.9 }, "-=0.5");

      if (reduced || coarse) return;

      /* Pointer. Two jobs: move the depth planes, and place the specular on
         each panel. The planes are tweened (they want easing and momentum);
         the specular is written straight to custom properties, because a
         highlight that eases behind the cursor looks like a smear rather than
         a reflection. */
      const planes = [
        { sel: ".gh__aurora", amt: 14 },
        { sel: ".gh__slab", amt: 26 },
        { sel: ".gh__chip", amt: 46 },
      ].map((p) => ({
        ...p,
        x: gsap.quickTo(p.sel, "x", { duration: 1.1, ease: "power3.out" }),
        y: gsap.quickTo(p.sel, "y", { duration: 1.1, ease: "power3.out" }),
      }));

      const glass = gsap.utils.toArray<HTMLElement>(".gh__glass");

      const onMove = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        const nx = (e.clientX - b.left) / b.width - 0.5;
        const ny = (e.clientY - b.top) / b.height - 0.5;

        for (const p of planes) {
          p.x(-nx * p.amt);
          p.y(-ny * p.amt);
        }

        /* Each panel gets the pointer in its *own* box. A single shared
           coordinate would put the highlight in the same relative spot on
           every panel, which reads as three lights instead of one. */
        for (const g of glass) {
          const r = g.getBoundingClientRect();
          g.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
          g.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
        }
      };

      const onLeave = () => {
        for (const p of planes) {
          p.x(0);
          p.y(0);
        }
        for (const g of glass) {
          g.style.setProperty("--mx", "50%");
          g.style.setProperty("--my", "0%");
        }
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root, dependencies: [reduced, coarse] },
  );

  return (
    <section className="gh" ref={root}>
      {/* Backdrop — the thing the glass has to bend. */}
      <div className="gh__aurora" aria-hidden>
        <i className="gh__blob gh__blob--a" />
        <i className="gh__blob gh__blob--b" />
        <i className="gh__blob gh__blob--c" />
        <i className="gh__blob gh__blob--d" />
      </div>
      <div className="gh__mesh" aria-hidden />

      <div className="gh__in">
        <div className="gh__slab gh__glass">
          <p className="gh__eyebrow">
            <span className="gh__dot" />
            Martin Hardware Ltd — Logistics &amp; Transport
          </p>

          <h1 className="gh__h">
            <span className="gh__mask">
              <span className="gh__word">Port to province,</span>
            </span>
            <span className="gh__mask">
              <span className="gh__word">
                in one <em>unbroken</em> line.
              </span>
            </span>
          </h1>

          <p className="gh__sub">
            A hundred tractor units and a hundred and two trailers running
            Mombasa and Dar es Salaam into Kigali — then onward into the DRC.
            One operator, one manifest, one number to call.
          </p>

          <div className="gh__acts">
            <Link href="/contact" className="btn btn--fill">
              <span>Get a quote</span>
              <Arrow />
            </Link>
            <Link href="/fleet" className="gh__ghost gh__glass">
              <span>See the fleet</span>
              <Arrow />
            </Link>
          </div>
        </div>

        <ul className="gh__chips">
          {CHIPS.map((c) => (
            <li className="gh__chip gh__glass" key={c.l}>
              <b>
                {c.v}
                <i>{c.u}</i>
              </b>
              <span>{c.l}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="gh__cue" aria-hidden>
        <span>Scroll</span>
        <i />
      </div>
    </section>
  );
}
