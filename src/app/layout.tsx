import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { business } from "@/lib/content";
import { site } from "@/lib/site";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import { RevealScript } from "@/components/ui/RevealScript";

/**
 * Söhne is the brand typeface. Inter is the substitute the brand guidelines
 * authorise for screen (p.13) until the retail family is licensed from Klim.
 * Weights map to the brand's: 200 Extraleicht, 300 Leicht, 400 Buch,
 * 500 Kräftig, 600 Halbfett.
 */
const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * The title tag is a commercial decision, not a formality. When someone searches
 * "Dunslim Apartments", the booking platforms bid on that name and sit above the
 * real site. "Official Site" plus a rate promise is the counter, the pattern
 * Numa and every serious operator uses.
 */
export const metadata: Metadata = {
  /*
    The canonical address, with the www. The apex redirects here, so this is
    the one that should appear in search results, Open Graph cards and any
    absolute URL the site generates. Changing it later splits link equity
    between two addresses, so it is set once, deliberately.
  */
  metadataBase: new URL(site.url),
  title: {
    default: "Dunslim Apartments: Official Site | Best Rates, Booked Direct",
    template: "%s | Dunslim Apartments",
  },
  description:
    "Serviced apartments on Makeni Road, Lusaka, for business and diplomatic travellers. Backup power, secure parking and a rate that is always lower booked direct.",
  keywords: [
    "serviced apartments Lusaka",
    "Makeni Road accommodation",
    "business travel Lusaka",
    "long stay apartments Lusaka",
    "Dunslim Apartments",
  ],
  /*
    The share card. Without an image, a link pasted into WhatsApp (which is how
    this will actually spread in Lusaka) renders as a bare grey rectangle.
    The card is the hero photograph with the lockup on a solid Deep Navy panel
    across the foot, because the brand book (p.12) does not allow the mark to
    sit directly on a photograph.
  */
  openGraph: {
    title: "Dunslim Apartments: Official Site",
    description:
      "Three serviced apartments on Makeni Road, Lusaka. Backup power, secure parking and a rate that is always lower booked direct.",
    type: "website",
    locale: "en_ZM",
    siteName: business.name,
    url: site.url,
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "A Dunslim living room, with the Dunslim Apartments mark",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dunslim Apartments: Official Site",
    description: "Serviced apartments on Makeni Road, Lusaka. Best rate, booked direct.",
    images: ["/og-default.jpg"],
  },
  alternates: { canonical: "/" },
  /*
    Search engines are locked OUT until someone deliberately opens the door.
    Set NEXT_PUBLIC_ALLOW_INDEXING=true in the Vercel project only once the
    real photography, rates and contact details are in.

    The reason is not caution for its own sake. Right now the site states a
    phone number that does not work and shows stock interiors that are not
    these apartments. Letting Google index that attaches false details to the
    business name permanently, which is the exact trust problem the Growth
    Proposal set out to fix, made worse and harder to undo.
  */
  robots: site.allowIndexing
    ? { index: true, follow: true }
    : { index: false, follow: false, nocache: true },
  /*
    The .ico is what bookmarks, older browsers and most link-preview crawlers
    ask for first; the SVG is what modern browsers prefer. Both are served, so
    the monogram shows up wherever the page is referenced.
  */
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/dunslim-monogram-brass.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F2234",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZM" className={inter.variable}>
      <body className="font-sans text-body antialiased">
        {/*
          Adds `js-motion` before the first paint, which is the only thing that
          lets the reveal CSS hide anything at all. If it never runs, the page
          is a plain static document rather than a blank one.

          This replaces a <noscript> block that undid inline `opacity:0` styles.
          Those styles no longer exist, nothing is hidden in the markup any
          more, so the override had stopped protecting anything.
        */}
        <RevealScript />

        {/*
          Web Analytics. Vercel serves this script from the deployment itself,
          so there is no package and no bundle cost. `@vercel/analytics` is a
          wrapper around exactly this plus a call to `window.va` and both are
          done directly. It sets no cookies and records nothing personal, which
          is why there is no consent banner for it.

          It has to be switched on for the project in the Vercel dashboard
          before anything is recorded. Until then this 404s quietly and the site
          is unaffected.
        */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script defer src="/_vercel/insights/script.js" />

        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        {/* Room for the fixed header. A full-bleed hero cancels it with
            `under-header` so the photograph runs up behind the bar. */}
        <main id="main" className="pt-[var(--header-h)]">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
