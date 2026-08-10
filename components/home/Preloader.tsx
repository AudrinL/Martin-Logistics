"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/* Index-only curtain. It gates the hero so the entrance animation isn't spent
   behind an opaque overlay.

   The reduced-motion check reads matchMedia inline rather than going through
   the hook: this is a one-shot timeline, and a hook value that flips from
   false to true after mount would restart it mid-run. */
export default function Preloader({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const span = reduced ? 0.1 : 1;
      const counter = { v: 0 };

      gsap
        .timeline({
          onComplete: () => {
            setGone(true);
            onDone();
          },
        })
        .to(".pre__logo", { opacity: 1, duration: 0.45, ease: "power2.out" })
        .to(".pre__bar i", { right: "0%", duration: span, ease: "power2.inOut" }, 0.1)
        .to(
          counter,
          {
            v: 100,
            duration: span,
            ease: "power2.inOut",
            onUpdate: () => {
              if (pct.current) {
                pct.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
              }
            },
          },
          0.1,
        )
        .to(ref.current, { opacity: 0, duration: 0.5, ease: "power2.inOut" }, "+=0.1");
    },
    { scope: ref },
  );

  if (gone) return null;

  return (
    <div className="pre" id="pre" ref={ref}>
      <div className="pre__in">
        <img className="pre__logo" src="/assets/img/logo-light.png" alt="Martin Logistics" />
        <div className="pre__bar">
          <i />
        </div>
        <div className="pre__row">
          <span>Loading</span>
          <span id="prePct" ref={pct}>
            000
          </span>
        </div>
      </div>
    </div>
  );
}
