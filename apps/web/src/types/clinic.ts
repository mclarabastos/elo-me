export type ClinicStatus = "pending" | "verified" | "suspended" | "rejected";

export type Clinic = {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  status: ClinicStatus;
  walletAddress?: string;
};
