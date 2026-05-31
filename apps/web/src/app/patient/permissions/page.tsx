import {
  getFrontendAuditTimeline,
  getFrontendShareFlow,
} from "@/lib/api";
import {
  PatientPermissionsList,
  type AccessRequestRow,
} from "@/components/patient/patient-permissions-list";

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

export default async function PatientPermissionsPage() {
  const [shareFlow, auditTimeline] = await Promise.all([
    getFrontendShareFlow(),
    getFrontendAuditTimeline(),
  ]);

  const accessRequestedEvent = auditTimeline.items.find(
    (item) => item.type === "access_request"
  );

  const consentApprovedEvent = auditTimeline.items.find(
    (item) => item.type === "consent"
  );

  const authorizedEvent = auditTimeline.items.find(
    (item) => item.decision === "AUTHORIZED" || item.status === "authorized"
  );

  const recommendedScopes = shareFlow.shareableScopes
    .filter((scope) => scope.recommended)
    .map((scope) => formatScope(scope.category));

  const requestedScopes = accessRequestedEvent?.requestedScopes?.length
    ? accessRequestedEvent.requestedScopes.map(formatScope)
    : recommendedScopes;

  const status = authorizedEvent
    ? "approved"
    : consentApprovedEvent
      ? "approved"
      : accessRequestedEvent
        ? "pending"
        : "pending";

  const createdAt =
    accessRequestedEvent?.createdAt ??
    consentApprovedEvent?.createdAt ??
    new Date().toISOString();

  const rows: AccessRequestRow[] = [
    {
      id: accessRequestedEvent?.id ?? "demo_share_request",
      requester: `${shareFlow.availableClinic.name} · ${shareFlow.availableDoctor.name}`,
      requester_type: "clinic",
      purpose: shareFlow.defaultPurpose,
      scopes: requestedScopes.join(", "),
      duration: `${shareFlow.defaultDurationHours}h`,
      status,
      created_at: createdAt,
    },
  ];

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