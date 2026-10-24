"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CONTACT, whatsappUrl } from "@/lib/contact";
import type { Calc, PalletDesign } from "@/lib/pallet/model";
import {
  composeSummary,
  PREF_KEYS,
  TIME_KEYS,
  validateCustomer,
  type FieldError,
  type PrefKey,
  type QuoteCustomer,
  type TimeKey,
} from "@/lib/pallet/quote";

type Props = {
  design: PalletDesign;
  calc: Calc;
  snapshot: string | null;
  title: string;
  fmt: (n: number, digits?: number) => string;
  onDownloadDrawing: () => void;
  onClose: () => void;
};

type Phase = { k: "form" } | { k: "sending" } | { k: "sent"; no: string } | { k: "fallback"; no: string };

const DRAFT_KEY = "pw_contact";
const field = "w-full rounded-lg border border-border bg-background px-3 py-2 text-[14px] outline-none focus:border-primary";
const lbl = "mb-1 block text-[12px] font-medium";

function newOrderNo() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `PLT-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function readDraft(): Partial<QuoteCustomer> {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Partial<QuoteCustomer>;
  } catch {
    return {};
  }
}

export function QuoteDialog({ design, calc, snapshot, title, fmt, onDownloadDrawing, onClose }: Props) {
  const t = useTranslations("Workshop");
  const locale = useLocale();
  const [phase, setPhase] = useState<Phase>({ k: "form" });
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [sendError, setSendError] = useState(false);
  const [customer, setCustomer] = useState<QuoteCustomer>(() => {
    const d = typeof window === "undefined" ? {} : readDraft();
    return {
      company: d.company ?? "",
      name: d.name ?? "",
      phone: d.phone ?? "",
      email: d.email ?? "",
      qty: 100,
      date: "",
      pref: PREF_KEYS.includes(d.pref as PrefKey) ? (d.pref as PrefKey) : "tel",
      time: TIME_KEYS.includes(d.time as TimeKey) ? (d.time as TimeKey) : "any",
      addr: d.addr ?? "",
      note: "",
    };
  });
  const [honeypot, setHoneypot] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);
  const [minDate] = useState(() => new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10));

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  function set<K extends keyof QuoteCustomer>(k: K, v: QuoteCustomer[K]) {
    setCustomer((c) => ({ ...c, [k]: v }));
  }

  function fallbackMessage(no: string) {
    return `${t("mail.intro", { no })}\n\n${composeSummary(t, design, calc, fmt, customer)}`;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateCustomer(customer);
    setErrors(errs);
    if (errs.length) return;
    try {
      const { company, name, phone, email, pref, time, addr } = customer;
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ company, name, phone, email, pref, time, addr }));
    } catch {
      /* storage unavailable — nothing to remember */
    }
    setSendError(false);
    setPhase({ k: "sending" });
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...customer, locale, design, snapshot: snapshot ?? undefined, website: honeypot }),
      });
      const data = (await res.json().catch(() => ({}))) as { no?: string; error?: string };
      if (res.ok && data.no) {
        setPhase({ k: "sent", no: data.no });
        return;
      }
      if (res.status === 400) {
        setSendError(true);
        setPhase({ k: "form" });
        return;
      }
      // E-mail delivery isn't configured or failed — hand the request to WhatsApp / the mail app instead.
      setPhase({ k: "fallback", no: newOrderNo() });
    } catch {
      setPhase({ k: "fallback", no: newOrderNo() });
    }
  }

  const err = (k: FieldError) =>
    errors.includes(k) ? <p className="mt-1 text-[12px] text-destructive">{t(`errors.${k}`)}</p> : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-auto bg-black/45 px-4 py-6 md:py-12"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="pw-quote-title" className="w-full max-w-[640px] rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 id="pw-quote-title" className="font-heading text-[20px] font-bold">
            {phase.k === "sent" ? t("success.title") : phase.k === "fallback" ? t("fallback.title") : t("form.title")}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("form.close")} className="px-2 text-[22px] leading-none text-muted-foreground">
            ×
          </button>
        </div>

        {(phase.k === "form" || phase.k === "sending") && (
          <form onSubmit={submit} noValidate>
            <div className="grid gap-3.5 px-5 py-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-alt p-2.5">
                {snapshot && (
                  // eslint-disable-next-line @next/next/no-img-element -- in-memory data URL, nothing for next/image to optimise
                  <img src={snapshot} alt={t("form.snapshotAlt")} className="w-[120px] flex-none rounded" />
                )}
                <div className="min-w-0 text-[13px]">
                  <b>{title}</b>
                  <br />
                  {t(`options.wood.${design.wood}`)} · {t(`options.treat.${design.treat}`)}
                  <br />
                  <span className="font-mono">
                    {fmt(calc.weight, 1)} kg · {t("metrics.dyn")} {fmt(calc.dyn)} kg
                  </span>
                </div>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2">
                <div>
                  <label htmlFor="q_company" className={lbl}>
                    {t("form.company")} <span className="text-destructive">*</span>
                  </label>
                  <input ref={firstRef} id="q_company" autoComplete="organization" className={field} value={customer.company} onChange={(e) => set("company", e.target.value)} />
                  {err("company")}
                </div>
                <div>
                  <label htmlFor="q_name" className={lbl}>
                    {t("form.name")} <span className="text-destructive">*</span>
                  </label>
                  <input id="q_name" autoComplete="name" className={field} value={customer.name} onChange={(e) => set("name", e.target.value)} />
                  {err("name")}
                </div>
                <div>
                  <label htmlFor="q_phone" className={lbl}>
                    {t("form.phone")} <span className="text-destructive">*</span>
                  </label>
                  <input id="q_phone" type="tel" dir="ltr" autoComplete="tel" placeholder="+90 5xx xxx xx xx" className={field} value={customer.phone} onChange={(e) => set("phone", e.target.value)} />
                  {err("phone")}
                </div>
                <div>
                  <label htmlFor="q_email" className={lbl}>
                    {t("form.email")} <span className="text-destructive">*</span>
                  </label>
                  <input id="q_email" type="email" dir="ltr" autoComplete="email" className={field} value={customer.email} onChange={(e) => set("email", e.target.value)} />
                  {err("email")}
                </div>
                <div>
                  <label htmlFor="q_qty" className={lbl}>
                    {t("form.qty")} <span className="text-destructive">*</span>
                  </label>
                  <input id="q_qty" type="number" min={1} step={1} className={`${field} font-mono`} value={customer.qty || ""} onChange={(e) => set("qty", Math.floor(Number(e.target.value)) || 0)} />
                  {err("qty")}
                </div>
                <div>
                  <label htmlFor="q_date" className={lbl}>
                    {t("form.date")}
                  </label>
                  <input id="q_date" type="date" min={minDate} className={field} value={customer.date} onChange={(e) => set("date", e.target.value)} />
                </div>
                <div>
                  <label htmlFor="q_pref" className={lbl}>
                    {t("form.pref")}
                  </label>
                  <select id="q_pref" className={field} value={customer.pref} onChange={(e) => set("pref", e.target.value as PrefKey)}>
                    {PREF_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {t(`prefs.${k}`)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="q_time" className={lbl}>
                    {t("form.time")}
                  </label>
                  <select id="q_time" className={field} value={customer.time} onChange={(e) => set("time", e.target.value as TimeKey)}>
                    {TIME_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {t(`times.${k}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="q_addr" className={lbl}>
                  {t("form.addr")}
                </label>
                <input id="q_addr" autoComplete="street-address" placeholder={t("form.addrPlaceholder")} className={field} value={customer.addr} onChange={(e) => set("addr", e.target.value)} />
              </div>
              <div>
                <label htmlFor="q_note" className={lbl}>
                  {t("form.note")}
                </label>
                <textarea id="q_note" rows={3} placeholder={t("form.notePlaceholder")} className={field} value={customer.note} onChange={(e) => set("note", e.target.value)} />
              </div>
              {/* Honeypot: hidden from people and screen readers, bots tend to fill it. */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="q_website">Website</label>
                <input id="q_website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
              </div>
              {sendError && (
                <p role="alert" className="text-[13px] text-destructive">
                  {t("errors.send")}
                </p>
              )}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-border px-5 py-3.5">
              <button type="button" onClick={onClose} className="rounded-full border border-border px-4 py-2 text-[14px] font-medium">
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                disabled={phase.k === "sending"}
                className="rounded-full bg-primary px-5 py-2 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {phase.k === "sending" ? t("form.sending") : t("form.submit")}
              </button>
            </div>
          </form>
        )}

        {phase.k === "sent" && (
          <div className="grid justify-items-center gap-3 px-5 py-8 text-center">
            <div className="-rotate-2 rounded border-2 border-primary px-3.5 py-1.5 font-mono text-[18px] text-primary">{phase.no}</div>
            <p className="max-w-[46ch] text-[14px]">
              {t("success.body", { contact: customer.pref === "mail" ? customer.email : customer.phone })}
            </p>
            {CONTACT.phone && (
              <p className="text-[13px] text-muted-foreground">
                {t("success.urgent")}{" "}
                <b className="font-mono" dir="ltr">
                  {CONTACT.phone}
                </b>
              </p>
            )}
            <button type="button" onClick={onClose} className="mt-1 rounded-full border border-border px-4 py-2 text-[14px] font-medium">
              {t("success.newDesign")}
            </button>
          </div>
        )}

        {phase.k === "fallback" && (
          <div className="grid gap-3 px-5 py-6">
            <p className="text-[14px]">{t("fallback.body")}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {whatsappUrl() && (
                <a
                  href={whatsappUrl(fallbackMessage(phase.no)) ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary px-4 py-2.5 text-center text-[14px] font-semibold text-primary-foreground"
                >
                  {t("fallback.whatsapp")}
                </a>
              )}
              {CONTACT.email && (
                <a
                  href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(t("mail.subject", { no: phase.no, title }))}&body=${encodeURIComponent(fallbackMessage(phase.no))}`}
                  className="rounded-full border border-border px-4 py-2.5 text-center text-[14px] font-semibold"
                >
                  {t("fallback.email")}
                </a>
              )}
            </div>
            <button type="button" onClick={onDownloadDrawing} className="justify-self-start text-[13px] font-medium text-primary underline underline-offset-2">
              {t("fallback.drawing")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
