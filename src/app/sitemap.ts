import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { absoluteUrl, localizedAlternates } from "@/lib/seo";

// One-page site: one entry per language, each listing every alternate (hreflang).
export default function sitemap(): MetadataRoute.Sitemap {
  return routing.locales.map((locale) => ({
    url: absoluteUrl(locale),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: { languages: localizedAlternates() },
  }));
}
