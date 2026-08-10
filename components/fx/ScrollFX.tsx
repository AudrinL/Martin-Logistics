"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

/* The page-wide effects that only ever touch transform/opacity: .rise, .fade,
   [data-par], [data-count], [data-marquee].

   These stay class-driven rather than becoming wrapper components because the
   stylesheet already positions the real elements — wrapping each one in an
   extra <div> would change what grid and flex rules apply to. Text splitting
   is the exception and lives in Reveal, since that genuinely needs new nodes.

   Keyed on pathname so a client-side navigation rescans the new page.

   revertOnUpdate is not optional here. useGSAP only reverts its context on
   unmount by default, and this component lives in the layout — it never
   unmounts while you browse. The .rise/.fade/counter triggers self-destruct
   via `once: true`, but the scrubbed [data-par] parallax does not, so without
   this every navigation left one live ScrollTrigger pointing at a detached
   section. */
export default function ScrollFX() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const rises = gsap.utils.toArray<HTMLElement>(".rise");
      const fades = gsap.utils.toArray<HTMLElement>(".fade");

      if (reduced) {
        gsap.set([...rises, ...fades], { opacity: 1, y: 0, clearProps: "transform" });
        return;
      }

      rises.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      fades.forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 94%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-par]").forEach((el) => {
        gsap.to(el, {
          yPercent: parseFloat(el.dataset.par || "10"),
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") || el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((el) => {
        const speed = parseFloat(el.dataset.marquee || "34");
        const track = el.querySelector(".marq__t, .tick__t");
        if (track) {
          gsap.to(track, {
            xPercent: -50,
            duration: speed,
            ease: "none",
            repeat: -1,
          });
        }
      });

      // Counters run once when they land. The tween drives a plain object and
      // writes textContent, so React never has to re-render mid-count.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = parseFloat(el.dataset.count || "0");
        const o = { v: 0 };
        ScrollTrigger.create({
          trigger: el,
          start: "top 94%",
          once: true,
          onEnter: () => {
            gsap.to(o, {
              v: to,
              duration: 1.7,
              ease: "power2.out",
              onUpdate: () => {
                el.textContent = String(Math.round(o.v));
              },
            });
          },
        });
      });

      // Page height is only final once images and pinned sections settle.
      ScrollTrigger.refresh();
    },
    { dependencies: [pathname, reduced], revertOnUpdate: true },
  );

  return <div ref={scope} hidden />;
}
