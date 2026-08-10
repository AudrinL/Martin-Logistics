import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Cta from "@/components/sections/Cta";
import Reveal from "@/components/fx/Reveal";

export const metadata: Metadata = {
  title: "Services — Martin Logistics",
  description:
    "Full-load haulage, cross-border and port clearance from Mombasa and Dar es Salaam, overseas storage, and distribution warehousing with last-mile delivery.",
};

const BLOCKS = [
  {
    no: "01",
    title: "Logistics & goods transportation",
    desc: "Full-load and part-load freight haulage across Rwanda, the DRC and East Africa. Whether it is a single pallet or a full project-cargo convoy, our fleet is sized and scheduled to carry it — on a route we already know.",
    points: [
      "Full truckload (FTL) haulage",
      "Flatbed & container trailers",
      "Project & oversized cargo",
      "Dedicated contract routes for regular shippers",
    ],
  },
  {
    no: "02",
    title: "Cross-border & port haulage",
    desc: "Scheduled runs from the ports of Mombasa and Dar es Salaam into Kigali, with customs clearing and documentation handled end to end — and onward transport into the DRC and every province of Rwanda.",
    points: [
      "Mombasa Port → Kigali (~1,730 km)",
      "Dar es Salaam → Kigali (~1,600 km)",
      "Customs clearing & border documentation",
      "Kigali → DRC onward transport",
    ],
  },
  {
    no: "03",
    title: "Abroad goods storage",
    desc: "Self-storage for cargo waiting on a sailing, at competitive and transparent rates — so your goods are ready to move the moment a truck is scheduled.",
    points: [
      "Short & long-term overseas storage",
      "Coordinated pickup & consolidation",
      "Transparent, competitive rates",
      "Insurance-ready handling & documentation",
    ],
  },
  {
    no: "04",
    title: "Delivery & warehousing",
    desc: "More than storage. Our distribution warehouse is a full-service fulfilment solution, keeping stock ready for dispatch and getting it to the last mile without delay.",
    points: [
      "Distribution warehousing",
      "Last-mile delivery",
      "Inventory-ready storage",
      "Nationwide dispatch — Northern, Southern & Eastern provinces",
    ],
  },
];

const STEPS = [
  {
    no: "01",
    name: "Request",
    body: "Tell us the cargo, the route and the timeline — by phone, email or the form on this site.",
  },
  {
    no: "02",
    name: "Plan",
    body: "We match the load to the right truck and trailer and confirm clearing requirements at each border.",
  },
  {
    no: "03",
    name: "Haul & clear",
    body: "Your cargo runs the corridor with one team handling transport and customs together.",
  },
  {
    no: "04",
    name: "Deliver",
    body: "Freight lands at the warehouse, province or border point — confirmed, on schedule.",
  },
];

export default function Services() {
  return (
    <>
      <PageHero
        crumb="Services"
        kick="What we do"
        title={
          <>
            Four ways
            <br />
            we carry it.
          </>
        }
        sub="From a single pallet to project cargo, port clearance to the last mile — handled by a fleet of 100 trucks and 102 trailers."
      />

      <section className="bay ink" style={{ paddingTop: "var(--bay-s)" }}>
        <div className="wrap">
          {BLOCKS.map((b) => (
            <div className="svcblk rise" key={b.no}>
              <div className="svcblk__n">{b.no}</div>
              <div>
                <h2 className="h h2 svcblk__t">{b.title}</h2>
                <p className="svcblk__d">{b.desc}</p>
                <ul className="svcblk__ul">
                  {b.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bay pap">
        <div className="wrap">
          <div className="kick fade">How it works</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 22 }}>
            Request to delivery.
          </Reveal>
          <div className="trio" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
            {STEPS.map((s) => (
              <div className="trio__c rise" key={s.no}>
                <div className="trio__tag">{s.no}</div>
                <div className="h h3 trio__n">{s.name}</div>
                <p className="trio__a">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Cta head="Ready to book a haul?" />
    </>
  );
}
