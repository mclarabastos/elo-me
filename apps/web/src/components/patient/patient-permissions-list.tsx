"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Check, Loader2, Search, ShieldCheck, X } from "lucide-react";

import { approveConsent, updateAccessRequestStatus } from "@/lib/api";
import type { MedicalScope } from "@/types/api";

export type AccessRequestRow = {
  id: string;
  requester: string;
  requester_type: string;
  purpose: string;
  scopes: string;
  requested_scopes: MedicalScope[];
  duration: string;
  status: string;
  created_at: string;
};

type PatientPermissionsListProps = {
  rows: AccessRequestRow[];
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  const hour = String(date.getUTCHours()).padStart(2, "0");
  const minute = String(date.getUTCMinutes()).padStart(2, "0");

  return `${day}/${month}/${year}, ${hour}:${minute}`;
}

function formatRequesterType(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === "doctor") {
    return "Médico";
  }

  if (normalized === "clinic") {
    return "Clínica";
  }

  return value;
}

function formatStatus(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "approved" || normalized === "authorized") {
    return "Aprovado";
  }

  if (normalized === "pending") {
    return "Pendente";
  }

  if (normalized === "denied" || normalized === "rejected") {
    return "Negado";
  }

  if (normalized === "revoked") {
    return "Revogado";
  }

  return status;
}

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();

  if (normalized === "approved" || normalized === "authorized") {
    return "border-[rgba(31,174,106,0.35)] bg-[#F3FFF7] text-[var(--success)]";
  }

  if (normalized === "pending") {
    return "border-[rgba(240,160,43,0.45)] bg-[#FFFAF1] text-[var(--warning)]";
  }

  return "border-[rgba(213,64,64,0.35)] bg-[#FFF5F5] text-[var(--danger)]";
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex w-fit rounded-[6px] border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] ${getStatusTone(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}

function MetricCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="flex items-center justify-between border border-[var(--line)] bg-[var(--paper)] px-5 py-4">
      <div>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
          {label}
        </p>

        <p className="mt-1 text-[13px] text-[var(--ink-60)]">{caption}</p>
      </div>

      <p className="text-[24px] font-bold leading-none tracking-[-0.04em] text-[var(--navy)]">
        {value}
      </p>
    </div>
  );
}

function DetailsLink({
  row,
  onOpen,
}: {
  row: AccessRequestRow;
  onOpen: (row: AccessRequestRow) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onOpen(row)}
      className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)] transition hover:text-[var(--navy)]"
      aria-label={`Ver detalhes da solicitação ${row.id}`}
    >
      Ver mais →
    </button>
  );
}

function ReceiptRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[132px_1fr] gap-4 border-b border-dashed border-[var(--line)] py-3 last:border-b-0">
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
        {label}
      </p>

      <div className="text-[14px] font-medium leading-[1.55] text-[var(--navy)]">
        {value}
      </div>
    </div>
  );
}

function RequestReceiptModal({
  row,
  onClose,
}: {
  row: AccessRequestRow;
  onClose: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isActionable = row.status.toLowerCase() === "pending";

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function handleApprove() {
    startTransition(async () => {
      await approveConsent({
        access_request_id: row.id,
        allowed_scopes: row.requested_scopes,
      });

      onClose();
      router.refresh();
    });
  }

  function handleDeny() {
    startTransition(async () => {
      await updateAccessRequestStatus(row.id, {
        status: "denied",
      });

      onClose();
      router.refresh();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(11,27,63,0.72)] px-4 py-8 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Fechar detalhes da solicitação"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 flex max-h-[calc(100vh-64px)] w-full max-w-[560px] flex-col overflow-hidden border border-[var(--line)] bg-[var(--paper)] shadow-[0_32px_90px_-42px_rgba(0,0,0,0.55)]">
        <header className="border-b border-[var(--line)] bg-[var(--paper)] px-6 py-5">
          <div className="flex items-start justify-between gap-5">
            <div>

              <p className="mt-4 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-45)]">
                Recibo de solicitação
              </p>

              <h2 className="mt-2 text-[26px] font-bold leading-[1.05] tracking-[-0.035em] text-[var(--navy)]">
                {row.purpose}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--ink-45)] transition hover:text-[var(--navy)]"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto px-6 py-5">
          <div className="border border-[var(--line)] bg-[var(--card)] px-5 py-2">
            <ReceiptRow label="Solicitante" value={row.requester} />

            <ReceiptRow
              label="Tipo"
              value={formatRequesterType(row.requester_type)}
            />

            <ReceiptRow
              label="Status"
              value={<StatusBadge status={row.status} />}
            />

            <ReceiptRow label="Validade" value={row.duration} />

            <ReceiptRow label="Solicitado em" value={formatDateTime(row.created_at)} />

            <ReceiptRow label="Dados" value={row.scopes} />

            <ReceiptRow
              label="Protocolo"
              value={
                <span className="font-mono text-[12px] text-[var(--ink-60)]">
                  {row.id}
                </span>
              }
            />
          </div>

          <p className="mt-4 text-[12px] leading-[1.55] text-[var(--ink-60)]">
            Ao aprovar, você libera somente os dados listados acima, pelo prazo
            informado e para a finalidade desta solicitação.
          </p>
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-[var(--line)] bg-[var(--card)] px-6 py-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Fechar
          </button>

          {isActionable ? (
            <>
              <button
                type="button"
                onClick={handleDeny}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-[13px] font-semibold text-[var(--navy)] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.7} />
                ) : (
                  <X className="h-4 w-4" strokeWidth={1.7} />
                )}
                Recusar
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2.5 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.7} />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={1.7} />
                )}
                Aprovar acesso
              </button>
            </>
          ) : (
            <span className="flex items-center font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              Decisão registrada
            </span>
          )}
        </footer>
      </section>
    </div>
  );
}

function MobileRequestCard({
  row,
  onOpen,
}: {
  row: AccessRequestRow;
  onOpen: (row: AccessRequestRow) => void;
}) {
  return (
    <article className="border border-[var(--line)] bg-[var(--paper)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-bold text-[var(--navy)]">
            {row.purpose}
          </p>

          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
            {formatRequesterType(row.requester_type)}
          </p>
        </div>

        <StatusBadge status={row.status} />
      </div>

      <div className="mt-4 border-t border-[var(--line-2)] pt-4">
        <p className="text-[13px] leading-[1.55] text-[var(--ink-60)]">
          {row.scopes}
        </p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <span className="text-[13px] font-semibold text-[var(--navy)]">
            {row.duration}
          </span>

          <DetailsLink row={row} onOpen={onOpen} />
        </div>
      </div>
    </article>
  );
}

export function PatientPermissionsList({ rows }: PatientPermissionsListProps) {
  const [query, setQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState<AccessRequestRow | null>(null);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => {
      const searchable = [
        row.purpose,
        row.requester,
        row.requester_type,
        row.scopes,
        row.duration,
        row.status,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [query, rows]);

  const approvedCount = rows.filter((row) => {
    const status = row.status.toLowerCase();
    return status === "approved" || status === "authorized";
  }).length;

  const pendingCount = rows.filter(
    (row) => row.status.toLowerCase() === "pending",
  ).length;

  const deniedCount = rows.filter((row) => {
    const status = row.status.toLowerCase();
    return status === "denied" || status === "rejected" || status === "revoked";
  }).length;

  return (
    <>
      <div className="space-y-[18px]">
        <section className="grid gap-3 md:grid-cols-3">
          <MetricCard
            label="Aprovadas"
            value={approvedCount}
            caption="permissões liberadas"
          />

          <MetricCard
            label="Pendentes"
            value={pendingCount}
            caption="aguardando decisão"
          />

          <MetricCard
            label="Recusadas"
            value={deniedCount}
            caption="solicitações negadas"
          />
        </section>

        <section className="overflow-hidden border border-[var(--line)] bg-[var(--paper)]">
          <div className="flex flex-col gap-4 border-b border-[var(--line)] bg-[var(--card)] px-5 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                Solicitações
              </p>

              <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                Solicitações de acesso
              </h2>
            </div>

            <label className="relative w-full lg:max-w-[360px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-45)]"
                strokeWidth={1.7}
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por finalidade, escopo ou status"
                className="h-10 w-full rounded-[6px] border border-[var(--line)] bg-[var(--paper)] pl-10 pr-3 text-[13px] text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)]"
              />
            </label>
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[860px] border-collapse text-left">
              <colgroup>
                <col className="w-[20%]" />
                <col className="w-[45%]" />
                <col className="w-[11%]" />
                <col className="w-[12%]" />
                <col className="w-[12%]" />
              </colgroup>

              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--card)]">
                  <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Finalidade
                  </th>

                  <th className="px-5 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Escopos
                  </th>

                  <th className="px-4 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Validade
                  </th>

                  <th className="px-4 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Status
                  </th>

                  <th className="px-4 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                    Ação
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[var(--line-2)] bg-[var(--paper)] last:border-b-0"
                    >
                      <td className="px-5 py-5 align-middle">
                        <p className="text-[15px] font-bold leading-[1.35] text-[var(--navy)]">
                          {row.purpose}
                        </p>

                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-45)]">
                          {formatRequesterType(row.requester_type)}
                        </p>
                      </td>

                      <td className="px-5 py-5 align-middle text-[14px] leading-[1.55] text-[var(--ink-60)]">
                        {row.scopes}
                      </td>

                      <td className="px-4 py-5 align-middle text-[14px] font-semibold text-[var(--navy)]">
                        {row.duration}
                      </td>

                      <td className="px-4 py-5 align-middle">
                        <StatusBadge status={row.status} />
                      </td>

                      <td className="px-4 py-5 align-middle">
                        <DetailsLink row={row} onOpen={setSelectedRow} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-[14px] text-[var(--ink-60)]"
                    >
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 md:hidden">
            {filteredRows.length > 0 ? (
              filteredRows.map((row) => (
                <MobileRequestCard
                  key={`mobile-${row.id}`}
                  row={row}
                  onOpen={setSelectedRow}
                />
              ))
            ) : (
              <div className="border border-[var(--line)] bg-[var(--paper)] p-5 text-center text-[14px] text-[var(--ink-60)]">
                Nenhuma solicitação encontrada.
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedRow ? (
        <RequestReceiptModal
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
        />
      ) : null}
    </>
  );
}