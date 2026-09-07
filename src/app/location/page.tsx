import type { Metadata } from "next";
import Image from "next/image";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { business, neighbourhood, arrival, assurances, fleet, airportMinutes, residences } from "@/lib/content";
import { money } from "@/lib/format";
import { directNightly } from "@/lib/pricing";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";

export const metadata: Metadata = {
  title: "Location",
  description:
    "Dunslim Apartments on Makeni Road, Lusaka: how to find us, how long it takes from the airport and what is nearby.",
  alternates: { canonical: "/location" },
  openGraph: {
    title: "Makeni Road, Lusaka | Dunslim Apartments",
    description:
      "Where we are, measured by road: 37.6km from the airport, 12.4km from the city centre, 8.7km from Makeni Mall.",
    url: "/location",
  },
};

export default function LocationPage() {
  const cheapest = residences.reduce((a, b) =>
    a.directNightlyZmw <= b.directNightlyZmw ? a : b,
  );

  return (
    <>
      <BreadcrumbSchema
        trail={[{ name: "Home", path: "/" }, { name: "Location", path: "/location" }]}
      />

      <Section ground="stone" tight>
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <Eyebrow>Location</Eyebrow>
              <h1 className="mt-4 text-h1 font-extralight text-navy md:text-[56px] md:leading-[1.05]">
                {business.street},
                <br />
                {business.city}.
              </h1>
              <p className="mt-6 max-w-measure text-lead text-charcoal">
                Far enough out to be quiet at night, close enough in to make a morning meeting
                without leaving at dawn.
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-md bg-white p-6 ring-1 ring-navy/10">
                <p className="label-caps text-charcoal-60">The address</p>
                <address className="mt-4 not-italic text-body leading-relaxed text-charcoal">
                  {business.name}
                  <br />
                  {business.street}
                  <br />
                  {business.city}, {business.country}
                </address>
                {/*
                  The property's own Maps listing, not a search for the street.
                  A search dropped the guest on Makeni Road and left them to
                  find the gate; this is the pin with the name on it.
                */}
                <ButtonLink
                  href={business.mapsUrl}
                  variant="secondary"
                  className="mt-6 w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Maps
                </ButtonLink>
                <ButtonLink
                  href={`https://www.google.com/maps/dir/?api=1&destination=${business.coords.lat},${business.coords.lng}`}
                  variant="secondary"
                  className="mt-3 w-full"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Directions from where you are
                </ButtonLink>
                <p className="mt-4 text-caption text-charcoal-80">
                  Plus Code {business.plusCode}. That works as an address on its own, anywhere
                  Maps is used.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Getting here */}
      <Section>
        <Container wide>
          {/*
            The eyebrow and the heading used to carry the same three words,
            printed one under the other. Every other section on the site uses the
            eyebrow to say something the heading does not and the heading here
            can carry the two numbers a guest is actually weighing up.
          */}
          <SectionHead
            eyebrow="Getting here"
            title="Twenty minutes to the shops, fifty-five to the airport"
            intro="Measured by road from our gate, so these are the same numbers on every listing we run. The times assume a clear road. Lusaka at rush hour will add to them."
          />

          <ul className="mt-16 grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
            {neighbourhood.map((p) => (
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
        </Container>
      </Section>

      {/*
        THE MAP.

        There was not one. The page offered two buttons that sent a guest off to
        Google and a Plus Code, so you could not see where the apartments were
        without leaving the site. On a location page for a property whose
        recorded problem is guests not finding the gate at night, that is the one
        thing missing.

        It is a committed PNG, not an embed: one image request, no third-party
        script, no consent question and it still draws on a weak connection. Run
        `python scripts/build-static-map.py` if the coordinates ever change. The
        OpenStreetMap attribution below is a licence condition, not decoration.
      */}
      <Section ground="stone">
        <Container wide>
          {/*
            The map ran seven columns wide with a photograph of the approach
            beside it in the other five. That photograph was a stock house in
            Australia captioned "The approach from Makeni Road", which is the
            one thing on this page a guest could act on and be misled by. Taken
            out rather than replaced: there is no photograph of the gate in the
            owner's shoot, and an interior in that slot would answer a question
            nobody asked. The map has the row to itself until there is a real
            one, which is a better page than a true map beside a false picture.
          */}
          {/*
            NOT the full width. Given all twelve columns the 768x512 map drew
            1329px across and 886px tall, nearly a whole screen of street plan,
            which is more page than a map of one road has any business taking.
            Held at 880px and centred instead: the same map at its natural
            three-to-two, about six hundred pixels tall, with the pin still in
            the middle of it. `sizes` matches, so a phone is not sent a file
            sized for a column that no longer exists.
          */}
          <div className="mx-auto max-w-[880px]">
            <div>
              <div className="overflow-hidden rounded-md ring-1 ring-navy/10">
                <Image
                  src="/map/makeni-road.png"
                  alt={`A street map of Makeni Road, Lusaka, with ${business.name} marked at its centre`}
                  width={768}
                  height={512}
                  sizes="(max-width: 920px) 100vw, 880px"
                  className="h-auto w-full"
                />
              </div>
              <p className="mt-3 text-caption text-charcoal-60">
                Map data ©{" "}
                <a
                  href="https://www.openstreetmap.org/copyright"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-navy"
                >
                  OpenStreetMap
                </a>{" "}
                contributors. The brass ring is us.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Arrival */}
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
            <div className="self-start lg:sticky lg:top-24 lg:col-span-5">
              <SectionHead
                onNavy
                eyebrow="Arrival"
                title="You do not have to find us"
                intro={`Give us your flight when you book. A driver meets it whatever time it lands, brings you in and hands over the ${fleet.model} that stays with you for the rest of the trip. The distances above are for planning, not for your first night.`}
              />
            </div>

            <div className="lg:col-span-7">
              <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <dt className="label-caps text-brass-60">Check in</dt>
                  <dd className="mt-2 text-h3 font-light text-white">{arrival.checkIn}</dd>
                </div>
                <div>
                  <dt className="label-caps text-brass-60">Check out</dt>
                  <dd className="mt-2 text-h3 font-light text-white">{arrival.lateCheckOut}</dd>
                </div>
                <div>
                  <dt className="label-caps text-brass-60">From the airport</dt>
                  <dd className="mt-2 text-h3 font-light text-white">
                    Driven
                    <span className="mt-1 block text-caption text-navy-20">
                      About {airportMinutes()} minutes
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="label-caps text-brass-60">Your car</dt>
                  <dd className="mt-2 text-h3 font-light text-white">
                    {fleet.model}
                    <span className="mt-1 block text-caption text-navy-20">
                      Parked inside the gate
                    </span>
                  </dd>
                </div>
              </dl>

              <ul className="mt-12 grid gap-8 sm:grid-cols-2">
                {assurances.map((a) => (
                  <li key={a.title}>
                    <hr className="rule-brass w-8" />
                    <h3 className="mt-4 text-body text-white">{a.title}</h3>
                    <p className="mt-2 max-w-measure text-caption text-navy-20">
                      {a.body}
                    </p>
                  </li>
                ))}
              </ul>

              {/*
                THE PAGE ENDED HERE, WITH NOTHING TO DO.

                Every booking link on this page came from the header and the
                footer. A guest reads it for one reason, to work out whether the
                address suits them and by the bottom they have their answer.
                Leaving them to find the header again is the one place on the
                site where a settled question had no next step.
              */}
              <div className="mt-12 flex flex-wrap items-center gap-4">
                <ButtonLink href="/book" variant="onNavy" size="lg">
                  Check availability
                </ButtonLink>
                <p className="text-caption text-navy-20">
                  From {money(directNightly(cheapest))} a night, with the {fleet.model} included.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
