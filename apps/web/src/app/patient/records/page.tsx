import Link from "next/link";
import { ArrowRight, FileText, Upload } from "lucide-react";

import { getFrontendPatientDashboard } from "@/lib/api";

export const dynamic = "force-dynamic";

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

type MedicalDataCategory = Awaited<
  ReturnType<typeof getFrontendPatientDashboard>
>["medicalDataCategories"][number];

function MedicalDataBlock({ item }: { item: MedicalDataCategory }) {
  return (
    <article
      id={item.id}
      className="group flex min-h-[180px] flex-col justify-between border border-[var(--line)] bg-[var(--paper)] p-5 transition hover:bg-[var(--card)]"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
              {formatCategory(item.category)}
            </p>

            <h3 className="mt-3 text-[18px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              {item.label}
            </h3>

            <p className="mt-2 max-w-[420px] text-[13px] leading-relaxed text-[var(--ink-60)]">
              Categoria disponível para compartilhamento mediante consentimento
              do paciente.
            </p>
          </div>

          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
            <FileText className="h-4 w-4" strokeWidth={1.7} />
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span
            className={`rounded-[6px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${sensitivityStyle(
              item.sensitivity
            )}`}
          >
            Sensibilidade {formatSensitivity(item.sensitivity)}
          </span>

          <span className="rounded-[6px] border border-[var(--line)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--ink-45)]">
            {item.available ? "Disponível" : "Indisponível"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-[var(--line-2)] pt-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
            Escopo
          </p>

          <p className="mt-1 font-mono text-[11px] text-[var(--ink-60)]">
            {item.category}
          </p>
        </div>

        <Link
          href="/patient/permissions"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--blue)] transition hover:opacity-80"
        >
          Gerenciar
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.7} />
        </Link>
      </div>
    </article>
  );
}

export default async function PatientRecordsPage() {
  const dashboard = await getFrontendPatientDashboard();

  const totalRecords = dashboard.medicalDataCategories.length;
  const highSensitivityCount = dashboard.medicalDataCategories.filter(
    (item) => item.sensitivity === "high"
  ).length;
  const availableCount = dashboard.medicalDataCategories.filter(
    (item) => item.available
  ).length;

  return (
    <div className="space-y-[18px]">
      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
            Meu prontuário
          </h1>

          <p className="mt-3 max-w-[680px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            Visualize as categorias de dados médicos vinculadas à sua identidade.
            Você decide quais escopos podem ser compartilhados, com quem e por
            quanto tempo.
          </p>
        </div>

        <button className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-3 text-[13px] font-semibold text-white transition hover:opacity-90">
          <Upload className="h-4 w-4" strokeWidth={1.7} />
          Novo documento
        </button>
      </section>

      <section className="grid gap-[14px] lg:grid-cols-3">
        <StatBlock
          label="Categorias"
          value={totalRecords}
          helper="Dados médicos organizados por escopo"
        />

        <StatBlock
          label="Disponíveis"
          value={availableCount}
          helper="Escopos prontos para consentimento"
        />

        <StatBlock
          label="Alta sensibilidade"
          value={highSensitivityCount}
          helper="Dados que exigem atenção extra"
        />
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Dados médicos
            </p>

            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              Categorias do prontuário
            </h2>
          </div>

        </div>

        {dashboard.medicalDataCategories.length > 0 ? (
          <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.medicalDataCategories.map((item) => (
              <MedicalDataBlock key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="p-5">
            <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8">
              <p className="text-[14px] font-semibold text-[var(--navy)]">
                Nenhum dado médico disponível.
              </p>

              <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                Seus registros aparecerão aqui assim que forem conectados à sua
                identidade Elo.me.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}