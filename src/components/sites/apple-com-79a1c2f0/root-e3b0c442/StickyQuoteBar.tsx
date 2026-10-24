"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Mobile-only sticky bottom "Teklif Al" bar — the quote CTA within thumb
 * reach at all times while browsing, per the site's core conversion
 * priority. Hidden while the hero itself is in view (it has its own CTAs)
 * and once the visitor reaches the real quote section (#iletisim) so it
 * doesn't float redundantly over it.
 */
export function StickyQuoteBar() {
  const t = useTranslations("Common");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("ahsap-palet");
    const quoteSection = document.getElementById("iletisim");
    if (!hero || !quoteSection) return;

    let ticking = false;

    const evaluate = () => {
      ticking = false;
      const heroRect = hero.getBoundingClientRect();
      const quoteRect = quoteSection.getBoundingClientRect();
      const pastHero = heroRect.bottom <= 0;
      const atQuoteSection = quoteRect.top < window.innerHeight && quoteRect.bottom > 0;
      setVisible(pastHero && !atQuoteSection);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(evaluate);
    };

    evaluate();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-dark-foreground/10 bg-surface-dark/95 px-4 pt-3 backdrop-blur-md transition-transform duration-300 md:hidden"
      style={{
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        transform: visible ? "translateY(0)" : "translateY(100%)",
      }}
    >
      <a
        href="#iletisim"
        className="flex w-full items-center justify-center rounded-full bg-primary py-3 text-[15px] font-semibold text-primary-foreground transition duration-200 active:scale-[0.98] active:bg-primary/90"
      >
        {t("quote")}
      </a>
    </div>
  );
}
