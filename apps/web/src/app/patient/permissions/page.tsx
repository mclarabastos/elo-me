import {
  getDemoUser,
  getPatientAccessRequests,
} from "@/lib/api";
import {
  PatientPermissionsList,
  type AccessRequestRow,
} from "@/components/patient/patient-permissions-list";

export const dynamic = "force-dynamic";

export default async function PatientPermissionsPage() {
  const user = await getDemoUser();
  const accessRequests = await getPatientAccessRequests(user.id);

  const rows: AccessRequestRow[] = accessRequests.map((request) => ({
    id: request.id,
    requester: request.doctor_id ?? request.clinic_id ?? request.requester_type,
    requester_type: request.requester_type,
    purpose: request.purpose,
    scopes: request.requested_scopes.join(", "),
    duration: `${request.duration_hours}h`,
    status: request.status,
    created_at: request.created_at,
  }));

  return (
    <div className="space-y-[14px]">
      <section>
       

        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Permissões e solicitações
        </h1>

        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Acompanhe quem solicitou acesso aos seus dados, quais escopos foram
          pedidos e por quanto tempo a permissão ficará disponível.
        </p>
      </section>

      <PatientPermissionsList rows={rows} />
    </div>
  );
}