"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CONTACT, whatsappUrl } from "@/lib/contact";

/** Index of the "custom size" entry in `Quote.dimensions` — options are tracked by index, not label, so every language works. */
const CUSTOM_DIMENSION_INDEX = 3;

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-[14px] text-foreground outline-none transition-colors focus:border-primary";
const labelClass = "text-[12px] font-medium text-muted-foreground";

/**
 * The actual quote-request experience, as progressive disclosure rather than
 * one long form: pick what you need first (low commitment), then specify it,
 * then send. No backend exists, so sending hands the composed message to
 * whichever real channel is configured in `src/lib/contact.ts` — never a
 * fabricated one. The message is composed in the visitor's language.
 */
export function QuoteForm() {
  const t = useTranslations("Quote");
  const stepLabels = t.raw("steps") as string[];
  const palletTypes = t.raw("palletTypes") as string[];
  const dimensions = t.raw("dimensions") as string[];
  const heatOptions = t.raw("heatOptions") as string[];

  const [step, setStep] = useState(0);
  const [palletTypeIndex, setPalletTypeIndex] = useState<number | null>(null);
  const [dimensionIndex, setDimensionIndex] = useState(0);
  const [customDimension, setCustomDimension] = useState("");
  const [quantity, setQuantity] = useState("");
  const [heatIndex, setHeatIndex] = useState(0);
  const [notes, setNotes] = useState("");

  const hasChannel = Boolean(CONTACT.whatsappNumber || CONTACT.email);
  const palletType = palletTypes[palletTypeIndex ?? 0];
  const isCustomDimension = dimensionIndex === CUSTOM_DIMENSION_INDEX;
  const dimensionText =
    isCustomDimension && customDimension
      ? `${dimensions[dimensionIndex]} (${customDimension})`
      : dimensions[dimensionIndex];
  const quantityText = quantity || t("notSpecified");

  function buildMessage() {
    const lines = [
      t("messageIntro"),
      "",
      `${t("palletType")}: ${palletType}`,
      `${t("dimension")}: ${dimensionText}`,
      `${t("quantity")}: ${quantityText}`,
      `${t("heat")}: ${heatOptions[heatIndex]}`,
    ];
    if (notes) lines.push(`${t("messageNote")}: ${notes}`);
    return lines.join("\n");
  }

  function handleSend() {
    const message = buildMessage();
    const wa = whatsappUrl(message);
    if (wa) {
      window.open(wa, "_blank", "noopener,noreferrer");
      return;
    }
    if (CONTACT.email) {
      window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(t("emailSubject"))}&body=${encodeURIComponent(message)}`;
    }
  }

  const reviewRows = [
    { label: t("palletType"), value: palletType },
    { label: t("dimension"), value: dimensionText },
    { label: t("quantity"), value: quantityText },
    { label: t("heat"), value: heatOptions[heatIndex] },
  ];

  return (
    <div className="mx-auto mt-10 w-full max-w-[520px] rounded-2xl border border-surface-dark-foreground/10 bg-surface-dark-foreground/[0.03] p-6 text-start md:p-8">
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`text-[11px] font-medium tracking-wide uppercase ${i === step ? "text-primary" : "text-surface-dark-foreground/35"}`}
            >
              {i + 1}. {label}
            </span>
            {i < stepLabels.length - 1 && <span className="h-px flex-1 bg-surface-dark-foreground/10" aria-hidden />}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div>
          <p className="text-[16px] font-semibold text-surface-dark-foreground">{t("chooseTitle")}</p>
          <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {palletTypes.map((type, i) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setPalletTypeIndex(i);
                  setStep(1);
                }}
                className="rounded-lg border border-surface-dark-foreground/15 bg-transparent px-4 py-3.5 text-start text-[14px] font-medium text-surface-dark-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <p className="text-[16px] font-semibold text-surface-dark-foreground">{t("detailsTitle", { type: palletType })}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>{t("dimension")}</span>
              <select
                value={dimensionIndex}
                onChange={(e) => setDimensionIndex(Number(e.target.value))}
                className={inputClass}
              >
                {dimensions.map((d, i) => (
                  <option key={d} value={i}>
                    {d}
                  </option>
                ))}
              </select>
            </label>

            {isCustomDimension && (
              <label className="flex flex-col gap-1.5">
                <span className={labelClass}>{t("customDimension")}</span>
                <input
                  type="text"
                  dir="ltr"
                  value={customDimension}
                  onChange={(e) => setCustomDimension(e.target.value)}
                  placeholder={t("customPlaceholder")}
                  className={inputClass}
                />
              </label>
            )}

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>{t("quantity")}</span>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={t("quantityPlaceholder")}
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>{t("heat")}</span>
              <select value={heatIndex} onChange={(e) => setHeatIndex(Number(e.target.value))} className={inputClass}>
                {heatOptions.map((h, i) => (
                  <option key={h} value={i}>
                    {h}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 sm:col-span-2">
              <span className={labelClass}>{t("notes")}</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder={t("notesPlaceholder")}
                className={inputClass}
              />
            </label>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(0)}
              className="text-[13px] font-medium text-surface-dark-foreground/60 hover:text-surface-dark-foreground"
            >
              <span aria-hidden className="inline-block rtl:-scale-x-100">
                ←
              </span>{" "}
              {t("back")}
            </button>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="ms-auto rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("continue")}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <p className="text-[16px] font-semibold text-surface-dark-foreground">{t("reviewTitle")}</p>
          <dl className="mt-4 space-y-2 text-[14px]">
            {reviewRows.map((row, i) => (
              <div
                key={row.label}
                className={`flex justify-between gap-4 py-2 ${i < reviewRows.length - 1 ? "border-b border-surface-dark-foreground/10" : ""}`}
              >
                <dt className="text-surface-dark-foreground/50">{row.label}</dt>
                <dd className="text-end font-medium text-surface-dark-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-[13px] font-medium text-surface-dark-foreground/60 hover:text-surface-dark-foreground"
            >
              <span aria-hidden className="inline-block rtl:-scale-x-100">
                ←
              </span>{" "}
              {t("back")}
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={!hasChannel}
              className="ms-auto flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("send")}
              <span aria-hidden className="rtl:-scale-x-100">
                →
              </span>
            </button>
          </div>

          {!hasChannel && <p className="mt-3 text-[12px] text-surface-dark-foreground/50">{t("noChannel")}</p>}
        </div>
      )}
    </div>
  );
}
