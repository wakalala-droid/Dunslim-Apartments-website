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
} as const;
