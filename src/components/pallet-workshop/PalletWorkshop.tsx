"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CONTACT } from "@/lib/contact";
import {
  BASE,
  BLOCKING_WARNINGS,
  PRESETS,
  SCHEMA,
  calc,
  drawingSVG,
  isNumberField,
  isSelectField,
  numberField,
  type NumericKey,
  type PalletDesign,
  type PresetId,
  type Warning,
} from "@/lib/pallet/model";
import { designTitle, drawingLabels } from "@/lib/pallet/quote";
import type { CameraKind, PalletSceneHandle } from "./PalletScene";
import { QuoteDialog } from "./QuoteDialog";

const PalletScene = dynamic(() => import("./PalletScene").then((m) => m.PalletScene), { ssr: false });

const CAMERAS: CameraKind[] = ["iso", "top", "front", "side", "under"];

const inputBox =
  "flex items-center overflow-hidden rounded-md border border-border bg-background focus-within:border-primary";
const segBtn =
  "px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors aria-pressed:bg-foreground aria-pressed:text-background";

/** Screen colours for the technical drawing; the downloadable/e-mailed copy uses the print palette instead. */
const SCREEN_DRAWING = {
  ink: "var(--foreground)",
  bg: null,
  dim: "var(--muted-foreground)",
  font: "ui-monospace, Menlo, Consolas, monospace",
  fill: {
    top: "color-mix(in srgb, #D8B57E 70%, var(--background))",
    cross: "color-mix(in srgb, #C9A46D 70%, var(--background))",
    block: "color-mix(in srgb, #B98F5A 75%, var(--background))",
    bottom: "color-mix(in srgb, #CFAF7C 70%, var(--background))",
    stringer: "color-mix(in srgb, #B98F5A 75%, var(--background))",
  },
};

export function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function PalletWorkshop() {
  const t = useTranslations("Workshop");
  const locale = useLocale();
  const fmt = useMemo(() => {
    const byDigits = [0, 1, 2, 3, 4].map(
      (d) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }),
    );
    return (n: number, digits = 0) => byDigits[Math.min(4, Math.max(0, digits))].format(n);
  }, [locale]);

  const [design, setDesign] = useState<PalletDesign>(BASE);
  const [preset, setPreset] = useState<PresetId | "custom">("eu");
  const [mode, setMode] = useState<"3d" | "draw">("3d");
  const [camera, setCamera] = useState<CameraKind>("iso");
  const [cameraNonce, setCameraNonce] = useState(0);
  const [no3d, setNo3d] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState(false);
  // Raw text of number inputs while typing, so a half-typed "12" doesn't get clamped to the minimum.
  const [drafts, setDrafts] = useState<Partial<Record<NumericKey, string>>>({});
  const sceneRef = useRef<PalletSceneHandle | null>(null);

  const c = useMemo(() => calc(design), [design]);
  const showDrawing = mode === "draw" || no3d;
  const labels = useMemo(() => drawingLabels(t, design, c), [t, design, c]);
  const screenSvg = useMemo(
    () => (showDrawing ? drawingSVG(design, labels, SCREEN_DRAWING) : ""),
    [showDrawing, design, labels],
  );

  useEffect(() => {
    if (!blockedMsg) return;
    const id = setTimeout(() => setBlockedMsg(false), 3200);
    return () => clearTimeout(id);
  }, [blockedMsg]);

  function snapCamera(kind: CameraKind) {
    setCamera(kind);
    setCameraNonce((n) => n + 1);
  }

  function applyPreset(id: PresetId | "custom") {
    setPreset(id);
    if (id === "custom") {
      document.getElementById("pw_L")?.focus();
      return;
    }
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setDesign({ ...BASE, ...p.d });
    setDrafts({});
    snapCamera("iso");
  }

  function update<K extends keyof PalletDesign>(k: K, v: PalletDesign[K]) {
    setDesign((d) => ({ ...d, [k]: v }));
    setPreset("custom");
    if (k === "type") snapCamera("iso");
  }

  function onNumberInput(k: NumericKey, raw: string, commit: boolean) {
    const f = numberField(k);
    if (!f) return;
    const n = Number(raw);
    if (commit) {
      const v = Number.isFinite(n) && raw !== "" ? Math.min(f.max, Math.max(f.min, Math.round(n / f.step) * f.step)) : design[k];
      setDrafts((dr) => ({ ...dr, [k]: undefined }));
      if (v !== design[k]) update(k, v);
      return;
    }
    setDrafts((dr) => ({ ...dr, [k]: raw }));
    if (Number.isFinite(n) && n >= f.min && n <= f.max) update(k, n);
  }

  function warningText(w: Warning) {
    return w.code === "topGapWide" ? t("warnings.topGapWide", { gap: fmt(w.gap) }) : t(`warnings.${w.code}`);
  }

  function openQuote() {
    if (c.warns.some((w) => BLOCKING_WARNINGS.includes(w.code))) {
      setBlockedMsg(true);
      return;
    }
    setSnapshot(sceneRef.current?.snapshot() ?? null);
    setQuoteOpen(true);
  }

  function downloadDrawing() {
    downloadText(`palet-${design.L}x${design.W}.svg`, drawingSVG(design, labels), "image/svg+xml");
  }

  const metrics: [string, string, string][] = [
    [t("metrics.height"), fmt(c.H), "mm"],
    [t("metrics.weight"), fmt(c.weight, 1), "kg"],
    [t("metrics.dyn"), fmt(c.dyn), "kg"],
    [t("metrics.stat"), fmt(c.stat), "kg"],
    [t("metrics.rack"), c.rack ? fmt(c.rack) : "–", c.rack ? "kg" : ""],
    [t("metrics.volume"), fmt(c.vol, 4), "m³"],
  ];

  return (
    <section className="bg-surface-alt px-4 pt-[140px] pb-16 md:pt-[116px]">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-5 flex flex-col gap-1 md:mb-6">
          <p className="text-[11px] font-semibold tracking-[0.28em] text-muted-foreground uppercase">{t("eyebrow")}</p>
          <h1 className="font-heading text-[28px] leading-[1.1] font-bold tracking-[-0.02em] text-foreground md:text-[40px]">
            {t("title")}
          </h1>
          <p className="max-w-[680px] text-[14px] leading-relaxed text-muted-foreground md:text-[16px]">{t("body")}</p>
        </div>

        <div className="grid gap-3.5 xl:h-[calc(100vh-150px)] xl:min-h-[600px] lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[290px_minmax(0,1fr)_330px]">
          {/* Stage */}
          <div className="relative order-first h-[52vh] min-h-[320px] overflow-hidden rounded-xl border border-border bg-[#f0ede8] lg:order-none lg:col-start-2 lg:row-start-1 lg:h-[62vh] xl:h-auto">
            {!no3d && (
              <PalletScene
                design={design}
                camera={camera}
                cameraNonce={cameraNonce}
                active={mode === "3d"}
                label={t("canvasLabel")}
                onUnavailable={() => setNo3d(true)}
                handleRef={sceneRef}
              />
            )}
            {showDrawing && (
              <div
                className="absolute inset-0 overflow-auto bg-background px-4 pt-14 pb-4 [&_svg]:h-full [&_svg]:min-h-[340px] [&_svg]:w-full"
                // The SVG is generated from clamped numbers and escaped labels in `drawingSVG`.
                dangerouslySetInnerHTML={{ __html: screenSvg }}
              />
            )}
            <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex flex-wrap justify-between gap-2">
              {!no3d && (
                <div role="group" aria-label={t("viewLabel")} className="pointer-events-auto flex overflow-hidden rounded-md border border-border bg-background">
                  <button type="button" aria-pressed={mode === "3d"} onClick={() => setMode("3d")} className={segBtn}>
                    3D
                  </button>
                  <button type="button" aria-pressed={mode === "draw"} onClick={() => setMode("draw")} className={segBtn}>
                    {t("viewDrawing")}
                  </button>
                </div>
              )}
              {!showDrawing && (
                <div role="group" aria-label={t("camLabel")} className="pointer-events-auto flex flex-wrap overflow-hidden rounded-md border border-border bg-background">
                  {CAMERAS.map((k) => (
                    <button key={k} type="button" aria-pressed={camera === k} onClick={() => snapCamera(k)} className={segBtn}>
                      {t(`cams.${k}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {!showDrawing && (
              <>
                <div className="absolute start-3 bottom-3 rounded-md border border-border bg-background px-2.5 py-1.5 font-mono text-[13px]" dir="ltr">
                  <b className="me-1.5 font-heading text-[18px] font-bold">
                    {design.L} × {design.W} × {Math.round(c.H)}
                  </b>
                  mm
                </div>
                <div className="absolute end-3 bottom-3 hidden rounded-md border border-border bg-background px-2 py-1 text-[11px] text-muted-foreground sm:block">
                  {t("hint")}
                </div>
              </>
            )}
            {no3d && (
              <p className="absolute inset-x-3 bottom-3 rounded-md bg-background/90 p-2 text-[12px] text-muted-foreground">{t("no3d")}</p>
            )}
          </div>

          {/* Parameters */}
          <aside
            aria-label={t("specsTitle")}
            className="min-h-0 overflow-auto rounded-xl border border-border bg-background lg:col-start-1 lg:row-start-1 lg:row-span-2 xl:row-span-1"
          >
            <h2 className="sticky top-0 z-10 border-b border-border bg-background px-3.5 py-3 font-heading text-[15px] font-bold tracking-wide uppercase">
              {t("specsTitle")}
            </h2>
            <div className="flex flex-wrap gap-1.5 border-b border-border px-3.5 py-3">
              {[...PRESETS.map((p) => p.id), "custom" as const].map((id) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={preset === id}
                  onClick={() => applyPreset(id)}
                  className="rounded-full border border-border bg-surface-alt px-2.5 py-1 text-[12px] transition-colors hover:border-muted-foreground aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
                >
                  {t(`presets.${id}`)}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => e.preventDefault()}>
              {SCHEMA.filter((g) => !g.show || g.show(design)).map((g) => (
                <fieldset key={g.g} className="grid gap-2 border-b border-border px-3.5 pt-3 pb-3.5">
                  <legend className="float-left w-full pb-1 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    {t(`groups.${g.g}`)}
                  </legend>
                  {g.items.map((f) => {
                    if (isNumberField(f) && f.show && !f.show(design)) return null;
                    const id = `pw_${f.k}`;
                    const wide = isSelectField(f) || f.k === "stamp";
                    let control;
                    if (isNumberField(f)) {
                      control = (
                        <div className={inputBox} dir="ltr">
                          <input
                            id={id}
                            type="number"
                            inputMode="numeric"
                            min={f.min}
                            max={f.max}
                            step={f.step}
                            value={drafts[f.k] ?? String(design[f.k])}
                            onChange={(e) => onNumberInput(f.k, e.target.value, false)}
                            onBlur={(e) => onNumberInput(f.k, e.target.value, true)}
                            onKeyDown={(e) => e.key === "Enter" && onNumberInput(f.k, e.currentTarget.value, true)}
                            className="w-full min-w-0 bg-transparent px-2 py-1.5 text-end font-mono text-[13px] tabular-nums outline-none"
                          />
                          <span className="pe-2 font-mono text-[11px] text-muted-foreground">{t(`units.${f.u}`)}</span>
                        </div>
                      );
                    } else if (isSelectField(f)) {
                      control = (
                        <div className={inputBox}>
                          <select
                            id={id}
                            value={design[f.k]}
                            onChange={(e) => update(f.k, e.target.value as PalletDesign[typeof f.k])}
                            className="w-full min-w-0 bg-transparent px-2 py-1.5 text-[13px] outline-none"
                          >
                            {f.options.map((o) => (
                              <option key={o} value={o}>
                                {t(`options.${f.k}.${o}`)}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    } else {
                      control = (
                        <div className={inputBox}>
                          <input
                            id={id}
                            type="text"
                            maxLength={f.max}
                            value={design.stamp}
                            onChange={(e) => update("stamp", e.target.value)}
                            className="w-full min-w-0 bg-transparent px-2 py-1.5 text-[13px] outline-none"
                          />
                        </div>
                      );
                    }
                    return (
                      <div key={f.k} className={wide ? "grid gap-1.5" : "grid grid-cols-[1fr_112px] items-center gap-2"}>
                        <label htmlFor={id} className="text-[13px]">
                          {t(`fields.${f.k}`)}
                        </label>
                        {control}
                      </div>
                    );
                  })}
                </fieldset>
              ))}
              {design.type === "blok" && <p className="px-3.5 py-2.5 text-[11px] text-muted-foreground">{t("blockNote")}</p>}
            </form>
          </aside>

          {/* Calculation sheet */}
          <aside
            aria-label={t("sheetTitle")}
            className="flex min-h-0 flex-col overflow-auto rounded-xl border border-border bg-background lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1"
          >
            <h2 className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-3.5 py-3 font-heading text-[15px] font-bold tracking-wide uppercase">
              {t("sheetTitle")}
              <span className="font-mono text-[11px] font-normal tracking-normal text-muted-foreground normal-case">{t("estimate")}</span>
            </h2>
            <dl className="grid grid-cols-2 border-b border-border">
              {metrics.map(([k, v, u], i) => (
                <div key={k} className={`border-b border-border px-3.5 py-2.5 ${i % 2 === 0 ? "border-e" : ""}`}>
                  <dt className="text-[11px] tracking-[0.06em] text-muted-foreground uppercase">{k}</dt>
                  <dd className="font-heading text-[22px] leading-tight font-semibold tabular-nums">
                    {v}
                    <small className="ms-1 font-mono text-[11px] font-normal text-muted-foreground">{u}</small>
                  </dd>
                </div>
              ))}
            </dl>
            <p className="px-3.5 pt-2 pb-3 text-[11px] text-muted-foreground">{t("loadNote")}</p>
            {c.warns.length > 0 && (
              <ul className="grid gap-1.5 px-3.5 pb-3" aria-live="polite">
                {c.warns.map((w) => (
                  <li key={w.code} className="rounded-md bg-amber-100 px-2.5 py-1.5 text-[12px] text-amber-900">
                    {warningText(w)}
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border px-3.5 py-3">
              <h3 className="mb-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">{t("bomTitle")}</h3>
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="text-[11px] text-muted-foreground">
                    <th className="py-1 text-start font-medium">{t("bomPart")}</th>
                    <th className="py-1 text-end font-medium">{t("bomQty")}</th>
                    <th className="py-1 text-end font-medium">{t("bomSize")}</th>
                  </tr>
                </thead>
                <tbody>
                  {c.bom.map((r) => (
                    <tr key={`${r.k}${r.dims.join("x")}`} className="border-t border-dashed border-border">
                      <td className="py-1.5 align-top">
                        {t(`parts.${r.k}`)}
                        {r.k === "block" && design.blkMat === "pres" ? ` ${t("presSuffix")}` : ""}
                      </td>
                      <td className="py-1.5 text-end font-mono tabular-nums">{r.n}</td>
                      <td className="py-1.5 text-end font-mono whitespace-nowrap tabular-nums" dir="ltr">
                        {r.dims.join("×")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-auto grid gap-2 border-t border-border bg-background p-3.5 xl:sticky xl:bottom-0">
              <p className="text-[12px] text-muted-foreground">{t("quoteNote")}</p>
              <button
                type="button"
                onClick={openQuote}
                className="rounded-full bg-primary px-5 py-3 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("quoteButton")}
              </button>
              {blockedMsg && (
                <p role="alert" className="text-[12px] font-medium text-destructive">
                  {t("errors.fixDesign")}
                </p>
              )}
              <button
                type="button"
                onClick={downloadDrawing}
                className="rounded-full border border-border px-4 py-2 text-[13px] font-medium transition-colors hover:border-muted-foreground"
              >
                {t("downloadDrawing")}
              </button>
              {(CONTACT.phone || CONTACT.email) && (
                <p className="flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                  <span>{t("contactLine")}</span>
                  {CONTACT.phone && (
                    <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="font-mono text-foreground" dir="ltr">
                      {CONTACT.phone}
                    </a>
                  )}
                  {CONTACT.email && (
                    <a href={`mailto:${CONTACT.email}`} className="font-mono text-foreground">
                      {CONTACT.email}
                    </a>
                  )}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {quoteOpen && (
        <QuoteDialog
          design={design}
          calc={c}
          snapshot={snapshot}
          title={`${designTitle(t, design)} × ${Math.round(c.H)} mm`}
          fmt={fmt}
          onDownloadDrawing={downloadDrawing}
          onClose={() => setQuoteOpen(false)}
        />
      )}
    </section>
  );
}
