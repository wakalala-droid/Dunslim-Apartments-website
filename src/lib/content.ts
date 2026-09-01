/**
 * DUNSLIM APARTMENTS — SINGLE SOURCE OF CONTENT
 * ---------------------------------------------------------------------------
 * Everything a non-developer needs to change lives in this one file.
 *
 * Anything marked `CONFIRM:` is a placeholder taken from the Growth Proposal
 * (July 2026) or left deliberately blank. The Growth Proposal, Section 2.1,
 * records that Dunslim's existing listings disagree with each other on amenities,
 * room counts, prices and distances. Phase 0 of that proposal is to settle one
 * confirmed answer per unit. This file is where those answers go, once.
 *
 * Nothing in this file is invented as fact. Where a real number is not yet known,
 * the value is marked and the UI is written to degrade honestly rather than guess.
 */

// ---------------------------------------------------------------------------
// The business
// ---------------------------------------------------------------------------

export const business = {
  name: "Dunslim Apartments",
  /** Fixed by the brand guidelines (p.3). Never rewritten. */
  brandLine: "Architectural by nature. Hospitality by choice.",
  parent: "Dunslim Group — Hospitality Division",

  street: "Makeni Road",
  city: "Lusaka",
  country: "Zambia",

  /*
    Confirmed by the owner. Two lines: the first is the one shown, called and
    used for WhatsApp; the second is listed beside it so a guest who cannot get
    through has somewhere else to go rather than giving up.

    Written here in international form. Zambian numbers are often given locally
    as 0XX XXX XXXX; the leading zero is dropped and +260 takes its place, which
    is what both a `tel:` link and wa.me require.
  */
  phone: "+260 77 870 7540",
  whatsapp: "260778707540", // digits only, international format, no +
  phoneAlt: "+260 76 760 0735",
  whatsappAlt: "260767600735",
  // CONFIRM: the reservations inbox. `brand@dunslim-apartments.com` in the brand
  // guidelines is the artwork custodian address, not a place to send bookings.
  email: "stay@dunslim-apartments.com",

  /** Growth Proposal §2: licence runs through 30 June 2028. */
  licence: {
    label: "Zambia Tourism Accommodation Licence",
    validUntil: "30 June 2028",
    // CONFIRM: the licence number itself, so it can be shown in full.
    number: "",
  },

  // CONFIRM: exact coordinates of the property for the map + directions link.
  coords: { lat: -15.4437, lng: 28.2871 },
} as const;

// ---------------------------------------------------------------------------
// Who this is for — Growth Proposal §3.1
// ---------------------------------------------------------------------------

export const audience = [
  "Corporate consultants",
  "NGO and development sector staff",
  "Relocation-phase professionals",
  "Diplomatic-adjacent visitors",
  "Returning families",
] as const;

// ---------------------------------------------------------------------------
// Rates
// ---------------------------------------------------------------------------

/**
 * Kwacha is the base currency of this site. Every amount stored anywhere in the
 * codebase is in Kwacha, because that is what the business sets its prices in.
 * Dollars are derived for display at the rate below and always labelled as
 * approximate — a stored rate is not a live one, and showing a converted figure
 * as though it were exact would be a quiet lie.
 *
 * The nightly rate is confirmed: K2,000 a night, booked direct. It replaces
 * three placeholders (USD 57, 72 and 87) taken from the very platform
 * inconsistency the Growth Proposal was written to fix.
 */
export const rates = {
  currencyBase: "ZMW" as const,
  /**
   * Only used to show an approximate dollar figure beside the Kwacha price,
   * never to set one. CONFIRM before each budgeting cycle.
   */
  zmwPerUsd: 18,

  /** What a guest pays on Booking.com / Airbnb, used to show the direct saving. */
  platformUpliftPct: 12,

  /** The book-direct promise. Shown on the homepage, honoured at checkout. */
  directDiscountPct: 10,

  /** Long-stay ladder. Applied automatically, shown before payment. */
  longStay: [
    { minNights: 7, discountPct: 15, label: "Seven nights or more" },
    { minNights: 28, discountPct: 25, label: "A month or more" },
  ],

  /**
   * Drip pricing is prohibited (Elite Builder System, conversion_psychology.md).
   * Everything below is included in the displayed nightly rate — there are no
   * fees added at the payment step. If a real fee is ever introduced it must be
   * declared here and shown from the first price the guest ever sees.
   */
  included: [
    "Housekeeping",
    "Linen and towels",
    "Water and electricity",
    "Wi-Fi",
    "Secure parking",
  ],
} as const;

// ---------------------------------------------------------------------------
// The residences
// ---------------------------------------------------------------------------

export type Residence = {
  slug: string;
  name: string;
  /** One line, ranged left, no marketing adjectives. */
  summary: string;
  bedrooms: number;
  sleeps: number;
  /** Square metres. 0 = not yet measured. */
  area: number;
  /**
   * THE PRICE A GUEST PAYS, per night, booking direct, in Kwacha.
   *
   * Deliberately the direct price and not the headline one. The owner sets what
   * a guest actually hands over; the higher published rate that the ten per cent
   * book-direct discount comes off is derived from this in pricing.ts. Storing
   * it the other way round meant the round number was the one nobody pays, and
   * the discount maths landed on K1,999.80 for a night that is advertised at
   * K2,000.
   */
  directNightlyZmw: number;
  /** Longest-form description. Two or three sentences, plainly written. */
  description: string[];
  amenities: string[];
  /**
   * Photo slots. `id` is a key in the photo manifest (src/lib/photos.ts),
   * which maps to a file in /public/photos. Replace the file, keep the key.
   */
  photos: { id: string; caption: string }[];
};

/**
 * CONFIRM: areas and amenities. Bedrooms, sleeps and rates are confirmed:
 * two bedrooms in every apartment, four guests maximum, K2,000 a night direct.
 *
 * The names are confirmed: Mandela, Mulima and Kaunda. They replace the
 * placeholder Residence One / Two / Three, and the slugs follow them, so the
 * addresses read /residences/mandela rather than /residences/residence-one.
 * Changing them costs nothing today because the site is still behind noindex
 * and has never been linked publicly; it would be expensive after launch.
 */
export const residences: Residence[] = [
  {
    slug: "mandela",
    name: "Mandela",
    summary: "Two bedrooms. Set up for someone here to work.",
    bedrooms: 2,
    sleeps: 2,
    area: 0,
    directNightlyZmw: 2000,
    description: [
      "Set up for someone here to work. There is a proper desk, the bedrooms get properly dark at night, and the kitchen can handle more than coffee.",
      "Housekeeping comes on set days, so you know when to expect us. The entrance is your own.",
    ],
    amenities: [
      "Two bedrooms",
      "Desk and task chair",
      "Full kitchen",
      "Washing machine",
      "Air conditioning",
      "Secure parking, one vehicle",
    ],
    photos: [
      { id: "r1-living", caption: "Living room, from the entrance" },
      { id: "r1-bedroom", caption: "Bedroom" },
      { id: "r1-kitchen", caption: "Kitchen" },
      { id: "r1-desk", caption: "Work desk" },
    ],
  },
  {
    slug: "mulima",
    name: "Mulima",
    summary: "Two bedrooms. Works for two colleagues, or a family.",
    bedrooms: 2,
    sleeps: 4,
    area: 0,
    directNightlyZmw: 2000,
    description: [
      "Two bedrooms off a shared living room. It works just as well for two colleagues travelling together as for a family back in Lusaka.",
      "We can put a cot in the second bedroom if you need one. The living room is big enough to hold a meeting without shifting furniture.",
    ],
    amenities: [
      "Two bedrooms",
      "Full kitchen",
      "Washing machine",
      "Air conditioning",
      "Dining table, seats four",
      "Secure parking, one vehicle",
    ],
    photos: [
      { id: "r2-living", caption: "Living room" },
      { id: "r2-bedroom-1", caption: "Main bedroom" },
      { id: "r2-bedroom-2", caption: "Second bedroom" },
      { id: "r2-kitchen", caption: "Kitchen and dining" },
    ],
  },
  {
    slug: "kaunda",
    name: "Kaunda",
    summary: "Two bedrooms. Room for a team, or family visiting.",
    bedrooms: 2,
    sleeps: 4,
    area: 0,
    directNightlyZmw: 2000,
    description: [
      "Two bedrooms and a living room that seats everyone, whether that is a work team or family.",
      "Best value on a longer stay, where the weekly and monthly rates really start to count.",
    ],
    amenities: [
      "Two bedrooms",
      "Full kitchen",
      "Washing machine",
      "Air conditioning",
      "Dining table, seats six",
      "Secure parking, two vehicles",
    ],
    photos: [
      { id: "r3-living", caption: "Living room" },
      { id: "r3-bedroom-1", caption: "Main bedroom" },
      { id: "r3-bedroom-2", caption: "Second bedroom" },
      { id: "r3-kitchen", caption: "Kitchen and dining" },
    ],
  },
];

export const getResidence = (slug: string) => residences.find((r) => r.slug === slug);

/**
 * The largest party the property will take, in any apartment. Four.
 *
 * Derived from the apartments rather than written down beside them, so it can
 * never disagree with them. Every guest selector on the site counts up to this,
 * which is what stops a guest choosing six, walking through the dates step, and
 * being told at the end that nothing here sleeps six — a dead end the form used
 * to allow because its options were hardcoded 1 to 6 in two separate files.
 */
export const maxGuests = Math.max(...residences.map((r) => r.sleeps));

// ---------------------------------------------------------------------------
// What decides the booking
//
// Research finding: in Lusaka, backup power, water and security are conversion
// features, not footnotes. Competing listings lead with them.
// CONFIRM: every claim below must be true of all three units before launch.
// ---------------------------------------------------------------------------

export const assurances = [
  {
    title: "The power stays on",
    // CONFIRM: solar, inverter or generator — and how many hours it actually holds.
    body: "We have backup power. When the grid goes down, the lights, the fridge and the Wi-Fi keep running.",
    detail: "CONFIRM: what the backup is, and how many hours it lasts",
  },
  {
    title: "We store our own water",
    body: "There is a tank on the property. If the council supply is cut, you can still shower and cook.",
    detail: "CONFIRM: tank size, or is it a borehole?",
  },
  {
    title: "Gated, with a guard at night",
    body: "The gate is manned overnight and you park inside it, not out on the road.",
    detail: "CONFIRM: guarding hours, and which company",
  },
  {
    title: "Wi-Fi that handles video calls",
    // A number here is worth more than the word "fast". CONFIRM the real figure.
    body: "Fast enough for Zoom and Teams, in all three apartments.",
    detail: "CONFIRM: actual measured speed, up and down",
  },
] as const;

// ---------------------------------------------------------------------------
// Arrival
// ---------------------------------------------------------------------------

export const arrival = {
  checkIn: "14:00",
  checkOut: "10:00",
  /** Direct-booking perk, honoured at checkout. */
  lateCheckOut: "12:00",
  /** Free cancellation window, in hours before check-in. */
  cancellationHours: 48,
  // CONFIRM: is self check-in actually available, or is it a met-on-arrival handover?
  // Research shows this is the single biggest anxiety for a late arrival. Do not
  // claim self check-in until it is genuinely in place.
  selfCheckIn: false,
  airportMinutes: 0, // CONFIRM: real drive time to Kenneth Kaunda International.
} as const;

// ---------------------------------------------------------------------------
// The neighbourhood — Growth Proposal §2.1 records that distances currently
// disagree across listings. One confirmed set of numbers replaces them.
// ---------------------------------------------------------------------------

export type Place = { name: string; kind: string; minutes: number; mode: "drive" | "walk" };

/** CONFIRM: every distance. Leave `minutes: 0` and it renders as "distance to confirm". */
export const neighbourhood: Place[] = [
  { name: "Kenneth Kaunda International Airport", kind: "Airport", minutes: 0, mode: "drive" },
  { name: "Lusaka city centre", kind: "Business district", minutes: 0, mode: "drive" },
  { name: "Makeni Mall", kind: "Shops and pharmacy", minutes: 0, mode: "drive" },
  { name: "Lusaka Golf Club", kind: "Club", minutes: 0, mode: "drive" },
  { name: "Lusaka National Museum", kind: "Museum", minutes: 0, mode: "drive" },
  { name: "Levy Junction", kind: "Shopping and dining", minutes: 0, mode: "drive" },
];

// ---------------------------------------------------------------------------
// Reviews
//
// The Growth Proposal (§2.2) records that no listing currently carries a
// calculated review score — not because reviews are bad, but because there are
// not yet enough verified bookings to produce one. Nothing is invented here.
// Add entries only when they are real and the guest has given permission.
// ---------------------------------------------------------------------------

export type Review = { quote: string; name: string; role: string; source: string };

export const reviews: Review[] = [];

// ---------------------------------------------------------------------------
// Questions guests actually ask before booking
// ---------------------------------------------------------------------------

export const faqs = [
  {
    q: "What happens if the power goes out?",
    a: "We have backup power, so the lights, sockets and Wi-Fi stay on. CONFIRM: say what the backup is and how many hours it lasts.",
  },
  {
    q: "How do I get in if I arrive late?",
    a: arrival.selfCheckIn
      ? "We send your access details the day before, so you can let yourself in whatever time you land."
      : "Tell us your flight or arrival time when you book and someone will meet you at the apartment with the keys. CONFIRM: the latest arrival we can meet.",
  },
  {
    q: "How do I pay?",
    a: "Visa, Mastercard, MTN Mobile Money, Airtel Money or bank transfer. You see the full total before you pay anything.",
  },
  {
    q: "Can you arrange an airport pick-up?",
    a: "CONFIRM: do we offer an airport pick-up, and what do we charge for it?",
  },
  {
    q: "Is there security at night?",
    a: "Yes. The gate is manned overnight and you park inside it. CONFIRM: the exact guarding hours.",
  },
  {
    q: "Can I stay for a month or longer?",
    a: "Yes. The rate drops at seven nights and again at twenty-eight. If you are staying more than a month, just talk to us and we will work something out.",
  },
  {
    q: "Is it cheaper to book here than on Booking.com?",
    a: `Yes. Booking here is ${rates.directDiscountPct}% cheaper than the platforms, every time, and there is no booking fee.`,
  },
] as const;

// ---------------------------------------------------------------------------
// Navigation — fixed by the brand guidelines, p.16 (website header).
// ---------------------------------------------------------------------------

export const nav = [
  { href: "/residences", label: "Residences" },
  { href: "/rates", label: "Rates" },
  { href: "/location", label: "Location" },
] as const;

/**
 * Secondary destinations. Kept out of the header, which the brand guidelines
 * fix at four items, but reachable from the footer and linked in context.
 */
export const secondaryNav = [
  { href: "/long-stays", label: "Long stays" },
] as const;
