import tr from "../../../../messages/tr.json";
import { CONTACT } from "@/lib/contact";
import { calc, drawingSVG } from "@/lib/pallet/model";
import {
  composeSummary,
  designTitle,
  drawingLabels,
  PREF_KEYS,
  sanitizeDesign,
  TIME_KEYS,
  validateCustomer,
  type PrefKey,
  type QuoteCustomer,
  type TimeKey,
} from "@/lib/pallet/quote";

/**
 * Receives a Pallet Workshop quote request and e-mails it to Akçay Palet —
 * always in Turkish, with the technical drawing (SVG) and the 3D view (JPEG)
 * attached. Delivery goes through Resend (https://resend.com):
 *
 *   RESEND_API_KEY    required — without it this returns 503 and the page
 *                     falls back to WhatsApp / the visitor's mail app.
 *   QUOTE_TO_EMAIL    optional — defaults to CONTACT.email.
 *   QUOTE_FROM_EMAIL  optional — a sender on a domain verified in Resend,
 *                     e.g. "Akçay Palet <teklif@akcaypalet.com>".
 */

const MAX_BODY = 400_000;
const MAX_SNAPSHOT = 300_000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const recent = new Map<string, number[]>();

type Dict = { [k: string]: string | Dict };
const W = (tr as unknown as { Workshop: Dict }).Workshop;

/** Minimal translator over the Turkish messages — the e-mail is for Akçay's own team. */
function t(key: string, values?: Record<string, string | number>): string {
  let node: string | Dict | undefined = W;
  for (const part of key.split(".")) node = typeof node === "object" ? node[part] : undefined;
  if (typeof node !== "string") return key;
  return node.replace(/\{(\w+)\}/g, (_, k: string) => String(values?.[k] ?? ""));
}

const nf = new Map<number, Intl.NumberFormat>();
function fmt(n: number, digits = 0) {
  let f = nf.get(digits);
  if (!f) nf.set(digits, (f = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: digits, maximumFractionDigits: digits })));
  return f.format(n);
}

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((x) => now - x < RATE_WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  if (recent.size > 5000) recent.clear();
  return hits.length > RATE_MAX;
}

function orderNo() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `PLT-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.QUOTE_TO_EMAIL || CONTACT.email;
  if (!apiKey || !to) return Response.json({ error: "not_configured" }, { status: 503 });

  const raw = await request.text();
  if (raw.length > MAX_BODY) return Response.json({ error: "too_large" }, { status: 413 });
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  const no = orderNo();
  // Bots that fill the honeypot get a normal-looking success and nothing is sent.
  if (str(body.website, 200)) return Response.json({ no });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const customer: QuoteCustomer = {
    company: str(body.company, 120),
    name: str(body.name, 120),
    phone: str(body.phone, 40),
    email: str(body.email, 160),
    qty: Math.floor(Number(body.qty)),
    date: /^\d{4}-\d{2}-\d{2}$/.test(str(body.date, 10)) ? str(body.date, 10) : "",
    pref: PREF_KEYS.includes(body.pref as PrefKey) ? (body.pref as PrefKey) : "tel",
    time: TIME_KEYS.includes(body.time as TimeKey) ? (body.time as TimeKey) : "any",
    addr: str(body.addr, 300),
    note: str(body.note, 2000),
  };
  if (validateCustomer(customer).length) return Response.json({ error: "invalid" }, { status: 400 });

  const design = sanitizeDesign(body.design);
  const c = calc(design);
  const title = `${designTitle(t, design)} × ${Math.round(c.H)} mm`;
  const summary = composeSummary(t, design, c, fmt, customer);
  const lang = str(body.locale, 5);
  const text = `${t("mail.intro", { no })}\n${lang && lang !== "tr" ? `(${t("mail.language")}: ${lang})\n` : ""}\n${summary}`;
  const svg = drawingSVG(design, drawingLabels(t, design, c));

  const attachments: { filename: string; content: string }[] = [
    { filename: `${no}-cizim.svg`, content: Buffer.from(svg, "utf8").toString("base64") },
  ];
  const snap = str(body.snapshot, MAX_SNAPSHOT);
  const m = /^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/.exec(snap);
  if (m) attachments.push({ filename: `${no}-3d.jpg`, content: m[1] });

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.QUOTE_FROM_EMAIL || "Akçay Palet <onboarding@resend.dev>",
      to: [to],
      reply_to: customer.email,
      subject: t("mail.subject", { no, title }),
      text,
      html: `<pre style="font:14px/1.5 ui-monospace,Menlo,Consolas,monospace;white-space:pre-wrap">${escHtml(text)}</pre>`,
      attachments,
    }),
  }).catch(() => null);

  if (!res?.ok) return Response.json({ error: "send_failed" }, { status: 502 });
  return Response.json({ no });
}
