"use client";

import { useEffect } from "react";
import { animate } from "motion/react";

/* Springy press on every pill button.

   Buttons appear in the nav, the footer CTA, every page hero and inside
   server-rendered sections, so turning each one into a <motion.a> would mean
   marking half the tree "use client" for a 120ms scale. Delegating one
   pointer handler keeps those sections on the server and still uses the same
   Motion spring engine. */
export default function Micro() {
  useEffect(() => {
    const btn = (e: Event) =>
      (e.target as Element)?.closest?.(".btn") as HTMLElement | null;

    const down = (e: PointerEvent) => {
      const el = btn(e);
      if (el) animate(el, { scale: 0.965 }, { duration: 0.12 });
    };

    const up = (e: PointerEvent) => {
      const el = btn(e);
      if (el) animate(el, { scale: 1 }, { type: "spring", stiffness: 420, damping: 18 });
    };

    document.addEventListener("pointerdown", down);
    document.addEventListener("pointerup", up);
    document.addEventListener("pointercancel", up);

    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", up);
    };
  }, []);

  return null;
}
