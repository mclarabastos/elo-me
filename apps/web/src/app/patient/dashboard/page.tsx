import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";

import {
  DashboardMetricCard,
  DashboardMetricGrid,
} from "@/components/dashboard/dashboard-card";
import {
  getDemoUser,
  getPatientAccessRequests,
  getPatientMedicalData,
} from "@/lib/api";

export const dynamic = "force-dynamic";

function formatPatientName(name: string) {
  return name.split(" ")[0] ?? name;
}

function getPendingCount(
  accessRequests: Awaited<ReturnType<typeof getPatientAccessRequests>>
) {
  return accessRequests.filter((request) => request.status === "pending").length;
}

function getActiveLikeCount(
  accessRequests: Awaited<ReturnType<typeof getPatientAccessRequests>>
) {
  return accessRequests.filter((request) => request.status === "approved").length;
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

function formatSensitivity(sensitivity: string) {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };

  return labels[sensitivity] ?? sensitivity;
}

function StatusPip({ status }: { status: string }) {
  const normalizedStatus = status.toLowerCase();

  const colorClass =
    normalizedStatus === "approved"
      ? "bg-[var(--success)]"
      : normalizedStatus === "pending"
        ? "bg-[var(--warning)]"
        : "bg-[var(--danger)]";

  const label =
    normalizedStatus === "approved"
      ? "Aprovado"
      : normalizedStatus === "pending"
        ? "Pendente"
        : status;

  return (
    <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]">
      <span className={`h-2 w-2 rounded-full ${colorClass}`} />
      {label}
    </span>
  );
}

export default async function PatientDashboardPage() {
  const user = await getDemoUser();

  const [medicalData, accessRequests] = await Promise.all([
    getPatientMedicalData(user.id),
    getPatientAccessRequests(user.id),
  ]);

  const pendingRequests = getPendingCount(accessRequests);
  const activeAccesses = getActiveLikeCount(accessRequests);
  const recentRequests = accessRequests.slice(0, 4);

  return (
    <div className="space-y-[18px]">
      <section>
        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Olá,{" "}
          <span className="text-[var(--blue)]">
            {formatPatientName(user.name)}.
          </span>
          <br />
          Aqui está o seu resumo.
        </h1>

        <p className="mt-3 max-w-[620px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Você está no controle dos seus dados médicos. Acompanhe documentos,
          consentimentos e solicitações de acesso em um só lugar.
        </p>
      </section>

      <DashboardMetricGrid>
        <Link href="/patient/records" className="block">
          <DashboardMetricCard
            label="Documentos"
            value={medicalData.length}
            helper="dados médicos disponíveis"
          />
        </Link>

        <Link href="/patient/permissions" className="block">
          <DashboardMetricCard
            label="Consentimentos ativos"
            value={activeAccesses}
            helper="permissões aprovadas"
          />
        </Link>

        <Link href="/patient/permissions" className="block">
          <DashboardMetricCard
            label="Pedidos pendentes"
            value={pendingRequests}
            helper="aguardando resposta"
          />
        </Link>
      </DashboardMetricGrid>

      <section className="grid gap-[18px] xl:grid-cols-[1.1fr_0.9fr]">
        <div className="border border-[var(--line)] bg-[var(--paper)]">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] p-5">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                Atividade recente
              </p>

              <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                Solicitações de acesso
              </h2>
            </div>

            <Link
              href="/patient/permissions"
              className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)] transition hover:opacity-80"
            >
              Ver todas
            </Link>
          </div>

          {recentRequests.length > 0 ? (
            <div>
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="grid gap-3 border-b border-[var(--line-2)] px-5 py-4 last:border-b-0 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--navy)]">
                      {request.purpose}
                    </p>

                    <p className="mt-1 font-mono text-[11px] text-[var(--ink-45)]">
                      {request.requester_type} · {request.duration_hours}h ·{" "}
                      {request.requested_scopes.join(", ")}
                    </p>
                  </div>

                  <StatusPip status={request.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5">
              <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
                <p className="text-[14px] font-semibold text-[var(--navy)]">
                  Nenhuma solicitação ainda.
                </p>

                <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                  Pedidos de acesso enviados por médicos ou clínicas aparecerão
                  aqui.
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

          {medicalData.length > 0 ? (
            <div>
              {medicalData.slice(0, 5).map((item) => (
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
                  identidade ELO.
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