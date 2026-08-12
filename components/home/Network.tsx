"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { createNetworkRenderer, LEGS, type MapData } from "@/lib/networkGlobe";
import Arrow from "@/components/ui/Arrow";

const LEG_ROWS = [
  { no: "Leg 01", city: "Mombasa", note: "Kenya · port of entry" },
  { no: "Leg 02", city: "Nairobi", note: "Transit" },
  { no: "Leg 03", city: "Dar es Salaam", note: "Tanzania · port of entry" },
  { no: "Leg 04", city: "Kigali", note: "Head office · Gasabo" },
  { no: "Leg 05", city: "DRC", note: "Onward distribution" },
];

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export default function Network() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const km = useRef<HTMLElement>(null);
  const renderer = useRef<ReturnType<typeof createNetworkRenderer> | null>(null);
  const [liveLeg, setLiveLeg] = useState(-1);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!canvas.current) return;
    const r = createNetworkRenderer(canvas.current);
    renderer.current = r;
    let alive = true;

    /* Wait on fonts as well as data. Canvas text silently draws in the
       fallback face if the webfont hasn't landed, and the city labels are
       set in the mono face at small sizes where the difference is obvious. */
    Promise.all([
      fetch("/assets/world-dots.json").then((res) => res.json() as Promise<MapData>),
      document.fonts.ready,
    ]).then(([data]) => {
      if (alive) r.setData(data);
    });

    window.addEventListener("resize", r.resize);

    /* The globe is grabbable. Pointer Events cover mouse, pen and touch in one
       path, and setPointerCapture is what keeps a drag alive when the cursor
       leaves the canvas mid-throw. touch-action is set in CSS so a horizontal
       drag doesn't also scroll the page out from under it. */
    const el = canvas.current;
    let last: { x: number; y: number } | null = null;

    const down = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY };
      el.setPointerCapture(e.pointerId);
      r.setIdleSpin(false);
    };
    const move = (e: PointerEvent) => {
      if (!last) return;
      r.drag(e.clientX - last.x, e.clientY - last.y);
      last = { x: e.clientX, y: e.clientY };
    };
    const up = (e: PointerEvent) => {
      if (!last) return;
      last = null;
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      r.endDrag();
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);

    /* Only spin while the section is on screen — an idle rAF behind three
       screens of scroll is pure waste. */
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? r.start() : r.stop()),
      { threshold: 0 },
    );
    io.observe(el);

    return () => {
      alive = false;
      io.disconnect();
      r.stop();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      window.removeEventListener("resize", r.resize);
    };
  }, []);

  useGSAP(
    () => {
      if (reduced) {
        renderer.current?.setProgress(1);
        setLiveLeg(LEGS.length);
        if (km.current) km.current.textContent = (3330).toLocaleString();
        return;
      }

      /* The hero copy enters on its own clock rather than on the scrub — the
         globe's arc is scroll-driven, but the headline has to be legible in
         the first frame the visitor sees, before they have scrolled at all. */
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".net__kick", { opacity: 0, y: 12, duration: 0.8 })
        .from(".net__title", { opacity: 0, y: 24, duration: 1.15 }, "-=0.52")
        .from(".net__lede", { opacity: 0, y: 18, duration: 0.9 }, "-=0.78")
        .from(".net__acts", { opacity: 0, y: 18, duration: 0.9 }, "-=0.72")
        .from(".net__legs", { opacity: 0, duration: 1 }, "-=0.7");

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          renderer.current?.setProgress(self.progress);

          const routeP = clamp((self.progress - 0.3) / 0.62, 0, 1);
          // React bails out when the index is unchanged, so this re-renders
          // about five times across the section, not once a frame.
          setLiveLeg(routeP > 0 ? Math.floor(routeP * LEGS.length) : -1);
          if (km.current) {
            km.current.textContent = Math.round(routeP * 3330).toLocaleString();
          }
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="net" id="net" ref={root}>
      <div className="net__stick">
        <canvas className="net__canvas" ref={canvas} aria-hidden />
        <div className="net__scrim" />

        <div className="net__ui">
          <div className="net__head">
            <div className="kick net__kick">
              Martin Hardware Ltd — Logistics &amp; Transport
            </div>
            <h1 className="h h1 net__title">
              Two ports.
              <br />
              One corridor.
              <br />
              <em>One operator.</em>
            </h1>
            <p className="net__lede">
              Cargo lands at Mombasa or Dar es Salaam and reaches Kigali on our
              own trailers — then keeps going, west into the DRC and out to
              every province. A hundred tractor units, a hundred and two
              trailers, one number to call.
            </p>
            <div className="net__acts">
              <Link href="/contact" className="btn btn--fill">
                <span>Get a quote</span>
                <Arrow />
              </Link>
              <Link href="/fleet" className="btn btn--line">
                <span>See the fleet</span>
                <Arrow />
              </Link>
            </div>
          </div>

          <dl className="net__legs">
            {LEG_ROWS.map((l, i) => (
              <div
                className={`net__leg${i <= liveLeg ? " live" : ""}`}
                key={l.no}
              >
                <dt>{l.no}</dt>
                <dd>
                  {l.city}
                  <small>{l.note}</small>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="net__readout">
          <b data-km ref={km}>
            0
          </b>
          Kilometres covered
        </div>
      </div>
    </section>
  );
}
