import type { Metadata } from "next";
import SearchBar from "@/components/booking/SearchBar";
import ResidenceCard from "@/components/residences/ResidenceCard";
import { Figure } from "@/components/ui/Figure";
import { Container, Section, SectionHead } from "@/components/ui/Layout";
import { Reveal } from "@/components/ui/Reveal";
import { residences, rates } from "@/lib/content";

export const metadata: Metadata = {
  title: "Residences",
  description:
    "Three serviced apartments on Makeni Road, Lusaka — one, two and three bedrooms. Furnished, serviced, and lower booked direct.",
};

export default function ResidencesPage() {
  return (
    <>
      <Section ground="stone" tight>
        <Container wide>
          <SectionHead
            as="h1"
            eyebrow="The residences"
            title="Three apartments, same standard."
            intro="All three are furnished, serviced and run the same way. The only real difference is how much space you need."
          />
          <Figure
            name="detail-living"
            alt="A Dunslim living room"
            ratio="21 / 9"
            priority
            className="mt-12 rounded-md"
            sizes="100vw"
          />

          <div className="mt-12 max-w-[720px]">
            <SearchBar layout="inline" />
          </div>
        </Container>
      </Section>

      <Section>
        <Container wide>
          <div className="grid gap-16 md:grid-cols-2 lg:grid-cols-3">
            {residences.map((r, i) => (
              <Reveal key={r.slug} delay={i}>
                <ResidenceCard residence={r} priority={i === 0} headingLevel="h2" />
              </Reveal>
            ))}
          </div>

          <p className="mt-16 max-w-measure text-caption text-charcoal-80">
            Every rate shown is the direct rate — {rates.directDiscountPct} per cent below the
            platform price, with no booking fee and nothing added at checkout. Rates step down
            further at seven nights and again at twenty-eight.
          </p>
        </Container>
      </Section>
    </>
  );
}
