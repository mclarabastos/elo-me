import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

const cards: {
  icon: ReactNode;
  title: string;
  desc: string;
}[] = [
  {
    icon: <UserRound className="size-5" />,
    title: "Paciente",
    desc: "Recebe solicitações, decide quais dados compartilhar e acompanha o histórico de acessos em um painel simples.",
  },
  {
    icon: <Building2 className="size-5" />,
    title: "Clínica",
    desc: "Solicita acesso com finalidade clara, acompanha pacientes vinculados e consulta somente os dados autorizados.",
  },
  {
    icon: <ShieldCheck className="size-5" />,
    title: "Admin",
    desc: "Visualiza a operação da plataforma, acompanha indicadores e apoia a governança dos fluxos de consentimento.",
  },
];

export function AuditSection() {
  return (
    <>
      <section
        id="experiencias"
        className="grid grid-cols-1 items-center gap-10 border-t border-[rgba(11,27,63,0.10)] px-5 py-[60px] sm:px-8 lg:grid-cols-[1.2fr_1fr] lg:px-[72px]"
      >
        <div>
          <p className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1E47FF]">
            Perfis da plataforma
          </p>

          <h3
            className="text-balance font-bold leading-[1.1] tracking-[-0.02em] text-[#0B1B3F]"
            style={{ fontSize: "clamp(28px, 3vw, 42px)" }}
          >
            Cada perfil vê apenas o que precisa para agir com segurança.
          </h3>
        </div>

        <div className="flex flex-col items-start gap-4">
          <p className="max-w-[430px] text-[15px] leading-[1.65] text-[rgba(11,27,63,0.62)]">
            A Elo.me organiza a experiência por perfil: o paciente controla, a
            clínica opera o fluxo e o admin acompanha a saúde da plataforma.
          </p>

          <Button
            asChild
            className="rounded-full bg-[#1E47FF] text-white hover:bg-[#1638E0]"
          >
            <Link href="/auth/login">
              Ver demo dos perfis
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3.5 px-5 pb-[90px] pt-[20px] sm:px-8 md:grid-cols-3 lg:px-[72px]">
        {cards.map((card) => (
          <article
            key={card.title}
            className="flex min-h-[220px] flex-col justify-between rounded-[18px] border border-[rgba(11,27,63,0.10)] bg-white p-5 pb-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-28px_rgba(11,27,63,0.28)]"
          >
            <div>
              <div className="grid size-[38px] place-items-center rounded-[10px] bg-[#DCE6FF] text-[#1E47FF]">
                {card.icon}
              </div>

              <h4 className="mt-4 text-[17px] font-bold leading-tight tracking-[-0.01em] text-[#0B1B3F]">
                {card.title}
              </h4>

              <p className="mt-1.5 text-[13.5px] leading-[1.55] text-[rgba(11,27,63,0.62)]">
                {card.desc}
              </p>
            </div>
          </article>
        ))}
      </div>

      <section className="mx-5 mb-[90px] border border-[rgba(11,27,63,0.10)] bg-[#0B1B3F] p-6 text-white sm:mx-8 sm:p-8 lg:mx-[72px]">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
              Visão unificada
            </p>

            <h3 className="mt-3 text-[26px] font-black leading-[1.05] tracking-[-0.04em] sm:text-[34px]">
              Uma única jornada, com responsabilidades separadas.
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/[0.04] p-4">
              <UserRound className="h-5 w-5 text-[#7EA2FF]" strokeWidth={1.7} />
              <p className="mt-3 text-[13px] font-semibold text-white/82">
                Paciente decide.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-4">
              <ClipboardList
                className="h-5 w-5 text-[#7EA2FF]"
                strokeWidth={1.7}
              />
              <p className="mt-3 text-[13px] font-semibold text-white/82">
                Clínica acompanha.
              </p>
            </div>

            <div className="border border-white/10 bg-white/[0.04] p-4">
              <ShieldCheck
                className="h-5 w-5 text-[#7EA2FF]"
                strokeWidth={1.7}
              />
              <p className="mt-3 text-[13px] font-semibold text-white/82">
                Admin monitora.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}