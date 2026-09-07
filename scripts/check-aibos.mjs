/**
 * Is this site actually connected to AI-BOS?
 *
 *   npm run check:aibos
 *
 * WHY THIS EXISTS. Connecting is four things done in three different places: a
 * migration in Supabase, a token minted in the AI-BOS dashboard, two variables
 * set on Vercel, and slugs on each unit that match the ones this site uses.
 * Get any of them wrong and nothing errors loudly. The site deploys, looks
 * perfect, and every date check quietly falls back to "we could not check those
 * dates" — which is honest, and tells you nothing about why.
 *
 * So this asks the API the same questions the site asks, in order, and says
 * which step is the one that is wrong.
 *
 * It reads .env.local, then the real environment, so it works locally and in a
 * deploy log. It only ever reads: no booking is ever sent.
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

// ── Settings ────────────────────────────────────────────────────────────────

function loadEnvFile(name) {
  const path = join(root, name);
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    out[trimmed.slice(0, eq).trim()] = trimmed
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
  }
  return out;
}

const fromFile = { ...loadEnvFile(".env.local"), ...loadEnvFile(".env") };
const setting = (key) => process.env[key] || fromFile[key] || "";

const API = setting("NEXT_PUBLIC_AIBOS_API_URL").replace(/\/+$/, "");
const TOKEN = setting("NEXT_PUBLIC_AIBOS_SITE_TOKEN");

// ── Output ──────────────────────────────────────────────────────────────────

const ok = (m) => console.log(`  ok    ${m}`);
const bad = (m) => console.log(`  WRONG ${m}`);
const note = (m) => console.log(`        ${m}`);

function stop(heading, ...lines) {
  console.log("");
  console.log(heading);
  lines.forEach((l) => console.log(`  ${l}`));
  console.log("");
  process.exit(1);
}

// The residences this site asks for by name. Read from the content file rather
// than repeated here, so the two cannot drift apart.
function siteSlugs() {
  const src = readFileSync(join(root, "src/lib/content.ts"), "utf8");
  const start = src.indexOf("export const residences");
  const body = start === -1 ? src : src.slice(start);
  return [...body.matchAll(/slug:\s*"([a-z0-9-]+)"/g)].map((m) => m[1]);
}

async function get(url) {
  const res = await fetch(url, { cache: "no-store" });
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* not json */
  }
  return { status: res.status, body };
}

// ── The checks, cheapest and most likely first ──────────────────────────────

console.log("");
console.log("Checking the AI-BOS connection");
console.log("");

if (!API && !TOKEN) {
  stop("Not connected, and not trying to be.",
    "NEXT_PUBLIC_AIBOS_API_URL and NEXT_PUBLIC_AIBOS_SITE_TOKEN are both unset.",
    "The booking flow runs locally and a person confirms every request by hand,",
    "which is what the confirmation screen says. That is a fine place to be.",
    "",
    "To connect: AI-BOS -> Hospitality -> Channels -> Your own website.");
}

if (!API) stop("NEXT_PUBLIC_AIBOS_API_URL is not set.", "The token is set without an address to send it to.");
if (!TOKEN) stop("NEXT_PUBLIC_AIBOS_SITE_TOKEN is not set.", "The address is set without a token.");

ok(`API address: ${API}`);

if (/vercel\.app|\/api\/proxy/.test(API)) {
  bad("that looks like the AI-BOS WEBSITE, not the API.");
  note("The website's /api/proxy attaches a signed-in owner's session.");
  note("This site has none, so every call would come back unauthenticated.");
  note("Use the API's own address, the one the dashboard's card shows.");
  process.exit(1);
}

// 1. Is anything there?
let health;
try {
  health = await get(`${API}/health`);
} catch (e) {
  stop("Could not reach the API at all.", String(e.message || e),
    "A free host sleeps after 15 idle minutes; try once more before believing it.");
}
if (health.status !== 200) stop(`The API answered ${health.status} on /health.`);
ok(`API is up (build ${health.body?.build_sha ?? "?"} on ${health.body?.host ?? "?"})`);

// 2. Does the token resolve to a property?
const units = await get(`${API}/public/stay/${TOKEN}/units`);

if (units.status === 503) {
  stop("The database is not ready.", String(units.body?.detail ?? ""),
    "Run that migration in the Supabase SQL editor, then try again.");
}
if (units.status === 404) {
  stop("The token does not match any property.",
    "Either it was mistyped, or it has been rotated in the dashboard since.",
    "AI-BOS -> Hospitality -> Channels -> Your own website shows the current one.");
}
if (units.status !== 200) {
  stop(`Asking for the units answered ${units.status}.`, String(units.body?.detail ?? ""));
}

const list = units.body?.units ?? [];
ok(`token resolves to "${units.body?.property}" with ${list.length} unit${list.length === 1 ? "" : "s"}`);

if (list.length === 0) {
  stop("The property has no units yet.",
    "Add them in AI-BOS -> Hospitality -> Units. Nothing can be booked until then.");
}

// 3. Do the handles match the ones this site uses?
const wanted = siteSlugs();
const have = new Set(list.map((u) => u.slug));
const missing = wanted.filter((s) => !have.has(s));

console.log("");
console.log("  Residences on this site, against AI-BOS:");
for (const slug of wanted) {
  const unit = list.find((u) => u.slug === slug);
  if (unit) ok(`${slug}  ->  ${unit.name}, sleeps ${unit.max_guests}, ${unit.currency} ${unit.nightly_rate}/night`);
  else bad(`${slug}  ->  no unit in AI-BOS answers to this`);
}
const spare = list.filter((u) => !wanted.includes(u.slug));
for (const u of spare) note(`(AI-BOS also has "${u.name}" at ${u.slug}, which this site does not show)`);

if (missing.length) {
  console.log("");
  stop("Some residences on this site have no unit behind them.",
    `Missing: ${missing.join(", ")}`,
    "In AI-BOS -> Hospitality -> Units, set 'Web address on your own site' on",
    "each unit to match. Leave it blank and the unit's NAME is turned into a",
    "handle instead, so a unit named exactly Mandela already answers to mandela.");
}

// 4. Does a real availability question get a real answer?
const start = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
const end = new Date(Date.now() + 32 * 86_400_000).toISOString().slice(0, 10);
const probe = await get(
  `${API}/public/stay/${TOKEN}/availability?unit_slug=${wanted[0]}&from=${start}&to=${end}`,
);
if (probe.status !== 200) {
  stop(`Checking dates answered ${probe.status}.`, String(probe.body?.detail ?? ""));
}
console.log("");
ok(`${wanted[0]} for ${start} to ${end}: ${probe.body.available ? "free" : "taken"} (${probe.body.nights} nights)`);

console.log("");
console.log("Connected. Live availability and booking requests are working.");
console.log("A request lands in AI-BOS as pending and holds the dates. Confirming");
console.log("it in the dashboard is what puts the stay in the books.");
console.log("");
