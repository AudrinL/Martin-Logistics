import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import Cta from "@/components/sections/Cta";
import Reveal from "@/components/fx/Reveal";

export const metadata: Metadata = {
  title: "Fleet — Martin Logistics",
  description:
    "100 tractor units and 102 trailers — flatbeds and container chassis, maintained in our own yard and scheduled daily across the corridor.",
};

const STATS = [
  { count: 100, sup: "", label: "Tractor units" },
  { count: 102, sup: "", label: "Trailers" },
  { count: 10, sup: "+", label: "New units per year" },
  { count: 2, sup: "", label: "Trailer types" },
];

const GALLERY = [
  {
    size: "g8",
    src: "/assets/img/hero-highway-03.webp",
    alt: "Martin Logistics truck on the corridor at sunset",
    cap: "On the corridor — golden hour",
  },
  {
    size: "g4",
    src: "/assets/img/truck-front-livery.webp",
    alt: "Sinotruk HOWO TX tractor unit, front view",
    cap: "Sinotruk HOWO TX — front",
  },
  {
    size: "g4",
    src: "/assets/img/truck-side-twyford.webp",
    alt: "Container trailer in partner livery",
    cap: "Contract haulage — branded cargo",
  },
  {
    size: "g4",
    src: "/assets/img/truck-container-studio.webp",
    alt: "Tractor unit hauling a shipping container",
    cap: "Container chassis",
  },
  {
    size: "g4",
    src: "/assets/img/truck-chassis-studio.webp",
    alt: "Tractor unit and flatbed trailer",
    cap: "Tri-axle flatbed",
  },
  {
    size: "g6",
    src: "/assets/img/highway-sunset-a.webp",
    alt: "Truck hauling a yellow container at sunset",
    cap: "Mombasa corridor",
  },
  {
    size: "g6",
    src: "/assets/img/highway-sunset-b.webp",
    alt: "Truck at sunrise on the highway",
    cap: "Dar es Salaam run — sunrise",
  },
];

const TRAILERS = [
  {
    label: "Flatbed trailers",
    body: "Tri-axle flatbeds for building materials, tiles, retreading stock and general cargo that does not need a box — loaded and lashed for the long haul from the coast.",
  },
  {
    label: "Container chassis",
    body: "Skeletal trailers built to carry 20ft and 40ft ISO containers straight off the vessel at Mombasa or Dar es Salaam, through customs, and into the yard at Kigali.",
  },
];

export default function Fleet() {
  return (
    <>
      <PageHero
        crumb="Fleet"
        kick="The fleet"
        title={
          <>
            100 trucks.
            <br />
            102 trailers.
          </>
        }
        sub="Tractor units, container chassis and flatbeds — maintained in our own yard and scheduled daily across the Mombasa – Dar es Salaam – Kigali – DRC corridor."
      >
        <div className="num" style={{ marginTop: "var(--gap-h)" }}>
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
      </PageHero>

      <section className="bay pap">
        <div className="wrap">
          <div className="kick fade">In the yard</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 22 }}>
            A closer look.
          </Reveal>
          <div className="gal">
            {GALLERY.map((g) => (
              <figure className={`${g.size} rise`} key={g.src}>
                <img src={g.src} alt={g.alt} />
                <figcaption>{g.cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="bay ink">
        <div className="wrap">
          <div className="kick fade">Built for the corridor</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 22 }}>
            Two trailer types.
            <br />
            One standard of care.
          </Reveal>
          <div className="duo">
            {TRAILERS.map((t) => (
              <div className="duo__c rise" key={t.label}>
                <div className="duo__l">{t.label}</div>
                <p className="duo__t">{t.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Cta head="Need a truck on the road?" />
    </>
  );
}
