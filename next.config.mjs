/**
 * Headers the site sends with every response and why each one is here.
 *
 * There were none. Not one of X-Frame-Options, X-Content-Type-Options,
 * Referrer-Policy, Permissions-Policy or a Content-Security-Policy, on a site
 * that collects a guest's name, email and phone number and will shortly carry
 * payment instructions. Every response also announced `X-Powered-By: Next.js`,
 * which tells an attacker which framework's known issues to try first.
 *
 * The Content-Security-Policy below is deliberately not a strict one. A strict
 * script policy needs per-request nonces and this site is almost entirely
 * static pages served from the edge, where a nonce cannot be generated without
 * giving up that caching. What it does instead is take the four directives that
 * cost nothing and are worth the most:
 *
 *   frame-ancestors  nobody can put this site in an iframe, which is what makes
 *                    a clickjacked booking form possible in the first place
 *   base-uri         no injected <base> tag can re-point every relative URL on
 *                    the page at somebody else's server
 *   form-action      a form on this site can only ever post back to this site
 *   object-src       no plugins, ever
 *
 * `frame-ancestors` in the CSP and `X-Frame-Options` say the same thing twice,
 * on purpose: the header is what older browsers understand.
 */
const SECURITY_HEADERS = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // Next's own bootstrap and the JSON-LD blocks are inline scripts.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  { key: "X-Frame-Options", value: "DENY" },
  // Stops a browser second-guessing a Content-Type and running a file as script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  /*
    The address of the page a guest came from is sent to Google Maps, to
    OpenStreetMap and to wa.me. `strict-origin-when-cross-origin` sends the full
    address within the site and only the bare origin to anyone else, so a
    /book address carrying a guest's dates never leaves the site.
  */
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  /*
    Nothing on this site uses a camera, a microphone or a location, so nothing
    embedded in it should be able to ask for one.
  */
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // Two years, subdomains included. Vercel serves HTTPS only in any case.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Stop telling every visitor which framework this is.
  poweredByHeader: false,

  images: {
    /*
      AVIF first, WebP as the fallback.

      Measured on the hero photograph at 1920px: JPEG 249KB, WebP 232KB, a
      7% saving, which is close to nothing. AVIF is typically 30 to 50% under
      JPEG on photographic content, which is the difference that matters on a
      phone on a Lusaka connection.

      Browsers that cannot decode AVIF are served WebP and anything older
      still gets JPEG. Nobody is left without an image.
    */
    formats: ["image/avif", "image/webp"],
  },

  /*
    Caching for the static brand and photo assets.

    NOT `immutable`. These filenames are stable. dunslim-monogram-white.svg
    keeps its name when the artwork inside it is corrected, so an immutable
    asset is never re-requested, so a browser that cached a bad version keeps
    serving it for the full year no matter how many times the page is reloaded.
    That is exactly what happened here.

    `must-revalidate` means the browser still caches, but checks the ETag
    before reusing. A corrected file reaches everyone on their next visit.
  */
  /*
    The three apartments were named Residence One / Two / Three while the owner
    confirmed the real ones. They are now Mandela, Mulima and Kaunda and the
    addresses moved with them. Anything already sent to someone (a WhatsApp
    message, an email signature) still points at the old address, so those keep
    working instead of landing on "not found".

    308, not 302: the move is permanent and a permanent redirect is the one that
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
      // Everything, including the API routes and the images.
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/brand/:file*", headers: revalidate },
      { source: "/photos/:file*", headers: revalidate },
      { source: "/map/:file*", headers: revalidate },
    ];
  },
};

export default nextConfig;
