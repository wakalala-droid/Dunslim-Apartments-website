import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { business } from "@/lib/content";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";

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
 * real site. "Official Site" plus a rate promise is the counter — the pattern
 * Numa and every serious operator uses.
 */
export const metadata: Metadata = {
  /*
    The canonical address, with the www. The apex redirects here, so this is
    the one that should appear in search results, Open Graph cards and any
    absolute URL the site generates. Changing it later splits link equity
    between two addresses, so it is set once, deliberately.
  */
  metadataBase: new URL("https://www.dunslim-apartments.com"),
  title: {
    default: "Dunslim Apartments — Official Site | Best Rates, Booked Direct",
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
  openGraph: {
    title: "Dunslim Apartments — Official Site",
    description: business.brandLine,
    type: "website",
    locale: "en_ZM",
    siteName: business.name,
  },
  /*
    Search engines are locked OUT until someone deliberately opens the door.
    Set NEXT_PUBLIC_ALLOW_INDEXING=true in the Vercel project only once the
    real photography, rates and contact details are in.

    The reason is not caution for its own sake. Right now the site states a
    phone number that does not work and shows stock interiors that are not
    these apartments. Letting Google index that attaches false details to the
    business name permanently — which is the exact trust problem the Growth
    Proposal set out to fix, made worse and harder to undo.
  */
  robots:
    process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true"
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  icons: {
    icon: [{ url: "/brand/dunslim-monogram-brass.svg", type: "image/svg+xml" }],
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
          Everything that animates in is server-rendered in its hidden state —
          roughly forty elements carry an inline `opacity:0`, and the heading
          words start translated out of a clipping box. JavaScript is what
          brings them back, so if scripts never run the page would render
          permanently blank.

          This undoes every one of those hidden states, so with no JavaScript
          the site is simply a static, fully legible page. Matching on the
          inline style is deliberate: it catches any animated element without
          each one having to remember to opt in.
        */}
        <noscript>
          {/* eslint-disable-next-line react/no-danger */}
          <style
            dangerouslySetInnerHTML={{
              // Both spellings, since the serialised style may or may not
              // carry a space after the colon.
              __html:
                '[style*="opacity:0"],[style*="opacity: 0"],[data-reveal-word]' +
                "{opacity:1!important;transform:none!important}",
            }}
          />
        </noscript>

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
