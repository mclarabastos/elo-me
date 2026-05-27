import { ArrowRight, Eye, Fingerprint, Grid3x3, Link as LinkIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

const cards: { icon: ReactNode; title: string; desc: string; tag: string }[] = [
  {
    icon: <Eye className="size-5" />,
    title: "Auditoria contínua",
    desc: "Cada leitura, cada escrita, cada compartilhamento registrado em uma trilha verificável.",
    tag: "01 · LOG",
  },
  {
    icon: <LinkIcon className="size-5" />,
    title: "Trilha imutável",
    desc: "Eventos críticos ancorados on-chain via Chainlink CRE garantem que ninguém — nem nós — pode reescrever o histórico.",
    tag: "02 · CHAIN",
  },
  {
    icon: <Grid3x3 className="size-5" />,
    title: "Permissões granulares",
    desc: "Conceda acesso a um exame específico, não ao prontuário inteiro. Escopo, prazo e finalidade explícitos.",
    tag: "03 · SCOPE",
  },
  {
    icon: <Fingerprint className="size-5" />,
    title: "Identidade soberana",
    desc: "Sua identidade digital (DID) vive com você — não em silos de instituições. Portátil entre hospitais, clínicas e operadoras.",
    tag: "04 · DID",
  },
];

export function AuditSection() {
  return (
    <>
      <section
        id="auditoria"
        className="grid grid-cols-1 items-center gap-14 border-t border-[rgba(11,27,63,0.10)] px-[72px] py-[60px] lg:grid-cols-[1.2fr_1fr]"
      >
        <h3
          className="text-balance font-bold leading-[1.1] tracking-[-0.02em] text-[#0B1B3F]"
          style={{ fontSize: "clamp(28px, 3vw, 42px)" }}
        >
          Cada acesso registrado.
          <br />
          Cada permissão <span className="text-[#1E47FF]">auditável.</span>
        </h3>
        <div className="flex flex-col items-start gap-4">
          <p className="max-w-[380px] text-[15px] text-[rgba(11,27,63,0.62)]">
            Uma camada de auditoria contínua exibe — para você e para o regulador — exatamente o que foi visto, por quem, em que momento e sob qual permissão.
          </p>
          <Button className="rounded-full bg-[#1E47FF] text-white hover:bg-[#1638E0]">
            Ver trilha completa <ArrowRight className="ml-2 size-4" />
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3.5 px-[72px] pb-[90px] pt-[30px] md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <article
            key={c.tag}
            className="flex min-h-[220px] flex-col justify-between rounded-[18px] border border-[rgba(11,27,63,0.10)] bg-white p-5 pb-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-28px_rgba(11,27,63,0.28)]"
          >
            <div>
              <div className="grid size-[38px] place-items-center rounded-[10px] bg-[#DCE6FF] text-[#1E47FF]">
                {c.icon}
              </div>
              <h4 className="mt-4 text-[17px] font-bold leading-tight tracking-[-0.01em] text-[#0B1B3F]">
                {c.title}
              </h4>
              <p className="mt-1.5 text-[13.5px] leading-[1.5] text-[rgba(11,27,63,0.62)]">{c.desc}</p>
            </div>
            <span className="font-[family-name:var(--font-mono)] text-[11px] tracking-[0.12em] text-[rgba(11,27,63,0.45)]">
              {c.tag}
            </span>
          </article>
        ))}
      </div>
    </>
  );
}