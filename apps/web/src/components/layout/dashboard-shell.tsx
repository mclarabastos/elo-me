"use client";

import Link from "next/link";
import { ClipboardList, FileText, Home, Settings, ShieldCheck, Stethoscope, User, Users } from "lucide-react";
import type { ReactNode } from "react";

import {
  DashboardSidebar,
  type DashboardRole,
} from "@/components/layout/dashboard-sidebar";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  role: DashboardRole;
  children: ReactNode;
};

type MobileNavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const MOBILE_NAV_ITEMS: Record<DashboardRole, MobileNavItem[]> = {
  patient: [
    { href: "/patient/dashboard", label: "Início", icon: Home },
    { href: "/patient/records", label: "Docs", icon: FileText },
    { href: "/patient/permissions", label: "Acessos", icon: ShieldCheck },
    { href: "/patient/profile", label: "Perfil", icon: User },
  ],
  doctor: [
    { href: "/doctor/dashboard", label: "Início", icon: Home },
    { href: "/doctor/patients", label: "Pacientes", icon: Users },
    { href: "/doctor/records", label: "Registros", icon: ClipboardList },
    { href: "/doctor/profile", label: "Perfil", icon: Stethoscope },
  ],
  clinic: [
    { href: "/clinic/dashboard", label: "Início", icon: Home },
    { href: "/clinic/doctors", label: "Médicos", icon: Stethoscope },
    { href: "/clinic/patients", label: "Pacientes", icon: Users },
    { href: "/clinic/settings", label: "Ajustes", icon: Settings },
  ],
};

export function DashboardShell({ role, children }: DashboardShellProps) {
  return (
    <div
      className="min-h-screen font-[family-name:var(--font-sans)] text-[var(--navy)]"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -200px, #C9D8F4 0%, transparent 60%), radial-gradient(900px 500px at 90% 30%, #DDE7F8 0%, transparent 60%), linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <main className="min-h-screen bg-[var(--card)] lg:flex">
        <div className="hidden lg:block">
          <DashboardSidebar role={role} />
        </div>

        <section className="min-w-0 flex-1 pb-24 lg:pb-0">
          <div className="mx-auto w-full max-w-[1180px] px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </section>

        <MobileDashboardNav role={role} />
      </main>
    </div>
  );
}

function MobileDashboardNav({ role }: { role: DashboardRole }) {
  const navItems = MOBILE_NAV_ITEMS[role];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-3 py-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center rounded-[14px] px-2 py-2 text-[11px] font-semibold text-[var(--ink-60)] transition",
                "hover:bg-[var(--sky-2)] hover:text-[var(--navy)]"
              )}
            >
              <Icon className="mb-1 h-4 w-4" strokeWidth={1.6} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}