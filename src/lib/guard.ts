/**
 * PROTECTION FOR THE TWO PUBLIC ENDPOINTS
 * ---------------------------------------------------------------------------
 * /api/booking-request and /api/enquiry both send an email when they are
 * posted to. They are public, they are linked from every page and until now
 * nothing at all stood in front of them: no rate limit, no size limit, no spam
 * trap and no check that the address a guest typed could even receive a reply.
 *
 * That is a bill waiting to happen. A bot that finds the endpoint can send as
 * fast as it likes, filling the reservations inbox with rubbish and spending
 * the Resend quota and a real booking arriving in the middle of that flood is
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
 * starts gets through. It is still worth having, because the floods that actually
 * arrive come from one place as fast as they can, which is exactly what this
 * stops. If abuse ever becomes real, this is the piece to replace with a
 * shared store such as Vercel KV and the only piece that needs replacing.
 */
const hits = new Map<string, number[]>();

/**
 * Drop everyone whose window has already elapsed.
 *
 * This used to be `hits.clear()` once the map passed five thousand entries,
 * which handed an attacker a reset button: five thousand invented callers and
 * everybody's count went to zero, including theirs. Expiring by age instead
 * bounds the map just as well and cannot be used to wipe a live window.
 */
function prune(cutoff: number) {
  // `Array.from` rather than iterating the Map directly: the project's
  // TypeScript target predates for..of over a Map and this also snapshots the
  // keys so deleting while walking them is safe.
  for (const key of Array.from(hits.keys())) {
    const live = (hits.get(key) ?? []).filter((t: number) => t > cutoff);
    if (live.length) hits.set(key, live);
    else hits.delete(key);
  }
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { ok: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const cutoff = now - windowMs;

  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff);

  if (hits.size > 2000) prune(cutoff);

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
 * ORDER MATTERS, AND IT USED TO BE WRONG. The first thing this read was
 * `x-forwarded-for`, first entry. A caller can send that header themselves, and
 * a proxy appends rather than replaces, so the first entry is whatever the
 * caller put there: a different value on each request bought a fresh allowance
 * every time and the limit counted for nothing.
 *
 * `x-vercel-forwarded-for` is set by the platform on the way in and cannot be
 * spoofed by the caller, so it is asked first. The general header stays as a
 * fallback for running anywhere else and last of all everyone shares one
 * bucket, which is the safe failure: giving each request its own key would
 * silently switch the limiter off.
 */
export function clientKey(request: Request): string {
  const platform = request.headers.get("x-vercel-forwarded-for")?.trim();
  if (platform) return platform;

  const real = request.headers.get("x-real-ip")?.trim();
  if (real) return real;

  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();

  return "unknown";
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
 * entry, not to adjudicate the grammar of email addresses. Real addresses are
 * stranger than most regular expressions allow and rejecting a guest's real
 * address is a worse failure than accepting a bad one.
 */
export const looksLikeEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(value) && value.length <= FIELD_LIMITS.email;

/**
 * The spam trap.
 *
 * The form renders a field no human can see. A person leaves it empty; the
 * scripts that fill in every input on a page do not. When it comes back filled
 * the request is dropped and the caller is told it succeeded, because telling
 * a bot precisely which move failed is how it learns to stop making it.
 *
 * THE ONE RISK, AND WHY BOTH ROUTES NOW LOG A CATCH. "Told it succeeded" is the
 * same signal the confirmation screen reads to choose between "We have your
 * request" and "This did not send". So if the trap ever fires on a real guest,
 * that guest is shown the one screen this codebase works hardest to avoid. The
 * opaque answer stays, because it is right for the bots, but a catch is now
 * written to the log. If a real name ever appears on that line, loosen this.
 */
export const HONEYPOT_FIELD = "company_website";

export const looksAutomated = (body: Record<string, unknown>): boolean =>
  clamp(body[HONEYPOT_FIELD], 50).length > 0;
