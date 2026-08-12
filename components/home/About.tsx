import Link from "next/link";
import Arrow from "@/components/ui/Arrow";

/* ───────────────────────────────────────────────────────────────────────────
   ABOUT — who Martin Logistics is, in three cards.

   The page runs on ink from the globe down, so these panels lift off it by one
   step (--ink-2) rather than inverting to paper: a paper block this early would
   fight the hero for the eye.

   No pointer effects. The palette is three colours on purpose, and a card that
   lights up under the cursor is a fourth thing happening — the hierarchy here
   is carried by type and space, with yellow used once per card as punctuation.
   Hover is a state change, not an event: the surface steps up, the border
   warms, and the rule beside the index extends. Nothing tracks the mouse, so
   this needs no client JS at all and ships as a server component.
   ─────────────────────────────────────────────────────────────────────────── */

const PILLARS = [
  {
    no: "01",
    k: "Experience",
    h: "Ten years of the same corridor.",
    body: "Martin Hardware began importing tiles and glass into Kigali in 2012. By 2015 we had stopped waiting on other people's trucks and started running our own — the same ports, the same borders, every week since.",
  },
  {
    no: "02",
    k: "Infrastructure",
    h: "A fleet, a yard, a warehouse.",
    body: "A hundred tractor units and a hundred and two trailers, with ten more of each joining every year — backed by our own yard, workshop and distribution warehouse rather than hired capacity.",
  },
  {
    no: "03",
    k: "Reliability",
    h: "One operator, end to end.",
    body: "Transport and customs sit with the same team, so a load clears the border on the truck it was loaded on. One manifest, one schedule, one number to call when you want to know where it is.",
  },
];

export default function About() {
  return (
    <section className="bay ink abt" id="about">
      <div className="wrap">
        <div className="abt__head">
          <div>
            {/* No Reveal, no .fade on the title or its kicker. Both are the
                section's label — the thing a visitor scans for — and a masked
                word reveal only works if its ScrollTrigger fires. When it does
                not, the type is in the DOM but parked out of frame and the
                section reads as unlabelled. Not worth the risk for two lines;
                the cards below still animate in. */}
            <div className="kick kick--lg">Who we are</div>
            <h2 className="h h-d abt__t">About us</h2>
            <p className="h h3 abt__st">
              The logistics arm of Martin Hardware Ltd.
            </p>
          </div>
          <p className="lede abt__l rise">
            We started as a hardware importer that got tired of missed
            deliveries, and built the fleet we wished existed. Today that fleet
            carries the region&apos;s freight as readily as our own — port to
            province, on trailers we own and drivers we employ.
          </p>
        </div>

        <div className="abt__g">
          {PILLARS.map((p) => (
            <article className="abt__c rise" key={p.no}>
              <div className="abt__no">
                <span>{p.no}</span>
                <i />
                {p.k}
              </div>
              <h3 className="h h3 abt__ct">{p.h}</h3>
              <p className="abt__cb">{p.body}</p>
            </article>
          ))}
        </div>

        <div className="abt__foot fade">
          <Link href="/about" className="btn btn--line">
            <span>More about us</span>
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
