"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, type Variants } from "framer-motion";
import {
  Bell,
  ChevronRight,
  ClipboardList,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

export type DashboardRole = "patient" | "doctor" | "clinic";

type NavItem = {
  icon: React.ReactNode;
  label: string;
  href: string;
  isSeparator?: boolean;
};

type UserProfile = {
  name: string;
  email: string;
  initials: string;
  roleLabel: string;
};

type DashboardSidebarProps = {
  role: DashboardRole;
  className?: string;
};

const PROFILE_STORAGE_KEY = "elo_patient_profile_overrides";

type ProfileStorageData = {
  fullName?: string;
  email?: string;
  avatarDataUrl?: string;
};

function getStoredProfile() {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) {
      return undefined;
    }

    return JSON.parse(raw) as ProfileStorageData;
  } catch {
    return undefined;
  }
}

const sidebarVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.035,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.16,
      ease: "easeOut",
    },
  },
};

const USERS: Record<DashboardRole, UserProfile> = {
  patient: {
    name: "Roseane C.",
    email: "DID: patient_rose",
    initials: "RC",
    roleLabel: "Paciente",
  },
  doctor: {
    name: "Dra. Ana Martins",
    email: "CRM-SP 123456",
    initials: "AM",
    roleLabel: "Médico",
  },
  clinic: {
    name: "Clínica NeuroRio",
    email: "Instituição verificada",
    initials: "NR",
    roleLabel: "Clínica",
  },
};

const NAV_ITEMS: Record<DashboardRole, NavItem[]> = {
  patient: [
    {
      href: "/patient/dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/patient/records",
      label: "Meus documentos",
      icon: <FileText className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/patient/permissions",
      label: "Consentimentos",
      icon: <ShieldCheck className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/patient/profile",
      label: "Perfil",
      icon: <User className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "#notifications",
      label: "Notificações",
      icon: <Bell className="h-4 w-4" strokeWidth={1.6} />,
      isSeparator: true,
    },
    {
      href: "#help",
      label: "Ajuda",
      icon: <HelpCircle className="h-4 w-4" strokeWidth={1.6} />,
    },
  ],

  doctor: [
    {
      href: "/doctor/dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/doctor/patients",
      label: "Pacientes",
      icon: <Users className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/doctor/records",
      label: "Registros autorizados",
      icon: <ClipboardList className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/doctor/profile",
      label: "Perfil médico",
      icon: <Stethoscope className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "#notifications",
      label: "Notificações",
      icon: <Bell className="h-4 w-4" strokeWidth={1.6} />,
      isSeparator: true,
    },
    {
      href: "#help",
      label: "Ajuda",
      icon: <HelpCircle className="h-4 w-4" strokeWidth={1.6} />,
    },
  ],

  clinic: [
    {
      href: "/clinic/dashboard",
      label: "Dashboard",
      icon: <Home className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/clinic/doctors",
      label: "Médicos",
      icon: <Stethoscope className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/clinic/patients",
      label: "Pacientes",
      icon: <Users className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/clinic/records",
      label: "Registros",
      icon: <ClipboardList className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "/clinic/settings",
      label: "Configurações",
      icon: <Settings className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "#help",
      label: "Ajuda",
      icon: <HelpCircle className="h-4 w-4" strokeWidth={1.6} />,
      isSeparator: true,
    },
  ],
};

export const DashboardSidebar = React.forwardRef<
  HTMLDivElement,
  DashboardSidebarProps
>(({ role, className }, ref) => {
  const pathname = usePathname();
  const user = USERS[role];
  const navItems = NAV_ITEMS[role];

  const [storedProfile, setStoredProfile] = React.useState<
    ProfileStorageData | undefined
  >();

  React.useEffect(() => {
    if (role !== "patient") {
      return;
    }

    function syncProfile() {
      setStoredProfile(getStoredProfile());
    }

    syncProfile();

    window.addEventListener("storage", syncProfile);
    window.addEventListener("elo-profile-updated", syncProfile);

    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener("elo-profile-updated", syncProfile);
    };
  }, [role]);

  const displayName =
    role === "patient" && storedProfile?.fullName
      ? storedProfile.fullName
      : user.name;

  const displayEmail =
    role === "patient" && storedProfile?.email ? storedProfile.email : user.email;

  const avatarDataUrl =
    role === "patient" ? storedProfile?.avatarDataUrl : undefined;

  return (
    <motion.aside
      ref={ref}
      className={cn(
        "sticky top-0 flex h-screen w-[248px] flex-col border-r border-[var(--line)] bg-[rgba(255,255,255,0.64)] p-4 text-[var(--navy)]",
        className
      )}
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      aria-label="Navegação lateral do dashboard"
    >
      <motion.div variants={itemVariants} className="px-2 pt-1">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--blue)] text-[13px] font-black text-white">
            ✦
          </span>

          <span className="text-[17px] font-black tracking-[-0.04em] text-[var(--blue)]">
            ELO<span className="text-[var(--navy)]">.ME</span>
          </span>
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="mt-8">
        <Link
          href={
            role === "patient"
              ? "/patient/profile"
              : role === "doctor"
                ? "/doctor/profile"
                : "/clinic/settings"
          }
          className="group flex items-center gap-3 rounded-[18px] px-2 py-2 transition hover:bg-[rgba(255,255,255,0.72)]"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--sky-2)]">
            {avatarDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarDataUrl}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-mono text-[12px] font-semibold text-[var(--blue)]">
                {user.initials}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold uppercase tracking-[0.02em] text-[var(--navy)]">
              {displayName}
            </p>
            <p className="mt-0.5 truncate font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-45)]">
              {role === "patient" ? "Paciente" : displayEmail}
            </p>
          </div>

          <ChevronRight
            className="h-4 w-4 shrink-0 text-[var(--ink-45)] transition group-hover:translate-x-0.5 group-hover:text-[var(--navy)]"
            strokeWidth={1.6}
          />
        </Link>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="my-5 border-t border-[var(--line)]"
      />

      <nav className="flex-1 space-y-1" role="navigation">
        {navItems.map((item, index) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <React.Fragment key={`${item.href}-${index}`}>
              {item.isSeparator ? (
                <motion.div variants={itemVariants} className="h-4" />
              ) : null}

              <motion.div variants={itemVariants}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center rounded-full px-3 py-2.5 text-[13px] font-semibold transition-colors",
                    active
                      ? "bg-[var(--navy)] text-white"
                      : "text-[var(--ink-60)] hover:bg-[var(--sky-2)] hover:text-[var(--navy)]"
                  )}
                >
                  <span
                    className={cn(
                      "mr-3 flex h-5 w-5 items-center justify-center",
                      active ? "text-[var(--sky)]" : "text-[var(--ink-45)]"
                    )}
                  >
                    {item.icon}
                  </span>

                  <span className="truncate">{item.label}</span>

                  <ChevronRight
                    className={cn(
                      "ml-auto h-4 w-4 transition-opacity",
                      active
                        ? "opacity-100 text-white/50"
                        : "opacity-0 group-hover:opacity-100"
                    )}
                    strokeWidth={1.6}
                  />
                </Link>
              </motion.div>
            </React.Fragment>
          );
        })}
      </nav>

      <motion.div variants={itemVariants} className="mt-4">
        <Link
          href="/"
          className="group flex w-full items-center rounded-full px-3 py-2.5 text-[13px] font-semibold text-[var(--ink-60)] transition-colors hover:bg-[rgba(213,64,64,0.08)] hover:text-[var(--danger)]"
        >
          <span className="mr-3 flex h-5 w-5 items-center justify-center">
            <LogOut className="h-4 w-4" strokeWidth={1.6} />
          </span>
          <span>Sair</span>
        </Link>
      </motion.div>
    </motion.aside>
  );
});

DashboardSidebar.displayName = "DashboardSidebar";