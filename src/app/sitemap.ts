import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl, localizedAlternates } from "@/lib/seo";

const PAGES = Object.keys(routing.pathnames) as Array<keyof typeof routing.pathnames>;

// One entry per page per language, each listing every language alternate (hreflang).
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((href) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, href),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: href === "/" ? (locale === routing.defaultLocale ? 1 : 0.9) : 0.8,
      alternates: { languages: localizedAlternates(href) },
    })),
  );
}
