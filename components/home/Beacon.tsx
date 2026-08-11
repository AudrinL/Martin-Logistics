"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useCoarsePointer, useReducedMotion } from "@/lib/hooks";
import Arrow from "@/components/ui/Arrow";

/* ───────────────────────────────────────────────────────────────────────────
   BEACON — the night-run hero.

   The whole section is a black plate. The photograph of the corridor and the
   solid cut of the headline both exist only inside a soft circular beam that
   follows the pointer, so reading this section means sweeping a headlight
   across a dark road to find what is on it. The ghost of the headline is
   always there in outline, which is what makes the lit version feel like an
   answer rather than a reveal gimmick.

   One shared beam, expressed as three custom properties on the stage element
   (--bx, --by, --br) and consumed by two masked layers. Driving it through
   variables rather than animating each layer keeps the photograph and the type
   locked to the same light — if they drift apart by even a frame the illusion
   reads as two effects instead of one.

   The pointer sets a target and a single rAF lerps toward it. That lag is the
   entire feel of the thing: a beam that snaps to the cursor reads as a CSS
   trick, one that trails by a few frames reads as a lamp with weight.
   ─────────────────────────────────────────────────────────────────────────── */

const LINES = ["We move while", "the continent", "sleeps."];

export default function Beacon() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const clock = useRef<HTMLSpanElement>(null);
  const cta = useRef<HTMLAnchorElement>(null);

  const reduced = useReducedMotion();
  const coarse = useCoarsePointer();

  /* Kigali runs CAT year round, so the offset is fixed and there is no DST to
     track. Rendered empty on the server — a live clock in the markup is a
     guaranteed hydration mismatch. */
  useEffect(() => {
    const tick = () => {
      if (!clock.current) return;
      clock.current.textContent = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Kigali",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const el = stage.current;
      if (!el) return;

      /* setProperty rather than gsap.quickSetter: quickSetter has no path for
         CSS custom properties — it writes them straight onto the element
         object, where nothing reads them, and the beam silently never moves.
         A direct write is also the cheaper call in a per-frame loop. */
      const set = {
        x: (v: number) => el.style.setProperty("--bx", `${v}px`),
        y: (v: number) => el.style.setProperty("--by", `${v}px`),
        r: (v: number) => el.style.setProperty("--br", `${v}px`),
      };

      /* 0.42 of the short edge put the beam across 84% of a narrow viewport,
         which reveals nearly the whole plate at once — the section stops being
         a thing you search and becomes a photo with a vignette. */
      const base = () => Math.min(el.clientWidth, el.clientHeight) * 0.27;

      /* Hand the lit heading its offset inside the stage so its mask can be
         corrected back into stage space. Measured, not assumed — the block
         moves with every clamp() in the type scale. */
      const lit = el.querySelector<HTMLElement>(".bcn__h--lit");
      const placeLit = () => {
        if (!lit) return;
        const a = el.getBoundingClientRect();
        const b = lit.getBoundingClientRect();
        lit.style.setProperty("--ox", `${b.left - a.left}px`);
        lit.style.setProperty("--oy", `${b.top - a.top}px`);
      };
      placeLit();

      /* Reduced motion still gets the composition, just lit: a wide static
         beam over the middle. Killing the effect entirely would leave a black
         box with outlined type, which is worse than no effect at all. */
      if (reduced) {
        set.x(el.clientWidth / 2);
        set.y(el.clientHeight / 2);
        set.r(Math.max(el.clientWidth, el.clientHeight) * 0.9);
        gsap.set(".bcn__line i, .bcn__kick, .bcn__sub, .bcn__acts", {
          opacity: 1,
          y: 0,
        });
        return;
      }

      let tx = el.clientWidth * 0.5;
      let ty = el.clientHeight * 0.46;
      let cx = tx;
      let cy = ty;
      let tr = 0;
      let cr = 0;
      let idle = coarse;   // no pointer to follow — drift instead
      let t = 0;

      const onMove = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        tx = e.clientX - b.left;
        ty = e.clientY - b.top;
        idle = false;
      };
      const onLeave = () => {
        idle = true;
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      let settle = 0;
      const frame = () => {
        // The block can shift for a few frames while fonts and layout settle.
        if (settle < 90) { settle++; placeLit(); }
        t += 0.005;
        if (idle) {
          // Lissajous, so the drift never repeats on an obvious loop.
          tx = el.clientWidth * (0.5 + 0.26 * Math.sin(t));
          ty = el.clientHeight * (0.46 + 0.2 * Math.sin(t * 1.37));
        }
        cx += (tx - cx) * 0.075;
        cy += (ty - cy) * 0.075;
        cr += (tr - cr) * 0.06;
        set.x(cx);
        set.y(cy);
        set.r(cr);
      };
      /* Own rAF rather than gsap.ticker. The ticker puts itself to sleep when
         no tweens are running, and a bare ticker.add callback does not keep it
         awake — the beam registered and then simply never got a frame. Owning
         the loop also means it can be parked when the section is off screen,
         which a ticker subscription cannot do. */
      let raf = 0;
      const loop = () => {
        frame();
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!raf) raf = requestAnimationFrame(loop);
          } else if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        },
        { threshold: 0 },
      );
      io.observe(root.current!);

      // The lamp comes up as the section lands, rather than being on already.
      const st = ScrollTrigger.create({
        trigger: root.current,
        start: "top 72%",
        once: true,
        onEnter: () => {
          tr = base();
          gsap
            .timeline({ defaults: { ease: "expo.out" } })
            .from(".bcn__kick", { opacity: 0, y: 14, duration: 0.9 })
            .from(
              ".bcn__line i",
              { opacity: 0, yPercent: 108, duration: 1.15, stagger: 0.09 },
              "-=0.55",
            )
            .from(".bcn__sub", { opacity: 0, y: 18, duration: 0.9 }, "-=0.7")
            .from(".bcn__acts", { opacity: 0, y: 18, duration: 0.9 }, "-=0.75")
            .from(".bcn__meta", { opacity: 0, duration: 1.1 }, "-=0.8");
        },
      });

      const onResize = () => {
        if (tr) tr = base();
        placeLit();
      };
      window.addEventListener("resize", onResize);

      /* The plate drifts against the scroll — a small amount, because the beam
         is already doing the work and two competing motions read as noise. */
      const par = gsap.to(".bcn__plate", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });

      /* Magnetic primary action. Scoped to a generous radius so it is felt
         before it is understood. */
      const btn = cta.current;
      let mag: ((e: PointerEvent) => void) | null = null;
      if (btn) {
        const qx = gsap.quickTo(btn, "x", { duration: 0.5, ease: "expo.out" });
        const qy = gsap.quickTo(btn, "y", { duration: 0.5, ease: "expo.out" });
        mag = (e: PointerEvent) => {
          const b = btn.getBoundingClientRect();
          const dx = e.clientX - (b.left + b.width / 2);
          const dy = e.clientY - (b.top + b.height / 2);
          const d = Math.hypot(dx, dy);
          const pull = d < 190 ? 1 - d / 190 : 0;
          qx(dx * 0.34 * pull);
          qy(dy * 0.34 * pull);
        };
        window.addEventListener("pointermove", mag);
      }

      return () => {
        io.disconnect();
        if (raf) cancelAnimationFrame(raf);
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("resize", onResize);
        if (mag) window.removeEventListener("pointermove", mag);
        st.kill();
        par.scrollTrigger?.kill();
      };
    },
    { scope: root, dependencies: [reduced, coarse] },
  );

  return (
    <section className="bcn" ref={root} aria-labelledby="bcn-h">
      <div className="bcn__stage" ref={stage}>
        <div className="bcn__plate">
          <div className="bcn__photo" />
        </div>
        <div className="bcn__rule" />
        <div className="bcn__grain" />

        <div className="bcn__in">
          <p className="bcn__kick">
            <span>Northern Corridor</span>
            <i />
            <span>Night run</span>
          </p>

          <div className="bcn__heads">
            <h2 className="bcn__h" id="bcn-h">
              {LINES.map((l) => (
                <span className="bcn__line" key={l}>
                  <i>{l}</i>
                </span>
              ))}
            </h2>
            {/* The lit cut. Purely presentational — the outlined heading above
                is the one in the accessibility tree. */}
            <div className="bcn__h bcn__h--lit" aria-hidden>
              {LINES.map((l) => (
                <span className="bcn__line" key={l}>
                  <i>{l}</i>
                </span>
              ))}
            </div>
          </div>

          <p className="bcn__sub">
            Mombasa to Kigali is 1,620 kilometres. Our drivers run it in relays,
            through the dark, so your cargo clears the border at first light.
          </p>

          <div className="bcn__acts">
            <Link href="/contact" className="btn btn--fill" ref={cta}>
              <span>Move something</span>
              <Arrow />
            </Link>
            <Link href="/fleet" className="btn btn--line">
              <span>See the fleet</span>
              <Arrow />
            </Link>
          </div>
        </div>

        <div className="bcn__meta">
          <span>01°56′S 30°03′E — Gasabo, Kigali</span>
          <span className="bcn__clock">
            CAT <span ref={clock} />
          </span>
        </div>
      </div>
    </section>
  );
}
