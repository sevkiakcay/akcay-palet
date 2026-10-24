"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALE_LABELS, isRtl, routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Minimal dropdown in the site palette: Warm Ivory panel on the light header, Graphite Black text. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("Common");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

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
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-foreground/80 uppercase transition-colors hover:bg-foreground/5 hover:text-foreground",
          isPending && "opacity-50",
        )}
      >
        {locale}
        <svg viewBox="0 0 12 12" aria-hidden className={cn("h-2.5 w-2.5 transition-transform", open && "rotate-180")}>
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("language")}
          className="absolute end-0 top-full z-50 mt-2 min-w-[172px] overflow-hidden rounded-xl border border-border bg-background py-1 text-foreground shadow-[0_16px_40px_-16px_rgba(0,0,0,0.35)]"
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
                  className="flex w-full items-center justify-between gap-4 px-4 py-2 text-start text-[13px] transition-colors hover:bg-foreground/[0.04]"
                >
                  <span className={active ? "font-semibold" : undefined}>{LOCALE_LABELS[l]}</span>
                  <span className={cn("font-mono text-[10px] uppercase", active ? "text-primary" : "text-foreground/35")}>
                    {l}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
