import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

const rows = [
  { t: "14:32", who: "Dr. M. Andrade", role: "Hospital São Lucas · Cardiologia", scope: "Eletrocardiograma · 48h", hash: "0x9af3…b21c", state: "ok", stateLabel: "Autorizado", action: "Detalhes →" },
  { t: "11:18", who: "Laboratório Vita", role: "Setor de análises clínicas", scope: "Hemograma completo · 24h", hash: "0x7c12…d40a", state: "pending", stateLabel: "Pendente", action: "Revisar →" },
  { t: "09:04", who: "Operadora Conexa Saúde", role: "Pré-autorização", scope: "Histórico de internações", hash: "0x2bd9…f0e1", state: "denied", stateLabel: "Negado", action: "Motivo →" },
  { t: "08:47", who: "Dra. R. Salem", role: "Clínica integrada", scope: "Consulta única · prontuário", hash: "0xa1cc…9b3f", state: "ok", stateLabel: "Autorizado", action: "Detalhes →" },
] as const;

const pip = {
  ok: "bg-[#1FAE6A]",
  pending: "bg-[#F0A02B]",
  denied: "bg-[#D54040]",
};

export function Web3Ledger() {
  return (
    <>
      <section className="border-t border-[rgba(11,27,63,0.10)] px-9 py-[120px] pb-[60px] text-center" id="web3">
        <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[rgba(11,27,63,0.45)]">
          — 02 — Infraestrutura
        </div>
        <h2
          className="my-5 font-bold leading-tight tracking-[-0.02em] text-[#0B1B3F]"
          style={{ fontSize: "clamp(36px, 4.2vw, 56px)" }}
        >
          Verificável <span className="text-[#1E47FF]">on-chain.</span>
        </h2>
        <Sparkles
          className="mx-auto mt-3.5 size-14 text-[#1E47FF]"
          style={{ filter: "drop-shadow(0 8px 18px rgba(30,71,255,0.25))" }}
        />
      </section>

      <section className="border-t border-[rgba(11,27,63,0.10)] px-[72px] pb-[90px] pt-[70px]">
        <header className="mb-10 flex flex-col items-end justify-between gap-10 sm:flex-row sm:items-end">
          <h3
            className="m-0 max-w-[720px] text-balance font-bold leading-[1.05] tracking-[-0.02em] text-[#0B1B3F]"
            style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
          >
            Trilha de auditoria pública, identidade{" "}
            <span className="text-[#1E47FF]">privada.</span>
          </h3>
          <div className="text-right font-[family-name:var(--font-mono)] text-[11px] uppercase leading-[1.6] tracking-[0.14em] text-[rgba(11,27,63,0.45)]">
            Powered by
            <br />
            <span className="text-[#0B1B3F]">Chainlink CRE</span>
            <br />
            Cross-chain runtime
          </div>
        </header>

        <div className="overflow-hidden rounded-[22px] border border-[rgba(11,27,63,0.10)] bg-white">
          <div className="grid grid-cols-[90px_1.4fr_1fr_1fr_120px_110px] border-b border-[rgba(11,27,63,0.10)] bg-gradient-to-b from-[#F8FAFF] to-white px-5 py-3.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[rgba(11,27,63,0.45)]">
            <div>Tempo</div>
            <div>Requisitante</div>
            <div>Escopo</div>
            <div>Hash</div>
            <div>Status</div>
            <div>Ação</div>
          </div>
          {rows.map((r) => (
            <div
              key={r.t}
              className="grid grid-cols-[90px_1.4fr_1fr_1fr_120px_110px] items-center border-b border-[rgba(11,27,63,0.06)] px-5 py-4 text-[13.5px] last:border-b-0"
            >
              <div className="font-[family-name:var(--font-mono)] text-xs text-[rgba(11,27,63,0.62)]">
                {r.t}
              </div>
              <div className="font-semibold text-[#0B1B3F]">
                {r.who}
                <small className="block text-xs font-medium text-[rgba(11,27,63,0.45)]">{r.role}</small>
              </div>
              <div className="text-[#0B1B3F]">{r.scope}</div>
              <div className="font-[family-name:var(--font-mono)] text-xs text-[#1E47FF]">{r.hash}</div>
              <div className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[#0B1B3F]">
                <span className={cn("size-[7px] rounded-full", pip[r.state])} />
                {r.stateLabel}
              </div>
              <a href="#" className="text-xs font-semibold text-[#1E47FF]">{r.action}</a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}