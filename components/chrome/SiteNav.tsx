"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useLenis } from "lenis/react";
import { NAV, CONTACT } from "@/lib/site";
import Arrow from "@/components/ui/Arrow";

const lift = { type: "spring", stiffness: 500, damping: 20 } as const;

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lenis = useLenis();
  const navRef = useRef<HTMLElement>(null);

  // Interior pages have no light hero behind the bar, so it is solid at rest.
  const alwaysSolid = pathname !== "/";

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 30);
      setHidden(y > 200 && y > last);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The sheet is a scroll trap: lock the body and park Lenis while it's open,
  // otherwise the page keeps moving underneath the menu.
  useEffect(() => {
    document.body.classList.toggle("is-locked", open);
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.body.classList.remove("is-locked");
    };
  }, [open, lenis]);

  const navClass = [
    "nav",
    solid || alwaysSolid ? "solid" : "",
    hidden && !open ? "up" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <header className={navClass} id="nav" ref={navRef}>
        <div className="nav__in">
          <Link href="/" className="nav__logo" aria-label="Martin Logistics — home">
            <img src="/assets/img/logo-light-word.png" alt="Martin Logistics" />
          </Link>

          <nav className="nav__links">
            {NAV.map(({ href, label }) => (
              <motion.div
                key={href}
                style={{ display: "contents" }}
                whileHover="hover"
              >
                <motion.span
                  style={{ display: "inline-block" }}
                  variants={{ hover: { y: -2 } }}
                  transition={lift}
                >
                  <Link href={href} className={pathname === href ? "on" : undefined}>
                    {label}
                  </Link>
                </motion.span>
              </motion.div>
            ))}
          </nav>

          <div className="nav__end">
            <Link href="/contact" className="btn btn--fill btn--sm">
              <span>Get a quote</span>
              <Arrow />
            </Link>
            <button
              className={`burger${open ? " x" : ""}`}
              id="burger"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="sheet"
              onClick={() => setOpen((v) => !v)}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </header>

      <div className={`sheet${open ? " open" : ""}`} id="sheet">
        <nav className="sheet__nav">
          <AnimatePresence>
            {open &&
              NAV.map(({ href, label }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ delay: 0.16 + i * 0.05, duration: 0.5 }}
                >
                  {/* Closing here rather than in an effect on pathname: a
                      setState fired synchronously from an effect cascades an
                      extra render, and the click is the real trigger anyway. */}
                  <Link href={href} onClick={() => setOpen(false)}>
                    {label}
                  </Link>
                </motion.div>
              ))}
          </AnimatePresence>
        </nav>
        <div className="sheet__foot">
          {CONTACT.sheetAddress}
          <br />
          {CONTACT.phones[0]} &nbsp;·&nbsp; {CONTACT.phones[1]}
          <br />
          {CONTACT.email}
        </div>
      </div>
    </>
  );
}
