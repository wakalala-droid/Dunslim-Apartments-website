import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Layout";
import { business, nav, secondaryNav } from "@/lib/content";

/**
 * The footer is a Deep Navy field — the brand's ground colour (p.11) — carrying
 * the reversed lockup, which is the authorised treatment on a dark ground.
 *
 * The contact block follows the order fixed on p.17: telephone, email, address,
 * then web.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    /*
      The hairline at the top is doing real work, not decoration.

      The footer is Deep Navy, and so are several of the sections that land
      directly above it — the arrival band on /location, the closing band on the
      homepage. Navy meeting navy with nothing between them read as one
      continuous field, and a guest could not tell where the page ended and the
      footer began. It looked like the page had simply run on.

      A fine rule is the brand's own dividing device (business card, key card,
      tariff card), and this is the same weight as the rule above the copyright
      line further down, so the footer is bounded top and bottom by the same
      mark. Against a white or stone section the navy already separates itself
      and the rule simply goes unnoticed.
    */
    <footer className="on-navy border-t border-white/[0.16] bg-navy text-white">
      <Container wide>
        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12 lg:py-24">
          <div className="sm:col-span-2 lg:col-span-5">
            <Logo lockup="vertical" tone="reversed" width={132} />
            <p className="mt-8 max-w-[34ch] text-lead font-extralight text-navy-20">
              {business.brandLine}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="label-caps text-brass-60">Contact</p>
            <ul className="mt-4 text-body text-navy-20">
              {/*
                Both lines, because a guest who cannot get through on the first
                one should not have to give up. Each is its own tap target.
              */}
              <li>
                <a
                  href={`tel:${business.phone.replace(/\s/g, "")}`}
                  className="inline-flex min-h-[44px] items-center hover:text-white"
                >
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${business.phoneAlt.replace(/\s/g, "")}`}
                  className="inline-flex min-h-[44px] items-center hover:text-white"
                >
                  {business.phoneAlt}
                </a>
              </li>
              <li>
                {/*
                  `break-all` let the address snap anywhere it ran out of
                  column, which produced "stay@dunslim-apartments.c" on one line
                  and "om" on the next. An address broken mid-word is one a
                  guest cannot read back to themselves, let alone type.

                  The break point is now chosen: a <wbr> after the "@" offers
                  the browser one sensible place to fold, so it either fits on
                  one line or splits into the name and the domain.
                */}
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex min-h-[44px] items-center hover:text-white"
                >
                  {/*
                    One span, so the address is a single flex item. Left as bare
                    text it became three of them — name, "@", domain — and a row
                    of flex items cannot reflow as a sentence does, so it broke
                    across lines even where there was room for it.
                  */}
                  <span>
                    {business.email.split("@")[0]}@<wbr />
                    {business.email.split("@")[1]}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${business.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
              <li className="pt-2">
                {business.street}
                <br />
                {business.city}, {business.country}
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label-caps text-brass-60">Visit</p>
            <ul className="mt-4 text-body text-navy-20">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-[44px] items-center hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              {secondaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="inline-flex min-h-[44px] items-center hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/book" className="inline-flex min-h-[44px] items-center hover:text-white">
                  Book
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="label-caps text-brass-60">Licensed</p>
            <p className="mt-6 text-caption leading-relaxed text-navy-20">
              {business.licence.label}
              {business.licence.number ? (
                <>
                  <br />
                  No. {business.licence.number}
                </>
              ) : null}
              <br />
              {/* The date holds together: "Valid to 30" over "June 2028" reads as a fragment. */}
              Valid to <span className="whitespace-nowrap">{business.licence.validUntil}</span>
            </p>
          </div>
        </div>

        <hr className="rule-hair" />

        <div className="flex flex-col gap-4 py-8 text-caption text-navy-40 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {business.parent}
          </p>
          <p>Rates shown in Kwacha. Dollar figures are approximate.</p>
        </div>
      </Container>
    </footer>
  );
}
