import { useAuth } from "@/hooks/use-auth";

export function useUserRole() {
  const { user } = useAuth();

  return {
    role: user?.role ?? null,
    isPatient: user?.role === "patient",
    isDoctor: user?.role === "doctor",
    isClinic: user?.role === "clinic",
    isAdmin: user?.role === "admin",
  };
}
