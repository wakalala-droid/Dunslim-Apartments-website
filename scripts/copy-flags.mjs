/**
 * Put a flag SVG in /public/flags for every currency in src/lib/currencies.ts.
 *
 *   npm run flags
 *
 * The files are COMMITTED, and the package they come from is a devDependency,
 * so a deploy never depends on it. Rerun this after adding a currency.
 *
 * Emoji flags were the obvious alternative and they are unusable: Windows ships
 * no flag glyphs at all, so "🇿🇦" renders as the letters ZA on the laptops a
 * good share of these guests are booking from.
 *
 * Source: country-flag-icons (MIT), 3x2 set, already optimised.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const from = join(root, "node_modules", "country-flag-icons", "3x2");
const to = join(root, "public", "flags");

if (!existsSync(from)) {
  console.error("country-flag-icons is not installed. Run: npm install");
  process.exit(1);
}

// Read the country codes straight out of the catalogue, so the two cannot drift.
const source = readFileSync(join(root, "src", "lib", "currencies.ts"), "utf8");
const wanted = [...source.matchAll(/country:\s*"([A-Z]{2})"/g)].map((m) => m[1]);
const unique = [...new Set(wanted)].sort();

if (unique.length === 0) {
  console.error("No country codes found in src/lib/currencies.ts.");
  process.exit(1);
}

mkdirSync(to, { recursive: true });

// Anything no longer in the catalogue goes, so the folder is never a graveyard.
for (const file of existsSync(to) ? readdirSync(to) : []) {
  if (file.endsWith(".svg") && !unique.includes(file.replace(".svg", ""))) {
    rmSync(join(to, file));
    console.log(`removed ${file}`);
  }
}

let copied = 0;
const missing = [];
for (const code of unique) {
  const src = join(from, `${code}.svg`);
  if (!existsSync(src)) {
    missing.push(code);
    continue;
  }
  writeFileSync(join(to, `${code}.svg`), readFileSync(src));
  copied += 1;
}

console.log(`${copied} flags in public/flags`);

if (missing.length) {
  console.error(`NO FLAG FOR: ${missing.join(", ")}. Fix the country code in currencies.ts.`);
  process.exit(1);
}
