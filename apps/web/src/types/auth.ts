import type { UserRole } from "@/lib/auth/roles";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
};

export type AuthSession = {
  user: User;
  accessToken: string;
};
