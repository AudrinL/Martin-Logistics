"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import Arrow from "@/components/ui/Arrow";
import Preloader from "@/components/home/Preloader";
import DustField from "@/components/three/DustField";

const CAPS = [
  { leg: "Leg 01 — Kenya", line: "Loaded at Mombasa Port." },
  { leg: "Leg 02 — Border", line: "Cleared at Gatuna, one desk, one team." },
  { leg: "Leg 03 — Rwanda", line: "Kigali by morning. Then every province." },
];

const CROSS_IN = 0.05; // truck starts moving
const CROSS_OUT = 0.99; // still clearing frame as the section hands over

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

export default function Stage() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const rig = useRef<HTMLDivElement>(null);
  const odo = useRef<HTMLSpanElement>(null);
  const prog = useRef<HTMLElement>(null);

  const [booted, setBooted] = useState(false);
  const [cap, setCap] = useState(0);
  const [dustOn, setDustOn] = useState(false);
  const scroll = useRef(0);
  const reduced = useReducedMotion();

  // Only run the WebGL loop while the hero is actually on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setDustOn(e.isIntersecting),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!booted) return;

      // Entrance runs off its own clock, not scroll, so the page never opens
      // on a blank frame if the visitor lands mid-document.
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".stage__kick", { opacity: 0, y: 12, duration: 0.8 })
        .from(".stage__h", { opacity: 0, y: 22, duration: 1.1 }, "-=0.5")
        .to(".stage__h em", { "--mark": 1, duration: 0.9, ease: "power3.inOut" }, "-=0.5")
        .from(".stage__foot", { opacity: 0, y: 16, duration: 0.9 }, "-=0.7")
        .from(".stage__odo", { opacity: 0, duration: 0.9 }, "-=0.8");

      if (reduced) return;

      /* At rest the truck holds the composition of the source photograph — cab
         right of centre, air to its left. Scroll drives it left until it has
         fully left the frame. Width is owned by CSS (--truck-w) and never
         touched here, so the truck cannot zoom or shift perspective mid-run. */
      const from = () => {
        const f =
          parseFloat(
            getComputedStyle(pin.current!).getPropertyValue("--truck-rest"),
          ) || 0.38;
        return window.innerWidth * f;
      };
      const to = () => -((rig.current?.offsetWidth ?? 0) + 40);

      const place = (p: number) => {
        const t = clamp((p - CROSS_IN) / (CROSS_OUT - CROSS_IN), 0, 1);
        gsap.set(rig.current, { x: lerp(from(), to(), t) });

        // Per-frame values stay off React state — textContent and style are
        // cheaper than a re-render sixty times a second.
        if (prog.current) prog.current.style.width = `${(p * 100).toFixed(2)}%`;
        if (odo.current) odo.current.textContent = Math.round(t * 1730).toLocaleString();

        // The caption index changes about three times across the whole scroll,
        // so it is cheap enough to be real state.
        setCap(clamp(Math.floor(t * CAPS.length), 0, CAPS.length - 1));
        scroll.current = p;
      };

      gsap.set(rig.current, { x: from() });
      place(0);

      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        invalidateOnRefresh: true,
        onRefresh: (self) => place(self.progress),
        onUpdate: (self) => place(self.progress),
      });

      // The headline recedes but never leaves — once the truck is gone it is
      // the only thing holding the frame, so it must not drop to nothing.
      gsap.to(".stage__type", {
        opacity: 0.42,
        y: -16,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "50% top",
          end: "80% top",
          scrub: 0.5,
        },
      });
    },
    { scope: root, dependencies: [booted, reduced] },
  );

  return (
    <>
      <Preloader onDone={() => setBooted(true)} />

      <section className="stage" id="stage" ref={root}>
        <div className="stage__pin" ref={pin}>
          <div className="stage__haze" />
          <div className="stage__road" />

          <DustField scroll={scroll} active={dustOn} />

          {/* Scale is fixed in CSS; JS only ever translates this on X. */}
          <div className="stage__rig" id="rig" ref={rig}>
            <img
              className="stage__shadow"
              src="/assets/img/hero-truck-shadow.webp"
              alt=""
              aria-hidden
            />
            <img
              className="stage__truck"
              src="/assets/img/hero-truck.webp"
              alt="Martin Logistics tractor unit hauling a forty-foot Twyford container"
            />
          </div>

          <div className="stage__edges" />

          <div className="stage__type">
            <div className="stage__kick">
              Martin Hardware Ltd — Logistics &amp; Transport
            </div>
            <h1 className="stage__h">
              <span>Every tonne we carry</span>
              <br />
              <em>
                <span>moves Rwanda.</span>
              </em>
            </h1>
          </div>

          <div className="stage__caps" id="caps">
            {CAPS.map((c, i) => (
              <div
                key={c.leg}
                className={`stage__cap${i === cap ? " on" : ""}`}
              >
                <b>{c.leg}</b>
                <span>{c.line}</span>
              </div>
            ))}
          </div>

          <div className="stage__odo">
            <b>
              <span data-odo ref={odo}>
                0
              </span>{" "}
              km
            </b>
            <i>Mombasa → Kigali</i>
          </div>

          <div className="stage__foot">
            <div className="stage__acts">
              <Link href="/contact" className="btn btn--fill">
                <span>Move something</span>
                <Arrow />
              </Link>
              <Link href="/fleet" className="btn btn--line">
                <span>The fleet</span>
                <Arrow />
              </Link>
            </div>
            <div className="stage__cue">
              Scroll <i />
            </div>
          </div>

          <div className="stage__prog">
            <i ref={prog} />
          </div>
        </div>
      </section>
    </>
  );
}
