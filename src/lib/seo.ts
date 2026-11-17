import type { Metadata } from "next";
import { getPathname } from "@/i18n/navigation";
import { OG_LOCALES, routing, type Locale } from "@/i18n/routing";

// TODO: the production domain is not verified yet — set NEXT_PUBLIC_SITE_URL
// in the deployment environment. Canonical, hreflang, sitemap and JSON-LD
// URLs are all built from this value.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.akcaypalet.com").replace(/\/$/, "");

export type Href = Parameters<typeof getPathname>[0]["href"];

type OgImage = { url: string; width: number; height: number };

// Last frame of the intro film: the assembled pallet with the TR · HT · AKÇAY block stamp (1280×720).
const DEFAULT_OG_IMAGE: OgImage = { url: "/cinematic/hero/hero-og.jpg", width: 1280, height: 720 };

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
  /** Social preview image for this page; defaults to the hero film's last frame. */
  image?: OgImage;
}): Metadata {
  const { locale, href = "/", title, description, image: ogImage = DEFAULT_OG_IMAGE } = opts;
  const url = absoluteUrl(locale, href);
  const image = { ...ogImage, alt: title };

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: "Akçay Palet",
    authors: [{ name: "Akçay Palet", url: SITE_URL }],
    creator: "Akçay Palet",
    publisher: "Akçay Palet",
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
    },
    // Keep iOS from turning pallet dimensions like "1200 × 800" into phone links.
    formatDetection: { telephone: false, address: false, email: false },
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
