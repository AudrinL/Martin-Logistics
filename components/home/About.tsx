"use client";

import Link from "next/link";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";
import Arrow from "@/components/ui/Arrow";

/* ───────────────────────────────────────────────────────────────────────────
   ABOUT — the company story on a scroll-driven timeline.

   This replaced three pillar cards. Cards state attributes — experience,
   infrastructure, reliability — which is what every haulier's site claims and
   none of them prove. The same facts in date order become an argument: a
   hardware importer got let down by other people's trucks, bought fifteen of
   its own, and ended up carrying the region's freight.

   The scroll behaviour is additive, never subtractive. Every entry is fully
   legible with no JavaScript at all — the spine is grey, the dots are grey,
   the copy is at reading contrast. Scrolling *adds* the yellow: each leg of
   the line fills as you pass it and each dot lights when its beat arrives.
   Written this way on purpose, because a reveal that hides content until a
   ScrollTrigger fires leaves the section blank when the trigger misses.

   The marker is its own grid column rather than a pseudo-element on the copy,
   which is what lets the line span the full height of a row in both layouts —
   at phone widths the year stacks above its entry and the same marker moves
   to the row's left edge, no second set of geometry to keep in sync.
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
    d: "Too much stock is sitting at port waiting on third-party carriers. The company buys its own trucks and starts hauling its own imports. The same year, partnerships take Martin Hardware to roughly 60% of Rwanda's tile market.",
  },
  {
    y: "2020",
    t: "The fleet starts carrying other people's freight.",
    d: "Agreements with Bolloré Transport & Logistics, JBL Logistics Group, Simba Cargo, R&M Logistics, Intelgraca, YITIYAN, OLIU Logistics and AGANZE Group turn a private fleet into a regional carrier.",
  },
  {
    y: "2025",
    t: "Two hundred and two units on the road.",
    d: "A hundred tractor units and a hundred and two trailers, with a standing commitment to add ten more of each every year — running Mombasa and Dar es Salaam into Kigali, and onward into the DRC.",
  },
  {
    y: "Today",
    t: "One operator, port to province.",
    d: "Transport, customs clearing and delivery sit with the same team, so a load crosses the border on the truck it was loaded on. One manifest, one schedule, one number to call.",
  },
];

export default function About() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const steps = gsap.utils.toArray<HTMLElement>(".abt__s");
      if (!steps.length) return;

      // Reduced motion gets the finished state, not the empty one — the yellow
      // line is information about where you are in the story, not decoration.
      if (reduced) {
        gsap.set(".abt__sf", { scaleY: 1 });
        steps.forEach((s) => s.classList.add("live"));
        return;
      }

      steps.forEach((step) => {
        /* The leg fills across the row's own scroll window, so the line is
           continuous: each segment finishes exactly where the next begins. */
        const fill = step.querySelector(".abt__sf");
        if (fill) {
          gsap.fromTo(
            fill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: {
                trigger: step,
                start: "top 78%",
                end: "bottom 72%",
                scrub: true,
              },
            },
          );
        }

        /* Dot and copy are a class flip rather than a tween — they have two
           states, not a range, and onLeaveBack lets the whole thing play
           backwards when you scroll up. */
        ScrollTrigger.create({
          trigger: step,
          start: "top 74%",
          onEnter: () => step.classList.add("live"),
          onLeaveBack: () => step.classList.remove("live"),
        });
      });
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

        <ol className="abt__tl">
          {STORY.map((s) => (
            <li className="abt__s" key={s.y}>
              <div className="abt__sy">{s.y}</div>
              <div className="abt__sm" aria-hidden>
                <i className="abt__sf" />
              </div>
              <div className="abt__sc">
                <h3 className="h h3 abt__sh">{s.t}</h3>
                <p className="abt__sd">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

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
