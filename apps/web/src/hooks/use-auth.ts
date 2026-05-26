import type { UserRole } from "@/lib/auth/roles";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function useAuth() {
  const user: AuthUser = {
    id: "mock-user",
    name: "Roseane C.",
    email: "roseane@example.com",
    role: "patient",
  };

  return {
    user,
    isAuthenticated: true,
    isLoading: false,
  };
}
