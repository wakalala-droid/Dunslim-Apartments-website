"use client";

import { useState } from "react";
import { Check, Copy, Landmark, Smartphone } from "lucide-react";
import { business, payments, canPayNow } from "@/lib/content";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";

/**
 * PAY NOW, RATHER THAN "INSTRUCTIONS WILL FOLLOW"
 * ---------------------------------------------------------------------------
 * The booking form used to end by promising that someone would send payment
 * instructions within a few hours. For a guest in another time zone, ready to
 * pay at the moment they are most willing to, that is the end of it: they wait,
 * and some of them book somewhere else while they wait.
 *
 * This shows the actual accounts, the actual amount and their own reference, on
 * the screen they land on the second they finish the form, with everything
 * tappable to copy because nobody retypes an account number correctly on a
 * phone.
 *
 * IT RENDERS NOTHING UNTIL THE ACCOUNTS ARE FILLED IN (see `payments` in
 * lib/content.ts). No placeholder account numbers, ever.
 *
 * It does not take the payment. Nothing here charges a card or raises a mobile
 * money prompt: the guest pushes the money from their own phone or bank and
 * tells us. That is the honest description of what happens, so it is what the
 * words say. The automated version needs merchant credentials that do not
 * exist yet.
 */

function CopyField({
  label,
  value,
  wide,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked (an insecure origin, or an old browser). The value is
      // on screen in full, so there is still nothing to guess at.
    }
  };

  /*
    ON NAVY, BECAUSE THE PANEL IS NAVY.

    This was written in the light-ground palette and dropped into a navy panel:
    the label came out charcoal-60 and the value came out `text-navy`, which is
    the panel's own background colour. The account numbers were invisible. Not
    dim, not low contrast: the same colour as the thing behind them.

    Everything here is now set against Deep Navy and measured on it. The value
    is white (15.8:1) because it is an account number somebody is about to copy
    by eye, the label is Navy 20 (10:1) and the button reads against it at every
    state. Nothing in this component may use a token meant for white ground.
  */
  return (
    <div className={cn("flex items-center justify-between gap-4 py-3", wide && "w-full")}>
      <div className="min-w-0">
        <p className="label-caps text-navy-20">{label}</p>
        <p className="mt-1 break-words text-body text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? `${label} copied` : `Copy ${label.toLowerCase()}`}
        className={cn(
          "inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-sm border px-3 text-caption",
          "transition-colors duration-micro",
          copied
            ? /* The success green is a colour for white ground and sits at 1.8:1
                 on navy. The tick and the word carry the state instead. */
              "border-white/60 bg-white/10 text-white"
            : "border-white/25 text-navy-20 hover:border-white/60 hover:text-white",
        )}
      >
        {copied ? (
          <Check size={15} strokeWidth={2} aria-hidden />
        ) : (
          <Copy size={15} strokeWidth={1.75} aria-hidden />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export default function PayNow({
  amountZmw,
  reference,
  guestName,
  className,
}: {
  /** The total for this booking. Left out on the standalone /pay page. */
  amountZmw?: number;
  reference?: string;
  guestName?: string;
  className?: string;
}) {
  if (!canPayNow()) return null;

  const hasBank = payments.bank.accounts.length > 0;

  /*
    The message the guest sends us. It carries the reference and the amount, so
    a payment can be matched to a booking without anyone asking "which stay?".
  */
  const proof = [
    guestName ? `Hello, this is ${guestName}.` : "Hello.",
    "I have just paid for my booking.",
    reference ? `Reference ${reference}.` : "",
    amountZmw ? `Amount ${money(amountZmw)}.` : "",
    "Proof of payment attached.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={cn("rounded-md bg-navy p-6 md:p-8", className)}>
      <p className="label-caps text-brass-60">Pay now</p>

      {amountZmw ? (
        <>
          <p className="mt-4 text-h2 font-extralight text-white">{money(amountZmw)}</p>
          <p className="mt-2 text-body text-navy-20">
            {reference ? (
              <>
                Send it to one of the accounts below and put{" "}
                <span className="text-white">{reference}</span> as the reference, so the payment
                lands against your booking.
              </>
            ) : (
              "Send it to one of the accounts below."
            )}
          </p>
        </>
      ) : (
        <p className="mt-4 max-w-measure text-body text-navy-20">
          These are the only accounts Dunslim Apartments collects payment through. Put your booking
          reference in the reference field so we can match the payment to your stay.
        </p>
      )}

      {payments.mobileMoney.length > 0 ? (
        <div className="mt-8">
          <p className="flex items-center gap-3 text-body text-white">
            <Smartphone size={18} strokeWidth={1.5} className="text-brass" aria-hidden />
            Mobile money
          </p>
          <div className="mt-2 divide-y divide-white/10 rounded-sm bg-white/5 px-4">
            {payments.mobileMoney.map((account) => (
              <div key={account.number} className="py-2">
                <CopyField label={account.network} value={account.number} />
                <p className="pb-3 text-caption text-navy-20">
                  {account.accountName ? (
                    <>
                      The name that comes up before you confirm is{" "}
                      <span className="text-white">{account.accountName}</span>. If it says
                      anything else, stop and message us.
                    </>
                  ) : (
                    <>
                      Check the name your phone shows before you confirm. If it is not us, stop and
                      message us.
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasBank ? (
        <div className="mt-8">
          <p className="flex items-center gap-3 text-body text-white">
            <Landmark size={18} strokeWidth={1.5} className="text-brass" aria-hidden />
            Bank transfer
          </p>
          <div className="mt-2 divide-y divide-white/10 rounded-sm bg-white/5 px-4">
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
          </div>

          {/*
            THE DOLLAR ACCOUNT NEEDS ITS OWN SENTENCE, because this site now
            carries a currency converter and a guest can read an approximate
            dollar figure off it. That figure is a mid-market conversion of a
            Kwacha price, not a price in dollars: what actually lands in the
            account is whatever their bank decides, and a shortfall discovered
            on arrival is exactly the kind of surprise this site exists to
            avoid. So the dollar amount is agreed with a person, first.
          */}
          {payments.bank.accounts.some((a) => a.currency !== "ZMW") ? (
            <p className="mt-3 max-w-measure text-caption text-navy-20">
              Paying in dollars? Message us for the exact amount before you send it. Your bank sets
              the rate, not the converter on this site, so the two will not agree.
            </p>
          ) : null}
        </div>
      ) : null}

      <a
        href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(proof)}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-8 inline-flex min-h-[52px] items-center rounded-md bg-white px-6",
          "text-[15px] font-medium text-navy transition-colors duration-micro hover:bg-stone",
        )}
      >
        Send proof on WhatsApp
      </a>

      <p className="mt-6 max-w-measure text-caption text-navy-20">
        Send us the confirmation message from your phone or bank and we will match it to your
        booking. Your dates are held while we do. Nothing on this site takes the money itself, so
        you are never asked for a card number or a PIN here, and nobody from Dunslim will ever ask
        you for one.
      </p>
    </section>
  );
}
