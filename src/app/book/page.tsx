import type { Metadata } from "next";
import { Suspense } from "react";
import BookingFlow from "@/components/booking/BookingFlow";
import { Container } from "@/components/ui/Layout";
import { business } from "@/lib/content";

export const metadata: Metadata = {
  title: "Book",
  description:
    "Check availability and book a Dunslim residence direct: the lowest rate, no booking fee and free cancellation up to 48 hours before arrival.",
  alternates: { canonical: "/book" },
  robots: { index: false, follow: true },
};

/**
 * What sits here before the checkout code arrives and what sits here for ever
 * if it never does.
 *
 * This was one line of 13px caps reading "Loading your booking" and nothing
 * else. With JavaScript off, or a bundle that never finishes on a bad Lusaka
 * connection, that is the whole page: a promise that something is coming, kept
 * indefinitely, on the only page that takes money. It had no heading either, so
 * the document had no h1 at all until React took over.
 *
 * The heading is real markup now and the `noscript` gives the guest a way to
 * reach a person. Every other page on this site works without JavaScript; this
 * one genuinely cannot, so it says so rather than pretending to load.
 */
function Loading() {
  return (
    <Container wide>
      <div className="max-w-measure py-16 md:py-24">
        <h1 className="text-h1 font-extralight text-navy">Your booking</h1>
        <p className="mt-6 text-lead text-charcoal" role="status">
          One moment while the booking form opens.
        </p>

        <noscript>
          <p className="mt-6 text-body text-charcoal">
            This form needs JavaScript and it looks like it is switched off, so it will not open.
            You can still book: call us on{" "}
            <a className="text-navy underline underline-offset-4" href={`tel:${business.phone.replace(/\s/g, "")}`}>
              {business.phone}
            </a>{" "}
            or{" "}
            <a
              className="text-navy underline underline-offset-4"
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              message us on WhatsApp
            </a>{" "}
            with your dates and we will do the rest. The rates are on the{" "}
            <a className="text-navy underline underline-offset-4" href="/rates">
              rate card
            </a>
            .
          </p>
        </noscript>
      </div>
    </Container>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BookingFlow />
    </Suspense>
  );
}
