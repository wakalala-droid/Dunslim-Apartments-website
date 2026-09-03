import { rates } from "./content";

/**
 * Money.
 *
 * KWACHA, AND ONLY KWACHA. Every amount in this codebase is Kwacha, because
 * that is the currency the business prices in and charges in.
 *
 * There used to be a USD/ZMW switch here and in the checkout summary. It quoted
 * in dollars and converted down to Kwacha at a rate stored in content.ts. A
 * rate recorded in July 2026 and marked as needing confirmation every budgeting
 * cycle. A stored rate goes stale silently and a stale one shown beside a real
 * price is worse than no second currency at all: at K18 to the dollar the
 * switch would have offered a guest USD 111 for a night that is priced at
 * K2,000. If a dollar figure is wanted again it needs a live rate, not this.
 */
export function money(zmw: number): string {
  return `K${Math.round(zmw).toLocaleString("en-ZM")}`;
}

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

/** "3 nights" / "1 night", used everywhere a night count is shown. */
export const nightLabel = (n: number) => `${n} ${n === 1 ? "night" : "nights"}`;
export const guestLabel = (n: number) => `${n} ${n === 1 ? "guest" : "guests"}`;
