import { getDemoUser } from "@/lib/api";
import { PatientProfileForm } from "@/components/patient/patient-profile-form";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const user = await getDemoUser();

  return <PatientProfileForm initialUser={user} />;
}