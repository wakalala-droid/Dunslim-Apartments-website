import type { Metadata } from "next";
import { Suspense } from "react";
import BookingFlow from "@/components/booking/BookingFlow";
import { Container } from "@/components/ui/Layout";

export const metadata: Metadata = {
  title: "Book",
  description:
    "Check availability and book a Dunslim residence direct: the lowest rate, no booking fee and free cancellation up to 48 hours before arrival.",
  alternates: { canonical: "/book" },
  robots: { index: false, follow: true },
};

function Loading() {
  return (
    <Container wide>
      <div className="py-24">
        <p className="label-caps text-charcoal-60">Loading your booking</p>
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
