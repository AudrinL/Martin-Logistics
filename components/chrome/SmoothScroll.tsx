"use client";

import { ReactLenis, type LenisRef } from "lenis/react";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

/* Lenis and ScrollTrigger both want to own the frame loop. The fix is to let
   neither: Lenis runs with autoRaf off and GSAP's ticker drives it, so scroll
   position and every scrubbed animation are computed in the same frame. Two
   independent loops is what produces that half-frame jitter on scrub. */
export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<LenisRef>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const lenis = ref.current?.lenis;
    if (!lenis) return;

    // Honour the OS setting by parking Lenis rather than unmounting it —
    // tearing the provider out mid-session would remount the whole tree.
    if (reduced) {
      lenis.stop();
      return;
    }
    lenis.start();

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
    };
  }, [reduced]);

  return (
    <ReactLenis
      root
      ref={ref}
      options={{
        autoRaf: false,
        duration: 1.05,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        syncTouch: false,
      }}
    >
      {children}
    </ReactLenis>
  );
}
