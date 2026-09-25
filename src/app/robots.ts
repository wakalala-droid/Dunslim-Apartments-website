import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * robots.txt
 *
 * Mirrors the same switch the page metadata uses (`site.allowIndexing`), so
 * the door and the page head always agree. On in production since 25
 * September 2026; a preview deployment still turns every crawler away.
 */
export default function robots(): MetadataRoute.Robots {
  if (!site.allowIndexing) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /*
          /api is not pages at all. /book used to be listed here too and is
          left out on purpose: it and /pay carry noindex in their own heads,
          and Google can only read that tag on a page it is allowed to fetch.
          Blocked here, a linked /book could still turn up in results as a
          bare address "blocked by robots.txt".
        */
        disallow: ["/api/"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
