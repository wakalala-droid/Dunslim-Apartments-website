import { residences } from "./content";
import { nightsBetween } from "./pricing";

/**
 * AVAILABILITY: THE AI-BOS SEAM
 * ---------------------------------------------------------------------------
 * This is the only file that needs to change when the site is connected to
 * AI-BOS. Everything else in the app calls `checkAvailability` and
 * `submitBookingRequest` and does not care where the answer comes from.
 *
 * Today both functions run locally: every date is offered and a booking request
 * is held in memory so the whole flow can be walked end to end. Nothing is
 * written anywhere and no guest is told their booking is confirmed. The
 * confirmation screen says a person will confirm it, which is true.
 *
 * To connect AI-BOS, the hospitality module needs a public, token-scoped surface.
 * Today every /hospitality/* route sits behind require_user + require_feature;
 * the only unauthenticated route in the module is the iCal feed
 * (GET /hospitality/ical/{token}.ics). The three endpoints below mirror that
 * same token pattern:
 *
 *   GET  /public/stay/{site_token}/units
 *   GET  /public/stay/{site_token}/availability?unit_slug=&from=&to=
 *   POST /public/stay/{site_token}/booking-request
 *
 * THE PARAMETER NAME IS `unit_slug`, NOT `unit_id`. These notes said `unit_id`
 * while the code below sent `unit_slug`, which would have failed on the first
 * real request. It is settled as `unit_slug` because a slug is the only handle
 * this site has: the residences are identified here by `mandela`, `mulima` and
 * `kaunda` and nothing in the site knows an AI-BOS unit id. The public
 * endpoint has to accept the slug, or the module must publish its ids through
 * the `units` route above and this file must map them.
 *
 * A booking request lands as `pending`, which is already a blocking status in
 * the double-booking guard, so the request holds the dates on its own. The owner
 * confirms in the dashboard and the existing spine bridge posts the Sale.
 */

const API_BASE = process.env.NEXT_PUBLIC_AIBOS_API_URL ?? "";
const SITE_TOKEN = process.env.NEXT_PUBLIC_AIBOS_SITE_TOKEN ?? "";

export const isConnectedToAibos = () => Boolean(API_BASE && SITE_TOKEN);

export type AvailabilityResult =
  /** The dates are free. */
  | { status: "available"; nights: number }
  /** The dates are taken. */
  | { status: "unavailable"; nights: number; reason: string }
  /**
   * We asked and could not get an answer.
   *
   * A separate state on purpose. This case used to be reported as `available`,
   * which meant any hiccup on the far end offered a guest dates that might
   * already be taken and read as a working connection while doing nothing of
   * the kind. The guest is still allowed to continue, because a request is only
   * ever a request here and a person confirms it, but the flow says plainly
   * that the dates were not checked.
   */
  | { status: "unknown"; nights: number; reason: string }
  | { status: "invalid"; reason: string };

export async function checkAvailability(
  slug: string,
  from: string,
  to: string,
): Promise<AvailabilityResult> {
  const nights = nightsBetween(from, to);

  if (!from || !to) return { status: "invalid", reason: "Choose both an arrival and a departure date." };
  if (nights < 1) return { status: "invalid", reason: "Departure must be after arrival." };
  if (!residences.some((r) => r.slug === slug)) {
    return { status: "invalid", reason: "That residence does not exist." };
  }

  if (isConnectedToAibos()) {
    try {
      const url = new URL(`${API_BASE}/public/stay/${SITE_TOKEN}/availability`);
      url.searchParams.set("unit_slug", slug);
      url.searchParams.set("from", from);
      url.searchParams.set("to", to);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`availability ${res.status}`);
      const data = (await res.json()) as { available?: boolean; reason?: string };
      return data.available
        ? { status: "available", nights }
        : { status: "unavailable", nights, reason: data.reason ?? "Those dates are taken." };
    } catch {
      /*
        A guest is never blocked because the far end blipped and they are never
        told a date is free when nobody checked. They carry on and the flow tells
        them a person will confirm the dates by hand.
      */
      return {
        status: "unknown",
        nights,
        reason: "We could not check those dates automatically.",
      };
    }
  }

  return { status: "available", nights };
}

// ---------------------------------------------------------------------------
// Booking requests
// ---------------------------------------------------------------------------

export type BookingRequest = {
  slug: string;
  from: string;
  to: string;
  guests: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  organisation: string;
  purpose: "business" | "leisure" | "relocation" | "other" | "";
  arrivalTime: string;
  notes: string;
  payment: PaymentMethod;
  totalZmw: number;
  /** The spam trap. Empty for every real guest; see components/ui/Honeypot. */
  company_website?: string;
};

export type PaymentMethod = "card" | "mobile-money" | "bank-transfer" | "on-arrival" | "";

export type BookingOutcome = {
  reference: string;
  /** True only when a real system accepted it. Never used to imply a confirmed stay. */
  recorded: boolean;
};

/**
 * A short, human-readable reference a guest can quote on WhatsApp.
 *
 * Six characters rather than four, from the browser's crypto source rather than
 * `Math.random`. Four base-36 characters is 1.7 million combinations per month,
 * which sounds ample until you remember these are minted in the browser with no
 * central register: two guests who collide are two requests that look like one
 * in the inbox. Six takes it to 2.1 billion and costs nothing.
 */
function makeReference(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}`.slice(2) + String(d.getMonth() + 1).padStart(2, "0");

  const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I, O, 0, 1: read aloud
  let rand = "";
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes.forEach((b) => {
    rand += ALPHABET[b % ALPHABET.length];
  });

  return `DA-${stamp}-${rand}`;
}

/**
 * Submit a booking request.
 *
 * Two destinations, tried in order:
 *
 *  1. AI-BOS, when it is connected. The request lands as a `pending` booking
 *     and holds the dates in the double-booking guard.
 *  2. The site's own /api/booking-request route, which emails the reservations
 *     inbox. This is the floor: it always runs when AI-BOS is not connected.
 *
 * If both fail, `recorded` comes back false and the confirmation screen says
 * so plainly. It must never claim a request was received when nobody was told.
 */
export async function submitBookingRequest(req: BookingRequest): Promise<BookingOutcome> {
  const reference = makeReference();

  if (isConnectedToAibos()) {
    try {
      const res = await fetch(`${API_BASE}/public/stay/${SITE_TOKEN}/booking-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...req, reference }),
      });
      if (res.ok) return { reference, recorded: true };
    } catch {
      /* fall through to the mail path below */
    }
  }

  try {
    const res = await fetch("/api/booking-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...req, reference }),
    });
    if (res.ok) {
      const data = (await res.json()) as { recorded?: boolean };
      if (data.recorded) return { reference, recorded: true };
    }
  } catch {
    /* fall through */
  }

  return { reference, recorded: false };
}
