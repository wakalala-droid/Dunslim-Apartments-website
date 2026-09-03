import { inWords } from "./format";

/**
 * DUNSLIM APARTMENTS: SINGLE SOURCE OF CONTENT
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
  parent: "Dunslim Group, Hospitality Division",

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

  /*
    Taken from the property's own Google Maps listing, which is where a guest
    following a link will end up, so the pin on this site and the pin they land
    on are the same place. The placeholder these replace sat 9.3km away, across
    Lusaka. A guest driving to it at night would not have found the gate.
  */
  coords: { lat: -15.4640271, lng: 28.2024538 },
  /** The property's listing on Google Maps. */
  mapsUrl: "https://maps.app.goo.gl/PBRGcWupxdCYe8ys8",
  /** Plus Code, which works as an address on its own anywhere Maps is used. */
  plusCode: "G6P2+9XP",
} as const;

// ---------------------------------------------------------------------------
// Who this is for: Growth Proposal §3.1
// ---------------------------------------------------------------------------

export const audience = [
  "Corporate consultants",
  "NGO and development sector staff",
  "Relocation-phase professionals",
  "Diplomatic-adjacent visitors",
  "Returning families",
] as const;

// ---------------------------------------------------------------------------
// The cars
// ---------------------------------------------------------------------------

/**
 * THREE TOYOTA MARK X, ONE PER RESIDENCE.
 *
 * Confirmed by the owner, 3 September 2026, with the two details that decide how
 * it can honestly be described: a driver of ours does the airport runs, the guest
 * drives it themselves in between and it sits inside the nightly rate rather
 * than being charged for.
 *
 * WHY THIS IS A BLOCK OF DATA AND NOT A LINE OF COPY.
 *
 * It has to appear in a dozen places at once: the hero, the residence cards and
 * pages, the rate card, the checkout summary, the long-stay page, the terms, the
 * FAQ, the arrival section and the machine-readable description search engines
 * read. Written by hand into each, the count would eventually say three in one
 * place and one in another, which is precisely the disagreement across listings
 * that this site exists to end. Every one of those places reads from here.
 *
 * `count` is the FLEET, not what one guest gets. Three apartments, three cars,
 * one attached to each: a booked guest has a car of their own and never shares
 * it. Add a fourth apartment and a fourth car has to arrive with it, or
 * `perResidence` quietly stops being true.
 *
 * CONFIRM. Until each of these is answered the site says nothing about it. Every
 * one is a question a guest will ask before they take the keys and inventing an
 * answer would be worse than the silence:
 *   - what licence is needed and whether an international permit is asked for
 *   - insurance: who is covered and the excess on a claim
 *   - fuel: handed over full and returned full, or metered
 *   - any mileage limit, or a boundary outside Lusaka
 *   - a minimum driver age
 *   - whether a second guest on the booking may drive it
 * The terms page carries the same list. Answer them there first.
 */
export const fleet = {
  model: "Toyota Mark X",
  /** The whole fleet. Three apartments, three cars. */
  count: 3,
  /** What a single booking gets. One and it is not shared. */
  perResidence: 1,
  /** A driver of ours meets the flight and drives the guest in. */
  drivenFromAirport: true,
  /** The guest drives it themselves for the rest of the stay. */
  selfDriveDuringStay: true,
  /** Inside the nightly rate. Nothing is added at checkout for it. */
  included: true,
} as const;

/**
 * The car as one line, for a list of amenities or inclusions.
 *
 * Singular on purpose. A guest reading their own apartment's page cares that
 * they get a car, not that the business owns three.
 */
export const carLine = `A ${fleet.model}, yours for the stay`;

/** The airport runs, as one line. Separate because it is a different promise. */
export const transferLine = "Airport pick-up and drop-off, driven by us";

// ---------------------------------------------------------------------------
// Rates
// ---------------------------------------------------------------------------

/**
 * Kwacha is the base currency of this site and the only one. Every amount
 * stored anywhere in the codebase is in Kwacha, because that is what the
 * business sets its prices in and what a guest is charged.
 *
 * There is no stored dollar rate any more. One lived here, was marked as
 * needing confirmation every budgeting cycle and went stale exactly as that
 * note predicted. See the header of lib/format.ts.
 *
 * The nightly rate is confirmed: K2,000 a night, booked direct. It replaces
 * three placeholders (USD 57, 72 and 87) taken from the very platform
 * inconsistency the Growth Proposal was written to fix.
 */
export const rates = {
  currencyBase: "ZMW" as const,

  /**
   * The book-direct promise and the ONLY discount setting on the site.
   *
   * It does three jobs and they cannot disagree: it derives the published rate
   * from the direct one, it is the figure every line of copy quotes and it is
   * the saving shown at checkout. A second setting used to add a further twelve
   * per cent on top of this to invent a platform price, which made the site
   * display a nineteen per cent saving beside a ten per cent promise. Removed.
   */
  directDiscountPct: 10,

  /** Long-stay ladder. Applied automatically, shown before payment. */
  longStay: [
    { minNights: 7, discountPct: 15, label: "Seven nights or more" },
    { minNights: 28, discountPct: 25, label: "A month or more" },
  ],

  /**
   * Drip pricing is prohibited (Elite Builder System, conversion_psychology.md).
   * Everything below is included in the displayed nightly rate. There are no
   * fees added at the payment step. If a real fee is ever introduced it must be
   * declared here and shown from the first price the guest ever sees.
   */
  included: [
    // The two that lead are the two no platform listing can offer.
    carLine,
    transferLine,
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
  /**
   * The person the apartment is named for. Optional: Mulima has none yet.
   *
   * Kept short on purpose. This is a serviced apartment, not a museum label.
   * A guest choosing where to stay will read three sentences about a president
   * and will not read twelve.
   */
  namedAfter?: { person: string; lived: string; note: string };
  /**
   * The one thing this apartment has that the other two do not.
   *
   * All three are two bedrooms, sleep four and cost K2,000, so on the residence
   * step of checkout they rendered as three identical cards and the guest was
   * asked to choose with nothing to choose on. This is the line that answers it,
   * and it is deliberately one concrete object rather than an adjective.
   */
  standout: string;
  /** Longest-form description. Two or three sentences, plainly written. */
  description: string[];
  /**
   * What comes with this residence.
   *
   * The car and the airport runs lead every one of these lists, because they are
   * the two things a guest cannot get from a platform listing at any price. They
   * are written into each residence rather than bolted on in the component so
   * that the machine-readable description of each apartment carries them too:
   * search engines read `amenityFeature` per unit, not per business.
   */
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
 * placeholder Residence One / Two / Three and the slugs follow them, so the
 * addresses read /residences/mandela rather than /residences/residence-one.
 * Changing them costs nothing today because the site is still behind noindex
 * and has never been linked publicly; it would be expensive after launch.
 */
export const residences: Residence[] = [
  {
    slug: "mandela",
    name: "Mandela",
    summary: "Two bedrooms. Set up for someone here to work.",
    standout: `A proper desk, a bedroom that goes properly dark and its own ${fleet.model}`,
    bedrooms: 2,
    sleeps: 4,
    area: 0,
    directNightlyZmw: 2000,
    namedAfter: {
      person: "Nelson Mandela",
      lived: "1918 to 2013",
      note: "South Africa's first democratically elected president. Before that, twenty-seven years a prisoner. Lusaka gave the African National Congress a home through its long years in exile. Mandela came here within weeks of walking free in 1990.",
    },
    description: [
      "Set up for someone here to work. There is a proper desk, the bedrooms get properly dark at night and the kitchen can handle more than coffee.",
      "Housekeeping comes on set days, so you know when to expect us. The entrance is your own.",
    ],
    amenities: [
      carLine,
      transferLine,
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
    standout: `A cot fits in the second bedroom, the living room holds a meeting and its own ${fleet.model}`,
    bedrooms: 2,
    sleeps: 4,
    area: 0,
    directNightlyZmw: 2000,
    description: [
      "Two bedrooms off a shared living room. It works just as well for two colleagues travelling together as for a family back in Lusaka.",
      "We can put a cot in the second bedroom if you need one. The living room is big enough to hold a meeting without shifting furniture.",
    ],
    amenities: [
      carLine,
      transferLine,
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
    standout: `A dining table for six, parking for two vehicles and its own ${fleet.model}`,
    bedrooms: 2,
    sleeps: 4,
    area: 0,
    directNightlyZmw: 2000,
    namedAfter: {
      person: "Kenneth Kaunda",
      lived: "1924 to 2021",
      note: "Zambia's first president, who led the country to independence in 1964 and then governed it for twenty-seven years. A schoolteacher before he was a politician, he opened Lusaka to the liberation movements of southern Africa at a time when few other capitals would.",
    },
    description: [
      "Two bedrooms and a living room that seats everyone, whether that is a work team or family.",
      "Best value on a longer stay, where the weekly and monthly rates really start to count.",
    ],
    amenities: [
      carLine,
      transferLine,
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
 * being told at the end that nothing here sleeps six, a dead end the form used
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

/**
 * The four things a guest asks about before anything else.
 *
 * All four are CONFIRMED TRUE by the owner. They were written before that and
 * carried a warning not to publish them unverified, which has now been lifted.
 *
 * `detail` is an internal note, never rendered. What it asks for is no longer
 * whether the claim holds but the specifics behind it, which are worth having
 * because a number always outsells an adjective: "eight hours of backup" beats
 * "we have backup power" and a measured speed beats "fast enough".
 */
export const assurances = [
  {
    title: "The power stays on",
    body: "We have backup power. When the grid goes down, the lights, the fridge and the Wi-Fi keep running.",
    detail: "Confirmed. Still worth having: what the backup is and how many hours it holds.",
  },
  {
    title: "We store our own water",
    body: "There is a tank on the property. If the council supply is cut, you can still shower and cook.",
    detail: "Confirmed. Still worth having: tank size, or whether it is a borehole.",
  },
  {
    title: "Gated, with a guard at night",
    body: "The gate is manned overnight and you park inside it, not out on the road.",
    detail: "Confirmed. Still worth having: guarding hours and which company.",
  },
  {
    title: "Wi-Fi that handles video calls",
    body: "Fast enough for Zoom and Teams, in all three apartments.",
    detail: "Confirmed. Still worth having: the measured speed, up and down.",
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
  /*
    CONFIRM: is self check-in available, or is it always a met-on-arrival
    handover? Less pressing than it was. The real anxiety for a late arrival is
    getting from the airport to the door at midnight and that is now answered:
    a driver meets the flight. Do not claim self check-in until it is in place.
  */
  selfCheckIn: false,
} as const;

/**
 * Road time from the airport, in minutes.
 *
 * Derived from the measured neighbourhood entry rather than stored beside it.
 * There was an `arrival.airportMinutes: 0` here carrying a CONFIRM while the
 * real figure sat thirty lines below in `neighbourhood`, measured by road and
 * already rendered on the location page. Two homes for one number, one of them
 * a placeholder that would have been read as "we do not know".
 *
 * A function rather than a constant because `neighbourhood` is declared after
 * this point in the file and the value is only ever needed at render time.
 */
export const airportMinutes = () =>
  neighbourhood.find((p) => p.kind === "Airport")?.minutes ?? 0;

// ---------------------------------------------------------------------------
// The neighbourhood. Growth Proposal §2.1 records that distances currently
// disagree across listings. One confirmed set of numbers replaces them.
// ---------------------------------------------------------------------------

export type Place = {
  name: string;
  kind: string;
  /** Road distance from the gate, in kilometres. A fact that does not change. */
  km: number;
  /** Typical driving time. An estimate that does change. See the note below. */
  minutes: number;
  mode: "drive" | "walk";
};

/*
 * Measured by road from the property's own map pin, not guessed and not copied
 * from the old listings, which is what the Growth Proposal found disagreeing
 * with each other in the first place.
 *
 * Both numbers are shown deliberately. The kilometres are a fact and stay put;
 * the minutes are free-flowing driving time and Lusaka traffic does what it
 * likes with them, so they are rounded to five minutes rather than presented
 * as though anyone could hold them to the minute.
 *
 * Leave `km: 0` and the place renders as "distance to confirm".
 */
export const neighbourhood: Place[] = [
  { name: "Kenneth Kaunda International Airport", kind: "Airport", km: 37.6, minutes: 55, mode: "drive" },
  { name: "Lusaka city centre", kind: "Business district", km: 12.4, minutes: 25, mode: "drive" },
  { name: "Makeni Mall", kind: "Shops and pharmacy", km: 8.7, minutes: 20, mode: "drive" },
  { name: "Lusaka Golf Club", kind: "Club", km: 17.1, minutes: 30, mode: "drive" },
  { name: "Lusaka National Museum", kind: "Museum", km: 13.9, minutes: 25, mode: "drive" },
  { name: "Levy Junction", kind: "Shopping and dining", km: 13.4, minutes: 25, mode: "drive" },
];

// ---------------------------------------------------------------------------
// Reviews
//
// The Growth Proposal (§2.2) records that no listing currently carries a
// calculated review score. Not because reviews are bad, but because there are
// not yet enough verified bookings to produce one. Nothing is invented here.
// Add entries only when they are real and the guest has given permission.
// ---------------------------------------------------------------------------

export type Review = { quote: string; name: string; role: string; source: string };

export const reviews: Review[] = [];

// ---------------------------------------------------------------------------
// Questions guests actually ask before booking
// ---------------------------------------------------------------------------

/*
 * These answers are RENDERED TO GUESTS on /rates.
 *
 * Three of them shipped with editorial notes still attached, so the live page
 * told visitors "We have backup power... CONFIRM: say what the backup is", and
 * answered "Can you arrange an airport pick-up?" with nothing but the note. The
 * notes have been taken out of the copy; anything still unknown is now a
 * comment, which is the only place a note to ourselves belongs.
 *
 * The rule: never put a CONFIRM inside a string that reaches a page. Put it
 * above the line, where a guest cannot read it.
 */
export const faqs = [
  {
    q: "What happens if the power goes out?",
    // Worth adding once known: what the backup is and how many hours it holds.
    a: "We have backup power, so the lights, sockets and Wi-Fi stay on.",
  },
  {
    q: "How do I get in if I arrive late?",
    // Worth adding once known: the latest arrival that can be met.
    a: "Give us your flight when you book. A driver meets it, whatever time it lands, then takes you straight to the apartment where someone hands over the keys.",
  },
  {
    q: "How do I pay?",
    a: "Visa, Mastercard, MTN Mobile Money, Airtel Money or bank transfer. You see the full total before you pay anything.",
  },
  /*
    PUT BACK, WITH A REAL ANSWER.

    This question was deleted rather than answered, because nobody knew whether
    an airport pick-up existed. The note left in its place said to restore it the
    moment there was something true to say. There is: a driver of ours meets the
    flight and the car then stays with the guest.
  */
  {
    q: "Can you pick me up from the airport?",
    a: `Yes and it costs nothing extra. A driver meets your flight at Kenneth Kaunda International and brings you in, about ${airportMinutes()} minutes by road. The ${fleet.model} then stays with you for the rest of your stay and we drive you back out for your flight home.`,
  },
  {
    q: "Do I really get a car?",
    a: `Yes. Each of the ${inWords(fleet.count)} residences has its own ${fleet.model} and it is not shared with anyone. We drive you in from the airport, then it is yours to use until you leave. It is included in the nightly rate.`,
  },
  {
    q: "Is there security at night?",
    // Worth adding once known: the exact guarding hours and which company.
    a: "Yes. The gate is manned overnight and you park inside it.",
  },
  {
    q: "Can I stay for a month or longer?",
    a: "Yes. The rate drops at seven nights and again at twenty-eight. If you are staying more than a month, just talk to us and we will work something out.",
  },
  {
    q: "Is it cheaper to book here than on Booking.com?",
    a: `Yes. Booking here is ${rates.directDiscountPct}% cheaper than the platforms, every time. There is no booking fee.`,
  },
] as const;

// ---------------------------------------------------------------------------
// Navigation: fixed by the brand guidelines, p.16 (website header).
// ---------------------------------------------------------------------------

export const nav = [
  { href: "/residences", label: "Residences" },
  { href: "/rates", label: "Rates" },
  /*
    FOR THE BRAND CUSTODIAN TO CONFIRM.

    The guidelines fix the header at four items and this makes it five with the
    Book button. It was added because the homepage tells guests that most people
    who stay here are in Lusaka for work and the page written for exactly those
    guests was reachable only from the footer. If the four-item rule is to hold,
    the right move is to take this back out and give long stays a prominent link
    inside /rates instead, rather than leaving it where it was.
  */
  { href: "/long-stays", label: "Long stays" },
  { href: "/location", label: "Location" },
] as const;

/**
 * Secondary destinations. Not in the header, listed in the footer, linked in
 * context from wherever they are relevant.
 */
export const secondaryNav = [
  { href: "/terms", label: "Booking terms" },
] as const;
