import type { Metadata } from "next";
import { Container, Section, SectionHead } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { business, rates, arrival, residences } from "@/lib/content";
import { money } from "@/lib/format";
import { publishedNightly, directNightly } from "@/lib/pricing";

/**
 * BOOKING TERMS.
 *
 * "T&Cs apply" sat under free cancellation, under late checkout and under the
 * long-stay rates as plain text with nothing to link to. Three of the four
 * claims a cautious corporate booker checks first, each carrying a disclaimer
 * that pointed nowhere.
 *
 * SCOPE, AND WHY IT IS NARROW ON PURPOSE.
 *
 * Everything on this page is a restatement of a promise the site already makes
 * somewhere else, drawn from the same content file so the two cannot drift
 * apart. Nothing here was invented. A terms page is the one page a guest may
 * later rely on, so inventing a deposit rule or a damage policy to fill it out
 * would be worse than leaving the gap visible.
 *
 * CONFIRM, before this page can be called complete. Each of these is a real
 * policy question only the owner can answer and until they are answered the
 * page says plainly that they are agreed in writing at confirmation:
 *   - a deposit: any, how much, when it is returned
 *   - damage and breakages
 *   - smoking, pets, visitors, quiet hours
 *   - the licence number, so it can be quoted in full
 *   - the registered company name and address behind "Dunslim Group"
 */
export const metadata: Metadata = {
  title: "Booking terms",
  description:
    "The terms behind every Dunslim booking: free cancellation up to 48 hours before arrival, late checkout, how long-stay rates are applied and what is included in the nightly rate.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Booking terms | Dunslim Apartments",
    description:
      "Free cancellation, late checkout, how the long-stay rates work and what is included in the nightly rate.",
    url: "/terms",
  },
};

const cheapest = residences.reduce((a, b) =>
  a.directNightlyZmw <= b.directNightlyZmw ? a : b,
);

export default function TermsPage() {
  return (
    <>
      <Section ground="stone" tight>
        <Container wide>
          <SectionHead
            as="h1"
            eyebrow="Booking terms"
            title="The terms behind every booking"
            intro="Short, because there is not much to it. Everything below is what the rest of this site already promises you, written out in one place."
          />
        </Container>
      </Section>

      <Section>
        <Container wide>
          <div className="max-w-measure">
            <h2 className="text-h3 font-light text-navy">Cancelling</h2>
            <p className="mt-3 text-body text-charcoal">
              You can cancel free of charge up to {arrival.cancellationHours} hours before your
              arrival date, at {arrival.checkIn} on the day you were due to arrive. Tell us by
              WhatsApp, by email or by phone. Nothing is charged before we have confirmed your
              booking, so a cancellation inside that window costs you nothing at all.
            </p>
            <p className="mt-3 text-body text-charcoal">
              Cancelling later than that, or not arriving, is settled with us directly. We would
              rather hear from you late than not hear from you.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">Arriving and leaving</h2>
            <p className="mt-3 text-body text-charcoal">
              Check in is from {arrival.checkIn}. Check out is by {arrival.lateCheckOut} when you
              book with us direct, rather than the {arrival.checkOut} the booking platforms carry.
              That later checkout is part of the direct rate and you do not need to ask for it.
            </p>
            <p className="mt-3 text-body text-charcoal">
              Arriving late is normal here and it is not a problem. Tell us your flight or your
              arrival time when you book and someone will be at the apartment with the keys.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">What you pay</h2>
            <p className="mt-3 text-body text-charcoal">
              The price you are shown is the price you pay. There is no booking fee, no cleaning
              fee, no service charge and nothing added at the payment step. Every rate on this site
              is in Kwacha and you are charged in Kwacha.
            </p>
            <p className="mt-3 text-body text-charcoal">
              Booking direct is {rates.directDiscountPct} per cent below the rate the same
              apartment carries on a booking platform. For {cheapest.name} that is{" "}
              {money(publishedNightly(cheapest))} a night published, {money(directNightly(cheapest))}{" "}
              booked here.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">Longer stays</h2>
            <p className="mt-3 text-body text-charcoal">
              The long-stay rates come off automatically at checkout. You do not need a code and you
              do not need to ask. They are applied to the direct rate, not on top of each other:
              the deepest band your stay qualifies for is the one you get.
            </p>
            <ul className="mt-4 space-y-2">
              {rates.longStay.map((b) => (
                <li key={b.minNights} className="text-body text-charcoal">
                  {b.minNights} nights or more: a further {b.discountPct} per cent off.
                </li>
              ))}
            </ul>
            <p className="mt-4 text-body text-charcoal">
              A stay longer than a month is usually priced as a whole engagement rather than run
              through the ladder and we can invoice your employer for it.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">What is included</h2>
            <p className="mt-3 text-body text-charcoal">
              All of this is in the nightly rate and none of it is an extra:{" "}
              {rates.included.map((i) => i.toLowerCase()).join(", ")}.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">How a booking becomes a booking</h2>
            <p className="mt-3 text-body text-charcoal">
              What you send from this site is a request, not a confirmed stay. It reaches our
              reservations inbox and a person answers it, usually within a few hours. Your dates are
              not held until we have confirmed them and we will tell you plainly if they have
              already gone. Payment instructions follow the confirmation, for whichever method you
              chose.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">Anything else</h2>
            <p className="mt-3 text-body text-charcoal">
              Anything not covered here is agreed with you in writing before your stay is confirmed,
              so you never arrive to a condition you have not seen. Ask us anything on WhatsApp or
              on {business.phone} and you will get a straight answer.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">Who you are booking with</h2>
            <p className="mt-3 text-body text-charcoal">
              {business.name}, {business.street}, {business.city}, {business.country}. Part of{" "}
              {business.parent}. We hold a {business.licence.label}
              {business.licence.number ? `, number ${business.licence.number}` : ""}, valid to{" "}
              {business.licence.validUntil}.
            </p>

            <div className="mt-12 flex flex-wrap gap-3">
              <ButtonLink href="/book">Check availability</ButtonLink>
              <ButtonLink href="/rates" variant="secondary">
                See the rates
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
