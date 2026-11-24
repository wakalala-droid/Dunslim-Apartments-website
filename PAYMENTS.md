# Taking money

Two stages. The first is live: a guest can pay the minute they book, by sending
money to your accounts. The second is built and switches on when you add your
Lenco keys in AI-BOS: the guest pays online and the booking confirms itself.

## Stage one: a guest can pay the moment they book (LIVE since 12 Sept 2026)

The booking flow now ends on a **Pay now** panel: the total, the guest's own
reference, your accounts with a copy button on each, and a WhatsApp button that
sends you proof with the reference already written in it. The same panel is at
**/pay**, which is the link to send anyone who booked over the phone.

### What is live now

| | |
|---|---|
| Bank | Access Bank Zambia, formerly Atlas Mara, branch 001 Lusaka Corporate |
| Account name | Dunslim Apartments |
| Kwacha account | 0016170469013 |
| US dollar account | 0016170469024 |
| MTN Mobile Money | +260 76 760 0735 |
| Airtel Money | +260 77 870 7540 |
| Terms | Full amount up front |

Cards came out of the booking form and out of the FAQ at the same time, because
nothing could take one then. Stage two brings them back through Lenco once your
keys are in. Pay on arrival came out too, because it contradicted "full amount
up front" on the same screen. Say the word and it goes back.

### Four things still to confirm

1. **The registered name on each mobile money wallet.** The panel currently
   tells a guest to check the name on their screen before confirming, but it
   cannot say what name to expect. That line is the cheapest fraud check the
   site has, so it is worth the two minutes.
2. **Which network each number is really on.** MTN and Airtel are read off the
   Zambian prefixes, 076 and 077. A ported number would make the labels wrong.
3. **The swift code** for the dollar account, for guests paying from abroad.
4. **The exact registered account name**, if the bank holds anything other than
   plain "Dunslim Apartments".

### Where the numbers live

`src/lib/content.ts`, the `payments` block. Nothing else changes:

```ts
export const payments = {
  mobileMoney: [
    { network: "MTN Mobile Money", number: business.phoneAlt },
    { network: "Airtel Money",     number: business.phone },
  ] as MobileMoneyAccount[],

  bank: {
    bankName: "Access Bank Zambia, formerly Atlas Mara",
    branch: "001, Lusaka Corporate",
    accountName: business.name,
    accounts: [
      { currency: "ZMW", label: "Kwacha account",    number: "0016170469013" },
      { currency: "USD", label: "US dollar account", number: "0016170469024" },
    ] as BankAccount[],
    swift: "",
  },

  fullAmountUpFront: true,
};
```

Add `accountName: "..."` to a mobile money entry and the panel starts naming
it. Commit, push, and it is live on the next deploy.

## Stage two: pay online and the booking confirms itself (built 24 Nov 2026, waiting on your Lenco keys)

The guest sends the booking form and pays on the very next screen, into
Dunslim's own Lenco account. Paying the full price confirms the booking in
AI-BOS and puts the money in the books. Nobody sends a screenshot and nobody
matches a payment by hand.

| Way to pay | What the guest does | Confirms by itself |
|---|---|---|
| Mobile money | Picks Airtel, MTN or Zamtel, a prompt comes up on their phone, they approve it with their PIN | Yes |
| Bank card | Visa or Mastercard from any bank, typed into Lenco's own secure window | Yes |
| Bank transfer | Sends money to the Access Bank accounts above with their reference | No, you match it as before |

**"Bank accounts" means bank cards.** Lenco in Zambia takes money from a bank
as a card payment, so any bank's Visa or Mastercard works. A plain bank
transfer cannot be matched to a booking automatically, so it stays the manual
fallback it is today.

### Until you add the keys, nothing changes

The booking form asks AI-BOS which ways to pay are live before it offers them.
Until your Lenco account is connected it offers exactly what it does today and
the confirmation screen shows the Stage one panel. A guest is never shown a way
to pay that cannot happen, and AI-BOS never pretends a payment into your own
Lenco account went through: there is no simulated "Paid".

### What you do, in this order

1. **Run migration 0049** in Supabase: `aibos/supabase/migrations/0049_card_payments.sql`.
   It adds one column for the card key. Mobile money works without it; cards
   do not.
2. **Get two keys from your Lenco dashboard**: the API key (the secret one) and
   the public key. Start with the sandbox (test) keys.
3. **Paste them in AI-BOS, Business profile, "Get paid online"**:
   - the API key under **Lenco API key**, then **Connect Lenco**
   - the public key under **Bank cards**, then **Switch on cards**
   AI-BOS checks the API key with Lenco before it keeps it, locks it away and
   never shows it again. It refuses the secret key if you paste it in the
   public key box.
4. **Set the webhook in the Lenco dashboard** to
   `https://aibos-api-37v9.onrender.com/payments/lenco/webhook`.
   This is how Lenco tells AI-BOS the money landed, even if the guest closes
   the page. AI-BOS also checks by itself, so a missed webhook only slows
   things down.
5. **Test it end to end with the sandbox keys.** The pay panel says "Test mode:
   no real money moves". Book a far-off date on the site and pay with Lenco's
   test details:
   - Airtel success: `0971111111`
   - MTN success: `0961111111`
   - Card: Visa `4622 9431 2701 3705`, CVV `838`, any future expiry
   The booking should turn **confirmed** in AI-BOS on its own, with the payment
   in the books. Then cancel the test booking so the dates come free.
6. **Swap in the live keys** the same way (Business profile, "Use a different
   key"; then the new public key under Bank cards). The "Test mode" line
   disappears from the pay panel, and from then on the money is real.
7. **Then tell Claude to put cards back in the FAQ** ("How do I pay?") and in
   the search listing (`paymentAccepted` in `src/components/seo/StructuredData.tsx`).
   Both still say "no cards" on purpose, because until step 6 that is true.

No new settings on Vercel: the site uses the two it already has,
`NEXT_PUBLIC_AIBOS_API_URL` and `NEXT_PUBLIC_AIBOS_SITE_TOKEN`.

### What happens behind the screen

- The booking form lands in AI-BOS as a **pending** request, which holds the
  dates, and AI-BOS hands back a private payment link for it.
- The pay panel asks AI-BOS what the booking owes. The amount is always
  AI-BOS's, read from the booking, never the browser's.
- For a card, AI-BOS trusts only the amount and currency Lenco says arrived.
  If someone tampers with the page and pays less, the booking does **not**
  confirm and you get a notification to sort it out.
- Paid in full: the booking confirms, the sale and the payment go in the books,
  the guest gets the confirmation email (when guest emails are set up) and you
  get a "New booking paid and confirmed" notification.
- Paid short, paid in the wrong currency, or the dates were taken while the
  guest was paying: the money is in your Lenco account, the booking is not
  confirmed, and you are told straight away so you can sort it out with the
  guest. The guest is told someone will be in touch.
- A card window someone opened and walked away from is closed off after two
  hours.

### Where the code lives

| Piece | File |
|---|---|
| Pay panel on the confirmation screen | `src/components/booking/PayOnline.tsx` |
| Talking to AI-BOS and opening Lenco's window | `src/lib/payOnline.ts` |
| Which ways to pay the form offers | `src/components/booking/BookingFlow.tsx` (`paymentMethods`) |
| Lenco allowed in the browser's security policy | `next.config.mjs` (`LENCO`) |
| The payment routes | `aibos-api/main.py`, `/pay/stay/{token}` and `/public/stay/{site_token}/payments` |
| Confirming the booking when paid | `aibos-api/hospitality.py` (`record_link_payment`) |

If a test card payment ever stalls inside the card window, open the browser
console and look for a "Content Security Policy" message: it names the address
Lenco needed, and that address goes into `LENCO` in `next.config.mjs`.

### The availability 404 was mine, not the server's

Recorded here because the wrong version of it was in this file for a day.

The live API is fine and always was. `/public/stay/{token}/units` returned
`{"detail":"Not Found"}` for one reason: the token on the machine doing the
asking was an empty string, so the request went to `/public/stay//units`, which
matches no route at all. FastAPI's default 404 looks identical to a real one
and says nothing about why.

**The tell is in the body.** A route that does not exist answers
`{"detail":"Not Found"}`. A token that does not resolve answers
`{"detail":"Unknown site."}` from the handler. Probe with a deliberately
nonsense token before concluding anything: if that returns "Unknown site." the
API, the database and the hospitality tables are all healthy and the problem is
on this side.

Production was never affected: both variables have been set on Vercel since
8 September and the token is baked into the deployed bundle. Verified on
12 September, against the real calendar: Mandela for 23 to 25 September comes
back "Those dates are already taken", November comes back free, and the booking
POST accepts the token and validates the unit.
