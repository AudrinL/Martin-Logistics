import Link from "next/link";
import Reveal from "@/components/fx/Reveal";
import Arrow from "@/components/ui/Arrow";
import { CONTACT, tel } from "@/lib/site";

/* Closing block on every page — the headline is the only part that varies. */
export default function Cta({
  head,
  parallax = -5,
}: {
  head: string;
  parallax?: number;
}) {
  return (
    <section className="bay cta">
      <img
        className="cta__truck"
        src="/assets/img/truck-side-twyford-02-cut.webp"
        alt=""
        data-par={parallax}
      />
      <div className="wrap cta__in">
        <Reveal as="h2" className="h h1 cta__t">
          {head}
        </Reveal>
        <div className="cta__acts">
          <Link href="/contact" className="btn btn--fill">
            <span>Request a quote</span>
            <Arrow />
          </Link>
          <a href={tel(CONTACT.phones[0])} className="btn btn--line">
            <span>{CONTACT.phones[0]}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
