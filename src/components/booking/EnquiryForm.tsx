"use client";

import { useState } from "react";
import { Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { business } from "@/lib/content";
import { isoToday } from "@/lib/format";
import { Honeypot } from "@/components/ui/Honeypot";

/**
 * The long-stay enquiry.
 *
 * Deliberately shorter than the booking flow. A consultant on a six-week
 * engagement, or the assistant arranging it, is not going to work through a
 * date picker and a payment step for something that will be negotiated and
 * invoiced anyway. Name, dates, and what they need — the rest is a conversation.
 *
 * Like the booking flow, it never claims to have sent something it did not.
 */
export default function EnquiryForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!f.name.trim()) err.name = "Tell us who you are.";
    if (!f.email.trim()) err.email = "We need an email to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) err.email = "That email does not look right.";
    if (!f.message.trim()) err.message = "Tell us roughly what you need.";
    setErrors(err);
    if (Object.keys(err).length) return;

    setState("sending");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });
      const data = (await res.json().catch(() => ({}))) as { sent?: boolean };
      setState(res.ok && data.sent ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  if (state === "sent") {
    return (
      <div className="rounded-md bg-stone p-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy">
          <Check size={22} strokeWidth={2} className="text-white" aria-hidden />
        </div>
        <h2 className="mt-6 text-h3 font-light text-navy">Thank you, {f.name.split(" ")[0]}.</h2>
        <p className="mt-3 max-w-measure text-body text-charcoal">
          Your enquiry has reached us. Someone will come back to you with availability and a price
          for the whole stay, usually the same day.
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
          <Input id="eq-from" type="date" min={isoToday()} value={f.from} onChange={set("from")} />
        </Field>

        <Field label="Leaving" htmlFor="eq-to" hint="Or how many weeks.">
          <Input id="eq-to" type="date" min={f.from || isoToday()} value={f.to} onChange={set("to")} />
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
            placeholder="Six weeks from mid-October for two consultants, one needs a desk and a quiet room for calls."
          />
        </Field>
      </div>

      {state === "failed" ? (
        <div role="alert" className="mt-6 flex gap-3 rounded-md bg-stone p-4">
          <AlertTriangle size={20} strokeWidth={1.75} className="mt-px shrink-0 text-warning" aria-hidden />
          <p className="text-caption text-charcoal">
            This did not send, and nobody has seen it. Nothing is wrong on your end — please message
            us on{" "}
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy underline underline-offset-4"
            >
              WhatsApp
            </a>{" "}
            instead and we will pick it up straight away.
          </p>
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
