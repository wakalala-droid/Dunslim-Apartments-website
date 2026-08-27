"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, CreditCard, Smartphone, Landmark, Banknote } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Container } from "@/components/ui/Layout";
import Summary from "./Summary";
import { residences, getResidence, arrival, business, rates } from "@/lib/content";
import { quote as buildQuote, nightsBetween, directNightly } from "@/lib/pricing";
import { money, isoToday, isoPlusDays, prettyDate, type Currency } from "@/lib/format";
import {
  checkAvailability,
  submitBookingRequest,
  type PaymentMethod,
} from "@/lib/availability";
import { cn } from "@/lib/cn";

/**
 * CHECKOUT
 * ---------------------------------------------------------------------------
 * Four steps: dates → residence → details → payment, then a confirmation.
 *
 * Design rules this flow is held to:
 *  - the full price is visible from step one and never changes at the end
 *  - no countdown timers, no "3 people are viewing", no pre-selected add-ons
 *    (all explicitly banned by conversion_psychology.md)
 *  - every field has a visible label, errors appear inline in words
 *  - the guest can always go back without losing what they entered
 *
 * Card details are never collected on this page. Choosing "card" hands off to
 * the payment provider's own hosted page, which is both the correct architecture
 * and the only way to stay out of PCI scope.
 */

const STEPS = ["Dates", "Residence", "Details", "Payment"] as const;
type StepIndex = 0 | 1 | 2 | 3;

const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  detail: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "card",
    label: "Card",
    detail: "Visa or Mastercard. You are taken to our payment provider's secure page to pay.",
    icon: CreditCard,
  },
  {
    id: "mobile-money",
    label: "Mobile money",
    detail: "MTN Mobile Money or Airtel Money. You approve the payment on your phone.",
    icon: Smartphone,
  },
  {
    id: "bank-transfer",
    label: "Bank transfer",
    detail: "We send account details and hold your dates for 24 hours.",
    icon: Landmark,
  },
  {
    id: "on-arrival",
    label: "Pay on arrival",
    detail: "Settle when you check in. We confirm your booking by WhatsApp first.",
    icon: Banknote,
  },
];

export default function BookingFlow() {
  const params = useSearchParams();

  // ---- state -------------------------------------------------------------
  const [step, setStep] = useState<StepIndex>(0);
  const [currency, setCurrency] = useState<Currency>("USD");

  const [from, setFrom] = useState(params.get("from") ?? "");
  const [to, setTo] = useState(params.get("to") ?? "");
  const [guests, setGuests] = useState(Number(params.get("guests") ?? 1));
  const [slug, setSlug] = useState(params.get("residence") ?? "");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [purpose, setPurpose] = useState<"" | "business" | "leisure" | "relocation" | "other">("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availability, setAvailability] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);

  // If a residence arrived in the URL but dates did not, start on step 1.
  useEffect(() => {
    if (slug && from && to) setStep(2);
    else if (from && to) setStep(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Move focus to the step heading on change, so keyboard and screen-reader
  // users are not left at the bottom of the previous step.
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const residence = useMemo(() => (slug ? getResidence(slug) ?? null : null), [slug]);
  const nights = nightsBetween(from, to);
  const quote = useMemo(
    () => (residence ? buildQuote(residence, from, to) : null),
    [residence, from, to],
  );

  /** Residences that can actually hold this party. */
  const suitable = useMemo(() => residences.filter((r) => r.sleeps >= guests), [guests]);

  // ---- validation --------------------------------------------------------
  const validate = (s: StepIndex): boolean => {
    const e: Record<string, string> = {};

    if (s === 0) {
      if (!from) e.from = "Choose your arrival date.";
      if (!to) e.to = "Choose your departure date.";
      if (from && to && to <= from) e.to = "Departure must be after arrival.";
    }

    if (s === 1 && !slug) e.residence = "Choose a residence to continue.";

    if (s === 2) {
      if (!firstName.trim()) e.firstName = "Tell us your first name.";
      if (!lastName.trim()) e.lastName = "Tell us your last name.";
      if (!email.trim()) e.email = "We need an email to send your confirmation.";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "That email does not look right.";
      if (!phone.trim()) e.phone = "A phone number, so we can reach you on arrival day.";
    }

    if (s === 3 && !payment) e.payment = "Choose how you would like to pay.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate(step)) return;

    // Confirm the dates are actually free before asking for personal details.
    if (step === 1 && slug) {
      const res = await checkAvailability(slug, from, to);
      if (res.status === "unavailable") {
        setAvailability(res.reason);
        return;
      }
      setAvailability("");
    }

    setStep((s) => Math.min(s + 1, 3) as StepIndex);
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0) as StepIndex);
  };

  const submit = async () => {
    if (!validate(3) || !residence || !quote) return;
    setSubmitting(true);
    const outcome = await submitBookingRequest({
      slug,
      from,
      to,
      guests,
      firstName,
      lastName,
      email,
      phone,
      organisation,
      purpose,
      arrivalTime,
      notes,
      payment,
      totalUsd: quote.totalUsd,
    });
    setReference(outcome.reference);
    setSubmitting(false);
  };

  // ---- confirmation ------------------------------------------------------
  if (reference && residence && quote) {
    return (
      <Container wide>
        <div className="mx-auto max-w-[720px] py-16 md:py-24">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy">
            <Check size={22} strokeWidth={2} className="text-white" aria-hidden />
          </div>

          <h1 className="mt-8 text-h1 font-extralight text-navy">
            Thank you, {firstName}. We have your request.
          </h1>

          <p className="mt-6 max-w-measure text-lead text-charcoal">
            Your dates are held. Someone will confirm your booking and send payment instructions
            within a few hours — sooner during the day.
          </p>

          <dl className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
            {[
              ["Reference", reference],
              ["Residence", residence.name],
              ["Arrive", `${prettyDate(from)}, from ${arrival.checkIn}`],
              ["Depart", `${prettyDate(to)}, by ${arrival.lateCheckOut}`],
              ["Total", money(quote.totalUsd, currency)],
              ["Paying by", PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? "—"],
              ["Confirmation to", email],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-4">
                <dt className="text-body text-charcoal-60">{k}</dt>
                <dd className="text-right text-body text-charcoal">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-md bg-stone p-6">
            <p className="text-body text-charcoal">
              Quote reference <span className="text-navy">{reference}</span> if you message us. The
              fastest way to reach a person is WhatsApp.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                  `Hello, I have just requested a booking. Reference ${reference}.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center rounded-md bg-navy px-6 text-[15px] font-medium text-white transition-colors duration-micro hover:bg-navy-80"
              >
                Message us on WhatsApp
              </a>
              <Link
                href="/"
                className="inline-flex min-h-[44px] items-center rounded-md border border-navy/20 bg-white px-6 text-[15px] font-medium text-navy transition-colors duration-micro hover:border-navy/50"
              >
                Back to the site
              </Link>
            </div>
          </div>

          <p className="mt-8 text-caption text-charcoal-80">
            Nothing has been charged. You can cancel free of charge up to{" "}
            {arrival.cancellationHours} hours before arrival.
          </p>
        </div>
      </Container>
    );
  }

  // ---- flow --------------------------------------------------------------
  return (
    <Container wide>
      <div className="py-12 md:py-16">
        {/* Progress. A list, so it reads correctly aloud. */}
        <nav aria-label="Booking progress">
          <ol className="flex flex-wrap gap-x-6 gap-y-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[11px]",
                    // Navy on brass measures 5.1:1; white on brass only 3.3:1.
                    i < step && "bg-brass text-navy",
                    i === step && "bg-navy text-white",
                    i > step && "border border-navy/20 text-charcoal-60",
                  )}
                >
                  {i < step ? <Check size={12} strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "label-caps",
                    i === step ? "text-navy" : "text-charcoal-60",
                  )}
                >
                  {label}
                  {i === step ? <span className="sr-only"> (current step)</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="label-caps mb-8 inline-flex min-h-[44px] items-center gap-2 text-charcoal-60 hover:text-navy"
              >
                <ArrowLeft size={14} strokeWidth={2} aria-hidden />
                Back
              </button>
            ) : null}

            {/* ---------------- STEP 0 — DATES ---------------- */}
            {step === 0 ? (
              <section>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-h1 font-extralight text-navy outline-none"
                >
                  When are you here?
                </h1>
                <p className="mt-6 max-w-measure text-lead text-charcoal">
                  Check in from {arrival.checkIn}, check out by {arrival.lateCheckOut}. Rates step
                  down at {rates.longStay[0].minNights} nights.
                </p>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                  <Field label="Arrival" htmlFor="from" required error={errors.from}>
                    <Input
                      id="from"
                      type="date"
                      min={isoToday()}
                      value={from}
                      onChange={(e) => {
                        setFrom(e.target.value);
                        if (to && to <= e.target.value) setTo(isoPlusDays(e.target.value, 1));
                      }}
                    />
                  </Field>

                  <Field label="Departure" htmlFor="to" required error={errors.to}>
                    <Input
                      id="to"
                      type="date"
                      min={from ? isoPlusDays(from, 1) : isoPlusDays(isoToday(), 1)}
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </Field>

                  <Field label="Guests" htmlFor="guests">
                    <Select
                      id="guests"
                      value={guests}
                      onChange={(e) => {
                        const g = Number(e.target.value);
                        setGuests(g);
                        // Drop a residence that can no longer hold the party.
                        const r = getResidence(slug);
                        if (r && r.sleeps < g) setSlug("");
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "guest" : "guests"}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>

                {nights > 0 ? (
                  <p className="mt-6 text-caption text-charcoal-80">
                    {nights} {nights === 1 ? "night" : "nights"}
                    {nights >= rates.longStay[0].minNights
                      ? " — the long-stay rate applies."
                      : null}
                  </p>
                ) : null}

                <Button onClick={next} size="lg" className="mt-12 w-full sm:w-auto">
                  Choose a residence
                </Button>
              </section>
            ) : null}

            {/* ---------------- STEP 1 — RESIDENCE ---------------- */}
            {step === 1 ? (
              <section>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-h1 font-extralight text-navy outline-none"
                >
                  Which residence?
                </h1>
                <p className="mt-6 max-w-measure text-lead text-charcoal">
                  Showing what fits {guests === 1 ? "one guest" : `${guests} guests`} for{" "}
                  {nights} {nights === 1 ? "night" : "nights"}.
                </p>

                <fieldset className="mt-12">
                  <legend className="sr-only">Choose a residence</legend>
                  <div className="space-y-4">
                    {suitable.map((r) => {
                      const q = buildQuote(r, from, to);
                      const selected = slug === r.slug;
                      return (
                        <label
                          key={r.slug}
                          className={cn(
                            "flex cursor-pointer items-start gap-4 rounded-md border p-6 transition-colors duration-micro",
                            selected
                              ? "border-navy bg-stone-40"
                              : "border-navy/20 bg-white hover:border-navy/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="residence"
                            value={r.slug}
                            checked={selected}
                            onChange={() => {
                              setSlug(r.slug);
                              setAvailability("");
                            }}
                            className="mt-1 h-4 w-4 shrink-0 accent-navy"
                          />
                          <span className="flex-1">
                            <span className="flex flex-wrap items-baseline justify-between gap-2">
                              <span className="text-h3 font-light text-navy">{r.name}</span>
                              <span className="text-h3 font-light text-navy">
                                {q ? money(q.totalUsd, currency) : money(directNightly(r), currency)}
                              </span>
                            </span>
                            <span className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                              <span className="text-caption text-charcoal-80">
                                {r.bedrooms} {r.bedrooms === 1 ? "bedroom" : "bedrooms"} · sleeps{" "}
                                {r.sleeps}
                              </span>
                              <span className="text-caption text-charcoal-80">
                                {q ? `${money(q.perNightUsd, currency)} a night, all in` : null}
                              </span>
                            </span>
                            <span className="mt-3 block max-w-measure text-body text-charcoal">
                              {r.summary}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {suitable.length === 0 ? (
                  <p className="mt-6 rounded-md bg-stone p-6 text-body text-charcoal">
                    Nothing here sleeps {guests}. Go back a step and reduce the party, or message us
                    — two residences side by side may work.
                  </p>
                ) : null}

                {errors.residence ? (
                  <p role="alert" className="mt-6 text-caption font-medium text-danger">
                    {errors.residence}
                  </p>
                ) : null}

                {availability ? (
                  <p role="alert" className="mt-6 rounded-md bg-stone p-6 text-body text-charcoal">
                    {availability} Try different dates, or message us on WhatsApp and we will find
                    something.
                  </p>
                ) : null}

                <Button onClick={next} size="lg" className="mt-12 w-full sm:w-auto">
                  Continue
                </Button>
              </section>
            ) : null}

            {/* ---------------- STEP 2 — DETAILS ---------------- */}
            {step === 2 ? (
              <section>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-h1 font-extralight text-navy outline-none"
                >
                  Who is staying?
                </h1>
                <p className="mt-6 max-w-measure text-lead text-charcoal">
                  Only what we need to hold the apartment and meet you on arrival.
                </p>

                <div className="mt-12 grid gap-6 sm:grid-cols-2">
                  <Field label="First name" htmlFor="firstName" required error={errors.firstName}>
                    <Input
                      id="firstName"
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </Field>

                  <Field label="Last name" htmlFor="lastName" required error={errors.lastName}>
                    <Input
                      id="lastName"
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </Field>

                  <Field label="Email" htmlFor="email" required error={errors.email}>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Phone"
                    htmlFor="phone"
                    required
                    error={errors.phone}
                    hint="Include the country code. We use WhatsApp where we can."
                  >
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="+260"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>

                  <Field
                    label="Organisation"
                    htmlFor="organisation"
                    hint="If your employer is paying, or you need an invoice."
                  >
                    <Input
                      id="organisation"
                      autoComplete="organization"
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                    />
                  </Field>

                  <Field label="Reason for the stay" htmlFor="purpose">
                    <Select
                      id="purpose"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value as typeof purpose)}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="business">Business</option>
                      <option value="relocation">Relocating</option>
                      <option value="leisure">Leisure</option>
                      <option value="other">Something else</option>
                    </Select>
                  </Field>

                  <Field
                    label="Arrival time"
                    htmlFor="arrivalTime"
                    hint="Flight number is fine too. A late landing is normal here."
                    className="sm:col-span-2"
                  >
                    <Input
                      id="arrivalTime"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      placeholder="e.g. 23:40, or flight KQ 794"
                    />
                  </Field>

                  <Field label="Anything we should know" htmlFor="notes" className="sm:col-span-2">
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="A cot, an early check-in, a quiet room for calls."
                    />
                  </Field>
                </div>

                <Button onClick={next} size="lg" className="mt-12 w-full sm:w-auto">
                  Continue to payment
                </Button>
              </section>
            ) : null}

            {/* ---------------- STEP 3 — PAYMENT ---------------- */}
            {step === 3 ? (
              <section>
                <h1
                  ref={headingRef}
                  tabIndex={-1}
                  className="text-h1 font-extralight text-navy outline-none"
                >
                  How would you like to pay?
                </h1>
                <p className="mt-6 max-w-measure text-lead text-charcoal">
                  Nothing is charged now. We confirm your booking first, then send instructions for
                  the method you choose.
                </p>

                <fieldset className="mt-12">
                  <legend className="sr-only">Payment method</legend>
                  <div className="space-y-4">
                    {PAYMENT_METHODS.map((m) => {
                      const selected = payment === m.id;
                      return (
                        <label
                          key={m.id}
                          className={cn(
                            "flex cursor-pointer items-start gap-4 rounded-md border p-6 transition-colors duration-micro",
                            selected
                              ? "border-navy bg-stone-40"
                              : "border-navy/20 bg-white hover:border-navy/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={m.id ?? ""}
                            checked={selected}
                            onChange={() => setPayment(m.id)}
                            className="mt-1 h-4 w-4 shrink-0 accent-navy"
                          />
                          <m.icon
                            size={20}
                            strokeWidth={1.5}
                            className="mt-px shrink-0 text-brass"
                            aria-hidden
                          />
                          <span className="flex-1">
                            <span className="block text-body text-navy">{m.label}</span>
                            <span className="mt-1 block max-w-measure text-caption text-charcoal-80">
                              {m.detail}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {errors.payment ? (
                  <p role="alert" className="mt-6 text-caption font-medium text-danger">
                    {errors.payment}
                  </p>
                ) : null}

                <p className="mt-8 max-w-measure text-caption text-charcoal-80">
                  We never ask for card details on this site. If you choose card, payment happens on
                  the provider&rsquo;s own secure page.
                </p>

                <Button
                  onClick={submit}
                  size="lg"
                  disabled={submitting}
                  className="mt-12 w-full sm:w-auto"
                >
                  {submitting ? "Sending your request…" : "Request this booking"}
                </Button>

                <p className="mt-4 text-caption text-charcoal-80">
                  Free cancellation up to {arrival.cancellationHours} hours before arrival.
                </p>
              </section>
            ) : null}
          </div>

          {/* Price panel — visible at every step, on every screen size. */}
          <div className="lg:col-span-5">
            <Summary
              residence={residence}
              quote={quote}
              from={from}
              to={to}
              guests={guests}
              currency={currency}
              onCurrencyChange={setCurrency}
              className="lg:sticky lg:top-24"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
