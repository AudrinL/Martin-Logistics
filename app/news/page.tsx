import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/sections/PageHero";
import Cta from "@/components/sections/Cta";
import Arrow from "@/components/ui/Arrow";

export const metadata: Metadata = {
  title: "News — Martin Logistics",
  description:
    "Fleet growth, partnerships and network updates from Martin Logistics in Kigali.",
};

const STORIES = [
  {
    cat: "Partnerships",
    img: "/assets/img/truck-side-twyford.webp",
    alt: "Branded trailer for a partner shipment",
    date: "2020 — Ongoing",
    title: "Working alongside Bolloré, JBL and Simba Cargo",
    body: "Standing agreements for transportation, clearing and warehousing with established regional operators keep freight moving without delay.",
  },
  {
    cat: "Network",
    img: "/assets/img/highway-sunset-b.webp",
    alt: "Truck on the Mombasa corridor at sunrise",
    date: "Ongoing",
    title: "One desk now clears cargo at three ports",
    body: "Streamlined customs handling across Mombasa, Dar es Salaam and Kigali cuts turnaround time for cross-border loads.",
  },
  {
    cat: "Milestone",
    img: "/assets/img/truck-front-livery.webp",
    alt: "Martin Logistics tractor unit, front view",
    date: "2025",
    title: "From 15 trucks to 100: a decade on the road",
    body: "What began in 2015 as an in-house haulage arm for Martin Hardware's own imports is now a 100-truck, 102-trailer regional operation.",
  },
  {
    cat: "Group",
    img: "/assets/img/truck-side-twyford-02.webp",
    alt: "Twyford branded trailer, side profile",
    date: "2015",
    title: "Martin Hardware reaches 60% of Rwanda's tile market",
    body: "A partnership with Keda Kenya, Tanzania and The Africa Import & Export Ltd — and a growing in-house fleet to move it all.",
  },
  {
    cat: "Vision",
    img: "/assets/img/truck-container-studio.webp",
    alt: "Tractor unit hauling a shipping container",
    date: "Ongoing",
    title: "Building toward Rwanda's top three operators",
    body: "Every new truck, corridor and partnership moves Martin Logistics closer to a standing commitment: ranking among the country's top three transport companies.",
  },
  {
    cat: "Operations",
    img: "/assets/img/truck-front-02.webp",
    alt: "Tractor unit cab detail",
    date: "Ongoing",
    title: "Raw material on the move for tyre retreading",
    body: "Alongside freight for partners, the fleet keeps Martin Hardware's tyre-retreading department stocked — closing the loop between logistics and manufacturing.",
  },
];

export default function News() {
  return (
    <>
      <PageHero
        crumb="News"
        kick="Latest"
        title={
          <>
            News from
            <br />
            the yard.
          </>
        }
        sub="Fleet growth, partnerships and network updates from Martin Logistics."
      />

      <section className="bay ink" style={{ paddingTop: "var(--bay-s)" }}>
        <div className="wrap">
          <div
            className="split2 rise"
            style={{
              alignItems: "center",
              paddingBottom: "var(--gap-h)",
              borderBottom: "1px solid var(--rule-ink)",
            }}
          >
            <div className="jrn__m" style={{ aspectRatio: "16/11" }}>
              <span className="jrn__cat">Fleet</span>
              <img
                src="/assets/img/truck-tractor-only.webp"
                alt="New tractor unit joining the fleet"
              />
            </div>
            <div>
              <div className="jrn__dt">2025 — Featured</div>
              <h2 className="h h2" style={{ marginTop: 14 }}>
                Ten new trucks and trailers join the fleet this year
              </h2>
              <p className="lede" style={{ marginTop: 16 }}>
                Since committing to annual fleet growth, Martin Logistics adds ten trucks
                and ten trailers a year — a standing investment that keeps pace with
                contract volumes across the Mombasa, Dar es Salaam and Kigali corridor.
              </p>
              <Link href="/contact" className="btn btn--line" style={{ marginTop: 24 }}>
                <span>Talk to us</span>
                <Arrow />
              </Link>
            </div>
          </div>

          <div className="jrn">
            {STORIES.map((s) => (
              <article className="jrn__c rise" key={s.title}>
                <div className="jrn__m">
                  <span className="jrn__cat">{s.cat}</span>
                  <img src={s.img} alt={s.alt} />
                </div>
                <div className="jrn__b">
                  <div className="jrn__dt">{s.date}</div>
                  <h3 className="h h3 jrn__t">{s.title}</h3>
                  <p className="jrn__x">{s.body}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Cta head="Want to work with us?" />
    </>
  );
}
