import Stage from "@/components/home/Stage";
import Reel from "@/components/home/Reel";
import Network from "@/components/home/Network";
import Rail from "@/components/home/Rail";
import Services from "@/components/home/Services";
import Cta from "@/components/sections/Cta";
import Reveal from "@/components/fx/Reveal";

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

const ORIGIN = [
  {
    tag: "01 — Origin",
    body: "Martin Hardware began importing tiles and glass into Kigali in 2012. Three years later we stopped waiting on other people's trucks.",
  },
  {
    tag: "02 — Scale",
    body: "A hundred tractor units and a hundred and two trailers, with ten more of each joining the yard every year.",
  },
  {
    tag: "03 — Reach",
    body: "Two ocean ports, one landlocked capital, and every province in between — plus onward haulage into the DRC.",
  },
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
      <Stage />

      <div className="tick" data-marquee="46">
        <div className="tick__t">
          <TickItems />
          <TickItems />
        </div>
      </div>

      <section className="bay pap">
        <div className="wrap">
          <div className="kick fade">Who we are</div>
          <Reveal as="h2" className="h h2 stmt__t" style={{ marginTop: 26 }}>
            We started with fifteen trucks and our own cargo. Today we move the
            region&apos;s.
          </Reveal>

          <div className="stmt__meta">
            {ORIGIN.map((o) => (
              <div className="rise" key={o.tag}>
                <div className="tag">{o.tag}</div>
                <p>{o.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Reel />
      <Network />
      <Rail />
      <Services />

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

      <Cta head="Got freight? Let's move it." parallax={-6} />
    </>
  );
}
