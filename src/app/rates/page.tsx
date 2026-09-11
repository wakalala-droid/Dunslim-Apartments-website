import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { Figure } from "@/components/ui/Figure";
import { residences, rates, arrival, faqs, business, fleet } from "@/lib/content";
import { CurrencyConverter } from "@/components/ui/Currency";
import { money } from "@/lib/format";
import { directNightly, publishedNightly, longStayBand } from "@/lib/pricing";
import { BreadcrumbSchema, FaqSchema } from "@/components/seo/StructuredData";

/*
  ITS OWN CANONICAL AND ITS OWN SHARE CARD.

  The root layout sets `alternates.canonical: "/"` and `openGraph.url` to the
  homepage and App Router metadata is inherited, so every page that did not
  override them told search engines it was a duplicate of the homepage. Verified
  on the live site: /rates, /residences, /location and /long-stays all declared
  the homepage as their canonical. That is an instruction to drop them from the
  index and this is the page that answers the question the site is built to win.

  The same inheritance handed every page the homepage's share card, so a link to
  the rates page pasted into WhatsApp previewed as the homepage, with the
  homepage's title and the homepage's address on it.

  The residence pages already did this properly. Every page now does.
*/
export const metadata: Metadata = {
  title: "Rates",
  description:
    "Nightly rates for every Dunslim residence, the long-stay ladder, what is included and what booking direct saves. No booking fee and nothing added at checkout.",
  alternates: { canonical: "/rates" },
  openGraph: {
    title: "Rates | Dunslim Apartments",
    description:
      "What a night costs in each residence, how the long-stay rates step down and what booking direct saves. No booking fee.",
    url: "/rates",
  },
};

/** Worked example, so the ladder is concrete rather than a claim. */
const EXAMPLE_NIGHTS = 14;

export default function RatesPage() {
  // The rate card had no structured data at all, on the page that answers the
  // question the whole site is built to win.

  const example = residences[1] ?? residences[0];
  /*
    The same band picker the pricing engine uses. This line chose the band with
    `.pop()`, which takes the LAST match rather than the deepest one and agreed
    with the engine only because the ladder happens to be written in ascending
    order. Reordering the ladder would have made the worked example disagree with
    the price a guest is actually charged, silently.
  */
  const band = longStayBand(EXAMPLE_NIGHTS);

  return (
    <>
      <BreadcrumbSchema trail={[{ name: "Home", path: "/" }, { name: "Rates", path: "/rates" }]} />
      <FaqSchema items={faqs} />

      <Section ground="stone" tight>
        <Container wide>
          <SectionHead
            as="h1"
            eyebrow="Rates"
            title="What it costs"
            intro="Every price here is what you actually pay. No booking fee, no cleaning fee, nothing added at the end."
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
                {/*
                  The names were plain text in both the table and these cards. A
                  guest reading the rate card and settling on one of them had to
                  go back and find it and the three pages the site most wants
                  found were getting no internal link from the page most likely
                  to be read before booking.
                */}
                <p className="text-h3 font-light text-navy">
                  <Link
                    href={`/residences/${r.slug}`}
                    className="inline-flex min-h-[44px] items-center underline-offset-4 hover:underline"
                  >
                    {r.name}
                  </Link>
                </p>
                <p className="mt-1 text-caption text-charcoal-80">
                  {r.bedrooms} {r.bedrooms === 1 ? "bedroom" : "bedrooms"} · sleeps {r.sleeps}
                </p>
                <dl className="mt-4 flex items-end justify-between gap-6">
                  <div>
                    <dt className="label-caps text-charcoal-60">On platforms</dt>
                    <dd className="mt-1 text-body text-charcoal-60 line-through">
                      {money(publishedNightly(r))}
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
                      <Link
                        href={`/residences/${r.slug}`}
                        className="inline-flex min-h-[44px] items-center underline-offset-4 hover:underline"
                      >
                        {r.name}
                      </Link>
                      <span className="mt-1 block text-caption text-charcoal-80">
                        {r.bedrooms} {r.bedrooms === 1 ? "bedroom" : "bedrooms"}
                      </span>
                    </th>
                    <td className="py-6 pr-6 text-body text-charcoal">{r.sleeps}</td>
                    <td className="py-6 pr-6 text-body text-charcoal-60 line-through">
                      {money(publishedNightly(r))}
                    </td>
                    <td className="py-6 text-h3 font-light text-navy">
                      {money(directNightly(r))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/*
            The second half of this used to explain that dollar figures elsewhere
            on the site were converted at K18 to the dollar. There are no dollar
            figures anywhere on the site and K18 is a long way from the real
            rate, so it sent a guest looking for a price that does not exist and
            quoted them a stale one on the way.
          */}
          <p className="mt-6 max-w-measure text-caption text-charcoal-80">
            Rates are per night in Kwacha and include everything listed below. The struck-through
            figure is what the same night costs on a booking platform. Booking here is always{" "}
            {rates.directDiscountPct} per cent below it.
          </p>

          {/*
            The same prices in the currency the guest budgets in. It converts at
            a live rate and disappears entirely if that rate cannot be fetched,
            rather than falling back to a stored one. See components/ui/Currency.
          */}
          <CurrencyConverter
            className="mt-10 max-w-[560px]"
            amounts={[
              ...residences.map((r) => ({
                label: `${r.name}, a night`,
                zmw: directNightly(r),
              })),
              {
                label: `${fleet.model}, a ${fleet.hireFeeUnit}`,
                zmw: fleet.hireFeeZmw,
              },
            ]}
          />
        </Container>
      </Section>

      {/* The long-stay ladder, with a worked example */}
      <Section ground="navy">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/*
              The heading travels with the block beside it. Left as a normal
              grid item it stretched to a row set by much taller content and
              stranded a few hundred pixels of bare ground beneath itself.
              `self-start` stops the stretch and sticky turns what was a void
              into a heading that stays with what it names.
            */}
            <div className="self-start lg:sticky lg:top-24 lg:col-span-6">
              <SectionHead
                onNavy
                eyebrow="Long stays"
                title="Longer stays cost less per night"
                intro="It comes off automatically at checkout. You do not need a code and you do not need to ask."
              />
            </div>

            <div className="lg:col-span-6">
              <dl className="divide-y divide-white/15 border-y border-white/15">
                <div className="flex items-baseline justify-between gap-6 py-6">
                  <dt className="text-body text-navy-20">One to five nights</dt>
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

              <p className="mt-6 max-w-measure text-caption text-navy-20">
                Each rate comes off the direct price rather than off the one above it, so they do
                not simply add up. The worked example below is the real figure.
              </p>

              {band ? (
                <div className="mt-8 rounded-md bg-white/5 p-6 ring-1 ring-white/10">
                  <Eyebrow tone="onNavy">For example</Eyebrow>
                  <p className="mt-4 text-body text-navy-20">
                    {example.name}, {EXAMPLE_NIGHTS} nights. Published at{" "}
                    {money(publishedNightly(example))} a night, that is{" "}
                    {money(publishedNightly(example) * EXAMPLE_NIGHTS)}. Booked direct with the{" "}
                    {band.discountPct} per cent long-stay rate applied, you pay{" "}
                    <span className="text-white">
                      {money(
                        publishedNightly(example) *
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
                title="What is included"
                intro="None of this is an extra. It is all in the nightly rate."
              />
              <Figure
                name="r1-kitchen-1"
                alt="The kitchen in Mandela, fridge and microwave"
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

              <dl className="mt-12 grid gap-8 sm:grid-cols-2">
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
              </dl>
            </div>
          </div>
        </Container>
      </Section>

      {/* Questions */}
      <Section>
        <Container wide>
          <SectionHead eyebrow="Before you book" title="Questions we get asked" />
          <dl className="mt-12 max-w-[860px] divide-y divide-navy/10 border-y border-navy/10">
            {faqs.map((f) => (
              <Reveal key={f.q} className="py-8">
                <dt className="text-h3 font-light text-navy">{f.q}</dt>
                <dd className="mt-3 max-w-measure text-body text-charcoal">{f.a}</dd>
              </Reveal>
            ))}
          </dl>

          <p className="mt-12 max-w-measure text-body text-charcoal">
            Anything else, message us on WhatsApp or call {business.phone}.
          </p>

          <ButtonLink href="/book" size="lg" className="mt-8">
            Check availability
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
