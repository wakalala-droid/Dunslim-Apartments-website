"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Select } from "@/components/ui/Field";

/**
 * WHAT A NIGHT COSTS IN THE MONEY YOU THINK IN
 * ---------------------------------------------------------------------------
 * Every price on this site is Kwacha and every guest is charged in Kwacha. This
 * converts, it does not re-price: nothing here is ever presented as the amount
 * a guest will be asked for.
 *
 * The rate is fetched from /api/fx, which fetches it live and caches it for six
 * hours. Nothing is stored in this file, deliberately: the last version of this
 * feature kept K18 to the dollar as a constant and quoted guests a rate that
 * had been wrong for years.
 *
 * IF THE RATE CANNOT BE FETCHED, NOTHING RENDERS. A converter showing a blank
 * or a guessed figure beside a real price is worse than no converter, and the
 * Kwacha price it sits under is complete on its own.
 *
 * The chosen currency is remembered in localStorage, so a guest who picks rand
 * on the rate card still sees rand at checkout.
 */

export const CURRENCIES = {
  USD: "US dollar",
  EUR: "Euro",
  GBP: "Pound sterling",
  ZAR: "South African rand",
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

type Fx = { rates: Partial<Record<CurrencyCode, number>>; updated: string | null };

const STORAGE_KEY = "dunslim.currency";

/*
  One request per page, not one per component. Both the rate card's converter
  and the checkout note call this; the promise is shared so the second caller
  gets the first one's answer.
*/
let inFlight: Promise<Fx | null> | null = null;

function loadRates(): Promise<Fx | null> {
  if (!inFlight) {
    inFlight = fetch("/api/fx")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) =>
        data && data.rates && Object.keys(data.rates).length
          ? ({ rates: data.rates, updated: data.updated ?? null } as Fx)
          : null,
      )
      .catch(() => null);
  }
  return inFlight;
}

function useFx() {
  const [fx, setFx] = useState<Fx | null>(null);
  const [code, setCode] = useState<CurrencyCode>("USD");

  useEffect(() => {
    let alive = true;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && saved in CURRENCIES) setCode(saved as CurrencyCode);
    } catch {
      // Private browsing. The default stands.
    }

    loadRates().then((value) => {
      if (alive) setFx(value);
    });

    return () => {
      alive = false;
    };
  }, []);

  const choose = (next: CurrencyCode) => {
    setCode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembering it is survivable. Not converting is not.
    }
  };

  const rate = fx?.rates?.[code];
  const codes = (Object.keys(CURRENCIES) as CurrencyCode[]).filter(
    (c) => typeof fx?.rates?.[c] === "number",
  );

  return {
    /** Null until the live rate is in, and null forever if it never arrives. */
    convert: (zmw: number) => (typeof rate === "number" ? zmw * rate : null),
    code,
    choose,
    codes,
  };
}

/** A converted amount, rounded to the whole unit. Nobody needs the cents here. */
function formatIn(code: CurrencyCode, amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * The full block: a currency picker and every price on the page converted.
 * Used on the rate card, under the Kwacha table it restates.
 */
export function CurrencyConverter({
  amounts,
  className,
}: {
  amounts: { label: string; zmw: number }[];
  className?: string;
}) {
  const { convert, code, choose, codes } = useFx();

  if (codes.length === 0) return null;

  return (
    <div className={cn("rounded-md bg-stone-40 p-6 ring-1 ring-navy/10", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="label-caps text-charcoal-80">Roughly, in your currency</p>
        <label className="flex items-center gap-3">
          <span className="sr-only">Currency</span>
          <Select
            value={code}
            onChange={(e) => choose(e.target.value as CurrencyCode)}
            className="w-auto"
            aria-label="Show prices in"
          >
            {codes.map((c) => (
              <option key={c} value={c}>
                {c} · {CURRENCIES[c]}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <dl className="mt-6 divide-y divide-navy/10 border-t border-navy/10">
        {amounts.map((item) => {
          const converted = convert(item.zmw);
          return (
            <div
              key={item.label}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4"
            >
              <dt className="text-body text-charcoal">{item.label}</dt>
              <dd className="text-body text-navy">
                {converted === null ? "—" : `≈ ${formatIn(code, converted)}`}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 max-w-measure text-caption text-charcoal-80">
        A guide only, converted at today&rsquo;s rate. You book and pay in Kwacha, and the Kwacha
        figure above it is the one that is charged.
      </p>
    </div>
  );
}

/**
 * The one-line version, for a total that already has its own Kwacha figure
 * beside it. The picker is the line itself, so it costs no extra space.
 */
export function CurrencyNote({ zmw, className }: { zmw: number; className?: string }) {
  const { convert, code, choose, codes } = useFx();
  const converted = convert(zmw);

  if (codes.length === 0 || converted === null) return null;

  return (
    <p className={cn("flex flex-wrap items-center justify-end gap-2 text-caption text-charcoal-80", className)}>
      <span>≈ {formatIn(code, converted)}</span>
      <label>
        <span className="sr-only">Show this in another currency</span>
        <select
          value={code}
          onChange={(e) => choose(e.target.value as CurrencyCode)}
          className="min-h-[44px] rounded-sm border border-navy/20 bg-white px-2 text-caption text-charcoal hover:border-navy/40 focus:border-navy"
        >
          {codes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <span className="w-full text-right">Charged in Kwacha</span>
    </p>
  );
}
