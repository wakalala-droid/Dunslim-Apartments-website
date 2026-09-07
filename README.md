# Dunslim Apartments website

Landing page through to checkout, built on the Dunslim brand guidelines
(Volume One, 2026) and the Elite Builder System design OS.

```bash
npm run dev     # http://localhost:3100
npm run build
```

---

## What is here

| Route | What it does |
|---|---|
| `/` | Landing page. Date search in the hero, book-direct promise, three residences, assurances, long-stay ladder, neighbourhood. |
| `/residences` | All three residences with a search bar. |
| `/residences/[slug]` | One residence: photos, description, amenities, booking rail. |
| `/rates` | Full rate card, long-stay ladder with a worked example, what is included, FAQ. |
| `/location` | Address, getting here, arrival, assurances. |
| `/book` | Four-step checkout: dates → residence → details → payment → confirmation. |

Navigation is **Residences · Rates · Location · Book**, which is what the brand
guidelines specify for the website header (p.16).

---

## Before this goes live

Everything that needs a real answer is marked `CONFIRM:` in
[`src/lib/content.ts`](src/lib/content.ts). That is the only file a
non-developer needs to touch. Search it for `CONFIRM` and you have the full list.

The important ones:

1. **Contact details.** Phone, WhatsApp number and a reservations email are all
   placeholders. `brand@dunslim-apartments.com` from the brand book is the
   artwork custodian, not a guest inbox.
2. **Rates.** Every rate is a placeholder taken from the Growth Proposal, which
   found the same unit advertised between $57 and $87 depending on the platform.
   One confirmed rate per unit replaces them.
3. **The residences.** Names, bedroom counts, sleeps, areas and amenities.
   They are called Residence One/Two/Three so they are safe to rename.
4. **The assurances.** Backup power, water, security, Wi-Fi speed. These are
   the four things that actually decide a booking in Lusaka. Every claim must be
   true of all three units before launch. State the real numbers: hours of
   backup, tank capacity, guarding hours, measured Mbps.
5. **Distances.** Every `minutes: 0` renders as "distance to confirm". The
   Growth Proposal records that current listings disagree with each other, so
   these need measuring once and using everywhere.
6. **Self check-in.** `arrival.selfCheckIn` is `false`. The FAQ and the location
   page both change wording when it flips to `true`. Do not flip it until it is
   genuinely in place.
7. **Photography.** Not shot yet (Phase 2 of the Growth Proposal). See below.

### Reviews

`reviews` in `content.ts` is deliberately an empty array. The Growth Proposal
(§2.2) records that no listing carries a calculated review score yet. Not
because reviews are bad, but because there are not enough verified bookings to
produce one. Nothing has been invented. Add entries only when they are real and
the guest has given permission.

### Photography: READ THIS BEFORE LAUNCH

**The photographs currently on the site are placeholders. They are stock
interiors, not Dunslim.** They are there so the design can be judged properly
and so the layout is built against real images rather than grey boxes.

They must be replaced with the commissioned shoot (Phase 2 of the Growth
Proposal) before the site goes public. Showing stock interiors as if they were
the apartments would be exactly the trust problem the Growth Proposal is trying
to fix.

Swapping them is a file copy. Every photo lives in `public/photos/` and is named
after the slot it fills:

```
hero.jpg           the homepage hero
exterior.jpg       the approach from the road
r1-living.jpg      Residence One, living room     (also its card + page hero)
r1-bedroom.jpg     Residence One, bedroom
r1-kitchen.jpg     Residence One, kitchen
r1-desk.jpg        Residence One, work desk
r2-*.jpg           Residence Two,  same four slots
r3-*.jpg           Residence Three, same four slots
detail-living.jpg  used on /residences and the long-stay section
detail-bath.jpg    used in the assurances section
```

Replace the file, keep the name, then regenerate the manifest so the dimensions
and blur previews match the new files:

```bash
python scripts/build-photo-manifest.py
```

The shot list for the photographer is exactly the file list above: sixteen
frames, landscape 4:3 except `hero` (16:9), `exterior` (16:10) and `detail-bath`
(portrait). Shoot in daylight, wide, no people.

---

## Brand compliance

Colour, type, grid and lockups come from
`Dunslim_Apartments_Brand_Guidelines_V1` and are encoded in
[`tailwind.config.ts`](tailwind.config.ts).

| Token | Hex | Use |
|---|---|---|
| Soft Brass | `#B28A4A` | The mark, rules, single moments of emphasis. **Never body text.** |
| Deep Navy | `#0F2234` | Ground colour. Hero, footer, primary buttons. |
| Warm Stone | `#E7E2D8` | Secondary ground, quiet panels. |
| Charcoal | `#2B2E34` | Body copy and captions. |
| White | `#FFFFFF` | Treated as a material, not an absence. |

**Type.** Söhne is the brand face. Inter is used because the guidelines name it
as the approved screen substitute (p.13). Weights map to the brand's:
200 Extraleicht (display), 300 Leicht, 400 Buch (body), 500 Kräftig (headings
and labels), 600 Halbfett.

**The type scale is sized for an eighty-year-old reader**, which is the actual
guest: diplomats, returning families, corporate visitors. The old 16px web
default and WCAG's 4.5:1 are floors, not targets.

| Role | Size | Weight |
|---|---|---|
| Label (caps) | 13px | 500 |
| Caption | 15px | 400 |
| Body | 18px / 1.65 | 400 |
| Lead | 21px | 400 |
| h3 | 25px | 300 |
| h2 | 34px | 200 to 300 |
| h1 | 36 to 46px (fluid) | 200 |
| Display | 44 to 84px (fluid) | 200 |

Two rules go with it and both matter more than the numbers:

1. **Nothing below 15px anywhere**, fine print included.
2. **Body copy is never set in a light weight.** Thin type defeats an older eye
   even when it passes contrast, so 200 and 300 are reserved for large display
   sizes. This is also what the brand book says: it specifies Buch (400) for
   body, so the earlier 300 was both hard to read and off-brand.

Body copy runs at 13.6:1 contrast and muted text at 6.9:1, both well past AA.
18px inputs also stop iOS zooming the page when a field is focused.

If you change the scale, re-run the responsive and contrast checks. Larger text
reflows layouts and pushes things off-screen (it broke the footer at 768px).

**Logo.** `public/brand/` holds each authorised lockup as vector, cropped from
the supplied master file (`Dunslim Monogram logo.ai`). Nothing was redrawn or
traced. Pre-flight check 01. Proportions are locked in `Logo.tsx` by aspect
ratio, measured off the master: horizontal 4.092:1, vertical 1:0.92, monogram
1:1.06. All three match the ratios printed in the brand book.

### Two things to raise with the brand custodian

1. **The logo artwork uses the trial cut of Söhne** (`TestSohneBreit-Buch` is
   embedded in the master file). The guidelines themselves flag this on p.13:
   the retail family must be licensed from Klim before commercial release.
2. **Brass cannot carry small text and meet accessibility law.** Soft Brass on
   white measures 3.17:1 and on Warm Stone 2.45:1, against the 4.5:1 that 12px
   text requires. This agrees with the brand's own rule that brass is never a
   body text colour. So section labels are set in Charcoal and the brass appears
   as the hairline rule beside them, the identity colour doing the job the
   brand book actually assigns it.

---

## Connecting AI-BOS

**The endpoints exist now.** They shipped in `aibos-api` on 2026-09-07 and the
site needs two environment variables and nothing else.

```
NEXT_PUBLIC_AIBOS_API_URL=https://your-api-host
NEXT_PUBLIC_AIBOS_SITE_TOKEN=the-token-from-the-dashboard
```

Get them from AI-BOS: **Hospitality -> Channels -> Your own website ->
Connect my website**. That card shows both values with a copy button beside
each. Set them in the Vercel project and redeploy: Next.js bakes
`NEXT_PUBLIC_*` into the build, so saving them without a redeploy changes
nothing and looks like the save failed.

`NEXT_PUBLIC_AIBOS_API_URL` is the API's own address, not the AI-BOS website's.
The website's `/api/proxy` attaches the signed-in owner's session, and this site
has none.

The three endpoints, all token-scoped and unauthenticated by design:

```
GET  /public/stay/{site_token}/units
GET  /public/stay/{site_token}/availability?unit_slug=&from=&to=
POST /public/stay/{site_token}/booking-request
```

**`unit_slug` is the residence slug this site already uses** (`mandela`,
`mulima`, `kaunda`). Set each one in AI-BOS under Hospitality -> Units -> "Web
address on your own site". Leave it blank there and the unit's name is turned
into a handle instead, so check the two agree before going live: a slug that
does not match returns "That residence does not exist."

A booking request lands as `pending`, which is already a blocking status in the
double-booking guard, so the request holds the dates by itself. **It posts no
revenue.** The owner confirms in the dashboard and that is what puts the stay in
the books. The confirmation screen here still says a person will confirm,
because that is still true.

If the token is wrong or the API is asleep, availability comes back as
`unknown`, not `available`: a guest is never told a date is free when nobody
checked, and never blocked because the far end blipped.

To take the site off AI-BOS, rotate or clear the token in the same card. The
site falls back to the email path on its own.

### Check it worked

```
npm run check:aibos
```

It asks the API the same questions this site asks, in order, and names the step
that is wrong: no token, the wrong address, a token that matches nothing, a
property with no units, a residence here with no unit behind it. It reads
`.env.local` then the real environment, so it works locally and in a deploy log,
and it only ever reads. No booking is ever sent.

The check that matters most is the last one. A slug that does not match is the
only failure with no visible symptom: the site deploys, looks perfect, and that
one residence quietly answers "we could not check those dates" forever.

---

## Rules this site is built to

From the Elite Builder System and enforced rather than aspired to:

- **No drip pricing.** The total is visible from step one of checkout and does
  not change at the end. No booking fee, no cleaning fee, no service charge.
- **No fake urgency.** No countdown timers, no "3 people are viewing this".
- **No pre-selected add-ons.**
- **Card details are never collected on this site.** Choosing card hands off to
  the payment provider's own hosted page.
- **WCAG 2.1 AA.** Verified: zero contrast failures on every page, 44px minimum
  tap targets, one `h1` per page with no skipped levels, visible focus states,
  every input with a persistent visible label, full keyboard operation.
- **No page-level horizontal scroll** at 375, 768, 1024 or 1440px.
- **Motion explains, never decorates.** Entrances only, 240ms ease-out, with a
  `prefers-reduced-motion` fallback. No parallax, no autoplay loops.

---

## Payments

Research points to **DPO Pay** as the one gateway covering Visa/Mastercard, MTN
Mobile Money and Airtel Money in a single checkout, settling ZMW to a Zambian
bank while still able to price in USD. Mobile money needs a Zambian SIM, so it
serves local guests; international guests need card. The checkout offers both,
plus bank transfer and pay-on-arrival.

Rates are quoted in USD with an approximate ZMW display. The conversion rate
lives in `content.ts` as `zmwPerUsd` and is labelled as approximate wherever it
appears, because it is a stored rate rather than a live one.
