/**
 * Money and dates.
 *
 * KWACHA, AND ONLY KWACHA. Every amount in this codebase is Kwacha, because
 * that is the currency the business prices in and charges in.
 *
 * There used to be a USD/ZMW switch here and in the checkout summary. It quoted
 * in dollars and converted down to Kwacha at a stored rate that went stale
 * silently: at K18 to the dollar it would have offered a guest USD 111 for a
 * night priced at K2,000. The switch is gone, the stored rate is gone and the
 * two sentences of copy that still explained it to guests have gone with them.
 * If a dollar figure is ever wanted again it needs a live rate, not a constant.
 */

export function money(zmw: number): string {
  return `K${Math.round(zmw).toLocaleString("en-ZM")}`;
}

/**
 * A calendar day, as `YYYY-MM-DD`, or nothing.
 *
 * THE GUARD EVERY DATE IN THIS FILE DEPENDS ON.
 *
 * `new Date("banana")` is an Invalid Date and every useful thing you can do
 * with one throws: `toISOString` raises a RangeError and so does
 * `Intl.DateTimeFormat.format`. A booking page that reads its dates out of the
 * address bar therefore had one word between a guest and a blank screen with
 * "Application error" on it, because the throw happened during render and React
 * unmounted the whole page.
 *
 * So nothing in this file parses a date without asking this first and the two
 * formatters below return an empty string rather than throw. A malformed date
 * now shows as nothing, which the callers already handle, instead of taking the
 * page down.
 */
export function isValidIsoDate(value: unknown): boolean {
  const s = String(value ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00`);
  if (Number.isNaN(d.getTime())) return false;
  // Rejects the 31st of February, which `Date` would roll forward to March.
  return isoOf(d) === s;
}

/** `YYYY-MM-DD` for a Date, read in local time. */
const isoOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
});

export const prettyDate = (iso: string) =>
  isValidIsoDate(iso) ? DATE_FMT.format(new Date(`${iso}T00:00:00`)) : "";

/**
 * Today, in LOCAL time.
 *
 * This used to slice `toISOString()`, which is universal time. Zambia runs two
 * hours ahead of it, so between midnight and 02:00 local the site believed it
 * was still yesterday and offered a guest a date that had already gone.
 */
export const isoToday = () => isoOf(new Date());

export const isoPlusDays = (iso: string, days: number) => {
  if (!isValidIsoDate(iso)) return "";
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return isoOf(d);
};

/** "3 nights" / "1 night", used everywhere a night count is shown. */
export const nightLabel = (n: number) => `${n} ${n === 1 ? "night" : "nights"}`;
export const guestLabel = (n: number) => `${n} ${n === 1 ? "guest" : "guests"}`;
