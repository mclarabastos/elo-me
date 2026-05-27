import Link from "next/link";
import {
  ArrowRight,
  FileText,
  Fingerprint,
  LockKeyhole,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { getDemoUser, getPatientMedicalData } from "@/lib/api";

export const dynamic = "force-dynamic";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatCategory(category: string) {
  const labels: Record<string, string> = {
    identification: "Identificação",
    allergies: "Alergias",
    medications: "Medicamentos",
    recent_exams: "Exames recentes",
    special_needs: "Necessidades especiais",
    emergency_contact: "Contato de emergência",
  };

  return labels[category] ?? category;
}

function formatSensitivity(sensitivity: string) {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };

  return labels[sensitivity] ?? sensitivity;
}

function sensitivityStyle(sensitivity: string) {
  const normalized = sensitivity.toLowerCase();

  if (normalized === "high") {
    return "border-[rgba(213,64,64,0.35)] text-[var(--danger)]";
  }

  if (normalized === "medium") {
    return "border-[rgba(240,160,43,0.45)] text-[var(--warning)]";
  }

  return "border-[rgba(31,174,106,0.35)] text-[var(--success)]";
}

function StatBlock({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="border border-[var(--line)] bg-[var(--paper)] p-5">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
        {label}
      </p>

      <p className="mt-4 font-mono text-[30px] font-semibold tracking-[-0.04em] text-[var(--navy)]">
        {value}
      </p>

      <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
        {helper}
      </p>
    </div>
  );
}

function MedicalDataBlock({
  item,
}: {
  item: Awaited<ReturnType<typeof getPatientMedicalData>>[number];
}) {
  return (
    <article
      id={item.id}
      className="group flex min-h-[230px] flex-col justify-between border-b border-r border-[var(--line)] bg-[var(--paper)] p-5 transition hover:bg-[var(--card)]"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-medium text-[var(--ink-60)]">
              {formatCategory(item.category)}
            </p>

            <h3 className="mt-3 text-[18px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              {item.label}
            </h3>

            <p className="mt-2 max-w-[320px] text-[13px] leading-relaxed text-[var(--ink-60)]">
              Registro disponível na identidade médica do paciente.
            </p>
          </div>

        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span
            className={`rounded-[6px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${sensitivityStyle(
              item.sensitivity
            )}`}
          >
            {formatSensitivity(item.sensitivity)}
          </span>

          <span className="rounded-[6px] border border-[var(--line)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-45)]">
            Hash
          </span>
        </div>

        <div className="mt-5 flex items-start gap-2">
          <Fingerprint
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ink-45)]"
            strokeWidth={1.6}
          />

          <p className="line-clamp-2 break-all font-mono text-[11px] leading-relaxed text-[var(--ink-45)]">
            {item.data_hash}
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
            Atualizado
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[var(--navy)]">
            {formatDate(item.updated_at)}
          </p>
        </div>

        <Link
          href={`/patient/records#${item.id}`}
          className="rounded-[6px] bg-[var(--navy)] px-3 py-2 text-[12px] font-semibold text-white transition hover:opacity-90"
        >
          Ver
        </Link>
      </div>
    </article>
  );
}

export default async function PatientRecordsPage() {
  const user = await getDemoUser();
  const medicalData = await getPatientMedicalData(user.id);

  const highSensitivityCount = medicalData.filter(
    (item) => item.sensitivity === "high"
  ).length;

  const categoriesCount = new Set(medicalData.map((item) => item.category)).size;

  return (
    <div className="space-y-[18px]">
      <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>

          <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
            Meus documentos médicos
          </h1>

          <p className="mt-3 max-w-[640px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            Acompanhe os dados médicos disponíveis na sua identidade ELO. Cada
            registro possui hash de integridade para auditoria e verificação.
          </p>
        </div>

        <button
          type="button"
          disabled
          className="inline-flex w-fit items-center justify-center gap-2 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[13px] font-semibold text-[var(--ink-45)] opacity-70"
          title="Upload será habilitado quando o endpoint estiver disponível"
        >
          <Upload className="h-4 w-4" strokeWidth={1.6} />
          Enviar documento
        </button>
      </section>

      <section className="grid border border-[var(--line)] bg-[var(--paper)] sm:grid-cols-3">
        <StatBlock
          label="Registros"
          value={medicalData.length}
          helper="dados médicos disponíveis"
        />

        <StatBlock
          label="Categorias"
          value={categoriesCount}
          helper="escopos clínicos organizados"
        />

        <StatBlock
          label="Alta sensibilidade"
          value={highSensitivityCount}
          helper="dados com acesso restrito"
        />
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Dados disponíveis
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Histórico clínico conectado
            </h2>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-[rgba(31,174,106,0.30)] px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--success)]">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.6} />
            Identidade verificada
          </div>
        </div>

        {medicalData.length > 0 ? (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3">
            {medicalData.map((item) => (
              <MedicalDataBlock key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[14px] bg-[var(--sky-2)] text-[var(--blue)]">
              <FileText className="h-6 w-6" strokeWidth={1.6} />
            </div>

            <h3 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Nenhum documento encontrado
            </h3>

            <p className="mx-auto mt-2 max-w-[360px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
              Seus registros médicos aparecerão aqui assim que forem conectados
              à sua identidade ELO.
            </p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-[var(--line)] p-5">
          <p className="text-[14px] text-[var(--ink-60)]">
            {medicalData.length} registros ativos
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card)] text-[var(--ink-45)]"
            >
              ‹
            </button>
            <button
              type="button"
              disabled
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--card)] text-[var(--ink-45)]"
            >
              ›
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}