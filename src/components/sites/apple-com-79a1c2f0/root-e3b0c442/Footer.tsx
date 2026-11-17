import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

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
  const className = "text-small text-white/70 transition-colors hover:text-white";
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
    <footer className="border-t border-white/10 bg-black text-white">
      <div className="mx-auto box-content max-w-[1078px] px-6 py-14">
        <div className="flex items-center gap-3 text-small font-semibold tracking-tight">
          {/* Same 1280×440 badge as the header; its black plate melts into the footer surface. */}
          <Image src="/brand/akcay-pallets-logo.png" alt="" width={93} height={32} className="h-8 w-auto" />
          Akçay Palet
        </div>
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <h4 className="text-micro font-normal tracking-[0.1em] text-white/50 uppercase">{col.heading}</h4>
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

      <div className="border-t border-white/10 px-6 py-6">
        <p className="mx-auto max-w-[1078px] text-micro leading-relaxed text-white/50">{t("disclaimer")}</p>
        <div className="mx-auto mt-4 flex max-w-[1078px] flex-col items-start justify-between gap-3 text-micro text-white/50 sm:flex-row sm:items-center">
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
