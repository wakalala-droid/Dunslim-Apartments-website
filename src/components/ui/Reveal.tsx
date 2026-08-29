import { cn } from "@/lib/cn";

/**
 * Entrance motion for anything that arrives on scroll.
 *
 * VISIBLE BY DEFAULT. This has now been got wrong twice in the same way, so
 * the rule the component is built around is worth stating plainly: nothing
 * here may leave content invisible if the mechanism that reveals it does not
 * run. First it was framer-motion's whileInView, which server-rendered every
 * wrapped element at opacity:0 and held it there until React hydrated. Then it
 * was a scroll-driven CSS timeline, which held a tall card at opacity 0.2 for
 * most of the time it was on screen — measured on the live site — and which
 * left blocks that had scrolled clean past the viewport still reporting
 * opacity 0. Both read to a guest as a site that will not keep up.
 *
 * Now: the element is plain, visible markup. A small observer script adds
 * `js-motion` to the document only once it is certain it is running, which is
 * what allows the CSS to hide anything at all, and adds `is-in` when the block
 * reaches the viewport, which plays a half-second entrance ONCE. It finishes
 * and stays finished. Scroll speed is not part of the equation.
 *
 * Two shapes:
 *   rise  — text and cards lift a little into place
 *   image — a photograph fades. Never a scale: scaling a photograph makes the
 *           compositor resample it every frame, and it is felt on a mid-range
 *           phone with several on a page.
 */
export function Reveal({
  children,
  className,
  as = "div",
  variant = "rise",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "figure";
  variant?: "rise" | "image";
  /**
   * Accepted and ignored. Stagger used to be a hand-set index; each block now
   * animates when it personally reaches the viewport, which staggers a row
   * naturally and stays right at any width.
   */
  delay?: number;
}) {
  const Tag = as;
  return (
    <Tag className={cn("reveal", variant === "image" ? "reveal-fade" : "reveal-rise", className)}>
      {children}
    </Tag>
  );
}
