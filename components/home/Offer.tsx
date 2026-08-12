import Link from "next/link";
import Arrow from "@/components/ui/Arrow";

/* ───────────────────────────────────────────────────────────────────────────
   OUR SERVICES — one large statement, then a tiled grid.

   This replaces an accordion. Seven collapsed rows meant the section was
   mostly empty space at rest and the visitor had to click seven times to learn
   what the company does — the work was hidden behind an interaction nobody
   asked for. Everything is on the page now, and the grid does the ordering.

   The heading is the size the section deserves. The page's own rule is that
   scale is earned rather than assumed, and this is the one place on the home
   page where the company states its offer outright, so it gets the display
   step. The single yellow full stop is the only colour in the header.

   Nine cells, three rows: the lead service spans two columns because it is the
   one most people arrive for, the remaining six sit one-up, and the ninth is
   the quote tile — the CTA lands inside the grid rather than being bolted
   underneath it.
   ─────────────────────────────────────────────────────────────────────────── */

const SERVICES = [
  {
    no: "01",
    t: "Freight & transportation",
    d: "Full-load and part-load haulage across Rwanda, the DRC and East Africa — on corridors we already run every week, with trailers sized to the cargo rather than to whatever was free that morning.",
    p: ["Full truckload & part-load", "Flatbed & container trailers", "Project & oversized cargo"],
    feature: true,
  },
  {
    no: "02",
    t: "Warehousing",
    d: "Covered storage at our own facility, short or long term, with stock kept dispatch-ready rather than simply held.",
  },
  {
    no: "03",
    t: "Distribution",
    d: "Scheduled onward movement to every province of Rwanda, and west across the border into the DRC.",
  },
  {
    no: "04",
    t: "Last-mile delivery",
    d: "The final leg to the site, shop or door — sized to the drop, so one pallet never waits on a full trailer.",
  },
  {
    no: "05",
    t: "Import & export logistics",
    d: "Mombasa and Dar es Salaam end to end: port collection, customs clearing, documentation and the run inland.",
  },
  {
    no: "06",
    t: "Fleet management",
    d: "Our own workshop, employed drivers and maintenance schedule keep two hundred and two units on the road.",
  },
  {
    no: "07",
    t: "Construction material delivery",
    d: "Tiles, glass, cement and steel, moved the way a hardware importer would want them moved.",
  },
];

export default function Offer() {
  return (
    <section className="bay ink ofr" id="services">
      <div className="wrap">
        {/* Plain text, for the same reason as the about title — see About.tsx. */}
        <div className="kick kick--lg">What we do</div>
        <h2 className="h h-d ofr__t">Our services</h2>

        <div className="ofr__sub">
          <p className="lede ofr__lede rise">
            Seven of them, and every one runs on our own fleet, our own drivers
            and our own clearing desk. Nothing is brokered out and then
            explained away.
          </p>
          <div className="ofr__acts fade">
            <Link href="/services" className="btn btn--line">
              <span>All services</span>
              <Arrow />
            </Link>
          </div>
        </div>

        <div className="ofr__g">
          {SERVICES.map((s) => (
            <Link
              href="/services"
              className={`ofr__c rise${s.feature ? " ofr__c--f" : ""}`}
              key={s.no}
            >
              <div className="ofr__no">
                <span>{s.no}</span>
                <i />
              </div>
              <h3 className="h h3 ofr__n">{s.t}</h3>
              <p className="ofr__d">{s.d}</p>

              {s.p && (
                <ul className="ofr__pts">
                  {s.p.map((pt) => (
                    <li key={pt}>{pt}</li>
                  ))}
                </ul>
              )}

              <span className="ofr__go" aria-hidden>
                <Arrow />
              </span>
            </Link>
          ))}

          {/* Ninth cell. Yellow because it is the one thing in the grid that
              is not a service — it is the ask. */}
          <Link href="/contact" className="ofr__c ofr__c--cta rise">
            <div className="ofr__no">
              <span>—</span>
              <i />
            </div>
            <h3 className="h h3 ofr__n">Something else in mind?</h3>
            <p className="ofr__d">
              Tell us the cargo, the route and the date. We will tell you what
              it takes.
            </p>
            <span className="ofr__go" aria-hidden>
              <Arrow />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
