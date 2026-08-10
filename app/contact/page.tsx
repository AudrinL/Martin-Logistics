import type { Metadata } from "next";
import PageHero from "@/components/sections/PageHero";
import QuoteForm from "@/components/contact/QuoteForm";
import { CONTACT, tel } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact — Martin Logistics",
  description:
    "Request a quote from Martin Logistics. Head office KK 13 Ave, Gasabo Free Zone, Kigali. +250 780 898 115.",
};

export default function Contact() {
  return (
    <>
      <PageHero
        crumb="Contact"
        kick="Get in touch"
        title={
          <>
            Got freight?
            <br />
            Let&apos;s talk.
          </>
        }
        sub="Tell us what needs to move, and where. We'll come back with a route and a price."
      />

      <section className="bay ink" style={{ paddingTop: "var(--bay-s)" }}>
        <div className="wrap">
          <div className="split2">
            <div className="rise">
              <div className="kick">Request a quote</div>
              <h2 className="h h3" style={{ marginTop: 16 }}>
                Send the details.
              </h2>
              <QuoteForm />
            </div>

            <div className="rise">
              <div className="kick">Reach us directly</div>
              <h2 className="h h3" style={{ marginTop: 16 }}>
                Head office.
              </h2>
              <div className="cinfo">
                <div className="cinfo__i">
                  <div className="cinfo__l">Address</div>
                  <div className="cinfo__v">
                    {CONTACT.address}
                    <br />
                    {CONTACT.district}
                  </div>
                </div>
                <div className="cinfo__i">
                  <div className="cinfo__l">Phone</div>
                  <div className="cinfo__v">
                    <a href={tel(CONTACT.phones[0])}>{CONTACT.phones[0]}</a>
                    <br />
                    <a href={tel(CONTACT.phones[1])}>{CONTACT.phones[1]}</a>
                  </div>
                </div>
                <div className="cinfo__i">
                  <div className="cinfo__l">Email</div>
                  <div className="cinfo__v">
                    <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                  </div>
                </div>
                <div className="cinfo__i">
                  <div className="cinfo__l">Hours</div>
                  <div className="cinfo__v">Monday – Saturday, 7:00 – 19:00</div>
                </div>
                <div className="cinfo__i">
                  <div className="cinfo__l">Branches</div>
                  <div className="cinfo__v">Gisozi &amp; Kimironko, Kigali</div>
                </div>
              </div>
            </div>
          </div>

          <div className="map fade">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=29.98%2C-1.99%2C30.15%2C-1.90&layer=mapnik&marker=-1.9441%2C30.0619"
              loading="lazy"
              title="Martin Logistics — Kigali, Rwanda"
            />
          </div>
        </div>
      </section>
    </>
  );
}
