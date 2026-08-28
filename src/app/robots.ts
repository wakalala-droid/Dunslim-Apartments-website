import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * robots.txt
 *
 * Mirrors the same switch the page metadata uses. While the site is still
 * carrying placeholder photography and contact details, crawlers are turned
 * away at the door as well as in the page head — two independent signals, so
 * a mistake in one does not quietly let the other through.
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
        // The booking flow is a form, not a page anyone should land on cold.
        disallow: ["/book"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
