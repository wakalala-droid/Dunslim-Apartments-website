import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Figure } from "@/components/ui/Figure";
import { residences, rates, arrival, faqs, business } from "@/lib/content";
import { money } from "@/lib/format";
import { directNightly } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Rates",
  description:
    "Nightly rates for all three Dunslim residences, the long-stay ladder, what is included, and what booking direct saves. No booking fee and nothing added at checkout.",
};

/** Worked example, so the ladder is concrete rather than a claim. */
const EXAMPLE_NIGHTS = 14;

export default function RatesPage() {
  const example = residences[1] ?? residences[0];
  const band = [...rates.longStay].filter((b) => EXAMPLE_NIGHTS >= b.minNights).pop();

  return (
    <>
      <Section ground="stone" tight>
        <Container wide>
          <SectionHead
            as="h1"
            eyebrow="Rates"
            title="What it costs, in full, before you book."
            intro="Every figure on this page is what you will actually pay. There is no booking fee, no cleaning fee and no service charge added at the payment step."
          />
        </Container>
      </Section>

      {/* The rate card */}
      <Section>
        <Container wide>
          {/*
            Below md the rate table becomes one card per residence.
            responsive_design_system.md, DATA TABLE RULE: a horizontal-scroll
            table is a last resort, never the default.
          */}
          <ul className="grid gap-px bg-navy/10 md:hidden">
            {residences.map((r) => (
              <li key={r.slug} className="bg-white py-6">
                <p className="text-h3 font-light text-navy">{r.name}</p>
                <p className="mt-1 text-caption text-charcoal-80">
                  {r.bedrooms} {r.bedrooms === 1 ? "bedroom" : "bedrooms"} · sleeps {r.sleeps}
                </p>
                <dl className="mt-4 flex items-end justify-between gap-6">
                  <div>
                    <dt className="label-caps text-charcoal-60">On platforms</dt>
                    <dd className="mt-1 text-body text-charcoal-60 line-through">
                      {money(r.nightlyUsd * (1 + rates.platformUpliftPct / 100))}
                    </dd>
                  </div>
                  <div className="text-right">
                    <dt className="label-caps text-charcoal-80">Booked direct</dt>
                    <dd className="mt-1 text-h3 font-light text-navy">{money(directNightly(r))}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Nightly rates by residence, booked direct and on booking platforms
              </caption>
              <thead>
                <tr className="border-b border-navy/20">
                  <th scope="col" className="label-caps pb-4 pr-6 text-charcoal-60">
                    Residence
                  </th>
                  <th scope="col" className="label-caps pb-4 pr-6 text-charcoal-60">
                    Sleeps
                  </th>
                  <th scope="col" className="label-caps pb-4 pr-6 text-charcoal-60">
                    On platforms
                  </th>
                  <th scope="col" className="label-caps pb-4 text-charcoal-80">
                    Booked direct
                  </th>
                </tr>
              </thead>
              <tbody>
                {residences.map((r) => (
                  <tr key={r.slug} className="border-b border-navy/10">
                    <th scope="row" className="py-6 pr-6 text-body text-navy">
                      {r.name}
                      <span className="mt-1 block text-caption text-charcoal-80">
                        {r.bedrooms} {r.bedrooms === 1 ? "bedroom" : "bedrooms"}
                      </span>
                    </th>
                    <td className="py-6 pr-6 text-body text-charcoal">{r.sleeps}</td>
                    <td className="py-6 pr-6 text-body text-charcoal-60 line-through">
                      {money(r.nightlyUsd * (1 + rates.platformUpliftPct / 100))}
                    </td>
                    <td className="py-6 text-h3 font-light text-navy">
                      {money(directNightly(r))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 max-w-measure text-caption text-charcoal-80">
            Rates are per night in US dollars and include everything listed below. Kwacha figures
            shown elsewhere on the site are approximate, converted at K{rates.zmwPerUsd} to the
            dollar.
          </p>
        </Container>
      </Section>

      {/* The long-stay ladder, with a worked example */}
      <Section ground="navy">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHead
                onNavy
                eyebrow="Long stays"
                title="The longer you stay, the less each night costs."
                intro="Applied automatically at checkout. Nobody has to ask for it, and there is no code to remember."
              />
            </div>

            <div className="lg:col-span-6">
              <dl className="divide-y divide-white/15 border-y border-white/15">
                <div className="flex items-baseline justify-between gap-6 py-6">
                  <dt className="text-body text-navy-20">One to six nights</dt>
                  <dd className="text-h3 font-light text-white">{rates.directDiscountPct}%</dd>
                </div>
                {rates.longStay.map((b) => (
                  <div key={b.minNights} className="flex items-baseline justify-between gap-6 py-6">
                    <dt className="text-body text-navy-20">
                      {b.label}
                      <span className="mt-1 block text-caption text-navy-40">
                        {b.minNights} nights or more
                      </span>
                    </dt>
                    <dd className="text-h3 font-light text-white">
                      +{b.discountPct}%
                    </dd>
                  </div>
                ))}
              </dl>

              {band ? (
                <div className="mt-8 rounded-md bg-white/5 p-6 ring-1 ring-white/10">
                  <Eyebrow tone="onNavy">For example</Eyebrow>
                  <p className="mt-4 text-body text-navy-20">
                    {example.name}, {EXAMPLE_NIGHTS} nights. Published at{" "}
                    {money(example.nightlyUsd)} a night, that is{" "}
                    {money(example.nightlyUsd * EXAMPLE_NIGHTS)}. Booked direct with the{" "}
                    {band.discountPct} per cent long-stay rate applied, you pay{" "}
                    <span className="text-white">
                      {money(
                        example.nightlyUsd *
                          EXAMPLE_NIGHTS *
                          (1 - rates.directDiscountPct / 100) *
                          (1 - band.discountPct / 100),
                      )}
                    </span>
                    .
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </Container>
      </Section>

      {/* What's included */}
      <Section ground="stone">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHead
                eyebrow="Included"
                title="In the rate, not on the bill."
                intro="These are not extras. They are part of the nightly rate and they are never itemised at the end."
              />
              <Figure
                name="r1-kitchen"
                alt="A Dunslim kitchen"
                ratio="4 / 3"
                className="mt-12 rounded-md"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
            <div className="lg:col-span-7">
              <ul className="grid gap-px bg-navy/10 sm:grid-cols-2">
                {rates.included.map((inc) => (
                  <li key={inc} className="flex items-center gap-3 bg-stone px-4 py-4">
                    <Check size={16} strokeWidth={2} className="shrink-0 text-brass" aria-hidden />
                    <span className="text-body text-charcoal">{inc}</span>
                  </li>
                ))}
              </ul>

              <dl className="mt-12 grid gap-8 sm:grid-cols-3">
                <div>
                  <dt className="label-caps text-charcoal-60">Check in</dt>
                  <dd className="mt-2 text-h3 font-light text-navy">{arrival.checkIn}</dd>
                </div>
                <div>
                  <dt className="label-caps text-charcoal-60">Check out</dt>
                  <dd className="mt-2 text-h3 font-light text-navy">
                    {arrival.lateCheckOut}
                    <span className="mt-1 block text-caption text-charcoal-80">
                      Booked direct. Otherwise {arrival.checkOut}.
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-charcoal-60">Free cancellation</dt>
                  <dd className="mt-2 text-h3 font-light text-navy">
                    {arrival.cancellationHours}h
                    <span className="mt-1 block text-caption text-charcoal-80">
                      Before arrival.
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      {/* Questions */}
      <Section>
        <Container wide>
          <SectionHead eyebrow="Before you book" title="Questions guests actually ask." />
          <dl className="mt-12 max-w-[860px] divide-y divide-navy/10 border-y border-navy/10">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i} className="py-8">
                <dt className="text-h3 font-light text-navy">{f.q}</dt>
                <dd className="mt-3 max-w-measure text-body text-charcoal">{f.a}</dd>
              </Reveal>
            ))}
          </dl>

          <p className="mt-12 max-w-measure text-body text-charcoal">
            Anything else, message us on WhatsApp or call {business.phone}. A person answers.
          </p>

          <ButtonLink href="/book" size="lg" className="mt-8">
            Check availability
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
