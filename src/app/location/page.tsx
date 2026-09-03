import type { Metadata } from "next";
import Image from "next/image";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { business, neighbourhood, arrival, assurances } from "@/lib/content";

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

  return (
    <>
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
            {neighbourhood.map((p, i) => (
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
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="overflow-hidden rounded-md ring-1 ring-navy/10">
                <Image
                  src="/map/makeni-road.png"
                  alt={`A street map of Makeni Road, Lusaka, with ${business.name} marked at its centre`}
                  width={768}
                  height={512}
                  sizes="(max-width: 1024px) 100vw, 58vw"
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
            <div className="lg:col-span-5">
              <Figure
                name="exterior"
                alt="The approach to the property from Makeni Road"
                ratio="4 / 3"
                className="rounded-md"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <p className="mt-3 text-caption text-charcoal-60">
                The approach from Makeni Road.
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
                title="Arriving late is fine"
                intro={
                  arrival.selfCheckIn
                    ? "We send your access details the day before, so the hour you land does not matter."
                    : "Tell us your flight when you book and someone will be there with the keys, whatever time it lands."
                }
              />
            </div>

            <div className="lg:col-span-7">
              <dl className="grid gap-8 sm:grid-cols-3">
                <div>
                  <dt className="label-caps text-brass-60">Check in</dt>
                  <dd className="mt-2 text-h3 font-light text-white">{arrival.checkIn}</dd>
                </div>
                <div>
                  <dt className="label-caps text-brass-60">Check out</dt>
                  <dd className="mt-2 text-h3 font-light text-white">{arrival.lateCheckOut}</dd>
                </div>
                <div>
                  <dt className="label-caps text-brass-60">Parking</dt>
                  <dd className="mt-2 text-h3 font-light text-white">Inside the gate</dd>
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
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
