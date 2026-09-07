"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Figure } from "@/components/ui/Figure";
import { cn } from "@/lib/cn";

/**
 * A COVERFLOW GALLERY
 * ---------------------------------------------------------------------------
 * The centre photograph sits square on, its neighbours turn away into the
 * distance. A serviced apartment is bought with the eyes and a flat grid of
 * four photographs asks the guest to do the work of imagining the room. This
 * puts one room in front of them at a time and makes the rest visibly
 * available.
 *
 * Rewritten from a stock component rather than adopted, for reasons worth
 * recording so the stock version is not pasted back in later:
 *
 *   - It carried its own brand in inline styles: near-black ground, gold text,
 *     system-ui, 900-weight caps, glowing gradient pills. Every value was
 *     hardcoded, so it could never follow this site's tokens. Colour and type
 *     here come from the Tailwind config, which comes from the brand book.
 *   - Its type ran down to 0.72rem and its description was italic. The standing
 *     rule on this site is that an eighty-year-old must be able to read it:
 *     18px body, 15px floor, body copy never italic and never light.
 *   - It painted a full-viewport photograph at blur(32px) scale(1.15) behind
 *     the stage and re-rastered it on every slide, plus backdrop-filter on both
 *     arrows. That is the expensive kind of compositing, on a site whose whole
 *     reported problem was that it felt slow on a Lusaka phone. The ground here
 *     is flat navy with a static vignette: no per-frame work.
 *   - Its position maths assumed five or more slides. With four, the branch for
 *     offset === 2 was reached before the one for offset === total - 2, so the
 *     left-hand neighbour was thrown to the far right. Each residence has three
 *     or four gallery photographs, so it would have broken on sight. The signed
 *     offset below is correct for any number of slides.
 *   - It hung a keydown listener on window, which stole the arrow keys from the
 *     entire page, the booking form included. Keys are handled here only while
 *     focus is inside the carousel.
 */

export type CoverFlowSlide = {
  /** Key into the photo manifest. */
  name: string;
  alt: string;
  caption?: string;
};

export function CoverFlow({
  slides,
  label,
  autoplay = true,
  autoplayDelay = 6000,
  className,
}: {
  slides: CoverFlowSlide[];
  /** Names the carousel for assistive technology. */
  label: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
}) {
  const total = slides.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(0);
  const touchY = useRef(0);
  const liveId = useId();

  /*
    THE LIVE REGION ONLY SPEAKS WHEN THE GUEST ASKED IT TO.

    It used to render straight from `current`, so autoplay changed it every six
    seconds and a screen reader announced "Photograph 2 of 3. Kitchen" over and
    over for as long as the page was open. Measured: the text changed twice in
    fourteen seconds with nobody touching anything. An announcement nobody asked
    for, on a loop, is worse than no announcement at all.

    Autoplay now moves the photographs silently, which is right: it is
    decoration. A press of an arrow, a dot, or an arrow key sets the flag below
    and that change is spoken.
  */
  const askedForIt = useRef(false);
  const [spoken, setSpoken] = useState("");

  /*
    `go(i)`, a jump straight to a numbered slide, lived here for the row of
    dots. The dots are gone (see the note beside the controls) and nothing else
    ever jumped: the arrows, the keys and a swipe all step by one. Removed
    rather than left unused.
  */
  const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

  /** Wraps a move the guest made, so it is the only kind that gets announced. */
  const byHand = useCallback((move: () => void) => {
    askedForIt.current = true;
    move();
  }, []);

  /*
    Autoplay stops for a pointer, for keyboard focus and for anyone who has
    asked for reduced motion, for whom it never starts at all. A gallery that
    keeps moving under a reader is the same discourtesy as one that moves too
    fast to read.
  */
  useEffect(() => {
    if (!autoplay || paused || total <= 1) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(next, autoplayDelay);
    return () => clearInterval(t);
  }, [autoplay, autoplayDelay, paused, next, total]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      byHand(prev);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      byHand(next);
    }
  };

  const activeCaption = slides[current]?.caption ?? slides[current]?.alt ?? "";

  useEffect(() => {
    if (!askedForIt.current) return;
    askedForIt.current = false;
    setSpoken(`Photograph ${current + 1} of ${total}. ${activeCaption}`);
  }, [current, total, activeCaption]);

  if (total === 0) return null;

  return (
    <div
      className={cn("cf", className)}
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
        touchY.current = e.touches[0].clientY;
      }}
      onTouchEnd={(e) => {
        /*
          A swipe has to be sideways to count. This measured the horizontal
          distance only, so a guest scrolling the page down past the gallery
          with any sideways drift in their thumb changed the photograph under
          their finger. Requiring the horizontal movement to beat the vertical
          leaves a plain scroll alone.
        */
        const dx = e.changedTouches[0].clientX - touchX.current;
        const dy = e.changedTouches[0].clientY - touchY.current;
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
          byHand(dx < 0 ? next : prev);
        }
      }}
    >
      <div className="cf-stage">
        {slides.map((s, i) => {
          /*
            A signed offset, wrapped the shorter way round the loop, so the
            order reads the same whichever direction the guest arrived from.
            Anything more than two places out is parked off-stage rather than
            stacked in the middle, where it would show through the gaps.
          */
          let off = (i - current + total) % total;
          if (off > total / 2) off -= total;
          const depth = Math.min(Math.abs(off), 3);
          const isCentre = off === 0;

          return (
            <figure
              key={s.name}
              className={cn("cf-card", isCentre && "cf-card-centre")}
              data-depth={depth}
              style={{ "--cf-dir": Math.sign(off) } as React.CSSProperties}
            >
              <Figure
                name={s.name}
                alt={isCentre ? s.alt : ""}
                cover
                className="absolute inset-0"
                sizes="(max-width: 768px) 80vw, 360px"
              />
              {s.caption ? <figcaption className="cf-caption">{s.caption}</figcaption> : null}
            </figure>
          );
        })}
      </div>

      {/* What changed, for anyone not looking at the screen. */}
      <p id={liveId} className="sr-only" aria-live="polite">
        {spoken}
      </p>

      {total > 1 ? (
        <div className="cf-controls">
          <button
            type="button"
            onClick={() => byHand(prev)}
            className="cf-arrow"
            aria-controls={liveId}
            aria-label="Previous photograph"
          >
            <ChevronLeft size={18} strokeWidth={1.75} aria-hidden />
          </button>

          {/*
            A COUNT, NOT A ROW OF DOTS.

            There used to be one dot per photograph. That was reasonable when
            each apartment had four; with twenty-nine it became a strip of
            twenty-nine identical circles running the width of the page, which
            the owner rightly called out. Nobody aims at the nineteenth dot of
            twenty-nine, and on a phone they were 44px targets packed edge to
            edge, so a thumb reaching for one hit its neighbour.

            The count does the one job the dots actually did: it says where you
            are and how many there are. Tabular figures so the number does not
            jitter as it counts up.
          */}
          <p className="cf-count" aria-hidden>
            <span className="cf-count-now">{current + 1}</span>
            <span className="cf-count-sep">/</span>
            {total}
          </p>

          <button
            type="button"
            onClick={() => byHand(next)}
            className="cf-arrow"
            aria-controls={liveId}
            aria-label="Next photograph"
          >
            <ChevronRight size={18} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default CoverFlow;
