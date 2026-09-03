import { rates, type Residence } from "./content";

/**
 * Pricing engine.
 *
 * One rule governs this file: the number a guest sees first is the number they pay.
 * Drip pricing (fees that appear only at checkout) is prohibited by the Elite
 * Builder System (conversion_psychology.md, "EXPLICITLY BANNED"). Every component
 * of the total is computed here and rendered in full at every step of the flow.
 *
 * TEN PER CENT, AND ONLY TEN PER CENT.
 *
 * There were two discount settings in here and they stacked. `directDiscountPct`
 * derived a published rate of K2,222 from the K2,000 a guest pays and a second
 * setting then added another twelve per cent on top of THAT to invent a platform
 * price of K2,489. So the rate table and the checkout panel showed a saving of
 * K489 a night, about 19.6 per cent, while every line of copy on the site
 * promised ten. Both numbers appeared on the rates page, a few centimetres
 * apart.
 *
 * The owner has settled it: ten per cent is the promise. The platform price is
 * now the published rate, exactly ten per cent above what a guest pays direct,
 * and the second setting is gone. One number produces the discount, the struck
 * through comparison and the saving, so they cannot disagree again.
 */

export type Quote = {
  nights: number;
  /** Published nightly rate, before any discount. Also the platform rate. */
  nightlyZmw: number;
  /** What the same stay costs on a booking platform, for honest comparison. */
  platformTotalZmw: number;
  /** Sum of nightly rates before discounts. */
  subtotalZmw: number;
  discounts: { label: string; pct: number; amountZmw: number }[];
  totalZmw: number;
  /** What booking direct saves against the platform price. */
  savingZmw: number;
  /** Effective average per night after discounts. */
  perNightZmw: number;
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
 * The long-stay band a stay qualifies for, or nothing.
 *
 * The deepest discount wins and they do not stack. Stacking would make the
 * displayed headline discount a lie.
 *
 * EXPORTED on purpose. The rates page used to pick the band itself with
 * `.pop()`, which takes the LAST match rather than the deepest one. The two
 * agreed only because the ladder happens to be written in ascending order, and
 * would have silently disagreed the first time somebody reordered it. There is
 * now one implementation and every caller uses it.
 */
export const longStayBand = (nights: number) =>
  [...rates.longStay]
    .filter((b) => nights >= b.minNights)
    .sort((a, b) => b.discountPct - a.discountPct)[0];

export function quote(residence: Residence, from: string, to: string): Quote | null {
  const nights = nightsBetween(from, to);
  if (nights < 1) return null;

  const nightlyZmw = publishedNightly(residence);
  const subtotalZmw = nightlyZmw * nights;

  const discounts: Quote["discounts"] = [];

  // The book-direct promise, applied first and always.
  const direct = (subtotalZmw * rates.directDiscountPct) / 100;
  discounts.push({
    label: `Booked direct, ${rates.directDiscountPct}% below platform rate`,
    pct: rates.directDiscountPct,
    amountZmw: direct,
  });

  // The long-stay ladder, applied to what remains.
  const band = longStayBand(nights);
  if (band) {
    const base = subtotalZmw - direct;
    discounts.push({
      label: `${band.label}, ${band.discountPct}% off`,
      pct: band.discountPct,
      amountZmw: (base * band.discountPct) / 100,
    });
  }

  const totalZmw = discounts.reduce((acc, d) => acc - d.amountZmw, subtotalZmw);

  /*
    The platform price IS the published rate. A guest booking the same stay on
    Booking.com pays the rate we publish there; booking here takes ten per cent
    off it. Nothing is added on top, so the saving shown to a guest is always
    exactly the discount promised to them.
  */
  const platformTotalZmw = subtotalZmw;

  return {
    nights,
    nightlyZmw,
    platformTotalZmw,
    subtotalZmw,
    discounts,
    totalZmw,
    savingZmw: platformTotalZmw - totalZmw,
    perNightZmw: totalZmw / nights,
  };
}

/*
  `fromRate` used to live here: the lowest nightly rate across a list, for
  "from K X" copy. Nothing called it. The pages that show a "from" price pick the
  cheapest residence themselves and pass it to `directNightly`, which is the same
  answer by a shorter route. Removed rather than left as a second way to do one
  thing, which is how two ways to do one thing start disagreeing.
*/

/**
 * What a guest actually pays per night, booking direct. This is the number the
 * owner sets, so it is returned as stored rather than calculated.
 */
export const directNightly = (r: Residence) => r.directNightlyZmw;

/**
 * The published rate: the headline the book-direct discount comes off and the
 * price the same night carries on a booking platform.
 *
 * Derived from the direct price rather than stored beside it and deliberately
 * left unrounded. Rounding here is what put a three-night stay at K5,999.40
 * against a nightly rate advertised as K2,000: the discount was being taken off
 * a rounded headline. Working back from the direct price makes every multiple
 * land exactly where a guest expects it to.
 */
export const publishedNightly = (r: Residence) =>
  r.directNightlyZmw / (1 - rates.directDiscountPct / 100);
