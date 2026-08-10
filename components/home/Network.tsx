"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { createNetworkRenderer, LEGS, type MapData } from "@/lib/networkMap";

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
      fetch("/assets/africa-dots.json").then((res) => res.json() as Promise<MapData>),
      document.fonts.ready,
    ]).then(([data]) => {
      if (alive) r.setData(data);
    });

    window.addEventListener("resize", r.resize);
    return () => {
      alive = false;
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
            <div className="kick">The network</div>
            <h2 className="h h2 net__title">
              Two ports.
              <br />
              One corridor.
            </h2>
            <p className="net__lede">
              Cargo lands at Mombasa or Dar es Salaam and reaches Kigali on our own
              trailers — then keeps going, west into the DRC and out to every
              province.
            </p>
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
