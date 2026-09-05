import type { Metadata } from "next";
import { Container, Section, SectionHead } from "@/components/ui/Layout";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import EnquiryForm from "@/components/booking/EnquiryForm";
import { rates, audience, residences, arrival, fleet } from "@/lib/content";
import { money } from "@/lib/format";
import { directNightly, longStayBand } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Long stays",
  description:
    "Serviced apartments in Lusaka for stays of a week, a month or a full engagement. Rates step down with length of stay and we invoice.",
  alternates: { canonical: "/long-stays" },
  openGraph: {
    title: "Long stays | Dunslim Apartments",
    description:
      "A week, a month or a full engagement in Lusaka. The rate steps down with the length of the stay and we invoice your employer.",
    url: "/long-stays",
  },
};

/** A worked example beats a percentage. */
const WEEKS = 6;

export default function LongStaysPage() {
  const example = residences[1] ?? residences[0];
  const nights = WEEKS * 7;
  // The engine's own band picker. This was a `.pop()`, which takes the last
  // match rather than the deepest one and only agreed by accident of ordering.
  const band = longStayBand(nights);
  const nightly =
    directNightly(example) * (band ? 1 - band.discountPct / 100 : 1);

  return (
    <>
      <BreadcrumbSchema
        trail={[
          { name: "Home", path: "/" },
          { name: "Long stays", path: "/long-stays" },
        ]}
      />

      <Section ground="stone" tight>
        <Container wide>
          <SectionHead
            as="h1"
            eyebrow="Long stays"
            title="Here for the engagement, not the weekend."
            intro={`Most of our guests are working. A consultant on a six-week posting, an NGO team between houses, a family waiting on a lease. None of that fits a nightly booking form, so this is the way in for stays measured in weeks. The ${fleet.model} comes with it, for the whole engagement.`}
          />
        </Container>
      </Section>

      {/* What actually changes on a long stay */}
      <Section>
        <Container wide>
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHead
                eyebrow="What changes"
                title="The rate steps down and so does the admin."
              />

              <dl className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
                <div className="flex items-baseline justify-between gap-6 py-6">
                  <dt className="text-body text-charcoal">One to six nights</dt>
                  <dd className="text-h3 font-light text-navy">{rates.directDiscountPct}% off</dd>
                </div>
                {rates.longStay.map((b) => (
                  <div key={b.minNights} className="flex items-baseline justify-between gap-6 py-6">
                    <dt className="text-body text-charcoal">
                      {b.label}
                      <span className="mt-1 block text-caption text-charcoal-80">
                        {b.minNights} nights or more
                      </span>
                    </dt>
                    <dd className="text-h3 font-light text-navy">+{b.discountPct}%</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 rounded-md bg-stone p-6">
                <p className="label-caps text-charcoal-80">For example</p>
                <p className="mt-3 max-w-measure text-body text-charcoal">
                  {example.name} for {WEEKS} weeks works out at{" "}
                  <span className="text-navy">{money(nightly)} a night</span>, all in: housekeeping,
                  power, water and Wi-Fi included, invoiced monthly if that suits your finance team.
                </p>
              </div>

              <ul className="mt-8 space-y-3">
                {[
                  // CONFIRM: do we invoice in USD for corporate clients? This said
                  // "in USD or kwacha" while every price on the site is kwacha only
                  // and the dollar switch was removed for quoting a stale rate.
                  "Invoiced monthly, in kwacha",
                  `A ${fleet.model} for the whole engagement, included`,
                  "Housekeeping on a schedule that suits you, not us",
                  `Checkout at ${arrival.lateCheckOut} on your last day`,
                  "One point of contact for the whole stay",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-body text-charcoal">
                    <span aria-hidden className="mt-3 h-px w-4 shrink-0 bg-brass" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            <Figure
              name="r1-desk"
              alt="A work desk in one of the residences"
              ratio="4 / 5"
              reveal
              className="rounded-md lg:col-span-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </Container>
      </Section>

      {/* The enquiry */}
      <Section ground="stone">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHead
                eyebrow="Talk to us"
                title="Tell us the shape of it."
                intro="Long stays are priced properly rather than run through a calculator, so this goes to a person. Approximate dates are fine. We would rather hear from you early than exactly."
              />
              <ul className="mt-12 grid gap-px bg-navy/10">
                {audience.map((who) => (
                  <Reveal as="li" key={who} className="bg-stone py-4">
                    <span className="text-body text-charcoal">{who}</span>
                  </Reveal>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <EnquiryForm />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
