import { rates, type Residence } from "./content";

/**
 * Pricing engine.
 *
 * One rule governs this file: the number a guest sees first is the number they pay.
 * Drip pricing — fees that appear only at checkout — is prohibited by the Elite
 * Builder System (conversion_psychology.md, "EXPLICITLY BANNED"). Every component
 * of the total is computed here and rendered in full at every step of the flow.
 */

export type Quote = {
  nights: number;
  /** Published nightly rate, before any discount. */
  nightlyUsd: number;
  /** What the same stay costs on a booking platform, for honest comparison. */
  platformTotalUsd: number;
  /** Sum of nightly rates before discounts. */
  subtotalUsd: number;
  discounts: { label: string; pct: number; amountUsd: number }[];
  totalUsd: number;
  /** What booking direct saves against the platform price. */
  savingUsd: number;
  /** Effective average per night after discounts. */
  perNightUsd: number;
};

export const nightsBetween = (from: string, to: string): number => {
  if (!from || !to) return 0;
  const a = new Date(`${from}T00:00:00`);
  const b = new Date(`${to}T00:00:00`);
  const ms = b.getTime() - a.getTime();
  if (!Number.isFinite(ms) || ms <= 0) return 0;
  return Math.round(ms / 86_400_000);
};

/**
 * Long-stay discount. The ladder is defined in content.ts; the deepest band the
 * stay qualifies for wins. They do not stack — stacking would make the displayed
 * headline discount a lie.
 */
const longStayBand = (nights: number) =>
  [...rates.longStay]
    .filter((b) => nights >= b.minNights)
    .sort((a, b) => b.discountPct - a.discountPct)[0];

export function quote(residence: Residence, from: string, to: string): Quote | null {
  const nights = nightsBetween(from, to);
  if (nights < 1) return null;

  const nightlyUsd = residence.nightlyUsd;
  const subtotalUsd = nightlyUsd * nights;

  const discounts: Quote["discounts"] = [];

  // The book-direct promise, applied first and always.
  const direct = (subtotalUsd * rates.directDiscountPct) / 100;
  discounts.push({
    label: `Booked direct, ${rates.directDiscountPct}% below platform rate`,
    pct: rates.directDiscountPct,
    amountUsd: direct,
  });

  // The long-stay ladder, applied to what remains.
  const band = longStayBand(nights);
  if (band) {
    const base = subtotalUsd - direct;
    discounts.push({
      label: `${band.label} — ${band.discountPct}% off`,
      pct: band.discountPct,
      amountUsd: (base * band.discountPct) / 100,
    });
  }

  const totalUsd = discounts.reduce((acc, d) => acc - d.amountUsd, subtotalUsd);
  const platformTotalUsd = subtotalUsd * (1 + rates.platformUpliftPct / 100);

  return {
    nights,
    nightlyUsd,
    platformTotalUsd,
    subtotalUsd,
    discounts,
    totalUsd,
    savingUsd: platformTotalUsd - totalUsd,
    perNightUsd: totalUsd / nights,
  };
}

/** The lowest nightly rate across all residences, for "from $X" copy. */
export const fromRate = (list: Residence[]) =>
  list.reduce((min, r) => Math.min(min, r.nightlyUsd), Infinity);

/**
 * The nightly rate a guest would see for this residence after the direct discount.
 * Used on cards, where a single number has to be honest on its own.
 */
export const directNightly = (r: Residence) =>
  r.nightlyUsd * (1 - rates.directDiscountPct / 100);
