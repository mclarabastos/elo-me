import { DoctorPatientsClient } from "@/components/doctor/doctor-patients-client";
import { getFrontendShareFlow } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DoctorPatientsPage() {
  const shareFlow = await getFrontendShareFlow();

  return <DoctorPatientsClient shareFlow={shareFlow} />;
}