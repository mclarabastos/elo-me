"use client";

import { Clock } from "lucide-react";

import {
  ResponsiveDataList,
  type ResponsiveDataColumn,
} from "@/components/dashboard/responsive-data-list";
import {
  DashboardCard,
  DashboardMetricCard,
  DashboardMetricGrid,
} from "@/components/dashboard/dashboard-card";

export type AccessRequestRow = {
  id: string;
  requester: string;
  requester_type: string;
  purpose: string;
  scopes: string;
  duration: string;
  status: string;
  created_at: string;
};

type PatientPermissionsListProps = {
  rows: AccessRequestRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "approved") return "Aprovado";
  if (normalized === "pending") return "Pendente";
  if (normalized === "rejected") return "Negado";
  if (normalized === "revoked") return "Revogado";

  return status;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  const colorClass =
    normalized === "approved"
      ? "border-[rgba(31,174,106,0.35)] text-[var(--success)]"
      : normalized === "pending"
        ? "border-[rgba(240,160,43,0.45)] text-[var(--warning)]"
        : "border-[rgba(213,64,64,0.35)] text-[var(--danger)]";

  return (
    <span
      className={`inline-flex w-fit rounded-[6px] border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] ${colorClass}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function MobilePermissionCard({ row }: { row: AccessRequestRow }) {
  return (
    <article className="border border-[var(--line)] bg-[var(--paper)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-bold text-[var(--navy)]">
            {row.purpose}
          </p>

          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
            {row.requester_type} · {row.duration}
          </p>
        </div>

        <StatusBadge status={row.status} />
      </div>

      <div className="mt-4 space-y-2 border-t border-[var(--line-2)] pt-4">
        <p className="text-[13px] text-[var(--ink-60)]">
          <span className="font-semibold text-[var(--navy)]">Escopos:</span>{" "}
          {row.scopes}
        </p>

        <p className="text-[13px] text-[var(--ink-60)]">
          <span className="font-semibold text-[var(--navy)]">Solicitado:</span>{" "}
          {formatDate(row.created_at)}
        </p>
      </div>
    </article>
  );
}

export function PatientPermissionsList({ rows }: PatientPermissionsListProps) {
  const activeCount = rows.filter((row) => row.status === "approved").length;
  const pendingCount = rows.filter((row) => row.status === "pending").length;
  const deniedCount = rows.filter(
    (row) => row.status !== "approved" && row.status !== "pending"
  ).length;

  const columns: ResponsiveDataColumn<AccessRequestRow>[] = [
    {
      key: "purpose",
      header: "Finalidade",
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-[var(--navy)]">{String(value)}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
            {row.requester_type}
          </p>
        </div>
      ),
    },
    {
      key: "scopes",
      header: "Escopos",
      render: (value) => (
        <span className="text-[13px] text-[var(--ink-60)]">
          {String(value)}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Validade",
      sortable: true,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => <StatusBadge status={String(value)} />,
    },
    {
      key: "created_at",
      header: "Solicitado em",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-[11px] text-[var(--ink-45)]">
          {formatDate(String(value))}
        </span>
      ),
    },
  ];

  return (
    <>
      <DashboardMetricGrid>
        <DashboardMetricCard
          label="Ativas"
          value={activeCount}
          helper="permissões aprovadas"
        />

        <DashboardMetricCard
          label="Pendentes"
          value={pendingCount}
          helper="aguardando resposta"
        />

        <DashboardMetricCard
          label="Encerradas"
          value={deniedCount}
          helper="negadas ou revogadas"
        />
      </DashboardMetricGrid>

      <ResponsiveDataList
        title="Solicitações de acesso"
        description="Tabela no desktop e lista otimizada para celular."
        data={rows}
        columns={columns}
        searchPlaceholder="Buscar por finalidade, escopo ou status"
        emptyTitle="Nenhuma solicitação de acesso ainda"
        emptyDescription="Quando uma clínica ou médico solicitar acesso aos seus dados, o pedido aparecerá aqui."
        mobileRender={(row) => <MobilePermissionCard key={row.id} row={row} />}
        className="rounded-none shadow-none"
      />

    </>
  );
}