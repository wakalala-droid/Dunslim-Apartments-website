"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";

/**
 * A heading that rises into view a word at a time.
 *
 * Each word sits in its own overflow-hidden box and starts fully below it, so
 * the line appears to be uncovered rather than to fade in. It is the one piece
 * of expressive motion on the site, and it is confined to display headings —
 * body copy that animates is body copy you cannot read.
 *
 * Under prefers-reduced-motion the whole thing collapses to a single opacity
 * change, because a reader who asked for less movement should get less
 * movement, not the same movement made faster.
 */
export function RevealText({
  text,
  className,
  as: Tag = "h2",
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  /** Seconds to wait before the first word. */
  delay?: number;
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once, margin: "-80px" }}
        transition={{ duration: 0.3, delay }}
      >
        <Tag className={className}>{text}</Tag>
      </motion.div>
    );
  }

  return (
    <Tag className={className}>
      {/*
        The full string is announced once, and the animated words are hidden
        from assistive tech — otherwise a screen reader reads the heading one
        disjointed word at a time.
      */}
      <span className="sr-only">{text}</span>

      <motion.span
        aria-hidden
        initial="hidden"
        whileInView="shown"
        viewport={{ once, margin: "-80px" }}
        transition={{ staggerChildren: STAGGER.word, delayChildren: delay }}
        className="inline"
      >
        {words.map((word, i) => (
          <Fragment key={`${word}-${i}`}>
            <span
              // The box clips the word; the padding keeps descenders from being
              // shaved, and the equal negative margin stops that padding from
              // adding height to the heading.
              className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
            >
              <motion.span
                data-reveal-word
                className="inline-block"
                variants={{
                  hidden: { y: "108%" },
                  shown: { y: 0 },
                }}
                transition={{ duration: DUR.word, ease: EASE_OUT }}
              >
                {word}
              </motion.span>
            </span>
            {/*
              The space sits BETWEEN the clipping boxes, never inside one.
              Trailing whitespace inside an inline-block is trimmed, which ran
              every word together.
            */}
            {i < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </motion.span>
    </Tag>
  );
}

/**
 * A brass hairline that draws itself in from the left as it enters view.
 * Used where the brand already calls for a rule, so the motion is the rule
 * arriving rather than an effect added on top of it.
 */
export function RevealRule({ className, delay = 0 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();

  return (
    <motion.span
      aria-hidden
      className={cn("block h-px w-12 origin-left bg-brass", className)}
      initial={reduce ? { opacity: 0 } : { scaleX: 0 }}
      whileInView={reduce ? { opacity: 1 } : { scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: DUR.entrance, ease: EASE_OUT, delay }}
    />
  );
}
