import { useTranslations } from "next-intl";

/** Top of the dedicated products page — dark like the home hero, but compact: the spec table below is the content. */
export function ProductsIntro() {
  const t = useTranslations("ProductsPage");
  const tc = useTranslations("Common");

  return (
    <section className="relative overflow-hidden bg-surface-dark px-6 pt-[150px] pb-20 text-surface-dark-foreground md:pt-[180px] md:pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[760px] text-center">
        <p className="text-[11px] font-semibold tracking-[0.28em] text-surface-dark-foreground/50 uppercase">
          {t("eyebrow")}
        </p>
        <h1 className="font-heading mt-4 text-[36px] leading-[1.06] font-bold tracking-[-0.02em] md:text-[56px]">
          {t("title")}
        </h1>
        <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-surface-dark-foreground/70 md:text-[18px]">
          {t("body")}
        </p>
        <a
          href="#iletisim"
          className="mt-7 inline-flex rounded-full bg-primary px-6 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {tc("quote")}
        </a>
      </div>
    </section>
  );
}
