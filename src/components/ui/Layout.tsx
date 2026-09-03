import { Reveal } from "@/components/ui/Reveal";
import { RevealText } from "@/components/ui/RevealText";
import { cn } from "@/lib/cn";

/**
 * Layout primitives. component_system.md: all UI derives from system primitives,
 * and no screen invents its own container or section rhythm.
 *
 * The brand grid (p.15) is twelve columns with a 24px gutter on web and a 40px
 * page padding at 1440px. Section rhythm uses the Elite Builder spacing scale.
 */

export function Container({
  className,
  children,
  wide = false,
}: {
  className?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-6 sm:px-8 lg:px-12",
        wide ? "max-w-shell" : "max-w-[1180px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type Ground = "white" | "stone" | "navy";

const grounds: Record<Ground, string> = {
  white: "bg-white text-charcoal",
  stone: "bg-stone text-charcoal",
  navy: "on-navy bg-navy text-white",
};

export function Section({
  ground = "white",
  className,
  children,
  id,
  tight = false,
}: {
  ground?: Ground;
  className?: string;
  children: React.ReactNode;
  id?: string;
  tight?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(grounds[ground], tight ? "py-16" : "py-16 md:py-24", className)}
    >
      {children}
    </section>
  );
}

/**
 * The letterspaced caps label. Brand hierarchy p.13.
 *
 * The brand reserves Soft Brass for "the mark, rules and single moments of
 * emphasis" and states plainly that it is never a body text colour (p.11).
 * Measurement agrees: brass on white is 3.17:1 and on Warm Stone 2.45:1, both
 * below the 4.5:1 that 12px text requires.
 *
 * So the brass appears as a rule and the label itself is set in Charcoal. The
 * identity colour is still present, doing the job the brand book gives it.
 * On Deep Navy, brass-60 measures 7.93:1 and is used directly.
 */
export function Eyebrow({
  children,
  tone = "brass",
  className,
  rule = true,
}: {
  children: React.ReactNode;
  tone?: "brass" | "muted" | "onNavy";
  className?: string;
  /** The brass hairline that carries the identity colour. */
  rule?: boolean;
}) {
  const onNavy = tone === "onNavy";

  return (
    <p
      className={cn(
        "label-caps flex items-center gap-3",
        onNavy ? "text-brass-60" : tone === "muted" ? "text-charcoal-60" : "text-charcoal-80",
        className,
      )}
    >
      {/*
        The brass hairline draws itself in from the left when the block it sits
        in arrives. It inherits that from the nearest `.reveal` ancestor rather
        than carrying its own observer, so a label that is never revealed simply
        shows a static rule.
      */}
      {rule ? <span aria-hidden className="draw-rule h-px w-6 shrink-0 bg-brass" /> : null}
      {children}
    </p>
  );
}

/**
 * Section heading. Pairs the caps label with a display line and holds the
 * measure rule (56 to 72 characters) on any supporting paragraph.
 */
export function SectionHead({
  eyebrow,
  title,
  intro,
  onNavy = false,
  className,
  as = "h2",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  onNavy?: boolean;
  className?: string;
  /**
   * Every page needs exactly one h1 and headings must descend without skipping
   * (accessibility_system.md). A page whose first section head IS the page title
   * passes `as="h1"` rather than leaving the document without an h1.
   */
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("max-w-measure", className)}>
      {eyebrow ? (
        <Reveal>
          <Eyebrow tone={onNavy ? "onNavy" : "brass"}>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}

      {/* The heading uncovers itself a word at a time. */}
      <RevealText
        as={as}
        text={title}
        delay={0.06}
        className={cn(
          "mt-4 text-h2 font-extralight md:text-h1",
          onNavy ? "text-white" : "text-navy",
        )}
      />

      {intro ? (
        <Reveal>
          <p
            className={cn("mt-6 text-lead", onNavy ? "text-navy-20" : "text-charcoal-80")}
          >
            {intro}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
