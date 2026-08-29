import { cn } from "@/lib/cn";

/**
 * Entrance motion for anything that arrives on scroll.
 *
 * NO JAVASCRIPT. This used framer-motion's `whileInView`, which meant every
 * element it wrapped was server-rendered at opacity:0 — about thirty-six of
 * them across the site — and stayed invisible until React had hydrated. Below
 * the fold that is invisible content waiting on a script, and if the script
 * ever failed it never appeared at all.
 *
 * It is now a server component using a scroll-driven CSS timeline. The work
 * happens on the compositor rather than the main thread, there is no observer
 * and no library, and the content is visible by default: browsers without
 * scroll-timeline support (Firefox, at time of writing) simply render it
 * static, which is the right fallback for a reveal.
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
   * Accepted and ignored. Stagger used to be a hand-set index; with a
   * scroll-driven timeline each element animates on its own position in the
   * viewport, which staggers a row naturally and stays right at any width.
   */
  delay?: number;
}) {
  const Tag = as;
  return (
    <Tag className={cn(variant === "image" ? "a-inview-fade" : "a-inview", className)}>
      {children}
    </Tag>
  );
}
