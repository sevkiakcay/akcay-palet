import { useTranslations } from "next-intl";

type Pillar = { title: string; desc: string };

export function WhyUs() {
  const t = useTranslations("Why");
  const pillars = t.raw("pillars") as Pillar[];

  return (
    <section id="neden-akcay" className="bg-surface-alt py-20 md:py-28">
      <h2 className="font-heading px-6 text-center text-[29px] font-semibold tracking-[-0.015em] text-foreground md:text-[42px]">
        {t("title")}
      </h2>
      <div className="mx-auto mt-12 grid max-w-[1024px] gap-10 px-6 sm:grid-cols-3">
        {pillars.map((pillar) => (
          <div key={pillar.title} className="text-center">
            <h3 className="text-[17px] font-semibold text-foreground">{pillar.title}</h3>
            <p className="mt-2 text-[14px] text-muted-foreground">{pillar.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
