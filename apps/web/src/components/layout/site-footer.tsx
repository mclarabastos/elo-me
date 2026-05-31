import Image from "next/image";
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
      { label: "Clínicas", href: "#clinicas" },
      { label: "Médicos", href: "#medicos" },
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
  { icon: <ShieldCheck className="size-3.5" />, label: "Privacidade" },
];

export function SiteFooter() {
  return (
    <footer
      className="border-t border-[rgba(11,27,63,0.10)] px-[60px] pb-9 pt-[56px]"
      style={{
        background:
          "linear-gradient(180deg, transparent, rgba(189,208,255,0.20))",
      }}
    >
      <div className="grid grid-cols-1 gap-10 border-b border-[rgba(11,27,63,0.10)] pb-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            aria-label="Ir para a página inicial da ELO.me"
            className="inline-flex items-center"
          >
            <Image
              src="/images/elo.me_logoF.png"
              alt="ELO.me"
              width={150}
              height={80}
              className="h-auto w-[100px] object-contain"
            />
          </Link>

          <p className="mt-4 max-w-[300px] text-sm leading-[1.55] text-[rgba(11,27,63,0.62)]">
            Consentimento, privacidade e auditoria para dados médicos.
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
          <nav key={g.title} aria-label={g.title} className="pt-3">
            <h5 className="mb-4 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(11,27,63,0.45)]">
              {g.title}
            </h5>

            <ul className="flex flex-col gap-2">
              {g.items.map((it) => (
                <li key={it.label}>
                  <Link
                    href={it.href}
                    className="text-sm text-[#1B2C58] hover:text-[#1E47FF]"
                  >
                    {it.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="mt-5 flex flex-col items-start justify-between gap-2 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.10em] text-[rgba(11,27,63,0.45)] sm:flex-row sm:items-center">
        <span>© 2026 ELO.me</span>
        <span>Projeto em desenvolvimento · Chainlink CRE</span>
      </div>
    </footer>
  );
}