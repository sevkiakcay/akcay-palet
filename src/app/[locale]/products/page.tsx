import { use } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { Header } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/Header";
import { ProductsIntro } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/ProductsIntro";
import { ProductSpecs } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/ProductSpecs";
import { CustomManufacturing } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/CustomManufacturing";
import { FinalCta } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/FinalCta";
import { Footer } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/Footer";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ProductsPage" });
  return buildMetadata({ locale, href: "/products", title: t("metaTitle"), description: t("metaDescription") });
}

export default function ProductsPage({ params }: Props) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <>
      <BusinessJsonLd locale={locale} />
      <Header />
      <main id="top" className="flex min-h-screen flex-col">
        <ProductsIntro />
        <ProductSpecs />
        <CustomManufacturing />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
