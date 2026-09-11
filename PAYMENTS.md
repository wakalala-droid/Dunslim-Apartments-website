# Taking money

Two stages. The first is live: a guest can pay the minute they book. The second
needs a merchant account and cannot be finished from a keyboard.

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

Cards came out of the booking form and out of the FAQ at the same time: nothing
on this site or behind it can take one. Pay on arrival came out too, because it
contradicted "full amount up front" on the same screen. Say the word and either
goes back.

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

## Stage two: the prompt on the guest's phone (needs a merchant account)

The guest types their number, their phone rings with an MTN or Airtel prompt,
they enter their PIN, the site marks the booking paid. Nobody sends a
screenshot and nobody matches payments by hand.

**The code is already written.** `aibos-api/payments.py` speaks MTN MoMo
Collections and Airtel Money Collections, and `main.py` already serves a payment
loop at `/pay/{token}`, `/pay/{token}/initiate` and `/pay/{token}/status/{ref}`.

**What is missing is the merchant credentials, and only you can get them.**
Checked on 12 September 2026, the live API reports:

```
GET https://aibos-api-37v9.onrender.com/payments/config
{"networks":{"mtn":false,"airtel":false},"mode":"simulation"}
```

Simulation means an unconfigured payment resolves to "successful" without any
money moving. **That is why the automated option is not on this site.** A guest
seeing "Paid" having paid nothing is worse than no automation at all.

### The order of work

1. **You**: apply for MTN MoMo Collections (MTN Zambia business banking) and
   Airtel Money Collections (Airtel Zambia merchant services). Both want a
   registered business, a TPIN and the tourism licence, all of which exist.
2. **You**: put the credentials on the AI-BOS API as environment variables:
   `MTN_MOMO_SUBSCRIPTION_KEY`, `MTN_MOMO_API_USER`, `MTN_MOMO_API_KEY`,
   `MTN_MOMO_TARGET_ENV=production`, `MTN_MOMO_BASE_URL`, plus
   `AIRTEL_CLIENT_ID`, `AIRTEL_CLIENT_SECRET`, `AIRTEL_BASE_URL`.
   `/payments/config` must then report `"mode":"live"`.
3. **Then, and only then**, this site gets a public endpoint pair on the AI-BOS
   side (`/public/stay/{site_token}/payment/initiate` and `.../status/{ref}`,
   mirroring the token pattern the availability routes already use), and a panel
   on the confirmation screen that asks for the payer's number and polls.
   It must refuse to render unless the upstream reports live mode, so the
   simulation can never reach a guest.

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
