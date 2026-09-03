"use client";

/**
 * THE LAST RESORT.
 *
 * `error.tsx` sits inside the root layout, so it keeps the header, the footer
 * and the site's fonts and stylesheet. This one replaces the layout itself, for
 * the rarer case where the failure is in the layout and therefore has to render
 * its own `html` and `body` and cannot rely on a single class from globals.css
 * being available.
 *
 * So every style here is inline and every colour is a literal: Deep Navy
 * #0F2234, Warm Stone #E7E2D8, Soft Brass #B28A4A. It is the only file in the
 * project allowed to hardcode them, because it is the only file that has to work
 * when nothing else has loaded.
 *
 * The phone numbers are written out for the same reason. If this page renders,
 * reaching a person is the only thing left that can save the booking.
 */
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en-ZM">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#0F2234",
          color: "#FFFFFF",
          fontFamily: "Inter, 'Helvetica Neue', Helvetica, Arial, sans-serif",
          display: "flex",
          alignItems: "center",
        }}
      >
        <main style={{ maxWidth: 620, padding: "48px 24px", margin: "0 auto" }}>
          <div style={{ width: 40, height: 2, background: "#B28A4A" }} />
          <p
            style={{
              margin: "20px 0 0",
              fontSize: 13,
              lineHeight: "18px",
              fontWeight: 500,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#9FA7AE",
            }}
          >
            Dunslim Apartments
          </p>

          <h1
            style={{
              margin: "16px 0 0",
              fontSize: 38,
              lineHeight: 1.1,
              fontWeight: 200,
              letterSpacing: "-0.025em",
            }}
          >
            The site has stopped working.
          </h1>

          <p style={{ margin: "20px 0 0", fontSize: 19, lineHeight: 1.6, color: "#CFD3D6" }}>
            Nothing has been charged and nothing has been booked. Call or message us and we will
            take your dates down ourselves.
          </p>

          <p style={{ margin: "28px 0 0", fontSize: 19, lineHeight: 2 }}>
            <a href="tel:+260778707540" style={{ color: "#FFFFFF", textDecoration: "none" }}>
              +260 77 870 7540
            </a>
            <br />
            <a href="tel:+260767600735" style={{ color: "#FFFFFF", textDecoration: "none" }}>
              +260 76 760 0735
            </a>
          </p>

          <p style={{ margin: "28px 0 0" }}>
            <a
              href="https://wa.me/260778707540"
              style={{
                display: "inline-block",
                minHeight: 52,
                lineHeight: "52px",
                padding: "0 32px",
                background: "#B28A4A",
                color: "#0F2234",
                fontSize: 18,
                fontWeight: 500,
                borderRadius: 6,
                textDecoration: "none",
              }}
            >
              Message us on WhatsApp
            </a>
          </p>

          <p style={{ margin: "32px 0 0", fontSize: 15, color: "#9FA7AE" }}>
            <a href="/" style={{ color: "#9FA7AE" }}>
              Back to the start
            </a>
            {error.digest ? ` · reference ${error.digest}` : null}
          </p>
        </main>
      </body>
    </html>
  );
}
