"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Container, Section, Eyebrow } from "@/components/ui/Layout";
import { ButtonLink } from "@/components/ui/Button";
import { business } from "@/lib/content";

/**
 * WHAT A GUEST SEES WHEN SOMETHING BREAKS.
 *
 * There was nothing here. Any unexpected error in the browser dropped the guest
 * on the framework's own default, which is one grey sentence on a white page:
 * "Application error: a client-side exception has occurred (see the browser
 * console for more information)." No header, no footer, no way back and no
 * phone number. That was the actual screen produced by a malformed date in a
 * /book address, on the page that takes the money.
 *
 * On a site whose entire promise is that a person answers, the failure page is
 * the one screen that most needs a way to reach that person. So it carries both
 * numbers and WhatsApp and it says plainly that nothing was charged, because
 * that is the first thing a guest halfway through a booking will want to know.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Goes to the Vercel logs, where the digest can be matched to the stack.
    console.error("[error boundary]", error.digest ?? "", error.message);
  }, [error]);

  return (
    <Section>
      <Container wide>
        <div className="max-w-measure py-12 md:py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning">
            <AlertTriangle size={22} strokeWidth={2} className="text-white" aria-hidden />
          </div>

          <Eyebrow className="mt-8">Something went wrong</Eyebrow>
          <h1 className="mt-4 text-h1 font-extralight text-navy">
            That is our fault, not yours.
          </h1>
          <p className="mt-6 text-lead text-charcoal">
            Something on our side stopped working. Nothing has been charged and nothing has been
            booked. If you were partway through a booking, message us and we will take the details
            down ourselves, usually within the hour.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                "Hello, the website stopped working while I was booking.",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] items-center rounded-md bg-navy px-8 text-body font-medium text-white transition-colors duration-micro hover:bg-navy-80"
            >
              Message us on WhatsApp
            </a>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-[52px] items-center rounded-md border border-navy/20 bg-white px-8 text-body font-medium text-navy transition-colors duration-micro hover:border-navy hover:bg-stone-40"
            >
              Try again
            </button>
          </div>

          <dl className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-4">
              <dt className="text-body text-charcoal-60">Call</dt>
              <dd className="text-body text-charcoal">
                <a className="hover:text-navy hover:underline" href={`tel:${business.phone.replace(/\s/g, "")}`}>
                  {business.phone}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-4">
              <dt className="text-body text-charcoal-60">Or</dt>
              <dd className="text-body text-charcoal">
                <a className="hover:text-navy hover:underline" href={`tel:${business.phoneAlt.replace(/\s/g, "")}`}>
                  {business.phoneAlt}
                </a>
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-4">
              <dt className="text-body text-charcoal-60">Email</dt>
              <dd className="text-body text-charcoal">
                <a className="hover:text-navy hover:underline" href={`mailto:${business.email}`}>
                  {business.email}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/" variant="secondary">
              Back to the start
            </ButtonLink>
            <Link
              href="/residences"
              className="inline-flex min-h-[44px] items-center text-body text-navy underline underline-offset-4"
            >
              See the residences
            </Link>
          </div>

          {error.digest ? (
            <p className="mt-10 font-mono text-caption text-charcoal-60">
              Reference {error.digest}. Quoting it helps us find what happened.
            </p>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
