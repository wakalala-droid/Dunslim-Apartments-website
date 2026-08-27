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

  // CONFIRM: guest-facing contact details. `brand@dunslim-apartments.com` in the
  // brand guidelines is the artwork custodian address, not a reservations inbox.
  phone: "+260 000 000 000",
  whatsapp: "260000000000", // digits only, international format, no +
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
 * CONFIRM: every rate below is a placeholder.
 * The Growth Proposal found the same unit advertised between USD 57 and USD 87
 * depending on which platform was viewed. One confirmed rate per unit replaces these.
 */
export const rates = {
  currencyBase: "USD" as const,
  /** Growth Proposal, July 2026. CONFIRM before each budgeting cycle. */
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
  /** Nightly rate in USD, direct. CONFIRM. */
  nightlyUsd: number;
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
 * CONFIRM: names, bedroom counts, sleeps, areas, rates and amenities.
 * Named Residence One / Two / Three deliberately — neutral, architectural, and
 * safe to rename once the owner confirms the real configuration of each unit.
 */
export const residences: Residence[] = [
  {
    slug: "residence-one",
    name: "Residence One",
    summary: "A one-bedroom apartment for a single traveller on a working stay.",
    bedrooms: 1,
    sleeps: 2,
    area: 0,
    nightlyUsd: 57,
    description: [
      "A one-bedroom apartment arranged for someone who is here to work. A desk with room for a laptop and papers, a bed that is properly dark at night, and a kitchen that can handle more than coffee.",
      "Housekeeping runs on a fixed schedule so the day is predictable, and the entrance is private.",
    ],
    amenities: [
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
    slug: "residence-two",
    name: "Residence Two",
    summary: "A two-bedroom apartment for a colleague pair or a small family.",
    bedrooms: 2,
    sleeps: 4,
    area: 0,
    nightlyUsd: 72,
    description: [
      "Two bedrooms off a shared living room, which makes it work equally for two colleagues travelling together and for a family returning to Lusaka.",
      "The second bedroom takes a cot on request. The living room is large enough to hold a meeting in without moving furniture.",
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
    slug: "residence-three",
    name: "Residence Three",
    summary: "A three-bedroom apartment for a delegation or an extended family stay.",
    bedrooms: 3,
    sleeps: 6,
    area: 0,
    nightlyUsd: 87,
    description: [
      "The largest of the three. Three bedrooms and a living room that seats a group, which suits a visiting delegation as readily as a family.",
      "Best suited to longer stays, where the rate ladder makes the most difference.",
    ],
    amenities: [
      "Three bedrooms",
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

// ---------------------------------------------------------------------------
// What decides the booking
//
// Research finding: in Lusaka, backup power, water and security are conversion
// features, not footnotes. Competing listings lead with them.
// CONFIRM: every claim below must be true of all three units before launch.
// ---------------------------------------------------------------------------

export const assurances = [
  {
    title: "Power that does not stop",
    // CONFIRM: solar, inverter or generator — and how many hours it actually holds.
    body: "Backup power covers the apartment through a load-shedding block, so the lights, the Wi-Fi and the work you came here to do all stay on.",
    detail: "CONFIRM: backup type and hours held",
  },
  {
    title: "Water on site",
    body: "Stored water on the property, so a municipal interruption does not reach the shower or the kitchen tap.",
    detail: "CONFIRM: tank capacity or borehole",
  },
  {
    title: "Gated, watched, parked",
    body: "A gated property with security through the night and parking inside the gate, not on the road.",
    detail: "CONFIRM: guarding hours and provider",
  },
  {
    title: "Wi-Fi that carries a call",
    // A number here is worth more than the word "fast". CONFIRM the real figure.
    body: "A connection specified for video calls rather than for browsing, on every unit.",
    detail: "CONFIRM: measured download and upload speed",
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
    a: "Backup power covers the apartment. Lights, sockets and Wi-Fi stay on through a load-shedding block. CONFIRM: state the backup type and how many hours it holds.",
  },
  {
    q: "How do I get in if I arrive late?",
    a: arrival.selfCheckIn
      ? "Your access details are sent the day before arrival, so you can let yourself in at any hour."
      : "Tell us your flight or arrival time when you book and someone will meet you at the apartment to hand over. CONFIRM: the latest arrival that can be met.",
  },
  {
    q: "How do I pay?",
    a: "Visa and Mastercard, MTN Mobile Money, Airtel Money, or bank transfer. You will see the full total before you are asked to pay anything.",
  },
  {
    q: "Can you arrange an airport pick-up?",
    a: "CONFIRM: whether an airport transfer is offered, and at what price.",
  },
  {
    q: "Is there security at night?",
    a: "The property is gated with security through the night, and parking is inside the gate. CONFIRM: guarding hours.",
  },
  {
    q: "Can I stay for a month or longer?",
    a: "Yes. Rates step down at seven nights and again at twenty-eight. For a stay longer than a month, talk to us directly and we will price it properly.",
  },
  {
    q: "Is it cheaper to book here than on Booking.com?",
    a: `Yes. Booking direct is ${rates.directDiscountPct} per cent below the platform rate, every time, with no booking fee.`,
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
