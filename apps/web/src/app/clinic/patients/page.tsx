import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FileText,
  Search,
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

function getPatientInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "RC";
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

export default async function ClinicPatientsPage() {
  const [shareFlow, auditTimeline] = await Promise.all([
    getFrontendShareFlow(),
    getFrontendAuditTimeline(),
  ]);

  const identityEvent = auditTimeline.items.find(
    (item) => item.type === "identity"
  );

  const accessRequestEvent = auditTimeline.items.find(
    (item) => item.type === "access_request"
  );

  const consentEvent = auditTimeline.items.find(
    (item) => item.type === "consent"
  );

  const authorizedEvent = auditTimeline.items.find(
    (item) => item.decision === "AUTHORIZED" || item.status === "authorized"
  );

  const patientName = identityEvent?.actor ?? "Roseane Carreiro";

  const requestedScopes =
    accessRequestEvent?.requestedScopes?.length
      ? accessRequestEvent.requestedScopes
      : consentEvent?.requestedScopes?.length
        ? consentEvent.requestedScopes
        : shareFlow.shareableScopes
            .filter((scope) => scope.recommended)
            .map((scope) => scope.category);

  const status = authorizedEvent
    ? "Autorizado"
    : consentEvent
      ? "Aprovado"
      : accessRequestEvent
        ? "Solicitado"
        : "Disponível";

  const statusTone: "success" | "info" | "warning" | "danger" =
  authorizedEvent || consentEvent
    ? "success"
    : accessRequestEvent
      ? "warning"
      : "info";

  const lastEventAt =
    authorizedEvent?.createdAt ??
    consentEvent?.createdAt ??
    accessRequestEvent?.createdAt ??
    identityEvent?.createdAt ??
    new Date().toISOString();

  const patients = [
    {
      id: shareFlow.patientId,
      name: patientName,
      doctorName: shareFlow.availableDoctor.name,
      clinicName: shareFlow.availableClinic.name,
      purpose: shareFlow.defaultPurpose,
      durationHours: shareFlow.defaultDurationHours,
      scopes: requestedScopes,
      status,
      statusTone,
      lastEventAt,
    },
  ];

  const authorizedPatients = patients.filter(
    (patient) => patient.status === "Autorizado" || patient.status === "Aprovado"
  );

  return (
    <div className="space-y-[18px]">
      <section>
        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Pacientes da clínica
        </h1>

        <p className="mt-3 max-w-[740px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Visualize pacientes relacionados aos fluxos da clínica, acompanhe
          solicitações de acesso e consulte o status do consentimento.
        </p>
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Pacientes vinculados
            </h2>

          </div>

          <label className="flex w-full max-w-[320px] items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 md:w-[320px]">
            <Search
              className="h-4 w-4 shrink-0 text-[var(--blue)]"
              strokeWidth={1.7}
            />

            <input
              placeholder="Buscar paciente"
              className="h-7 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--navy)] outline-none placeholder:text-[var(--ink-45)]"
            />
          </label>
        </div>

        <div className="hidden overflow-hidden md:block">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--card)]">
                <th className="w-[26%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Paciente
                </th>

                <th className="w-[24%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Atendimento
                </th>

                <th className="w-[24%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Escopos
                </th>

                <th className="w-[14%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-[var(--line-2)] bg-[var(--paper)] last:border-b-0"
                >
                  <td className="px-5 py-5 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--sky-2)] font-mono text-[12px] font-semibold text-[var(--blue)]">
                        {getPatientInitials(patient.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-[var(--navy)]">
                          {patient.name}
                        </p>

                        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
                          {patient.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-5 align-middle">
                    <p className="truncate text-[13px] font-semibold text-[var(--navy)]">
                      {patient.purpose}
                    </p>

                    <p className="mt-0.5 truncate text-[12px] text-[var(--ink-60)]">
                      {patient.doctorName} · {patient.durationHours}h
                    </p>

                    <p className="mt-0.5 flex items-center gap-1 text-[12px] text-[var(--ink-60)]">
                      <Clock3 className="h-3.5 w-3.5" strokeWidth={1.6} />
                      {formatDate(patient.lastEventAt)}
                    </p>
                  </td>

                  <td className="px-5 py-5 align-middle">
                   <div className="flex flex-col items-start gap-2">
                      {patient.scopes.map((scope) => (
                        <span
                          key={`${patient.id}-${scope}`}
                          className="w-fit rounded-[6px] border border-[var(--line)] bg-[var(--card)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]"
                        >
                          {formatScope(scope)}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-5 align-middle">
                    <StatusPill label={patient.status} tone={patient.statusTone} />
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-5 md:hidden">
          {patients.map((patient) => (
            <article
              key={patient.id}
              className="border border-[var(--line)] bg-[var(--paper)] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--sky-2)] font-mono text-[12px] font-semibold text-[var(--blue)]">
                  {getPatientInitials(patient.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[var(--navy)]">
                    {patient.name}
                  </p>

                  <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
                    {patient.id}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill
                      label={patient.status}
                      tone={patient.statusTone}
                    />
                  </div>

                  <p className="mt-3 text-[13px] text-[var(--ink-60)]">
                    {patient.purpose} · {patient.durationHours}h
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {patient.scopes.map((scope) => (
                      <span
                        key={`${patient.id}-mobile-${scope}`}
                        className="rounded-[6px] border border-[var(--line)] bg-[var(--card)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-60)]"
                      >
                        {formatScope(scope)}
                      </span>
                    ))}
                  </div>

                  <Link
                    href="/clinic/records"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                  >
                    Ver dados
                    <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}