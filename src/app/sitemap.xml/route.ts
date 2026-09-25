import { residences, grounds } from "@/lib/content";
import { photos } from "@/lib/photos";
import { site } from "@/lib/site";

/**
 * sitemap.xml, WITH THE PHOTOGRAPHS.
 *
 * This replaced app/sitemap.ts on 25 September 2026, the day indexing was
 * switched on. Next.js 14's built-in sitemap cannot list images, and the
 * photographs are the best thing this site has: all 86 of the owner's frames
 * plus the grounds. On the pages themselves they are served through the image
 * optimiser at /_next/image?url=..., an address Google does not treat as the
 * photograph's own, so each page here names its photographs at their real
 * addresses under /photos. That is what gets them into Google Images.
 *
 * Built from content.ts, so a fourth residence or a new photograph appears here
 * the moment it is added. /book and /pay are left out: they are forms and both
 * carry noindex.
 *
 * NO <lastmod>. The old sitemap stamped every page with the time of the build,
 * so each deploy told Google that every page had just changed. Google learns
 * to ignore a lastmod that is always "now", and an absent one says nothing
 * false.
 */
export const dynamic = "force-static";

/** A photograph's absolute address, or nothing if the manifest lacks it. */
const photoUrl = (id: string) => {
  const p = photos[id];
  return p ? `${site.url}${p.src}` : null;
};

const cleanList = (ids: (string | undefined)[]) =>
  Array.from(new Set(ids.filter((id): id is string => Boolean(id))))
    .map(photoUrl)
    .filter((u): u is string => Boolean(u));

type Entry = { path: string; images?: string[] };

function entries(): Entry[] {
  return [
    {
      path: "/",
      images: cleanList([
        "r1-living-4", // the homepage cover
        ...residences.map((r) => r.photos[0]?.id),
        "grounds-front",
        "grounds-pool-1",
        "r1-bath-5",
        "r2-living-2",
      ]),
    },
    { path: "/residences", images: cleanList(residences.map((r) => r.photos[0]?.id)) },
    { path: "/rates", images: cleanList(["r1-kitchen-1"]) },
    { path: "/long-stays", images: cleanList(["r2-kitchen-1"]) },
    { path: "/location" },
    { path: "/extra-services" },
    { path: "/terms" },
    ...residences.map((r) => ({
      path: `/residences/${r.slug}`,
      // The front door, every room, then the outside and the pool, which is
      // the order the page shows them in.
      images: cleanList([r.hero, ...r.photos.map((p) => p.id), ...grounds.map((g) => g.id)]),
    })),
  ];
}

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const body = entries()
    .map(({ path, images = [] }) => {
      const loc = path === "/" ? site.url : `${site.url}${path}`;
      const imgs = images
        .map((u) => `<image:image><image:loc>${escape(u)}</image:loc></image:image>`)
        .join("");
      return `<url><loc>${escape(loc)}</loc>${imgs}</url>`;
    })
    .join("\n");

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ` +
    `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${body}\n</urlset>\n`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
