"use client";

import * as React from "react";
import Image from "next/image";
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
  ScrollText,
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

type ProfileStorageData = {
  fullName?: string;
  email?: string;
  avatarDataUrl?: string;
};

const PROFILE_STORAGE_KEY = "elo_patient_profile_overrides";

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
      href: "/patient/audit",
      label: "Auditoria",
      icon: <ScrollText className="h-4 w-4" strokeWidth={1.6} />,
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
      href: "/doctor/logs",
      label: "Histórico",
      icon: <ScrollText className="h-4 w-4" strokeWidth={1.6} />,
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
      href: "/clinic/logs",
      label: "Logs / Auditoria",
      icon: <ScrollText className="h-4 w-4" strokeWidth={1.6} />,
    },
    {
      href: "#help",
      label: "Ajuda",
      icon: <HelpCircle className="h-4 w-4" strokeWidth={1.6} />,
      isSeparator: true,
    },
  ],
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

function getInitials(name: string, fallback: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || fallback;
}

function isActivePath(pathname: string, href: string) {
  if (href.startsWith("#")) {
    return false;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function getProfileHref(role: DashboardRole) {
  if (role === "patient") {
    return "/patient/profile";
  }

  if (role === "doctor") {
    return "/doctor/profile";
  }

  return "/clinic/dashboard";
}

function SidebarAvatar({
  name,
  initials,
  avatarDataUrl,
}: {
  name: string;
  initials: string;
  avatarDataUrl?: string;
}) {
  if (avatarDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarDataUrl}
        alt={name}
        className="h-full w-full rounded-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--sky-2)] font-mono text-[11px] font-semibold text-[var(--blue)]">
      {initials}
    </div>
  );
}

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

  const initials = getInitials(displayName, user.initials);
  const profileHref = getProfileHref(role);

  const mobileNavItems = navItems
    .filter((item) => !item.isSeparator && !item.href.startsWith("#"))
    .slice(0, 5);

  return (
    <>
      <motion.aside
        ref={ref}
        className={cn(
          "hidden h-screen w-[240px] shrink-0 flex-col border-r border-[var(--line)] bg-[rgba(255,255,255,0.78)] px-4 py-6 backdrop-blur-xl md:flex",
          className,
        )}
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
      >
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            aria-label="Ir para a página inicial da ELO.me"
            className="inline-flex items-center"
          >
            <Image
              src="/images/elo.me_teste.png"
              alt="ELO.me"
              width={124}
              height={40}
              priority
              className="h-6 w-auto object-contain"
            />
          </Link>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Link
            href={profileHref}
            className={cn(
              "-mx-2 mt-10 flex items-center gap-3 rounded-[14px] p-2 transition hover:bg-[var(--card)]",
              isActivePath(pathname, profileHref) && "bg-[var(--card)]",
            )}
          >
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full">
              <SidebarAvatar
                name={displayName}
                initials={initials}
                avatarDataUrl={avatarDataUrl}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold uppercase tracking-[0.02em] text-[var(--navy)]">
                {displayName}
              </p>

              <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-45)]">
                {displayEmail}
              </p>
            </div>

            <ChevronRight
              className="h-4 w-4 shrink-0 text-[var(--ink-45)]"
              strokeWidth={1.6}
            />
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="my-7 border-t border-[var(--line)]"
        />

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <React.Fragment key={`${role}-${item.href}-${item.label}`}>
                {item.isSeparator ? <div className="h-6" /> : null}

                <motion.div variants={itemVariants}>
                  {item.href.startsWith("#") ? (
                    <a
                      href={item.href}
                      className="group flex items-center gap-3 rounded-full px-4 py-3 text-[14px] font-semibold text-[var(--ink-60)] transition hover:bg-[var(--card)] hover:text-[var(--navy)]"
                    >
                      <span className="text-[var(--ink-45)] transition group-hover:text-[var(--blue)]">
                        {item.icon}
                      </span>

                      <span className="truncate">{item.label}</span>
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 rounded-full px-4 py-3 text-[14px] font-semibold transition",
                        active
                          ? "bg-[var(--navy)] text-white"
                          : "text-[var(--ink-60)] hover:bg-[var(--card)] hover:text-[var(--navy)]",
                      )}
                    >
                      <span
                        className={cn(
                          "transition",
                          active
                            ? "text-white"
                            : "text-[var(--ink-45)] group-hover:text-[var(--blue)]",
                        )}
                      >
                        {item.icon}
                      </span>

                      <span className="truncate">{item.label}</span>

                      {active ? (
                        <ChevronRight
                          className="ml-auto h-4 w-4 text-white/70"
                          strokeWidth={1.6}
                        />
                      ) : null}
                    </Link>
                  )}
                </motion.div>
              </React.Fragment>
            );
          })}
        </nav>

        <motion.div variants={itemVariants} className="pt-6">
          <Link
            href="/auth/login"
            className="group flex items-center gap-3 rounded-full px-4 py-3 text-[14px] font-semibold text-[var(--ink-60)] transition hover:bg-[var(--card)] hover:text-[var(--navy)]"
          >
            <LogOut
              className="h-4 w-4 text-[var(--ink-45)] transition group-hover:text-[var(--blue)]"
              strokeWidth={1.6}
            />
            Sair
          </Link>
        </motion.div>
      </motion.aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)] bg-[rgba(255,255,255,0.92)] px-2 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-[520px] grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={`mobile-${role}-${item.href}`}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-[10px] px-2 py-2 text-center text-[10px] font-semibold transition",
                  active
                    ? "bg-[var(--navy)] text-white"
                    : "text-[var(--ink-60)] hover:bg-[var(--card)]",
                )}
              >
                <span
                  className={cn(
                    active ? "text-white" : "text-[var(--ink-45)]",
                  )}
                >
                  {item.icon}
                </span>

                <span className="max-w-full truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
});

DashboardSidebar.displayName = "DashboardSidebar";

export default DashboardSidebar;