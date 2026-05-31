"use client";

import * as React from "react";
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { SuccessModal } from "@/components/feedback/success-modal";
import type { ClinicResponse, DoctorResponse } from "@/types/api";

type DoctorProfileClientProps = {
  initialDoctor: DoctorResponse;
  initialClinic: ClinicResponse;
};

type DoctorProfileOverrides = {
  displayName: string;
  specialty: string;
  email: string;
  phone: string;
  bio: string;
};

const DOCTOR_PROFILE_STORAGE_KEY = "elo_doctor_profile_overrides";

const DEFAULT_PROFILE: DoctorProfileOverrides = {
  displayName: "Dra. Ana Martins",
  specialty: "Neurologia clínica",
  email: "ana.martins@example.com",
  phone: "+55 11 99999-9999",
  bio: "Médica responsável por consultar dados autorizados mediante consentimento da paciente.",
};

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    pending: "Pendente",
  };

  return labels[status] ?? status;
}

function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return initials || "AM";
}

function readStoredProfile(initialName: string): DoctorProfileOverrides {
  if (typeof window === "undefined") {
    return {
      ...DEFAULT_PROFILE,
      displayName: initialName || DEFAULT_PROFILE.displayName,
    };
  }

  try {
    const raw = window.localStorage.getItem(DOCTOR_PROFILE_STORAGE_KEY);

    if (!raw) {
      return {
        ...DEFAULT_PROFILE,
        displayName: initialName || DEFAULT_PROFILE.displayName,
      };
    }

    return {
      ...DEFAULT_PROFILE,
      displayName: initialName || DEFAULT_PROFILE.displayName,
      ...(JSON.parse(raw) as Partial<DoctorProfileOverrides>),
    };
  } catch {
    return {
      ...DEFAULT_PROFILE,
      displayName: initialName || DEFAULT_PROFILE.displayName,
    };
  }
}

function StatusPill({
  label,
  tone = "success",
}: {
  label: string;
  tone?: "success" | "info" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "border-[rgba(31,174,106,0.35)] text-[var(--success)]"
      : tone === "warning"
        ? "border-[rgba(240,160,43,0.45)] text-[var(--warning)]"
        : tone === "danger"
          ? "border-[rgba(213,64,64,0.35)] text-[var(--danger)]"
          : "border-[rgba(30,71,255,0.25)] text-[var(--blue)]";

  return (
    <span
      className={`inline-flex w-fit items-center rounded-[6px] border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}
    >
      {label}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full border-0 border-b border-[var(--line)] bg-transparent px-0 text-[15px] font-medium text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)]"
      />
    </label>
  );
}

function ReadOnlyField({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="border-b border-[var(--line)] py-5 last:border-b-0">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
        {label}
      </p>

      <p className="mt-2 text-[15px] font-semibold text-[var(--navy)]">
        {value}
      </p>

      {helper ? (
        <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

function InfoCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border border-[var(--line)] bg-[var(--paper)] p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
          {icon}
        </span>

        <div>
          <h3 className="text-[16px] font-bold tracking-[-0.02em] text-[var(--navy)]">
            {title}
          </h3>

          <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-60)]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

export function DoctorProfileClient({
  initialDoctor,
  initialClinic,
}: DoctorProfileClientProps) {
  const [profile, setProfile] = React.useState<DoctorProfileOverrides>(() =>
    readStoredProfile(initialDoctor.name)
  );
  const [successOpen, setSuccessOpen] = React.useState(false);

  function updateProfile(field: keyof DoctorProfileOverrides, value: string) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    window.localStorage.setItem(
      DOCTOR_PROFILE_STORAGE_KEY,
      JSON.stringify(profile)
    );

    window.dispatchEvent(new Event("elo-doctor-profile-updated"));
    setSuccessOpen(true);
  }

  return (
    <div className="space-y-[18px]">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
            Perfil médico
          </h1>

          <p className="mt-3 max-w-[720px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            Atualize as informações de apresentação do seu perfil. Dados
            verificados, como CRM e vínculo institucional, permanecem protegidos.
          </p>
        </div>
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col gap-6 border-b border-[var(--line)] p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--sky-2)] font-mono text-[20px] font-semibold text-[var(--blue)]">
              {getInitials(profile.displayName)}
            </div>

            <div>
              <h2 className="text-[24px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                {profile.displayName}
              </h2>

              <p className="mt-1 text-[14px] text-[var(--ink-60)]">
                {profile.specialty} · {initialClinic.name}
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill
                  label={initialDoctor.authorized ? "Autorizada" : "Pendente"}
                  tone={initialDoctor.authorized ? "success" : "warning"}
                />
                <StatusPill
                  label={`CRM ${formatStatus(initialDoctor.crm_status)}`}
                  tone="info"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            form="doctor-profile-form"
            className="inline-flex items-center justify-center rounded-[6px] bg-[var(--navy)] px-4 py-3 text-[13px] font-semibold text-white transition hover:opacity-90"
          >
            Salvar alterações
          </button>
        </div>

        <div className="grid gap-0 xl:grid-cols-[1fr_360px]">
          <form
            id="doctor-profile-form"
            onSubmit={handleSubmit}
            className="border-b border-[var(--line)] p-5 xl:border-b-0 xl:border-r"
          >
            <div>
              <h3 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                Informações de apresentação
              </h3>

              <p className="mt-2 max-w-[680px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
                Estes dados ajudam pacientes e clínicas a reconhecerem o perfil
                médico na plataforma.
              </p>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field
                label="Nome de exibição"
                value={profile.displayName}
                onChange={(value) => updateProfile("displayName", value)}
                placeholder="Ex: Dra. Ana Martins"
              />

              <Field
                label="Especialidade"
                value={profile.specialty}
                onChange={(value) => updateProfile("specialty", value)}
                placeholder="Ex: Neurologia clínica"
              />

              <Field
                label="E-mail profissional"
                type="email"
                value={profile.email}
                onChange={(value) => updateProfile("email", value)}
                placeholder="ana.martins@example.com"
              />

              <Field
                label="Telefone profissional"
                value={profile.phone}
                onChange={(value) => updateProfile("phone", value)}
                placeholder="+55 11 99999-9999"
              />
            </div>

            <label className="mt-6 block">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                Descrição
              </span>

              <textarea
                value={profile.bio}
                onChange={(event) => updateProfile("bio", event.target.value)}
                rows={4}
                placeholder="Descreva brevemente sua atuação."
                className="mt-2 w-full resize-none border border-[var(--line)] bg-transparent p-3 text-[14px] font-medium leading-relaxed text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)]"
              />
            </label>
          </form>

          <aside className="p-5">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Dados verificados
            </p>

            <h3 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Registro profissional
            </h3>

            <div className="mt-3">
              <ReadOnlyField
                label="CRM"
                value={initialDoctor.crm}
                helper="Registro profissional validado para a demonstração."
              />

              <ReadOnlyField
                label="Status CRM"
                value={formatStatus(initialDoctor.crm_status)}
                helper="Este campo não pode ser alterado pela interface."
              />

              <ReadOnlyField
                label="Clínica vinculada"
                value={initialClinic.name}
                helper="Vínculo institucional usado no fluxo de autorização."
              />

              <ReadOnlyField
                label="Autorização"
                value={initialDoctor.authorized ? "Médica autorizada" : "Pendente"}
                helper="Status de habilitação para solicitar acesso aos dados."
              />
            </div>
          </aside>
        </div>
      </section>


      <SuccessModal
        open={successOpen}
        title="Perfil atualizado!"
        description="As informações de apresentação foram salvas para esta demonstração."
        primaryActionLabel="Continuar"
        onClose={() => setSuccessOpen(false)}
        onPrimaryAction={() => setSuccessOpen(false)}
      />
    </div>
  );
}