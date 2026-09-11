import { NextResponse } from "next/server";

/**
 * LIVE EXCHANGE RATES, FOR GUIDANCE ONLY
 * ---------------------------------------------------------------------------
 * A guest booking from London or Johannesburg wants to know roughly what a
 * night costs in money they think in. This route is what makes that possible
 * without putting a second price on the site.
 *
 * A STORED RATE IS NOT ALLOWED HERE, and this is the second attempt at it. The
 * first version of this site carried a constant of K18 to the dollar, went
 * stale in silence and offered a guest USD 111 for a night priced at K2,000
 * (see the header of lib/format.ts). So the number is fetched, never written
 * down, and if the fetch fails the site shows no foreign figure at all rather
 * than an old one.
 *
 * Kwacha remains the only currency the business prices in and charges in. What
 * this returns is a conversion, and everywhere it is shown it is labelled as
 * approximate.
 *
 * The upstream is exchangerate-api's open endpoint: no key, no account, one
 * update a day. Cached for six hours here, so a busy day is a handful of calls
 * rather than one per visitor.
 */

export const revalidate = 21600; // six hours

/** The currencies a Dunslim guest actually arrives with. */
const CURRENCIES = ["USD", "EUR", "GBP", "ZAR"] as const;

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/ZMW", {
      next: { revalidate },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);

    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, unknown>;
      time_last_update_utc?: string;
    };

    const rates: Record<string, number> = {};
    for (const code of CURRENCIES) {
      const value = data.rates?.[code];
      // A rate that is not a positive finite number is not a rate.
      if (typeof value === "number" && Number.isFinite(value) && value > 0) {
        rates[code] = value;
      }
    }

    if (Object.keys(rates).length === 0) throw new Error("no usable rates");

    return NextResponse.json(
      { base: "ZMW", rates, updated: data.time_last_update_utc ?? null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (error) {
    // Loud in the log, silent on the page. The converter simply does not appear.
    console.error("[fx] Live rates unavailable:", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
