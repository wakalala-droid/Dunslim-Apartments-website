import type { Metadata } from "next";
import { Container, Section, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { business } from "@/lib/content";

/**
 * The 404 used to inherit the homepage's title, so a guest who mistyped an
 * address got a browser tab (and a bookmark) promising "Best Rates, Booked
 * Direct" over a page saying the page did not exist.
 *
 * Next only honours this export for a not-found rendered by a route that calls
 * `notFound()`, which covers /residences/<anything-wrong>. A completely unmatched
 * address still renders this component under the root metadata, because the
 * framework has no route to attach page metadata to. The dynamic residence route
 * sets its own title for the same reason and between them the addresses a guest
 * is actually likely to mistype are covered.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Section>
      <Container wide>
        <div className="max-w-measure py-16">
          <Eyebrow>Not found</Eyebrow>
          <h1 className="mt-4 text-h1 font-extralight text-navy">
            That page is not here.
          </h1>
          <p className="mt-6 text-lead text-charcoal">
            The link may be old, or the address slightly off. The three residences and their rates
            are all a click away.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/residences">See the residences</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to the start
            </ButtonLink>
          </div>
          <p className="mt-8 text-body text-charcoal-80">
            If you were sent this link and it should work, tell us on{" "}
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy underline underline-offset-4"
            >
              WhatsApp
            </a>{" "}
            and we will send you the right one.
          </p>
        </div>
      </Container>
    </Section>
  );
}
