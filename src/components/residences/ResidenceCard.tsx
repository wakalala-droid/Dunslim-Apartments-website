import Link from "next/link";
import { ArrowRight, BedDouble, Users, Car } from "lucide-react";
import { Figure } from "@/components/ui/Figure";
import { money } from "@/lib/format";
import { fleet } from "@/lib/content";
import { directNightly } from "@/lib/pricing";
import type { Residence } from "@/lib/content";

/**
 * One residence, as a card. Used on the homepage and on /residences, the same
 * component in both places, per component_system.md rule 1.
 *
 * The photograph carries the card. A serviced apartment is bought with the eyes
 * first and every operator worth studying leads with the room, not the copy.
 *
 * The title carries a stretched link so the whole card is one large tap target.
 * "Check dates" sits above it on its own layer as a second destination.
 *
 * The price shown is the direct rate, what the guest is actually charged.
 */
export default function ResidenceCard({
  residence,
  priority = false,
  headingLevel = "h3",
}: {
  residence: Residence;
  priority?: boolean;
  /**
   * Headings must descend without skipping a level and the right level depends
   * on what precedes the card. On /residences the cards follow the page h1, so
   * they are h2; on the homepage they sit under a section h2, so they are h3.
   */
  headingLevel?: "h2" | "h3";
}) {
  const { slug, name, summary, bedrooms, sleeps, photos } = residence;
  const cover = photos[0];
  const Heading = headingLevel;

  return (
    <article className="group relative flex flex-col">
      <Figure
        name={cover?.id ?? ""}
        alt={`${name}, ${cover?.caption ?? "interior"}`}
        ratio="4 / 3"
        priority={priority}
        zoom
        className="rounded-md"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      <div className="flex flex-1 flex-col pt-6">
        <div className="flex items-baseline justify-between gap-4">
          <Heading className="text-h3 font-light text-navy">
            <Link
              href={`/residences/${slug}`}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {name}
            </Link>
          </Heading>
          <p className="shrink-0 text-h3 font-light text-navy">
            {money(directNightly(residence))}
            <span className="ml-1 text-caption text-charcoal-80">/night</span>
          </p>
        </div>

        <p className="mt-3 max-w-measure text-body text-charcoal">{summary}</p>

        <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-caption text-charcoal-80">
          <li className="flex items-center gap-2">
            <BedDouble size={15} strokeWidth={1.5} className="text-brass" aria-hidden />
            {bedrooms} {bedrooms === 1 ? "bedroom" : "bedrooms"}
          </li>
          <li className="flex items-center gap-2">
            <Users size={15} strokeWidth={1.5} className="text-brass" aria-hidden />
            Sleeps {sleeps}
          </li>
          {/*
            The car sits in the spec row rather than in the prose, because this
            row is what a guest scans when three cards are side by side and all
            three apartments are otherwise identical on paper.
          */}
          <li className="flex items-center gap-2">
            <Car size={15} strokeWidth={1.5} className="text-brass" aria-hidden />
            {fleet.model} included
          </li>
        </ul>

        <hr className="rule-hair my-6" />

        <div className="mt-auto flex items-center justify-between gap-4">
          <p className="text-caption text-charcoal-80">Booked direct</p>

          {/* Sits above the stretched link so it stays independently clickable. */}
          <Link
            href={`/book?residence=${slug}`}
            className="label-caps relative z-10 inline-flex min-h-[44px] items-center gap-2 text-navy underline-offset-4 transition-colors duration-micro hover:underline"
          >
            Check dates
            <ArrowRight
              size={14}
              strokeWidth={2}
              aria-hidden
              className="transition-transform duration-micro ease-entrance group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
