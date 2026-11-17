"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { CONTACT, whatsappUrl } from "@/lib/contact";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CtaArrow } from "../shared/CtaArrow";
import { QuoteForm } from "./QuoteForm";

gsap.registerPlugin(ScrollTrigger);

export function FinalCta() {
  const t = useTranslations("Final");
  const titleLines = t.raw("titleLines") as string[];
  const quickChannels = [
    { label: "WhatsApp", value: whatsappUrl(t("whatsappMessage")) },
    { label: CONTACT.phone, value: CONTACT.phone ? `tel:${CONTACT.phone.replace(/\s/g, "")}` : null },
    { label: CONTACT.email, value: CONTACT.email ? `mailto:${CONTACT.email}` : null },
  ].filter((c): c is { label: string; value: string } => Boolean(c.label && c.value));

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Title lines — each line slides up from behind a mask
      gsap.from("[data-cta-line]", {
        y: "100%",
        duration: 1,
        ease: "power3.out",
        stagger: 0.12,
        scrollTrigger: { trigger: section, start: "top 75%" },
      });

      // Body
      gsap.from("[data-cta-body]", {
        y: 25,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-cta-body]", start: "top 85%" },
      });

      // CTA buttons
      gsap.from("[data-cta-buttons] > *", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-cta-buttons]", start: "top 88%" },
      });

      // Quote form
      gsap.from("[data-cta-form]", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: "[data-cta-form]", start: "top 85%" },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="iletisim"
      className="film-grain light-sweep bg-surface-dark py-32 text-center text-surface-dark-foreground md:py-44"
    >
      <h2 className="font-heading mx-auto px-6 text-[clamp(40px,9vw,88px)] leading-[0.98] font-bold tracking-[-0.02em] uppercase">
        {titleLines.map((line, i) => (
          <span key={i} className="block overflow-hidden">
            <span data-cta-line className="block">
              {line}
            </span>
          </span>
        ))}
      </h2>
      <p
        data-cta-body
        className="mx-auto mt-8 max-w-[480px] px-6 text-[15px] leading-relaxed text-surface-dark-foreground/55 md:text-[17px]"
      >
        {t("body")}
      </p>

      {quickChannels.length > 0 && (
        <div
          data-cta-buttons
          className="mt-10 flex flex-wrap items-center justify-center gap-3 px-6 text-[15px] font-medium"
        >
          {quickChannels.map((channel) => (
            <a
              key={channel.label}
              href={channel.value}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-primary-foreground transition duration-300 hover:bg-primary/90 active:scale-[0.97]"
            >
              <bdi>{channel.label}</bdi>
              <CtaArrow />
            </a>
          ))}
        </div>
      )}

      <div data-cta-form className="px-6">
        <QuoteForm />
      </div>
    </section>
  );
}
