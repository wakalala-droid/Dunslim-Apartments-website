/**
 * PAYING ONLINE, THROUGH AI-BOS AND LENCO
 * ---------------------------------------------------------------------------
 * Stage two of PAYMENTS.md. A guest who has just sent the booking form pays on
 * the same screen, into Dunslim's own Lenco account, two ways:
 *
 *   mobile money  a prompt on the guest's phone (Airtel, MTN or Zamtel) that
 *                 they approve with their PIN, on the phone, never on this site
 *   bank card     Visa or Mastercard from any bank, typed into Lenco's own
 *                 secure window. The card number never touches this site or
 *                 AI-BOS.
 *
 * Paying the full price confirms the booking in AI-BOS and puts the money in
 * the books. Nobody matches a screenshot to a booking.
 *
 * Nothing here decides an amount: AI-BOS reads it from the booking and the
 * booking records what Lenco says arrived. And nothing here is offered until
 * AI-BOS says the account is live, so a guest is never shown a way to pay that
 * cannot happen. Until then the site shows its own accounts (PayNow).
 */

const API_BASE = process.env.NEXT_PUBLIC_AIBOS_API_URL ?? "";
const SITE_TOKEN = process.env.NEXT_PUBLIC_AIBOS_SITE_TOKEN ?? "";

export type PayNetwork = "airtel" | "mtn" | "zamtel";

export type OnlineOptions = {
  networks: Record<PayNetwork, boolean>;
  card: boolean;
  /** A Lenco test key: nothing real moves, and the panel says so. */
  testMode: boolean;
};

export const OFFLINE: OnlineOptions = {
  networks: { airtel: false, mtn: false, zamtel: false },
  card: false,
  testMode: false,
};

export const takesMobileMoney = (o: OnlineOptions) =>
  o.networks.airtel || o.networks.mtn || o.networks.zamtel;
export const takesOnline = (o: OnlineOptions) => takesMobileMoney(o) || o.card;

/** A refusal with the server's own words, when it gave some a guest can read. */
export class PayError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function call(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { cache: "no-store", ...init });
  } catch {
    throw new PayError("We could not reach the payment service. Check your connection and try again.", 0);
  }
  let data: Record<string, unknown> = {};
  try {
    data = (await res.json()) as Record<string, unknown>;
  } catch {
    /* No body, or not JSON. */
  }
  if (!res.ok) {
    const detail =
      typeof data.detail === "string" && data.detail.trim()
        ? data.detail.trim().slice(0, 200)
        : "The payment could not be started. Please try again.";
    throw new PayError(detail, res.status);
  }
  return data;
}

function readOptions(data: Record<string, unknown>): OnlineOptions {
  const n = (data.networks ?? {}) as Partial<Record<PayNetwork, unknown>>;
  return {
    networks: { airtel: n.airtel === true, mtn: n.mtn === true, zamtel: n.zamtel === true },
    card: data.card === true,
    testMode: data.test_mode === true,
  };
}

/** Before the form is sent: can this site take money online at all? Never throws. */
export async function getOnlineOptions(): Promise<OnlineOptions> {
  if (!API_BASE || !SITE_TOKEN) return OFFLINE;
  try {
    return readOptions(await call(`/public/stay/${SITE_TOKEN}/payments`));
  } catch {
    return OFFLINE;
  }
}

export type StayToPay = {
  amountDue: number;
  currency: string;
  payable: boolean;
  options: OnlineOptions;
};

/** What this booking's payment link asks for now, and how it can be paid. */
export async function getStayToPay(token: string): Promise<StayToPay> {
  const data = await call(`/pay/stay/${encodeURIComponent(token)}`);
  const stay = (data.stay ?? {}) as { amount_due?: unknown; currency?: unknown; payable?: unknown };
  return {
    amountDue: Number(stay.amount_due) || 0,
    currency: typeof stay.currency === "string" ? stay.currency : "ZMW",
    payable: stay.payable === true,
    options: readOptions(data),
  };
}

export async function startMobileMoney(
  token: string,
  network: PayNetwork,
  phone: string,
): Promise<{ reference: string; amount: number }> {
  const data = await call(`/pay/stay/${encodeURIComponent(token)}/initiate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ network, payer_phone: phone }),
  });
  return { reference: String(data.reference ?? ""), amount: Number(data.amount) || 0 };
}

export type CardStart = {
  reference: string;
  amount: number;
  currency: string;
  label: string;
  publicKey: string;
  script: string;
  testMode: boolean;
};

export async function startCard(token: string): Promise<CardStart> {
  const data = await call(`/pay/stay/${encodeURIComponent(token)}/card`, { method: "POST" });
  return {
    reference: String(data.reference ?? ""),
    amount: Number(data.amount) || 0,
    currency: String(data.currency ?? "ZMW"),
    label: String(data.label ?? ""),
    publicKey: String(data.public_key ?? ""),
    script: String(data.script ?? ""),
    testMode: data.test_mode === true,
  };
}

export type PaymentCheck = {
  status: "pending" | "successful" | "failed";
  /** Once paid: did the booking confirm? False means paid short, or the
   *  dates went while the guest paid, and a person will be in touch. */
  confirmed: boolean | null;
};

export async function checkPayment(token: string, reference: string): Promise<PaymentCheck> {
  const data = await call(
    `/pay/stay/${encodeURIComponent(token)}/status/${encodeURIComponent(reference)}`,
  );
  const status =
    data.status === "successful" || data.status === "failed" ? data.status : "pending";
  return { status, confirmed: typeof data.confirmed === "boolean" ? data.confirmed : null };
}

// ---------------------------------------------------------------------------
// Lenco's card window
// ---------------------------------------------------------------------------

type LencoOptions = {
  key: string;
  reference: string;
  email: string;
  amount: number;
  currency: string;
  label?: string;
  bearer: "merchant" | "customer";
  channels: ("card" | "mobile-money")[];
  customer?: { firstName?: string; lastName?: string; phone?: string };
  onSuccess: (response: { reference?: string }) => void;
  onClose: () => void;
  onConfirmationPending: () => void;
};

declare global {
  interface Window {
    LencoPay?: { getPaid: (options: LencoOptions) => void };
  }
}

/** Lenco's script and nothing else: pay.lenco.co, or pay.sandbox.lenco.co for a test key. */
const LENCO_SCRIPT = /^https:\/\/pay(\.sandbox)?\.lenco\.co\/js\/v1\/inline\.js$/;
let loading: Promise<void> | null = null;

function loadLenco(src: string): Promise<void> {
  if (!LENCO_SCRIPT.test(src)) {
    return Promise.reject(new PayError("The card window could not be opened.", 0));
  }
  if (window.LencoPay) return Promise.resolve();
  if (!loading) {
    loading = new Promise<void>((resolve, reject) => {
      const tag = document.createElement("script");
      tag.src = src;
      tag.async = true;
      tag.onload = () =>
        window.LencoPay
          ? resolve()
          : reject(new PayError("The card window did not open. Please try again.", 0));
      tag.onerror = () => {
        loading = null;
        tag.remove();
        reject(new PayError("The card window could not load. Check your connection and try again.", 0));
      };
      document.head.appendChild(tag);
    });
  }
  return loading;
}

/** How the window ended: paid, closed, or waiting on the bank (3-D Secure). */
export type CardOutcome = "success" | "closed" | "pending";

export async function openCardWindow(
  start: CardStart,
  guest: { email: string; firstName?: string; lastName?: string; phone?: string },
): Promise<CardOutcome> {
  await loadLenco(start.script);
  return new Promise<CardOutcome>((resolve) => {
    let done = false;
    const end = (outcome: CardOutcome) => {
      if (!done) {
        done = true;
        resolve(outcome);
      }
    };
    window.LencoPay!.getPaid({
      key: start.publicKey,
      reference: start.reference,
      email: guest.email,
      amount: start.amount,
      currency: start.currency,
      label: start.label || undefined,
      bearer: "merchant",
      channels: ["card"],
      customer: { firstName: guest.firstName, lastName: guest.lastName, phone: guest.phone },
      onSuccess: () => end("success"),
      onClose: () => end("closed"),
      onConfirmationPending: () => end("pending"),
    });
  });
}

/** Which network a Zambian number is on, read off its prefix, as a first guess. */
export function networkOf(phone: string): PayNetwork | null {
  const digits = phone.replace(/\D/g, "").replace(/^260/, "0").replace(/^(?=[79])/, "0");
  if (/^0(97|77)/.test(digits)) return "airtel";
  if (/^0(96|76)/.test(digits)) return "mtn";
  if (/^0(95|75)/.test(digits)) return "zamtel";
  return null;
}

export const looksLikeEmail = (value: string) =>
  /^[^@\s<>"',;]+@[^@\s<>"',;]+\.[a-z]{2,}$/i.test(value.trim());
