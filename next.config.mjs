/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    /*
      AVIF first, WebP as the fallback.

      Measured on the hero photograph at 1920px: JPEG 249KB, WebP 232KB — a
      7% saving, which is close to nothing. AVIF is typically 30–50% under
      JPEG on photographic content, which is the difference that matters on a
      phone on a Lusaka connection.

      Browsers that cannot decode AVIF are served WebP, and anything older
      still gets JPEG. Nobody is left without an image.
    */
    formats: ["image/avif", "image/webp"],
  },

  /*
    Caching for the static brand and photo assets.

    NOT `immutable`. These filenames are stable — dunslim-monogram-white.svg
    keeps its name when the artwork inside it is corrected — and an immutable
    asset is never re-requested, so a browser that cached a bad version keeps
    serving it for the full year no matter how many times the page is reloaded.
    That is exactly what happened here.

    `must-revalidate` means the browser still caches, but checks the ETag
    before reusing. A corrected file reaches everyone on their next visit.
  */
  /*
    The three apartments were named Residence One / Two / Three while the owner
    confirmed the real ones. They are now Mandela, Mulima and Kaunda, and the
    addresses moved with them. Anything already sent to someone — a WhatsApp
    message, an email signature — still points at the old address, so those keep
    working instead of landing on "not found".

    308, not 302: the move is permanent, and a permanent redirect is the one that
    passes on any credit the old address had earned.
  */
  async redirects() {
    return [
      { source: "/residences/residence-one", destination: "/residences/mandela", permanent: true },
      { source: "/residences/residence-two", destination: "/residences/mulima", permanent: true },
      { source: "/residences/residence-three", destination: "/residences/kaunda", permanent: true },
    ];
  },

  async headers() {
    const revalidate = [
      { key: "Cache-Control", value: "public, max-age=0, s-maxage=86400, must-revalidate" },
    ];
    return [
      { source: "/brand/:file*", headers: revalidate },
      { source: "/photos/:file*", headers: revalidate },
    ];
  },
};

export default nextConfig;
