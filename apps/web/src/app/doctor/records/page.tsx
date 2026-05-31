import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  getFrontendAuditTimeline,
  getFrontendShareFlow,
} from "@/lib/api";

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

function formatSensitivity(sensitivity: string) {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };

  return labels[sensitivity] ?? sensitivity;
}

function sensitivityClass(sensitivity: string) {
  const normalized = sensitivity.toLowerCase();

  if (normalized === "high") {
    return "border-[rgba(213,64,64,0.35)] text-[var(--danger)]";
  }

  if (normalized === "medium") {
    return "border-[rgba(240,160,43,0.45)] text-[var(--warning)]";
  }

  return "border-[rgba(31,174,106,0.35)] text-[var(--success)]";
}

function formatPatientName(patientId: string) {
  const labels: Record<string, string> = {
    patient_rose: "Roseane Carreiro",
  };

  return labels[patientId] ?? patientId;
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-[rgba(31,174,106,0.35)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--success)]">
      <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
      {label}
    </span>
  );
}

function ScopeCard({
  label,
  category,
  sensitivity,
  recommended,
}: {
  label: string;
  category: string;
  sensitivity: string;
  recommended: boolean;
}) {
  return (
    <article className="flex min-h-[175px] flex-col justify-between border border-[var(--line)] bg-[var(--paper)] p-5 transition hover:bg-[var(--card)]">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
              {formatScope(category)}
            </p>

            <h3 className="mt-3 text-[18px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              {label}
            </h3>

            <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-60)]">
              Disponível para consulta dentro do consentimento atual.
            </p>
          </div>

          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
            <FileText className="h-4 w-4" strokeWidth={1.7} />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span
            className={`rounded-[6px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${sensitivityClass(
              sensitivity
            )}`}
          >
            Sensibilidade {formatSensitivity(sensitivity)}
          </span>

          {recommended ? (
            <span className="rounded-[6px] border border-[rgba(30,71,255,0.25)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--blue)]">
              Recomendado
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--line-2)] pt-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
          Escopo
        </p>

        <p className="mt-1 font-mono text-[11px] text-[var(--ink-60)]">
          {category}
        </p>
      </div>
    </article>
  );
}

export default async function DoctorRecordsPage() {
  const [shareFlow, auditTimeline] = await Promise.all([
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

  const authorizedScopeItems = shareFlow.shareableScopes.filter((scope) =>
    authorizedScopes.includes(scope.category)
  );

  const lastAuthorizedAt =
    authorizedEvent?.createdAt ??
    validationEvent?.createdAt ??
    consentEvent?.createdAt ??
    new Date().toISOString();

  return (
    <div className="space-y-[18px]">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
            Registros autorizados
          </h1>

          <p className="mt-3 max-w-[720px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            Consulte apenas os dados liberados pela paciente para a finalidade e
            prazo definidos no consentimento.
          </p>
        </div>
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Contexto do acesso
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              {formatPatientName(auditTimeline.patientId)}
            </h2>
          </div>

          <StatusBadge label="Autorizado" />
        </div>

        <div className="grid gap-0 md:grid-cols-2 xl:grid-cols-4">
          <div className="border-b border-[var(--line-2)] p-5 md:border-r xl:border-b-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
              Clínica
            </p>

            <p className="mt-2 text-[14px] font-semibold text-[var(--navy)]">
              {shareFlow.availableClinic.name}
            </p>
          </div>

          <div className="border-b border-[var(--line-2)] p-5 xl:border-r xl:border-b-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
              Médica
            </p>

            <p className="mt-2 text-[14px] font-semibold text-[var(--navy)]">
              {shareFlow.availableDoctor.name}
            </p>
          </div>

          <div className="border-b border-[var(--line-2)] p-5 md:border-r md:border-b-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
              Finalidade
            </p>

            <p className="mt-2 text-[14px] font-semibold text-[var(--navy)]">
              {shareFlow.defaultPurpose}
            </p>
          </div>

          <div className="p-5">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
              Validade
            </p>

            <p className="mt-2 text-[14px] font-semibold text-[var(--navy)]">
              {shareFlow.defaultDurationHours}h
            </p>
          </div>
        </div>
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Escopos liberados para consulta
            </h2>

            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
              Estes são os únicos dados disponíveis neste atendimento. Outros
              dados permanecem bloqueados até uma nova autorização.
            </p>
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

        {authorizedScopeItems.length > 0 ? (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {authorizedScopeItems.map((scope) => (
              <ScopeCard
                key={scope.category}
                label={scope.label}
                category={scope.category}
                sensitivity={scope.sensitivity}
                recommended={scope.recommended}
              />
            ))}
          </div>
        ) : (
          <div className="p-5">
            <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
              <p className="text-[14px] font-semibold text-[var(--navy)]">
                Nenhum dado autorizado disponível.
              </p>

              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                Quando a paciente aprovar um consentimento, os escopos liberados
                aparecerão aqui.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
              <Clock3 className="h-4 w-4" strokeWidth={1.7} />
            </span>

            <div>
              <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                Último registro
              </h3>

              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                {formatDate(lastAuthorizedAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/doctor/logs"
              className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
            >
              Ver histórico
              <ArrowRight className="h-4 w-4" strokeWidth={1.7} />
            </Link>

            <Link
              href="/doctor/patients"
              className="inline-flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-[var(--card)]"
            >
              Solicitar novo acesso
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}