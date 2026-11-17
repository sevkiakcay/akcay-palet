import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isRtl, routing, type Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
// Self-hosted fonts, bundled out of node_modules, so `dev` and `build` need no
// network. Replaces next/font/google, which fetched from fonts.googleapis.com
// at build time and failed wherever that host was unreachable.
//
// Every @font-face below carries a unicode-range, so a browser still downloads
// only the subsets a page actually renders — the Arabic face never loads for
// the seven Latin/Greek/Cyrillic locales. Family names are mapped onto the
// --font-* custom properties in globals.css.
import "@fontsource-variable/inter"; // body — latin, latin-ext, greek, cyrillic
import "@fontsource-variable/geist-mono"; // mono
// Typography Variant B: restrained, technical display face for headings only;
// body stays on Inter. Weights kept to 500/600/700 — only what headings use.
// Has no Greek/Cyrillic/Arabic glyphs — globals.css swaps headings back to the
// body face for el, ru and ar.
import "@fontsource/space-grotesk/latin-500.css";
import "@fontsource/space-grotesk/latin-600.css";
import "@fontsource/space-grotesk/latin-700.css";
import "@fontsource/space-grotesk/latin-ext-500.css";
import "@fontsource/space-grotesk/latin-ext-600.css";
import "@fontsource/space-grotesk/latin-ext-700.css";
// Arabic subset only.
import "@fontsource/noto-sans-arabic/arabic-400.css";
import "@fontsource/noto-sans-arabic/arabic-500.css";
import "@fontsource/noto-sans-arabic/arabic-600.css";
import "@fontsource/noto-sans-arabic/arabic-700.css";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildMetadata({ locale, title: t("title"), description: t("description") });
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <html
      lang={locale}
      dir={isRtl(locale as Locale) ? "rtl" : "ltr"}
      // In-page anchors scroll smoothly (globals.css); this keeps route changes instant.
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
