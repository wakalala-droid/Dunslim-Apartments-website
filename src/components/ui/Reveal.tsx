"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { DUR, EASE_OUT, STAGGER } from "@/lib/motion";

/**
 * Entrance motion for anything that arrives on scroll.
 *
 * Reads its curve and durations from lib/motion so it moves in the same
 * language as the hero. Parallax is banned outright, and so is any decorative
 * loop — this only ever runs once, when a thing first comes into view.
 *
 * `useReducedMotion` swaps movement for an opacity-only change rather than
 * dropping the animation and losing the cue entirely.
 *
 * Two shapes:
 *   rise  — text and cards lift a little into place
 *   image — a photograph settles from very slightly enlarged, which reads as
 *           the image coming to rest rather than sliding in from somewhere
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  variant = "rise",
}: {
  children: React.ReactNode;
  /** Index in a stagger group, not a raw duration. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "figure";
  variant?: "rise" | "image";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];
  const isImage = variant === "image";

  const hidden = reduce
    ? { opacity: 0 }
    : isImage
      ? { opacity: 0, scale: 1.03 }
      : { opacity: 0, y: 10 };

  const shown = reduce ? { opacity: 1 } : isImage ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };

  return (
    <Tag
      className={cn(className)}
      initial={hidden}
      whileInView={shown}
      // A generous margin means the movement finishes before the element is
      // properly on screen, so the reader meets settled type rather than
      // watching it arrive.
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: reduce ? 0.3 : isImage ? DUR.image * 0.55 : DUR.entrance,
        ease: EASE_OUT,
        delay: reduce ? 0 : Math.min(delay * STAGGER.item, 0.28),
      }}
    >
      {children}
    </Tag>
  );
}
