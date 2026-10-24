import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Geist_Mono, Space_Grotesk, Noto_Sans_Arabic } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isRtl, routing, type Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import "../globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  // greek + cyrillic cover el and ru; latin-ext covers tr, de, fr, it.
  subsets: ["latin", "latin-ext", "greek", "cyrillic"],
});

// Typography Variant B candidate — restrained, technical display face for
// headings only; body stays on Inter. Weights kept minimal (500/600/700 —
// only what headings actually use) to avoid a heavy performance penalty.
// Has no Greek/Cyrillic/Arabic glyphs — globals.css swaps headings back to
// the body face for el, ru and ar.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

// Arabic only; not preloaded so the other seven languages never download it.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"],
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

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
      className={`${inter.variable} ${spaceGrotesk.variable} ${notoArabic.variable} ${geistMono.variable} h-full antialiased`}
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
