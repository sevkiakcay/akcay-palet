import { use } from "react";
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { BusinessJsonLd } from "@/components/seo/BusinessJsonLd";
import { Header } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/Header";
import { Hero } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/Hero";
import { HeroTransition } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/HeroTransition";
import { ProductSpecs } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/ProductSpecs";
import { CustomManufacturing } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/CustomManufacturing";
import { ProcessShowcase } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/ProcessShowcase";
import { WhyUs } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/WhyUs";
import { FinalCta } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/FinalCta";
import { Footer } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/Footer";
import { StickyQuoteBar } from "@/components/sites/apple-com-79a1c2f0/root-e3b0c442/StickyQuoteBar";

export default function Home({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = use(params);
  setRequestLocale(locale);

  return (
    <main id="top" className="flex min-h-screen flex-col">
      <BusinessJsonLd locale={locale} />
      <Header />
      <Hero />
      <HeroTransition />
      <ProductSpecs />
      <CustomManufacturing />
      <ProcessShowcase />
      <WhyUs />
      <FinalCta />
      <Footer />
      <StickyQuoteBar />
    </main>
  );
}
