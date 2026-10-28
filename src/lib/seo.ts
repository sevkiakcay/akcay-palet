import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { OG_LOCALES, routing, type Locale } from "@/i18n/routing";

// TODO: the production domain is not verified yet — set NEXT_PUBLIC_SITE_URL
// in the deployment environment. Canonical, hreflang, sitemap and JSON-LD
// URLs are all built from this value.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.akcaypalet.com").replace(/\/$/, "");

type Href = Parameters<typeof getPathname>[0]["href"];

export function absoluteUrl(locale: Locale, href: Href = "/") {
  return SITE_URL + getPathname({ locale, href });
}

/** Absolute URL of a page in every language, plus `x-default` (Turkish, the primary language). */
export function localizedAlternates(href: Href = "/") {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) languages[locale] = absoluteUrl(locale, href);
  languages["x-default"] = absoluteUrl(routing.defaultLocale, href);
  return languages;
}

export function buildMetadata(opts: {
  locale: Locale;
  href?: Href;
  title: string;
  description: string;
}): Metadata {
  const { locale, href = "/", title, description } = opts;
  const url = absoluteUrl(locale, href);
  // Final, fully-assembled frame of the hero sequence (1280×720).
  // Last frame of the intro film: the assembled pallet with the TR · HT · AKÇAY block stamp.
  const image = { url: "/cinematic/hero/hero-og.jpg", width: 1280, height: 720, alt: title };

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: {
      canonical: url,
      languages: localizedAlternates(href),
    },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "Akçay Palet",
      locale: OG_LOCALES[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALES[l]),
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
