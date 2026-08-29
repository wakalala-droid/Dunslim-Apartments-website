import { Fragment } from "react";
import { cn } from "@/lib/cn";

/**
 * A heading that rises into view a word at a time.
 *
 * Each word sits in its own overflow-hidden box and starts below it, so the
 * line appears to be uncovered rather than to fade in. It is the one piece of
 * expressive motion on the site, and it stays confined to display headings —
 * body copy that animates is body copy you cannot read.
 *
 * VISIBLE BY DEFAULT, and one observer for the whole heading rather than one
 * per word. The previous version gave every word its own scroll-driven
 * timeline: 21 of them on the homepage inside a total of 59, each one a
 * separate compositor animation, and all of them capable of stranding the
 * heading mid-rise. The heading now carries a single `is-in`, and the words
 * stagger off their own animation-delay once it lands.
 */
export function RevealText({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Seconds to wait before the first word. Kept for call-site compatibility. */
  delay?: number;
  /** Accepted and ignored — the entrance only ever runs on entry. */
  once?: boolean;
}) {
  const words = text.split(" ");

  return (
    <Tag className={cn("reveal reveal-words", className)}>
      {/*
        Announced once as a whole. Without this a screen reader reads the
        heading one disjointed word at a time.
      */}
      <span className="sr-only">{text}</span>

      <span aria-hidden className="inline">
        {words.map((w, i) => (
          <Fragment key={`${w}-${i}`}>
            <span className="inline-block -mb-[0.14em] overflow-hidden pb-[0.14em] align-bottom">
              <span
                className="reveal-word"
                style={{ animationDelay: `${delay * 1000 + i * 45}ms` }}
              >
                {w}
              </span>
            </span>
            {/*
              The space lives BETWEEN the clipping boxes. Trailing whitespace
              inside an inline-block is trimmed, which runs every word together.
            */}
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

/** The short brass rule that draws itself in above a heading. */
export function RevealRule({ className }: { className?: string; delay?: number }) {
  return (
    <span
      aria-hidden
      className={cn("reveal reveal-rule block h-px w-12 origin-left bg-brass", className)}
    />
  );
}
