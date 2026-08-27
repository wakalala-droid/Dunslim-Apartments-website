import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { residences, getResidence, rates, arrival } from "@/lib/content";
import { money } from "@/lib/format";
import { directNightly } from "@/lib/pricing";

export function generateStaticParams() {
  return residences.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = getResidence(params.slug);
  if (!r) return { title: "Residence" };
  return { title: r.name, description: r.summary };
}

export default function ResidencePage({ params }: { params: { slug: string } }) {
  const residence = getResidence(params.slug);
  if (!residence) notFound();

  const { name, summary, description, amenities, photos, bedrooms, sleeps, slug } = residence;

  return (
    <>
      {/* The room, before the words. */}
      <section className="on-navy under-header relative isolate flex min-h-[420px] items-end bg-navy md:min-h-[68vh]">
        <Figure
          name={photos[0]?.id ?? ""}
          alt={`${name} — ${photos[0]?.caption ?? "interior"}`}
          cover
          priority
          scrim="bottom"
          sizes="100vw"
          className="absolute inset-0 -z-10"
        />
        <Container wide className="pb-12 pt-12 md:pb-16 md:pt-16">
          <Eyebrow tone="onNavy">Residence</Eyebrow>
          <h1 className="mt-4 text-h1 font-extralight text-white md:text-[56px] md:leading-[1.05]">
            {name}
          </h1>
        </Container>
      </section>

      <Section ground="stone" tight>
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="max-w-measure text-lead text-charcoal">{summary}</p>

              <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-4">
                <div>
                  <dt className="label-caps text-charcoal-60">Bedrooms</dt>
                  <dd className="mt-2 text-h3 font-light text-navy">{bedrooms}</dd>
                </div>
                <div>
                  <dt className="label-caps text-charcoal-60">Sleeps</dt>
                  <dd className="mt-2 text-h3 font-light text-navy">{sleeps}</dd>
                </div>
                <div>
                  <dt className="label-caps text-charcoal-60">Per night</dt>
                  <dd className="mt-2 text-h3 font-light text-navy">
                    {money(directNightly(residence))}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Booking rail — the action stays in reach the whole way down. */}
            <div className="lg:col-span-5">
              <div className="rounded-md bg-white p-6 shadow-2 ring-1 ring-navy/10">
                <p className="text-caption text-charcoal-80">Booked direct</p>
                <p className="mt-2 text-h2 font-extralight text-navy">
                  {money(directNightly(residence))}
                  <span className="ml-2 text-body text-charcoal-60">per night</span>
                </p>

                <hr className="rule-hair my-6" />

                <ul className="space-y-3 text-caption text-charcoal-80">
                  <li className="flex gap-3">
                    <Check size={16} strokeWidth={2} className="mt-px shrink-0 text-brass" aria-hidden />
                    {rates.directDiscountPct}% below the platform rate
                  </li>
                  <li className="flex gap-3">
                    <Check size={16} strokeWidth={2} className="mt-px shrink-0 text-brass" aria-hidden />
                    Free cancellation to {arrival.cancellationHours}h before arrival
                  </li>
                  <li className="flex gap-3">
                    <Check size={16} strokeWidth={2} className="mt-px shrink-0 text-brass" aria-hidden />
                    Checkout at {arrival.lateCheckOut}, at no charge
                  </li>
                  <li className="flex gap-3">
                    <Check size={16} strokeWidth={2} className="mt-px shrink-0 text-brass" aria-hidden />
                    No booking fee, nothing added at checkout
                  </li>
                </ul>

                <ButtonLink href={`/book?residence=${slug}`} size="lg" className="mt-8 w-full">
                  Check dates
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Photographs — the first runs wide, the rest sit two up. */}
      <Section>
        <Container wide>
          {/* The first photograph is already the page hero, so it is not repeated. */}
          <div className="grid gap-6 md:grid-cols-2">
            {photos.slice(1).map((p) => (
              <figure key={p.id}>
                <Figure
                  name={p.id}
                  alt={`${name} — ${p.caption}`}
                  ratio="4 / 3"
                  reveal
                  className="rounded-md"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <figcaption className="mt-3 text-caption text-charcoal-80">{p.caption}</figcaption>
              </figure>
            ))}
          </div>
        </Container>
      </Section>

      {/* The apartment, described plainly */}
      <Section ground="stone">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <SectionHead eyebrow="The apartment" title="What it is like to stay here." />
              <div className="mt-8 space-y-6">
                {description.map((para) => (
                  <p key={para} className="max-w-measure text-body text-charcoal">
                    {para}
                  </p>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <p className="label-caps text-charcoal-60">In the apartment</p>
              <ul className="mt-6 grid gap-px bg-navy/10 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="bg-stone px-4 py-4 text-body text-charcoal">
                    {a}
                  </li>
                ))}
              </ul>

              <p className="label-caps mt-12 text-charcoal-60">Included in the rate</p>
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                {rates.included.map((inc) => (
                  <li key={inc} className="flex items-center gap-2 text-caption text-charcoal-80">
                    <Check size={14} strokeWidth={2} className="text-brass" aria-hidden />
                    {inc}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      {/* The other residences */}
      <Section>
        <Container wide>
          <SectionHead eyebrow="Also available" title="The other residences." />
          <ul className="mt-12 grid gap-px bg-navy/10 sm:grid-cols-2">
            {residences
              .filter((r) => r.slug !== slug)
              .map((r) => (
                <li key={r.slug} className="bg-white">
                  <Link
                    href={`/residences/${r.slug}`}
                    className="flex items-baseline justify-between gap-6 p-6 transition-colors duration-micro hover:bg-stone-40"
                  >
                    <span>
                      <span className="block text-h3 font-light text-navy">{r.name}</span>
                      <span className="mt-1 block text-caption text-charcoal-80">
                        {r.bedrooms} {r.bedrooms === 1 ? "bedroom" : "bedrooms"} · sleeps {r.sleeps}
                      </span>
                    </span>
                    <span className="shrink-0 text-body text-navy">
                      {money(directNightly(r))}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
