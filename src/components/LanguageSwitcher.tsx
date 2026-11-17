"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, isRtl, routing, type Locale } from "@/i18n/routing";
import { dropdown, withoutMovement } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Minimal dropdown in the editorial mono palette: white panel, black text, hairline border. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  // Keeps the fade so the panel still reads as leaving, drops the travel.
  const reduceMotion = useReducedMotion();
  const panel = reduceMotion ? withoutMovement(dropdown) : dropdown;

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function select(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next, scroll: false });
    });
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("language")}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-pill px-2.5 py-1.5 font-mono text-micro tracking-[0.08em] text-black/70 uppercase transition-colors hover:bg-black/5 hover:text-black",
          isPending && "opacity-50",
        )}
      >
        {locale}
        <svg viewBox="0 0 12 12" aria-hidden className={cn("h-2.5 w-2.5 transition-transform", open && "rotate-180")}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {/* Motion owns this panel's enter AND leave. Before, the CSS `animate-in`
          classes played on enter and the panel vanished on a frame when React
          unmounted it — there is nobody left to run a CSS animation on an
          element that is going away. See docs/motion-plan.md. */}
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label={t("language")}
            initial={panel.initial}
            animate={panel.animate}
            exit={panel.exit}
            transition={panel.transition}
            className="absolute end-0 top-full z-50 mt-2 min-w-[172px] origin-top-right overflow-hidden rounded-none border border-black/10 bg-white py-1 text-black rtl:origin-top-left"
          >
            {routing.locales.map((l) => {
              const active = l === locale;
              return (
                <li key={l} role="option" aria-selected={active}>
                  <button
                    type="button"
                    lang={l}
                    dir={isRtl(l) ? "rtl" : "ltr"}
                    onClick={() => select(l)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-2 text-start text-small transition-colors hover:bg-black/[0.04]"
                  >
                    <span className={active ? "font-semibold" : undefined}>{LOCALE_LABELS[l]}</span>
                    <span className={cn("font-mono text-nano uppercase", active ? "text-black" : "text-black/35")}>
                      {l}
                    </span>
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
