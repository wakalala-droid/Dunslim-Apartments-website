import Image from "next/image";
import { photo } from "@/lib/photos";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * A photograph.
 *
 * Uses next/image so every photo is served at the size the layout actually
 * needs, in a modern format, with the real dimensions declared up front (no
 * layout shift) and a tiny inline blur while it loads. On a phone on a weak
 * Lusaka connection that blur-up is the difference between a page that feels
 * considered and one that flashes empty boxes.
 *
 * `zoom` adds a slow scale on hover. It is deliberately the only decorative
 * motion on the site: it responds to the pointer, so it reports state rather
 * than performing. It is disabled under prefers-reduced-motion by the global
 * rule in globals.css.
 */
export function Figure({
  name,
  alt,
  ratio,
  className,
  imgClassName,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  zoom = false,
  scrim = "none",
  cover = false,
  reveal = false,
}: {
  /** Key from the photo manifest, e.g. "r2-living". */
  name: string;
  alt: string;
  /** CSS aspect-ratio. Defaults to the file's own. */
  ratio?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
  zoom?: boolean;
  /** A navy wash, for when type has to sit over the image. */
  scrim?: "none" | "soft" | "strong" | "bottom";
  /** Fill the parent instead of holding an aspect ratio. For full-bleed bands. */
  cover?: boolean;
  /** Settle into place on entering view. Never use on a hero, which is already visible. */
  reveal?: boolean;
}) {
  const p = photo(name);

  // An unknown key must not crash a page or render an invisible hole.
  if (!p) {
    return (
      <div
        className={cn("flex items-center justify-center bg-stone", className)}
        style={cover ? undefined : { aspectRatio: ratio ?? "4 / 3" }}
        role="img"
        aria-label={alt}
      >
        <span className="label-caps text-charcoal-60">Photograph to come</span>
      </div>
    );
  }

  const frame = (
    <div
      className={cn("relative overflow-hidden bg-stone", !reveal && className)}
      style={cover ? undefined : { aspectRatio: ratio ?? `${p.w} / ${p.h}` }}
    >
      <Image
        src={p.src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        placeholder="blur"
        blurDataURL={p.blur}
        className={cn(
          "object-cover",
          zoom && "transition-transform duration-[600ms] ease-entrance group-hover:scale-[1.04]",
          imgClassName,
        )}
      />

      {scrim !== "none" ? (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0",
            scrim === "soft" && "bg-navy/30",
            scrim === "strong" && "bg-navy/60",
            scrim === "bottom" &&
              "bg-gradient-to-t from-navy/85 via-navy/25 to-transparent",
          )}
        />
      ) : null}
    </div>
  );

  if (!reveal) return frame;

  // The rounding lives on the wrapper too, so the scale animation never
  // reveals square corners behind a rounded frame.
  return (
    <Reveal variant="image" className={cn("overflow-hidden", className)}>
      {frame}
    </Reveal>
  );
}
