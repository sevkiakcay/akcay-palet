import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["tr", "en", "de", "fr", "it", "el", "ru", "ar"],
  // Turkish is the primary language and stays at the bare root (`/`); every
  // other language lives under its own subpath (`/en`, `/de`, …).
  defaultLocale: "tr",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export function isRtl(locale: Locale) {
  return locale === "ar";
}

/** Each language named in itself, so a visitor recognises their own regardless of the current page language. */
export const LOCALE_LABELS: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  el: "Ελληνικά",
  ru: "Русский",
  ar: "العربية",
};

export const OG_LOCALES: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
  de: "de_DE",
  fr: "fr_FR",
  it: "it_IT",
  el: "el_GR",
  ru: "ru_RU",
  ar: "ar_AR",
};
