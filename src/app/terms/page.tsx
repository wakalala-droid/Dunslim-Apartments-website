import type { Metadata } from "next";
import Link from "next/link";
import { Container, Section, SectionHead } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { business, rates, arrival, residences, fleet } from "@/lib/content";
import { money } from "@/lib/format";
import { publishedNightly, directNightly } from "@/lib/pricing";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

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
 *
 * AND THE CAR, which is the most urgent set on this list, because a guest is
 * being handed the keys to a vehicle and every one of these has a legal answer
 * whether or not this page states it:
 *   - what licence is needed and whether an international permit is required
 *   - insurance: who is covered to drive and the excess on a claim
 *   - fuel: handed over full and returned full, or metered
 *   - any mileage limit. No boundary: within Lusaka or beyond, owner, 11 Sept 2026
 *   - a minimum driver age
 *   - whether a second guest on the booking may drive it
 * The page below describes only what the owner has confirmed and says openly
 * that the driving terms are agreed in writing before the keys change hands.
 * Do not fill these in with a guess.
 */
export const metadata: Metadata = {
  title: "Booking terms",
  description:
    "The terms behind every Dunslim booking: cancelling, late checkout, how long-stay rates are applied and what is included in the nightly rate.",
  alternates: { canonical: "/terms" },
  openGraph: {
    title: "Booking terms | Dunslim Apartments",
    description:
      "Cancelling, late checkout, how the long-stay rates work and what is included in the nightly rate.",
    url: "/terms",
  },
};

const cheapest = residences.reduce((a, b) =>
  a.directNightlyZmw <= b.directNightlyZmw ? a : b,
);

export default function TermsPage() {
  return (
    <>
      <BreadcrumbSchema
        trail={[{ name: "Home", path: "/" }, { name: "Booking terms", path: "/terms" }]}
      />

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
              Cancellation terms are confirmed with you in writing when we confirm your booking,
              before anything is charged. Tell us by WhatsApp, by email or by phone as soon as you
              know, and we will let you know exactly where you stand.
            </p>
            <p className="mt-3 text-body text-charcoal">
              Nothing is charged before we have confirmed your booking. We would rather hear from
              you late than not hear from you.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">Arriving and leaving</h2>
            <p className="mt-3 text-body text-charcoal">
              Check in is from {arrival.checkIn}. Check out is by {arrival.lateCheckOut} when you
              book with us direct, rather than the {arrival.checkOut} the booking platforms carry.
              That later checkout is part of the direct rate and you do not need to ask for it.
            </p>
            <p className="mt-3 text-body text-charcoal">
              Arriving late is normal here and it is not a problem. Give us a rough time when you
              book so someone is at the apartment with the keys when you get there.
            </p>

            <h2 className="mt-12 text-h3 font-light text-navy">What you pay</h2>
            <p className="mt-3 text-body text-charcoal">
              The price you are shown is the price you pay. There is no booking fee, no cleaning
              fee, no service charge and nothing added at the payment step. Every rate on this site
              is in Kwacha and you are charged in Kwacha. We also hold a US dollar account for
              guests who would rather send a transfer in dollars; the amount is agreed with you
              first, because your bank sets that rate and not us.
            </p>
            <p className="mt-3 text-body text-charcoal">
              The full amount is due up front. Your dates are confirmed once the payment reaches
              us, and the accounts to pay into are shown the moment you finish the booking form and
              again on our{" "}
              <Link href="/pay" className="underline underline-offset-4 hover:text-navy">
                payment page
              </Link>
              . We never ask for a card number, a PIN or a mobile money code, on this site or in a
              message.
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

            <h2 className="mt-12 text-h3 font-light text-navy">The car</h2>
            <p className="mt-3 text-body text-charcoal">
              Each residence has its own {fleet.model}. It is not a pool car and it is not shared
              with the other apartments, but it is not automatic either: hire it separately and it
              is yours for the length of your stay, to drive within Lusaka or beyond.
            </p>
            <p className="mt-3 text-body text-charcoal">
              We do not offer a driver or an airport transfer. You collect the car at the apartment
              and drive it yourself, start to finish. It parks inside the gate with you.
            </p>
            <p className="mt-3 text-body text-charcoal">
              Hiring it costs {money(fleet.hireFeeZmw)} a {fleet.hireFeeUnit}, on top of the room
              rate. It is not part of the nightly rate and it is not charged unless you ask for it.
            </p>
            <p className="mt-3 text-body text-charcoal">
              The driving terms, which cover the licence we need to see, insurance and fuel, are
              sent to you in writing when the hire is confirmed and before any keys change hands. We
              would rather you read them in advance than be handed a form at the gate.
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
              already gone. The accounts to pay into are on screen as soon as you send the
              request, so you never wait on us to be able to pay.
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
