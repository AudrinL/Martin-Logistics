import Link from "next/link";
import Arrow from "@/components/ui/Arrow";

/* ───────────────────────────────────────────────────────────────────────────
   ABOUT — the company as a story, on a timeline.

   This replaced three pillar cards. Cards state attributes — experience,
   infrastructure, reliability — which is what every haulier's site claims and
   none of them prove. The same facts arranged in order become an argument
   instead: a hardware importer got let down by other people's trucks, bought
   fifteen of its own, and ended up carrying the region's freight. The dates
   are the proof, so the dates lead.

   Five beats, condensed from the full timeline on /about. The spine is drawn
   with a pseudo-element rather than a border so the last leg can fade out —
   a line that stops dead under the final dot reads as a truncated list.
   ─────────────────────────────────────────────────────────────────────────── */

const STORY = [
  {
    y: "2012",
    t: "A hardware business, not a haulier.",
    d: "Madam Cecile Uwiduhaye founds Martin Hardware Ltd, importing wall and floor tiles, house glass and sanitaryware into Rwanda. Head office in Gasabo, branches in Gisozi and Kimironko.",
  },
  {
    y: "2015",
    t: "Fifteen trucks, bought out of frustration.",
    d: "Too much stock is sitting at port waiting on third-party carriers. The company buys its own trucks and starts hauling its own imports. The same year, partnerships take Martin Hardware to roughly 60% of Rwanda's tile market.",
  },
  {
    y: "2020",
    t: "The fleet starts carrying other people's freight.",
    d: "Agreements with Bolloré Transport & Logistics, JBL Logistics Group, Simba Cargo, R&M Logistics, Intelgraca, YITIYAN, OLIU Logistics and AGANZE Group turn a private fleet into a regional carrier.",
  },
  {
    y: "2025",
    t: "Two hundred and two units on the road.",
    d: "A hundred tractor units and a hundred and two trailers, with a standing commitment to add ten more of each every year — running Mombasa and Dar es Salaam into Kigali, and onward into the DRC.",
  },
  {
    y: "Today",
    t: "One operator, port to province.",
    d: "Transport, customs clearing and delivery sit with the same team, so a load crosses the border on the truck it was loaded on. One manifest, one schedule, one number to call.",
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
                section reads as unlabelled. */}
            <div className="kick kick--lg">Who we are</div>
            <h2 className="h h-d abt__t">About us</h2>
            <p className="h h3 abt__st">
              The logistics arm of Martin Hardware Ltd.
            </p>
          </div>
          <p className="lede abt__l rise">
            We did not set out to be a transport company. We set out to get our
            own cargo off the port on time — and built the fleet that made it
            possible. Thirteen years later that fleet carries the region&apos;s
            freight as readily as our own.
          </p>
        </div>

        <ol className="abt__tl">
          {STORY.map((s) => (
            <li className="abt__s rise" key={s.y}>
              <div className="abt__sy">{s.y}</div>
              <div className="abt__sc">
                <h3 className="h h3 abt__sh">{s.t}</h3>
                <p className="abt__sd">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="abt__foot fade">
          <Link href="/about" className="btn btn--line">
            <span>The full story</span>
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
