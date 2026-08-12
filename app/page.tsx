import About from "@/components/home/About";
import Beacon from "@/components/home/Beacon";
import Offer from "@/components/home/Offer";
import Reel from "@/components/home/Reel";
import Network from "@/components/home/Network";

const TICKER = [
  "Mombasa",
  "Nairobi",
  "Dar es Salaam",
  "Kigali",
  "Goma",
  "Lubumbashi",
];

const PARTNERS = [
  "Bolloré Transport",
  "JBL Logistics",
  "Simba Cargo",
  "R&M Logistics",
  "Intelgraca",
  "YITIYAN",
  "OLIU Logistics",
  "AGANZE Group",
];

const STATS = [
  { count: 12, sup: "+", label: "Years on the road" },
  { count: 100, sup: "", label: "Tractor units" },
  { count: 102, sup: "", label: "Trailers" },
  { count: 10, sup: "+", label: "New units per year" },
];

/* Marquee tracks are animated to xPercent -50, so the content has to appear
   exactly twice for the loop to be seamless. Rendering a fragment twice keeps
   the DOM identical to the static site — no wrapper elements for the
   `.tick__t span` rules to miss. */
const twice = <T,>(xs: T[]) => [...xs, ...xs];

function TickItems() {
  return (
    <>
      {TICKER.map((t) => (
        <span key={t}>{t}</span>
      ))}
      <span>
        <b>100</b> trucks
      </span>
      <span>
        <b>102</b> trailers
      </span>
      <span>
        Since <b>2015</b>
      </span>
    </>
  );
}

export default function Home() {
  return (
    <>
      {/* The globe is the hero, and the page never leaves ink after it — globe,
          ticker, reel, beacon and the stat block all sit on the same ground, so
          nothing here needs a ramp between sections. */}
      <Network />

      <div className="tick" data-marquee="46">
        <div className="tick__t">
          <TickItems />
          <TickItems />
        </div>
      </div>

      {/* The ticker hands straight into the two read-it sections — the globe
          and the reel are both full-screen scrubs, so putting the flat copy
          between them gives the page somewhere to breathe. */}
      <About />
      <Offer />

      <Reel />
      <Beacon />

      <section className="bay--s ink">
        <div className="wrap">
          <div className="kick fade">Scale</div>
          <div className="num">
            {STATS.map((s) => (
              <div className="num__c rise" key={s.label}>
                <div className="num__v">
                  <span data-count={s.count}>0</span>
                  {s.sup && <sup>{s.sup}</sup>}
                </div>
                <div className="num__l">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="wrap" style={{ marginTop: "var(--gap-h)" }}>
          <div className="tag fade" style={{ textAlign: "center" }}>
            Trusted alongside
          </div>
        </div>
        <div className="marq" data-marquee="52">
          <div className="marq__t">
            {twice(PARTNERS).map((p, i) => (
              <span key={`${p}-${i}`}>{p}</span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
