# Taking money

Two stages. The first is live and needs four numbers from you. The second needs
a merchant account and cannot be finished from a keyboard.

## Stage one: a guest can pay the moment they book (LIVE, waiting on you)

The booking flow now ends on a **Pay now** panel: the total, the guest's own
reference, your accounts with a copy button on each, and a WhatsApp button that
sends you proof with the reference already written in it. The same panel is at
**/pay**, which is the link to send anyone who booked over the phone.

**It shows nothing at all until the accounts are filled in.** Until then the
site keeps its old wording, which is that we send instructions when we confirm.
That is deliberate: a wrong mobile money number is a guest's money gone to a
stranger, with your name on the receipt.

### What to send

1. MTN Mobile Money number, and the **exact registered name** on it.
2. Airtel Money number, and the exact registered name on it.
3. Bank: bank name, branch, account name, account number, and the swift code
   for guests paying from abroad.
4. Whether the **full amount** is wanted before arrival, or a deposit holds the
   dates. If a deposit, what percentage.

### Where it goes

`src/lib/content.ts`, the `payments` block. Nothing else changes:

```ts
export const payments = {
  mobileMoney: [
    { network: "MTN Mobile Money", number: "+260 76 ...", accountName: "..." },
    { network: "Airtel Money",     number: "+260 77 ...", accountName: "..." },
  ] as MobileMoneyAccount[],

  bank: {
    bankName: "...",
    branch: "...",
    accountName: "...",
    accountNumber: "...",
    swift: "...",
  },

  depositPct: 0,
};
```

Commit, push, and it is live on the next deploy. The registered name matters:
the panel tells the guest what name should come up before they confirm, and to
stop if it says anything else. That one line is the cheapest fraud protection
this site has.

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

### Also broken, and blocking more than payments

`GET /public/stay/{site_token}/units` returns **404** on the live API with the
token this site holds. The hospitality connection did not survive the September
outage, which is why every date check falls back to "we could not check those
dates". Availability, the double-booking guard and stage two all sit behind
fixing that.
