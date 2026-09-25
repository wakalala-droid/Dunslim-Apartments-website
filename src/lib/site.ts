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
   * Whether search engines may index the site.
   *
   * SWITCHED ON 25 September 2026, on the owner's instruction, for PRODUCTION
   * ONLY: NEXT_PUBLIC_ALLOW_INDEXING=true is set on the Vercel project's
   * Production environment and deliberately absent from Preview, so a preview
   * deployment can never be indexed as a copy of the real site.
   *
   * It was held off until the real photographs, rates and phone numbers were
   * in. They are: every photograph on the site is the owner's own and the
   * default share card was remade from them the same day (it had still been a
   * stock living room). It is read at build time, so changing it in Vercel
   * only takes effect on the next deployment.
   */
  allowIndexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",

  /**
   * The Google Search Console verification code, the `content` value of the
   * meta tag Search Console offers under "HTML tag". Set it as
   * NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in Vercel and redeploy; the tag then
   * appears in every page head. Empty means no tag is printed.
   */
  googleVerification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",

  /**
   * Cache-buster for the share cards in /public/og-default.jpg and /public/og/.
   *
   * WhatsApp, Facebook and the rest keep a link's preview picture by its
   * address, so a remade card at the same address can keep showing the old
   * one for weeks. Bump this whenever scripts/build-og-image.py is rerun.
   */
  ogVersion: "2",

  /**
   * Cache-buster for the brand artwork.
   *
   * The brand files keep stable names on purpose, because the guidelines refer to
   * them by name, so a corrected file arrives at the same URL as the broken
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

/**
 * A share card's absolute address. `slug` picks a residence's own card; none
 * gives the default, built from the homepage cover.
 */
export const ogImage = (slug?: string) =>
  `${site.url}${slug ? `/og/${slug}.jpg` : "/og-default.jpg"}?v=${site.ogVersion}`;

/**
 * The default share card, ready for a page's `openGraph.images`.
 *
 * EVERY PAGE THAT SETS ITS OWN `openGraph` MUST PASS THIS. Next.js replaces a
 * parent's openGraph object with the child's rather than merging them, so a
 * page that sets its own share title and forgets `images` shares with no
 * picture at all. Six pages did exactly that until 25 September 2026.
 */
export const defaultShareImages = [
  {
    url: ogImage(),
    width: 1200,
    height: 630,
    alt: "The living room in Mandela, with the Dunslim Apartments mark",
  },
];
