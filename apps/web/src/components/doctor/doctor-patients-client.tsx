"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Loader2,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import { createDoctorAccessRequestAction } from "@/app/doctor/patients/actions";
import { SuccessModal } from "@/components/feedback/success-modal";
import type {
  AccessRequestResponse,
  FrontendShareFlowResponse,
  MedicalScope,
} from "@/types/api";

type DoctorPatientsClientProps = {
  shareFlow: FrontendShareFlowResponse;
};

type PatientRow = {
  id: string;
  name: string;
  identityVerified: boolean;
  availableScopesCount: number;
  recommendedScopesCount: number;
  status: string;
};

type RequestLog = {
  id: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  purpose: string;
  durationHours: number;
  requestedScopes: MedicalScope[];
  status: string;
  createdAt: string;
};

const DOCTOR_REQUEST_LOGS_KEY = "elo_doctor_request_logs";

function formatPatientName(patientId: string) {
  const labels: Record<string, string> = {
    patient_rose: "Roseane Carreiro",
  };

  return labels[patientId] ?? patientId;
}

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Ativa",
    inactive: "Inativa",
    pending: "Pendente",
    approved: "Aprovada",
    denied: "Negada",
    cancelled: "Cancelada",
  };

  return labels[status] ?? status;
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

function scopeLabels(
  scopes: MedicalScope[],
  shareFlow: FrontendShareFlowResponse
) {
  return scopes
    .map((scope) => {
      const found = shareFlow.shareableScopes.find(
        (item) => item.category === scope
      );

      return found ? found.label : formatScope(scope);
    })
    .join(", ");
}

function saveRequestLog(log: RequestLog) {
  try {
    const raw = window.localStorage.getItem(DOCTOR_REQUEST_LOGS_KEY);
    const current = raw ? (JSON.parse(raw) as RequestLog[]) : [];

    window.localStorage.setItem(
      DOCTOR_REQUEST_LOGS_KEY,
      JSON.stringify([log, ...current])
    );

    window.dispatchEvent(new Event("elo-doctor-request-logs-updated"));
  } catch {
    // Ignora falhas locais de persistência.
  }
}

export function DoctorPatientsClient({ shareFlow }: DoctorPatientsClientProps) {
  const patients = useMemo<PatientRow[]>(
    () => [
      {
        id: shareFlow.patientId,
        name: formatPatientName(shareFlow.patientId),
        identityVerified: true,
        availableScopesCount: shareFlow.shareableScopes.length,
        recommendedScopesCount: shareFlow.shareableScopes.filter(
          (scope) => scope.recommended
        ).length,
        status: "Disponível",
      },
    ],
    [shareFlow]
  );

  const [selectedPatient, setSelectedPatient] = useState<PatientRow | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<MedicalScope[]>(
    shareFlow.shareableScopes
      .filter((scope) => scope.recommended)
      .map((scope) => scope.category)
  );
  const [purpose, setPurpose] = useState(shareFlow.defaultPurpose);
  const [durationHours, setDurationHours] = useState(
    shareFlow.defaultDurationHours
  );
  const [createdRequest, setCreatedRequest] =
    useState<AccessRequestResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filteredPatients = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.name.toLowerCase().includes(normalizedSearch) ||
        patient.id.toLowerCase().includes(normalizedSearch) ||
        patient.status.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [patients, searchTerm]);

  const selectedScopeItems = useMemo(() => {
    return shareFlow.shareableScopes.filter((scope) =>
      selectedScopes.includes(scope.category)
    );
  }, [selectedScopes, shareFlow.shareableScopes]);

  function openRequestModal(patient: PatientRow) {
    setSelectedPatient(patient);
    setModalOpen(true);
    setCreatedRequest(null);
    setErrorMessage("");
    setPurpose(shareFlow.defaultPurpose);
    setDurationHours(shareFlow.defaultDurationHours);
    setSelectedScopes(
      shareFlow.shareableScopes
        .filter((scope) => scope.recommended)
        .map((scope) => scope.category)
    );
  }

  function closeRequestModal() {
    if (submitting) return;

    setModalOpen(false);
    setErrorMessage("");
  }

  function toggleScope(scope: MedicalScope) {
    setSelectedScopes((current) => {
      if (current.includes(scope)) {
        return current.filter((item) => item !== scope);
      }

      return [...current, scope];
    });
  }

  async function handleCreateRequest() {
    if (!selectedPatient) {
      setErrorMessage("Selecione uma paciente antes de criar a solicitação.");
      return;
    }

    if (selectedScopes.length === 0) {
      setErrorMessage("Selecione pelo menos um escopo para solicitar acesso.");
      return;
    }

    if (!purpose.trim()) {
      setErrorMessage("Informe uma finalidade para a solicitação.");
      return;
    }

    if (durationHours <= 0) {
      setErrorMessage("A duração precisa ser maior que zero.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");
      setCreatedRequest(null);

      const request = await createDoctorAccessRequestAction({
        patient_id: selectedPatient.id,
        requester_type: "doctor",
        clinic_id: shareFlow.availableClinic.id,
        doctor_id: shareFlow.availableDoctor.id,
        requested_scopes: selectedScopes,
        purpose,
        duration_hours: durationHours,
      });

      const log: RequestLog = {
        id: request.id,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        doctorName: shareFlow.availableDoctor.name,
        clinicName: shareFlow.availableClinic.name,
        purpose: request.purpose,
        durationHours: request.duration_hours,
        requestedScopes: request.requested_scopes,
        status: request.status,
        createdAt: request.created_at,
      };

      saveRequestLog(log);
      setCreatedRequest(request);
      setModalOpen(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a solicitação de acesso."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-[18px]">
      <section>
        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Pacientes autorizados
        </h1>

        <p className="mt-3 max-w-[720px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Consulte pacientes disponíveis e envie solicitações de acesso com
          finalidade, prazo e escopos definidos.
        </p>
      </section>

      <section className="grid gap-[14px] lg:grid-cols-3">
        <MetricCard
          label="Pacientes"
          value={patients.length}
          helper="Identidades conectadas"
        />

        <MetricCard
          label="Escopos"
          value={shareFlow.shareableScopes.length}
          helper="Dados solicitáveis"
        />

        <MetricCard
          label="Recomendados"
          value={
            shareFlow.shareableScopes.filter((scope) => scope.recommended)
              .length
          }
          helper="Escopos sugeridos para consulta"
        />
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Pacientes disponíveis
            </h2>

            <p className="mt-2 max-w-[620px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
              Selecione uma paciente para abrir uma solicitação de acesso.
            </p>
          </div>

          <label className="flex w-full max-w-[320px] items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 md:w-[320px]">
            <Search
              className="h-4 w-4 shrink-0 text-[var(--blue)]"
              strokeWidth={1.7}
            />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar paciente"
              className="h-7 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--navy)] outline-none placeholder:text-[var(--ink-45)]"
            />
          </label>
        </div>

        <div className="hidden overflow-hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--card)]">
                <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Paciente
                </th>
                <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Identidade
                </th>
                <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Escopos
                </th>
                <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Status
                </th>
                <th className="px-5 py-4 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Ação
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="border-b border-[var(--line-2)] bg-[var(--paper)] last:border-b-0"
                >
                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--sky-2)] font-mono text-[12px] font-semibold text-[var(--blue)]">
                        RC
                      </div>

                      <div>
                        <p className="text-[14px] font-bold text-[var(--navy)]">
                          {patient.name}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
                          {patient.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--ink-60)]">
                      <ShieldCheck
                        className="h-4 w-4 text-[var(--blue)]"
                        strokeWidth={1.6}
                      />
                      Verificada
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <p className="text-[13px] font-semibold text-[var(--navy)]">
                      {patient.availableScopesCount} disponíveis
                    </p>
                    <p className="mt-0.5 text-[12px] text-[var(--ink-60)]">
                      {patient.recommendedScopesCount} recomendados
                    </p>
                  </td>

                  <td className="px-5 py-5">
                    <StatusPill label={patient.status} />
                  </td>

                  <td className="px-5 py-5 text-right">
                    <button
                      type="button"
                      onClick={() => openRequestModal(patient)}
                      className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                    >
                      Solicitar acesso
                      <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPatients.length === 0 ? (
            <div className="border-t border-[var(--line)] p-5">
              <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
                <p className="text-[14px] font-semibold text-[var(--navy)]">
                  Nenhuma paciente encontrada.
                </p>

                <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                  Tente buscar pelo nome, identificador ou status.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 p-5 md:hidden">
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="border border-[var(--line)] bg-[var(--paper)] p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--sky-2)] font-mono text-[12px] font-semibold text-[var(--blue)]">
                    RC
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-[var(--navy)]">
                      {patient.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
                      {patient.id}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusPill label="Verificada" tone="info" />
                      <StatusPill label={patient.status} />
                    </div>

                    <p className="mt-3 text-[13px] text-[var(--ink-60)]">
                      {patient.availableScopesCount} escopos disponíveis ·{" "}
                      {patient.recommendedScopesCount} recomendados
                    </p>

                    <button
                      type="button"
                      onClick={() => openRequestModal(patient)}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                    >
                      Solicitar acesso
                      <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
              <p className="text-[14px] font-semibold text-[var(--navy)]">
                Nenhuma paciente encontrada.
              </p>

              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                Tente buscar pelo nome, identificador ou status.
              </p>
            </div>
          )}
        </div>
      </section>

      {modalOpen && selectedPatient ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(11,27,63,0.38)] p-0 sm:items-center sm:p-4">
          <div className="max-h-[92vh] w-full overflow-y-auto bg-[var(--paper)] shadow-[0_40px_120px_-50px_rgba(11,27,63,0.65)] sm:max-w-[760px] sm:border sm:border-[var(--line)]">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[var(--line)] bg-[var(--paper)] p-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Nova solicitação
                </p>

                <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                  Solicitar acesso para {selectedPatient.name}
                </h2>

                <p className="mt-2 text-[14px] leading-[1.55] text-[var(--ink-60)]">
                  Informe finalidade, prazo e dados necessários para a consulta.
                </p>
              </div>

              <button
                type="button"
                onClick={closeRequestModal}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--line)] text-[var(--ink-60)] transition hover:bg-[var(--card)]"
                aria-label="Fechar modal"
              >
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </div>

            <div className="p-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="block">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Finalidade
                  </span>

                  <input
                    value={purpose}
                    onChange={(event) => setPurpose(event.target.value)}
                    className="mt-2 h-11 w-full border-0 border-b border-[var(--line)] bg-transparent px-0 text-[15px] font-medium text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)]"
                    placeholder="Ex: Consulta neurológica"
                  />
                </label>

                <label className="block">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Duração em horas
                  </span>

                  <input
                    type="number"
                    min={1}
                    value={durationHours}
                    onChange={(event) =>
                      setDurationHours(Number(event.target.value))
                    }
                    className="mt-2 h-11 w-full border-0 border-b border-[var(--line)] bg-transparent px-0 text-[15px] font-medium text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)]"
                  />
                </label>
              </div>

              <div className="mt-7 border-t border-[var(--line)] pt-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                      Dados solicitados
                    </p>

                    <h3 className="mt-2 text-[18px] font-bold tracking-[-0.01em] text-[var(--navy)]">
                      Selecione os escopos
                    </h3>
                  </div>

                  <StatusPill
                    label={`${selectedScopes.length} selecionados`}
                    tone={selectedScopes.length > 0 ? "info" : "warning"}
                  />
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {shareFlow.shareableScopes.map((scope) => {
                    const selected = selectedScopes.includes(scope.category);

                    return (
                      <button
                        key={scope.category}
                        type="button"
                        onClick={() => toggleScope(scope.category)}
                        className={`border p-4 text-left transition ${
                          selected
                            ? "border-[rgba(30,71,255,0.45)] bg-[rgba(30,71,255,0.04)]"
                            : "border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--card)]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[14px] font-semibold text-[var(--navy)]">
                              {scope.label}
                            </p>

                            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--ink-45)]">
                              {scope.category}
                            </p>
                          </div>

                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                                : "border-[var(--line)] text-transparent"
                            }`}
                          >
                            <Check className="h-3.5 w-3.5" strokeWidth={2} />
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {scope.recommended ? (
                            <StatusPill label="Recomendado" tone="info" />
                          ) : null}

                          <span
                            className={`inline-flex w-fit rounded-[6px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${sensitivityClass(
                              scope.sensitivity
                            )}`}
                          >
                            {formatSensitivity(scope.sensitivity)}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {selectedScopeItems.length > 0 ? (
                  <div className="mt-5 border border-[var(--line)] bg-[var(--card)] p-4">
                    <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                      Resumo da solicitação
                    </p>

                    <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-60)]">
                      Você está solicitando{" "}
                      <span className="font-semibold text-[var(--navy)]">
                        {scopeLabels(selectedScopes, shareFlow)}
                      </span>{" "}
                      por {durationHours} horas.
                    </p>
                  </div>
                ) : null}
              </div>

              {errorMessage ? (
                <div className="mt-5 flex items-start gap-3 border border-[rgba(213,64,64,0.35)] bg-[rgba(213,64,64,0.04)] p-4 text-[var(--danger)]">
                  <AlertCircle
                    className="mt-0.5 h-4 w-4 shrink-0"
                    strokeWidth={1.8}
                  />
                  <p className="text-[13px] font-medium">{errorMessage}</p>
                </div>
              ) : null}

              <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] leading-relaxed text-[var(--ink-60)]">
                  Após o envio, a solicitação ficará pendente até a paciente
                  aprovar ou negar.
                </p>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeRequestModal}
                    disabled={submitting}
                    className="inline-flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-[var(--card)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateRequest}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          strokeWidth={1.8}
                        />
                        Enviando...
                      </>
                    ) : (
                      <>
                        Enviar solicitação
                        <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <SuccessModal
        open={Boolean(createdRequest)}
        title="Solicitação enviada!"
        description="A paciente receberá a solicitação para aprovar ou negar o acesso aos dados selecionados."
        metadata={
          createdRequest
            ? `${createdRequest.id} · status ${formatStatus(
                createdRequest.status
              )}`
            : undefined
        }
        primaryActionLabel="Ver pacientes"
        onClose={() => setCreatedRequest(null)}
        onPrimaryAction={() => setCreatedRequest(null)}
      />
    </div>
  );
}