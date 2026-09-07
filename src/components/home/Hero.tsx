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
 * vertically centred, the type block ranged right against it and hairline
 * rules top and bottom carrying letterspaced caps meta.
 *
 * NO JAVASCRIPT. This was a client component driving framer-motion, which meant
 * every element was server-rendered at opacity:0 and stayed invisible until
 * React had hydrated and the animation library had booted. Measured on the live
 * site, that put first paint eight seconds after a 304ms server response. The
 * page sat blank for almost all of it.
 *
 * It is now a server component with CSS animations. The markup paints as soon
 * as it arrives, the entrance runs on the compositor and none of it depends on
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
            /*
              Mandela, looking across the dining table and through the living
              room to the front door. Referenced by its own gallery key rather
              than copied to a `hero.jpg`, so the file exists once.

              Deliberately not one of the three living rooms: those are the
              three cards a screen and a half below, and the photographer shot
              each of them from essentially one position, so any of them here
              turns up again looking like the same picture.
            */
            name="r1-dining-1"
            alt="Inside Mandela, the dining table with the living room beyond"
            cover
            priority
            sizes="100vw"
            className="a-drift absolute inset-0"
          />
        </div>

        {/*
          A soft Deep Navy vignette behind the mark. Not a panel but an ellipse
          centred on the monogram, so there is no seam and the room is
          otherwise untouched. It is also what lets a 40 per cent white mark
          read at all against a sunlit wall.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(ellipse_62%_78%_at_18%_50%,rgba(15,34,52,0.88)_0%,rgba(15,34,52,0.58)_45%,rgba(15,34,52,0)_80%)]"
        />

        {/*
          The bottom scrim, carrying the type where it crosses the image.

          THE BOTTOM STOP IS NOW FULLY OPAQUE, WHICH IS THE POINT.

          It used to end at 92 per cent navy and reach that only at the very last
          pixel, so the brand line sitting just above it was 13px of navy-40 on
          bare photograph. Measured on a phone, over the pale floor tiles in that
          part of the picture, the contrast ran at 1.38:1 with a worst point of
          1.01:1 against a 4.5:1 requirement. The one line of copy the brand
          guidelines say never to rewrite could not be read at all.

          The brand book's own answer is that the words go on a solid ground, not
          on a photograph (p.12), which is exactly what the header does. Holding
          `from-navy` at full opacity through the bottom sixteen per cent gives
          the line that solid ground without a seam, because it is still the same
          gradient fading out above it. On solid navy, navy-40 measures 6.5:1.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20 bg-gradient-to-t from-navy from-[16%] via-navy/55 via-[52%] to-navy/25 md:from-navy md:from-[11%] md:via-navy/30 md:via-[46%] md:to-navy/10"
        />

        {/*
          And a scrim at the top, for the same reason at the other end. The place
          and the street sit up there in navy-40 and brass-40 over whatever the
          photograph happens to be doing, which on the hero is a bright window.
        */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-20 h-[38%] bg-gradient-to-b from-navy via-navy/45 to-transparent"
        />

        {/*
          The monogram. Monogram only, because the full lockup already sits on the
          header bar directly above and naming the brand twice in one view
          reads as a template rather than art direction.

          White at 40 per cent is the frosted-etch density the guidelines set
          for glass (p.12). It only works at this scale. Earlier attempts had
          it small and pushed off the frame, so all that showed was a sliver of
          the stem; at this size it stops being a watermark and becomes the
          ground the type sits on.
        */}
        {/*
          HIDDEN BELOW md, DELIBERATELY.

          On a phone the mark and the headline are not side by side, they are
          stacked. Measured at 375 x 812: the mark occupied x -32 to 148 and y
          289 to 480, the headline x 24 to 351 and y 283 to 419, so the rays ran
          through all three lines of "A room that works as well as it looks" and
          32px of the mark was cut off the left edge of the screen. Two rules
          broken at once: no clear space around the lockup and the mark used as
          texture behind type.

          The note above is right that a small monogram pushed off the frame is
          worth nothing. The conclusion is the same either way: on a small screen
          it does not appear.
        */}
        <div
          aria-hidden
          className="a-etch pointer-events-none absolute inset-y-0 left-0 -z-10 hidden items-center md:flex"
          style={ms(BEAT.etch)}
        >
          <img
            src={brandAsset("dunslim-monogram-white.svg")}
            alt=""
            className="h-auto w-[min(32vw,390px)] -translate-x-[12%] opacity-40"
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

        {/*
          THE PHONE FOLD.

          Measured at 375 x 812, the search card started 736px down, so a guest
          arriving on a phone saw the word "Arrival" and nothing else of the one
          thing the page exists to let them do. The component's own notes argue
          that every operator worth studying puts it above the fold.

          Nothing was cut. The mobile numbers were simply generous: 128px of
          padding around the type block, a 21px intro running to five lines and a
          display size that was not being asked to hold a wide measure. Desktop
          is untouched at every breakpoint from md up.
        */}
        <Container wide className="flex min-h-[520px] flex-col justify-between py-7 md:min-h-[82vh] md:py-8">
          {/* ---- top rule row ---- */}
          <div>
            <span aria-hidden className="a-draw block h-px bg-white/20" style={ms(BEAT.frame)} />
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pt-4">
              {/*
                navy-20, not navy-40. Measured on the phone hero over the darkest
                part of the window in that strip, navy-40 came out at 3.27:1 and
                AA wants 4.5. The same colour is fine on the bottom rule because
                the scrim is fully opaque down there; up here it is not, so the
                text has to carry the difference itself. navy-20 measures 5.2:1
                on the same pixels.
              */}
              <p className="a-rise label-caps text-navy-20" style={ms(BEAT.frame + 60)}>
                {metaLeft}
              </p>
              <p className="a-rise label-caps text-brass-40" style={ms(BEAT.frame + 120)}>
                {metaRight}
              </p>
            </div>
          </div>

          {/* ---- the type block, ranged right against the mark ---- */}
          <div className="flex justify-end py-11 md:py-12">
            <div className="w-full md:w-[62%] md:text-right lg:w-[58%]">
              <p className="a-rise label-caps text-brass-40" style={ms(BEAT.eyebrow)}>
                {eyebrow}
              </p>

              <span
                aria-hidden
                className="a-draw mt-4 block h-px bg-white/25 md:origin-right"
                style={ms(BEAT.rule)}
              />

              <h1 className="mt-5 text-[2.375rem] leading-[1.05] tracking-[-0.03em] font-extralight text-white md:mt-8 md:text-display">
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
                        one, because trailing whitespace in an inline-block is trimmed,
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
                className="a-rise mt-5 max-w-[46ch] text-body text-white/90 md:ml-auto md:mt-8 md:text-lead md:text-white/85 md:text-left"
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
        <div className="a-rise relative z-10 -mt-14 md:-mt-12" style={ms(searchAt)}>
          {children}
        </div>
      ) : null}
    </>
  );
}
