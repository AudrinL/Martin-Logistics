"use client";

import { useEffect, useState } from "react";

/* These both start `false` on purpose. The server has no media queries, so
   returning the real value on first client render would produce a hydration
   mismatch. Everything that reads them must therefore treat "false" as "not
   known yet" and degrade to the full-motion path, which is the safe default. */

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/** True when the visitor has asked the OS to reduce motion. */
export const useReducedMotion = () =>
  useMediaQuery("(prefers-reduced-motion: reduce)");

/** True on touch devices — used to drop the custom cursor and hover peek. */
export const useCoarsePointer = () => useMediaQuery("(pointer: coarse)");
