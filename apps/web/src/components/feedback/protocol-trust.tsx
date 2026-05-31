"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";

type ProblemCard = {
  title: string;
  description: string;
  className?: string;
};

const cardContents: ProblemCard[] = [
  {
    title: "Saúde é o setor mais caro do Brasil em vazamento de dados",
    description:
      "Uma violação de dados em saúde custa, em média, R$ 10,46 milhões no Brasil. Para clínicas privadas, laboratórios e operadoras, proteger o acesso ao prontuário virou risco financeiro, jurídico e reputacional.",
    className: "lg:col-span-3 lg:row-span-2",
  },
  {
    title: "Dados médicos são mais sensíveis do que dados bancários",
    description:
      "Senhas e cartões podem ser trocados. Um diagnóstico, um exame ou um histórico clínico não. Quando dados de saúde vazam, o dano pode envolver fraude, exposição íntima, extorsão e perda de confiança no atendimento.",
    className: "lg:col-span-3 lg:row-span-2",
  },
  {
    title: "O problema central é saber quem acessou, o quê, quando e por quê",
    description:
      "Em clínicas privadas, vários profissionais, áreas e sistemas podem tocar o mesmo prontuário. Sem consentimento claro e histórico auditável, o paciente perde controle e a instituição perde capacidade de comprovar que cada acesso foi autorizado.",
    className: "self-start !min-h-0 lg:col-span-4 lg:row-span-1",
  },
  {
    title: "Pacientes querem transparência sobre o uso dos seus dados",
    description:
      "Pesquisas mostram que consentimento, transparência e possibilidade de escolha aumentam a confiança do paciente no compartilhamento de dados de saúde. O problema é que, na prática, esse controle ainda é pouco visível.",
    className: "lg:col-span-2 lg:row-span-1",
  },
  {
    title: "Clínicas privadas precisam comprovar consentimento",
    description:
      "Com LGPD, digitalização e prontuários fragmentados, não basta acessar dados médicos: é preciso demonstrar quem solicitou, o que foi autorizado, por quanto tempo e com qual finalidade.",
    className: "lg:col-span-2 lg:row-span-1 lg:-mt-24",
  },
];

function PlusCard({ className = "", title, description }: ProblemCard) {
  return (
    <article
      className={cn(
        "relative min-h-[200px] overflow-visible border border-dashed border-[rgba(11,27,63,0.24)] bg-white/58 p-6",
        "flex flex-col justify-between transition-colors duration-300",
        "hover:bg-white/78",
        className,
      )}
    >
      <CornerPlusIcons />

      <div className="relative z-10 space-y-3">
        <h3 className="max-w-[620px] text-[20px] font-black leading-[1.08] tracking-[-0.04em] text-[#0B1B3F] sm:text-[22px]">
          {title}
        </h3>

        <p className="max-w-[720px] text-[14px] leading-[1.65] text-[rgba(11,27,63,0.64)] sm:text-[15px]">
          {description}
        </p>
      </div>
    </article>
  );
}

function CornerPlusIcons() {
  return (
    <>
      <PlusIcon className="absolute -left-3 -top-3" />
      <PlusIcon className="absolute -right-3 -top-3" />
      <PlusIcon className="absolute -bottom-3 -left-3" />
      <PlusIcon className="absolute -bottom-3 -right-3" />
    </>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={24}
      height={24}
      strokeWidth="1"
      stroke="currentColor"
      className={cn("h-6 w-6 text-[rgba(11,27,63,0.44)]", className)}
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
}

export function ProtocolTrust() {
  return (
    <section
      id="problema"
      className="relative border-t border-[rgba(11,27,63,0.08)] bg-[rgba(11,27,63,0.035)] px-5 py-16 sm:px-8 lg:px-12 lg:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(11,27,63,0.045),bg-[rgba(11,27,63,0.02)]),rgba(11,27,63,0.025))]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(circle_at_50%_0%,rgba(30,71,255,0.14),transparent_62%)]"
      />

      <div className="relative mx-auto w-full max-w-[1160px] border-x border-[rgba(11,27,63,0.08)] px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {cardContents.map((card) => (
            <PlusCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-8 max-w-[690px] px-1 text-left sm:px-4 lg:-mt-28 lg:ml-auto lg:text-right">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1E47FF]">
            O problema
          </p>

          <h2 className="mt-4 text-balance text-[34px] font-black leading-[0.98] tracking-[-0.055em] text-[#0B1B3F] sm:text-[46px] lg:text-[58px]">
            Dados médicos circulam, mas o consentimento ainda não é simples de
            verificar.
          </h2>
        </div>
      </div>
    </section>
  );
}