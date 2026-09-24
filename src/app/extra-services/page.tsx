import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { Container, Section, SectionHead } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BreadcrumbSchema } from "@/components/seo/StructuredData";
import { EXTRA_ICONS } from "@/components/ui/extraIcons";
import { business, extraServices, extraPrice, type ExtraService } from "@/lib/content";

/**
 * EXTRA SERVICES.
 *
 * The owner's own tab, asked for on 24 September 2026 in place of the homepage
 * band that sold a single car. Everything on it comes from `extraServices` in
 * content.ts, so a new service or a confirmed price is one edit there.
 *
 * NO PRICE IS INVENTED. Only self-drive hire has a figure. Every other line
 * says "Price on request" and the page says plainly, twice, that the guest
 * agrees a price before anything is booked. That is what keeps these extras
 * from being the drip pricing `rates.included` forbids: nothing is added to a
 * stay the guest did not ask for and price first.
 *
 * EVERY SERVICE HAS ITS OWN WHATSAPP LINK with the question already typed, so
 * asking about a pick-up is one tap rather than finding the number and working
 * out what to say.
 */
export const metadata: Metadata = {
  title: "Extra services",
  description:
    "Airport and bus station pick-ups, self-drive car hire or a car with a driver, guided shopping trips, tours of Lusaka and Zambia and domestic flights, arranged for guests of Dunslim Apartments.",
  alternates: { canonical: "/extra-services" },
  openGraph: {
    title: "Extra services | Dunslim Apartments",
    description:
      "Airport pick-ups, car hire with or without a driver, shopping trips, tours and domestic flights, arranged for you during your stay in Lusaka.",
    url: "/extra-services",
  },
};

/**
 * A WhatsApp link with the question already written.
 *
 * Only the first letter is lowered, so "Car hire in Zambia's major cities"
 * reads naturally mid-sentence without turning Zambia into "zambia".
 */
const askLink = (s: ExtraService) =>
  `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
    `Hello, I would like to ask about ${s.title.charAt(0).toLowerCase()}${s.title.slice(1)}.`,
  )}`;

export default function ExtraServicesPage() {
  return (
    <>
      <BreadcrumbSchema
        trail={[
          { name: "Home", path: "/" },
          { name: "Extra services", path: "/extra-services" },
        ]}
      />

      <Section ground="stone" tight>
        <Container wide>
          <SectionHead
            as="h1"
            eyebrow="Extra services"
            title="Everything around your stay, arranged."
            intro="A pick-up from the airport, a car for the week, a driver who knows Lusaka, a trip further into Zambia. None of it is in the nightly rate and none of it is charged unless you ask. Tell us what you need and we will give you the price before anything is booked."
          />
        </Container>
      </Section>

      <Section>
        <Container wide>
          {extraServices.map((group) => (
            <div
              key={group.heading}
              className="grid gap-6 border-t border-navy/10 py-12 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-16"
            >
              <Reveal className="lg:col-span-4">
                <h2 className="text-h2 font-extralight text-navy">{group.heading}</h2>
              </Reveal>

              <RevealGroup as="ul" className="divide-y divide-navy/10 lg:col-span-8">
                {group.items.map((s, i) => {
                  const Icon = EXTRA_ICONS[s.id] ?? MessageCircle;
                  return (
                    <RevealItem
                      as="li"
                      key={s.id}
                      index={i}
                      className="flex gap-4 py-8 first:pt-0 last:pb-0"
                    >
                      <Icon
                        size={22}
                        strokeWidth={1.5}
                        className="mt-1 shrink-0 text-brass"
                        aria-hidden
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                          <h3 className="text-h3 font-light text-navy">{s.title}</h3>
                          <p
                            className={
                              s.priceZmw ? "text-body text-navy" : "text-caption text-charcoal-80"
                            }
                          >
                            {extraPrice(s)}
                          </p>
                        </div>
                        <p className="mt-2 max-w-measure text-body text-charcoal">{s.body}</p>
                        <a
                          href={askLink(s)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex min-h-[44px] items-center gap-2 text-caption text-charcoal-80 underline underline-offset-4 transition-colors duration-micro hover:text-navy"
                        >
                          <MessageCircle size={16} strokeWidth={1.5} aria-hidden />
                          Ask about this on WhatsApp
                        </a>
                      </div>
                    </RevealItem>
                  );
                })}
              </RevealGroup>
            </div>
          ))}
        </Container>
      </Section>

      {/*
        HOW IT WORKS. A real sequence, which is what licenses the numbers: the
        guest asks, is told the price and only then is anything arranged.
      */}
      <Section ground="stone">
        <Container wide>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="self-start lg:sticky lg:top-24 lg:col-span-5">
              <SectionHead
                eyebrow="How it works"
                title="Ask, agree the price and it is done."
                intro="Every extra is priced for you before anything is booked, so there is never a charge you did not see coming."
              />
            </div>

            <div className="lg:col-span-7">
              <RevealGroup as="ol" className="divide-y divide-navy/10 border-y border-navy/10">
                {[
                  {
                    title: "Tell us what you need",
                    body: "Tick it on the booking form when you book, or message us on WhatsApp any time before or during your stay.",
                  },
                  {
                    title: "We send you the price",
                    body: "You get the cost in writing first. Nothing is booked or charged until you have agreed to it.",
                  },
                  {
                    title: "We arrange it",
                    body: "The driver is waiting when you land, the car is ready or the guide knows where to meet you.",
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
                      <span className="block text-h3 font-light text-navy">{step.title}</span>
                      <span className="mt-3 block max-w-measure text-body text-charcoal">
                        {step.body}
                      </span>
                    </span>
                  </RevealItem>
                ))}
              </RevealGroup>

              <div className="mt-12 flex flex-wrap gap-4">
                <ButtonLink href="/book" size="lg">
                  Book a stay
                </ButtonLink>
                <ButtonLink
                  href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                    "Hello, I would like to ask about your extra services.",
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  size="lg"
                >
                  <MessageCircle size={18} strokeWidth={1.5} aria-hidden />
                  Message us on WhatsApp
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
