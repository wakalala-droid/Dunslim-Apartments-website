"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { isoToday, isoPlusDays } from "@/lib/format";
import { cn } from "@/lib/cn";
import { maxGuests } from "@/lib/content";

/**
 * The date search.
 *
 * Every apartment brand worth studying (Limehome, Numa, Locke, Blueground,
 * Sonder) puts this above the fold and makes it the first thing a visitor can
 * do. There is no "where" field: three residences, one address.
 *
 * It is a real <form>, so Enter submits and the whole thing works by keyboard.
 */
export default function SearchBar({
  tone = "light",
  layout = "stacked",
  className,
}: {
  tone?: "light" | "onNavy";
  /**
   * `stacked` fits a narrow column (the hero rail). `inline` spreads onto one
   * row and is only safe in a container at least ~700px wide, otherwise the
   * row overflows the page, which responsive_design_system.md forbids outright.
   */
  layout?: "stacked" | "inline";
  className?: string;
}) {
  const router = useRouter();
  const today = isoToday();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [guests, setGuests] = useState(1);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!from || !to) {
      setError("Choose an arrival and a departure date.");
      return;
    }
    if (to <= from) {
      setError("Departure must be after arrival.");
      return;
    }
    setError("");
    router.push(`/book?from=${from}&to=${to}&guests=${guests}`);
  };

  const onNavy = tone === "onNavy";
  const labelCls = cn("label-caps mb-2 block", onNavy ? "text-brass-60" : "text-charcoal-60");
  const controlCls = cn(
    "w-full min-h-[44px] rounded-sm border px-3 text-body transition-colors duration-micro",
    onNavy
      ? "border-white/20 bg-navy text-white [color-scheme:dark] hover:border-white/40 focus:border-brass"
      : "border-navy/20 bg-white text-charcoal hover:border-navy/40 focus:border-navy",
  );

  return (
    <form
      onSubmit={submit}
      className={cn(
        "rounded-md p-4 md:p-6",
        onNavy ? "bg-navy ring-1 ring-white/15" : "bg-white shadow-2 ring-1 ring-navy/10",
        className,
      )}
      aria-label="Check availability"
    >
      <div
        className={cn(
          "grid gap-4 sm:grid-cols-2",
          layout === "inline" && "lg:grid-cols-[1fr_1fr_auto_auto] lg:items-end",
        )}
      >
        <div>
          <label htmlFor="search-from" className={labelCls}>
            Arrival
          </label>
          <input
            id="search-from"
            type="date"
            min={today}
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              if (to && to <= e.target.value) setTo(isoPlusDays(e.target.value, 1));
            }}
            className={controlCls}
          />
        </div>

        <div>
          <label htmlFor="search-to" className={labelCls}>
            Departure
          </label>
          <input
            id="search-to"
            type="date"
            min={from ? isoPlusDays(from, 1) : isoPlusDays(today, 1)}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={controlCls}
          />
        </div>

        <div className={cn(layout === "inline" && "lg:w-[132px]")}>
          <label htmlFor="search-guests" className={labelCls}>
            Guests
          </label>
          <select
            id="search-guests"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className={controlCls}
          >
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          variant={onNavy ? "onNavy" : "primary"}
          size="lg"
          className={cn("w-full", layout === "inline" ? "sm:col-span-2 lg:w-auto" : "sm:col-span-2")}
        >
          Check availability
        </Button>
      </div>

      {error ? (
        <p role="alert" className={cn("mt-4 text-caption font-medium", onNavy ? "text-brass" : "text-danger")}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
