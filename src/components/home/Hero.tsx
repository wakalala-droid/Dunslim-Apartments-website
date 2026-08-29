/* eslint-disable @next/next/no-img-element */
import { Fragment } from "react";
import { Figure } from "@/components/ui/Figure";
import { Container } from "@/components/ui/Layout";
import { brandAsset } from "@/lib/site";

/**
 * THE HOMEPAGE HERO
 * ---------------------------------------------------------------------------
 * Built to the composition of the brand guidelines cover (Volume One, p.1):
 * a Deep Navy ground, the brand grid faintly visible, the mark offset left and
 * vertically centred, the type block ranged right against it, and hairline
 * rules top and bottom carrying letterspaced caps meta.
 *
 * NO JAVASCRIPT. This was a client component driving framer-motion, which meant
 * every element was server-rendered at opacity:0 and stayed invisible until
 * React had hydrated and the animation library had booted. Measured on the live
 * site, that put first paint eight seconds after a 304ms server response — the
 * page sat blank for almost all of it.
 *
 * It is now a server component with CSS animations. The markup paints as soon
 * as it arrives, the entrance runs on the compositor, and none of it depends on
 * JavaScript loading, or loading successfully.
 */

/** The entrance, in milliseconds. One place, so the sequence stays legible. */
const BEAT = {
  photo: 0,
  frame: 80,
  etch: 200,
  eyebrow: 260,
  rule: 320,
  words: 400,
  /** Gap between words. Below ~40ms a stagger stops reading as one movement. */
  wordStep: 45,
  introAfterWords: 140,
} as const;

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
  /** Top rule, right. */
  metaRight: string;
  /** Bottom rule. The cover carries the fixed brand line here. */
  footNote: string;
  /** The search card, rendered below the band as the last beat. */
  children?: React.ReactNode;
}) {
  const words = headline.split(" ");
  const introAt = BEAT.words + words.length * BEAT.wordStep + BEAT.introAfterWords;
  const searchAt = introAt + 120;
  const ms = (n: number) => ({ animationDelay: `${n}ms` });

  return (
    <>
      <section className="on-navy under-header relative isolate overflow-hidden bg-navy">
        {/* The photograph. */}
        <div className="a-fade absolute inset-0 -z-30" style={ms(BEAT.photo)}>
          <Figure
            name="hero"
            alt="A Dunslim living room in the late afternoon"
            cover
            priority
            sizes="100vw"
            className="a-drift absolute inset-0"
          />
        </div>

        {/*
          A soft Deep Navy vignette behind the mark. Not a panel — an ellipse
          centred on the monogram, so there is no seam and the room is
          otherwise untouched. It is also what lets a 40 per cent white mark
          read at all against a sunlit wall.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_62%_78%_at_18%_50%,rgba(15,34,52,0.88)_0%,rgba(15,34,52,0.58)_45%,rgba(15,34,52,0)_80%)]"
        />

        {/* The bottom scrim, carrying the type where it crosses the image. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-t from-navy/92 via-navy/55 to-navy/25 md:from-navy/85 md:via-navy/30 md:to-navy/10"
        />

        {/*
          The monogram. Monogram only — the full lockup already sits on the
          header bar directly above, and naming the brand twice in one view
          reads as a template rather than art direction.

          White at 40 per cent is the frosted-etch density the guidelines set
          for glass (p.12). It only works at this scale. Earlier attempts had
          it small and pushed off the frame, so all that showed was a sliver of
          the stem; at this size it stops being a watermark and becomes the
          ground the type sits on.
        */}
        <div
          aria-hidden
          className="a-etch pointer-events-none absolute inset-y-0 left-0 -z-10 flex items-center"
          style={ms(BEAT.etch)}
        >
          <img
            src={brandAsset("dunslim-monogram-white.svg")}
            alt=""
            className="h-auto w-[min(48vw,210px)] -translate-x-[18%] opacity-40 md:w-[min(32vw,390px)] md:-translate-x-[12%]"
          />
        </div>

        {/* The brand grid, left faintly visible exactly as the cover does. */}
        <div
          aria-hidden
          className="a-fade pointer-events-none absolute inset-0 -z-10 hidden md:block"
          style={ms(BEAT.frame)}
        >
          <Container wide className="h-full">
            <div className="grid h-full grid-cols-12">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-l border-white/[0.07]" />
              ))}
            </div>
          </Container>
        </div>

        <Container wide className="flex min-h-[560px] flex-col justify-between py-8 md:min-h-[82vh]">
          {/* ---- top rule row ---- */}
          <div>
            <span aria-hidden className="a-draw block h-px bg-white/20" style={ms(BEAT.frame)} />
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4">
              <p className="a-rise label-caps text-navy-40" style={ms(BEAT.frame + 60)}>
                {metaLeft}
              </p>
              <p className="a-rise label-caps text-brass-40" style={ms(BEAT.frame + 120)}>
                {metaRight}
              </p>
            </div>
          </div>

          {/* ---- the type block, ranged right against the mark ---- */}
          <div className="flex justify-end py-16 md:py-12">
            <div className="w-full md:w-[62%] md:text-right lg:w-[58%]">
              <p className="a-rise label-caps text-brass-40" style={ms(BEAT.eyebrow)}>
                {eyebrow}
              </p>

              <span
                aria-hidden
                className="a-draw mt-4 block h-px bg-white/25 md:origin-right"
                style={ms(BEAT.rule)}
              />

              <h1 className="mt-8 text-display font-extralight text-white">
                {/*
                  The full string is announced once; the animated words are
                  hidden from assistive tech, or a screen reader reads the
                  headline one disjointed word at a time.
                */}
                <span className="sr-only">{headline}</span>

                <span aria-hidden className="inline">
                  {words.map((w, i) => (
                    <Fragment key={`${w}-${i}`}>
                      {/*
                        The box clips the word; the padding keeps descenders
                        from being shaved and the equal negative margin stops
                        that padding adding height to the heading.
                      */}
                      <span className="inline-block -mb-[0.14em] overflow-hidden pb-[0.14em] align-bottom">
                        <span className="a-word" style={ms(BEAT.words + i * BEAT.wordStep)}>
                          {w}
                        </span>
                      </span>
                      {/*
                        The space lives BETWEEN the clipping boxes, never inside
                        one — trailing whitespace in an inline-block is trimmed,
                        which ran every word together.
                      */}
                      {i < words.length - 1 ? " " : null}
                    </Fragment>
                  ))}
                </span>
              </h1>

              {/*
                Ranged left even inside a right-ranged block. The cover can rag
                a three-line caption right; a full sentence at 21px read by an
                older guest should not have a moving left edge to find.
              */}
              <p
                className="a-rise mt-8 max-w-[46ch] text-lead text-white/85 md:ml-auto md:text-left"
                style={ms(introAt)}
              >
                {intro}
              </p>
            </div>
          </div>

          {/* ---- bottom rule row ---- */}
          <div>
            <span
              aria-hidden
              className="a-draw block h-px bg-white/20"
              style={ms(BEAT.frame + 100)}
            />
            <p className="a-rise label-caps pt-4 text-navy-40" style={ms(BEAT.frame + 180)}>
              {footNote}
            </p>
          </div>
        </Container>
      </section>

      {/* The search card rides the seam between the photograph and the page. */}
      {children ? (
        <div className="a-rise relative z-10 -mt-8 md:-mt-12" style={ms(searchAt)}>
          {children}
        </div>
      ) : null}
    </>
  );
}
