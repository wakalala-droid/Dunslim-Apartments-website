import Link from "next/link";
import { ArrowRight, ShieldCheck, Clock, BadgeCheck } from "lucide-react";
import Hero from "@/components/home/Hero";
import SearchBar from "@/components/booking/SearchBar";
import ResidenceCard from "@/components/residences/ResidenceCard";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { RevealRule } from "@/components/ui/RevealText";
import {
  business,
  residences,
  assurances,
  rates,
  arrival,
  neighbourhood,
  audience,
} from "@/lib/content";
import { LodgingSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import { money } from "@/lib/format";
import { directNightly } from "@/lib/pricing";

export default function HomePage() {
  const cheapest = residences.reduce((a, b) => (a.nightlyUsd <= b.nightlyUsd ? a : b));

  return (
    <>
      {/* Machine-readable description of the business and its rates, so search
          can surface the offer rather than guessing at it from prose. */}
      <LodgingSchema />
      <BreadcrumbSchema trail={[{ name: "Home", path: "/" }]} />

      {/* ---------------------------------------------------------------
          HERO
          A full-bleed photograph with a navy gradient rising from the foot,
          so the display line has a ground to sit on rather than fighting the
          image. The identity itself never touches the photograph — it stays on
          the solid header bar above, per Brand Guidelines p.12.
      ---------------------------------------------------------------- */}
      {/* The search card is passed in as the hero's own last beat, so its
          entrance belongs to the same sequence rather than running on a
          separate clock. It is the first thing a visitor can actually do. */}
      <Hero
        eyebrow="Serviced residences"
        headline="A room that works as well as it looks."
        intro="Three serviced apartments on Makeni Road. Backup power, parking inside the gate, and it is always cheaper to book with us than through a platform."
        metaLeft={`${business.city} · ${business.country}`}
        metaRight={`${business.street}`}
        /* The fixed brand line, exactly as the cover carries it. The parent
           company already appears in the footer; repeating it here ran to
           three cluttered lines of letterspaced caps on a phone. */
        footNote={business.brandLine}
      >
        <Container wide>
          <SearchBar layout="inline" className="shadow-3" />
          <p className="mt-4 text-caption text-charcoal-80">
            From {money(directNightly(cheapest))} a night · no booking fee · free cancellation up to{" "}
            {arrival.cancellationHours} hours before arrival
          </p>
        </Container>
      </Hero>

      {/* ---------------------------------------------------------------
          THE BOOK-DIRECT PROMISE
          Limehome, Numa and Locke all put this on the homepage in plain words.
          Every promise here is honoured in the pricing engine, not just written.
      ---------------------------------------------------------------- */}
      <Section tight>
        <Container wide>
          <ul className="grid gap-12 border-t border-navy/10 pt-12 md:grid-cols-3">
            {[
              {
                icon: BadgeCheck,
                title: "Always cheaper here",
                body: `Book with us and you pay ${rates.directDiscountPct}% less than on Booking.com or Airbnb. No booking fee, and the price you see first is the price you pay.`,
              },
              {
                icon: ShieldCheck,
                title: "Free cancellation",
                body: `Cancel up to ${arrival.cancellationHours} hours before you arrive and it costs you nothing. Plans change.`,
              },
              {
                icon: Clock,
                title: "Late checkout, free",
                body: `Check out at ${arrival.lateCheckOut} instead of ${arrival.checkOut} when you book with us. Handy if your flight is in the afternoon.`,
              },
            ].map((item, i) => (
              <Reveal as="li" key={item.title} delay={i} className="flex flex-col">
                <item.icon size={22} strokeWidth={1.25} className="text-brass" aria-hidden />
                <h2 className="mt-4 text-h3 font-light text-navy">{item.title}</h2>
                <p className="mt-3 max-w-measure text-body text-charcoal">
                  {item.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------
          THE THREE RESIDENCES
      ---------------------------------------------------------------- */}
      <Section id="residences" ground="stone">
        <Container wide>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHead
              eyebrow="The residences"
              title="Three apartments, same standard."
              intro="All three are furnished, serviced and run the same way. The only real difference is how much space you need."
            />
            <ButtonLink href="/residences" variant="secondary">
              All residences
            </ButtonLink>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {residences.map((r, i) => (
              <Reveal key={r.slug} delay={i}>
                <ResidenceCard residence={r} priority={i === 0} />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------
          WHAT ACTUALLY DECIDES THE BOOKING
          In Lusaka these are conversion features, not footnotes. Competing
          listings lead with backup power for a reason.
      ---------------------------------------------------------------- */}
      <Section ground="navy">
        <Container wide>
          {/*
            The heading sits above the row rather than inside the left column.
            Stacked, the heading plus a 4/5 portrait made that column roughly
            twice the height of the list beside it, and the list — being
            `self-start` — left about 550px of empty navy underneath. Moving the
            heading out leaves the row carrying only the photograph and the
            list, so the two are free to match: the list sets the height and the
            photograph, holding no ratio of its own, stretches to meet it.
          */}
          <SectionHead
            onNavy
            eyebrow="Why guests stay"
            title="The things guests ask about first."
            intro="Before anyone asks about the decor, they ask about power, water and security. So here are our answers."
          />

          <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal
              variant="image"
              className="relative hidden min-h-[260px] overflow-hidden rounded-md lg:col-span-5 lg:block"
            >
              <Figure
                name="detail-bath"
                alt="Bathroom detail"
                cover
                className="absolute inset-0"
                sizes="(max-width: 1024px) 0px, 42vw"
              />
            </Reveal>

            <ul className="grid content-between gap-x-12 gap-y-12 sm:grid-cols-2 lg:col-span-7">
              {assurances.map((a, i) => (
                <Reveal as="li" key={a.title} delay={i}>
                  <RevealRule />
                  <h3 className="mt-6 text-h3 font-light text-white">{a.title}</h3>
                  <p className="mt-3 max-w-measure text-body text-navy-20">{a.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------
          LONG STAYS
          Numa discounts 7+ nights, Blueground's whole business is month-plus.
          For Dunslim this is the highest-value guest: the consultant on a
          six-week engagement.
      ---------------------------------------------------------------- */}
      <Section>
        <Container wide>
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <Figure
              name="detail-living"
              alt="A living room set up for a long stay"
              ratio="5 / 4"
              reveal
              className="rounded-md lg:col-span-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="lg:col-span-6">
              <SectionHead
                eyebrow="Long stays"
                title="Staying a few weeks?"
                intro="Most people who stay with us are here for work, not a holiday. The longer you stay the less you pay per night, and it comes off automatically."
              />

              <dl className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
                <Reveal as="div" className="flex items-baseline justify-between gap-6 py-6">
                  <dt className="text-body text-charcoal">One to six nights</dt>
                  <dd className="text-h3 font-light text-navy">{rates.directDiscountPct}% off</dd>
                </Reveal>
                {rates.longStay.map((band) => (
                  <Reveal
                    as="div"
                    key={band.minNights}
                    className="flex items-baseline justify-between gap-6 py-6"
                  >
                    <dt className="text-body text-charcoal">{band.label}</dt>
                    <dd className="text-h3 font-light text-navy">
                      {band.discountPct}%
                      <span className="ml-2 text-caption text-charcoal-80">on top</span>
                    </dd>
                  </Reveal>
                ))}
              </dl>

              <ButtonLink href="/rates" variant="secondary" className="mt-8">
                See the full rate card
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------
          WHO STAYS HERE
          The Growth Proposal records that no listing yet carries a calculated
          review score — there are not enough verified bookings. Rather than
          invent testimonials, this section says who the place is built for.
          Real, permissioned reviews replace it the moment they exist.
      ---------------------------------------------------------------- */}
      <Section ground="stone">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHead
                eyebrow="Who stays here"
                title="Who stays with us"
                intro="Dunslim Apartments is part of the Dunslim Group. Most of our guests are in Lusaka for work and want somewhere that simply works."
              />
            </div>
            <ul className="grid gap-px self-start bg-navy/10 sm:grid-cols-2 lg:col-span-7">
              {audience.map((who, i) => (
                <Reveal as="li" key={who} delay={i} className="bg-stone p-6">
                  <span className="text-body text-charcoal">{who}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------
          THE ADDRESS
          Doubles as the "is this a safe, convenient area?" answer and as the
          page that can actually rank for local searches.
      ---------------------------------------------------------------- */}
      <Section>
        <Container wide>
          <SectionHead
            eyebrow="The address"
            title={`${business.street}, ${business.city}.`}
            intro="Quiet enough to sleep, close enough that you are not leaving at dawn for a morning meeting."
          />

          <Figure
            name="exterior"
            alt="The property seen from the road"
            ratio="21 / 9"
            reveal
            className="mt-12 rounded-md"
            sizes="100vw"
          />

          <ul className="mt-12 grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
            {neighbourhood.slice(0, 6).map((p, i) => (
              <Reveal as="li" key={p.name} delay={i} className="bg-white p-6">
                <p className="label-caps text-charcoal-60">{p.kind}</p>
                <p className="mt-3 text-body text-navy">{p.name}</p>
                <p className="mt-1 text-caption text-charcoal-80">
                  {p.minutes > 0 ? `${p.minutes} minutes by ${p.mode}` : "Distance to confirm"}
                </p>
              </Reveal>
            ))}
          </ul>

          <Link
            href="/location"
            className="label-caps mt-12 inline-flex min-h-[44px] items-center gap-2 text-navy underline-offset-4 hover:underline"
          >
            Getting here
            <ArrowRight size={14} strokeWidth={2} aria-hidden />
          </Link>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------
          CLOSE
      ---------------------------------------------------------------- */}
      <section className="on-navy relative isolate bg-navy">
        <Figure
          name="r2-bedroom-1"
          alt="A Dunslim bedroom in the evening"
          cover
          scrim="strong"
          sizes="100vw"
          className="absolute inset-0 -z-10"
        />
        <Container wide>
          <div className="mx-auto max-w-[46ch] py-24 text-center md:py-32">
            <Eyebrow tone="onNavy" className="justify-center">
              Book direct
            </Eyebrow>
            <h2 className="mt-6 text-h1 font-extralight text-white">
              Check your dates
            </h2>
            <p className="mt-6 text-lead text-white/85">
              From {money(directNightly(cheapest))} a night, with free cancellation up to{" "}
              {arrival.cancellationHours} hours before you arrive.
            </p>
            <ButtonLink href="/book" variant="onNavy" size="lg" className="mt-8">
              Check availability
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
