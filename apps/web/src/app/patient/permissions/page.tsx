import {
  getFrontendShareFlow,
  getPatientAccessRequests,
} from "@/lib/api";
import {
  PatientPermissionsList,
  type AccessRequestRow,
} from "@/components/patient/patient-permissions-list";
import type { AccessRequestResponse } from "@/types/api";

export const dynamic = "force-dynamic";

const PATIENT_DEMO_ID = "patient_rose";

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

function formatStatus(status: string): AccessRequestRow["status"] {
  const normalizedStatus = status.toLowerCase();

  if (
    normalizedStatus === "approved" ||
    normalizedStatus === "authorized" ||
    normalizedStatus === "active"
  ) {
    return "approved";
  }

  if (
    normalizedStatus === "denied" ||
    normalizedStatus === "rejected" ||
    normalizedStatus === "revoked"
  ) {
    return "denied";
  }

  return "pending";
}

function formatRequester(
  request: AccessRequestResponse,
  clinicName: string,
  doctorName: string,
) {
  if (request.requester_type === "doctor") {
    return doctorName;
  }

  if (request.requester_type === "clinic") {
    return `${clinicName} · ${doctorName}`;
  }

  return `${clinicName} · ${doctorName}`;
}

function formatDuration(request: AccessRequestResponse) {
  if ("duration_hours" in request && typeof request.duration_hours === "number") {
    return `${request.duration_hours}h`;
  }

  if (
    "durationHours" in request &&
    typeof request.durationHours === "number"
  ) {
    return `${request.durationHours}h`;
  }

  return "24h";
}

function getRequestedScopes(request: AccessRequestResponse) {
  if (
    "requested_scopes" in request &&
    Array.isArray(request.requested_scopes)
  ) {
    return request.requested_scopes;
  }

  if (
    "requestedScopes" in request &&
    Array.isArray(request.requestedScopes)
  ) {
    return request.requestedScopes;
  }

  return [];
}

function getCreatedAt(request: AccessRequestResponse) {
  if ("created_at" in request && typeof request.created_at === "string") {
    return request.created_at;
  }

  if ("createdAt" in request && typeof request.createdAt === "string") {
    return request.createdAt;
  }

  return new Date().toISOString();
}

function mapAccessRequestToRow(
  request: AccessRequestResponse,
  clinicName: string,
  doctorName: string,
): AccessRequestRow {
  const requestedScopes = getRequestedScopes(request);

  return {
    id: request.id,
    requester: formatRequester(request, clinicName, doctorName),
    requester_type: request.requester_type,
    purpose: request.purpose,
    scopes: requestedScopes.length
      ? requestedScopes.map(formatScope).join(", ")
      : "Escopos não informados",
    requested_scopes: requestedScopes,
    duration: formatDuration(request),
    status: formatStatus(request.status),
    created_at: getCreatedAt(request),
  };
}

export default async function PatientPermissionsPage() {
  const [shareFlow, accessRequests] = await Promise.all([
    getFrontendShareFlow(),
    getPatientAccessRequests(PATIENT_DEMO_ID),
  ]);

  const rows = accessRequests
    .map((request) =>
      mapAccessRequestToRow(
        request,
        shareFlow.availableClinic.name,
        shareFlow.availableDoctor.name,
      ),
    )
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

  return (
    <div className="space-y-[18px]">
      <section>
        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Permissões e solicitações
        </h1>

        <p className="mt-3 max-w-[700px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Acompanhe quem solicitou acesso aos seus dados, quais escopos foram
          pedidos e por quanto tempo a permissão ficará disponível.
        </p>
      </section>

      <PatientPermissionsList rows={rows} />
    </div>
  );
}