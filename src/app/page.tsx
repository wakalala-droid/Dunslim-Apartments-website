import Link from "next/link";
import { ArrowRight, Clock, BadgeCheck, MessageCircle, Car, RotateCcw } from "lucide-react";
import Hero from "@/components/home/Hero";
import SearchBar from "@/components/booking/SearchBar";
import ResidenceCard from "@/components/residences/ResidenceCard";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";
import { RevealRule } from "@/components/ui/RevealText";
import {
  business,
  residences,
  assurances,
  rates,
  arrival,
  neighbourhood,
  audience,
  fleet,
} from "@/lib/content";
import { LodgingSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import { money } from "@/lib/format";
import { directNightly, publishedNightly, quote as buildQuote } from "@/lib/pricing";
import { isoPlusDays, isoToday } from "@/lib/format";

export default function HomePage() {
  const cheapest = residences.reduce((a, b) =>
    a.directNightlyZmw <= b.directNightlyZmw ? a : b,
  );

  /*
    A real seven-night total, taken from the pricing engine rather than written
    out, so the figure under the ladder cannot drift from the figure at checkout.
    The dates are arbitrary; only the length of the stay changes the answer.
  */
  const ladderFrom = isoToday();
  const weekQuote = buildQuote(cheapest, ladderFrom, isoPlusDays(ladderFrom, 7));

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
          image. The identity itself never touches the photograph. It stays on
          the solid header bar above, per Brand Guidelines p.12.
      ---------------------------------------------------------------- */}
      {/* The search card is passed in as the hero's own last beat, so its
          entrance belongs to the same sequence rather than running on a
          separate clock. It is the first thing a visitor can actually do. */}
      <Hero
        eyebrow="Serviced residences"
        headline="A room that works as well as it looks."
        intro="VIP serviced apartments on Makeni Road. Backup power, parking inside the gate and a rate that is always lower than other platforms."
        metaLeft={`${business.city} · ${business.country}`}
        metaRight={`${business.street}`}
        /* The fixed brand line, exactly as the cover carries it. The parent
           company already appears in the footer; repeating it here ran to
           three cluttered lines of letterspaced caps on a phone. */
        footNote={business.brandLine}
      >
        <Container wide>
          <SearchBar layout="inline" className="shadow-3" />
        </Container>
      </Hero>

      {/* ---------------------------------------------------------------
          THE BOOK-DIRECT PROMISE
          Limehome, Numa and Locke all put this on the homepage in plain words.
          Every promise here is honoured in the pricing engine, not just written.
      ---------------------------------------------------------------- */}
      <Section tight>
        <Container wide>
          <ul className="grid gap-12 border-t border-navy/10 pt-12 md:grid-cols-2">
            {[
              {
                icon: BadgeCheck,
                title: "Always cheaper here",
                body: `Book with us and you pay ${rates.directDiscountPct}% less than other online platforms. No booking fee. The price you see first is the price you pay.`,
                note: "",
              },
              {
                icon: Clock,
                title: "Late checkout, free",
                body: `Check out at ${arrival.lateCheckOut} instead of ${arrival.checkOut} when you book with us. Handy if your flight is in the afternoon.`,
                note: "T&Cs apply",
              },
            ].map((item) => (
              <Reveal as="li" key={item.title} className="flex flex-col">
                <item.icon size={22} strokeWidth={1.25} className="text-brass" aria-hidden />
                <h2 className="mt-4 text-h3 font-light text-navy">{item.title}</h2>
                <p className="mt-3 max-w-measure text-body text-charcoal">
                  {item.body}
                </p>
                {/*
                  The qualifier sits under the promise it qualifies, quietly.
                  Two of these three are conditional offers; the direct-rate
                  promise is not, so it carries nothing.

                  AND IT NOW POINTS SOMEWHERE. "T&Cs apply" appeared under two of
                  the four claims a cautious corporate booker checks first, as
                  plain text with no terms page in existence to link to. A
                  disclaimer with nothing behind it is worse than no disclaimer.
                */}
                {item.note ? (
                  <p className="mt-1 text-caption text-charcoal-60">
                    {/*
                      A standalone link, so it owes a real target. It was 19px
                      tall, under the 24px minimum and this is not the inline
                      case the rule excuses: it sits on its own line rather than
                      inside a sentence.
                    */}
                    <Link
                      href="/terms"
                      className="inline-flex min-h-[44px] items-center underline underline-offset-4 hover:text-navy"
                    >
                      {item.note}
                    </Link>
                  </p>
                ) : null}
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ---------------------------------------------------------------
          THE RESIDENCES
      ---------------------------------------------------------------- */}
      <Section id="residences" ground="stone">
        <Container wide>
          <div className="flex flex-wrap items-end justify-between gap-8">
            <SectionHead
              eyebrow="The residences"
              title="VIP apartments, same standard."
              intro="All of them are furnished, serviced and run the same way. The only real difference is how much space you need."
            />
            <ButtonLink href="/residences" variant="secondary">
              All residences
            </ButtonLink>
          </div>

          <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
            {residences.map((r, i) => (
              <Reveal key={r.slug}>
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
            twice the height of the list beside it and the list, being
            `self-start`, left about 550px of empty navy underneath. Moving the
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
                name="r1-bath-5"
                alt="The second bathroom in Mandela, shower and basin"
                cover
                className="absolute inset-0"
                sizes="(max-width: 1024px) 0px, 42vw"
              />
            </Reveal>

            <ul className="grid content-between gap-x-12 gap-y-12 sm:grid-cols-2 lg:col-span-7">
              {assurances.map((a) => (
                <Reveal as="li" key={a.title}>
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
          THE CAR

          WHY IT SITS HERE AND NOT NEAR THE TOP.

          It was the third thing on the page: named in the hero sentence, again
          in the strip under the search card, then given a full band before a
          single apartment had been shown. Three mentions before the product.

          An unusually generous claim made before any trust is built reads as a
          gimmick, which is reason enough on its own to hold it back, car now
          hired rather than included or not.
          The order now is: what this place is, why booking direct is cheaper,
          the three apartments, then the things a guest in Lusaka worries about
          (power, water, security, Wi-Fi). Only then the car. By that point
          it stops sounding like a hook and starts sounding like a reason.

          It also sits directly above the long-stay section on purpose. A car
          matters most to the guest who is here for six weeks. That is the
          section written for them.

          IT KEEPS A BAND RATHER THAN BECOMING A BULLET because it raises three
          questions a list item cannot answer: how do I get here, do I drive it
          myself, is it shared. Those are the three steps below.

          NO PHOTOGRAPH, DELIBERATELY. There is no photograph of the actual
          cars yet and the rule this whole codebase is built on is that nothing
          is presented as fact until it is one. A stock saloon here would be the
          same lie the stock interiors already are, on a claim far easier to
          check. It is set typographically instead.

          ON STONE, NOT NAVY. The band it now follows is navy. Two navy bands
          running together read as one slab, which is the problem the
          footer already carries a note about. Off navy the numerals go to
          charcoal: brass measures 2.45:1 on stone and 13px text needs 4.5:1,
          which is the brand book's own reason for saying brass is never a text
          colour. The icons stay brass, as they do on the rate card, because an
          aria-hidden mark beside its own label is decoration and not
          information.

          THE NUMBERS ARE A REAL SEQUENCE, not decoration. Landing, the stay and
          the flight home happen in that order, which is the only thing that
          licenses numbering a set.
      ---------------------------------------------------------------- */}
      <Section ground="stone">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="self-start lg:sticky lg:top-24 lg:col-span-5">
              <SectionHead
                eyebrow="The car"
                title={`A ${fleet.model}, yours to hire.`}
                intro={`Each residence has its own car. It is not a pool and it is not shared, but it is not part of the nightly rate either: hire it separately for ${money(fleet.hireFeeZmw)} a ${fleet.hireFeeUnit} and it is yours to drive, within Lusaka or beyond, for as long as you have it booked.`}
              />
            </div>

            <div className="lg:col-span-7">
              <RevealGroup as="ol" className="divide-y divide-navy/10 border-y border-navy/10">
                {[
                  {
                    icon: MessageCircle,
                    title: "Ask when you book",
                    body: `Let us know you would like the ${fleet.model} and we will have it ready and waiting at the apartment.`,
                  },
                  {
                    icon: Car,
                    title: "Collect it yourself",
                    body: "Pick up the keys at the residence. From there it is yours to drive, within Lusaka or beyond, for as long as you have hired it.",
                  },
                  {
                    icon: RotateCcw,
                    title: "Return it before you leave",
                    body: "Drop it back at the apartment before checkout. There is no driver either way, just the car.",
                  },
                ].map((step, i) => (
                  <RevealItem as="li" key={step.title} index={i} className="flex gap-6 py-8">
                    <span
                      aria-hidden
                      className="label-caps shrink-0 pt-1 tabular-nums text-charcoal-80"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-3">
                        <step.icon size={20} strokeWidth={1.5} className="shrink-0 text-brass" aria-hidden />
                        <span className="text-h3 font-light text-navy">{step.title}</span>
                      </span>
                      <span className="mt-3 block max-w-measure text-body text-charcoal">
                        {step.body}
                      </span>
                    </span>
                  </RevealItem>
                ))}
              </RevealGroup>

              <Reveal>
                <p className="mt-8 max-w-measure text-caption text-charcoal-80">
                  Let us know when you book if you would like the {fleet.model} waiting for you.
                  That is the only thing we need in advance.
                </p>
              </Reveal>
            </div>
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
              name="r2-living-2"
              alt="The living room in Mulima, from the dining end"
              ratio="5 / 4"
              reveal
              className="rounded-md lg:col-span-6"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />

            <div className="lg:col-span-6">
              <SectionHead
                eyebrow="Long stays"
                title="Staying a few weeks?"
                intro="Most people who stay with us are here for work, not a holiday. The longer you stay the less you pay per night. It comes off automatically."
              />

              <dl className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
                <Reveal as="div" className="flex items-baseline justify-between gap-6 py-6">
                  <dt className="text-body text-charcoal">One to five nights</dt>
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

              {/*
                The ladder reads as though the percentages add up and they do
                not: each one comes off the direct rate rather than off the one
                above it. A guest doing the arithmetic in their head gets 25 per
                cent and pays 23.5, which is the sort of small surprise this site
                is built to avoid. A real total settles it without asking anyone
                to do the sum.
              */}
              {weekQuote ? (
                <Reveal>
                  <p className="mt-6 max-w-measure text-caption text-charcoal-80">
                    Each rate comes off the direct price rather than off the one above it. Seven
                    nights in {cheapest.name} is {money(weekQuote.totalZmw)}, against{" "}
                    {money(publishedNightly(cheapest) * 7)} on a platform.
                  </p>
                </Reveal>
              ) : null}

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
          review score. There are not enough verified bookings. Rather than
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
            {/*
              One trigger for the whole grid, held until it is properly on
              screen, so the reader gets the question on the left before the
              answers arrive beside it. Each cell then follows the one before it
              rather than firing on its own position in the viewport.
            */}
            <RevealGroup
              late
              className="grid gap-px self-start bg-navy/10 sm:grid-cols-2 lg:col-span-7"
            >
              {audience.map((who, i) => (
                <RevealItem
                  key={who}
                  index={i}
                  className={cn(
                    "bg-stone p-6",
                    /*
                      An odd number of names left the last cell of the grid
                      empty and since the hairlines are made by a background
                      showing through a 1px gap, that empty cell rendered as a
                      grey block. The last name spans the row instead.
                    */
                    i === audience.length - 1 && audience.length % 2 === 1 && "sm:col-span-2",
                  )}
                >
                  <span className="text-body text-charcoal">{who}</span>
                </RevealItem>
              ))}
            </RevealGroup>
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

          {/*
            A wide banner of the property from the road belongs here and there
            is no such photograph. What was here was a stock house in Australia.
            The heading and the distances stand on their own until the owner
            sends one taken at the gate.
          */}

          <ul className="mt-12 grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
            {neighbourhood.slice(0, 6).map((p) => (
              <Reveal as="li" key={p.name} className="bg-white p-6">
                <p className="label-caps text-charcoal-60">{p.kind}</p>
                <p className="mt-3 text-body text-navy">{p.name}</p>
                <p className="mt-1 text-caption text-charcoal-80">
                  {p.km > 0
                    ? `${p.km} km · about ${p.minutes} minutes ${
                        p.mode === "drive" ? "by car" : "on foot"
                      }`
                    : "Distance to confirm"}
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
              From {money(directNightly(cheapest))} a night, no booking fee and nothing added at
              checkout.
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
