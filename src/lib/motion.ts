/**
 * ONE MOTION LANGUAGE
 * ---------------------------------------------------------------------------
 * Every animation on the site reads from this file. Before it existed the hero
 * ran four separate clocks — a CSS keyframe on the photograph, three Framer
 * transitions on the text, and hardcoded delays that did not relate to when the
 * previous thing actually finished. That is what makes motion feel bolted on
 * rather than choreographed.
 *
 * motion_governance.md: entrances are ease-out, parallax is banned, and every
 * animation has a reduced-motion fallback that replaces movement with an
 * opacity change rather than the same movement made faster.
 */

/**
 * The house curve. A quintic ease-out: it leaves immediately, then spends most
 * of its time decelerating, which is what makes a movement read as settling
 * into place instead of stopping dead. Used for every entrance.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** For the rare thing that leaves the screen. Mirror of the above. */
export const EASE_IN = [0.64, 0, 0.78, 0] as const;

/**
 * Durations, in seconds. Named so a component never invents its own.
 *
 * Deliberately unhurried. This is a brand whose own guidelines say "the
 * identity reads as more valuable the more silence it is given" — motion obeys
 * the same idea, so entrances take their time rather than snapping.
 *
 * `micro` is the exception and stays fast: a hover or a press must answer
 * immediately or the control feels broken. Slow is for arrival, never response.
 */
export const DUR = {
  /** Hover, press, toggle — should feel instant. */
  micro: 0.16,
  /** Standard entrance for a block of content. */
  entrance: 1,
  /** A word rising inside its clipping box. */
  word: 1.15,
  /** A hairline drawing itself along the grid. */
  rule: 1.4,
  /** The hero photograph settling. Long enough to read as arrival, not a zoom. */
  image: 3.2,
} as const;

/** Gap between staggered siblings. Below ~40ms a stagger stops being legible. */
export const STAGGER = {
  word: 0.09,
  item: 0.1,
} as const;

/**
 * The hero's entrance, derived from the headline rather than guessed.
 *
 * The old version delayed the intro paragraph by a flat 0.42s, which happened
 * to look right for one particular headline. Change the wording and the
 * paragraph would appear halfway through the words. These beats are computed
 * from the actual word count, so the sequence holds whatever the copy says.
 */
export function heroTimeline(wordCount: number) {
  /** The framing rules draw first — the composition builds before the content. */
  const frame = 0.2;
  const eyebrow = 0.62;
  const words = 0.9;

  /**
   * Beats overlap rather than queue. Waiting for the headline to finish before
   * starting the paragraph makes a nine-word headline hold the search card back
   * by well over a second — and that card is the primary action on the page, so
   * a sequence that looks elegant would be costing bookings.
   *
   * The paragraph therefore begins while the last words are still settling, and
   * the whole entrance is capped so a longer headline can never push the search
   * card further down the clock.
   */
  const stagger = Math.max(0, wordCount - 1) * STAGGER.word;
  const intro = Math.min(words + stagger * 0.55, 1.8);

  return {
    image: 0,
    frame,
    /** The etched monogram surfaces slowly, like something under glass. */
    etch: frame + 0.25,
    eyebrow,
    words,
    intro,
    /** The search card is the payoff — last, but close behind. */
    search: Math.min(intro + 0.2, 2),
  };
}

/** Standard hidden/shown pair for a block that rises into place. */
export const riseVariants = (reduce: boolean, distance = 10) => ({
  hidden: reduce ? { opacity: 0 } : { opacity: 0, y: distance },
  shown: { opacity: 1, y: 0 },
});
