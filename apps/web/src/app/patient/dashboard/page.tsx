import Link from "next/link";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  ShieldCheck,
} from "lucide-react";

import {
  DashboardMetricCard,
  DashboardMetricGrid,
} from "@/components/dashboard/dashboard-card";
import {
  getFrontendAuditTimeline,
  getFrontendCreStatus,
  getFrontendPatientDashboard,
} from "@/lib/api";

export const dynamic = "force-dynamic";

function formatPatientName(name: string) {
  return name.split(" ")[0] ?? name;
}

function formatSensitivity(sensitivity: string) {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };

  return labels[sensitivity] ?? sensitivity;
}

function formatCategory(category: string) {
  const labels: Record<string, string> = {
    identification: "Identificação",
    allergies: "Alergias",
    medications: "Medicamentos",
    recent_exams: "Exames recentes",
    special_needs: "Necessidades especiais",
    emergency_contact: "Contato de emergência",
  };

  return labels[category] ?? category;
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function StatusPip({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const colorClass =
    normalizedStatus === "authorized" ||
    normalizedStatus === "approved" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "validated"
      ? "bg-[var(--success)]"
      : normalizedStatus === "requested" || normalizedStatus === "pending"
        ? "bg-[var(--warning)]"
        : "bg-[var(--danger)]";

  const labelMap: Record<string, string> = {
    authorized: "Autorizado",
    approved: "Aprovado",
    completed: "Concluído",
    validated: "Validado",
    requested: "Solicitado",
    pending: "Pendente",
    denied: "Negado",
    revoked: "Revogado",
  };

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      {labelMap[normalizedStatus] ?? status}
    </span>
  );
}

function CreStatusPip({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const colorClass =
    normalizedStatus === "online" || normalizedStatus === "ready"
      ? "bg-[var(--success)]"
      : normalizedStatus === "pending"
        ? "bg-[var(--warning)]"
        : "bg-[var(--danger)]";

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      {status}
    </span>
  );
}

export default async function PatientDashboardPage() {
  const [dashboard, auditTimeline, creStatus] = await Promise.all([
    getFrontendPatientDashboard(),
    getFrontendAuditTimeline(),
    getFrontendCreStatus(),
  ]);

  const recentAuditItems = auditTimeline.items.slice(0, 4);
  const recentCreEvent = auditTimeline.items.find(
    (item) => item.type === "cre_validation"
  );

  return (
    <div className="space-y-[18px]">
      <section>
        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Olá,{" "}
          <span className="text-[var(--blue)]">
            {formatPatientName(dashboard.patient.name)}.
          </span>
          <br />
          Aqui está o seu resumo.
        </h1>

        <p className="mt-3 max-w-[660px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Você está no controle dos seus dados médicos. Acompanhe documentos,
          consentimentos, validações e eventos de auditoria em um só lugar.
        </p>
      </section>

      <DashboardMetricGrid>
        <Link href="/patient/records" className="block">
          <DashboardMetricCard
            label="Documentos"
            value={dashboard.summary.medicalDataCount}
            helper="dados médicos disponíveis"
          />
        </Link>

        <Link href="/patient/permissions" className="block">
          <DashboardMetricCard
            label="Consentimentos ativos"
            value={dashboard.summary.activeConsentsCount}
            helper="permissões aprovadas"
          />
        </Link>

        <Link href="/patient/audit" className="block">
          <DashboardMetricCard
            label="Eventos auditados"
            value={auditTimeline.items.length}
            helper="registros de atividade"
          />
        </Link>
      </DashboardMetricGrid>

      <section className="grid gap-[18px] xl:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-[var(--line)] bg-[var(--paper)]">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-5">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                Auditoria
              </p>

              <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                Atividade recente
              </h2>
            </div>

            <Link
              href="/patient/audit"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)] transition hover:opacity-80"
            >
              Ver trilha
            </Link>
          </div>

          {recentAuditItems.length > 0 ? (
            <div>
              {recentAuditItems.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 border-b border-[var(--line-2)] px-5 py-4 last:border-b-0 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--navy)]">
                      {item.title}
                    </p>

                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                      {item.description}
                    </p>

                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-45)]">
                      {item.actor} · {formatDate(item.createdAt)}
                    </p>
                  </div>

                  <StatusPip status={item.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
                <p className="text-[14px] font-semibold text-[var(--navy)]">
                  Nenhum evento registrado ainda.
                </p>

                <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                  Quando houver solicitações, consentimentos ou validações CRE,
                  os eventos aparecerão nesta trilha.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border border-[var(--line)] bg-[var(--paper)]">
          <div className="border-b border-[var(--line)] p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Prontuário
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Dados disponíveis
            </h2>
          </div>

          {dashboard.medicalDataCategories.length > 0 ? (
            <div>
              {dashboard.medicalDataCategories.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="border-b border-[var(--line-2)] bg-[var(--paper)] px-5 py-4 last:border-b-0 transition hover:bg-[var(--card)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[var(--navy)]">
                        {item.label}
                      </p>

                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-45)]">
                        {formatCategory(item.category)} ·{" "}
                        {formatSensitivity(item.sensitivity)}
                      </p>
                    </div>

                    <Activity
                      className="h-4 w-4 shrink-0 text-[var(--blue)]"
                      strokeWidth={1.6}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
                <p className="text-[14px] font-semibold text-[var(--navy)]">
                  Nenhum dado médico disponível.
                </p>

                <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                  Seus registros aparecerão aqui assim que forem conectados à sua
                  identidade Elo.me.
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-[var(--line)] p-5">
            <Link
              href="/patient/records"
              className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--navy)] px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
            >
              Ver prontuário
              <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}