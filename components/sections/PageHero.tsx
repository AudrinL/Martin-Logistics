import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import type { ReactNode } from "react";

/* The masthead every interior page opens with. `title` takes nodes so pages
   can keep their authored line breaks. */
export default function PageHero({
  crumb,
  kick,
  title,
  sub,
  children,
}: {
  crumb: string;
  kick: string;
  title: ReactNode;
  sub: string;
  /** Extra content inside the hero's wrap — the fleet stat row, for example. */
  children?: ReactNode;
}) {
  return (
    <section className="phero ink">
      <div className="wrap">
        <div className="phero__crumb fade">
          <Link href="/">Index</Link> — {crumb}
        </div>
        <div className="kick fade">{kick}</div>
        <Reveal as="h1" className="h h1 phero__t">
          {title}
        </Reveal>
        <p className="lede phero__s rise">{sub}</p>
        {children}
      </div>
    </section>
  );
}
