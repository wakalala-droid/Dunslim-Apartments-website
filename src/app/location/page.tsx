import type { Metadata } from "next";
import { Container, Section, SectionHead, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { Reveal } from "@/components/ui/Reveal";
import { business, neighbourhood, arrival, assurances } from "@/lib/content";

export const metadata: Metadata = {
  title: "Location",
  description:
    "Dunslim Apartments on Makeni Road, Lusaka — how to find us, how long it takes from the airport, and what is nearby.",
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
                  Plus Code {business.plusCode} — that works as an address on its own, anywhere
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
          <SectionHead
            eyebrow="Getting here"
            title="Getting here"
            intro="Our old listings gave different distances. We are re-measuring these so the numbers are the same everywhere."
          />

          <ul className="mt-16 grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-3">
            {neighbourhood.map((p, i) => (
              <Reveal as="li" key={p.name} delay={i} className="bg-white p-6">
                <p className="label-caps text-charcoal-60">{p.kind}</p>
                <p className="mt-3 text-body text-navy">{p.name}</p>
                <p className="mt-1 text-caption text-charcoal-80">
                  {p.minutes > 0 ? `${p.minutes} minutes by ${p.mode}` : "Distance to confirm"}
                </p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section ground="stone">
        <Container wide>
          <Figure name="exterior" alt="The approach to the property from Makeni Road" ratio="21 / 9" className="rounded-md" sizes="100vw" />
        </Container>
      </Section>

      {/* Arrival */}
      <Section ground="navy">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
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
