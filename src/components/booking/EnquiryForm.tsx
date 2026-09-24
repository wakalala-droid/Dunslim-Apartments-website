"use client";

import { useEffect, useState } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { business } from "@/lib/content";
import { makeReference } from "@/lib/availability";
import { isoToday, isoPlusDays, prettyDate } from "@/lib/format";
import { Honeypot } from "@/components/ui/Honeypot";

/**
 * The long-stay enquiry.
 *
 * Deliberately shorter than the booking flow. A consultant on a six-week
 * engagement, or the assistant arranging it, is not going to work through a
 * date picker and a payment step for something that will be negotiated and
 * invoiced anyway. Name, dates and what they need. The rest is a conversation.
 *
 * Like the booking flow, it never claims to have sent something it did not.
 */
export default function EnquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  /*
    A reference, the same as a booking gets.

    An enquiry used to vanish into a thank-you with nothing to quote. A guest
    chasing it a week later could only say "I sent something through your
    website", which is not enough to find it in an inbox and the reservations
    side had no handle either. `LS` rather than `DA` so the two are
    distinguishable at a glance: a long-stay enquiry is answered by a person
    writing a quote, a booking request by someone checking a calendar.
  */
  const [reference, setReference] = useState("");

  /*
    Today, after mount rather than during render. A `min` computed while
    rendering is baked into prerendered HTML and freezes at the last deploy, so
    it drifts further into the past with every day that passes without one.
  */
  const [today, setToday] = useState("");
  useEffect(() => setToday(isoToday()), []);
  const [f, setF] = useState({
    name: "",
    organisation: "",
    email: "",
    phone: "",
    from: "",
    to: "",
    people: "",
    invoice: false,
    message: "",
    company_website: "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((prev) => ({
      ...prev,
      [k]: e.target instanceof HTMLInputElement && e.target.type === "checkbox"
        ? e.target.checked
        : e.target.value,
    }));

  // The enquiry written out as a WhatsApp message, for when the form fails.
  // The year is written out: an enquiry is often for next year and "1 Sept"
  // alone leaves the reader guessing which one.
  const withYear = (iso: string) => {
    const pretty = prettyDate(iso);
    return pretty ? `${pretty} ${iso.slice(0, 4)}` : iso;
  };
  const enquiryText = () => {
    const details = [
      reference ? `Reference ${reference}` : "",
      `Name: ${f.name}`,
      f.organisation ? `Organisation: ${f.organisation}` : "",
      `Email: ${f.email}`,
      f.phone ? `Phone: ${f.phone}` : "",
      f.from ? `Arriving: ${withYear(f.from)}` : "",
      f.to ? `Leaving: ${withYear(f.to)}` : "",
      f.people ? `People: ${f.people}` : "",
      f.invoice ? "I will need an invoice." : "",
    ].filter(Boolean);
    return [
      "Hello, I sent a long-stay enquiry on your website and it did not go through.",
      details.join("\n"),
      f.message.trim(),
    ].join("\n\n");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "sending") return;

    const err: Record<string, string> = {};
    if (!f.name.trim()) err.name = "Tell us who you are.";
    if (!f.email.trim()) err.email = "We need an email to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = "That email does not look right.";
    if (!f.message.trim()) err.message = "Tell us roughly what you need.";
    if (f.from && f.to && f.to <= f.from) err.to = "Leaving should be after arriving.";
    setErrors(err);

    if (Object.keys(err).length) {
      /*
        Put the cursor in the first field that needs attention. The message used
        to appear beside its field with focus left wherever it was, which on a
        form this tall can be off screen and a screen reader announced nothing
        at all. The field's error is wired to it by aria-describedby now, so
        moving focus reads the message out.
      */
      const order: [string, string][] = [
        ["name", "eq-name"],
        ["email", "eq-email"],
        ["to", "eq-to"],
        ["message", "eq-message"],
      ];
      const first = order.find(([field]) => err[field]);
      if (first) document.getElementById(first[1])?.focus();
      return;
    }

    setState("sending");
    const ref = makeReference("LS");
    setReference(ref);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, reference: ref }),
      });
      const data = (await res.json().catch(() => ({}))) as { sent?: boolean };
      setState(res.ok && data.sent ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  if (state === "sent") {
    /*
      What was actually sent, echoed back.

      This was a thank-you and nothing else. A guest who had just typed out six
      weeks of dates, a headcount and a paragraph about what they needed had no
      record of any of it and nothing to quote if they chased it. The booking
      flow has always shown this; the enquiry, which is the higher-value of the
      two, showed none of it.
    */
    const sent: [string, string][] = [
      ["Reference", reference],
      ["Name", f.name],
      ...(f.organisation ? ([["Organisation", f.organisation]] as [string, string][]) : []),
      ...(f.from ? ([["Arriving", withYear(f.from)]] as [string, string][]) : []),
      ...(f.to ? ([["Leaving", withYear(f.to)]] as [string, string][]) : []),
      ...(f.people ? ([["People", f.people]] as [string, string][]) : []),
      ["Invoice needed", f.invoice ? "Yes" : "No"],
      ["Reply to", f.email],
    ];

    return (
      <div className="rounded-md bg-stone p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy">
          <Check size={22} strokeWidth={2} className="text-white" aria-hidden />
        </div>
        <h2 className="mt-6 text-h3 font-light text-navy">Thank you, {f.name.split(" ")[0]}.</h2>
        <p className="mt-3 max-w-measure text-body text-charcoal">
          Your enquiry has reached us. Someone will come back to you with availability and a price
          for the whole stay, usually the same day. Quote{" "}
          <span className="text-navy">{reference}</span> if you need to chase it.
        </p>

        <dl className="mt-8 divide-y divide-navy/10 border-y border-navy/10">
          {sent.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 py-3">
              <dt className="text-caption text-charcoal-60">{k}</dt>
              <dd className="text-right text-caption text-charcoal">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 max-w-measure text-caption text-charcoal-80">
          A car, with or without a driver, can be hired for the whole engagement if you would like
          one. Nothing is booked or charged until we have agreed the price with you.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-md bg-white p-6 shadow-2 ring-1 ring-navy/10 md:p-8">
      <Honeypot value={f.company_website} onChange={(v) => setF((p) => ({ ...p, company_website: v }))} />
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Your name" htmlFor="eq-name" required error={errors.name}>
          <Input id="eq-name" autoComplete="name" value={f.name} onChange={set("name")} />
        </Field>

        <Field label="Organisation" htmlFor="eq-org" hint="If someone else is paying.">
          <Input
            id="eq-org"
            autoComplete="organization"
            value={f.organisation}
            onChange={set("organisation")}
          />
        </Field>

        <Field label="Email" htmlFor="eq-email" required error={errors.email}>
          <Input id="eq-email" type="email" autoComplete="email" value={f.email} onChange={set("email")} />
        </Field>

        <Field label="Phone" htmlFor="eq-phone" hint="WhatsApp is fine.">
          <Input id="eq-phone" type="tel" autoComplete="tel" placeholder="+260" value={f.phone} onChange={set("phone")} />
        </Field>

        <Field label="Arriving" htmlFor="eq-from" hint="Approximate is fine.">
          <Input id="eq-from" type="date" min={today || undefined} value={f.from} onChange={set("from")} />
        </Field>

        <Field label="Leaving" htmlFor="eq-to" hint="Or how many weeks." error={errors.to}>
          <Input
            id="eq-to"
            type="date"
            min={(f.from ? isoPlusDays(f.from, 1) : isoPlusDays(today, 1)) || undefined}
            value={f.to}
            onChange={set("to")}
          />
        </Field>

        <Field label="How many people" htmlFor="eq-people">
          <Input id="eq-people" inputMode="numeric" value={f.people} onChange={set("people")} />
        </Field>

        <div className="flex items-end pb-1">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={f.invoice}
              onChange={set("invoice")}
              className="h-4 w-4 shrink-0 accent-navy"
            />
            <span className="text-body text-charcoal">I will need an invoice</span>
          </label>
        </div>

        <Field
          label="What do you need"
          htmlFor="eq-message"
          required
          error={errors.message}
          className="sm:col-span-2"
        >
          <Textarea
            id="eq-message"
            value={f.message}
            onChange={set("message")}
            placeholder="Six weeks from mid-October for two consultants, one needs a quiet room for calls."
          />
        </Field>
      </div>

      {/*
        WHEN IT CANNOT SEND, WHATSAPP CARRIES THE WHOLE ENQUIRY.

        The owner tested this on 14 September 2026 and got the failure: the
        live site has no mail keys, so every enquiry was refused. The old notice
        was honest but it sent the guest to a blank WhatsApp chat to type six
        weeks of dates and a paragraph out a second time, which most people
        will not do. The button below opens WhatsApp with everything they wrote
        already in the message. One tap to send and nothing is lost.
      */}
      {state === "failed" ? (
        <div role="alert" className="mt-6 rounded-md bg-stone p-6">
          <div className="flex gap-3">
            <AlertTriangle size={20} strokeWidth={1.75} className="mt-1 shrink-0 text-warning" aria-hidden />
            <p className="text-body text-charcoal">
              Our form could not send this, so nobody has seen it yet. Nothing is wrong on your end.
              Send it to us on WhatsApp instead: everything you typed is already in the message.
            </p>
          </div>
          <a
            href={`https://wa.me/${business.whatsapp}?text=${encodeURIComponent(enquiryText())}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-navy px-6 text-[15px] font-medium text-white transition-colors duration-micro hover:bg-navy-80"
          >
            Send it on WhatsApp
          </a>
        </div>
      ) : null}

      <Button type="submit" size="lg" disabled={state === "sending"} className="mt-8 w-full sm:w-auto">
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </Button>

      <p className="mt-4 text-caption text-charcoal-80">
        We reply to every enquiry. Your details are used to answer you and nothing else.
      </p>
    </form>
  );
}
