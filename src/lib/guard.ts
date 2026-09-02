/**
 * PROTECTION FOR THE TWO PUBLIC ENDPOINTS
 * ---------------------------------------------------------------------------
 * /api/booking-request and /api/enquiry both send an email when they are
 * posted to. They are public, they are linked from every page, and until now
 * nothing at all stood in front of them: no rate limit, no size limit, no spam
 * trap, and no check that the address a guest typed could even receive a reply.
 *
 * That is a bill waiting to happen. A bot that finds the endpoint can send as
 * fast as it likes, filling the reservations inbox with rubbish and spending
 * the Resend quota — and a real booking arriving in the middle of that flood is
 * the one that gets missed.
 *
 * None of this is a substitute for a proper WAF. It is the cheap 90% that costs
 * nothing to run and stops the traffic that actually shows up.
 */

/**
 * A sliding-window rate limit, held in memory.
 *
 * HONEST LIMITATION: on serverless this is per-instance and disappears when the
 * instance is recycled, so a determined attacker spread across enough cold
 * starts gets through. It is still worth having — the floods that actually
 * arrive come from one place as fast as they can, which is exactly what this
 * stops — but if abuse ever becomes real, this is the piece to replace with a
 * shared store such as Vercel KV, and the only piece that needs replacing.
 */
const hits = new Map<string, number[]>();

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) hits.clear();

  if (recent.length >= limit) {
    const oldest = recent[0];
    return { ok: false, retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true, retryAfterSeconds: 0 };
}

/**
 * Who is asking.
 *
 * Behind Vercel the client address is in x-forwarded-for, first entry. Falls
 * back to a single shared bucket rather than to a per-request unique value:
 * if the header is ever missing, everyone sharing one limit is the safe
 * failure, and giving each request its own key would silently disable the
 * limiter altogether.
 */
export function clientKey(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Longest body worth reading. A booking request is under 2KB of JSON. */
export const MAX_BODY_BYTES = 16 * 1024;

export function bodyTooLarge(request: Request): boolean {
  const len = Number(request.headers.get("content-length") ?? 0);
  return Number.isFinite(len) && len > MAX_BODY_BYTES;
}

/**
 * Cut a field to a sane length.
 *
 * Every one of these ends up inside an email. Without a cap, "notes" is an
 * unbounded string that a stranger can put in the reservations inbox.
 */
export const clamp = (value: unknown, max: number): string =>
  String(value ?? "")
    .trim()
    .slice(0, max);

export const FIELD_LIMITS = {
  name: 80,
  email: 254, // the actual maximum length of an email address
  phone: 32,
  organisation: 120,
  short: 200,
  notes: 2000,
} as const;

/**
 * Does this address stand a chance of receiving a reply?
 *
 * Deliberately permissive. The job is to catch a typo and an obviously fake
 * entry, not to adjudicate the grammar of email addresses — real addresses are
 * stranger than most regular expressions allow, and rejecting a guest's real
 * address is a worse failure than accepting a bad one.
 */
export const looksLikeEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && value.length <= FIELD_LIMITS.email;

/**
 * The spam trap.
 *
 * The form renders a field no human can see. A person leaves it empty; the
 * scripts that fill in every input on a page do not. When it comes back filled
 * the request is dropped — and the caller is told it succeeded, because telling
 * a bot precisely which move failed is how it learns to stop making it.
 */
export const HONEYPOT_FIELD = "company_website";

export const looksAutomated = (body: Record<string, unknown>): boolean =>
  clamp(body[HONEYPOT_FIELD], 50).length > 0;
