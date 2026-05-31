"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BillingPlan = "monthly" | "annually";

type Plan = {
  id: string;
  title: string;
  desc: string;
  monthlyPrice: number | null;
  annuallyPrice: number | null;
  badge?: string;
  buttonText: string;
  features: string[];
  buttonTone?: "navy" | "blue";
};

const PLANS: Plan[] = [
  {
    id: "patient-essential",
    title: "Paciente Essencial",
    desc: "Controle básico de solicitações, permissões e histórico de acesso aos seus dados médicos.",
    monthlyPrice: 29.9,
    annuallyPrice: 299,
    buttonText: "Começar como paciente",
    buttonTone: "navy",
    features: [
      "Identidade médica portátil",
      "Solicitações de acesso recebidas",
      "Aprovação, recusa ou liberação parcial",
      "Histórico de acessos",
      "Revogação de consentimento",
    ],
  },
  {
    id: "patient-plus",
    title: "Paciente Plus",
    desc: "Mais recursos para acompanhar documentos, permissões e compartilhamentos recorrentes.",
    monthlyPrice: 59.9,
    annuallyPrice: 599,
    badge: "Recomendado",
    buttonText: "Ver plano Plus",
    buttonTone: "blue",
    features: [
      "Tudo do Essencial",
      "Mais documentos e categorias",
      "Alertas de solicitações",
      "Compartilhamento avançado por escopo",
      "Histórico ampliado de auditoria",
    ],
  },
  {
    id: "family",
    title: "Família",
    desc: "Controle de permissões e histórico médico para mais de uma pessoa em uma única assinatura.",
    monthlyPrice: 99.9,
    annuallyPrice: 999,
    buttonText: "Conhecer plano família",
    buttonTone: "navy",
    features: [
      "Perfis familiares",
      "Gestão de permissões por pessoa",
      "Histórico individual de acessos",
      "Notificações centralizadas",
      "Ideal para dependentes e cuidadores",
    ],
  },
  {
    id: "clinic",
    title: "Clínica",
    desc: "Painel institucional para solicitar acessos, acompanhar pacientes e manter rastreabilidade.",
    monthlyPrice: 499,
    annuallyPrice: 4990,
    badge: "Recomendado",
    buttonText: "Falar com a equipe",
    buttonTone: "blue",
    features: [
        "Painel da clínica",
        "Médicos vinculados",
        "Solicitação de acesso ao prontuário",
        "Consulta apenas de dados autorizados",
        "Logs e auditoria institucional",
    ],
    },
  {
    id: "clinic-pro",
    title: "Clínica Pro",
    desc: "Mais recursos para clínicas com maior volume de solicitações, pacientes e profissionais.",
    monthlyPrice: 899,
    annuallyPrice: 8990,
    buttonText: "Ver plano Pro",
    buttonTone: "navy",
    features: [
      "Tudo do plano Clínica",
      "Mais usuários profissionais",
      "Indicadores operacionais",
      "Suporte prioritário",
      "Preparado para integrações futuras",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    desc: "Plano sob consulta para operações com integrações, requisitos específicos e escala.",
    monthlyPrice: null,
    annuallyPrice: null,
    buttonText: "Solicitar proposta",
    buttonTone: "navy",
    features: [
      "Condições personalizadas",
      "Integrações sob demanda",
      "Governança avançada",
      "Relatórios executivos",
      "Apoio para compliance e operação",
    ],
  },
];

function formatPrice(value: number | null, billingPlan: BillingPlan) {
  if (value === null) {
    return "Sob consulta";
  }

  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

  return billingPlan === "monthly" ? `${formatted}/mês` : `${formatted}/ano`;
}

function SideRecommendationTab({ label }: { label: string }) {
  return (
    <div className="absolute right-[-1px] top-6 z-20">
      <div className="rounded-l-full border border-r-0 border-[rgba(30,71,255,0.22)] bg-[#F4F7FF] px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#1E47FF] shadow-sm">
        {label}
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  billingPlan,
}: {
  plan: Plan;
  billingPlan: BillingPlan;
}) {
  const hasSideBadge =
    plan.id === "patient-plus" || plan.id === "clinic";

  return (
    <article
      className={cn(
        "relative flex w-full flex-col overflow-hidden border border-[rgba(11,27,63,0.10)] bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-42px_rgba(11,27,63,0.35)] sm:p-6",
        hasSideBadge && "border-[rgba(30,71,255,0.32)] bg-[#F8FAFF]",
      )}
    >
      {hasSideBadge && plan.badge ? (
        <SideRecommendationTab label={plan.badge} />
      ) : null}

      <div>
        <h3 className="text-[22px] font-black leading-[1.05] tracking-[-0.04em] text-[#0B1B3F]">
          {plan.title}
        </h3>
      </div>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          <motion.p
            key={`${plan.id}-${billingPlan}`}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="text-[28px] font-black tracking-[-0.045em] text-[#0B1B3F] sm:text-[34px]"
          >
            {formatPrice(
              billingPlan === "monthly"
                ? plan.monthlyPrice
                : plan.annuallyPrice,
              billingPlan,
            )}
          </motion.p>
        </AnimatePresence>

        <p className="mt-3 min-h-[66px] text-[14px] leading-[1.55] text-[rgba(11,27,63,0.62)]">
          {plan.desc}
        </p>
      </div>

      <div className="mt-5">
        <Button
          className={cn(
            "w-full rounded-full",
            plan.buttonTone === "blue"
              ? "bg-[#1E47FF] text-white hover:bg-[#1638E0]"
              : "bg-[#0B1B3F] text-white hover:bg-[#152A5C]",
          )}
        >
          {plan.buttonText}
        </Button>

        <div className="h-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={billingPlan}
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="mx-auto mt-3 block text-center text-[12px] text-[rgba(11,27,63,0.50)]"
            >
              {billingPlan === "monthly" ? "Cobrança mensal" : "Cobrança anual"}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-[rgba(11,27,63,0.08)] pt-5">
        {plan.features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <CheckIcon
              className="mt-0.5 size-4 shrink-0 text-[#1E47FF]"
              strokeWidth={1.8}
            />
            <span className="text-[13px] leading-[1.5] text-[rgba(11,27,63,0.70)]">
              {feature}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}

export function BusinessSection() {
  const [billingPlan, setBillingPlan] = useState<BillingPlan>("monthly");

  const handleSwitch = () => {
    setBillingPlan((prev) => (prev === "monthly" ? "annually" : "monthly"));
  };

  return (
    <section
      id="negocio"
      className="border-t border-[rgba(11,27,63,0.10)] px-5 py-[88px] sm:px-8 lg:px-[72px]"
    >
      <div className="mx-auto flex max-w-[1160px] flex-col items-center">
        <div className="mx-auto max-w-[820px] text-center">
          <h2 className="mt-4 text-balance text-[34px] font-black leading-[0.98] tracking-[-0.055em] text-[#0B1B3F] sm:text-[46px] lg:text-[58px]">
            Transformando confiança em{" "}
            <span className="text-[#1E47FF]">produto.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-[720px] text-[15px] leading-[1.65] text-[rgba(11,27,63,0.64)] sm:text-[16px]">
            A Elo.me combina assinatura para pacientes com planos institucionais
            para clínicas privadas que precisam solicitar acessos, acompanhar
            consentimentos e manter auditoria.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <span className="text-[14px] font-semibold text-[#0B1B3F]">
            Mensal
          </span>

          <button
            type="button"
            onClick={handleSwitch}
            aria-label="Alternar cobrança mensal ou anual"
            className="relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1E47FF] focus-visible:ring-offset-2"
          >
            <div className="h-7 w-14 rounded-full bg-[#1E47FF] shadow-md" />
            <div
              className={cn(
                "absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition-transform duration-300 ease-out",
                billingPlan === "annually" ? "translate-x-7" : "translate-x-0",
              )}
            />
          </button>

          <span className="text-[14px] font-semibold text-[#0B1B3F]">
            Anual
          </span>
        </div>

        <div className="mt-10 grid w-full grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PLANS.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              billingPlan={billingPlan}
            />
          ))}
        </div>
      </div>
    </section>
  );
}