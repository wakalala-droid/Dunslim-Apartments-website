import { rates } from "./content";

export type Currency = "USD" | "ZMW";

/**
 * Currency display.
 *
 * USD is the base. ZMW is derived at the rate recorded in content.ts and is
 * always labelled as approximate, because it is a stored rate rather than a live
 * one. Showing a converted figure as if it were exact would be a quiet lie.
 */
export function money(usd: number, currency: Currency = "USD"): string {
  if (currency === "ZMW") {
    const zmw = usd * rates.zmwPerUsd;
    return `K${Math.round(zmw).toLocaleString("en-ZM")}`;
  }
  const whole = Math.round(usd);
  return `$${whole.toLocaleString("en-US")}`;
}

export const currencyNote = (currency: Currency) =>
  currency === "ZMW"
    ? `Approximate, at K${rates.zmwPerUsd} to the dollar. Charged in US dollars.`
    : null;

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export const prettyDate = (iso: string) =>
  iso ? DATE_FMT.format(new Date(`${iso}T00:00:00`)) : "";

export const isoToday = () => new Date().toISOString().slice(0, 10);

export const isoPlusDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

/** "3 nights" / "1 night" — used everywhere a night count is shown. */
export const nightLabel = (n: number) => `${n} ${n === 1 ? "night" : "nights"}`;
export const guestLabel = (n: number) => `${n} ${n === 1 ? "guest" : "guests"}`;
