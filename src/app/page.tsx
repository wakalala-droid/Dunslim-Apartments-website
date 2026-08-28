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
        intro="Three serviced apartments for people who came to Lusaka to work. Power that stays on, parking inside the gate, and a rate that is always lower booked here."
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
                title: "Best rate, always",
                body: `Booking here is ${rates.directDiscountPct} per cent below the platform price, every night of the year. No booking fee, and the total you see first is the total you pay.`,
              },
              {
                icon: ShieldCheck,
                title: "Free cancellation",
                body: `Change your mind up to ${arrival.cancellationHours} hours before arrival and it costs you nothing. Plans move; we know.`,
              },
              {
                icon: Clock,
                title: "Late checkout, free",
                body: `Check out at ${arrival.lateCheckOut} instead of ${arrival.checkOut} when you book direct. Useful when your flight is in the afternoon.`,
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
              title="Three apartments, one standard."
              intro="Each is serviced, furnished and run the same way. Choose by how much room you need, not by how much you are willing to compromise."
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
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHead
                onNavy
                eyebrow="Why guests stay"
                title="The things nobody advertises, until they fail."
                intro="A serviced apartment is only as good as the evening the power goes out. These are the four we hold ourselves to."
              />
              <Figure
                name="detail-bath"
                alt="Bathroom detail"
                ratio="4 / 5"
                reveal
                className="mt-12 hidden rounded-md lg:block"
                sizes="(max-width: 1024px) 0px, 33vw"
              />
            </div>

            <ul className="grid gap-x-12 gap-y-12 self-start sm:grid-cols-2 lg:col-span-7">
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
                title="Here for weeks, not nights."
                intro="Most of our guests are on an engagement rather than a holiday. The rate steps down as the stay gets longer, automatically, without anyone having to ask."
              />

              <dl className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
                <div className="flex items-baseline justify-between gap-6 py-6">
                  <dt className="text-body text-charcoal">One to six nights</dt>
                  <dd className="text-h3 font-light text-navy">{rates.directDiscountPct}% off</dd>
                </div>
                {rates.longStay.map((band) => (
                  <div
                    key={band.minNights}
                    className="flex items-baseline justify-between gap-6 py-6"
                  >
                    <dt className="text-body text-charcoal">{band.label}</dt>
                    <dd className="text-h3 font-light text-navy">
                      {band.discountPct}%
                      <span className="ml-2 text-caption text-charcoal-80">on top</span>
                    </dd>
                  </div>
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
                title="Built for the working visit."
                intro="Dunslim is the serviced residence arm of the Dunslim Group. It exists for the guest who arrives on business and expects the room to work as well as it looks."
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
            intro="Far enough out to be quiet at night, close enough in to make a morning meeting without leaving at dawn."
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
              Check your dates. It takes a minute.
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
