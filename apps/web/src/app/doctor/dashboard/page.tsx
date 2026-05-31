import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Stethoscope,
  UserRound,
} from "lucide-react";

import {
  getDemoDoctor,
  getFrontendAuditTimeline,
  getFrontendShareFlow,
} from "@/lib/api";

export const dynamic = "force-dynamic";

function formatScope(scope: string) {
  const labels: Record<string, string> = {
    identification: "Identificação",
    allergies: "Alergias",
    medications: "Medicamentos",
    recent_exams: "Exames recentes",
    special_needs: "Necessidades especiais",
    emergency_contact: "Contato de emergência",
  };

  return labels[scope] ?? scope;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDoctorName(name: string) {
  return name.replace(/^Dra?\.\s*/i, "");
}

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="flex items-center gap-4 border border-[var(--line)] bg-[var(--paper)] p-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)]">
        <span className="font-mono text-[24px] font-semibold tracking-[-0.05em] text-[var(--navy)]">
          {value}
        </span>
      </div>

      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
          {label}
        </p>

        <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
          {helper}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-[rgba(31,174,106,0.35)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--success)]">
      <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
      {label}
    </span>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
        {label}
      </p>

      <p className="mt-1 text-[13px] font-semibold text-[var(--navy)]">
        {value}
      </p>
    </div>
  );
}

function IconBox({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
      {children}
    </span>
  );
}

export default async function DoctorDashboardPage() {
  const [doctor, shareFlow, auditTimeline] = await Promise.all([
    getDemoDoctor(),
    getFrontendShareFlow(),
    getFrontendAuditTimeline(),
  ]);

  const authorizedEvent = auditTimeline.items.find(
    (item) => item.decision === "AUTHORIZED" || item.status === "authorized"
  );

  const consentEvent = auditTimeline.items.find(
    (item) => item.type === "consent"
  );

  const validationEvent = auditTimeline.items.find(
    (item) => item.type === "cre_validation"
  );

  const authorizedScopes =
    authorizedEvent?.requestedScopes?.length
      ? authorizedEvent.requestedScopes
      : consentEvent?.requestedScopes?.length
        ? consentEvent.requestedScopes
        : shareFlow.shareableScopes
            .filter((scope) => scope.recommended)
            .map((scope) => scope.category);

  const recentEvents = auditTimeline.items
    .filter(
      (item) =>
        item.type === "access_request" ||
        item.type === "consent" ||
        item.type === "cre_validation" ||
        item.type === "audit_log"
    )
    .slice(0, 4);

  return (
    <div className="space-y-[18px]">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
            Olá,{" "}
            <span className="text-[var(--blue)]">
              Dra. {formatDoctorName(doctor.name)}.
            </span>
            <br />
            Aqui estão seus acessos autorizados.
          </h1>

          <p className="mt-3 max-w-[720px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            Consulte somente os dados liberados pelo paciente, dentro do prazo,
            escopo e finalidade definidos no consentimento.
          </p>
        </div>
      </section>

      <section className="grid gap-[14px] lg:grid-cols-3">
        <MetricCard
          label="Pacientes"
          value={1}
          helper="Com acesso autorizado na demo"
        />

        <MetricCard
          label="Escopos liberados"
          value={authorizedScopes.length}
          helper="Dados disponíveis para consulta"
        />

        <MetricCard
          label="Validade"
          value={`${shareFlow.defaultDurationHours}h`}
          helper="Prazo do consentimento atual"
        />
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Paciente autorizado
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Roseane Carreiro
            </h2>
          </div>

          <StatusBadge label="Acesso autorizado" />
        </div>

        <div className="p-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <div>
              <div className="flex items-start gap-3">
                <IconBox>
                  <UserRound className="h-4 w-4" strokeWidth={1.7} />
                </IconBox>

                <div>
                  <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                    Atendimento em andamento
                  </h3>

                  <p className="mt-2 max-w-[760px] text-[13px] leading-relaxed text-[var(--ink-60)]">
                    A paciente autorizou o acesso parcial aos dados necessários
                    para a finalidade informada. Outros dados do prontuário
                    permanecem bloqueados.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 border-t border-[var(--line-2)] pt-5 sm:grid-cols-2 xl:grid-cols-4">
                <DetailItem
                  label="Clínica"
                  value={shareFlow.availableClinic.name}
                />

                <DetailItem label="Finalidade" value={shareFlow.defaultPurpose} />

                <DetailItem label="CRM" value={doctor.crm} />

                <DetailItem
                  label="Validade"
                  value={`${shareFlow.defaultDurationHours}h`}
                />
              </div>
            </div>

            <div className="border border-[var(--line)] bg-[var(--card)] p-4">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                Dados liberados
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {authorizedScopes.map((scope) => (
                  <span
                    key={scope}
                    className="rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]"
                  >
                    {formatScope(scope)}
                  </span>
                ))}
              </div>

              <p className="mt-4 text-[12px] leading-relaxed text-[var(--ink-60)]">
                Apenas estes escopos estão disponíveis para consulta. Outros
                dados do prontuário permanecem bloqueados.
              </p>

              <Link
                href="/doctor/records"
                className="mt-5 inline-flex items-center gap-2 rounded-[6px] bg-[var(--navy)] px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
              >
                Ver dados autorizados
                <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Atividade recente
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Histórico do acesso
            </h2>
          </div>

          {validationEvent ? (
            <div className="inline-flex w-fit items-center gap-2 border border-[var(--line)] bg-[var(--card)] px-3 py-2">
              <CheckCircle2
                className="h-4 w-4 text-[var(--success)]"
                strokeWidth={1.7}
              />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-60)]">
                Validação registrada
              </span>
            </div>
          ) : null}
        </div>

        {recentEvents.length > 0 ? (
          <div>
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="grid gap-3 border-b border-[var(--line-2)] px-5 py-4 last:border-b-0 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="text-[14px] font-semibold text-[var(--navy)]">
                    {event.title}
                  </p>

                  <p className="mt-1 max-w-[820px] text-[13px] leading-relaxed text-[var(--ink-60)]">
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
          <div className="p-5">
            <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
              <p className="text-[14px] font-semibold text-[var(--navy)]">
                Nenhum acesso registrado ainda.
              </p>

              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                Quando houver autorizações ou consultas, os eventos aparecerão
                aqui.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}