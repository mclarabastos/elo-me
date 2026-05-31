import {
  Activity,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Fingerprint,
  Link2,
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
    identity: <Fingerprint className="h-4 w-4" strokeWidth={1.8} />,
    access_request: <Link2 className="h-4 w-4" strokeWidth={1.8} />,
    consent: <FileCheck2 className="h-4 w-4" strokeWidth={1.8} />,
    cre_validation: <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />,
    audit_log: <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />,
  };

  return icons[type] ?? <Activity className="h-4 w-4" strokeWidth={1.8} />;
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

function AuditSummaryCard({
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

export default async function PatientAuditPage() {
  const auditTimeline = await getFrontendAuditTimeline();

  const creEvents = auditTimeline.items.filter(
    (item) => item.type === "cre_validation"
  );

  const authorizedEvents = auditTimeline.items.filter(
    (item) => item.decision === "AUTHORIZED" || item.status === "authorized"
  );

  return (
    <div className="space-y-[18px]">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
            Auditoria
          </h1>

          <p className="mt-3 max-w-[760px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            Acompanhe, em uma linha do tempo, quem solicitou acesso aos seus
            dados, quais informações foram envolvidas e quais decisões foram
            registradas.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 border border-[var(--line)] bg-[var(--paper)] px-4 py-3">
          <Clock3 className="h-4 w-4 text-[var(--blue)]" strokeWidth={1.7} />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-60)]">
            Histórico do paciente
          </span>
        </div>
      </section>

      <section className="grid gap-[14px] lg:grid-cols-3">
        <AuditSummaryCard
          label="Eventos"
          value={auditTimeline.items.length}
          helper="Registros exibidos na trilha"
        />

        <AuditSummaryCard
          label="Validações"
          value={creEvents.length}
          helper="Checagens de consentimento e escopo"
        />

        <AuditSummaryCard
          label="Acessos autorizados"
          value={authorizedEvents.length}
          helper="Eventos aprovados para atendimento"
        />
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Histórico
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Linha do tempo de acessos
            </h2>
          </div>
        </div>

        {auditTimeline.items.length > 0 ? (
          <div className="p-5">
            <div className="relative space-y-5 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-[var(--line)]">
              {auditTimeline.items.map((item) => (
                <article key={item.id} className="relative grid gap-4 pl-12">
                  <div className="absolute left-0 top-0 z-10 inline-flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
                    {getEventIcon(item.type)}
                  </div>

                  <div className="border border-[var(--line)] bg-[var(--paper)] p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-[15px] font-bold tracking-[-0.01em] text-[var(--navy)]">
                          {item.title}
                        </p>

                        <p className="mt-2 max-w-[900px] text-[13px] leading-relaxed text-[var(--ink-60)]">
                          {item.description}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit shrink-0 rounded-[6px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${getStatusClass(
                          item.status
                        )}`}
                      >
                        {getStatusLabel(item.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-[var(--line-2)] pt-4 text-[12px] text-[var(--ink-60)] md:grid-cols-4">
                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Ator
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {item.actor}
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Data
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Clínica
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {item.clinicName}
                        </p>
                      </div>

                      <div>
                        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          Médica
                        </p>
                        <p className="mt-1 text-[13px] text-[var(--navy)]">
                          {item.doctorName}
                        </p>
                      </div>
                    </div>

                    {item.requestedScopes.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.requestedScopes.map((scope) => (
                          <span
                            key={`${item.id}-${scope}`}
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
                Quando houver solicitações, consentimentos ou validações, os
                eventos aparecerão nesta trilha.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}