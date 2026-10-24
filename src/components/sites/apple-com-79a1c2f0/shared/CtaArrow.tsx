/** Trailing "→" for CTA labels: nudges forward while the parent `group` is hovered, mirrored for RTL. */
export function CtaArrow() {
  return (
    <span
      aria-hidden
      className="inline-block transition-transform duration-300 ease-precise rtl:-scale-x-100 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
    >
      →
    </span>
  );
}
