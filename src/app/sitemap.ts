import type { MetadataRoute } from "next";
import { residences } from "@/lib/content";
import { site } from "@/lib/site";

/**
 * sitemap.xml
 *
 * Generated from the residence list, so a fourth unit appears here the moment
 * it is added to content.ts. A hand-maintained sitemap goes stale the first
 * time someone forgets and a stale sitemap is worse than none.
 *
 * /book is deliberately absent. It is a form, not a destination and there is
 * nothing there for a search result to land on.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: "weekly", priority: 1, lastModified: now },
    { url: `${site.url}/residences`, changeFrequency: "weekly", priority: 0.9, lastModified: now },
    { url: `${site.url}/rates`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
    { url: `${site.url}/location`, changeFrequency: "monthly", priority: 0.7, lastModified: now },
    { url: `${site.url}/long-stays`, changeFrequency: "monthly", priority: 0.8, lastModified: now },
  ];

  const units: MetadataRoute.Sitemap = residences.map((r) => ({
    url: `${site.url}/residences/${r.slug}`,
    changeFrequency: "weekly",
    priority: 0.9,
    lastModified: now,
  }));

  return [...pages, ...units];
}
