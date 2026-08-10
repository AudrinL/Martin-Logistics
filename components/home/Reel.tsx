"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import { useFrameSequence } from "@/lib/useFrameSequence";

/* The frame sequence that carries the site from the paper world into the dark
   one. Scrubbing it is the transition — there is no crossfade between
   sections, the footage itself does the work. */
export default function Reel() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const seek = useFrameSequence(canvas, { count: 120, path: "/assets/seq/" });

  useGSAP(
    () => {
      if (reduced) {
        seek.current(0.5);
        return;
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.4,
        onUpdate: (self) => seek.current(self.progress),
      });

      gsap.from(".reel__in", {
        opacity: 0,
        y: 26,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "28% top",
          scrub: 0.6,
        },
      });
      gsap.to(".reel__in", {
        opacity: 0,
        y: -26,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "68% top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="reel" id="reel" ref={root}>
      <div className="reel__pin">
        <canvas className="reel__canvas" ref={canvas} aria-hidden />
        <div className="reel__veil" />
        <div className="reel__grain" />
        <div className="reel__in">
          <div className="kick" style={{ justifyContent: "center" }}>
            On the corridor
          </div>
          <h2 className="h h2 reel__h" style={{ marginTop: 20 }}>
            1,730 kilometres of road, run on schedule.
          </h2>
          <p className="reel__sub">
            Between the Indian Ocean and the highlands there is one thing that
            matters: that the truck keeps moving, and someone answers when you
            call.
          </p>
        </div>
      </div>
    </section>
  );
}
