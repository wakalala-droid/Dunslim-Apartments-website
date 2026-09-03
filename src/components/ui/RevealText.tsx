import { cn } from "@/lib/cn";

/**
 * A section heading that rises into view.
 *
 * This used to uncover itself a word at a time, each word in its own
 * overflow-hidden box, translating up from below it. It was the most
 * expressive motion on the site and it has been taken off the scrolled
 * headings, for a measured reason worth writing down.
 *
 * Animating a transform inside an `overflow: hidden` box does not merely
 * promote the element to a compositor layer, it forces Chromium to build a
 * render surface for the clip and it does that at the moment the animation
 * starts, which is to say mid-scroll. Measured on the homepage: 64 animatable
 * elements, up to 22 of them starting inside a single 900px viewport and 21 of
 * those were clipped word spans. The owner's report was scroll judder across
 * the whole site on desktop Chromium and that churn is on every page.
 *
 * The heading now rises as one block: one layer instead of eight and about
 * forty fewer DOM nodes per page. The words-uncovering effect is kept in the
 * homepage hero, where it runs once at load, above the fold and costs nothing
 * during scrolling, which is where it was always doing the most work anyway.
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
  /** Seconds to wait before the heading moves. */
  delay?: number;
}) {
  return (
    <Tag
      className={cn("reveal reveal-rise", className)}
      style={delay ? { animationDelay: `${delay * 1000}ms` } : undefined}
    >
      {text}
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
