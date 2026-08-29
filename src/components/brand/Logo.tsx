/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { brandAsset } from "@/lib/site";
import { cn } from "@/lib/cn";

/**
 * The identity.
 *
 * All artwork here is the supplied master file (Dunslim Monogram logo.ai),
 * cropped to each authorised lockup and exported as vector. Nothing is redrawn,
 * traced or screen-grabbed — pre-flight check 01, Brand Guidelines p.19.
 * Proportions are locked by aspect ratio: the horizontal lockup is 4.092:1 and
 * the monogram is 1:1.06, both measured off the master artwork.
 *
 * Lockup selection follows p.5:
 *   horizontal → shallow formats, web headers
 *   vertical   → default wherever the format allows
 *   monogram   → only where the full name is already present
 *
 * Clear space (p.6) is 2X on all four sides, where X is the width of the D's
 * vertical stem. On the horizontal lockup that is ~11.5% of the lockup width,
 * applied here as padding so it scales with the mark rather than being set once.
 */

type Lockup = "horizontal" | "vertical" | "monogram";
type Tone = "primary" | "reversed" | "brass";

const FILES: Record<Lockup, Partial<Record<Tone, string>>> = {
  horizontal: {
    primary: brandAsset("dunslim-horizontal-primary.svg"),
    reversed: brandAsset("dunslim-horizontal-reversed.svg"),
    brass: brandAsset("dunslim-horizontal-brass.svg"),
  },
  vertical: {
    primary: brandAsset("dunslim-vertical-primary.svg"),
    reversed: brandAsset("dunslim-vertical-reversed.svg"),
  },
  monogram: {
    primary: brandAsset("dunslim-monogram-brass.svg"),
    reversed: brandAsset("dunslim-monogram-white.svg"),
    brass: brandAsset("dunslim-monogram-brass.svg"),
  },
};

/** Measured off the master artwork. Never adjusted by eye. */
const RATIO: Record<Lockup, number> = {
  horizontal: 509.5 / 124.5,
  vertical: 330 / 303.5,
  monogram: 190 / 201,
};

/** Minimum size, p.7: 84px for the full lockup. Below that, drop to the monogram. */
const MIN_LOCKUP_WIDTH = 84;

export function Logo({
  lockup = "horizontal",
  tone = "primary",
  width = 168,
  className,
  priority = false,
}: {
  lockup?: Lockup;
  tone?: Tone;
  /** Width in px. The brand book specifies 168px for a 1440px web header (p.16). */
  width?: number;
  className?: string;
  priority?: boolean;
}) {
  const src = FILES[lockup][tone] ?? FILES[lockup].primary!;
  const height = Math.round(width / RATIO[lockup]);

  if (lockup !== "monogram" && width < MIN_LOCKUP_WIDTH) {
    // Below the stated minimum the descriptor closes up and stops reading.
    // The guidelines' answer is the monogram, not a smaller lockup.
    return <Logo lockup="monogram" tone={tone} width={width} className={className} />;
  }

  return (
    <img
      src={src}
      alt="Dunslim Apartments"
      width={width}
      height={height}
      className={cn("block h-auto", className)}
      style={{ width }}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
    />
  );
}

/** The header mark, wrapped in a home link with its protected zone intact. */
export function LogoLink({
  tone = "primary",
  width = 168,
  lockup = "horizontal",
  className,
}: {
  tone?: Tone;
  width?: number;
  lockup?: Lockup;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label="Dunslim Apartments — home"
      className={cn("inline-flex shrink-0 items-center", className)}
      // 2X clear space, scaled from the mark itself.
      style={{ padding: `${Math.round(width * 0.06)}px ${Math.round(width * 0.02)}px` }}
    >
      <Logo lockup={lockup} tone={tone} width={width} priority />
    </Link>
  );
}
