"use client";

import * as React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  BadgeCheck,
  Bell,
  CheckCircle2,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    number: "01",
    actor: "Entrada simples",
    title: "Paciente cria sua identidade",
    description:
      "A pessoa entra com Google, e-mail ou telefone e organiza seus dados médicos sem lidar com carteira, chave privada ou termos técnicos.",
    status: "Identidade criada",
    icon: UserRound,
  },
  {
    number: "02",
    actor: "Pedido de acesso",
    title: "A instituição solicita dados",
    description:
      "A clínica ou profissional de saúde informa a finalidade do atendimento e escolhe apenas os dados necessários para aquela situação.",
    status: "Pedido enviado",
    icon: Stethoscope,
  },
  {
    number: "03",
    actor: "Notificação",
    title: "Paciente recebe a solicitação",
    description:
      "A solicitação aparece dentro da plataforma e também pode ser simulada por e-mail ou SMS na demonstração.",
    status: "Paciente avisado",
    icon: Bell,
  },
  {
    number: "04",
    actor: "Decisão do paciente",
    title: "Paciente aprova, recusa ou limita",
    description:
      "A pessoa pode liberar todos os dados solicitados, negar o acesso ou compartilhar apenas parte das informações.",
    status: "Permissão definida",
    icon: FileCheck2,
  },
  {
    number: "05",
    actor: "Checagem automática",
    title: "O sistema confere a permissão",
    description:
      "Antes da consulta, a Elo.me verifica se a instituição, o profissional, a permissão e os dados solicitados estão de acordo.",
    status: "Acesso conferido",
    icon: ShieldCheck,
  },
  {
    number: "06",
    actor: "Registro seguro",
    title: "A autorização fica registrada",
    description:
      "A decisão do paciente gera um histórico de auditoria, sem expor prontuários, exames ou dados médicos sensíveis.",
    status: "Histórico atualizado",
    icon: BadgeCheck,
  },
  {
    number: "07",
    actor: "Consulta limitada",
    title: "Acesso somente aos dados permitidos",
    description:
      "A equipe autorizada visualiza apenas os dados liberados, dentro do prazo e da finalidade definidos pelo paciente.",
    status: "Consulta liberada",
    icon: LockKeyhole,
  },
];

function WorkflowCard({
  step,
  index,
}: {
  step: (typeof WORKFLOW_STEPS)[number];
  index: number;
}) {
  const Icon = step.icon;
  const isLeft = index % 2 === 0;

  return (
    <div
      className={`relative grid gap-5 lg:grid-cols-[1fr_88px_1fr] ${
        isLeft ? "" : "lg:[&>article]:col-start-3"
      }`}
    >
      <motion.article
        initial={{ opacity: 0, y: 26, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.45 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="group relative border border-[rgba(11,27,63,0.10)] bg-white/72 p-6 shadow-[0_26px_70px_-55px_rgba(11,27,63,0.55)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:bg-white"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1E47FF]">
              {step.number}
            </span>

            <span className="rounded-full border border-[rgba(11,27,63,0.10)] bg-[#F7F8FC] px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[rgba(11,27,63,0.46)]">
              {step.actor}
            </span>
          </div>

          <h3 className="mt-5 text-[22px] font-black leading-[1.05] tracking-[-0.045em] text-[#0B1B3F] sm:text-[24px]">
            {step.title}
          </h3>

          <p className="mt-4 max-w-[460px] text-[14px] leading-[1.65] text-[rgba(11,27,63,0.64)]">
            {step.description}
          </p>
        </div>

        <div
          className={`mt-6 inline-flex items-center gap-2 rounded-full border border-[rgba(30,71,255,0.18)] bg-white px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[#1E47FF] ${
            isLeft
              ? "lg:absolute lg:-right-[108px] lg:top-[calc(50%+38px)]"
              : "lg:absolute lg:-left-[108px] lg:top-[calc(50%+38px)]"
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
          {step.status}
        </div>
      </motion.article>

      <div className="pointer-events-none absolute left-0 top-6 hidden h-14 w-14 items-center justify-center rounded-full border border-[rgba(30,71,255,0.20)] bg-[#F7F8FC] shadow-[0_0_0_10px_rgba(247,248,252,0.92)] lg:left-1/2 lg:flex lg:-translate-x-1/2">
        <motion.div
          initial={{ scale: 0.72, opacity: 0.35 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.35 }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1E47FF] text-white shadow-[0_0_0_10px_rgba(30,71,255,0.10)]"
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </motion.div>
      </div>
    </div>
  );
}

export function ConsentWorkflowSection() {
  const sectionRef = React.useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 68%", "end 52%"],
  });

  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      id="workflow"
      ref={sectionRef}
      className="relative border-t border-[rgba(11,27,63,0.08)] px-5 py-20 sm:px-8 lg:px-12 lg:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(circle_at_50%_0%,rgba(30,71,255,0.13),transparent_62%)]"
      />

      <div className="relative mx-auto max-w-[1160px]">
        <div className="mx-auto max-w-[780px] text-center">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1E47FF]">
            A Solução
          </p>

          <h2 className="mt-4 text-balance text-[34px] font-black leading-[0.98] tracking-[-0.055em] text-[#0B1B3F] sm:text-[46px] lg:text-[58px]">
            Do pedido de acesso à consulta segura.
          </h2>

          <p className="mx-auto mt-5 max-w-[680px] text-[15px] leading-[1.65] text-[rgba(11,27,63,0.64)] sm:text-[16px]">
            A Elo.me organiza a jornada de consentimento para que o paciente
            decida, a instituição acompanhe e o atendimento aconteça somente com
            os dados permitidos.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            aria-hidden
            className="absolute left-7 top-0 h-full w-px bg-[rgba(11,27,63,0.10)] lg:left-1/2 lg:-translate-x-1/2"
          />

          <motion.div
            aria-hidden
            style={{ scaleY: lineScale, transformOrigin: "top" }}
            className="absolute left-7 top-0 h-full w-px bg-[#1E47FF] lg:left-1/2 lg:-translate-x-1/2"
          />

          <div className="space-y-14 pl-16 lg:space-y-20 lg:pl-0">
            {WORKFLOW_STEPS.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  <div className="absolute left-[-54px] top-6 flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(30,71,255,0.20)] bg-[#F7F8FC] shadow-[0_0_0_8px_rgba(247,248,252,0.94)] lg:hidden">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E47FF] text-white">
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                    </div>
                  </div>

                  <WorkflowCard step={step} index={index} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}