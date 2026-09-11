"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import { CURRENCIES, findCurrency, flagSrc, type Currency } from "@/lib/currencies";

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
 *
 * THE PICKER IS NOT A NATIVE SELECT ANY MORE. It carries a flag per currency
 * and a search field, because forty-odd options in a native dropdown is a list
 * nobody scrolls. It is a combobox: the field is the input, the list is the
 * listbox, arrow keys move, Enter chooses, Escape closes and hands focus back.
 */

type Fx = { rates: Record<string, number>; updated: string | null };

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
  const [code, setCode] = useState("USD");

  useEffect(() => {
    let alive = true;

    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved && findCurrency(saved)) setCode(saved);
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

  const choose = (next: string) => {
    setCode(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not remembering it is survivable. Not converting is not.
    }
  };

  /** Only the currencies the feed actually returned a rate for. */
  const available = useMemo(
    () => (fx ? CURRENCIES.filter((c) => typeof fx.rates[c.code] === "number") : []),
    [fx],
  );

  const rate = fx?.rates?.[code];

  return {
    /** Null until the live rate is in, and null forever if it never arrives. */
    convert: (zmw: number) => (typeof rate === "number" ? zmw * rate : null),
    code,
    choose,
    available,
  };
}

/** A converted amount, rounded to the whole unit. Nobody needs the cents here. */
function formatIn(code: string, amount: number) {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    // A currency Intl does not know still gets its number and its code.
    return `${Math.round(amount).toLocaleString("en-GB")} ${code}`;
  }
}

/* -------------------------------------------------------------------------
   The flag
   ------------------------------------------------------------------------- */

function Flag({ country, className }: { country: string; className?: string }) {
  return (
    /* A 1KB static SVG flag. next/image cannot optimise an SVG and would add
       a request through the image endpoint for nothing. */
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={flagSrc(country)}
      alt=""
      width={24}
      height={16}
      loading="lazy"
      className={cn("h-4 w-6 shrink-0 rounded-[2px] object-cover ring-1 ring-navy/15", className)}
    />
  );
}

/* -------------------------------------------------------------------------
   The picker
   ------------------------------------------------------------------------- */

function CurrencyPicker({
  code,
  choose,
  available,
  compact,
  className,
}: {
  code: string;
  choose: (code: string) => void;
  available: Currency[];
  /** The checkout version, which sits on one line beside a figure. */
  compact?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const wrap = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const current = findCurrency(code);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return available;
    return available.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  }, [available, query]);

  // Groups are only useful on the unfiltered list. Searching, the matches are
  // the answer and a heading over each one is noise.
  const groups = useMemo(() => {
    if (query.trim()) return [{ label: "", items: matches }];
    return [
      { label: "Most used", items: matches.filter((c) => c.popular) },
      { label: "All currencies", items: matches.filter((c) => !c.popular) },
    ].filter((g) => g.items.length > 0);
  }, [matches, query]);

  const flat = groups.flatMap((g) => g.items);

  // Close on a click anywhere else, and on Escape from anywhere inside.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  // Keep the highlighted row in view as the arrows walk the list.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const commit = (next: string) => {
    choose(next);
    setOpen(false);
    setQuery("");
    buttonRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (flat.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + flat.length) % flat.length);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const picked = flat[active];
      if (picked) commit(picked.code);
    }
  };

  let index = -1;

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Currency: ${current ? `${current.code}, ${current.name}` : code}. Change it.`}
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
          setActive(Math.max(0, available.findIndex((c) => c.code === code)));
        }}
        className={cn(
          "inline-flex min-h-[44px] items-center gap-2 rounded-sm border border-navy/20 bg-white",
          "transition-colors duration-micro hover:border-navy/40 focus:border-navy focus:outline-none",
          compact ? "px-3 text-caption text-charcoal" : "px-4 text-body text-charcoal",
        )}
      >
        {current ? <Flag country={current.country} /> : null}
        <span className="tabular-nums">{code}</span>
        <ChevronDown size={16} strokeWidth={1.5} aria-hidden className="text-charcoal-60" />
      </button>

      {open ? (
        <div
          onKeyDown={onKeyDown}
          className={cn(
            "absolute right-0 z-30 mt-2 w-[310px] max-w-[86vw] overflow-hidden rounded-md",
            "border border-navy/15 bg-white shadow-3",
          )}
        >
          <div className="flex items-center gap-2 border-b border-navy/10 px-4">
            <Search size={16} strokeWidth={1.5} aria-hidden className="shrink-0 text-charcoal-60" />
            <input
              autoFocus
              type="text"
              role="combobox"
              aria-expanded
              aria-controls={listId}
              aria-activedescendant={flat[active] ? `${listId}-${flat[active].code}` : undefined}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              placeholder="Search currencies"
              className="min-h-[44px] w-full bg-transparent text-body text-charcoal placeholder:text-charcoal-60 focus:outline-none"
            />
          </div>

          <ul ref={listRef} id={listId} role="listbox" className="max-h-[320px] overflow-y-auto py-1">
            {flat.length === 0 ? (
              <li className="px-4 py-4 text-caption text-charcoal-80">
                Nothing matches that.
              </li>
            ) : null}

            {groups.map((group) => (
              <li key={group.label || "matches"}>
                {group.label ? (
                  <p className="label-caps px-4 pb-1 pt-3 text-charcoal-60">{group.label}</p>
                ) : null}
                <ul>
                  {group.items.map((c) => {
                    index += 1;
                    const i = index;
                    const selected = c.code === code;
                    return (
                      <li
                        key={c.code}
                        id={`${listId}-${c.code}`}
                        data-index={i}
                        role="option"
                        aria-selected={selected}
                        onClick={() => commit(c.code)}
                        onMouseEnter={() => setActive(i)}
                        className={cn(
                          "flex min-h-[44px] cursor-pointer items-center gap-3 px-4 py-2",
                          i === active ? "bg-stone-40" : "bg-white",
                        )}
                      >
                        <Flag country={c.country} />
                        <span className="flex-1 text-body text-charcoal">{c.name}</span>
                        <span className="text-caption tabular-nums text-charcoal-80">{c.code}</span>
                        {selected ? (
                          <Check size={16} strokeWidth={2} aria-hidden className="text-brass" />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------
   The two places it appears
   ------------------------------------------------------------------------- */

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
  const { convert, code, choose, available } = useFx();

  if (available.length === 0) return null;

  return (
    <div className={cn("rounded-md bg-stone-40 p-6 ring-1 ring-navy/10", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="label-caps text-charcoal-80">Roughly, in your currency</p>
        <CurrencyPicker code={code} choose={choose} available={available} />
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
 * beside it.
 */
export function CurrencyNote({ zmw, className }: { zmw: number; className?: string }) {
  const { convert, code, choose, available } = useFx();
  const converted = convert(zmw);

  if (available.length === 0 || converted === null) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-3", className)}>
      <p className="text-caption text-charcoal-80">
        ≈ {formatIn(code, converted)}
        <span className="ml-2 text-charcoal-60">charged in Kwacha</span>
      </p>
      <CurrencyPicker code={code} choose={choose} available={available} compact />
    </div>
  );
}
