"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import Arrow from "@/components/ui/Arrow";

/* ───────────────────────────────────────────────────────────────────────────
   ABOUT — the company story as a corridor.

   A vertical timeline was the obvious shape and the wrong one for this
   company: the whole business is a line running west from two ports. So the
   story runs the same way. Vertical scroll drives the track sideways, the road
   paves itself yellow behind you, and the milestones alternate above and below
   it so the eye zig-zags along the route instead of reading a column.

   Mechanically this is the same trick the fleet rail uses — section height set
   to viewport plus travel, sticky child, one scrubbed tween — so the scrollbar
   still represents the real amount of content. It maps scroll rather than
   stealing it, and there is only ever one ScrollTrigger: the paving, the
   marker and the year readout all ride its progress.

   Enhancement, not dependency. Without JavaScript the track is an ordinary
   horizontally scrollable row you can swipe; the `data-js` flag is what hands
   it over to the pin. Nothing is ever hidden waiting for a trigger to fire.
   ─────────────────────────────────────────────────────────────────────────── */

const STORY = [
  {
    y: "2012",
    t: "A hardware business, not a haulier.",
    d: "Madam Cecile Uwiduhaye founds Martin Hardware Ltd, importing wall and floor tiles, house glass and sanitaryware into Rwanda. Head office in Gasabo, branches in Gisozi and Kimironko.",
  },
  {
    y: "2015",
    t: "Fifteen trucks, bought out of frustration.",
    d: "Too much stock is sitting at port waiting on third-party carriers. The company buys its own trucks and starts hauling its own imports — and reaches roughly 60% of Rwanda's tile market the same year.",
  },
  {
    y: "2020",
    t: "The fleet starts carrying other people's freight.",
    d: "Agreements with Bolloré Transport & Logistics, JBL Logistics Group, Simba Cargo, R&M Logistics, Intelgraca, YITIYAN, OLIU Logistics and AGANZE Group turn a private fleet into a regional carrier.",
  },
  {
    y: "2025",
    t: "Two hundred and two units on the road.",
    d: "A hundred tractor units and a hundred and two trailers, with ten more of each joining every year — running Mombasa and Dar es Salaam into Kigali, and onward into the DRC.",
  },
  {
    y: "Today",
    t: "One operator, port to province.",
    d: "Transport, customs clearing and delivery sit with the same team, so a load crosses the border on the truck it was loaded on. One manifest, one schedule, one number to call.",
  },
];

export default function About() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLOListElement>(null);
  const paved = useRef<HTMLElement>(null);
  const year = useRef<HTMLElement>(null);
  const [live, setLive] = useState(0);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const r = rail.current;
      const t = track.current;
      if (!r || !t || reduced) return;

      // Hands the section from the scrollable fallback to the pinned version.
      root.current?.setAttribute("data-js", "on");

      const distance = () => {
        const pad = parseFloat(getComputedStyle(t).paddingRight) || 0;
        return Math.max(0, t.scrollWidth - window.innerWidth + pad);
      };
      const sizeRail = () => {
        r.style.height = `${window.innerHeight + distance()}px`;
      };
      sizeRail();

      gsap.to(t, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: r,
          start: "top top",
          end: () => `+=${distance()}`,
          scrub: 0.5,
          invalidateOnRefresh: true,
          /* One trigger drives everything on the frame: the paving is a
             transform, the year is written straight to the node, and only the
             milestone index goes through React — which bails out when it is
             unchanged, so this re-renders five times across the section rather
             than once a frame. */
          onUpdate: (self) => {
            const p = self.progress;
            if (paved.current) paved.current.style.transform = `scaleX(${p})`;

            const i = Math.min(STORY.length - 1, Math.floor(p * STORY.length));
            setLive(i);
            if (year.current) year.current.textContent = STORY[i].y;
          },
        },
      });

      ScrollTrigger.addEventListener("refreshInit", sizeRail);
      return () => ScrollTrigger.removeEventListener("refreshInit", sizeRail);
    },
    { scope: root, dependencies: [reduced] },
  );

  return (
    <section className="bay ink abt" id="about" ref={root}>
      <div className="wrap">
        <div className="abt__head">
          <div>
            {/* No masked reveal on the title or its kicker: both are the
                section's label, and a word mask only works if its trigger
                fires. When it does not, the type sits parked out of frame and
                the section reads as unlabelled. */}
            <div className="kick kick--lg">Who we are</div>
            <h2 className="h h-d abt__t">About us</h2>
            <p className="h h3 abt__st">
              The logistics arm of Martin Hardware Ltd.
            </p>
          </div>
          <p className="lede abt__l rise">
            We did not set out to be a transport company. We set out to get our
            own cargo off the port on time — and built the fleet that made it
            possible. Thirteen years later that fleet carries the region&apos;s
            freight as readily as our own.
          </p>
        </div>
      </div>

      <div className="abt__rail" ref={rail}>
        <div className="abt__stick">
          <div className="abt__road" aria-hidden>
            <i className="abt__paved" ref={paved} />
          </div>

          <ol className="abt__track" ref={track}>
            {STORY.map((s, i) => (
              <li
                className={`abt__s abt__s--${i % 2 ? "b" : "a"}${
                  i <= live ? " live" : ""
                }`}
                key={s.y}
              >
                <div className="abt__sc">
                  <div className="abt__sy">{s.y}</div>
                  <h3 className="h h3 abt__sh">{s.t}</h3>
                  <p className="abt__sd">{s.d}</p>
                </div>
                <i className="abt__stem" aria-hidden />
                <i className="abt__dot" aria-hidden />
              </li>
            ))}
          </ol>

          <div className="abt__meta" aria-hidden>
            <b ref={year}>2012</b>
            Milestone
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="abt__foot fade">
          <Link href="/about" className="btn btn--line">
            <span>The full story</span>
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
