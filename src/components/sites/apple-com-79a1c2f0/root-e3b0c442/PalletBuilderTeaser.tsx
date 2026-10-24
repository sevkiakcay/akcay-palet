import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

// Presets offered as one-click starting points; each deep-links into the
// workshop with that preset preloaded (PalletWorkshop reads `?preset=`).
const START_PRESETS = ["eu", "ind", "half", "custom"] as const;

/**
 * Home-page "Paletini Hazırla" section — the entry point to the Pallet
 * Workshop. The visual is a real render from the workshop's 3D view, not
 * an illustration, so what the visitor sees here is what they get there.
 */
export function PalletBuilderTeaser() {
  const t = useTranslations("Builder");
  const tw = useTranslations("Workshop");
  const features = t.raw("features") as string[];

  return (
    <section id="paletini-hazirla" className="bg-surface-dark px-4 py-20 text-surface-dark-foreground md:px-6 md:py-28">
      <div className="mx-auto grid max-w-[1024px] items-center gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-14">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.2em] text-surface-dark-foreground/45 uppercase">
            {tw("eyebrow")}
          </p>
          <h2 className="font-heading mt-3 text-[33px] leading-[1.05] font-semibold tracking-[-0.015em] md:text-[46px]">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-surface-dark-foreground/65">{t("body")}</p>

          <p className="mt-8 text-[11px] font-medium tracking-[0.12em] text-surface-dark-foreground/45 uppercase">
            {t("startFrom")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {START_PRESETS.map((id) => (
              <li key={id}>
                <Link
                  href={{ pathname: "/pallet-workshop", query: { preset: id } }}
                  className="inline-flex rounded-full border border-surface-dark-foreground/15 px-3.5 py-1.5 text-[13px] text-surface-dark-foreground/85 transition-colors hover:border-primary hover:text-surface-dark-foreground"
                >
                  {tw(`presets.${id}`)}
                </Link>
              </li>
            ))}
          </ul>

          <Link
            href="/pallet-workshop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t("cta")}
            <span aria-hidden className="rtl:-scale-x-100">
              →
            </span>
          </Link>
        </div>

        <Link
          href="/pallet-workshop"
          tabIndex={-1}
          aria-hidden
          className="group relative block overflow-hidden rounded-2xl bg-[#f1efea] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] ring-1 ring-white/10"
        >
          <Image
            src="/images/pallet-workshop-preview.webp"
            alt={t("imageAlt")}
            width={1480}
            height={924}
            sizes="(min-width: 768px) 560px, 100vw"
            className="h-auto w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          <ul className="flex flex-wrap gap-1.5 px-3 pb-3 md:absolute md:inset-x-3 md:bottom-3 md:p-0">
            {features.map((feature) => (
              <li
                key={feature}
                className="rounded-full bg-[#141210]/80 px-2.5 py-1 text-[11px] font-medium text-white/90 backdrop-blur-sm"
              >
                {feature}
              </li>
            ))}
          </ul>
        </Link>
      </div>
    </section>
  );
}
