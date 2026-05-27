import Link from "next/link";
import { Lock, Network, ShieldCheck } from "lucide-react";

const groups = [
  {
    title: "Produto",
    items: [
      { label: "Identidade ELO", href: "#produto" },
      { label: "Consentimento", href: "#consentimento" },
      { label: "Auditoria", href: "#auditoria" },
      { label: "API & SDKs", href: "#api" },
    ],
  },
  {
    title: "Para",
    items: [
      { label: "Pacientes", href: "#pacientes" },
      { label: "Hospitais", href: "#hospitais" },
      { label: "Operadoras", href: "#operadoras" },
      { label: "Reguladores", href: "#reguladores" },
    ],
  },
  {
    title: "Empresa",
    items: [
      { label: "Sobre", href: "#sobre" },
      { label: "Segurança", href: "#seguranca" },
      { label: "LGPD", href: "#lgpd" },
      { label: "Contato", href: "#contato" },
    ],
  },
];

const seals = [
  { icon: <Network className="size-3.5" />, label: "Chainlink CRE" },
  { icon: <Lock className="size-3.5" />, label: "Web3" },
  { icon: <ShieldCheck className="size-3.5" />, label: "Privacidade" },
];

export function SiteFooter() {
  return (
    <footer
      className="border-t border-[rgba(11,27,63,0.10)] px-[60px] pb-9 pt-[60px]"
      style={{ background: "linear-gradient(180deg, transparent, rgba(189,208,255,0.20))" }}
    >
      <div className="grid grid-cols-1 gap-10 border-b border-[rgba(11,27,63,0.10)] pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 text-[#0B1B3F]">
            <svg viewBox="0 0 24 24" className="size-[22px] text-[#1E47FF]" fill="currentColor">
              <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
            </svg>
            <span className="text-[18px] font-bold tracking-[0.02em]">
              ELO<span className="text-[#1E47FF]">.</span>
              <span className="font-medium text-[#1B2C58]">me</span>
            </span>
          </Link>
          <p className="mt-3 max-w-[320px] text-sm leading-[1.55] text-[rgba(11,27,63,0.62)]">
            Identidade, consentimento e auditoria para dados de saúde.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {seals.map((s) => (
              <li
                key={s.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(11,27,63,0.10)] bg-[#F7F8FC] px-3 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1B3F]"
              >
                <span className="text-[#1E47FF]">{s.icon}</span>
                {s.label}
              </li>
            ))}
          </ul>
        </div>

        {groups.map((g) => (
          <nav key={g.title} aria-label={g.title}>
            <h5 className="mb-4 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(11,27,63,0.45)]">
              {g.title}
            </h5>
            <ul className="flex flex-col gap-2">
              {g.items.map((it) => (
                <li key={it.label}>
                  <Link href={it.href} className="text-sm text-[#1B2C58] hover:text-[#1E47FF]">
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.10em] text-[rgba(11,27,63,0.45)] sm:flex-row sm:items-center">
        <span>© 2026 ELO.ME · CNPJ 00.000.000/0001-00</span>
        <span>Status: Operacional · Chainlink CRE</span>
      </div>
    </footer>
  );
}