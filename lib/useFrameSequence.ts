"use client";

import { useEffect, useRef, type RefObject } from "react";

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/* Scrubbable numbered-WebP sequence on a canvas, cover-fitted and DPR aware.

   Frames arrive coarse-to-fine (every 8th, then 4th, 2nd, all) so the entire
   range is scrubbable almost immediately; until a given frame lands, the
   nearest decoded one is drawn instead. Loading them in order would mean the
   back half of the scroll is blank while the front half is perfect.

   Returns a ref holding `seek` rather than a plain function so ScrollTrigger's
   onUpdate always reaches the live closure without re-registering. */
export function useFrameSequence(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { count, path }: { count: number; path: string },
) {
  const seek = useRef<(p: number) => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const frames = new Array<HTMLImageElement | undefined>(count);
    const ready = new Array<boolean>(count);
    let shown = -1;
    let target = 0;
    let cancelled = false;

    const nearest = (i: number) => {
      if (ready[i]) return i;
      for (let r = 1; r < count; r++) {
        if (i - r >= 0 && ready[i - r]) return i - r;
        if (i + r < count && ready[i + r]) return i + r;
      }
      return -1;
    };

    const draw = (force = false) => {
      const idx = nearest(clamp(Math.round(target), 0, count - 1));
      if (idx < 0 || (idx === shown && !force)) return;
      shown = idx;
      const img = frames[idx]!;
      const cw = canvas.width;
      const ch = canvas.height;
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    };

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      draw(true);
    };

    const load = (i: number, done?: () => void) => {
      if (frames[i]) return;
      const img = new Image();
      img.decoding = "async";
      img.src = `${path}f${String(i).padStart(3, "0")}.webp`;
      frames[i] = img;
      img.onload = () => {
        if (cancelled) return;
        ready[i] = true;
        done?.();
      };
      img.onerror = () => done?.();
    };

    load(0, () => draw(true));

    const order: number[] = [];
    for (let step = 8; step >= 1; step = Math.floor(step / 2)) {
      for (let i = 0; i < count; i += step) if (!order.includes(i)) order.push(i);
      if (step === 1) break;
    }

    let qi = 0;
    let live = 0;
    const MAX = 6;
    const pump = () => {
      while (live < MAX && qi < order.length && !cancelled) {
        const i = order[qi++];
        if (frames[i]) continue;
        live++;
        load(i, () => {
          live--;
          draw();
          pump();
        });
      }
    };
    pump();

    size();
    window.addEventListener("resize", size);

    seek.current = (p: number) => {
      target = clamp(p, 0, 1) * (count - 1);
      draw();
    };

    return () => {
      cancelled = true;
      window.removeEventListener("resize", size);
      // Drop decode callbacks so a half-loaded sequence can't paint into a
      // canvas that has already left the page.
      frames.forEach((img) => {
        if (img) {
          img.onload = null;
          img.onerror = null;
        }
      });
    };
  }, [canvasRef, count, path]);

  return seek;
}
