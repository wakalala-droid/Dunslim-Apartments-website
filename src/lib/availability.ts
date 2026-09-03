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
 *   GET  /public/stay/{site_token}/availability?unit_id=&from=&to=
 *   POST /public/stay/{site_token}/booking-request
 *
 * A booking request lands as `pending`, which is already a blocking status in
 * the double-booking guard, so the request holds the dates on its own. The owner
 * confirms in the dashboard and the existing spine bridge posts the Sale.
 */

const API_BASE = process.env.NEXT_PUBLIC_AIBOS_API_URL ?? "";
const SITE_TOKEN = process.env.NEXT_PUBLIC_AIBOS_SITE_TOKEN ?? "";

export const isConnectedToAibos = () => Boolean(API_BASE && SITE_TOKEN);

export type AvailabilityResult =
  | { status: "available"; nights: number }
  | { status: "unavailable"; nights: number; reason: string }
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
      // Fall through. A guest should never see a blank page because an API blipped.
      // they see the enquiry path instead, which a person answers.
      return { status: "available", nights };
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

/** A short, human-readable reference a guest can quote on WhatsApp. */
function makeReference(): string {
  const d = new Date();
  const stamp = `${d.getFullYear()}`.slice(2) + String(d.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
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
