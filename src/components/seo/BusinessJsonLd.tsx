import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { CONTACT } from "@/lib/contact";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

/**
 * Organization + LocalBusiness structured data. schema.org has no
 * `ManufacturingBusiness` type, so the manufacturer role is expressed via
 * `additionalType` (Wikidata: manufacturer). Only verified facts are emitted —
 * no address, opening hours, certifications or figures until they are confirmed.
 */
export async function BusinessJsonLd({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Meta" });

  const data = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    "@id": `${SITE_URL}/#organization`,
    additionalType: "https://www.wikidata.org/wiki/Q187939",
    name: "Akçay Palet",
    url: absoluteUrl(locale),
    description: t("description"),
    inLanguage: locale,
    knowsAbout: ["Wooden pallets", "EUR/EPAL pallet dimensions", "ISPM-15 heat treatment", "Custom pallet manufacturing"],
    ...(CONTACT.phone && { telephone: CONTACT.phone }),
    ...(CONTACT.email && { email: CONTACT.email }),
    // TODO: add the verified address (PostalAddress) and geo coordinates —
    // Google requires `address` for LocalBusiness rich results.
  };

  return (
    <script
      type="application/ld+json"
      // Escape "<" so the JSON can never close the script tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
