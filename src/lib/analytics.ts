/**
 * MEASUREMENT
 * ---------------------------------------------------------------------------
 * The site had none at all. There was no way to answer how many people visited,
 * how many started a booking, where they gave up, or whether the site had ever
 * produced one, which for a business whose whole pitch is "cheaper booked
 * direct" is the biggest hole in it. You cannot argue that direct works without
 * knowing how often it does.
 *
 * NO DEPENDENCY. Vercel's own script is served from the deployment itself, and
 * the `@vercel/analytics` package is a wrapper around loading it and calling
 * `window.va`. Both are done here directly, which keeps the JavaScript this
 * site ships exactly where it was, worth caring about, having just removed an
 * animation library for the same reason.
 *
 * PRIVACY. Vercel Web Analytics sets no cookies and records no personal data,
 * which is why there is no consent banner for it. Nothing here ever passes a
 * guest's name, email, phone or message: the events below carry a step name and
 * an apartment slug and nothing else. Keep it that way, because an analytics call is
 * a very easy place to leak a guest into a third party by accident.
 *
 * ONE MANUAL STEP: Web Analytics has to be switched on for the project in the
 * Vercel dashboard (Project → Analytics → Enable). Until it is, the script 404s
 * quietly and nothing is recorded. Enabling it costs nothing on the free tier.
 */

type EventData = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    va?: (event: string, properties?: unknown) => void;
  }
}

/**
 * Record something a guest did.
 *
 * Deliberately silent on failure. Analytics must never be able to break a
 * booking: if the script is blocked, has not loaded yet, or throws, the guest
 * carries on and we simply lose the datapoint. Losing a number is nothing;
 * losing the booking is the business.
 */
export function track(name: string, data?: EventData): void {
  try {
    window.va?.("event", { name, data });
  } catch {
    /* Never let measurement interrupt a guest. */
  }
}

/** The steps of the booking flow, named once so the funnel reads consistently. */
export const BOOKING_STEP = {
  dates: "booking_dates",
  residence: "booking_residence",
  details: "booking_details",
  review: "booking_review",
} as const;
