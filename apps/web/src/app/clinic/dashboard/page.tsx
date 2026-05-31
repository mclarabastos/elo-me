import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";
import {
  getDemoClinic,
  getDemoDoctor,
  getFrontendAuditTimeline,
  getFrontendShareFlow,
} from "@/lib/api";

export const dynamic = "force-dynamic";

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Ativa",
    inactive: "Inativa",
    pending: "Pendente",
    ready: "Pronto",
    online: "Online",
  };

  return labels[status] ?? status;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatPatientName(patientId: string) {
  const labels: Record<string, string> = {
    patient_rose: "Roseane Carreiro",
  };

  return labels[patientId] ?? patientId;
}

function StatusPill({
  label,
  tone = "success",
}: {
  label: string;
  tone?: "success" | "info" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-[rgba(31,174,106,0.35)] text-[var(--success)]"
      : tone === "warning"
        ? "border-[rgba(240,160,43,0.45)] text-[var(--warning)]"
        : tone === "danger"
          ? "border-[rgba(213,64,64,0.35)] text-[var(--danger)]"
          : "border-[rgba(30,71,255,0.25)] text-[var(--blue)]";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-[6px] border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}
    >
      {label}
    </span>
  );
}

function PulseStatusDot({
  tone = "success",
}: {
  tone?: "success" | "info" | "warning" | "danger";
}) {
  const colorClass =
    tone === "success"
      ? "bg-[var(--success)]"
      : tone === "warning"
        ? "bg-[var(--warning)]"
        : tone === "danger"
          ? "bg-[var(--danger)]"
          : "bg-[var(--blue)]";

  const ringClass =
    tone === "success"
      ? "bg-[rgba(31,174,106,0.18)]"
      : tone === "warning"
        ? "bg-[rgba(240,160,43,0.18)]"
        : tone === "danger"
          ? "bg-[rgba(213,64,64,0.18)]"
          : "bg-[rgba(30,71,255,0.18)]";

  return (
    <span className="relative flex h-3 w-3 shrink-0">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${ringClass}`}
      />
      <span
        className={`relative inline-flex h-3 w-3 rounded-full ${colorClass}`}
      />
    </span>
  );
}

function InfoItem({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="border-b border-[var(--line)] py-4 last:border-b-0 md:border-b-0 md:border-r md:px-5 md:py-0 md:last:border-r-0">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
        {label}
      </p>

      <p className="mt-2 break-words text-[15px] font-semibold text-[var(--navy)]">
        {value}
      </p>

      {helper ? (
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function OperationItem({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="border border-[var(--line)] bg-[var(--paper)] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[var(--sky-2)] text-[var(--blue)]">
        {icon}
      </div>

      <h3 className="mt-5 text-[15px] font-bold tracking-[-0.01em] text-[var(--navy)]">
        {title}
      </h3>

      <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-60)]">
        {description}
      </p>
    </div>
  );
}

function InstitutionalStatusItem({
  title,
  description,
  tone = "success",
  icon,
}: {
  title: string;
  description: string;
  tone?: "success" | "info" | "warning" | "danger";
  icon: ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-[var(--line-2)] px-5 py-4 last:border-b-0 md:grid-cols-[1fr_auto]">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
          {icon}
        </span>

        <div>
          <p className="text-[14px] font-semibold text-[var(--navy)]">
            {title}
          </p>

          <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-start md:justify-end">
        <PulseStatusDot tone={tone} />
      </div>
    </div>
  );
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group border border-[var(--line)] bg-[var(--paper)] p-5 transition hover:bg-[var(--card)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--sky-2)] text-[var(--blue)]">
          {icon}
        </div>

        <ArrowRight
          className="h-4 w-4 text-[var(--ink-45)] transition group-hover:translate-x-0.5 group-hover:text-[var(--blue)]"
          strokeWidth={1.6}
        />
      </div>

      <h3 className="mt-5 text-[16px] font-bold tracking-[-0.01em] text-[var(--navy)]">
        {title}
      </h3>

      <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-60)]">
        {description}
      </p>
    </Link>
  );
}

export default async function ClinicDashboardPage() {
  const [clinic, doctor, shareFlow, auditTimeline] = await Promise.all([
    getDemoClinic(),
    getDemoDoctor(),
    getFrontendShareFlow(),
    getFrontendAuditTimeline(),
  ]);

  const authorizedEvents = auditTimeline.items.filter(
    (item) => item.decision === "AUTHORIZED" || item.status === "authorized"
  );

  const deniedEvents = auditTimeline.items.filter(
    (item) => item.decision === "DENIED" || item.status === "denied"
  );

  const consentEvents = auditTimeline.items.filter(
    (item) => item.type === "consent"
  );

  const recentEvents = auditTimeline.items
    .filter((item) =>
      ["access_request", "consent", "cre_validation", "audit_log"].includes(
        item.type
      )
    )
    .slice(0, 4);

  const recommendedScopes = shareFlow.shareableScopes
    .filter((scope) => scope.recommended)
    .map((scope) => scope.label)
    .join(", ");

  const institutionReadyCount = [
    clinic.authorized,
    doctor.authorized && doctor.crm_status === "active",
    consentEvents.length > 0 || authorizedEvents.length > 0,
    auditTimeline.items.length > 0,
  ].filter(Boolean).length;

  return (
    <div className="space-y-[18px]">
      <section>
        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Dashboard institucional.
        </h1>

        <p className="mt-3 max-w-[780px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Acompanhe a operação da clínica no fluxo de consentimento, com visão
          sobre profissionais vinculados, pacientes relacionados e eventos de
          acesso aos dados médicos.
        </p>
      </section>

      <DashboardCard>
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
          <div>

            <h2 className="mt-2 text-[26px] font-bold tracking-[-0.025em] text-[var(--navy)]">
              {clinic.name}
            </h2>

            <p className="mt-2 max-w-[760px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
              Dados usados para validar a instituição dentro do fluxo de acesso
              consentido. A clínica precisa estar autorizada para operar
              solicitações, profissionais e registros vinculados.
            </p>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-4">
          <InfoItem
            label="ID da clínica"
            value={clinic.id}
          />

          <InfoItem label="CNPJ" value={clinic.cnpj ?? "Não informado"} />

          <InfoItem
            label="Licença"
            value={formatStatus(clinic.license_status)}
          />

          <InfoItem
            label="Atualizada em"
            value={formatDate(clinic.updated_at)}
          />
        </div>
      </DashboardCard>

      <section className="grid gap-[18px] xl:grid-cols-[1fr_0.9fr]">
        <DashboardCard>
          <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                Solicitação de acesso em acompanhamento
              </h2>

              <p className="mt-2 max-w-[720px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
                Visão institucional do atendimento demonstrável, com paciente,
                médica, finalidade e escopos envolvidos.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-0 md:grid-cols-2">
            <InfoItem
              label="Paciente"
              value={formatPatientName(shareFlow.patientId)}
              helper="Identidade relacionada ao fluxo"
            />

            <InfoItem
              label="Médica"
              value={shareFlow.availableDoctor.name}
              helper={doctor.crm}
            />

            <InfoItem
              label="Finalidade"
              value={shareFlow.defaultPurpose}
              helper={`${shareFlow.defaultDurationHours}h de duração`}
            />

            <InfoItem
              label="Escopos recomendados"
              value={recommendedScopes}
              helper="Dados sugeridos para este atendimento"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row">
            <Link
              href="/clinic/patients"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
            >
              Ver pacientes
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>

            <Link
              href="/clinic/records"
              className="inline-flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-[var(--card)]"
            >
              Ver registros
            </Link>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="border-b border-[var(--line)] pb-5">

            <h2 className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Operação do consentimento
            </h2>

            <p className="mt-2 text-[14px] leading-[1.55] text-[var(--ink-60)]">
              Resumo dos pontos necessários para a clínica operar acessos
              consentidos de forma segura.
            </p>
          </div>

          <div className="-mx-5">
            <InstitutionalStatusItem
              icon={<Building2 className="h-4 w-4" strokeWidth={1.7} />}
              title="Clínica habilitada"
              description="A instituição está autorizada para participar do fluxo de solicitações."
              tone={clinic.authorized ? "success" : "warning"}
            />

            <InstitutionalStatusItem
              icon={<Stethoscope className="h-4 w-4" strokeWidth={1.7} />}
              title="Profissional vinculado"
              description="Há uma médica com CRM ativo vinculada ao atendimento."
              tone={
                doctor.authorized && doctor.crm_status === "active"
                  ? "success"
                  : "warning"
              }
            />

            <InstitutionalStatusItem
              icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.7} />}
              title="Consentimento verificável"
              description="Os acessos dependem da aprovação da paciente e dos escopos liberados."
              tone={
                consentEvents.length > 0 || authorizedEvents.length > 0
                  ? "success"
                  : "warning"
              }
            />

            <InstitutionalStatusItem
              icon={<BadgeCheck className="h-4 w-4" strokeWidth={1.7} />}
              title="Auditoria ativa"
              description="Eventos do fluxo ficam registrados para rastreabilidade operacional."
              tone={auditTimeline.items.length > 0 ? "success" : "warning"}
            />
          </div>

          <div className="-mx-5 -mb-5 border-t border-[var(--line)] bg-[var(--card)] px-5 py-4">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
              Prontidão
            </p>

            <p className="mt-1 text-[13px] font-semibold text-[var(--navy)]">
              {institutionReadyCount}/4 critérios institucionais atendidos
            </p>
          </div>
        </DashboardCard>
      </section>

      <DashboardCard>
        <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Atividade recente
            </h2>
          </div>
        </div>

        {recentEvents.length > 0 ? (
          <div className="-mx-5 -mb-5 mt-5">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="grid gap-3 border-b border-[var(--line-2)] px-5 py-4 last:border-b-0 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[var(--navy)]">
                    {event.title}
                  </p>

                  <p className="mt-1 max-w-[860px] text-[13px] leading-relaxed text-[var(--ink-60)]">
                    {event.description}
                  </p>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-45)]">
                    {event.actor} · {formatDate(event.createdAt)}
                  </p>
                </div>

                <span className="inline-flex h-fit w-fit rounded-[6px] border border-[var(--line)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]">
                  {event.statusLabel}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
            <p className="text-[14px] font-semibold text-[var(--navy)]">
              Nenhum evento registrado ainda.
            </p>

            <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
              Quando houver solicitações ou validações, os eventos aparecerão
              aqui.
            </p>
          </div>
        )}
      </DashboardCard>

    </div>
  );
}

function BuildingStatusIcon({ authorized }: { authorized: boolean }) {
  if (authorized) {
    return (
      <CheckCircle2
        className="h-4 w-4 text-[var(--success)]"
        strokeWidth={1.7}
      />
    );
  }

  return (
    <ShieldCheck
      className="h-4 w-4 text-[var(--warning)]"
      strokeWidth={1.7}
    />
  );
}