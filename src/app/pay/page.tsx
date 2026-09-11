import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { Container, Section, SectionHead } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import PayNow from "@/components/booking/PayNow";
import { business, payments, canPayNow, arrival } from "@/lib/content";

/**
 * A PAGE TO SEND SOMEBODY WHO IS READY TO PAY
 * ---------------------------------------------------------------------------
 * The booking flow shows the same accounts on its confirmation screen, but that
 * screen is gone the moment the guest closes the tab. This is the link to send
 * on WhatsApp, and the one to give a guest who booked by phone and never
 * touched the form.
 *
 * NOINDEX, deliberately. A "pay Dunslim Apartments" page ranking in search is
 * an invitation to whoever clones it, and nobody should ever reach these
 * account numbers from a search result rather than from us. It carries no
 * amount and no reference for the same reason: this page only ever says where
 * money goes, never how much anyone owes.
 */
export const metadata: Metadata = {
  title: "Paying for your stay",
  description: "How to pay for a booking at Dunslim Apartments.",
  alternates: { canonical: "/pay" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Paying for your stay | Dunslim Apartments",
    description: "How to pay for a booking at Dunslim Apartments.",
    url: "/pay",
  },
};

export default function PayPage() {
  const ready = canPayNow();

  return (
    <Section tight>
      <Container wide>
        <div className="mx-auto max-w-[720px] py-8 md:py-16">
          <SectionHead
            as="h1"
            eyebrow="Payment"
            title="Paying for your stay"
            intro={
              ready
                ? "Pay by mobile money or bank transfer, then send us the confirmation. Put your booking reference in the reference field so the payment lands against your stay."
                : "Message us and we will send you the account details for your booking."
            }
          />

          {ready ? (
            <>
              <PayNow className="mt-12" />

              <div className="mt-12 flex gap-4 rounded-md bg-stone p-6">
                <ShieldCheck size={20} strokeWidth={1.5} className="mt-1 shrink-0 text-brass" aria-hidden />
                <div>
                  <p className="text-body text-navy">Two things we will never do</p>
                  <p className="mt-2 max-w-measure text-body text-charcoal">
                    We never ask for a card number, a PIN or a mobile money code, on this site or
                    in a message. And the accounts on this page are the only ones we collect
                    through. If anybody sends you different details in our name, ring{" "}
                    {business.phone} before you send a ngwee.
                  </p>
                </div>
              </div>

              <div className="mt-12 border-t border-navy/10 pt-8">
                <p className="text-body text-charcoal">
                  {payments.depositPct > 0
                    ? `A deposit of ${payments.depositPct} per cent holds your dates. The balance is due before you check in at ${arrival.checkIn}.`
                    : "Unless we have agreed otherwise with you in writing, the amount to send is the total on your booking."}
                </p>
              </div>
            </>
          ) : (
            /*
              Nothing invented. Until the accounts are in content.ts this page
              says the one true thing: ask a person.
            */
            <div className="mt-12 rounded-md bg-stone p-6">
              <p className="max-w-measure text-body text-charcoal">
                Our account details are not published on this site yet. Message us on WhatsApp or
                ring {business.phone} with your booking reference and we will send them to you
                straight away.
              </p>
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-3">
            <ButtonLink href={`https://wa.me/${business.whatsapp}`}>Message us on WhatsApp</ButtonLink>
            <ButtonLink href="/book" variant="secondary">
              Check other dates
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
