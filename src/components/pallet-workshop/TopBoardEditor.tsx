"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { deckSpan, TOP_BOARD_LIMITS, topBoards, type PalletDesign } from "@/lib/pallet/model";

type BoardField = "p" | "w" | "t";

type Props = {
  design: PalletDesign;
  onToggle: (on: boolean) => void;
  onBoard: (i: number, f: BoardField, v: number) => void;
  onEven: () => void;
  onSame: () => void;
  highlight: number;
  setHighlight: (i: number) => void;
};

/** Which boards fall outside the deck or overlap a neighbour — flagged red in the strip and the rows. */
function badBoards(design: PalletDesign): Set<number> {
  const span = deckSpan(design);
  const sorted = design.tops.map((b, i) => ({ ...b, i })).sort((a, b) => a.p - b.p);
  const bad = new Set<number>();
  sorted.forEach((b, k) => {
    if (b.p < 0 || b.p + b.w > span + 0.5) bad.add(b.i);
    if (k && b.p < sorted[k - 1].p + sorted[k - 1].w) {
      bad.add(b.i);
      bad.add(sorted[k - 1].i);
    }
  });
  return bad;
}

function limit(f: BoardField, span: number): readonly [number, number] {
  return f === "p" ? [0, span] : TOP_BOARD_LIMITS[f];
}

/**
 * "Her tahtayı ayrı ayarla" — the per-board top-deck editor from the original
 * Palet Atölyesi tool, ported to React. A checkbox turns on individual position,
 * width and thickness inputs for every top board, with a live strip preview, an
 * even-spread and a copy-first-board action; focusing a row highlights that board
 * in the 3D view. Raw text is kept locally while typing so a half-typed value
 * isn't clamped mid-entry.
 */
export function TopBoardEditor({ design, onToggle, onBoard, onEven, onSame, highlight, setHighlight }: Props) {
  const t = useTranslations("Workshop");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const span = deckSpan(design);
  const boards = topBoards(design);
  const bad = design.topCustom ? badBoards(design) : new Set<number>();

  function commit(i: number, f: BoardField, raw: string, done: boolean) {
    const [lo, hi] = limit(f, span);
    const n = Number(raw);
    const key = `${i}:${f}`;
    if (done) {
      setDrafts((d) => ({ ...d, [key]: "" }));
      if (Number.isFinite(n) && raw !== "") onBoard(i, f, Math.round(Math.min(hi, Math.max(lo, n))));
      return;
    }
    setDrafts((d) => ({ ...d, [key]: raw }));
    if (Number.isFinite(n) && n >= lo && n <= hi) onBoard(i, f, n);
  }

  return (
    <div className="mt-1 border border-black/10 bg-black/[0.02] p-3">
      <label className="flex cursor-pointer items-center gap-2 text-small font-medium text-black">
        <input
          type="checkbox"
          checked={design.topCustom}
          onChange={(e) => onToggle(e.target.checked)}
          className="size-4 accent-black"
        />
        {t("topBoard.toggle")}
      </label>

      {!design.topCustom ? (
        <p className="mt-1.5 text-micro leading-relaxed text-editorial-gray-2">{t("topBoard.hint")}</p>
      ) : (
        <div className="mt-2.5">
          {/* Live cross-section strip: board widths and thicknesses to scale across the deck. */}
          <svg
            viewBox={`0 0 ${span} 34`}
            preserveAspectRatio="none"
            role="img"
            aria-label={t("topBoard.stripLabel")}
            className="h-9 w-full border border-black/15 bg-white"
          >
            {boards.map((b, i) => {
              const h = Math.min(34, b.t * 0.85);
              // Wood for a normal board (it is the material), ink for the one being
              // edited, the error token for one that is out of the deck or overlapping.
              const fill = bad.has(i) ? "var(--editorial-error)" : i === highlight ? "var(--editorial-ink)" : "#c9a46d";
              return (
                <rect
                  key={i}
                  x={b.p}
                  y={34 - h}
                  width={b.w}
                  height={h}
                  fill={fill}
                  stroke="#3a2a18"
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                  opacity={bad.has(i) ? 0.85 : 1}
                />
              );
            })}
          </svg>
          <div className="mt-1 flex justify-between font-mono text-nano text-editorial-gray-2" dir="ltr">
            <span>0</span>
            <span>
              {design.type === "blok" ? t("topBoard.widthAxis") : t("topBoard.lengthAxis")} {span} mm
            </span>
            <span>{span}</span>
          </div>

          <div className="mt-2.5 grid grid-cols-[22px_1fr_1fr_1fr] items-center gap-1.5 text-nano tracking-[0.08em] text-editorial-gray-2 uppercase">
            <span>#</span>
            <span className="text-center">{t("topBoard.pos")}</span>
            <span className="text-center">{t("topBoard.width")}</span>
            <span className="text-center">{t("topBoard.thick")}</span>
          </div>
          <div className="mt-1 grid gap-1.5">
            {design.tops.map((b, i) => (
              <div
                key={i}
                className={`grid grid-cols-[22px_1fr_1fr_1fr] items-center gap-1.5 ${bad.has(i) ? "bg-editorial-error/[0.08]" : ""}`}
              >
                <span className={`text-center font-mono text-caption ${bad.has(i) ? "text-editorial-error" : "text-editorial-gray-2"}`}>
                  {i + 1}
                </span>
                {(["p", "w", "t"] as const).map((f) => {
                  const [lo, hi] = limit(f, span);
                  const key = `${i}:${f}`;
                  return (
                    <input
                      key={f}
                      type="number"
                      inputMode="numeric"
                      min={lo}
                      max={hi}
                      step={1}
                      dir="ltr"
                      aria-label={`${i + 1} · ${t(`topBoard.${f === "p" ? "pos" : f === "w" ? "width" : "thick"}`)}`}
                      value={drafts[key] !== undefined && drafts[key] !== "" ? drafts[key] : String(b[f])}
                      onChange={(e) => commit(i, f, e.target.value, false)}
                      onBlur={(e) => commit(i, f, e.target.value, true)}
                      onFocus={() => setHighlight(i)}
                      aria-invalid={bad.has(i) || undefined}
                      className="min-w-0 border border-black/15 bg-white px-1.5 py-1 text-center font-mono text-caption text-black tabular-nums outline-none transition-colors hover:border-black/40 focus:border-black aria-invalid:border-editorial-error"
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <p className="mt-2 text-micro leading-relaxed text-editorial-gray-2">
            {design.type === "blok" ? t("topBoard.noteBlok") : t("topBoard.noteKizak")}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={onEven}
              className="rounded-pill border border-black/15 bg-white px-3 py-1 text-caption text-black transition duration-200 hover:border-black active:scale-[0.97]"
            >
              {t("topBoard.even")}
            </button>
            <button
              type="button"
              onClick={onSame}
              className="rounded-pill border border-black/15 bg-white px-3 py-1 text-caption text-black transition duration-200 hover:border-black active:scale-[0.97]"
            >
              {t("topBoard.same")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
