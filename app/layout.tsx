import type { Metadata, Viewport } from "next";
import { MuseoModerno, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import SiteNav from "@/components/chrome/SiteNav";
import Cursor from "@/components/chrome/Cursor";
import Footer from "@/components/chrome/Footer";
import ScrollFX from "@/components/fx/ScrollFX";
import Micro from "@/components/fx/Micro";

/* Self-hosted, so there is no render-blocking round trip to Google and no
   flash of fallback type. The variables are consumed by --f-head/--f-text/
   --f-mono in globals.css. */
const head = MuseoModerno({
  variable: "--font-head",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const text = Inter_Tight({
  variable: "--font-text",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='18' fill='%230B0B0C'/%3E%3Ctext x='50' y='70' font-family='Arial Black' font-size='60' fill='%23EDD836' text-anchor='middle'%3EM%3C/text%3E%3C/svg%3E";

export const metadata: Metadata = {
  title: "Martin Logistics — Port to Province",
  description:
    "The logistics and transport division of Martin Hardware Ltd. 100 trucks and 102 trailers moving freight between Mombasa, Dar es Salaam, Kigali and the DRC since 2015.",
  icons: { icon: FAVICON },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${head.variable} ${text.variable} ${mono.variable}`}
    >
      <body>
        <Cursor />
        <SiteNav />
        {children}
        <Footer />
        <ScrollFX />
        <Micro />
      </body>
    </html>
  );
}
