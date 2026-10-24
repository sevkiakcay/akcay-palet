import { useTranslations } from "next-intl";

type Step = { title: string; desc: string };

// Kontrol noktaları üretim sürecimizin bir parçasıdır; bunlar bağımsız bir
// sertifikasyon iddiası değildir. Doğrulanmış sertifika/belge bilgisi
// eklendiğinde bu bölüm ayrı bir "Belgelerimiz" bileşeniyle genişletilebilir.
// TODO: Onaylı sertifika/belge bilgisi netleşince ayrı bölüm eklenecek.

export function ProcessShowcase() {
  const t = useTranslations("Process");
  const steps = t.raw("steps") as Step[];
  const checkpoints = t.raw("checkpoints") as string[];

  return (
    <section id="uretim-sureci" className="bg-surface-dark py-20 text-surface-dark-foreground md:py-28">
      <p className="px-6 text-center text-[12px] font-semibold tracking-[0.2em] text-surface-dark-foreground/45 uppercase">
        {t("eyebrow")}
      </p>
      <h2 className="font-heading mt-3 px-6 text-center text-[31px] font-semibold tracking-[-0.015em] md:text-[46px]">
        {t("title")}
      </h2>

      <div className="mx-auto mt-16 max-w-[1024px] px-6 md:mt-20">
        <div className="relative grid gap-x-6 gap-y-12 sm:grid-cols-3">
          <div
            aria-hidden
            className="absolute top-[14px] right-[16.5%] left-[16.5%] hidden h-px bg-surface-dark-foreground/15 sm:block"
          />
          {steps.map((step, i) => (
            <div key={i} className="relative text-center">
              <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-surface-dark ring-1 ring-surface-dark-foreground/25">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              </div>
              <p className="mt-4 font-mono text-[13px] tracking-widest text-primary/80">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 text-[17px] font-semibold">{step.title}</h3>
              <p className="mx-auto mt-2 max-w-[240px] text-[14px] text-surface-dark-foreground/60">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-[1024px] px-6 md:mt-24">
        <p className="text-center text-[12px] font-medium tracking-wide text-surface-dark-foreground/50 uppercase">
          {t("checkpointsTitle")}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {checkpoints.map((point) => (
            <span key={point} className="text-[13px] text-surface-dark-foreground/80">
              {point}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
