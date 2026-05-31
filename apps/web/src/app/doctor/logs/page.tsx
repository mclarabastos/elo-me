import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Link2,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import { getFrontendAuditTimeline } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

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

function getEventIcon(type: string) {
  const icons: Record<string, React.ReactNode> = {
    access_request: <Link2 className="h-4 w-4" strokeWidth={1.8} />,
    consent: <FileCheck2 className="h-4 w-4" strokeWidth={1.8} />,
    cre_validation: <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />,
    audit_log: <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />,
  };

  return icons[type] ?? <ScrollText className="h-4 w-4" strokeWidth={1.8} />;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    completed: "Concluído",
    requested: "Solicitado",
    approved: "Aprovado",
    validated: "Validado",
    authorized: "Autorizado",
    denied: "Negado",
    revoked: "Revogado",
    pending: "Pendente",
  };

  return labels[status] ?? status;
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized === "completed" ||
    normalized === "approved" ||
    normalized === "validated" ||
    normalized === "authorized"
  ) {
    return "border-[rgba(31,174,106,0.35)] text-[var(--success)]";
  }

  if (normalized === "requested" || normalized === "pending") {
    return "border-[rgba(240,160,43,0.45)] text-[var(--warning)]";
  }

  return "border-[rgba(213,64,64,0.35)] text-[var(--danger)]";
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

export default async function DoctorLogsPage() {
  const auditTimeline = await getFrontendAuditTimeline();

  const doctorRelevantEvents = auditTimeline.items.filter((item) =>
    ["access_request", "consent", "cre_validation", "audit_log"].includes(
      item.type
    )
  );

  const accessRequestEvents = doctorRelevantEvents.filter(
    (item) => item.type === "access_request"
  );

  const validationEvents = doctorRelevantEvents.filter(
    (item) => item.type === "cre_validation"
  );

  const authorizedEvents = doctorRelevantEvents.filter(
    (item) => item.decision === "AUTHORIZED" || item.status === "authorized"
  );

  return (
    <div className="space-y-[18px]">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
            Histórico de acessos
          </h1>

          <p className="mt-3 max-w-[720px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            Acompanhe os eventos relacionados aos acessos médicos: solicitações,
            consentimentos, validações e registros autorizados.
          </p>
        </div>

      </section>

      <section className="grid gap-[14px] lg:grid-cols-3">
        <MetricCard
          label="Eventos"
          value={doctorRelevantEvents.length}
          helper="Registros relacionados ao atendimento"
        />

        <MetricCard
          label="Solicitações"
          value={accessRequestEvents.length}
          helper="Pedidos de acesso identificados"
        />

        <MetricCard
          label="Acessos autorizados"
          value={authorizedEvents.length}
          helper="Eventos liberados para consulta"
        />
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Eventos do acesso médico
            </h2>

            <p className="mt-2 max-w-[720px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
              Esta visualização mostra somente os eventos ligados ao fluxo de
              atendimento e acesso autorizado. A auditoria completa dos dados
              pertence ao paciente.
            </p>
          </div>

          {validationEvents.length > 0 ? (
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

        {doctorRelevantEvents.length > 0 ? (
          <div className="p-5">
            <div className="relative space-y-5 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--line)]">
              {doctorRelevantEvents.map((event) => (
                <article key={event.id} className="relative grid gap-4 pl-12">
                  <div className="absolute left-0 top-0 z-10 inline-flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
                    {getEventIcon(event.type)}
                  </div>

                  <div className="border border-[var(--line)] bg-[var(--paper)] p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-[15px] font-bold tracking-[-0.01em] text-[var(--navy)]">
                          {event.title}
                        </p>

                        <p className="mt-2 max-w-[900px] text-[13px] leading-relaxed text-[var(--ink-60)]">
                          {event.description}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 rounded-[6px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${getStatusClass(
                          event.status
                        )}`}
                      >
                        {getStatusLabel(event.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-[var(--line-2)] pt-4 text-[12px] text-[var(--ink-60)] md:grid-cols-4">
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Ator
                        </p>

                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {event.actor}
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Data
                        </p>

                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {formatDate(event.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Clínica
                        </p>

                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {event.clinicName}
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Médica
                        </p>

                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {event.doctorName}
                        </p>
                      </div>
                    </div>

                    {event.requestedScopes.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {event.requestedScopes.map((scope) => (
                          <span
                            key={`${event.id}-${scope}`}
                            className="rounded-[6px] border border-[var(--line)] bg-[var(--card)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]"
                          >
                            {formatScope(scope)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
              <p className="text-[14px] font-semibold text-[var(--navy)]">
                Nenhum evento registrado ainda.
              </p>

              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                Quando houver solicitações, consentimentos ou acessos
                autorizados, os eventos aparecerão aqui.
              </p>
            </div>
          </div>
        )}
      </section>

      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <Link
          href="/doctor/records"
          className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
        >
          Ver registros autorizados
          <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
        </Link>

        <Link
          href="/doctor/patients"
          className="inline-flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-[var(--card)]"
        >
          Voltar para pacientes
        </Link>
      </div>
    </div>
  );
}