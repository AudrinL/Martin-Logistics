/* Single source of truth for the details that repeat across every page.
   Change a phone number here, not in six files. */

export const NAV = [
  { href: "/", label: "Index" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/fleet", label: "Fleet" },
  { href: "/news", label: "News" },
  { href: "/contact", label: "Contact" },
] as const;

export const CONTACT = {
  address: "KK 13 Ave, Kigali, Rwanda",
  district: "Gasabo District — Free Zone",
  sheetAddress: "KK 13 Ave, Kigali — Gasabo Free Zone",
  phones: ["+250 780 898 115", "+250 787 460 120"],
  email: "info@martinhardware.rw",
  parent: "https://www.martinhardware.rw",
} as const;

export const SERVICES = [
  "Goods transportation",
  "Cross-border & port",
  "Abroad goods storage",
  "Delivery & warehousing",
] as const;

/** Strip spaces so `tel:` links stay valid. */
export const tel = (phone: string) => `tel:${phone.replace(/\s/g, "")}`;
