import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { CONTACT } from "@/lib/contact";
import { SITE_URL, absoluteUrl, type Href } from "@/lib/seo";

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;
const LOGO = { url: `${SITE_URL}/brand/akcay-pallets-logo.png`, width: 1280, height: 440 };
const DEFAULT_IMAGE = `${SITE_URL}/cinematic/hero/hero-og.jpg`;

type Page = {
  href: Href;
  /** `Header.nav.*` key whose label names this page in the breadcrumb. */
  navKey: "products" | "workshop";
  /** Site-relative path of the page's main image. */
  image?: string;
};

/**
 * Site-wide structured data as one linked `@graph`:
 *  - Organization + LocalBusiness: the company. schema.org has no
 *    `ManufacturingBusiness` type, so the manufacturer role is expressed via
 *    `additionalType` (Wikidata: manufacturer).
 *  - WebSite: the site itself, published by that organization, in all languages.
 *  - WebPage (+ BreadcrumbList on sub-pages): the page being rendered.
 * Only verified facts are emitted — no address, opening hours, certifications,
 * prices or figures until they are confirmed (so no Product/Offer nodes either:
 * Google flags Product markup without offers or reviews as invalid).
 */
export async function BusinessJsonLd({ locale, page }: { locale: Locale; page?: Page }) {
  const t = await getTranslations({ locale, namespace: "Meta" });
  const th = await getTranslations({ locale, namespace: "Header" });
  const pageName = page ? th(`nav.${page.navKey}`) : null;
  const homeUrl = absoluteUrl(locale);
  const pageUrl = page ? absoluteUrl(locale, page.href) : homeUrl;

  const organization = {
    "@type": ["Organization", "LocalBusiness"],
    "@id": ORG_ID,
    additionalType: "https://www.wikidata.org/wiki/Q187939",
    name: "Akçay Palet",
    url: homeUrl,
    logo: { "@type": "ImageObject", "@id": `${SITE_URL}/#logo`, ...LOGO },
    image: DEFAULT_IMAGE,
    description: t("description"),
    knowsAbout: ["Wooden pallets", "EUR/EPAL pallet dimensions", "ISPM-15 heat treatment", "Custom pallet manufacturing"],
    ...(CONTACT.phone && { telephone: CONTACT.phone }),
    ...(CONTACT.email && { email: CONTACT.email }),
    // TODO: add the verified address (PostalAddress) and geo coordinates —
    // Google requires `address` for LocalBusiness rich results.
  };

  const website = {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: homeUrl,
    name: "Akçay Palet",
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };

  const webPage = {
    "@type": "WebPage",
    "@id": `${pageUrl}#webpage`,
    url: pageUrl,
    name: pageName ? `${pageName} | Akçay Palet` : t("title"),
    inLanguage: locale,
    isPartOf: { "@id": SITE_ID },
    about: { "@id": ORG_ID },
    primaryImageOfPage: page?.image ? `${SITE_URL}${page.image}` : DEFAULT_IMAGE,
    ...(page && {
      breadcrumb: {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Akçay Palet", item: homeUrl },
          { "@type": "ListItem", position: 2, name: pageName, item: pageUrl },
        ],
      },
    }),
  };

  const data = { "@context": "https://schema.org", "@graph": [organization, website, webPage] };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so the JSON can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
