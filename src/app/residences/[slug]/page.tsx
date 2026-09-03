import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { CoverFlow } from "@/components/ui/CoverFlow";
import { Reveal } from "@/components/ui/Reveal";
import ResidenceCard from "@/components/residences/ResidenceCard";
import { residences, getResidence, rates, arrival, business } from "@/lib/content";
import { site } from "@/lib/site";
import { ResidenceSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import { money } from "@/lib/format";
import { directNightly } from "@/lib/pricing";

export function generateStaticParams() {
  return residences.map((r) => ({ slug: r.slug }));
}

/**
 * Each apartment gets its own share card and its own canonical address.
 *
 * It used to return a title and a description and nothing else, which meant
 * every apartment link pasted into WhatsApp — the way this spreads in Lusaka,
 * and the reason the site exists in the form it does — rendered the same
 * generic photograph of a different room. Somebody sending a friend "look at
 * this one" was sending a picture of something else.
 *
 * The photograph is the apartment's own first image, referenced absolutely,
 * because a share card is fetched by a crawler that has no page context to
 * resolve a relative path against.
 */
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const r = getResidence(params.slug);
  if (!r) return { title: "Residence" };

  const path = `/residences/${r.slug}`;
  const cover = r.photos[0];
  const image = cover ? `${site.url}/photos/${cover.id}.jpg` : "/og-default.jpg";

  return {
    title: r.name,
    description: r.summary,
    alternates: { canonical: path },
    openGraph: {
      title: `${r.name} — ${business.name}`,
      description: r.summary,
      url: path,
      type: "website",
      images: [
        {
          url: image,
          width: 1400,
          height: 1050,
          alt: `${r.name} — ${cover?.caption ?? "interior"}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${r.name} — ${business.name}`,
      description: r.summary,
      images: [image],
    },
  };
}

export default function ResidencePage({ params }: { params: { slug: string } }) {
  const residence = getResidence(params.slug);
  if (!residence) notFound();

  const { name, summary, description, amenities, photos, bedrooms, sleeps, slug, namedAfter } =
    residence;

  return (
    <>
      <ResidenceSchema residence={residence} />
      <BreadcrumbSchema
        trail={[
          { name: "Home", path: "/" },
          { name: "Residences", path: "/residences" },
          { name, path: `/residences/${slug}` },
        ]}
      />

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

              {/*
                The apartment reads down this column, with the price alongside.

                These paragraphs and the named-after note used to sit in a
                second two-column section further down the page, which left
                BOTH rows lopsided: here the summary and three figures ran out
                after about 180px against a 420px booking card, leaving a
                quarter of a screen of bare stone, and down there the column
                had text with nothing beside it. Moving the article up gives
                this row something to be as tall as, and leaves the section
                below carrying only the two specification blocks, which are a
                fair match for each other.
              */}
              <div className="mt-12 space-y-6">
                {description.map((para) => (
                  <p key={para} className="max-w-measure text-body text-charcoal">
                    {para}
                  </p>
                ))}
              </div>

              {/*
                Who the apartment is named for. A brass rule rather than a
                boxed-out panel: the brand uses a fine rule as its dividing
                device, and this is an aside, not a second article.

                `mt-16`, and it has to be a value that exists. This was `mt-10`,
                which is NOT on the Elite Builder spacing scale in
                tailwind.config.ts — that scale runs 0, 1, 2, 3, 4, 6, 8, 12,
                16, 24, 32, 40 and nothing else. An off-scale utility does not
                fall back to something close; it compiles to nothing at all, so
                the block had no top margin whatsoever and sat flush against the
                paragraph above it. Nothing in the markup looks wrong when this
                happens, which is what makes it worth a comment.
              */}
              {namedAfter ? (
                <div className="mt-16 border-l-2 border-brass pl-6">
                  <p className="label-caps text-charcoal-60">Named after</p>
                  <p className="mt-3 text-h3 font-light text-navy">
                    {namedAfter.person}{" "}
                    <span className="text-body text-charcoal-60">{namedAfter.lived}</span>
                  </p>
                  <p className="mt-3 max-w-measure text-body text-charcoal">{namedAfter.note}</p>
                </div>
              ) : null}
            </div>

            {/*
              Booking rail. `self-start` stops it stretching to the row, and
              sticky keeps the price and the action in reach the whole way down
              the article beside it.
            */}
            <div className="self-start lg:sticky lg:top-24 lg:col-span-5">
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

      {/*
        The gallery. A coverflow rather than a grid: one room square on at a
        time with the rest visibly waiting, which is nearer to how someone
        actually looks through a place they are thinking of staying in. On a
        dark ground, because the photograph is the whole point of the section
        and a white page competes with it.
      */}
      <Section ground="navy">
        <Container wide>
          <SectionHead onNavy eyebrow="The rooms" title={`Inside ${name}.`} />

          {/* The first photograph is already the page hero, so it is not repeated. */}
          <CoverFlow
            className="mt-16"
            label={`${name}, photographs`}
            slides={photos.slice(1).map((p) => ({
              name: p.id,
              alt: `${name} — ${p.caption}`,
              caption: p.caption,
            }))}
          />
        </Container>
      </Section>

      {/*
        The specification. This section used to carry the article as well, in a
        left column beside these lists, and the article has moved up to sit
        against the booking card where it gives that row something to be as tall
        as. What is left is two blocks of a similar size, which is what a
        two-column row wants.
      */}
      <Section ground="stone">
        <Container wide>
          <SectionHead eyebrow="The apartment" title={`What you get with ${name}.`} />

          <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <p className="label-caps text-charcoal-60">In the apartment</p>
              <ul className="mt-6 grid gap-px bg-navy/10 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="bg-stone px-4 py-4 text-body text-charcoal">
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/*
              What the rate includes.

              This was the smallest, faintest thing on the page: 15px — the
              site's absolute floor — greyed to charcoal-60, and packed into a
              wrapping row where the items ran together. That is backwards. It
              is the list of everything a guest gets without paying extra, which
              makes it the strongest argument on the page for booking direct,
              and it was being set like a footnote.

              Now 18px, the site's standard body size, at full contrast, one
              item per line so each reads as its own promise. The white panel
              lifts it off the stone ground, which is what makes it findable at
              a glance.
            */}
            <div className="lg:col-span-6">
              <div className="rounded-md bg-white p-6 ring-1 ring-navy/10 md:p-8">
                <p className="label-caps text-charcoal">Included in the rate</p>
                <ul className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
                  {rates.included.map((inc) => (
                    <li key={inc} className="flex items-start gap-3 text-body text-charcoal">
                      <Check
                        size={18}
                        strokeWidth={2}
                        aria-hidden
                        className="mt-[6px] shrink-0 text-brass"
                      />
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/*
        The other residences.

        These were two rows of text on a hairline grid. They WERE links, but
        nothing about them looked like one: no photograph, no arrow, no card,
        nothing to say the row could be tapped. A guest who has just read one
        apartment in full is exactly the person most likely to look at another,
        and this was the weakest invitation on the page.

        They now use ResidenceCard — the same component the homepage and
        /residences use, per the rule that a screen does not invent its own
        version of something the system already has. It leads with the
        photograph, which is the real click target, and carries its own
        "Check dates" action.
      */}
      <Section>
        <Container wide>
          <SectionHead eyebrow="Also available" title="The other two" />
          <div className="mt-12 grid gap-12 sm:grid-cols-2">
            {residences
              .filter((r) => r.slug !== slug)
              .map((r) => (
                <Reveal key={r.slug}>
                  <ResidenceCard residence={r} />
                </Reveal>
              ))}
          </div>
        </Container>
      </Section>

    </>
  );
}
