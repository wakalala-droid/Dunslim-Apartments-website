/**
 * THE CURRENCY LIST BEHIND THE CONVERTER
 * ---------------------------------------------------------------------------
 * Kwacha is still the only currency this business prices in and charges in.
 * Everything here converts a Kwacha price for a guest reading it from
 * somewhere else; nothing here is ever the amount anybody is asked for.
 *
 * WHY A LIST AND NOT "EVERY CURRENCY THE FEED RETURNS". The upstream rate feed
 * carries about 160. Most of them are noise for a serviced apartment in Lusaka,
 * and a few (Zimbabwe's, which has been redenominated twice in living memory)
 * would show a figure that is technically converted and practically wrong. So
 * the list is chosen: the currencies guests actually arrive with, the
 * neighbours Zambia trades with, and the big travel currencies.
 *
 * `country` is an ISO 3166-1 alpha-2 code and it exists for one reason: to
 * name the flag file at /flags/<country>.svg. Flags are committed SVGs rather
 * than emoji, because emoji flags do not render at all on Windows: a guest on a
 * Windows laptop would see the letters "ZA" where the South African flag
 * should be. Run `npm run flags` after adding a currency here.
 *
 * `popular` is the short group at the top of the picker. Four of them are the
 * currencies the booking enquiries actually come in; the rest of the list is
 * alphabetical by name, as a long list should be.
 */

export type Currency = {
  /** ISO 4217. Also the key in the rate feed. */
  code: string;
  name: string;
  /** ISO 3166-1 alpha-2, for the flag file. */
  country: string;
  popular?: boolean;
};

export const CURRENCIES: Currency[] = [
  // The short list at the top.
  { code: "USD", name: "US dollar", country: "US", popular: true },
  { code: "EUR", name: "Euro", country: "EU", popular: true },
  { code: "GBP", name: "Pound sterling", country: "GB", popular: true },
  { code: "ZAR", name: "South African rand", country: "ZA", popular: true },
  { code: "CNY", name: "Chinese yuan", country: "CN", popular: true },
  { code: "AED", name: "UAE dirham", country: "AE", popular: true },

  // Everything else, alphabetical by name.
  { code: "AOA", name: "Angolan kwanza", country: "AO" },
  { code: "AUD", name: "Australian dollar", country: "AU" },
  { code: "BWP", name: "Botswana pula", country: "BW" },
  { code: "BRL", name: "Brazilian real", country: "BR" },
  { code: "CAD", name: "Canadian dollar", country: "CA" },
  { code: "CDF", name: "Congolese franc", country: "CD" },
  { code: "CZK", name: "Czech koruna", country: "CZ" },
  { code: "DKK", name: "Danish krone", country: "DK" },
  { code: "EGP", name: "Egyptian pound", country: "EG" },
  { code: "ETB", name: "Ethiopian birr", country: "ET" },
  { code: "GHS", name: "Ghanaian cedi", country: "GH" },
  { code: "HKD", name: "Hong Kong dollar", country: "HK" },
  { code: "HUF", name: "Hungarian forint", country: "HU" },
  { code: "INR", name: "Indian rupee", country: "IN" },
  { code: "IDR", name: "Indonesian rupiah", country: "ID" },
  { code: "ILS", name: "Israeli shekel", country: "IL" },
  { code: "JPY", name: "Japanese yen", country: "JP" },
  { code: "KES", name: "Kenyan shilling", country: "KE" },
  { code: "KWD", name: "Kuwaiti dinar", country: "KW" },
  { code: "MWK", name: "Malawian kwacha", country: "MW" },
  { code: "MYR", name: "Malaysian ringgit", country: "MY" },
  { code: "MXN", name: "Mexican peso", country: "MX" },
  { code: "MAD", name: "Moroccan dirham", country: "MA" },
  { code: "MZN", name: "Mozambican metical", country: "MZ" },
  { code: "NAD", name: "Namibian dollar", country: "NA" },
  { code: "NZD", name: "New Zealand dollar", country: "NZ" },
  { code: "NGN", name: "Nigerian naira", country: "NG" },
  { code: "NOK", name: "Norwegian krone", country: "NO" },
  { code: "PLN", name: "Polish zloty", country: "PL" },
  { code: "QAR", name: "Qatari riyal", country: "QA" },
  { code: "RWF", name: "Rwandan franc", country: "RW" },
  { code: "SAR", name: "Saudi riyal", country: "SA" },
  { code: "SGD", name: "Singapore dollar", country: "SG" },
  { code: "KRW", name: "South Korean won", country: "KR" },
  { code: "SEK", name: "Swedish krona", country: "SE" },
  { code: "CHF", name: "Swiss franc", country: "CH" },
  { code: "TZS", name: "Tanzanian shilling", country: "TZ" },
  { code: "THB", name: "Thai baht", country: "TH" },
  { code: "TRY", name: "Turkish lira", country: "TR" },
  { code: "UGX", name: "Ugandan shilling", country: "UG" },
];

/** Every code the rate feed is asked for. */
export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);

export const findCurrency = (code: string) => CURRENCIES.find((c) => c.code === code);

/** The flag file for a currency. Committed under /public/flags. */
export const flagSrc = (country: string) => `/flags/${country}.svg`;
