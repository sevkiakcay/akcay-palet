"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence } from "motion/react";
import SplitText from "@/components/SplitText";
import { useScrollEdges } from "@/hooks/use-scroll-edges";
import { CtaArrow } from "@/components/sites/apple-com-79a1c2f0/shared/CtaArrow";
import { CONTACT } from "@/lib/contact";
import {
  BASE,
  BLOCKING_WARNINGS,
  PRESETS,
  SCHEMA,
  deckSpan,
  evenSpread,
  syncTops,
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
import { TopBoardEditor } from "./TopBoardEditor";

const PalletScene = dynamic(() => import("./PalletScene").then((m) => m.PalletScene), { ssr: false });

const CAMERAS: CameraKind[] = ["iso", "top", "front", "side", "under"];

// Editorial control styles — the same vocabulary as the light sections on the
// home page and /products: pure black and white, hairlines at black/10–15,
// the grey ramp for secondary text, pills for actions, square corners for the
// Swiss panels. See docs/design-system.md.
const inputBox =
  "flex items-center overflow-hidden border border-black/15 bg-white transition-colors focus-within:border-black hover:border-black/40";
const segGroup = "pointer-events-auto flex flex-wrap overflow-hidden border border-black/10 bg-white";
const segBtn =
  "px-3 py-1.5 text-caption font-medium text-editorial-gray-2 transition-colors hover:text-black aria-pressed:bg-black aria-pressed:text-white";
const panelTitle = "text-micro font-medium tracking-[0.12em] text-black uppercase";
const groupLabel = "text-micro font-medium tracking-[0.12em] text-editorial-gray-2 uppercase";
const primaryPill =
  "group inline-flex items-center justify-center gap-2 rounded-pill bg-black px-6 py-3 text-ui font-semibold text-white transition duration-200 hover:bg-black/85 active:scale-[0.97]";
const secondaryPill =
  "inline-flex items-center justify-center rounded-pill border border-black/15 px-5 py-2.5 text-small font-medium text-black transition duration-200 hover:border-black active:scale-[0.97]";

/** Screen colours for the technical drawing; the downloadable/e-mailed copy uses the print palette instead. */
const SCREEN_DRAWING = {
  ink: "var(--editorial-ink)",
  bg: null,
  dim: "var(--editorial-gray-2)",
  font: "ui-monospace, Menlo, Consolas, monospace",
  // Wood tones are the material, not UI colour — kept, mixed toward the white ground.
  fill: {
    top: "color-mix(in srgb, #D8B57E 70%, var(--editorial-bg))",
    cross: "color-mix(in srgb, #C9A46D 70%, var(--editorial-bg))",
    block: "color-mix(in srgb, #B98F5A 75%, var(--editorial-bg))",
    bottom: "color-mix(in srgb, #CFAF7C 70%, var(--editorial-bg))",
    stringer: "color-mix(in srgb, #B98F5A 75%, var(--editorial-bg))",
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

type StartPreset = PresetId | "custom";

function readPresetParam(): StartPreset | null {
  const id = new URLSearchParams(window.location.search).get("preset");
  if (id === "custom") return "custom";
  return PRESETS.some((p) => p.id === id) ? (id as PresetId) : null;
}

function subscribeToHistory(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/**
 * Deep links from the home page "Paletini Hazırla" section, e.g. /palet-atolyesi?preset=ind.
 * The param is read via useSyncExternalStore (no preset on the server, so hydration matches),
 * and the workshop is keyed on it: it remounts with that preset as its initial state rather
 * than patching state from an effect.
 */
export function PalletWorkshop() {
  const startPreset = useSyncExternalStore(subscribeToHistory, readPresetParam, () => null);
  return <Workshop key={startPreset ?? "default"} startPreset={startPreset} />;
}

function Workshop({ startPreset }: { startPreset: StartPreset | null }) {
  const t = useTranslations("Workshop");
  const locale = useLocale();
  const fmt = useMemo(() => {
    const byDigits = [0, 1, 2, 3, 4].map(
      (d) => new Intl.NumberFormat(locale, { minimumFractionDigits: d, maximumFractionDigits: d }),
    );
    return (n: number, digits = 0) => byDigits[Math.min(4, Math.max(0, digits))].format(n);
  }, [locale]);

  const [design, setDesign] = useState<PalletDesign>(() => {
    const p = PRESETS.find((x) => x.id === startPreset);
    return p ? { ...BASE, ...p.d } : BASE;
  });
  const [preset, setPreset] = useState<StartPreset>(startPreset ?? "eu");
  const [mode, setMode] = useState<"3d" | "draw">("3d");
  const [camera, setCamera] = useState<CameraKind>("iso");
  const [cameraNonce, setCameraNonce] = useState(0);
  const [no3d, setNo3d] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [blockedMsg, setBlockedMsg] = useState(false);
  // Index of the top board focused in the editor, mirrored in the 3D view (-1 = none).
  const [highlightTop, setHighlightTop] = useState(-1);
  // Raw text of number inputs while typing, so a half-typed "12" doesn't get clamped to the minimum.
  const [drafts, setDrafts] = useState<Partial<Record<NumericKey, string>>>({});
  const sceneRef = useRef<PalletSceneHandle | null>(null);
  const { ref: specsScrollRef, moreBelow: specsMoreBelow } = useScrollEdges<HTMLDivElement>();
  const { ref: sheetScrollRef, moreBelow: sheetMoreBelow } = useScrollEdges<HTMLDivElement>();

  const c = useMemo(() => calc(design), [design]);
  const showDrawing = mode === "draw" || no3d;
  const labels = useMemo(() => drawingLabels(t, design, c), [t, design, c]);
  const screenSvg = useMemo(
    () => (showDrawing ? drawingSVG(design, labels, SCREEN_DRAWING) : ""),
    [showDrawing, design, labels],
  );

  // "Custom size" deep link: put the cursor straight into the first dimension field.
  useEffect(() => {
    if (startPreset === "custom") document.getElementById("pw_L")?.focus({ preventScroll: true });
  }, [startPreset]);

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
    setHighlightTop(-1);
    snapCamera("iso");
  }

  function update<K extends keyof PalletDesign>(k: K, v: PalletDesign[K]) {
    setDesign((d) => {
      const next = { ...d, [k]: v };
      // Keep the per-board layout board-count/span-correct when the deck changes shape.
      if (next.topCustom && (k === "topN" || k === "type" || k === "L" || k === "W")) next.tops = syncTops(next);
      return next;
    });
    setPreset("custom");
    if (k === "type") snapCamera("iso");
  }

  function toggleTopCustom(on: boolean) {
    setDesign((d) => {
      const next = { ...d, topCustom: on };
      if (on) next.tops = syncTops(next);
      return next;
    });
    setPreset("custom");
    setHighlightTop(-1);
  }

  function updateBoard(i: number, f: "p" | "w" | "t", v: number) {
    setDesign((d) => ({ ...d, tops: d.tops.map((b, j) => (j === i ? { ...b, [f]: v } : b)) }));
    setPreset("custom");
  }

  function evenTops() {
    setDesign((d) => ({ ...d, tops: evenSpread(d.tops.map((b) => ({ ...b })), deckSpan(d)) }));
  }

  function sameTops() {
    setDesign((d) => {
      const f = d.tops[0];
      if (!f) return d;
      return { ...d, tops: evenSpread(d.tops.map((b) => ({ ...b, w: f.w, t: f.t })), deckSpan(d)) };
    });
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
    if (w.code === "topGapWide") return t("warnings.topGapWide", { gap: fmt(w.gap) });
    if (w.code === "topOutside") return t("warnings.topOutside", { boards: w.boards });
    if (w.code === "topOverlap") return t("warnings.topOverlap", { pairs: w.pairs });
    return t(`warnings.${w.code}`);
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
    <section className="bg-white pt-[140px] pb-16 text-black md:pt-[116px] md:pb-section">
      <div className="editorial-shell-wide">
        <header className="mb-6 grid gap-3 md:mb-8">
          <p className="text-caption font-normal tracking-[0.2em] text-editorial-gray-2 uppercase">{t("eyebrow")}</p>
          <SplitText
            textAlign="start"
            text={t("title")}
            tag="h1"
            trigger="load"
            splitType="words"
            delay={40}
            duration={0.9}
            effect="rise"
            className="text-section leading-[1.02] font-normal tracking-[-0.015em]"
          />
          <p className="max-w-[680px] text-body leading-relaxed text-editorial-gray-2">{t("body")}</p>
        </header>

        {/* Hairline grid: three square panels separated by 1px rules, the Swiss
            control-panel look. At xl the row has a fixed height and the two side
            panels scroll internally; below xl every panel grows to its content. */}
        {/* lg: the controls span both rows and are usually the tallest column, so
            row 1 (the stage) takes whatever height is left over instead of leaving
            a band of grid ground under a fixed-height stage. */}
        <div className="grid gap-px border border-black/10 bg-black/10 lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[minmax(62vh,1fr)_auto] xl:h-[calc(100vh-150px)] xl:min-h-[640px] xl:grid-cols-[300px_minmax(0,1fr)_340px] xl:grid-rows-[minmax(0,1fr)]">
          {/* Stage */}
          <div className="relative order-first h-[52vh] min-h-[320px] overflow-hidden bg-[#f5f5f5] lg:order-none lg:col-start-2 lg:row-start-1 lg:h-auto">
            {!no3d && (
              <PalletScene
                design={design}
                camera={camera}
                cameraNonce={cameraNonce}
                active={mode === "3d"}
                highlightTop={highlightTop}
                label={t("canvasLabel")}
                onUnavailable={() => setNo3d(true)}
                handleRef={sceneRef}
              />
            )}
            {showDrawing && (
              <div
                className="absolute inset-0 overflow-auto bg-white px-4 pt-14 pb-4 [&_svg]:h-full [&_svg]:min-h-[340px] [&_svg]:w-full"
                // The SVG is generated from clamped numbers and escaped labels in `drawingSVG`.
                dangerouslySetInnerHTML={{ __html: screenSvg }}
              />
            )}
            <div className="pointer-events-none absolute inset-x-3 top-3 flex flex-wrap justify-between gap-2">
              {!no3d && (
                <div role="group" aria-label={t("viewLabel")} className={segGroup}>
                  <button type="button" aria-pressed={mode === "3d"} onClick={() => setMode("3d")} className={segBtn}>
                    3D
                  </button>
                  <button type="button" aria-pressed={mode === "draw"} onClick={() => setMode("draw")} className={segBtn}>
                    {t("viewDrawing")}
                  </button>
                </div>
              )}
              {!showDrawing && (
                <div role="group" aria-label={t("camLabel")} className={segGroup}>
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
                <div className="absolute start-3 bottom-3 border border-black/10 bg-white px-3 py-1.5 font-mono text-small text-editorial-gray-2" dir="ltr">
                  <b className="me-1.5 font-sans text-subtitle font-normal tracking-[-0.01em] text-black tabular-nums">
                    {design.L} × {design.W} × {Math.round(c.H)}
                  </b>
                  mm
                </div>
                <div className="absolute end-3 bottom-3 hidden border border-black/10 bg-white px-2.5 py-1 text-micro text-editorial-gray-2 sm:block">
                  {t("hint")}
                </div>
              </>
            )}
            {no3d && (
              <p className="absolute inset-x-3 bottom-3 border border-black/10 bg-white/95 p-2.5 text-caption text-editorial-gray-2">{t("no3d")}</p>
            )}
          </div>

          {/* Parameters */}
          <aside
            aria-label={t("specsTitle")}
            className="relative flex min-h-0 flex-col bg-white lg:col-start-1 lg:row-start-1 lg:row-span-2 xl:row-span-1"
          >
            <h2 className={`flex-none border-b border-black/10 px-4 py-3.5 ${panelTitle}`}>{t("specsTitle")}</h2>
            <div ref={specsScrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="flex flex-wrap gap-1.5 border-b border-black/10 px-4 py-3.5">
                {[...PRESETS.map((p) => p.id), "custom" as const].map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={preset === id}
                    onClick={() => applyPreset(id)}
                    className="rounded-pill border border-black/15 px-3 py-1 text-caption text-black transition duration-200 hover:border-black active:scale-[0.96] aria-pressed:border-black aria-pressed:bg-black aria-pressed:text-white"
                  >
                    {t(`presets.${id}`)}
                  </button>
                ))}
              </div>
              <form onSubmit={(e) => e.preventDefault()}>
                {SCHEMA.filter((g) => !g.show || g.show(design)).map((g) => (
                  <fieldset key={g.g} className="grid gap-2.5 border-b border-black/10 px-4 pt-3.5 pb-4">
                    <legend className={`float-left w-full pb-1 ${groupLabel}`}>{t(`groups.${g.g}`)}</legend>
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
                              className="w-full min-w-0 bg-transparent px-2.5 py-1.5 text-end font-mono text-small text-black tabular-nums outline-none"
                            />
                            <span className="pe-2.5 font-mono text-micro text-editorial-gray-2">{t(`units.${f.u}`)}</span>
                          </div>
                        );
                      } else if (isSelectField(f)) {
                        control = (
                          <div className={inputBox}>
                            <select
                              id={id}
                              value={design[f.k]}
                              onChange={(e) => update(f.k, e.target.value as PalletDesign[typeof f.k])}
                              className="w-full min-w-0 bg-transparent px-2.5 py-1.5 text-small text-black outline-none"
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
                              className="w-full min-w-0 bg-transparent px-2.5 py-1.5 text-small text-black outline-none"
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={f.k} className={wide ? "grid gap-1.5" : "grid grid-cols-[1fr_112px] items-center gap-2"}>
                          <label htmlFor={id} className="text-small text-black">
                            {t(`fields.${f.k}`)}
                          </label>
                          {control}
                        </div>
                      );
                    })}
                    {g.g === "top" && (
                      <TopBoardEditor
                        design={design}
                        onToggle={toggleTopCustom}
                        onBoard={updateBoard}
                        onEven={evenTops}
                        onSame={sameTops}
                        highlight={highlightTop}
                        setHighlight={setHighlightTop}
                      />
                    )}
                  </fieldset>
                ))}
                {design.type === "blok" && <p className="px-4 pt-3 pb-5 text-micro leading-relaxed text-editorial-gray-2">{t("blockNote")}</p>}
              </form>
            </div>
            {/* "More below" cue. Without it the last group's heading was simply cut
                by the panel edge and read as broken. Opacity only, CSS-owned. */}
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ${specsMoreBelow ? "opacity-100" : "opacity-0"}`}
            />
          </aside>

          {/* Calculation sheet */}
          <aside
            aria-label={t("sheetTitle")}
            className="relative flex min-h-0 flex-col bg-white lg:col-start-2 lg:row-start-2 xl:col-start-3 xl:row-start-1"
          >
            <h2 className={`flex flex-none items-center justify-between border-b border-black/10 px-4 py-3.5 ${panelTitle}`}>
              {t("sheetTitle")}
              <span className="font-mono text-micro font-normal tracking-normal text-editorial-gray-2 normal-case">{t("estimate")}</span>
            </h2>
            <div ref={sheetScrollRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <dl className="grid grid-cols-2 gap-px border-b border-black/10 bg-black/10">
                {metrics.map(([k, v, u]) => (
                  <div key={k} className="bg-white px-4 py-3">
                    <dt className="text-micro tracking-[0.08em] text-editorial-gray-2 uppercase">{k}</dt>
                    <dd className="mt-1 text-title leading-tight font-normal tracking-[-0.01em] text-black tabular-nums">
                      {v}
                      <small className="ms-1 font-mono text-micro font-normal tracking-normal text-editorial-gray-2">{u}</small>
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="px-4 pt-2.5 pb-3.5 text-micro leading-relaxed text-editorial-gray-2">{t("loadNote")}</p>
              {c.warns.length > 0 && (
                <ul className="grid gap-1.5 px-4 pb-3.5" aria-live="polite">
                  {c.warns.map((w) => (
                    <li key={w.code} className="border-s-2 border-black bg-black/[0.04] px-3 py-2 text-caption text-black">
                      {warningText(w)}
                    </li>
                  ))}
                </ul>
              )}
              <div className="border-t border-black/10 px-4 pt-3.5 pb-4">
                <h3 className={`mb-2 ${groupLabel}`}>{t("bomTitle")}</h3>
                <table className="w-full border-collapse text-caption">
                  <thead>
                    <tr className="text-micro tracking-[0.08em] text-editorial-gray-2 uppercase">
                      <th className="py-1.5 text-start font-medium">{t("bomPart")}</th>
                      <th className="py-1.5 text-end font-medium">{t("bomQty")}</th>
                      <th className="py-1.5 text-end font-medium">{t("bomSize")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.bom.map((r) => (
                      <tr key={`${r.k}${r.dims.join("x")}`} className="border-t border-black/10 text-black">
                        <td className="py-2 align-top">
                          {t(`parts.${r.k}`)}
                          {r.k === "block" && design.blkMat === "pres" ? ` ${t("presSuffix")}` : ""}
                        </td>
                        <td className="py-2 text-end font-mono tabular-nums">{r.n}</td>
                        {/* The number reads left-to-right in every language, but the cell keeps
                            the page direction: `dir="ltr"` on the <td> flipped its `text-end`
                            to the right edge in Arabic, where it ran into the quantity
                            ("1200×120×22" + "5" read as "…225"). */}
                        <td className="py-2 ps-3 text-end font-mono whitespace-nowrap tabular-nums">
                          <bdi dir="ltr">{r.dims.join("×")}</bdi>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* What happens after "Request a quote", and who to call instead. Kept
                  in the scrolling body so the fixed footer is just the two actions
                  and the sheet itself keeps its room. */}
              <div className="border-t border-black/10 px-4 pt-3.5 pb-4">
                <p className="text-caption leading-relaxed text-editorial-gray-2">{t("quoteNote")}</p>
                {(CONTACT.phone || CONTACT.email) && (
                  <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-caption text-editorial-gray-2">
                    <span>{t("contactLine")}</span>
                    {CONTACT.phone && (
                      <a href={`tel:${CONTACT.phone.replace(/\s/g, "")}`} className="font-mono text-black underline-offset-4 hover:underline" dir="ltr">
                        {CONTACT.phone}
                      </a>
                    )}
                    {CONTACT.email && (
                      <a href={`mailto:${CONTACT.email}`} className="font-mono text-black underline-offset-4 hover:underline">
                        {CONTACT.email}
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
            {/* Footer: only the two actions. At xl it sits below the scrolling body,
                so the quote action is always in view. */}
            <div className="relative flex-none border-t border-black/10 bg-white p-4">
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 bottom-full h-12 bg-gradient-to-t from-white to-transparent transition-opacity duration-200 ${sheetMoreBelow ? "opacity-100" : "opacity-0"}`}
              />
              <button type="button" onClick={openQuote} className={`w-full ${primaryPill}`}>
                {t("quoteButton")}
                <CtaArrow />
              </button>
              {blockedMsg && (
                <p role="alert" className="mt-2 text-caption font-medium text-editorial-error">
                  {t("errors.fixDesign")}
                </p>
              )}
              <button type="button" onClick={downloadDrawing} className={`mt-2 w-full ${secondaryPill}`}>
                {t("downloadDrawing")}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Lets QuoteDialog's own exit animation finish before React unmounts it.
          Without this wrapper the dialog closes on a frame, which is how it
          behaved before Motion was added. */}
      <AnimatePresence>
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
      </AnimatePresence>
    </section>
  );
}
