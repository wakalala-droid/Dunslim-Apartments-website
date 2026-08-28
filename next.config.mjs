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
    Long-lived caching for the brand marks. They are content-addressed by name
    and only change when the brand custodian issues new artwork, at which point
    the filename changes too.
  */
  async headers() {
    return [
      {
        source: "/brand/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/photos/:file*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
