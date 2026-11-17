"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CONTACT, whatsappUrl } from "@/lib/contact";
import { panelSwap, withoutMovement } from "@/lib/motion";
import { CtaArrow } from "../shared/CtaArrow";

/** Index of the "custom size" entry in `Quote.dimensions` — options are tracked by index, not label, so every language works. */
const CUSTOM_DIMENSION_INDEX = 3;

// This form sits inside FinalCta, which is `bg-black text-white`. It used to
// style itself from the legacy copper token set (`--primary`, `--background`,
// `--muted-foreground`) — tokens tuned for light grounds — so a copper form
// appeared inside a black-and-white editorial section, and the labels came out
// at 2.81:1 against the panel ground, under the 4.5:1 WCAG AA floor for body
// text. Everything below is now `white/<alpha>` on the section's own ground,
// and the buttons use the same white pill as FinalCta's own CTAs.
//
// Measured against this panel's ground (`white/[0.03]` over black, ≈ #080808):
// labels 7.03:1, review values 20.03:1, review labels 5.07:1, completed step
// 9.45:1. The pending step sits at 3.49:1, which is deliberate — it is
// inactive, non-essential text, not something the visitor needs to read yet.
const inputClass =
  "w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-ui text-white transition-colors focus:border-white/50 focus-visible:outline-offset-2";
const labelClass = "text-caption font-medium text-white/60";
const primaryButtonClass =
  "rounded-pill bg-white px-6 py-2.5 text-ui font-semibold text-black transition duration-200 hover:bg-white/90 active:scale-[0.97]";

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

  // Keeps the cross-fade so a step still reads as leaving, drops the travel.
  const reduceMotion = useReducedMotion();
  const swap = reduceMotion ? withoutMovement(panelSwap) : panelSwap;

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
    <div className="mx-auto mt-10 w-full max-w-[520px] rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-start md:p-8">
      {/* Step indicator */}
      <div className="mb-6 flex items-center gap-2">
        {stepLabels.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <span
              className={`text-micro font-medium tracking-wide uppercase transition-colors duration-300 ${i === step ? "text-white" : i < step ? "text-white/70" : "text-white/40"}`}
            >
              {i + 1}. {label}
            </span>
            {i < stepLabels.length - 1 && (
              <span className="relative h-px flex-1 bg-white/10" aria-hidden>
                {/* Fills once the step it leads from is done. */}
                <span
                  className={`absolute inset-0 origin-left bg-white/70 transition-transform duration-500 ease-precise rtl:origin-right ${i < step ? "scale-x-100" : "scale-x-0"}`}
                />
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Motion owns the step swap. The CSS `animate-in` classes this replaces
          only played on the arriving step: the outgoing one was unmounted by
          React and disappeared on a frame, so moving between steps read as a
          jump cut. `mode="wait"` lets the old step leave before the new one
          arrives, which keeps the panel height from fighting itself.
          See docs/motion-plan.md. */}
      <AnimatePresence mode="wait" initial={false}>
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={swap.initial}
            animate={swap.animate}
            exit={swap.exit}
            transition={swap.transition}
          >
            <p className="text-md font-semibold text-white">{t("chooseTitle")}</p>
            <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {palletTypes.map((type, i) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setPalletTypeIndex(i);
                    setStep(1);
                  }}
                  className="rounded-lg border border-white/15 bg-transparent px-4 py-3.5 text-start text-ui font-medium text-white transition duration-200 hover:border-white/40 hover:bg-white/5 active:scale-[0.98]"
                >
                  {type}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={swap.initial}
            animate={swap.animate}
            exit={swap.exit}
            transition={swap.transition}
          >
            <p className="text-md font-semibold text-white">{t("detailsTitle", { type: palletType })}</p>
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
                className="text-small font-medium text-white/60 hover:text-white"
              >
                <span aria-hidden className="inline-block rtl:-scale-x-100">
                  ←
                </span>{" "}
                {t("back")}
              </button>
              <button type="button" onClick={() => setStep(2)} className={`ms-auto ${primaryButtonClass}`}>
                {t("continue")}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={swap.initial}
            animate={swap.animate}
            exit={swap.exit}
            transition={swap.transition}
          >
            <p className="text-md font-semibold text-white">{t("reviewTitle")}</p>
            <dl className="mt-4 space-y-2 text-ui">
              {reviewRows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex justify-between gap-4 py-2 ${i < reviewRows.length - 1 ? "border-b border-white/10" : ""}`}
                >
                  <dt className="text-white/50">{row.label}</dt>
                  <dd className="text-end font-medium text-white">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-small font-medium text-white/60 hover:text-white"
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
                className={`group ms-auto flex items-center gap-2 ${primaryButtonClass} disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {t("send")}
                <CtaArrow />
              </button>
            </div>

            {!hasChannel && <p className="mt-3 text-caption text-white/50">{t("noChannel")}</p>}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
