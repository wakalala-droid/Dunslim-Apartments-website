"use client";

import { Check } from "lucide-react";
import { money, prettyDate, nightLabel, guestLabel } from "@/lib/format";
import { type Quote } from "@/lib/pricing";
import { rates, arrival, type Residence } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * The price panel.
 *
 * This is the honesty surface of the whole site. It is visible from the first
 * step, it itemises every discount, and the figure at the bottom is the figure
 * charged. Nothing is added later — drip pricing is explicitly banned by the
 * Elite Builder System, and it is the fastest way to lose a business traveller.
 */
export default function Summary({
  residence,
  quote,
  from,
  to,
  guests,
  className,
}: {
  residence: Residence | null;
  quote: Quote | null;
  from: string;
  to: string;
  guests: number;
  className?: string;
}) {
  return (
    <aside
      className={cn("rounded-md bg-stone p-6", className)}
      aria-label="Your stay and what it costs"
    >
      <h2 className="text-h3 font-light text-navy">Your stay</h2>

      {!residence || !quote ? (
        <p className="mt-6 text-body text-charcoal">
          Choose a residence and your dates and the full price appears here — everything included,
          nothing added later.
        </p>
      ) : (
        <>
          <dl className="mt-6 space-y-3 text-body">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-60">Residence</dt>
              <dd className="text-right text-charcoal">{residence.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-60">Arrive</dt>
              <dd className="text-right text-charcoal">
                {prettyDate(from)}, {arrival.checkIn}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-60">Depart</dt>
              <dd className="text-right text-charcoal">
                {prettyDate(to)}, {arrival.lateCheckOut}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-60">Guests</dt>
              <dd className="text-right text-charcoal">{guestLabel(guests)}</dd>
            </div>
          </dl>

          <hr className="rule-hair my-6" />

          <dl className="space-y-3 text-body">
            <div className="flex justify-between gap-4">
              <dt className="text-charcoal-80">
                {money(quote.nightlyZmw)} × {nightLabel(quote.nights)}
              </dt>
              <dd className="text-charcoal">{money(quote.subtotalZmw)}</dd>
            </div>

            {quote.discounts.map((d) => (
              <div key={d.label} className="flex justify-between gap-4">
                <dt className="max-w-[26ch] text-caption text-charcoal-80">{d.label}</dt>
                <dd className="whitespace-nowrap text-success">
                  &minus;{money(d.amountZmw)}
                </dd>
              </div>
            ))}
          </dl>

          <hr className="rule-brass my-6" />

          <div className="flex items-baseline justify-between gap-4">
            <p className="text-body text-navy">Total</p>
            <p className="text-h2 font-extralight text-navy">
              {money(quote.totalZmw)}
            </p>
          </div>
          <p className="mt-2 text-right text-caption text-charcoal-80">
            {money(quote.perNightZmw)} a night, all in
          </p>

          <div className="mt-6 rounded-sm bg-white p-4">
            <p className="text-caption text-charcoal-80">
              That is <span className="text-navy">{money(quote.savingZmw)} less</span>{" "}
              than the same stay on a booking platform.
            </p>
          </div>

          <ul className="mt-6 space-y-2">
            {[
              "No booking fee",
              `Free cancellation to ${arrival.cancellationHours}h before arrival`,
              `Checkout at ${arrival.lateCheckOut}, no charge`,
              ...rates.included.map((i) => `${i} included`),
            ].map((line) => (
              <li key={line} className="flex gap-2 text-caption text-charcoal-80">
                <Check size={14} strokeWidth={2} className="mt-1 shrink-0 text-brass" aria-hidden />
                {line}
              </li>
            ))}
          </ul>
        </>
      )}
    </aside>
  );
}
