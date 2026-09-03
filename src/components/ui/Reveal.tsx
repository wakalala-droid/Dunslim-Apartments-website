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
 * most of the time it was on screen (measured on the live site) and which
 * left blocks that had scrolled clean past the viewport still reporting
 * opacity 0. Both read to a guest as a site that will not keep up.
 *
 * Now: the element is plain, visible markup. A small observer script adds
 * `js-motion` to the document only once it is certain it is running, which is
 * what allows the CSS to hide anything at all and adds `is-in` when the block
 * reaches the viewport, which plays a half-second entrance ONCE. It finishes
 * and stays finished. Scroll speed is not part of the equation.
 *
 * Two shapes:
 *   rise:  text and cards lift a little into place
 *   image: a photograph fades. Never a scale: scaling a photograph makes the
 *           compositor resample it every frame and it is felt on a mid-range
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

/**
 * A group whose children arrive one after another off a SINGLE trigger.
 *
 * The plain `Reveal` observes each block separately, so a row of items animates
 * as each one personally crosses into view. That is right for a long page of
 * independent blocks and wrong for a set that reads as one thing: the items
 * fire raggedly, in an order set by the viewport rather than by the content.
 *
 * Here the container is observed and the children carry their own delay, so the
 * sequence is deliberate and always runs in written order.
 *
 * `late` holds the trigger until the group is properly on screen rather than
 * firing on its first pixel. Use it where something should be read before the
 * group answers it: a section heading that poses a question, with the answers
 * beside it. The observer script gives these a stricter threshold and both its
 * sweep and its guard know to leave them alone while they are legitimately
 * waiting, so a deliberate pause is never mistaken for a stuck reveal.
 */
export function RevealGroup({
  children,
  className,
  as = "ul",
  late = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "ul" | "ol" | "div";
  /** Wait until the group is well into view before starting the sequence. */
  late?: boolean;
}) {
  const Tag = as;
  return (
    <Tag className={cn("reveal reveal-stagger", className)} data-reveal-late={late ? "" : undefined}>
      {children}
    </Tag>
  );
}

/**
 * One child of a RevealGroup. `index` sets its place in the sequence.
 *
 * `lead` is the beat before the first item moves, which is what stops the
 * sequence starting the instant the group is judged to be in view.
 */
export function RevealItem({
  children,
  className,
  index = 0,
  as = "li",
  lead = 220,
  step = 100,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
  as?: "li" | "div";
  /** Milliseconds before the first item moves. */
  lead?: number;
  /** Milliseconds between one item and the next. Below ~40 a stagger stops reading. */
  step?: number;
}) {
  const Tag = as;
  return (
    <Tag className={cn("reveal-item", className)} style={{ animationDelay: `${lead + index * step}ms` }}>
      {children}
    </Tag>
  );
}
