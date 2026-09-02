import { business, rates, residences, arrival, type Residence } from "@/lib/content";
import { site } from "@/lib/site";
import { money } from "@/lib/format";
import { directNightly } from "@/lib/pricing";

/**
 * Schema.org structured data.
 *
 * Accommodation is one of the few categories where search engines will surface
 * price, location and availability directly in results — but only from a
 * machine-readable description of the offer. Without it the site competes as
 * plain prose against platform listings that publish theirs.
 *
 * Everything here is generated from content.ts, so the marked-up price can
 * never drift from the price on the page. That matters more than it sounds:
 * a schema that disagrees with the visible rate is treated as deceptive.
 *
 * Placeholder values are deliberately omitted rather than published. A phone
 * number that does not ring is worse in structured data than absent from it,
 * because search engines will surface it as a call button.
 */

const CONFIRMED_PHONE = !/^\+?[\s0]+$/.test(business.phone.replace(/[^\d+]/g, "").replace(/^\+?260/, ""));

function json(data: unknown) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const address = {
  "@type": "PostalAddress",
  streetAddress: business.street,
  addressLocality: business.city,
  addressCountry: "ZM",
};

/** The business itself. Rendered once, on the homepage. */
export function LodgingSchema() {
  const cheapest = residences.reduce((a, b) =>
    a.directNightlyZmw <= b.directNightlyZmw ? a : b,
  );

  return json({
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${site.url}/#lodging`,
    name: business.name,
    description:
      "Serviced apartments on Makeni Road, Lusaka, for business and diplomatic travellers.",
    url: site.url,
    slogan: business.brandLine,
    address,
    ...(CONFIRMED_PHONE ? { telephone: business.phone } : {}),
    /*
      Kwacha, with the symbol that matches. This read "$2000+" for a while after
      the site moved to pricing in Kwacha: the number changed underneath a
      hardcoded dollar sign, and Google was being told a night here costs two
      thousand US dollars.
    */
    priceRange: `${money(directNightly(cheapest))}+`,
    geo: {
      "@type": "GeoCoordinates",
      latitude: business.coords.lat,
      longitude: business.coords.lng,
    },
    hasMap: business.mapsUrl,
    currenciesAccepted: "ZMW, USD",
    paymentAccepted: "Visa, Mastercard, MTN Mobile Money, Airtel Money, Bank transfer",
    checkinTime: arrival.checkIn,
    checkoutTime: arrival.lateCheckOut,
    numberOfRooms: residences.length,
    /*
      No aggregateRating. There are not enough verified bookings to have one,
      and inventing a rating is both dishonest and a manual-action risk.
    */
    amenityFeature: rates.included.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
  });
}

/** One residence. Rendered on each residence page. */
export function ResidenceSchema({ residence }: { residence: Residence }) {
  const url = `${site.url}/residences/${residence.slug}`;

  return json({
    "@context": "https://schema.org",
    "@type": "Accommodation",
    "@id": `${url}#accommodation`,
    name: residence.name,
    description: residence.summary,
    url,
    numberOfBedrooms: residence.bedrooms,
    occupancy: { "@type": "QuantitativeValue", maxValue: residence.sleeps },
    amenityFeature: residence.amenities.map((name) => ({
      "@type": "LocationFeatureSpecification",
      name,
      value: true,
    })),
    address,
    containedInPlace: { "@id": `${site.url}/#lodging` },
    offers: {
      "@type": "Offer",
      price: directNightly(residence).toFixed(2),
      priceCurrency: "ZMW",
      url: `${site.url}/book?residence=${residence.slug}`,
      availability: "https://schema.org/InStock",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: directNightly(residence).toFixed(2),
        priceCurrency: "ZMW",
        unitCode: "DAY",
      },
    },
  });
}

/** Breadcrumbs, so search shows the path rather than a bare URL. */
export function BreadcrumbSchema({ trail }: { trail: { name: string; path: string }[] }) {
  return json({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${site.url}${t.path}`,
    })),
  });
}
