/* Register plugins exactly once, on the client.
   Importing gsap/ScrollTrigger from here everywhere else means no component
   has to remember to call registerPlugin, and no component registers twice. */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export { gsap, ScrollTrigger, useGSAP };
