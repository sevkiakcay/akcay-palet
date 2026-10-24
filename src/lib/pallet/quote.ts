import {
  BASE,
  isNumberField,
  isSelectField,
  SCHEMA,
  type Calc,
  type PalletDesign,
} from "@/lib/pallet/model";

export const PREF_KEYS = ["tel", "wa", "mail"] as const;
export const TIME_KEYS = ["any", "morning", "afternoon", "evening"] as const;
export type PrefKey = (typeof PREF_KEYS)[number];
export type TimeKey = (typeof TIME_KEYS)[number];

export type QuoteCustomer = {
  company: string;
  name: string;
  phone: string;
  email: string;
  qty: number;
  date: string;
  pref: PrefKey;
  time: TimeKey;
  addr: string;
  note: string;
};

export type QuotePayload = QuoteCustomer & {
  locale: string;
  design: PalletDesign;
  /** JPEG data URL of the 3D view, optional. */
  snapshot?: string;
  /** Honeypot — real visitors never fill it. */
  website?: string;
};

export type FieldError = "company" | "name" | "phone" | "email" | "qty";

export function validateCustomer(c: QuoteCustomer): FieldError[] {
  const errs: FieldError[] = [];
  if (!c.company.trim()) errs.push("company");
  if (!c.name.trim()) errs.push("name");
  if (c.phone.replace(/\D/g, "").length < 10) errs.push("phone");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email.trim())) errs.push("email");
  if (!(Number.isInteger(c.qty) && c.qty >= 1 && c.qty <= 1_000_000)) errs.push("qty");
  return errs;
}

/** Rebuilds a design from untrusted input: unknown keys dropped, numbers clamped to their field range, enums checked. */
export function sanitizeDesign(raw: unknown): PalletDesign {
  const src = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const d: PalletDesign = { ...BASE };
  for (const g of SCHEMA) {
    for (const f of g.items) {
      const v = src[f.k];
      if (isNumberField(f)) {
        const n = Number(v);
        if (Number.isFinite(n)) d[f.k] = Math.min(f.max, Math.max(f.min, Math.round(n / f.step) * f.step));
      } else if (isSelectField(f)) {
        if (typeof v === "string" && f.options.includes(v)) Object.assign(d, { [f.k]: v });
      } else if (typeof v === "string") {
        d.stamp = v.slice(0, f.max);
      }
    }
  }
  return d;
}

type Translate = (key: string, values?: Record<string, string | number>) => string;

/** Short name of a design, e.g. "Takozlu 1200×800". */
export function designTitle(t: Translate, d: PalletDesign) {
  return t("designTitle", { type: t(`typeShort.${d.type}`), L: d.L, W: d.W });
}

/**
 * Plain-text summary of a design + request, in whatever language `t`
 * speaks. Used for the WhatsApp/e-mail fallback (visitor's language) and
 * for the e-mail Akçay receives (always Turkish).
 */
export function composeSummary(
  t: Translate,
  d: PalletDesign,
  c: Calc,
  fmt: (n: number, digits?: number) => string,
  customer?: QuoteCustomer,
): string {
  const lines: string[] = [];
  lines.push(`${designTitle(t, d)} × ${Math.round(c.H)} mm`);
  lines.push(
    `${t("fields.wood")}: ${t(`options.wood.${d.wood}`)} · ${t("fields.treat")}: ${t(`options.treat.${d.treat}`)}`,
  );
  if (d.paint !== "yok") lines.push(`${t("fields.paint")}: ${t(`options.paint.${d.paint}`)}`);
  if (d.stamp.trim()) lines.push(`${t("fields.stamp")}: ${d.stamp.trim()}`);
  lines.push(
    `${t("metrics.weight")}: ${fmt(c.weight, 1)} kg · ${t("metrics.dyn")}: ${fmt(c.dyn)} kg · ${t("metrics.stat")}: ${fmt(c.stat)} kg`,
  );
  lines.push("");
  lines.push(`${t("bomTitle")}:`);
  for (const r of c.bom) {
    const pres = r.k === "block" && d.blkMat === "pres" ? ` ${t("presSuffix")}` : "";
    lines.push(`- ${t(`parts.${r.k}`)}${pres}: ${r.n} × ${r.dims.join("×")} mm`);
  }
  if (customer) {
    lines.push("");
    lines.push(`${t("form.qty")}: ${fmt(customer.qty)}`);
    if (customer.date) lines.push(`${t("form.date")}: ${customer.date}`);
    lines.push(`${t("form.company")}: ${customer.company}`);
    lines.push(`${t("form.name")}: ${customer.name}`);
    lines.push(`${t("form.phone")}: ${customer.phone}`);
    lines.push(`${t("form.email")}: ${customer.email}`);
    lines.push(`${t("form.pref")}: ${t(`prefs.${customer.pref}`)} · ${t("form.time")}: ${t(`times.${customer.time}`)}`);
    if (customer.addr) lines.push(`${t("form.addr")}: ${customer.addr}`);
    if (customer.note) lines.push(`${t("form.note")}: ${customer.note}`);
  }
  return lines.join("\n");
}

export function drawingLabels(t: Translate, d: PalletDesign, c: Calc) {
  return {
    top: t("drawing.top"),
    front: t("drawing.front"),
    side: t("drawing.side"),
    caption: t("drawing.caption", {
      title: designTitle(t, d),
      H: Math.round(c.H),
      wood: t(`options.wood.${d.wood}`),
    }),
  };
}
