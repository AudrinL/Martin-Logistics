import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Cta from "@/components/sections/Cta";
import Reveal from "@/components/fx/Reveal";

export const metadata: Metadata = {
  title: "About — Martin Logistics",
  description:
    "Martin Logistics began as a way to move Martin Hardware's own stock. Twelve years on it runs 100 trucks and 102 trailers between the coast and Kigali.",
};

const TIMELINE = [
  {
    year: "2012",
    title: "Foundation",
    body: "Madam Cecile Uwiduhaye founds Martin Hardware Ltd, importing wall tiles, floor tiles, house glass and household products into Rwanda. The head office opens in Gasabo District, with branches following in Gisozi and Kimironko.",
  },
  {
    year: "2015",
    title: "The first fleet",
    body: "With fifteen trucks, the company begins hauling its own tile and glass imports rather than relying on third-party carriers. The same year a partnership with Keda Kenya, Tanzania and The Africa Import & Export Ltd takes Martin Hardware to roughly 60% of Rwanda's tile market.",
  },
  {
    year: "2020",
    title: "Regional partnerships",
    body: "Agreements are signed with Bolloré Transport & Logistics Rwanda, JBL Logistics Group, Simba Cargo, R&M Logistics, Intelgraca, YITIYAN, OLIU Logistics and AGANZE Group — covering transportation, clearing, shipping and warehousing.",
  },
  {
    year: "2025",
    title: "Scaling up",
    body: "The fleet reaches 100 trucks and 102 trailers, with a standing commitment to add ten more of each every year — specialising in the Dar es Salaam–Kigali, Mombasa–Kigali and Kigali–DRC corridors, plus raw material for the group's tyre-retreading line.",
  },
  {
    year: "Today",
    title: "Regional reach",
    body: "Freight moves daily between the ports of Mombasa and Dar es Salaam, through Kigali, and onward into the DRC and every province of Rwanda — one accountable team handling transport, clearing and delivery end to end.",
  },
];

const DUO = [
  {
    label: "Vision",
    body: "To carry goods across Rwanda, the DRC and every East and Southern African country we can reach by road.",
  },
  {
    label: "Mission",
    body: "To build a world-class, environmentally responsible transport business that ranks among Rwanda's top three operators.",
  },
];

const SITES = [
  {
    tag: "Head office",
    name: "Gasabo",
    addr: ["KK 13 Ave, Kigali, Rwanda", "Free Zone"],
  },
  {
    tag: "Branch",
    name: "Gisozi",
    addr: ["Tiles, glass & house sanitations", "Kigali, Rwanda"],
  },
  {
    tag: "Branch",
    name: "Kimironko",
    addr: ["Tiles, glass & house sanitations", "Kigali, Rwanda"],
  },
];

export default function About() {
  return (
    <>
      <PageHero
        crumb="About"
        kick="Est. 2015 · Gasabo, Kigali"
        title={
          <>
            Twelve years.
            <br />
            One relentless yard.
          </>
        }
        sub="Martin Logistics began as a way to move our own hardware stock. It grew into a transport operation carrying freight for some of East Africa's biggest names — built truck by truck, year on year, out of Kigali."
      />

      <section className="bay pap">
        <div className="wrap">
          <div className="kick fade">The story</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 22, maxWidth: "18ch" }}>
            Fifteen trucks became two hundred and two units.
          </Reveal>
          <div style={{ marginTop: "var(--gap-h)" }}>
            {TIMELINE.map((t) => (
              <div className="tl__row rise" key={t.year}>
                <div className="tl__y">{t.year}</div>
                <div>
                  <h3 className="h h3 tl__t">{t.title}</h3>
                  <p className="tl__d">{t.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bay ink">
        <div className="wrap">
          <div className="kick fade">Vision &amp; mission</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 22 }}>
            Where we&apos;re headed.
          </Reveal>
          <div className="duo">
            {DUO.map((d) => (
              <div className="duo__c rise" key={d.label}>
                <div className="duo__l">{d.label}</div>
                <p className="duo__t">{d.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bay pap">
        <div className="wrap">
          <div className="kick fade">Leadership</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 22 }}>
            Founder-led, from day one.
          </Reveal>
          <div className="split2" style={{ marginTop: "var(--gap-h)", alignItems: "start" }}>
            <blockquote className="h h3" style={{ fontWeight: 400, lineHeight: 1.4 }}>
              &ldquo;Improving quality of life with a unified approach.&rdquo;
            </blockquote>
            <div>
              <div className="tag">Madam Cecile Uwiduhaye — CEO &amp; Founder</div>
              <p className="lede" style={{ marginTop: 16 }}>
                With more than twelve years in business, Madam Uwiduhaye started Martin
                Hardware Ltd in 2012 and has personally steered its growth from a Kigali
                tile importer into a hardware and logistics group running a hundred-truck
                fleet.
              </p>
              <p className="lede" style={{ marginTop: 14 }}>
                The logistics division carries the same standard: own the trucks, own the
                schedule, answer for the delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bay ink">
        <div className="wrap">
          <div className="kick fade">Where we&apos;re based</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 22 }}>
            Head office &amp; branches.
          </Reveal>
          <div className="trio">
            {SITES.map((s) => (
              <div className="trio__c rise" key={s.name}>
                <div className="trio__tag">{s.tag}</div>
                <div className="h h3 trio__n">{s.name}</div>
                <p className="trio__a">
                  {s.addr[0]}
                  <br />
                  {s.addr[1]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Cta head="See the fleet that moves it." />
    </>
  );
}
