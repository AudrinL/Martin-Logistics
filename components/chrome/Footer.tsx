import Link from "next/link";
import { NAV, CONTACT, SERVICES, tel } from "@/lib/site";
import FootMark from "./FootMark";

/* Server component — the year is stamped at render, so there is no client
   JS and nothing to hydrate for it. */
export default function Footer() {
  return (
    <footer className="ft">
      <div className="wrap">
        <div className="ft__top">
          <div>
            <Link href="/" className="ft__logo">
              <img src="/assets/img/logo-light.png" alt="Martin Logistics" />
            </Link>
            <p className="ft__d">
              The logistics and transport division of Martin Hardware Ltd — moving
              freight between the coast and Kigali, and across Rwanda, the DRC and
              East Africa.
            </p>
            <a
              href={CONTACT.parent}
              target="_blank"
              rel="noopener"
              className="ft__parent"
            >
              Martin Hardware Ltd ↗
            </a>
          </div>

          <div>
            <div className="ft__h">Index</div>
            <ul className="ft__l">
              {NAV.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>{label === "Index" ? "Home" : label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="ft__h">Services</div>
            <ul className="ft__l">
              {SERVICES.map((s) => (
                <li key={s}>
                  <Link href="/services">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="ft__h">Contact</div>
            <ul className="ft__c">
              <li>
                {CONTACT.address}
                <br />
                {CONTACT.district}
              </li>
              <li>
                <a href={tel(CONTACT.phones[0])}>{CONTACT.phones[0]}</a>
                <br />
                <a href={tel(CONTACT.phones[1])}>{CONTACT.phones[1]}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
            </ul>
          </div>
        </div>

        <FootMark />

        <div className="ft__bot">
          <span>
            © {new Date().getFullYear()} Martin Logistics — A department of Martin
            Hardware Ltd
          </span>
          <div className="ft__soc">
            <a href="#">Facebook</a>
            <a href="#">LinkedIn</a>
            <a href="#">X</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
