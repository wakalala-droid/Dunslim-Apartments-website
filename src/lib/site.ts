/**
 * Site-level settings that more than one file needs to agree on.
 *
 * The canonical URL and the indexing switch were previously written out in
 * two places, which is exactly how a site ends up with a sitemap pointing at
 * one host and canonical tags pointing at another.
 */
export const site = {
  /** The canonical address. The apex redirects here. */
  url: "https://www.dunslim-apartments.com",

  /**
   * Search engines are locked out until this is deliberately switched on.
   *
   * Set NEXT_PUBLIC_ALLOW_INDEXING=true in the Vercel project once the real
   * photography, rates and contact details are in — not before. Right now the
   * site states a phone number that does not work and shows stock interiors
   * that are not these apartments; letting Google index that attaches false
   * details to the business name in a way that is hard to undo.
   */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",

  /**
   * Cache-buster for the brand artwork.
   *
   * The brand files keep stable names on purpose — the guidelines refer to
   * them by name — so a corrected file arrives at the same URL as the broken
   * one it replaces. Anything that already cached the old bytes would keep
   * serving them.
   *
   * Bump this whenever a file in /public/brand is regenerated. It is appended
   * to every brand asset URL, which makes the corrected artwork a different
   * URL and forces a fresh fetch.
   */
  brandVersion: "4",
} as const;

/** A brand asset URL with the cache-busting version attached. */
export const brandAsset = (file: string) => `/brand/${file}?v=${site.brandVersion}`;
