import { DoctorProfileClient } from "@/components/doctor/doctor-profile-client";
import { getDemoClinic, getDemoDoctor } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DoctorProfilePage() {
  const [doctor, clinic] = await Promise.all([
    getDemoDoctor(),
    getDemoClinic(),
  ]);

  return <DoctorProfileClient initialDoctor={doctor} initialClinic={clinic} />;
}