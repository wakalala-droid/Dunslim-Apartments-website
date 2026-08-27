import { Container, Section, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";

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
        </div>
      </Container>
    </Section>
  );
}
