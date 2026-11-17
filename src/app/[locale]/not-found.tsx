import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Header } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/Header";
import { Footer } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/Footer";
import { CtaArrow } from "@/components/sites/apple-com-79a1c2f0/shared/CtaArrow";

/**
 * Localized 404, rendered inside the locale layout (header, footer, language,
 * direction). Reached two ways: a page calling `notFound()`, and any unmatched
 * path under a known locale via `[...rest]/page.tsx`. Static on purpose — no
 * GSAP reveal, no Motion: someone who mistyped a URL needs the way out at once.
 * The response is a 404 and Next.js adds `noindex`; metadata elements rendered
 * here would be ignored (Next.js manages <title>).
 */
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <>
      <Header />
      <main id="top" className="flex min-h-[80svh] flex-col justify-center bg-black pt-[140px] pb-section text-white md:pt-[116px]">
        <div className="editorial-shell">
          <p className="font-mono text-caption tracking-[0.2em] text-white/60 uppercase">404</p>
          <h1 className="mt-4 max-w-[16ch] text-section leading-[1.02] font-normal tracking-[-0.015em]">{t("title")}</h1>
          <p className="mt-5 max-w-[480px] text-body leading-relaxed text-white/70">{t("body")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 rounded-pill bg-white px-6 py-2.5 text-ui font-semibold text-black transition duration-200 hover:bg-white/90 active:scale-[0.97]"
            >
              {t("home")}
              <CtaArrow />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center rounded-pill border border-white/25 px-6 py-2.5 text-ui font-medium text-white transition duration-200 hover:border-white active:scale-[0.97]"
            >
              {t("products")}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
