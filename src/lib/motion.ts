import type { CSSProperties } from "react";

/** Stagger index for a `.reveal-*` child of a <Reveal> group: it starts index × `--stagger` (default 70ms) after the group enters view. */
export function stagger(index: number): CSSProperties {
  return { "--i": index } as CSSProperties;
}
