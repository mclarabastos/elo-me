import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Mail,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { getDemoClinic, getDemoDoctor } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatStatus(status: string) {
  const labels: Record<string, string> = {
    active: "Ativo",
    inactive: "Inativo",
    pending: "Pendente",
  };

  return labels[status] ?? status;
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

function MetricCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="flex items-center gap-4 border border-[var(--line)] bg-[var(--paper)] p-5">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)]">
        <span className="font-mono text-[24px] font-semibold tracking-[-0.05em] text-[var(--navy)]">
          {value}
        </span>
      </div>

      <div className="min-w-0">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
          {label}
        </p>

        <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
          {helper}
        </p>
      </div>
    </div>
  );
}

function DoctorInitials({ name }: { name: string }) {
  const initials = name
    .replace(/^Dra?\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--sky-2)] font-mono text-[12px] font-semibold text-[var(--blue)]">
      {initials || "AM"}
    </div>
  );
}

export default async function ClinicDoctorsPage() {
  const [clinic, doctor] = await Promise.all([
    getDemoClinic(),
    getDemoDoctor(),
  ]);

  const doctors = [
    {
      id: doctor.id,
      name: doctor.name,
      crm: doctor.crm,
      crmStatus: doctor.crm_status,
      authorized: doctor.authorized,
      specialty: "Neurologia clínica",
      email: "ana.martins@example.com",
      clinicName: clinic.name,
    },
  ];

  const activeDoctors = doctors.filter(
    (item) => item.authorized && item.crmStatus === "active"
  );

  return (
    <div className="space-y-[18px]">
      <section>
        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          Médicos da clínica
        </h1>

        <p className="mt-3 max-w-[720px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
          Visualize os profissionais vinculados à clínica, seus registros
          profissionais e a situação de autorização para operar solicitações de
          acesso.
        </p>
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Equipe médica
            </h2>

            <p className="mt-2 max-w-[680px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
              Esses profissionais podem participar de fluxos de solicitação,
              atendimento e consulta de dados autorizados por pacientes.
            </p>
          </div>

          <label className="flex w-full max-w-[320px] items-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 md:w-[320px]">
            <Search
              className="h-4 w-4 shrink-0 text-[var(--blue)]"
              strokeWidth={1.7}
            />

            <input
              placeholder="Buscar médico"
              className="h-7 min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[var(--navy)] outline-none placeholder:text-[var(--ink-45)]"
            />
          </label>
        </div>

        <div className="hidden overflow-hidden md:block">
          <table className="w-full table-fixed border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--line)] bg-[var(--card)]">
                <th className="w-[28%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Médico
                </th>

                <th className="w-[18%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  CRM
                </th>

                <th className="w-[20%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Clínica
                </th>

                <th className="w-[20%] px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {doctors.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--line-2)] bg-[var(--paper)] last:border-b-0"
                >
                  <td className="px-5 py-5 align-middle">
                    <div className="flex items-center gap-3">
                      <DoctorInitials name={item.name} />

                      <div className="min-w-0">
                        <p className="truncate text-[14px] font-bold text-[var(--navy)]">
                          {item.name}
                        </p>

                        {"specialty" in item && item.specialty ? (
                          <p className="mt-0.5 truncate text-[12px] text-[var(--ink-60)]">
                            {item.specialty}
                          </p>
                        ) : null}

                        <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
                          {item.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-5 align-middle">
                    <p className="text-[13px] font-semibold text-[var(--navy)]">
                      {item.crm}
                    </p>
                  </td>

                  <td className="px-5 py-5 align-middle">
                    <p className="truncate text-[13px] font-medium text-[var(--ink-60)]">
                      {item.clinicName}
                    </p>
                  </td>

                  <td className="px-5 py-5 align-middle">
                    <div className="flex flex-col items-start gap-2">
                      <StatusPill
                        label={item.authorized ? "Autorizada" : "Pendente"}
                        tone={item.authorized ? "success" : "warning"}
                      />

                      <StatusPill
                        label={`CRM ${formatStatus(item.crmStatus)}`}
                        tone={item.crmStatus === "active" ? "info" : "warning"}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-3 p-5 md:hidden">
          {doctors.map((item) => (
            <article
              key={item.id}
              className="border border-[var(--line)] bg-[var(--paper)] p-4"
            >
              <div className="flex items-start gap-3">
                <DoctorInitials name={item.name} />

                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold text-[var(--navy)]">
                    {item.name}
                  </p>

                  <p className="mt-1 text-[13px] text-[var(--ink-60)]">
                    {item.specialty}
                  </p>

                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
                    {item.crm}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill
                      label={item.authorized ? "Autorizada" : "Pendente"}
                      tone={item.authorized ? "success" : "warning"}
                    />

                    <StatusPill
                      label={`CRM ${formatStatus(item.crmStatus)}`}
                      tone={item.crmStatus === "active" ? "info" : "warning"}
                    />
                  </div>

                  <Link
                    href="/clinic/records"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90"
                  >
                    Ver registros
                    <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}