"use client";

import {
  Children,
  isValidElement,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/hooks";

/* Masked word reveal.

   The static site split these headings by rewriting innerHTML at boot. Doing
   that here would mean mutating server-rendered nodes behind React's back and
   a visible reflow on first paint, so the split happens in JSX instead: the
   markup ships already split and GSAP only ever touches transforms.

   `.w` is the overflow-hidden mask and `.w > i` is the part that slides —
   that pairing is what globals.css styles, so keep it. */

type Props = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  as?: "h1" | "h2" | "h3" | "p" | "div" | "span";
};

function splitToWords(children: ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  let key = 0;

  const pushWord = (content: ReactNode) => {
    out.push(
      <span className="w" key={key++}>
        <i>{content}</i>
      </span>,
    );
    out.push(" ");
  };

  Children.toArray(children).forEach((node) => {
    if (typeof node === "string" || typeof node === "number") {
      String(node)
        .split(/\s+/)
        .filter(Boolean)
        .forEach(pushWord);
    } else if (isValidElement(node) && node.type === "br") {
      out.push(<br key={key++} />);
    } else {
      // Anything richer (an <em>, a link) travels as one indivisible word.
      pushWord(node);
    }
  });

  return out;
}

export default function Reveal({
  children,
  className = "",
  style,
  as = "h2",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const Tag = as;

  useGSAP(
    () => {
      const words = ref.current?.querySelectorAll(".w > i");
      if (!words?.length) return;

      if (reduced) {
        gsap.set(words, { yPercent: 0 });
        return;
      }

      gsap.set(words, { yPercent: 110 });
      gsap.to(words, {
        yPercent: 0,
        duration: 0.95,
        ease: "expo.out",
        stagger: 0.03,
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true },
      });
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <Tag ref={ref as never} className={`${className} rv`.trim()} style={style}>
      {splitToWords(children)}
    </Tag>
  );
}
