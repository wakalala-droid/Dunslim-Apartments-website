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
 * NO JAVASCRIPT. This used framer-motion, which server-rendered every word
 * translated out of its box and left the heading blank until React hydrated.
 * On a section heading below the fold that is a hole in the page waiting on a
 * script. It is now a scroll-driven CSS timeline: compositor-only, no observer,
 * and visible by default where the browser does not support it.
 *
 * The global prefers-reduced-motion rule collapses the duration, which lands
 * the heading in its end state without movement.
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
  /** Accepted and ignored — a scroll timeline only ever runs on entry. */
  once?: boolean;
}) {
  const words = text.split(" ");

  return (
    <Tag className={className}>
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
                className="a-inview-word"
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
      className={cn("a-inview-rule block h-px w-12 origin-left bg-brass", className)}
    />
  );
}
