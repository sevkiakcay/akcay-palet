"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Routed links (not bare "#…" anchors) so the nav works from every page, not just home.
const NAV_LINKS = [
  { key: "products", href: { pathname: "/products" } },
  { key: "workshop", href: { pathname: "/pallet-workshop" } },
  { key: "custom", href: { pathname: "/", hash: "ozel-uretim" } },
  { key: "process", href: { pathname: "/", hash: "uretim-sureci" } },
  { key: "why", href: { pathname: "/", hash: "neden-akcay" } },
] as const;

// Past this much scroll the announcement ribbon folds away and the nav bar stands alone.
const COMPACT_AFTER_PX = 24;

// rAF-deduped so a scroll gesture triggers at most one `scrollY` read (and one
// useSyncExternalStore snapshot check) per frame, not once per native scroll
// event — the same dedupe StickyQuoteBar already uses for its own listener.
function subscribeToScroll(onChange: () => void) {
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      onChange();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}

const MENU_BAR = "absolute inset-x-0 h-[1.5px] rounded-full bg-current transition duration-300 ease-editorial motion-reduce:transition-none";

export function Header() {
  const t = useTranslations("Header");
  const tc = useTranslations("Common");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  // false on the server and during hydration, so the first client render matches the HTML.
  const compact = useSyncExternalStore(subscribeToScroll, () => window.scrollY > COMPACT_AFTER_PX, () => false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <div className="fixed inset-x-0 top-0 z-50">
      {/* Grid row 1fr → 0fr folds the ribbon at its real height, whether it runs to one line or two. */}
      <div
        inert={compact}
        className={cn(
          "grid bg-black transition-[grid-template-rows] duration-500 ease-editorial motion-reduce:transition-none",
          compact ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
        )}
      >
        <div className="overflow-hidden">
          <p className="px-4 py-[10px] text-center text-[12px] leading-[18px] text-white">
            {t("announcement")}{" "}
            <a href="#iletisim" className="underline underline-offset-2 hover:no-underline">
              {t("announcementLink")}
            </a>
          </p>
        </div>
      </div>
      <header
        className={cn(
          "border-b border-black/10 bg-white/95 backdrop-blur-xl transition-[box-shadow] duration-300",
          compact && "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.25)]",
        )}
      >
        <nav className="mx-auto box-content flex h-11 max-w-[1078px] items-center justify-between px-4 text-[12px] font-medium">
          <Link href="/" className="flex items-center gap-2.5 text-black" aria-label={t("homeLabel")}>
            {/* Brand badge (1280×440 source); alt is empty because the link label and name text already say it. */}
            <Image
              src="/brand/akcay-pallets-logo.png"
              alt=""
              width={81}
              height={28}
              priority
              className="h-7 w-auto"
            />
            <span className="text-[13px] font-semibold tracking-tight">Akçay Palet</span>
          </Link>
          <ul className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => {
              const current = !("hash" in link.href) && pathname === link.href.pathname;
              return (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    aria-current={current ? "page" : undefined}
                    className="relative py-1 text-black/65 transition-colors duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 after:ease-editorial hover:text-black hover:after:scale-x-100 aria-[current=page]:text-black aria-[current=page]:after:scale-x-100 rtl:after:origin-right"
                  >
                    {t(`nav.${link.key}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="#iletisim"
              className="hidden rounded-pill bg-black px-4 py-1.5 text-[12px] font-semibold text-white transition duration-200 hover:bg-black/85 active:scale-[0.97] md:inline-block"
            >
              {tc("quote")}
            </a>
            <button
              type="button"
              aria-label={menuOpen ? t("menuClose") : t("menuOpen")}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="-me-2.5 flex h-10 w-10 items-center justify-center text-black/80 md:hidden"
            >
              {/* Three bars that fold into an ×. */}
              <span aria-hidden className="relative h-3.5 w-[18px]">
                <span className={cn(MENU_BAR, "top-0", menuOpen && "translate-y-1.5 rotate-45")} />
                <span className={cn(MENU_BAR, "top-1.5", menuOpen && "opacity-0")} />
                <span className={cn(MENU_BAR, "top-3", menuOpen && "-translate-y-1.5 -rotate-45")} />
              </span>
            </button>
          </div>
        </nav>

        <div
          id="mobile-menu"
          inert={!menuOpen}
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-editorial motion-reduce:transition-none md:hidden",
            menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-black/10 bg-white px-4 py-3">
              <ul className="flex flex-col divide-y divide-black/10">
                {NAV_LINKS.map((link) => (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-[14px] font-medium text-black transition-colors active:text-black/60"
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  </li>
                ))}
              </ul>
              <a
                href="#iletisim"
                onClick={() => setMenuOpen(false)}
                className="mt-3 flex items-center justify-center rounded-pill bg-black px-5 py-2.5 text-[14px] font-semibold text-white transition duration-200 active:scale-[0.98]"
              >
                {tc("quote")}
              </a>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
