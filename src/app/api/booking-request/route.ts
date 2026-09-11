import { NextResponse } from "next/server";
import { getResidence, arrival, business } from "@/lib/content";
import { money, prettyDate, nightLabel, isValidIsoDate, isoToday } from "@/lib/format";
import { quote as buildQuote } from "@/lib/pricing";
import {
  rateLimit,
  clientKey,
  bodyTooLarge,
  clamp,
  FIELD_LIMITS,
  looksLikeEmail,
  looksAutomated,
} from "@/lib/guard";

/**
 * WHERE A BOOKING REQUEST ACTUALLY GOES
 * ---------------------------------------------------------------------------
 * Before this existed, a guest completed the whole flow, was told their dates
 * were held and the request was discarded. This route is what makes that
 * message true.
 *
 * It emails the reservations inbox. It does not pretend to succeed: if the mail
 * cannot be sent, it says so and the confirmation screen changes to match.
 * A booking that silently vanishes is worse than a form that admits it failed,
 * because the guest walks away believing they have a room.
 *
 * Required environment variables (server-side, never NEXT_PUBLIC):
 *   RESEND_API_KEY        from resend.com
 *   BOOKING_NOTIFY_EMAIL  where requests are sent
 *   BOOKING_FROM_EMAIL    a sender on a domain verified with Resend
 */

export const runtime = "nodejs";

type Payload = {
  reference?: string;
  slug?: string;
  from?: string;
  to?: string;
  guests?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  organisation?: string;
  purpose?: string;
  arrivalTime?: string;
  notes?: string;
  payment?: string;
};

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const row = (k: string, v: string) =>
  v
    ? `<tr><td style="padding:6px 16px 6px 0;color:#6B7076;font:13px system-ui">${esc(k)}</td>` +
      `<td style="padding:6px 0;color:#1B2530;font:15px system-ui">${esc(v)}</td></tr>`
    : "";

export async function POST(request: Request) {
  if (bodyTooLarge(request)) {
    return NextResponse.json({ recorded: false, reason: "too-large" }, { status: 413 });
  }

  /*
    Six requests a minute from one address. A guest sends one and might send a
    second if they change their mind about the dates. Anything past six in a
    minute is not a person booking an apartment.
  */
  const limit = rateLimit(clientKey(request), { limit: 6, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { recorded: false, reason: "rate-limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ recorded: false, reason: "bad-request" }, { status: 400 });
  }

  /*
    The trap came back filled, so this was not typed by a person. Answer as
    though it worked: an error tells the sender which move to change.

    Logged, though. This branch shows the guest "We have your request" when
    nobody was told, so if it ever catches a real person it has to be findable.
  */
  if (looksAutomated(raw)) {
    console.warn(
      "[booking-request] Honeypot filled, request dropped. If this line ever " +
        "appears beside a real guest, loosen the trap. Email given:",
      clamp(raw.email, FIELD_LIMITS.email),
    );
    return NextResponse.json({ recorded: true });
  }

  // Everything below ends up inside an email, so nothing goes in unclamped.
  const body: Payload = {
    reference: clamp(raw.reference, FIELD_LIMITS.short),
    slug: clamp(raw.slug, FIELD_LIMITS.short),
    from: clamp(raw.from, 10),
    to: clamp(raw.to, 10),
    guests: Number(raw.guests) || undefined,
    firstName: clamp(raw.firstName, FIELD_LIMITS.name),
    lastName: clamp(raw.lastName, FIELD_LIMITS.name),
    email: clamp(raw.email, FIELD_LIMITS.email),
    phone: clamp(raw.phone, FIELD_LIMITS.phone),
    organisation: clamp(raw.organisation, FIELD_LIMITS.organisation),
    purpose: clamp(raw.purpose, FIELD_LIMITS.short),
    arrivalTime: clamp(raw.arrivalTime, FIELD_LIMITS.short),
    notes: clamp(raw.notes, FIELD_LIMITS.notes),
    payment: clamp(raw.payment, FIELD_LIMITS.short),
  };

  // Only the fields we genuinely need to act on the request.
  const missing = (["firstName", "lastName", "email", "phone", "from", "to", "slug"] as const).filter(
    (k) => !String(body[k] ?? "").trim(),
  );
  if (missing.length) {
    return NextResponse.json({ recorded: false, reason: "incomplete" }, { status: 400 });
  }

  /*
    The address is the only way back to this guest: it is the reply-to on the
    email. A typo here means the request arrives and cannot be answered.
  */
  if (!looksLikeEmail(body.email!)) {
    return NextResponse.json({ recorded: false, reason: "bad-email" }, { status: 400 });
  }

  /*
    THE DATES, AND THE APARTMENT THEY ARE FOR.

    None of this was checked. Six deliberately wrong requests were sent at this
    route and all six passed: a stay in January 2020, `from: "banana"`, a
    departure before the arrival, a residence slug that does not exist and 999
    guests in a flat that sleeps four. Every one of them would have landed in the
    reservations inbox the moment the mail keys were set and the malformed date
    would have thrown inside the template below, where nothing catches it, so the
    guest would have been told the send failed for no discoverable reason.

    The client checks all of this too. That is not a reason to trust it: the
    client is a form anyone can skip by posting here directly.
  */
  const residence = getResidence(String(body.slug));
  if (!residence) {
    return NextResponse.json({ recorded: false, reason: "unknown-residence" }, { status: 400 });
  }

  if (!isValidIsoDate(body.from) || !isValidIsoDate(body.to)) {
    return NextResponse.json({ recorded: false, reason: "bad-dates" }, { status: 400 });
  }

  if (String(body.to) <= String(body.from)) {
    return NextResponse.json({ recorded: false, reason: "departure-before-arrival" }, { status: 400 });
  }

  if (String(body.from) < isoToday()) {
    return NextResponse.json({ recorded: false, reason: "arrival-in-the-past" }, { status: 400 });
  }

  const guests = Number(body.guests ?? 0);
  if (!Number.isInteger(guests) || guests < 1 || guests > residence.sleeps) {
    return NextResponse.json({ recorded: false, reason: "party-too-large" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  // Falls back to the reservations inbox in lib/content, so a request still
  // reaches a person if the environment variable was never set.
  const to = process.env.BOOKING_NOTIFY_EMAIL || business.email;
  const from = process.env.BOOKING_FROM_EMAIL;

  if (!key || !to || !from) {
    // Loud, not silent. The guest is told a person has not been notified.
    console.error(
      "[booking-request] Mail is not configured: RESEND_API_KEY, BOOKING_NOTIFY_EMAIL " +
        "and BOOKING_FROM_EMAIL must all be set. Request NOT delivered:",
      body.reference,
    );
    return NextResponse.json({ recorded: false, reason: "not-configured" }, { status: 503 });
  }

  const q = buildQuote(residence, String(body.from), String(body.to));
  const guest = `${body.firstName} ${body.lastName}`.trim();

  /*
    The total in the email is recomputed here, from the dates and the apartment,
    and never taken from the request. A page left open while a rate changes would
    otherwise quote the old price straight into the inbox as though it were
    current. If the two disagree the email says so, in the email, rather than
    leaving it to be discovered on arrival.
  */
  const clientTotal = Number(raw.totalZmw);
  const totalsDisagree =
    q != null && Number.isFinite(clientTotal) && Math.round(clientTotal) !== Math.round(q.totalZmw);

  const html = `
<div style="font:15px system-ui;color:#1B2530;max-width:560px">
  <p style="font:600 20px system-ui;margin:0 0 4px">New booking request</p>
  <p style="color:#6B7076;margin:0 0 20px">Reference ${esc(body.reference)}</p>
  <table style="border-collapse:collapse;width:100%">
    ${row("Guest", guest)}
    ${row("Email", String(body.email))}
    ${row("Phone", String(body.phone))}
    ${row("Organisation", String(body.organisation ?? ""))}
    ${row("Residence", residence.name)}
    ${row("Arrive", `${prettyDate(String(body.from))} from ${arrival.checkIn}`)}
    ${row("Depart", `${prettyDate(String(body.to))} by ${arrival.lateCheckOut}`)}
    ${row("Nights", q ? nightLabel(q.nights) : "")}
    ${row("Guests", String(body.guests ?? ""))}
    ${row("Total", q ? money(q.totalZmw) : "")}
    ${
      totalsDisagree
        ? row("CHECK THIS", `The guest's page showed ${money(clientTotal)}. Current rates give ${money(q!.totalZmw)}.`)
        : ""
    }
    ${row("Paying by", String(body.payment ?? ""))}
    ${row("Reason for stay", String(body.purpose ?? ""))}
    ${row("Arrival time", String(body.arrivalTime ?? ""))}
    ${row("Notes", String(body.notes ?? ""))}
  </table>
  <p style="margin:24px 0 0;padding-top:16px;border-top:1px solid #D9D3C8;color:#6B7076;font-size:13px">
    The guest has been told someone will confirm within a few hours. Their dates are not
    held anywhere yet. Confirm or decline so they are not left waiting.
  </p>
</div>`.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: String(body.email),
        subject: `Booking request: ${guest}, ${residence.name}, ref ${body.reference}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("[booking-request] Resend rejected the send:", res.status, await res.text());
      return NextResponse.json({ recorded: false, reason: "send-failed" }, { status: 502 });
    }

    return NextResponse.json({ recorded: true });
  } catch (err) {
    console.error("[booking-request] Could not reach the mail service:", err);
    return NextResponse.json({ recorded: false, reason: "unreachable" }, { status: 502 });
  }
}
