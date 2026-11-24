"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CreditCard, Landmark, Smartphone } from "lucide-react";
import PayNow, { CopyField } from "@/components/booking/PayNow";
import { business, payments } from "@/lib/content";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PaymentMethod } from "@/lib/availability";
import {
  checkPayment,
  getStayToPay,
  looksLikeEmail,
  networkOf,
  openCardWindow,
  PayError,
  startCard,
  startMobileMoney,
  takesMobileMoney,
  takesOnline,
  type OnlineOptions,
  type PayNetwork,
} from "@/lib/payOnline";

/**
 * PAY NOW, AND THE BOOKING CONFIRMS ITSELF
 * ---------------------------------------------------------------------------
 * The confirmation screen's payment panel once AI-BOS takes money online
 * (lib/payOnline.ts). Three ways, in one navy panel:
 *
 *   Mobile money   a prompt on the guest's phone, approved with their PIN
 *   Bank card      Visa or Mastercard from any bank, in Lenco's own window
 *   Bank transfer  the Access Bank details, as before, matched by a person
 *
 * The first two confirm the booking the moment the money arrives. The amount
 * is AI-BOS's, read from the booking, never this page's.
 *
 * When AI-BOS says the account is not live, or cannot be reached, this renders
 * the site's own PayNow panel instead, exactly as before. A guest is never
 * offered a payment that cannot happen.
 */

type Way = "mobile-money" | "card" | "bank-transfer";
type Phase = "loading" | "manual" | "ready" | "waiting" | "paid" | "failed";

const NETWORKS: { id: PayNetwork; label: string }[] = [
  { id: "airtel", label: "Airtel Money" },
  { id: "mtn", label: "MTN MoMo" },
  { id: "zamtel", label: "Zamtel Kwacha" },
];

/* Every three seconds for three minutes, then every fifteen for twenty more,
   then stop. A prompt nobody approves fails at the network well before that. */
const POLL_MS = 3000;
const POLL_FAST = 60;
const POLL_LIMIT = 140;

/* On navy, measured on navy (see PayNow): white values, Navy 20 labels. */
const fieldClass =
  "w-full min-h-[48px] rounded-sm border border-white/25 bg-white/5 px-4 text-body text-white " +
  "placeholder:text-navy-40 transition-colors duration-micro hover:border-white/50 focus:border-white";

function Choice({
  on,
  disabled,
  onClick,
  children,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-[48px] flex-1 basis-[140px] items-center justify-center gap-2 rounded-sm border px-4",
        "text-body transition-colors duration-micro disabled:cursor-default",
        on
          ? "border-white bg-white/10 text-white"
          : "border-white/25 text-navy-20 hover:border-white/60 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export default function PayOnline({
  token,
  reference,
  fallbackAmountZmw,
  guest,
  prefer,
  onPaid,
  className,
}: {
  /** The booking's payment link in AI-BOS (BookingOutcome.payToken). */
  token: string;
  /** The guest's booking reference, for a bank transfer and for WhatsApp. */
  reference: string;
  /** The site's own quote. Shown only if AI-BOS cannot be asked. */
  fallbackAmountZmw: number;
  guest: { firstName: string; lastName: string; email: string; phone: string };
  /** What the guest chose on the payment step. */
  prefer: PaymentMethod;
  onPaid?: (how: "mobile-money" | "card", confirmed: boolean | null) => void;
  className?: string;
}) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [amount, setAmount] = useState(fallbackAmountZmw);
  const [options, setOptions] = useState<OnlineOptions | null>(null);
  const [way, setWay] = useState<Way>("mobile-money");
  const [network, setNetwork] = useState<PayNetwork>("airtel");
  const [phone, setPhone] = useState(guest.phone);
  const [email, setEmail] = useState(guest.email);
  const [cardStep, setCardStep] = useState<"window" | "checking">("window");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stay = await getStayToPay(token);
        if (cancelled) return;
        if (!stay.payable || !takesOnline(stay.options) || stay.currency !== "ZMW") {
          setPhase("manual");
          return;
        }
        setAmount(stay.amountDue);
        setOptions(stay.options);
        const live = NETWORKS.filter((n) => stay.options.networks[n.id]).map((n) => n.id);
        const guess = networkOf(guest.phone);
        setNetwork(guess && live.includes(guess) ? guess : live[0] ?? "airtel");
        const canMomo = takesMobileMoney(stay.options);
        setWay(
          prefer === "card" && stay.options.card
            ? "card"
            : prefer === "bank-transfer" && payments.bank.accounts.length > 0
              ? "bank-transfer"
              : canMomo
                ? "mobile-money"
                : stay.options.card
                  ? "card"
                  : "bank-transfer",
        );
        setPhase("ready");
      } catch {
        /* AI-BOS could not be asked. The site's own accounts still work. */
        if (!cancelled) setPhase("manual");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, prefer, guest.phone]);

  const paid = useCallback(
    (how: "mobile-money" | "card", isConfirmed: boolean | null) => {
      setNotice(null);
      setConfirmed(isConfirmed);
      setPhase("paid");
      onPaid?.(how, isConfirmed);
    },
    [onPaid],
  );

  const poll = useCallback(
    (ref: string, how: "mobile-money" | "card", attempt: number) => {
      if (attempt >= POLL_LIMIT) {
        /* Still waiting, so the pay buttons stay off: paying twice is the one
           thing worse than waiting. */
        setNotice(
          "We have not heard back about this payment yet. If you approved it, it will still reach us and your booking confirms itself. Please do not pay again: message us on WhatsApp and we will check it for you.",
        );
        return;
      }
      const delay = attempt < POLL_FAST ? POLL_MS : POLL_MS * 5;
      timer.current = setTimeout(async () => {
        try {
          const check = await checkPayment(token, ref);
          if (check.status === "successful") {
            paid(how, check.confirmed);
            return;
          }
          if (check.status === "failed") {
            setPhase("failed");
            setError("The payment did not go through and nothing was taken. You can try again.");
            return;
          }
          if (attempt === POLL_FAST) {
            setNotice(
              "Still waiting to hear from your bank or network. If you approved the payment it may still go through, so keep this page open and it will update by itself.",
            );
          }
          poll(ref, how, attempt + 1);
        } catch (e) {
          const status = e instanceof PayError ? e.status : 0;
          if (status === 400 || status === 403 || status === 404) {
            setPhase("failed");
            setError((e as Error).message);
            return;
          }
          poll(ref, how, attempt + 1);
        }
      }, delay);
    },
    [token, paid],
  );

  const payByPhone = async () => {
    setError(null);
    setNotice(null);
    setPhase("waiting");
    try {
      const started = await startMobileMoney(token, network, phone.trim());
      if (started.amount) setAmount(started.amount);
      poll(started.reference, "mobile-money", 0);
    } catch (e) {
      setPhase("failed");
      setError((e as Error).message);
    }
  };

  const payByCard = async () => {
    setError(null);
    setNotice(null);
    setCardStep("window");
    setPhase("waiting");
    try {
      const started = await startCard(token);
      if (started.amount) setAmount(started.amount);
      const outcome = await openCardWindow(started, {
        email: email.trim(),
        firstName: guest.firstName,
        lastName: guest.lastName,
        phone: guest.phone,
      });
      if (outcome === "closed") {
        /* Closed before paying, almost always. One look, in case the payment
           finished just as the window shut. */
        const check = await checkPayment(token, started.reference).catch(() => null);
        if (check?.status === "successful") {
          paid("card", check.confirmed);
          return;
        }
        setPhase("ready");
        setNotice("The card window was closed before the payment finished. Nothing was taken. You can try again.");
        return;
      }
      setCardStep("checking");
      poll(started.reference, "card", 0);
    } catch (e) {
      setPhase("failed");
      setError((e as Error).message);
    }
  };

  if (phase === "manual") {
    return (
      <PayNow
        className={className}
        amountZmw={fallbackAmountZmw}
        reference={reference}
        guestName={guest.firstName}
      />
    );
  }

  const waiting = phase === "waiting";
  const busy = waiting || phase === "loading";
  const hasBank = payments.bank.accounts.length > 0;
  const phoneReady = phone.replace(/\D/g, "").length >= 9;
  const emailReady = looksLikeEmail(email);
  const proof = [
    `Hello, this is ${guest.firstName}.`,
    "I have just paid for my booking by bank transfer.",
    `Reference ${reference}.`,
    `Amount ${money(amount)}.`,
    "Proof of payment attached.",
  ].join(" ");

  return (
    <section className={cn("on-navy rounded-md bg-navy p-6 md:p-8", className)} aria-live="polite">
      <p className="label-caps text-brass-60">
        {phase !== "paid" ? "Pay now" : confirmed === false ? "Received" : "Paid"}
      </p>
      {/* Received but not confirmed can mean paid short, so the booking's
          price is not shown as if it were the amount that arrived. */}
      {phase === "paid" && confirmed === false ? null : (
        <p className="mt-4 text-h2 font-extralight text-white">{money(amount)}</p>
      )}

      {phase === "paid" ? (
        <div className="mt-6">
          <p className="flex items-center gap-3 text-lead text-white">
            <Check size={22} strokeWidth={2} className="text-brass" aria-hidden />
            {confirmed === false ? "Payment received" : "Paid. Your booking is confirmed."}
          </p>
          <p className="mt-3 max-w-measure text-body text-navy-20">
            {confirmed === false
              ? "Thank you. We have your payment and will be in touch shortly about your booking."
              : `Thank you. The dates are yours. Keep your reference, ${reference}, for when you arrive.`}
          </p>
        </div>
      ) : (
        <>
          <p className="mt-2 max-w-measure text-body text-navy-20">
            Pay the full amount now and your booking is confirmed the moment it arrives.
          </p>
          {options?.testMode ? (
            <p className="mt-3 text-caption text-brass-60">Test mode: no real money moves.</p>
          ) : null}

          {phase === "loading" ? (
            <p className="mt-8 text-body text-navy-20">Getting your payment ready…</p>
          ) : (
            <>
              <div role="group" aria-label="How to pay" className="mt-8 flex flex-wrap gap-3">
                {options && takesMobileMoney(options) ? (
                  <Choice on={way === "mobile-money"} disabled={busy} onClick={() => { setWay("mobile-money"); setError(null); setNotice(null); }}>
                    <Smartphone size={18} strokeWidth={1.5} aria-hidden /> Mobile money
                  </Choice>
                ) : null}
                {options?.card ? (
                  <Choice on={way === "card"} disabled={busy} onClick={() => { setWay("card"); setError(null); setNotice(null); }}>
                    <CreditCard size={18} strokeWidth={1.5} aria-hidden /> Bank card
                  </Choice>
                ) : null}
                {hasBank ? (
                  <Choice on={way === "bank-transfer"} disabled={busy} onClick={() => { setWay("bank-transfer"); setError(null); setNotice(null); }}>
                    <Landmark size={18} strokeWidth={1.5} aria-hidden /> Bank transfer
                  </Choice>
                ) : null}
              </div>

              {way === "mobile-money" && options ? (
                <div className="mt-8">
                  <p className="label-caps text-navy-20">Your network</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {NETWORKS.filter((n) => options.networks[n.id]).map((n) => (
                      <Choice key={n.id} on={network === n.id} disabled={busy} onClick={() => setNetwork(n.id)}>
                        {n.label}
                      </Choice>
                    ))}
                  </div>
                  <label htmlFor="pay-phone" className="mt-6 block label-caps text-navy-20">
                    The number to charge
                  </label>
                  <input
                    id="pay-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={busy}
                    placeholder="e.g. 0977 123 456"
                    className={cn(fieldClass, "mt-2")}
                  />
                </div>
              ) : null}

              {way === "card" ? (
                <div className="mt-8">
                  <label htmlFor="pay-email" className="block label-caps text-navy-20">
                    Your email, for the card receipt
                  </label>
                  <input
                    id="pay-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={busy}
                    className={cn(fieldClass, "mt-2")}
                  />
                </div>
              ) : null}

              {way === "bank-transfer" ? (
                <div className="mt-8">
                  <p className="max-w-measure text-body text-navy-20">
                    Send it to the account below and put <span className="text-white">{reference}</span>{" "}
                    as the reference. We confirm your booking when we match the payment, usually within
                    a few hours.
                  </p>
                  <div className="mt-4 divide-y divide-white/10 rounded-sm bg-white/5 px-4">
                    <CopyField label="Account name" value={payments.bank.accountName} />
                    {payments.bank.accounts.map((account) => (
                      <CopyField key={account.number} label={account.label} value={account.number} />
                    ))}
                    {payments.bank.bankName ? (
                      <CopyField
                        label="Bank"
                        value={[payments.bank.bankName, payments.bank.branch].filter(Boolean).join(", ")}
                      />
                    ) : null}
                    {payments.bank.swift ? (
                      <CopyField label="Swift, from outside Zambia" value={payments.bank.swift} />
                    ) : null}
                    <CopyField label="Reference" value={reference} />
                  </div>
                  {payments.bank.accounts.some((a) => a.currency !== "ZMW") ? (
                    <p className="mt-3 max-w-measure text-caption text-navy-20">
                      Paying in dollars? Message us for the exact amount before you send it. Your bank
                      sets the rate, not the converter on this site, so the two will not agree.
                    </p>
                  ) : null}
                  <a
                    href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(proof)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex min-h-[52px] items-center rounded-md bg-white px-6 text-[15px] font-medium text-navy transition-colors duration-micro hover:bg-stone"
                  >
                    Send proof on WhatsApp
                  </a>
                </div>
              ) : null}

              {error ? (
                <p role="alert" className="mt-6 max-w-measure rounded-sm bg-white/10 px-4 py-3 text-body text-white">
                  {error}
                </p>
              ) : null}
              {notice ? (
                <p role="status" className="mt-6 max-w-measure text-body text-brass-60">
                  {notice}
                </p>
              ) : null}

              {way === "mobile-money" ? (
                <>
                  <button
                    type="button"
                    onClick={() => void payByPhone()}
                    disabled={busy || !phoneReady}
                    className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-md bg-white px-6 text-[15px] font-medium text-navy transition-colors duration-micro hover:bg-stone disabled:opacity-60 sm:w-auto"
                  >
                    {waiting ? "Waiting for you to approve…" : `Pay ${money(amount)} now`}
                  </button>
                  <p className="mt-4 max-w-measure text-caption text-navy-20">
                    {waiting
                      ? "A prompt is on its way to your phone. Approve it with your PIN and keep this page open."
                      : "A prompt comes up on your phone and you approve it with your PIN, on the phone, never here."}
                  </p>
                </>
              ) : null}

              {way === "card" ? (
                <>
                  <button
                    type="button"
                    onClick={() => void payByCard()}
                    disabled={busy || !emailReady}
                    className="mt-8 inline-flex min-h-[52px] w-full items-center justify-center rounded-md bg-white px-6 text-[15px] font-medium text-navy transition-colors duration-micro hover:bg-stone disabled:opacity-60 sm:w-auto"
                  >
                    {waiting
                      ? cardStep === "window"
                        ? "Finish in the card window…"
                        : "Checking your payment…"
                      : `Pay ${money(amount)} by card`}
                  </button>
                  <p className="mt-4 max-w-measure text-caption text-navy-20">
                    Visa or Mastercard from any bank. You type your card into the secure window of
                    Lenco, our payment provider, so your card details never reach this site.
                  </p>
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </section>
  );
}
