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
    <footer className="on-navy bg-navy text-white">
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
                <a
                  href={`mailto:${business.email}`}
                  className="inline-flex min-h-[44px] items-center break-all hover:text-white"
                >
                  {business.email}
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
              Valid to {business.licence.validUntil}
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
