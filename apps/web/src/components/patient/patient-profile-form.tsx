"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Camera,
  Check,
  Copy,
  Pencil,
  Save,
  ShieldCheck,
  Upload,
  X,
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/dashboard-card";

type PatientProfileFormProps = {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: string;
    wallet_address?: string | null;
    created_at: string;
    updated_at: string;
  };
};

type ProfileFormData = {
  fullName: string;
  email: string;
  walletAddress: string;
  role: string;
  avatarDataUrl?: string;
};

const STORAGE_KEY = "elo_patient_profile_overrides";

function splitName(fullName: string) {
  const parts = fullName.trim().split(" ").filter(Boolean);

  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function joinName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function formatRole(role: string) {
  const map: Record<string, string> = {
    patient: "Paciente",
    doctor: "Médico",
    clinic: "Clínica",
    admin: "Administrador",
  };

  return map[role] ?? role;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function maskWallet(wallet?: string | null) {
  if (!wallet) return "Carteira não vinculada";
  if (wallet.length <= 18) return wallet;

  return `${wallet.slice(0, 10)}...${wallet.slice(-8)}`;
}

function UnderlineInput({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
        {label}
      </span>

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-10 w-full truncate border-0 border-b border-[var(--line)] bg-transparent px-0 text-[16px] font-medium text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)] disabled:cursor-not-allowed disabled:text-[var(--navy)]"
      />
    </label>
  );
}

function InitialsAvatar({
  fullName,
  avatarDataUrl,
}: {
  fullName: string;
  avatarDataUrl?: string;
}) {
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "RC";

  if (avatarDataUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarDataUrl}
        alt={fullName}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[var(--sky-2)] font-mono text-[20px] font-semibold text-[var(--blue)]">
      {initials}
    </div>
  );
}

export function PatientProfileForm({ initialUser }: PatientProfileFormProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { firstName: initialFirstName, lastName: initialLastName } = splitName(
    initialUser.name
  );

  const [editing, setEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [email, setEmail] = useState(initialUser.email);
  const [walletAddress, setWalletAddress] = useState(
    initialUser.wallet_address ?? ""
  );
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>();

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Partial<ProfileFormData>;

      if (parsed.fullName) {
        const split = splitName(parsed.fullName);
        setFirstName(split.firstName);
        setLastName(split.lastName);
      }

      if (parsed.email) setEmail(parsed.email);

      if (parsed.walletAddress !== undefined) {
        setWalletAddress(parsed.walletAddress);
      }

      if (parsed.avatarDataUrl) {
        setAvatarDataUrl(parsed.avatarDataUrl);
      }
    } catch {
      // Ignora dados locais inválidos.
    }
  }, []);

  const fullName = useMemo(
    () => joinName(firstName, lastName),
    [firstName, lastName]
  );

  function handleCancel() {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<ProfileFormData>;

        if (parsed.fullName) {
          const split = splitName(parsed.fullName);
          setFirstName(split.firstName);
          setLastName(split.lastName);
        } else {
          setFirstName(initialFirstName);
          setLastName(initialLastName);
        }

        setEmail(parsed.email ?? initialUser.email);
        setWalletAddress(
          parsed.walletAddress ?? initialUser.wallet_address ?? ""
        );
        setAvatarDataUrl(parsed.avatarDataUrl);
      } catch {
        setFirstName(initialFirstName);
        setLastName(initialLastName);
        setEmail(initialUser.email);
        setWalletAddress(initialUser.wallet_address ?? "");
        setAvatarDataUrl(undefined);
      }
    } else {
      setFirstName(initialFirstName);
      setLastName(initialLastName);
      setEmail(initialUser.email);
      setWalletAddress(initialUser.wallet_address ?? "");
      setAvatarDataUrl(undefined);
    }

    setEditing(false);
    setSavedMessage("");
  }

  function handleSave() {
    const payload: ProfileFormData = {
      fullName,
      email,
      walletAddress,
      role: initialUser.role,
      avatarDataUrl,
    };

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event("elo-profile-updated"));

    setEditing(false);
    setSavedMessage("Alterações salvas com sucesso.");
    window.setTimeout(() => setSavedMessage(""), 2500);
  }

  function handleAvatarUpload(file: File) {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarDataUrl(reader.result);
        setEditing(true);
      }
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-[18px]">
      <section>

        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Meus dados
        </h1>

        <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Consulte e edite as informações principais da sua conta.
        </p>
      </section>

      <DashboardCard>
        <div className="flex flex-col gap-6 border-b border-[var(--line)] pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full">
              <InitialsAvatar fullName={fullName} avatarDataUrl={avatarDataUrl} />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-[rgba(11,27,63,0.14)] text-white transition sm:bg-[rgba(11,27,63,0.32)] sm:opacity-0 sm:hover:opacity-100"
                aria-label="Enviar foto de perfil"
              >
                <Camera className="h-5 w-5" strokeWidth={1.8} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) handleAvatarUpload(file);
                }}
              />
            </div>

            <div>
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                {fullName || "Usuário"}
              </h2>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 hidden items-center justify-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)] sm:inline-flex"
              >
                <Upload className="h-3.5 w-3.5" strokeWidth={1.6} />
                Alterar foto
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start lg:justify-end">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-[var(--card)]"
              >
                <Pencil className="h-4 w-4" strokeWidth={1.6} />
                Editar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center gap-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13px] font-semibold text-[var(--ink-60)] transition hover:bg-[var(--card)]"
                >
                  <X className="h-4 w-4" strokeWidth={1.6} />
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--blue)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                >
                  <Save className="h-4 w-4" strokeWidth={1.6} />
                  Salvar
                </button>
              </>
            )}
          </div>
        </div>

        {savedMessage ? (
          <div className="mt-4 inline-flex items-center gap-2 rounded-[6px] border border-[rgba(31,174,106,0.35)] px-3 py-1.5 text-[12px] font-medium text-[var(--success)]">
            <Check className="h-4 w-4" strokeWidth={1.8} />
            {savedMessage}
          </div>
        ) : null}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_390px]">
          <div>
            <h3 className="text-[16px] font-bold tracking-[-0.01em] text-[var(--navy)]">
              Informações pessoais
            </h3>

            <div className="mt-6 grid max-w-[420px] gap-y-7">
              <UnderlineInput
                label="Nome"
                value={firstName}
                onChange={setFirstName}
                disabled={!editing}
              />

              <UnderlineInput
                label="Sobrenome"
                value={lastName}
                onChange={setLastName}
                disabled={!editing}
              />

              <UnderlineInput
                label="E-mail"
                type="email"
                value={email}
                onChange={setEmail}
                disabled={!editing}
              />

              <UnderlineInput
                label="Wallet"
                value={walletAddress}
                onChange={setWalletAddress}
                disabled={!editing}
                placeholder="0x..."
              />
            </div>
          </div>

          <aside className="border border-[var(--line)] bg-[var(--card)] p-5">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Identidade ELO
                </p>

                <h3 className="mt-2 text-[20px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                  Dados da conta
                </h3>

                <p className="mt-2 text-[13px] leading-relaxed text-[var(--ink-60)]">
                  Informações técnicas vinculadas à sua identidade digital.
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] bg-[var(--sky-2)] text-[var(--blue)]">
                <ShieldCheck className="h-5 w-5" strokeWidth={1.6} />
              </div>
            </div>

            <div className="divide-y divide-[var(--line-2)]">
              <div className="py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  ID ELO
                </p>
                <p className="mt-1 break-all font-mono text-[13px] font-semibold text-[var(--navy)]">
                  {initialUser.id}
                </p>
              </div>

              <div className="py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Tipo de perfil
                </p>
                <p className="mt-1 text-[14px] font-semibold text-[var(--navy)]">
                  {formatRole(initialUser.role)}
                </p>
              </div>

              <div className="py-4">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Wallet
                </p>
                <p className="mt-1 break-all font-mono text-[13px] font-semibold text-[var(--navy)]">
                  {maskWallet(walletAddress || initialUser.wallet_address)}
                </p>
              </div>

              <div className="grid gap-4 py-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Criado em
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[var(--navy)]">
                    {formatDate(initialUser.created_at)}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Atualizado em
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[var(--navy)]">
                    {formatDate(initialUser.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 rounded-[6px] border border-[rgba(31,174,106,0.35)] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--success)]">
                <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.6} />
                Verificada
              </span>

              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(initialUser.id)}
                className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)] transition hover:opacity-80"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.6} />
                Copiar ID
              </button>
            </div>
          </aside>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-[var(--card)]"
          >
            Voltar para página principal
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[6px] bg-[var(--navy)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
          >
            Sair do perfil
          </Link>
        </div>
      </DashboardCard>
    </div>
  );
}