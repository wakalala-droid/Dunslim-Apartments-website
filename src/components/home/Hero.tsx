/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Figure } from "@/components/ui/Figure";
import { Container } from "@/components/ui/Layout";
import { DUR, EASE_OUT, STAGGER, heroTimeline } from "@/lib/motion";
import { brandAsset } from "@/lib/site";

/**
 * THE HOMEPAGE HERO
 * ---------------------------------------------------------------------------
 * Built to the composition of the brand guidelines cover (Volume One, p.1),
 * which is the most considered piece of Dunslim art direction that exists:
 *
 *   · a Deep Navy ground
 *   · the twelve-column brand grid left faintly visible
 *   · the mark offset to the left, vertically centred, given room
 *   · the type block ranged right against it
 *   · hairline rules top and bottom carrying letterspaced caps meta
 *
 * The photograph sits underneath all of it. The mark over the image is the
 * monogram only, at 40 per cent — the "frosted etch" density the guidelines
 * specify for glass (p.12). The full lockup is never set on a photograph; it
 * stays on the solid header bar above, per the same page.
 *
 * Everything animates from one orchestration parent, so the composition builds
 * as a single unhurried movement: rules, then etch, then the type.
 */
export default function Hero({
  eyebrow,
  headline,
  intro,
  metaLeft,
  metaRight,
  footNote,
  children,
}: {
  eyebrow: string;
  headline: string;
  intro: string;
  /** Top rule, left. The cover carries the place here. */
  metaLeft: string;
  /** Top rule, right, in brass. The cover carries the volume marker here. */
  metaRight: string;
  /** Bottom rule. The cover carries the fixed brand line here. */
  footNote: string;
  /** The search card. Rendered below the band, animated as the last beat. */
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const words = headline.split(" ");
  const t = heroTimeline(words.length);

  const fade = (delay: number, duration = 0.4): Variants => ({
    hidden: { opacity: 0 },
    shown: { opacity: 1, transition: { duration, delay: reduce ? delay * 0.4 : delay } },
  });

  const photo: Variants = reduce
    ? fade(t.image)
    : {
        hidden: { opacity: 0, scale: 1.06 },
        shown: {
          opacity: 1,
          scale: 1,
          transition: { duration: DUR.image, ease: EASE_OUT, delay: t.image },
        },
      };

  /** A hairline that draws itself along the grid rather than fading in. */
  const rule = (delay: number): Variants =>
    reduce
      ? fade(delay)
      : {
          hidden: { scaleX: 0 },
          shown: {
            scaleX: 1,
            transition: { duration: DUR.rule, ease: EASE_OUT, delay },
          },
        };

  const block = (delay: number): Variants =>
    reduce
      ? fade(delay)
      : {
          hidden: { opacity: 0, y: 10 },
          shown: {
            opacity: 1,
            y: 0,
            transition: { duration: DUR.entrance, ease: EASE_OUT, delay },
          },
        };

  /**
   * The wrapper only fades and settles. The etch density itself lives on the
   * image in CSS, so it can differ by breakpoint without a JS media query —
   * which would either mismatch on hydration or flash at the wrong value.
   */
  const etch: Variants = reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.4 } } }
    : {
        hidden: { opacity: 0, scale: 1.04 },
        shown: {
          opacity: 1,
          scale: 1,
          transition: { duration: DUR.image * 0.8, ease: EASE_OUT, delay: t.etch },
        },
      };

  const wordGroup: Variants = {
    hidden: {},
    shown: { transition: { delayChildren: t.words, staggerChildren: STAGGER.word } },
  };

  const word: Variants = {
    hidden: { y: "108%" },
    shown: { y: 0, transition: { duration: DUR.word, ease: EASE_OUT } },
  };

  return (
    <motion.div initial="hidden" animate="shown">
      <section className="on-navy under-header relative isolate overflow-hidden bg-navy">
        {/*
          Layer order matters here: photograph, then the etch, then the scrim
          over both. Putting the scrim above the etch is what makes it read as
          etched INTO the image rather than laid on top of it — and, more
          practically, it is what keeps white display type legible where it
          crosses the mark. An etch above the scrim puts white on white.
        */}
        <motion.div variants={photo} className="absolute inset-0 -z-30">
          <Figure
            name="hero"
            alt="A Dunslim living room in the late afternoon"
            cover
            priority
            sizes="100vw"
            className="absolute inset-0"
          />
        </motion.div>

        {/*
          A Deep Navy field washing in from the left.

          This is what the mark stands on. A white etch at 40 per cent has
          nothing to hold against a photograph of a cream wall in afternoon
          light — it disappears, which is exactly what happened. Giving it a
          darkened ground is also the treatment the brand book prescribes when
          the identity has to meet photography at all (p.12): the mark sits on
          a Deep Navy field laid over the image, never on the image itself.

          It fades out well before the type column, so it costs the photograph
          nothing on the right where the headline lives.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-r from-navy/90 from-0% via-navy/55 via-30% to-transparent to-55%"
        />


        {/*
          The etched monogram — the cover's anchor, offset left and vertically
          centred. Monogram only, never the full lockup, and never above the
          40 per cent "frosted etch" density the guidelines set for glass.

          It runs off the left edge deliberately. At this size the mark is
          architecture rather than a logo placement, which is the reading the
          cover invites: the identity as a built form, given room.

          On phones it holds the same position but is pulled further off the
          edge, so the counter of the D sits behind the type without competing
          with it.
        */}
        {/*
          The bottom scrim, over the photograph. It carries the intro paragraph
          where the type crosses the image, and on phones it does most of the
          work because the type spans the full width.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-t from-navy/92 via-navy/55 to-navy/25 md:from-navy/85 md:via-navy/30 md:to-navy/10"
        />

        {/*
          The etch sits ABOVE both washes, not beneath them — that was the bug.
          Underneath, the scrim flattened it into the wall behind it.

          It stays at the 40 per cent the guidelines set for a frosted etch,
          and lower on phones, where the headline crosses the mark rather than
          sitting beside it in its own column.
        */}
        <motion.div
          aria-hidden
          variants={etch}
          className="pointer-events-none absolute inset-y-0 -z-10 left-0 flex items-center"
        >
          <img
            src={brandAsset("dunslim-monogram-white.svg")}
            alt=""
            /*
              Sat closer to the edge and carried heavier than the guidelines'
              40 per cent glass density. At 40, offset a quarter of its width
              off the frame, all that showed was a sliver of the stem — a
              smudge rather than a mark. The whole D and its fan now read.

              Phones stay lighter: there the headline runs across the mark
              instead of sitting beside it in its own column.
            */
            className="h-auto w-[min(72vw,320px)] -translate-x-[14%] opacity-[0.34] md:w-[min(40vw,520px)] md:-translate-x-[6%] md:opacity-[0.55]"
          />
        </motion.div>

        {/* The brand grid, left faintly visible exactly as the cover does. */}
        <motion.div
          aria-hidden
          variants={fade(t.frame, 1.2)}
          className="pointer-events-none absolute inset-0 -z-10 hidden md:block"
        >
          <Container wide className="h-full">
            <div className="grid h-full grid-cols-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-l border-white/[0.07]" />
              ))}
            </div>
          </Container>
        </motion.div>

        <Container
          wide
          className="flex min-h-[560px] flex-col justify-between py-8 md:min-h-[82vh]"
        >
          {/* ---- top rule row ---- */}
          <div>
            <motion.span
              aria-hidden
              variants={rule(t.frame)}
              className="block h-px origin-left bg-white/20"
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4">
              <motion.p variants={block(t.frame + 0.1)} className="label-caps text-white/75">
                {metaLeft}
              </motion.p>
              <motion.p variants={block(t.frame + 0.18)} className="label-caps text-brass-40">
                {metaRight}
              </motion.p>
            </div>
          </div>

          {/* ---- the type block, ranged right against the mark ---- */}
          <div className="flex justify-end py-16 md:py-12">
            <div className="w-full md:w-[62%] lg:w-[58%] md:text-right">
              <motion.p variants={block(t.eyebrow)} className="label-caps text-brass-40">
                {eyebrow}
              </motion.p>

              <motion.span
                aria-hidden
                variants={rule(t.eyebrow + 0.08)}
                className="mt-4 block h-px origin-left bg-white/25 md:origin-right"
              />

              <h1 className="mt-8 text-display font-extralight text-white">
                {/*
                  The full string is announced once; the animated words are
                  hidden from assistive tech, or a screen reader reads the
                  headline one disjointed word at a time.
                */}
                <span className="sr-only">{headline}</span>

                {reduce ? (
                  <motion.span aria-hidden variants={fade(t.words)}>{headline}</motion.span>
                ) : (
                  <motion.span aria-hidden variants={wordGroup} className="inline">
                    {words.map((w, i) => (
                      <Fragment key={`${w}-${i}`}>
                        <span
                          /*
                            The box clips the word; the padding keeps descenders
                            from being shaved, and the equal negative margin
                            stops that padding adding height to the heading.
                          */
                          className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom"
                        >
                          <motion.span data-reveal-word variants={word} className="inline-block">
                            {w}
                          </motion.span>
                        </span>
                        {/*
                          The space lives BETWEEN the clipping boxes, never
                          inside one. Trailing whitespace inside an inline-block
                          is trimmed, which ran every word together —
                          "Aroomthatworks aswellasitlooks."
                        */}
                        {i < words.length - 1 ? " " : null}
                      </Fragment>
                    ))}
                  </motion.span>
                )}
              </h1>

              {/*
                Ranged left even inside a right-ranged block. The cover can rag
                a three-line caption right; a full sentence at 21px read by an
                older guest should not have a moving left edge to find.
              */}
              <motion.p
                variants={block(t.intro)}
                className="mt-8 max-w-[46ch] text-lead text-white/85 md:ml-auto md:text-left"
              >
                {intro}
              </motion.p>
            </div>
          </div>

          {/*
            ---- bottom rule row ----
            Desktop only. The cover is a landscape format with room to carry a
            footer line; on a phone it lands in the few pixels where the search
            card already overlaps, and the brand line it carries is repeated in
            the site footer a screen below.
          */}
          <div className="hidden md:block">
            <motion.span
              aria-hidden
              variants={rule(t.frame + 0.12)}
              className="block h-px origin-left bg-white/20"
            />
            <motion.p
              variants={block(t.frame + 0.26)}
              className="label-caps pt-4 text-white/75"
            >
              {footNote}
            </motion.p>
          </div>
        </Container>
      </section>

      {/* The search card rides the seam between the photograph and the page. */}
      {children ? (
        <motion.div variants={block(t.search)} className="relative z-10 -mt-8 md:-mt-12">
          {children}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
