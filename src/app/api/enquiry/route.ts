import { NextResponse } from "next/server";
import { prettyDate } from "@/lib/format";
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
 * Long-stay and corporate enquiries.
 *
 * Separate from the booking route because it is a different conversation: a
 * six-week engagement is negotiated and usually invoiced, often arranged by
 * someone other than the guest. It goes to a person, not a calendar.
 *
 * Same honesty rule as the booking route: if it cannot send, it says so
 * rather than showing a thank-you that means nothing.
 */

export const runtime = "nodejs";

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
    return NextResponse.json({ sent: false, reason: "too-large" }, { status: 413 });
  }

  const limit = rateLimit(clientKey(request), { limit: 6, windowMs: 60_000 });
  if (!limit.ok) {
    return NextResponse.json(
      { sent: false, reason: "rate-limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ sent: false, reason: "bad-request" }, { status: 400 });
  }

  // Filled trap: not a person. Answer as though it worked, but leave a trace.
  if (looksAutomated(raw)) {
    console.warn(
      "[enquiry] Honeypot filled, enquiry dropped. Email given:",
      clamp(raw.email, FIELD_LIMITS.email),
    );
    return NextResponse.json({ sent: true });
  }

  const b: Record<string, string> = {
    name: clamp(raw.name, FIELD_LIMITS.name),
    email: clamp(raw.email, FIELD_LIMITS.email),
    phone: clamp(raw.phone, FIELD_LIMITS.phone),
    organisation: clamp(raw.organisation, FIELD_LIMITS.organisation),
    people: clamp(raw.people, 16),
    from: clamp(raw.from, 10),
    to: clamp(raw.to, 10),
    message: clamp(raw.message, FIELD_LIMITS.notes),
  };

  /*
    THE INVOICE TICK BOX, WHICH USED TO BE THROWN AWAY.

    The form has always sent `invoice: true` when a guest ticks "I will need an
    invoice". This object was built without it, so the email read `b.invoice`,
    got `undefined` and printed "No" every single time. For a corporate booker
    whose employer is paying, that tick is the most important thing they told us,
    and it was the one field that could not survive the trip.

    Kept out of `b` above because that map is all strings and this is a boolean.
  */
  const needsInvoice = raw.invoice === true || raw.invoice === "true" || raw.invoice === "on";

  const missing = (["name", "email", "message"] as const).filter((k) => !b[k]);
  if (missing.length) {
    return NextResponse.json({ sent: false, reason: "incomplete" }, { status: 400 });
  }

  if (!looksLikeEmail(b.email)) {
    return NextResponse.json({ sent: false, reason: "bad-email" }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  const from = process.env.BOOKING_FROM_EMAIL;

  if (!key || !to || !from) {
    console.error("[enquiry] Mail is not configured. Enquiry NOT delivered from:", b.email);
    return NextResponse.json({ sent: false, reason: "not-configured" }, { status: 503 });
  }

  const html = `
<div style="font:15px system-ui;color:#1B2530;max-width:560px">
  <p style="font:600 20px system-ui;margin:0 0 20px">Long-stay enquiry</p>
  <table style="border-collapse:collapse;width:100%">
    ${row("Name", String(b.name))}
    ${row("Organisation", String(b.organisation ?? ""))}
    ${row("Email", String(b.email))}
    ${row("Phone", String(b.phone ?? ""))}
    ${row("Arriving", prettyDate(b.from) || b.from)}
    ${row("Leaving", prettyDate(b.to) || b.to)}
    ${row("People", String(b.people ?? ""))}
    ${row("Invoice needed", needsInvoice ? "YES" : "No")}
  </table>
  <p style="margin:20px 0 0;padding-top:14px;border-top:1px solid #D9D3C8;white-space:pre-wrap">${esc(b.message)}</p>
</div>`.trim();

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: String(b.email),
        subject: `Long-stay enquiry: ${b.name}${b.organisation ? `, ${b.organisation}` : ""}`,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[enquiry] Resend rejected the send:", res.status, await res.text());
      return NextResponse.json({ sent: false, reason: "send-failed" }, { status: 502 });
    }
    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error("[enquiry] Could not reach the mail service:", err);
    return NextResponse.json({ sent: false, reason: "unreachable" }, { status: 502 });
  }
}
