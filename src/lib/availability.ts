import { residences } from "./content";
import { nightsBetween } from "./pricing";

/**
 * AVAILABILITY: THE AI-BOS SEAM
 * ---------------------------------------------------------------------------
 * This is the only file that needs to change when the site is connected to
 * AI-BOS. Everything else in the app calls `checkAvailability` and
 * `submitBookingRequest` and does not care where the answer comes from.
 *
 * CONNECTED, since 12 September 2026. `NEXT_PUBLIC_AIBOS_API_URL` and
 * `NEXT_PUBLIC_AIBOS_SITE_TOKEN` point at the hospitality module, which answers
 * with the three real units and the real calendar. `npm run check:aibos` says
 * so in one command and names the step that is wrong when it is not.
 *
 * Without both variables nothing is checked and every answer is "unknown",
 * never "available". A guest is never blocked by that and never told a date is
 * free when nobody asked.
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
      /*
        Every non-2xx here is genuinely unknown, and that is deliberately
        different from the booking POST below. This route answers a question:
        taken dates come back 200 with `available: false`, so a status code is
        never the way it says no. A code means the question did not get asked
        properly (404, 503, a malformed query), which is not an answer either
        way and must never be read as "the dates are free".
      */
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

  /*
    NOT CONNECTED IS NOT THE SAME AS FREE, and this line used to say it was.

    With no API address and no site token the function fell through to here and
    reported every date on the calendar as available, having asked nobody. That
    is the exact failure this file already fixed once for the connected path,
    where a blip on the far end used to come back as "available": a guest was
    offered dates that may already have gone, and the site read as working while
    doing nothing at all.

    It matters more now than it did as a local stub. The connection is real and
    lives in two environment variables, so it can be broken by a missing paste
    in Vercel or by a token rotated in the dashboard, silently, at any time.
    Answering "unknown" turns that into something a guest sees and somebody
    fixes, instead of a calendar that quietly says yes to everything.

    Nobody is blocked either way: a request is still a request and a person
    still confirms it.
  */
  return {
    status: "unknown",
    nights,
    reason: "We could not check those dates automatically.",
  };
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

/**
 * What happened to a booking request. Three outcomes, not two.
 *
 * It used to be one boolean, `recorded`, and that boolean could not tell the
 * difference between the two things it was asked to cover:
 *
 *   the request never reached anyone   (our fault, nothing is lost, chase us)
 *   the request reached AI-BOS and was refused  (answered, the dates are gone)
 *
 * Both came back false, so a guest whose dates had just been taken was shown
 * "this did not send ... Nothing is wrong on your end", which is wrong twice:
 * something IS wrong, and it is not delivery. Worse, a refusal fell through to
 * the fallback email, and when that email sent the guest was told "We have your
 * request" for a booking AI-BOS had already turned down. Someone could walk away
 * believing they hold a room that is not theirs.
 *
 * `reason` is the server's own words, and only ever set on `refused`.
 *
 * `refusal` says which kind, because there are two and the screen would
 * otherwise have to guess. "Those dates have just gone" is the right thing to
 * say to a guest who lost the race for an apartment and a flat untruth to one
 * whose email address was typed wrong, which is the same class of mistake this
 * whole change exists to stop making.
 */
export type BookingOutcome = {
  status: "accepted" | "refused" | "undelivered";
  reference: string;
  reason?: string;
  refusal?: "dates" | "details";
};

/**
 * The server's explanation, when it gave one we can actually show a guest.
 *
 * FastAPI sends `detail` as a plain string for an error we raised on purpose
 * and as an array of validation objects for one the framework raised itself, so
 * the type is checked rather than assumed: anything that is not a usable string
 * falls back to our own wording. The body may also be empty or not JSON at all,
 * which `res.json()` throws on.
 *
 * Trimmed to a sentence or two. This text is printed straight onto the
 * confirmation screen and a stack trace leaking into that space would be both
 * frightening and useless to a guest.
 */
async function serverReason(res: Response, fallback: string): Promise<string> {
  try {
    const data = (await res.json()) as { detail?: unknown };
    if (typeof data.detail === "string" && data.detail.trim()) {
      return data.detail.trim().slice(0, 200);
    }
  } catch {
    /* No body, or not JSON. The fallback is still true. */
  }
  return fallback;
}

/**
 * A short, human-readable reference a guest can quote on WhatsApp.
 *
 * Six characters rather than four, from the browser's crypto source rather than
 * `Math.random`. Four base-36 characters is 1.7 million combinations per month,
 * which sounds ample until you remember these are minted in the browser with no
 * central register: two guests who collide are two requests that look like one
 * in the inbox. Six takes it to 2.1 billion and costs nothing.
 */
export function makeReference(prefix = "DA"): string {
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

  return `${prefix}-${stamp}-${rand}`;
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
 * THE FALLBACK IS FOR LOST REQUESTS, NOT REFUSED ONES.
 *
 * That distinction is the whole of this function. The old version tested only
 * `res.ok`, so every unhappy answer from AI-BOS looked identical to a dropped
 * connection and every one of them went on to send the email. A 409 means
 * another guest took those dates a moment ago. Emailing the inbox anyway puts a
 * request for an occupied apartment in front of a person and, if the email
 * sends, tells the guest we have them down for a room AI-BOS has already said
 * no to. So the status code is read, and an answer is treated as an answer:
 *
 *   409  the dates went. Refused. No email.
 *   400  something they typed was not accepted. Refused, with the reason. No email.
 *   404 / 503  our setup is broken at this end. They did not get an answer, so
 *        the email still runs.
 *   a thrown fetch  no answer at all. The email still runs.
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

      if (res.ok) return { status: "accepted", reference };

      if (res.status === 409) {
        return {
          status: "refused",
          refusal: "dates",
          reference,
          reason: await serverReason(
            res,
            "Those dates have just been taken. Please choose different dates.",
          ),
        };
      }

      if (res.status === 400) {
        return {
          status: "refused",
          refusal: "details",
          reference,
          reason: await serverReason(res, "Some of these details were not accepted."),
        };
      }

      /* Anything else is ours to answer for. Fall through to the mail path. */
    } catch {
      /* No answer at all. Fall through to the mail path below. */
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
      if (data.recorded) return { status: "accepted", reference };
    }
  } catch {
    /* fall through */
  }

  return { status: "undelivered", reference };
}
