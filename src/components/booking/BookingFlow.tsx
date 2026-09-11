"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  AlertTriangle,
  CalendarX,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { Container } from "@/components/ui/Layout";
import { Honeypot } from "@/components/ui/Honeypot";
import Summary from "./Summary";
import { residences, getResidence, arrival, business, rates, maxGuests } from "@/lib/content";
import { quote as buildQuote, nightsBetween, directNightly } from "@/lib/pricing";
import { money, isoToday, isoPlusDays, prettyDate, isValidIsoDate } from "@/lib/format";
import { photo } from "@/lib/photos";
import {
  checkAvailability,
  submitBookingRequest,
  makeReference,
  type BookingOutcome,
  type PaymentMethod,
} from "@/lib/availability";
import { cn } from "@/lib/cn";
import { track, BOOKING_STEP } from "@/lib/analytics";

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

/**
 * WHAT ARRIVES IN THE ADDRESS BAR, AND WHY NONE OF IT IS TRUSTED.
 *
 * This page reads the dates, the party size and the apartment out of the URL,
 * because the homepage search sends a guest here with them attached. It used to
 * take all four values as given and every one of them could break the page:
 *
 *   ?from=banana   the departure field works out its earliest allowed date by
 *                  adding a day to the arrival date. Adding a day to a word
 *                  raises a RangeError during render, which nothing catches, so
 *                  React unmounted the entire page. In production a guest saw
 *                  one grey line: "Application error: a client-side exception
 *                  has occurred". On the page that takes the money.
 *   ?guests=abc    rendered "Showing what fits NaN guests" over an empty list,
 *                  then "Nothing here sleeps NaN", with no way forward.
 *   ?from=2020-01-01  priced a four-night stay in January 2020, all the way to
 *                  the confirmation screen.
 *   ?residence=x   left the flow on step two with nothing selectable.
 *
 * A malformed value is now simply dropped and the guest starts a step earlier,
 * which is the worst thing that should ever happen to a mistyped link. The date
 * helpers in lib/format.ts were made throw-proof at the same time, so this is a
 * belt as well as braces.
 */
function readSearch(params: ReadonlyURLSearchParams) {
  const today = isoToday();

  const rawFrom = params.get("from") ?? "";
  const rawTo = params.get("to") ?? "";

  // A real calendar day and not one that has already gone.
  const from = isValidIsoDate(rawFrom) && rawFrom >= today ? rawFrom : "";
  // A real calendar day and after the arrival if there is one.
  const to = isValidIsoDate(rawTo) && (!from || rawTo > from) ? rawTo : "";

  const n = Number(params.get("guests"));
  const guests = Number.isInteger(n) && n >= 1 && n <= maxGuests ? n : 1;

  const rawSlug = params.get("residence") ?? "";
  const candidate = getResidence(rawSlug);
  // An apartment that exists and one that can actually hold this party.
  const slug = candidate && candidate.sleeps >= guests ? rawSlug : "";

  return { from, to, guests, slug };
}

/** The order errors are reported in, which is the order the fields are in. */
const ERROR_ORDER = ["from", "to", "residence", "firstName", "lastName", "email", "phone", "payment"];

/**
 * How a guest would like to pay.
 *
 * THE DESCRIPTIONS NOW SAY WHAT ACTUALLY HAPPENS.
 *
 * They did not. Card promised that the guest would be taken to a payment
 * provider's secure page. Bank transfer promised that we hold their dates for
 * twenty-four hours. Pay on arrival promised a WhatsApp confirmation first.
 * Mobile money promised a prompt on their phone. None of it is built: every one
 * of the four ends in the same email to the reservations inbox and nothing
 * anywhere holds a date.
 *
 * The confirmation screen after this step is scrupulously honest about that. The
 * step itself was not and it is the last thing a guest reads before pressing
 * the button. So each description now says the true thing, which is that we
 * confirm first and then send instructions for whichever method they picked.
 * Put the promises back one at a time, as each becomes real.
 */
const PAYMENT_METHODS: {
  id: PaymentMethod;
  label: string;
  detail: string;
  icon: typeof CreditCard;
}[] = [
  {
    id: "card",
    label: "Card",
    detail: "Visa or Mastercard. We send you a secure payment link once your dates are confirmed. Card details are never entered on this site.",
    icon: CreditCard,
  },
  {
    id: "mobile-money",
    label: "Mobile money",
    detail: "MTN Mobile Money or Airtel Money. We send the number to pay to once your dates are confirmed.",
    icon: Smartphone,
  },
  {
    id: "bank-transfer",
    label: "Bank transfer",
    detail: "We send our account details once your dates are confirmed, with the reference to quote.",
    icon: Landmark,
  },
  {
    id: "on-arrival",
    label: "Pay on arrival",
    detail: "Settle when you check in. We will confirm your dates before you travel either way.",
    icon: Banknote,
  },
];

export default function BookingFlow() {
  const params = useSearchParams();

  // ---- state -------------------------------------------------------------
  const [step, setStep] = useState<StepIndex>(0);

  const initial = useMemo(() => readSearch(params), [params]);

  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [guests, setGuests] = useState(initial.guests);
  const [slug, setSlug] = useState(initial.slug);

  /*
    Today, worked out once after mount rather than during render.

    The `min` attribute on a date input is written into the HTML and these pages
    are prerendered, so a value computed at render time is frozen at the moment
    of the last deploy and drifts further out of date with every day that passes
    without one. Setting it in an effect means it is always actually today.
  */
  const [today, setToday] = useState("");
  useEffect(() => setToday(isoToday()), []);

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
  /**
   * Why a guest is back on a step they had already passed.
   *
   * Only ever set when a refusal sends them back. Landing in a form you thought
   * you had finished, with nothing on screen to say why, reads as the form
   * having thrown your work away.
   */
  const [resumeNote, setResumeNote] = useState("");
  /** The dates could not be checked. Said plainly rather than assumed away. */
  const [datesUnchecked, setDatesUnchecked] = useState(false);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trap, setTrap] = useState("");
  /**
   * How the request ended: accepted, refused or undelivered. Null until it has
   * been sent, which is also what puts the confirmation screen on screen.
   *
   * Three states rather than the boolean this used to be, because "nobody was
   * told" and "we were told no" need completely different things said to a
   * guest. See BookingOutcome in lib/availability.ts.
   */
  const [outcome, setOutcome] = useState<BookingOutcome | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);

  /*
    Skip ahead only over the steps the URL genuinely answered. Everything read
    from it has already been through readSearch, so a value that survives here
    is a value the guest would have been allowed to enter by hand.
  */
  useEffect(() => {
    const start: StepIndex = slug && from && to ? 2 : from && to ? 1 : 0;
    if (start !== 0) setStep(start);
    /*
      Label the entry the guest arrived on, so the first Back out of the flow is
      a clean exit rather than a popstate carrying no step of ours. `replace`,
      not `push`: arriving somewhere should not cost a history entry.
    */
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(start));
    window.history.replaceState({ dunslimStep: start }, "", url.toString());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /*
    THE BACK BUTTON.

    Each step is a screen, so each step gets a history entry. It did not and on
    a phone that is a real loss: Back is the primary navigation gesture and a
    guest three steps into checkout who used it left the site altogether, taking
    their name, their dates and their apartment with them. Measured before this:
    the address never changed and `history.length` never grew across the whole
    flow.

    Native `history.pushState` rather than the router, deliberately. The router
    would re-run this page's own search-parameter reading on every step and the
    only thing that needs to change is one number. This writes the step into the
    address, leaves everything else in it alone and never touches the server.

    `popstate` is the other half: the browser has already moved the address by
    the time it fires, so the step is read back out of it rather than assumed.
    Forward works for the same reason.

    One deliberate asymmetry: the confirmation screen does NOT push an entry.
    Once a request is sent there is nothing to go back to and offering Back
    there would drop a guest into a form they have already submitted.
  */
  const stepRef = useRef(step);
  stepRef.current = step;

  const pushStep = (s: StepIndex) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("step", String(s));
    window.history.pushState({ dunslimStep: s }, "", url.toString());
  };

  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const fromState = (e.state as { dunslimStep?: number } | null)?.dunslimStep;
      const fromUrl = Number(new URLSearchParams(window.location.search).get("step"));
      const raw = Number.isInteger(fromState) ? Number(fromState) : fromUrl;
      const target = Number.isInteger(raw) && raw >= 0 && raw <= 3 ? (raw as StepIndex) : 0;
      if (target !== stepRef.current) {
        setErrors({});
        setStep(target);
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

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

  /**
   * Put the cursor in the first field that needs attention.
   *
   * The messages appeared beside their fields and focus stayed wherever it was,
   * which on the details step, with eight fields, can be off screen entirely.
   * Nothing was announced either: a screen-reader user pressed Continue and
   * heard silence. Moving focus fixes both, because the field's own error is
   * wired to it by `aria-describedby` now (see components/ui/Field).
   */
  const focusFirstError = (e: Record<string, string>) => {
    const key = ERROR_ORDER.find((k) => e[k]);
    if (!key) return;

    const byId = document.getElementById(key);
    if (byId) {
      byId.focus();
      return;
    }

    // The residence and payment steps are radio groups, named but not id'd.
    document.querySelector<HTMLElement>(`input[name="${key}"]`)?.focus();
  };

  const validate = (s: StepIndex): boolean => {
    const e: Record<string, string> = {};

    if (s === 0) {
      if (!from) e.from = "Choose your arrival date.";
      if (!to) e.to = "Choose your departure date.";
      if (from && to && to <= from) e.to = "Departure must be after arrival.";
      // The `min` attribute is a hint the browser draws, not a rule it enforces.
      if (from && today && from < today) e.from = "That date has already passed.";
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
    if (Object.keys(e).length) {
      focusFirstError(e);
      return false;
    }
    return true;
  };

  const next = async () => {
    /*
      One press at a time. Checking availability is a waiting operation and the
      button used to stay live with no change of label while it ran, so two
      impatient taps both passed validation and both advanced the step: the
      guest landed on Payment having never entered their name. It resolves
      instantly today because it runs locally, which is exactly what hid it.
      The moment it becomes a real request to AI-BOS the gap opens.
    */
    if (checking || submitting) return;
    if (!validate(step)) return;

    // Confirm the dates are actually free before asking for personal details.
    if (step === 1 && slug) {
      setChecking(true);
      const res = await checkAvailability(slug, from, to);
      setChecking(false);

      if (res.status === "unavailable" || res.status === "invalid") {
        setAvailability(res.reason);
        return;
      }

      setAvailability("");
      // Told, not assumed. See the `unknown` case in lib/availability.ts.
      setDatesUnchecked(res.status === "unknown");
    }

    /*
      Worked out here rather than inside the state updater. An updater has to be
      pure: React is free to call it twice and pushing a history entry from
      inside one would put two on the stack for a single press.
    */
    const target = Math.min(step + 1, 3) as StepIndex;
    pushStep(target);
    setStep(target);
  };

  /*
    Enter submits, on every step.

    All four steps were laid out without a form around them, so pressing Enter
    in any field did nothing at all and the "Go" key on a phone keyboard was
    dead. Anyone who fills forms by keyboard, which is most business travellers,
    had to reach for the mouse at the end of every step. The enquiry form and
    the homepage search were both real forms; checkout was the one place it was
    skipped and the one place it matters.
  */
  const onSubmitStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 3) void submit();
    else void next();
  };

  /*
    The in-page Back control now asks the browser to go back rather than moving
    the step itself, so the two can never disagree about where the guest is. If
    there is no entry of ours to return to, because the guest landed straight on
    a later step from a link, it steps back without touching history.
  */
  const back = () => {
    setErrors({});
    const hasOurEntry = (window.history.state as { dunslimStep?: number } | null)?.dunslimStep;
    if (Number.isInteger(hasOurEntry)) window.history.back();
    else setStep((s) => Math.max(s - 1, 0) as StepIndex);
  };

  /*
    The funnel. Which step a guest reached is the only way to see WHERE they
    give up rather than merely that they did, because "everyone leaves at the
    payment step" and "nobody gets past choosing dates" call for completely
    different fixes. Carries the step and the apartment, never a guest's
    details.
  */
  useEffect(() => {
    const name = [BOOKING_STEP.dates, BOOKING_STEP.residence, BOOKING_STEP.details, BOOKING_STEP.review][step];
    track(name, { residence: slug || "none" });
  }, [step, slug]);

  const submit = async () => {
    if (submitting) return;
    if (!validate(3) || !residence || !quote) return;
    setSubmitting(true);

    /*
      Ask about the dates one more time, now, before sending anything.

      The check on step one is two screens old by the time a guest presses this:
      a name, an email, a phone number and a payment choice ago. That gap is
      exactly the window in which somebody else books the same apartment, and it
      is the one moment where losing the race is most expensive, because the
      guest has already handed over everything. Refusing here costs one request
      and nothing is sent to anyone.
    */
    const fresh = await checkAvailability(slug, from, to);
    if (fresh.status === "unavailable" || fresh.status === "invalid") {
      /*
        A reference is minted for the shape of the outcome, not for the guest:
        the refused screen deliberately does not show one, because there is no
        request anywhere for it to refer to and a code on screen reads like
        something is being held.
      */
      setOutcome({
        status: "refused",
        refusal: "dates",
        reference: makeReference(),
        reason: fresh.reason,
      });
      setSubmitting(false);
      track("booking_submitted", { residence: slug, nights: quote.nights, status: "refused" });
      return;
    }

    const result = await submitBookingRequest({
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
      totalZmw: quote.totalZmw,
      company_website: trap,
    });
    setOutcome(result);
    setSubmitting(false);

    /*
      The one event that matters. The status separates a request that reached a
      person, one that was turned down and one that was lost on the way, so a
      run of failures shows up as itself rather than as a sudden drop in
      bookings, and a week of refusals shows up as a full calendar rather than
      as a broken form.
    */
    track("booking_submitted", { residence: slug, nights: quote.nights, status: result.status });
  };

  /*
    Back into the form after a refusal, at the step that can actually fix it:
    the dates when the apartment went, the details when something in them was
    not accepted. Everything the guest typed is kept, because none of it is the
    problem and asking for it twice would be its own insult. The reason travels
    with them.
  */
  const resumeAt = (s: StepIndex, note: string) => {
    setOutcome(null);
    setErrors({});
    setAvailability("");
    setResumeNote(note);
    pushStep(s);
    setStep(s);
  };

  // ---- confirmation ------------------------------------------------------
  /*
    Three endings, not two.

    A request that reached a person, a request that was answered no, and a
    request that never arrived are three different things to be told, and this
    screen used to have copy for only two of them. The missing one is the
    common one: somebody else booked the apartment while this guest was typing
    their phone number. They were shown "this did not send ... Nothing is wrong
    on your end", which is untrue in both halves.
  */
  if (outcome && residence && quote) {
    const accepted = outcome.status === "accepted";
    const refused = outcome.status === "refused";
    const lostDates = refused && outcome.refusal === "dates";

    return (
      <Container wide>
        <div className="mx-auto max-w-[720px] py-16 md:py-24">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              accepted ? "bg-navy" : "bg-warning",
            )}
          >
            {accepted ? (
              <Check size={22} strokeWidth={2} className="text-white" aria-hidden />
            ) : lostDates ? (
              <CalendarX size={22} strokeWidth={2} className="text-white" aria-hidden />
            ) : (
              <AlertTriangle size={22} strokeWidth={2} className="text-white" aria-hidden />
            )}
          </div>

          {accepted ? (
            <>
              <h1 className="mt-8 text-h1 font-extralight text-navy">
                Thank you, {firstName}. We have your request.
              </h1>
              <p className="mt-6 max-w-measure text-lead text-charcoal">
                Your dates are held while we look at it. Someone will confirm your booking and send
                payment instructions within a few hours, sooner during the day.
              </p>
              <p className="mt-4 max-w-measure text-body text-charcoal-80">
                {arrivalTime
                  ? "We have your arrival time, so someone will be ready with the keys when you get here."
                  : "When you reply, let us know roughly when you will arrive so someone can be ready with the keys."}
              </p>
            </>
          ) : lostDates ? (
            <>
              {/*
                Somebody else got there first. That is a full calendar, not a
                broken form, and saying so is the difference between a guest who
                picks another date and one who assumes the site does not work.
                No apology for a fault that did not happen.
              */}
              <h1 className="mt-8 text-h1 font-extralight text-navy">
                {firstName}, those dates have just gone.
              </h1>
              <p className="mt-6 max-w-measure text-lead text-charcoal">
                {outcome.reason ?? "Someone booked this residence while you were filling this in."}{" "}
                Nothing has been sent and nothing is held, so nothing needs cancelling.
              </p>
              <p className="mt-4 max-w-measure text-body text-charcoal-80">
                Everything you have typed is still here. Pick different dates and it carries
                straight over, or try one of the other residences for the same nights.
              </p>
            </>
          ) : refused ? (
            <>
              <h1 className="mt-8 text-h1 font-extralight text-navy">
                {firstName}, one detail needs another look.
              </h1>
              <p className="mt-6 max-w-measure text-lead text-charcoal">
                {outcome.reason ?? "Some of these details were not accepted."} Nothing has been
                sent yet. Go back, change it, and send it again.
              </p>
            </>
          ) : (
            <>
              {/*
                The honest branch. Nothing was delivered, so nothing is claimed.
                Telling a guest their room is held when no one has been told is
                the worst outcome this form can produce, worse than an error.
              */}
              <h1 className="mt-8 text-h1 font-extralight text-navy">
                {firstName}, this did not send.
              </h1>
              <p className="mt-6 max-w-measure text-lead text-charcoal">
                Your details could not reach us, so no one has seen this request and no dates are
                held. Nothing is wrong on your end. Please send us the reference below on WhatsApp
                and we will pick it up straight away.
              </p>
            </>
          )}

          <dl className="mt-12 divide-y divide-navy/10 border-y border-navy/10">
            {(
              [
                /*
                  A reference is only shown when one exists to be quoted. On a
                  refusal there is no request anywhere for it to refer to, and a
                  code on screen reads like something is being held.
                */
                ...(refused ? [] : [["Reference", outcome.reference] as const]),
                ["Residence", residence.name],
                ["Arrive", `${prettyDate(from)}, from ${arrival.checkIn}`],
                ["Depart", `${prettyDate(to)}, by ${arrival.lateCheckOut}`],
                ["Total", money(quote.totalZmw)],
                ["Paying by", PAYMENT_METHODS.find((m) => m.id === payment)?.label ?? "Not chosen"],
                ["Confirmation to", email],
              ] as ReadonlyArray<readonly [string, string]>
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-6 py-4">
                <dt className="text-body text-charcoal-60">{k}</dt>
                <dd className="text-right text-body text-charcoal">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 rounded-md bg-stone p-6">
            <p className="text-body text-charcoal">
              {accepted ? (
                <>
                  Quote reference <span className="text-navy">{outcome.reference}</span> if you
                  message us. The fastest way to reach a person is WhatsApp.
                </>
              ) : refused ? (
                <>
                  Change it below and send it again. If you would rather a person sorted it out,
                  WhatsApp reaches one fastest.
                </>
              ) : (
                <>
                  Send us reference <span className="text-navy">{outcome.reference}</span> and your
                  dates. WhatsApp reaches a person fastest.
                </>
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {refused && (
                <button
                  type="button"
                  onClick={() =>
                    lostDates
                      ? resumeAt(0, "Those dates went. Pick new ones and the rest is still filled in.")
                      : resumeAt(2, outcome.reason ?? "Please check these details.")
                  }
                  className="inline-flex min-h-[44px] items-center rounded-md bg-navy px-6 text-[15px] font-medium text-white transition-colors duration-micro hover:bg-navy-80"
                >
                  {lostDates ? "Pick different dates" : "Change my details"}
                </button>
              )}
              <a
                /*
                  When the send failed, the message carries the whole request.
                  The guest should not have to type their dates out again
                  because our form let them down.
                */
                href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(
                  accepted
                    ? `Hello, I have just requested a booking. Reference ${outcome.reference}.`
                    : refused
                      ? `Hello, I tried to book ${residence.name} for ${prettyDate(from)} to ${prettyDate(to)} ` +
                        `and the website said those dates are not available. Could you help me find something?`
                      : `Hello, I tried to book on your website and it did not go through.\n\n` +
                        `Reference ${outcome.reference}\n` +
                        `${residence.name}\n` +
                        `${prettyDate(from)} to ${prettyDate(to)}, ${guests} ${guests === 1 ? "guest" : "guests"}\n` +
                        `${firstName} ${lastName}`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex min-h-[44px] items-center rounded-md px-6 text-[15px] font-medium transition-colors duration-micro",
                  refused
                    ? "border border-navy/20 bg-white text-navy hover:border-navy/50"
                    : "bg-navy text-white hover:bg-navy-80",
                )}
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
            {accepted
              ? "Nothing has been charged yet. Cancellation terms are confirmed in writing along with the rest of your booking."
              : refused
                ? "Nothing has been charged and nothing has been sent."
                : "Nothing has been charged and nothing has been booked. Message us and we will sort it out."}
          </p>
        </div>
      </Container>
    );
  }
  // ---- flow --------------------------------------------------------------
  return (
    <Container wide>
      <Honeypot value={trap} onChange={setTrap} />
      <div className="py-12 md:py-16">
        {/* Progress. A list, so it reads correctly aloud. */}
        <nav aria-label="Booking progress">
          <ol className="flex flex-wrap gap-x-6 gap-y-2">
            {STEPS.map((label, i) => (
              <li key={label} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn(
                    // 13px on the label scale, in a 28px circle. It was 11px.
                    "flex h-7 w-7 items-center justify-center rounded-full text-[13px] tabular-nums",
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

        {/*
          Why they are back on a step they had already finished. Without this a
          guest sent back from a refusal lands in a form they thought they had
          completed, with nothing on screen explaining it, which reads as the
          form having thrown their work away. role="status" so a screen reader
          announces it on arrival rather than leaving it to be found.
        */}
        {resumeNote ? (
          <div
            role="status"
            className="mt-8 flex items-start gap-3 rounded-md border border-warning/30 bg-warning/10 p-4"
          >
            <AlertTriangle
              size={18}
              strokeWidth={2}
              className="mt-[2px] shrink-0 text-warning"
              aria-hidden
            />
            <p className="text-body text-charcoal">{resumeNote}</p>
          </div>
        ) : null}

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

            {/* ---------------- STEP 0: DATES ---------------- */}
            {step === 0 ? (
              <form onSubmit={onSubmitStep} noValidate>
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
                      min={today}
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
                      min={from ? isoPlusDays(from, 1) : isoPlusDays(today, 1)}
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
                      {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
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
                      ? ". The long-stay rate applies."
                      : null}
                  </p>
                ) : null}

                <Button type="submit" size="lg" className="mt-12 w-full sm:w-auto">
                  Choose a residence
                </Button>
              </form>
            ) : null}

            {/* ---------------- STEP 1: RESIDENCE ---------------- */}
            {step === 1 ? (
              <form onSubmit={onSubmitStep} noValidate>
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

                {/*
                  A PHOTOGRAPH AND ONE DISTINGUISHING LINE PER OPTION.

                  All three apartments are two bedrooms, sleep four and cost the
                  same, so this step rendered three options that were word for
                  word identical on every visible attribute: K8,000, two
                  bedrooms, sleeps four. There was no photograph anywhere on the
                  step either. The guest was being asked to choose with nothing
                  to choose on, on a site whose own CoverFlow notes argue that a
                  serviced apartment is bought with the eyes.

                  The `standout` line comes from content.ts, one per apartment,
                  and is deliberately a concrete object rather than an adjective.
                  The photograph carries an empty alt because the name sits
                  immediately beside it: announcing both would read the option
                  twice.
                */}
                <fieldset className="mt-12">
                  <legend className="sr-only">Choose a residence</legend>
                  <div className="space-y-4">
                    {suitable.map((r) => {
                      const q = buildQuote(r, from, to);
                      const selected = slug === r.slug;
                      const cover = photo(r.photos[0]?.id ?? "");
                      return (
                        <label
                          key={r.slug}
                          className={cn(
                            "flex cursor-pointer flex-col gap-4 rounded-md border p-4 transition-colors duration-micro sm:flex-row sm:items-start sm:p-6",
                            selected
                              ? "border-navy bg-stone-40"
                              : "border-navy/20 bg-white hover:border-navy/50",
                          )}
                        >
                          {/*
                            ONE image element that changes shape, not two.

                            The first pass at this made the photograph `hidden
                            sm:block`, to keep a 375px row from crowding, which
                            meant it did not appear on a phone at all: no picture
                            on the device where the choice between three
                            identical-looking options is hardest. It is now a
                            full-width band above the text on a phone and a thumb
                            beside it from `sm` up, so it is always there and
                            still only one file to fetch.
                          */}
                          {cover ? (
                            <Image
                              src={cover.src}
                              alt=""
                              width={cover.w}
                              height={cover.h}
                              placeholder="blur"
                              blurDataURL={cover.blur}
                              sizes="(max-width: 640px) 100vw, 128px"
                              className="h-40 w-full rounded-sm object-cover sm:h-24 sm:w-32 sm:shrink-0"
                            />
                          ) : null}
                          <span className="flex flex-1 items-start gap-4">
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
                                {q ? money(q.totalZmw) : money(directNightly(r))}
                              </span>
                            </span>
                            <span className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
                              <span className="text-caption text-charcoal-80">
                                {r.bedrooms} {r.bedrooms === 1 ? "bedroom" : "bedrooms"} · sleeps{" "}
                                {r.sleeps}
                              </span>
                              <span className="text-caption text-charcoal-80">
                                {q ? `${money(q.perNightZmw)} a night, all in` : null}
                              </span>
                            </span>
                            <span className="mt-3 block max-w-measure text-body text-charcoal">
                              {r.standout}
                            </span>
                          </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>

                {suitable.length === 0 ? (
                  <p className="mt-6 rounded-md bg-stone p-6 text-body text-charcoal">
                    Nothing here sleeps {guests}. Go back a step and reduce the party, or message us.
                    Two residences side by side may work.
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

                <Button type="submit" size="lg" disabled={checking} className="mt-12 w-full sm:w-auto">
                  {checking ? "Checking those dates…" : "Continue"}
                </Button>
              </form>
            ) : null}

            {/* ---------------- STEP 2: DETAILS ---------------- */}
            {step === 2 ? (
              <form onSubmit={onSubmitStep} noValidate>
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
                    hint="Roughly when you will arrive, so someone can be ready with the keys."
                    className="sm:col-span-2"
                  >
                    <Input
                      id="arrivalTime"
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                      placeholder="e.g. flight KQ 794, or 23:40 by road"
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

                <Button type="submit" size="lg" className="mt-12 w-full sm:w-auto">
                  Continue to payment
                </Button>
              </form>
            ) : null}

            {/* ---------------- STEP 3: PAYMENT ---------------- */}
            {step === 3 ? (
              <form onSubmit={onSubmitStep} noValidate>
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

                {datesUnchecked ? (
                  <p className="mt-6 rounded-md bg-stone p-6 text-body text-charcoal">
                    We could not check those dates automatically just now, so someone will confirm
                    them by hand when they answer. Nothing is held until they do.
                  </p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="mt-12 w-full sm:w-auto"
                >
                  {submitting ? "Sending your request…" : "Request this booking"}
                </Button>

                <p className="mt-4 text-caption text-charcoal-80">
                  Nothing is charged until your booking is confirmed. Full{" "}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-navy">
                    Booking terms
                  </Link>
                  .
                </p>
              </form>
            ) : null}
          </div>

          {/* Price panel, visible at every step, on every screen size. */}
          <div className="lg:col-span-5">
            <Summary
              residence={residence}
              quote={quote}
              from={from}
              to={to}
              guests={guests}
              className="lg:sticky lg:top-24"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
