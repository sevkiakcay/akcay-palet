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
        <p className="reveal text-[11px] font-semibold tracking-[0.28em] text-surface-dark-foreground/55 uppercase">
          {t("eyebrow")}
        </p>
        <h1
          className="reveal font-heading mt-4 text-[36px] leading-[1.06] font-bold tracking-[-0.02em] md:text-[56px]"
          style={{ animationDelay: "80ms" }}
        >
          {t("title")}
        </h1>
        <p
          className="reveal mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-surface-dark-foreground/70 md:text-[18px]"
          style={{ animationDelay: "160ms" }}
        >
          {t("body")}
        </p>
        <a
          href="#iletisim"
          className="reveal mt-7 inline-flex rounded-full bg-primary px-6 py-2.5 text-[15px] font-medium text-primary-foreground transition duration-200 hover:bg-primary/90 active:scale-[0.97]"
          style={{ animationDelay: "240ms" }}
        >
          {tc("quote")}
        </a>
      </div>
    </section>
  );
}
