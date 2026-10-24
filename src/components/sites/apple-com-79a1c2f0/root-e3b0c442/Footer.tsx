import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "../shared/icons";

// Each link routes to the section that actually answers it — not a blanket
// "#iletisim" for everything (that dead-ended the whole footer at one anchor).
type FooterColumn = { heading: string; links: { label: string; href: string }[] };

/**
 * Message hrefs are section anchors ("#urunler", "#uretim-sureci"…). Products go to the
 * products page; the quote anchor exists on every page; other sections live on home.
 */
function routeFor(anchor: string) {
  const hash = anchor.replace(/^#/, "");
  if (hash === "urunler") return { pathname: "/products" } as const;
  if (hash === "palet-atolyesi") return { pathname: "/pallet-workshop" } as const;
  if (hash === "iletisim") return null;
  return { pathname: "/", hash } as const;
}

function FooterLink({ href, label }: { href: string; label: string }) {
  const route = routeFor(href);
  const className = "text-[13px] text-surface-dark-foreground/75 transition-colors hover:text-surface-dark-foreground";
  return route ? (
    <Link href={route} className={className}>
      {label}
    </Link>
  ) : (
    <a href={href} className={className}>
      {label}
    </a>
  );
}

export function Footer() {
  const t = useTranslations("Footer");
  const columns = t.raw("columns") as FooterColumn[];
  // No privacy/terms/cookie pages exist yet — plain text rather than links to nowhere.
  const legalLabels = t.raw("legal") as string[];

  return (
    <footer className="border-t border-surface-dark-foreground/10 bg-surface-dark text-surface-dark-foreground">
      <div className="mx-auto max-w-[1024px] px-6 py-14">
        <div className="flex items-center gap-2 text-[13px] font-semibold tracking-tight">
          <LogoMark className="h-4 w-4 text-primary" />
          Akçay Palet
        </div>
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-[11px] font-semibold tracking-[0.1em] text-surface-dark-foreground/45 uppercase">
                {col.heading}
              </h4>
              <ul className="mt-3 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterLink href={link.href} label={link.label} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-surface-dark-foreground/10 px-6 py-6">
        <p className="mx-auto max-w-[1024px] text-[11px] leading-relaxed text-surface-dark-foreground/40">
          {t("disclaimer")}
        </p>
        <div className="mx-auto mt-4 flex max-w-[1024px] flex-col items-start justify-between gap-3 text-[11px] text-surface-dark-foreground/40 sm:flex-row sm:items-center">
          <span>{t("copyright", { year: new Date().getFullYear() })}</span>
          <div className="flex gap-5">
            {legalLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
