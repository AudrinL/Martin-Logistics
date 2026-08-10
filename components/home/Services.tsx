"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import Reveal from "@/components/fx/Reveal";
import { useCoarsePointer } from "@/lib/hooks";

const ROWS = [
  {
    no: "01",
    title: "Goods transportation",
    desc: "Full-load haulage across Rwanda, the DRC and East Africa.",
    img: "/assets/img/hero-highway-03.webp",
  },
  {
    no: "02",
    title: "Cross-border & port",
    desc: "Scheduled runs from Mombasa and Dar es Salaam, cleared end to end.",
    img: "/assets/img/highway-sunset-a.webp",
  },
  {
    no: "03",
    title: "Abroad goods storage",
    desc: "Overseas storage for cargo waiting on a sailing.",
    img: "/assets/img/truck-side-twyford.webp",
  },
  {
    no: "04",
    title: "Delivery & warehousing",
    desc: "A distribution warehouse and the last mile out of it.",
    img: "/assets/img/highway-sunset-b.webp",
  },
];

/* Hovering a row floats the matching photograph under the cursor. The follow
   is deliberately lazier than the cursor dot (0.14 against 0.2) so the image
   trails rather than sticks — it reads as weight. */
export default function Services() {
  const peek = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const coarse = useCoarsePointer();

  useEffect(() => {
    if (coarse) return;
    const el = peek.current;
    if (!el) return;

    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let on = false;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      if (on) el.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener("mousemove", onMove);

    const enter = (e: Event) => {
      const row = (e.target as Element).closest<HTMLElement>(".svc__row[data-img]");
      if (!row || !img.current) return;
      img.current.src = row.dataset.img!;
      const me = e as MouseEvent;
      tx = cx = me.clientX;
      ty = cy = me.clientY;
      el.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%)`;
      on = true;
      el.classList.add("on");
    };
    const leave = (e: Event) => {
      if (!(e.target as Element).closest(".svc__row[data-img]")) return;
      on = false;
      el.classList.remove("on");
    };

    document.addEventListener("pointerover", enter);
    document.addEventListener("pointerout", leave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("pointerover", enter);
      document.removeEventListener("pointerout", leave);
    };
  }, [coarse]);

  return (
    <>
      <section className="bay ink">
        <div className="wrap">
          <div className="kick fade">What we do</div>
          <Reveal as="h2" className="h h2" style={{ marginTop: 24, maxWidth: "16ch" }}>
            Four ways we carry it.
          </Reveal>

          <div className="svc__list">
            {ROWS.map((r) => (
              <Link
                className="svc__row"
                href="/services"
                data-img={r.img}
                key={r.no}
              >
                <span className="svc__no">{r.no}</span>
                <span className="h h3 svc__t">{r.title}</span>
                <span className="svc__d">{r.desc}</span>
                <span className="svc__go">View</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!coarse && (
        <div className="svc__peek" id="peek" ref={peek}>
          <img alt="" aria-hidden ref={img} />
        </div>
      )}
    </>
  );
}
