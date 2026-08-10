"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion } from "motion/react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import Arrow from "@/components/ui/Arrow";

const hover = { type: "spring", stiffness: 300, damping: 24 } as const;

/* Vertical scroll drives the track sideways. The section's own height is set
   to viewport + travel distance, so the browser scrollbar still represents
   the real amount of content — the rail doesn't steal scroll, it maps it. */
export default function Rail() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !track.current || !root.current) return;

      const distance = () => {
        const pad = parseFloat(getComputedStyle(track.current!).paddingRight) || 0;
        return Math.max(0, track.current!.scrollWidth - window.innerWidth + pad);
      };
      const sizeRail = () => {
        root.current!.style.height = `${window.innerHeight + distance()}px`;
      };
      sizeRail();

      gsap.to(track.current, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      ScrollTrigger.addEventListener("refreshInit", sizeRail);
      return () => ScrollTrigger.removeEventListener("refreshInit", sizeRail);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="rail" id="rail" ref={root}>
      <div className="rail__stick">
        <div className="rail__track" ref={track}>
          <div className="rail__intro">
            <div className="kick">The fleet</div>
            <h2 className="h h2" style={{ marginTop: 18 }}>
              202 units
              <br />
              on the road.
            </h2>
            <p className="lede" style={{ marginTop: 18, maxWidth: "32ch" }}>
              Tractor units, container chassis and flatbeds — maintained in our own
              yard and scheduled daily across the corridor.
            </p>
            <Link href="/fleet" className="btn btn--line" style={{ marginTop: 26 }}>
              <span>Full fleet</span>
              <Arrow />
            </Link>
          </div>

          <motion.article className="rail__card" whileHover={{ y: -8 }} transition={hover}>
            <div>
              <span className="rail__no">01 — Tractor unit</span>
              <h3 className="h h3 rail__h">Sinotruk Howo TX</h3>
            </div>
            <img
              className="rail__img"
              src="/assets/img/truck-tractor-only-cut.webp"
              alt="Sinotruk HOWO TX tractor unit with flatbed trailer, side profile"
            />
            <div className="rail__specs">
              <dl className="rail__spec">
                <dt>In service</dt>
                <dd>100</dd>
              </dl>
              <dl className="rail__spec">
                <dt>Drive</dt>
                <dd>6×4</dd>
              </dl>
            </div>
          </motion.article>

          <motion.article
            className="rail__card rail__card--y"
            whileHover={{ y: -8 }}
            transition={hover}
          >
            <div>
              <span className="rail__no">02 — Contract livery</span>
              <h3 className="h h3 rail__h">Your name on the box</h3>
            </div>
            <img
              className="rail__img"
              src="/assets/img/truck-side-twyford-02-cut.webp"
              alt="Container trailer in partner livery, side profile"
            />
            <div className="rail__specs">
              <dl className="rail__spec">
                <dt>Dedicated</dt>
                <dd>Routes</dd>
              </dl>
              <dl className="rail__spec">
                <dt>Since</dt>
                <dd>2015</dd>
              </dl>
            </div>
          </motion.article>

          <motion.article
            className="rail__card rail__card--ph"
            whileHover={{ y: -8 }}
            transition={hover}
          >
            <img
              src="/assets/img/truck-container-studio.webp"
              alt="Tractor unit hauling a forty-foot container"
            />
            <div className="rail__ph-body">
              <span className="rail__no">03 — Container chassis</span>
              <h3 className="h h3 rail__h">20ft &amp; 40ft skeletal</h3>
            </div>
          </motion.article>

          <motion.article
            className="rail__card rail__card--ph"
            whileHover={{ y: -8 }}
            transition={hover}
          >
            <img
              src="/assets/img/highway-sunset-a.webp"
              alt="Martin Logistics truck on the corridor at sunset"
            />
            <div className="rail__ph-body">
              <span className="rail__no">04 — On the corridor</span>
              <h3 className="h h3 rail__h">1,730 km, every week</h3>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
