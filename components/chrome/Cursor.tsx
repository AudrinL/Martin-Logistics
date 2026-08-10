"use client";

import { useEffect, useRef } from "react";
import { useCoarsePointer } from "@/lib/hooks";

const HOVER_TARGETS = "a,button,.svc__row,.rail__card";

/* The dot trails the pointer with a lerp and swells over anything clickable.

   The static site bound mouseenter/mouseleave to every matching element once
   at boot. That can't survive client-side routing — the next page's links
   never get listeners. Delegating from the document fixes it for free, and
   also covers anything rendered later. */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const coarse = useCoarsePointer();

  useEffect(() => {
    const el = ref.current;
    if (!el || coarse) return;

    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let cx = tx;
    let cy = ty;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const onOver = (e: PointerEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_TARGETS)) el.classList.add("big");
    };
    const onOut = (e: PointerEvent) => {
      if ((e.target as Element)?.closest?.(HOVER_TARGETS)) el.classList.remove("big");
    };

    const loop = () => {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      el.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener("mousemove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
    };
  }, [coarse]);

  if (coarse) return null;
  return <div className="cur" ref={ref} />;
}
