import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="clinic">{children}</DashboardShell>;
}