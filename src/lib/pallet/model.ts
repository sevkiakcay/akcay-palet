/**
 * Pallet Workshop model — geometry, load estimate, warnings, bill of materials
 * and the technical drawing. Ported 1:1 from the original "Palet Atölyesi"
 * tool. Everything here is pure and language-free: anything shown to a
 * visitor is returned as a key (+ params) and translated by the UI.
 * All lengths are millimetres.
 */

export type PalletType = "blok" | "kizak";
export type WoodKey = "cam" | "ladin" | "kavak" | "kayin";
export type TreatKey = "yok" | "ht" | "kd" | "htkd";
export type PaintKey = "yok" | "mavi" | "kirmizi" | "yesil" | "sari";
export type BlockMaterial = "masif" | "pres";
export type PartKind = "top" | "cross" | "block" | "bottom" | "stringer";

export type PalletDesign = {
  type: PalletType;
  L: number;
  W: number;
  topN: number;
  topW: number;
  topT: number;
  blkX: number;
  blkZ: number;
  blkH: number;
  crsW: number;
  crsT: number;
  blkMat: BlockMaterial;
  strN: number;
  strH: number;
  strT: number;
  botN: number;
  botW: number;
  botT: number;
  wood: WoodKey;
  treat: TreatKey;
  paint: PaintKey;
  stamp: string;
};

export type NumericKey = {
  [K in keyof PalletDesign]: PalletDesign[K] extends number ? K : never;
}[keyof PalletDesign];

export const WOOD: Record<WoodKey, { rho: number; sigma: number; color: number }> = {
  cam: { rho: 520, sigma: 10, color: 0xd8b57e },
  ladin: { rho: 470, sigma: 9, color: 0xe6cfa2 },
  kavak: { rho: 430, sigma: 7, color: 0xe9dbb8 },
  kayin: { rho: 700, sigma: 14, color: 0xc99b6e },
};
export const WOOD_KEYS = Object.keys(WOOD) as WoodKey[];
export const TREAT_KEYS: TreatKey[] = ["yok", "ht", "kd", "htkd"];
export const PAINT: Record<PaintKey, number | null> = {
  yok: null,
  mavi: 0x2f5f9e,
  kirmizi: 0xa8382c,
  yesil: 0x3b7a4a,
  sari: 0xd9a92b,
};
export const PAINT_KEYS = Object.keys(PAINT) as PaintKey[];

export const BASE: PalletDesign = {
  type: "blok",
  L: 1200,
  W: 800,
  topN: 5,
  topW: 120,
  topT: 22,
  blkX: 145,
  blkZ: 100,
  blkH: 78,
  crsW: 145,
  crsT: 22,
  blkMat: "masif",
  strN: 3,
  strH: 100,
  strT: 50,
  botN: 3,
  botW: 120,
  botT: 22,
  wood: "cam",
  treat: "ht",
  paint: "yok",
  stamp: "AKÇAY PALET",
};

export type PresetId = "eu" | "ind" | "kz" | "us" | "tk" | "half";
export const PRESETS: { id: PresetId; d: Partial<PalletDesign> }[] = [
  { id: "eu", d: {} },
  { id: "ind", d: { W: 1000, topN: 7, topW: 100, botW: 145 } },
  {
    id: "kz",
    d: { type: "kizak", W: 1000, topN: 9, topW: 100, topT: 20, strN: 3, strH: 100, strT: 50, botN: 5, botW: 100, botT: 20 },
  },
  {
    id: "us",
    d: {
      type: "kizak", L: 1219, W: 1016, topN: 7, topW: 140, topT: 16, strN: 3, strH: 89, strT: 38, botN: 5, botW: 89, botT: 16,
      wood: "kavak",
    },
  },
  {
    id: "tk",
    d: {
      type: "kizak", L: 1200, W: 800, topN: 7, topW: 90, topT: 15, strN: 3, strH: 75, strT: 40, botN: 3, botW: 90, botT: 15,
      wood: "kavak", treat: "yok",
    },
  },
  { id: "half", d: { L: 800, W: 600, topN: 4, topW: 110, blkX: 120, blkZ: 100, crsW: 120, botW: 100 } },
];

export type NumberField = { k: NumericKey; u: "mm" | "pcs"; min: number; max: number; step: number; show?: (d: PalletDesign) => boolean };
export type SelectField = { k: "type" | "blkMat" | "wood" | "treat" | "paint"; options: readonly string[]; wide?: boolean };
export type TextField = { k: "stamp"; max: number };
export type Field = NumberField | SelectField | TextField;
export type FieldGroup = { g: "dims" | "construction" | "top" | "blocks" | "stringers" | "bottom" | "material"; show?: (d: PalletDesign) => boolean; items: Field[] };

export const SCHEMA: FieldGroup[] = [
  {
    g: "dims",
    items: [
      { k: "L", u: "mm", min: 400, max: 2400, step: 10 },
      { k: "W", u: "mm", min: 400, max: 2000, step: 10 },
    ],
  },
  { g: "construction", items: [{ k: "type", options: ["blok", "kizak"], wide: true }] },
  {
    g: "top",
    items: [
      { k: "topN", u: "pcs", min: 2, max: 15, step: 1 },
      { k: "topW", u: "mm", min: 50, max: 220, step: 5 },
      { k: "topT", u: "mm", min: 12, max: 40, step: 1 },
    ],
  },
  {
    g: "blocks",
    show: (d) => d.type === "blok",
    items: [
      { k: "blkX", u: "mm", min: 70, max: 220, step: 5 },
      { k: "blkZ", u: "mm", min: 70, max: 220, step: 5 },
      { k: "blkH", u: "mm", min: 50, max: 140, step: 1 },
      { k: "crsW", u: "mm", min: 70, max: 220, step: 5 },
      { k: "crsT", u: "mm", min: 12, max: 40, step: 1 },
      { k: "blkMat", options: ["masif", "pres"] },
    ],
  },
  {
    g: "stringers",
    show: (d) => d.type === "kizak",
    items: [
      { k: "strN", u: "pcs", min: 2, max: 5, step: 1 },
      { k: "strH", u: "mm", min: 50, max: 160, step: 1 },
      { k: "strT", u: "mm", min: 25, max: 100, step: 1 },
    ],
  },
  {
    g: "bottom",
    items: [
      { k: "botN", u: "pcs", min: 2, max: 9, step: 1, show: (d) => d.type === "kizak" },
      { k: "botW", u: "mm", min: 50, max: 220, step: 5 },
      { k: "botT", u: "mm", min: 12, max: 40, step: 1 },
    ],
  },
  {
    g: "material",
    items: [
      { k: "wood", options: WOOD_KEYS },
      { k: "treat", options: TREAT_KEYS },
      { k: "paint", options: PAINT_KEYS },
      { k: "stamp", max: 24 },
    ],
  },
];

export function isNumberField(f: Field): f is NumberField {
  return "min" in f;
}
export function isSelectField(f: Field): f is SelectField {
  return "options" in f;
}

export function numberField(k: NumericKey): NumberField | undefined {
  for (const g of SCHEMA) for (const it of g.items) if (isNumberField(it) && it.k === k) return it;
  return undefined;
}

/* ───────────── Geometry ───────────── */

export type Box = { k: PartKind; x0: number; x1: number; y0: number; y1: number; z0: number; z1: number };

function spread(n: number, size: number, total: number) {
  if (n <= 1) return [(total - size) / 2];
  return Array.from({ length: n }, (_, i) => (i * (total - size)) / (n - 1));
}

export function geometry(d: PalletDesign): { boxes: Box[]; H: number } {
  const B: Box[] = [];
  const { L, W } = d;
  const box = (k: PartKind, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
    B.push({ k, x0, x1, y0, y1, z0, z1 });
  let y = 0;
  if (d.type === "blok") {
    const rows = [0, (W - d.blkZ) / 2, W - d.blkZ];
    const cols = [0, (L - d.blkX) / 2, L - d.blkX];
    rows.forEach((z) => {
      let z0 = z + d.blkZ / 2 - d.botW / 2;
      z0 = Math.max(0, Math.min(W - d.botW, z0));
      box("bottom", 0, L, 0, d.botT, z0, z0 + d.botW);
    });
    y = d.botT;
    rows.forEach((z) => cols.forEach((x) => box("block", x, x + d.blkX, y, y + d.blkH, z, z + d.blkZ)));
    y += d.blkH;
    cols.forEach((x) => {
      let x0 = x + d.blkX / 2 - d.crsW / 2;
      x0 = Math.max(0, Math.min(L - d.crsW, x0));
      box("cross", x0, x0 + d.crsW, y, y + d.crsT, 0, W);
    });
    y += d.crsT;
    spread(d.topN, d.topW, W).forEach((z) => box("top", 0, L, y, y + d.topT, z, z + d.topW));
    y += d.topT;
  } else {
    spread(d.botN, d.botW, L).forEach((x) => box("bottom", x, x + d.botW, 0, d.botT, 0, W));
    y = d.botT;
    spread(d.strN, d.strT, W).forEach((z) => box("stringer", 0, L, y, y + d.strH, z, z + d.strT));
    y += d.strH;
    spread(d.topN, d.topW, L).forEach((x) => box("top", x, x + d.topW, y, y + d.topT, 0, W));
    y += d.topT;
  }
  return { boxes: B, H: y };
}

/* ───────────── Calculation ───────────── */

export type BomRow = { k: PartKind; dims: number[]; n: number; v: number };
export type Warning =
  | { code: "topNoFit" }
  | { code: "topGapWide"; gap: number }
  | { code: "bottomNoFit" }
  | { code: "blocksTouch" }
  | { code: "blockLow" }
  | { code: "stringerLow" }
  | { code: "thinTop" }
  | { code: "noIspm" };

/** Warnings that make the design physically impossible — a quote can't be requested until they're fixed. */
export const BLOCKING_WARNINGS: Warning["code"][] = ["topNoFit", "bottomNoFit", "blocksTouch"];

export type Calc = {
  boxes: Box[];
  H: number;
  bom: BomRow[];
  vol: number;
  weight: number;
  dyn: number;
  stat: number;
  rack: number | null;
  warns: Warning[];
};

export function calc(d: PalletDesign): Calc {
  const { boxes, H } = geometry(d);
  const groups: Record<string, BomRow> = {};
  let vol = 0;
  let weight = 0;
  const rho = WOOD[d.wood].rho;
  for (const b of boxes) {
    const dx = b.x1 - b.x0;
    const dy = b.y1 - b.y0;
    const dz = b.z1 - b.z0;
    const v = (dx * dy * dz) / 1e9;
    vol += v;
    const isPres = b.k === "block" && d.blkMat === "pres";
    weight += v * (isPres ? 600 : rho);
    const dims = (b.k === "block" ? [dx, dz, dy] : [Math.max(dx, dz), Math.min(dx, dz), dy]).map((n) => Math.round(n));
    const key = `${b.k}|${dims.join("x")}`;
    groups[key] ??= { k: b.k, dims, n: 0, v: 0 };
    groups[key].n++;
    groups[key].v += v;
  }
  const order: PartKind[] = ["top", "cross", "stringer", "block", "bottom"];
  const bom = Object.values(groups).sort((a, b) => order.indexOf(a.k) - order.indexOf(b.k));

  // Rough load estimate from top-deck board bending.
  const sig = WOOD[d.wood].sigma;
  let s: number;
  let blen: number;
  if (d.type === "blok") {
    s = (d.L - d.crsW) / 2;
    blen = d.L;
  } else {
    s = (d.W - d.strT) / Math.max(1, d.strN - 1);
    blen = d.W;
  }
  s = Math.max(s, 80);
  const Z = (d.topW * d.topT * d.topT) / 6;
  const q = (8 * sig * Z) / (s * s);
  const r50 = (n: number) => Math.max(50, Math.round(n / 50) * 50);
  const dyn = r50(((q * blen * d.topN) / 9.81) * 0.9);
  const stat = r50(dyn * 2.6);
  const rack = d.type === "blok" ? r50(dyn * 0.6) : null;

  const warns: Warning[] = [];
  const deckSpan = d.type === "blok" ? d.W : d.L;
  const gapTop = d.topN > 1 ? (deckSpan - d.topN * d.topW) / (d.topN - 1) : 0;
  if (gapTop < 0) warns.push({ code: "topNoFit" });
  else if (gapTop > 110) warns.push({ code: "topGapWide", gap: Math.round(gapTop) });
  if (d.type === "kizak") {
    const g = (d.L - d.botN * d.botW) / Math.max(1, d.botN - 1);
    if (g < 0) warns.push({ code: "bottomNoFit" });
  }
  if (d.type === "blok" && (d.blkX * 3 > d.L || d.blkZ * 3 > d.W)) warns.push({ code: "blocksTouch" });
  if (d.type === "blok" && d.blkH < 70) warns.push({ code: "blockLow" });
  if (d.type === "kizak" && d.strH < 75) warns.push({ code: "stringerLow" });
  if (d.topT < 16) warns.push({ code: "thinTop" });
  if (d.treat === "yok") warns.push({ code: "noIspm" });

  return { boxes, H, bom, vol, weight, dyn, stat, rack, warns };
}

/* ───────────── Technical drawing (SVG) ───────────── */

export type DrawingLabels = { top: string; front: string; side: string; caption: string };
export type DrawingPalette = {
  ink: string;
  bg: string | null;
  dim: string;
  font: string;
  fill: Record<PartKind, string>;
};

export const PRINT_PALETTE: DrawingPalette = {
  ink: "#111",
  bg: "#fff",
  dim: "#555",
  font: "ui-monospace, Menlo, Consolas, monospace",
  fill: { top: "#E9D3A8", cross: "#DCC08E", block: "#C9A46D", bottom: "#D6BA88", stringer: "#C9A46D" },
};

const escXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);

export function drawingSVG(d: PalletDesign, labels: DrawingLabels, P: DrawingPalette = PRINT_PALETTE): string {
  const { boxes, H } = geometry(d);
  const { L, W } = d;
  const m = 90;
  const gap = 110;
  const vbW = m + L + gap + W + m;
  const vbH = m + W + gap + H + m + 40;
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" font-family="${P.font}" role="img" aria-label="${escXml(labels.caption)}">`;
  if (P.bg) out += `<rect width="${vbW}" height="${vbH}" fill="${P.bg}"/>`;
  const sw = Math.max(1.2, L / 700);
  const rect = (x: number, y: number, w: number, h: number, k: PartKind) =>
    `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${P.fill[k]}" stroke="${P.ink}" stroke-width="${sw}"/>`;
  const fs = Math.max(18, L / 45);
  const label = (x: number, y: number, t: string, anchor = "middle", size = fs) =>
    `<text x="${x}" y="${y}" font-size="${size}" fill="${P.ink}" text-anchor="${anchor}">${escXml(t)}</text>`;
  const dimH = (x0: number, x1: number, y: number, t: string) =>
    `<g stroke="${P.dim}" stroke-width="${sw * 0.8}"><line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/><line x1="${x0}" y1="${y - 10}" x2="${x0}" y2="${y + 10}"/><line x1="${x1}" y1="${y - 10}" x2="${x1}" y2="${y + 10}"/></g>${label((x0 + x1) / 2, y - 12, t)}`;
  const dimV = (x: number, y0: number, y1: number, t: string) =>
    `<g stroke="${P.dim}" stroke-width="${sw * 0.8}"><line x1="${x}" y1="${y0}" x2="${x}" y2="${y1}"/><line x1="${x - 10}" y1="${y0}" x2="${x + 10}" y2="${y0}"/><line x1="${x - 10}" y1="${y1}" x2="${x + 10}" y2="${y1}"/></g><text x="${x - 14}" y="${(y0 + y1) / 2}" font-size="${fs}" fill="${P.ink}" text-anchor="middle" transform="rotate(-90 ${x - 14} ${(y0 + y1) / 2})">${t}</text>`;

  // Plan view (from above): x → right, z → down.
  const px = m;
  const pz = m;
  out += label(px, pz - 48, labels.top, "start", fs * 0.8);
  [...boxes].sort((a, b) => a.y1 - b.y1).forEach((b) => (out += rect(px + b.x0, pz + b.z0, b.x1 - b.x0, b.z1 - b.z0, b.k)));
  out += dimH(px, px + L, pz - 16, `${L}`);
  out += dimV(px - 22, pz, pz + W, `${W}`);
  // Front view (x, y), back to front.
  const fx = m;
  const fBase = m + W + gap + H;
  out += label(fx, m + W + gap - 24, labels.front, "start", fs * 0.8);
  [...boxes].sort((a, b) => a.z1 - b.z1).forEach((b) => (out += rect(fx + b.x0, fBase - b.y1, b.x1 - b.x0, b.y1 - b.y0, b.k)));
  out += dimV(fx - 22, fBase - H, fBase, `${Math.round(H)}`);
  // Side view (z, y).
  const sx = m + L + gap;
  out += label(sx, m + W + gap - 24, labels.side, "start", fs * 0.8);
  [...boxes].sort((a, b) => a.x1 - b.x1).forEach((b) => (out += rect(sx + b.z0, fBase - b.y1, b.z1 - b.z0, b.y1 - b.y0, b.k)));
  out += dimH(sx, sx + W, fBase + 34, `${W}`);
  out += label(vbW - m, vbH - 14, labels.caption, "end", fs * 0.75);
  return `${out}</svg>`;
}
