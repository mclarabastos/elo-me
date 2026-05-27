"use client";

import { ArrowRight, FileCheck2, Fingerprint, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export function ProtocolTrust() {
  return (
    <section
      id="consentimento"
      className="relative border-t border-[rgba(11,27,63,0.10)] px-9 pb-[70px] pt-[110px]"
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-12">
        <header className="mx-auto flex max-w-[760px] flex-col items-center gap-[18px] text-center">
          <span className="inline-flex items-center rounded-full border border-[rgba(11,27,63,0.10)] bg-white px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px] font-semibold uppercase tracking-[0.16em] text-[#1E47FF]">
            Protocolo de confiança
          </span>
          <h2
            className="text-balance font-bold leading-[1.05] tracking-[-0.025em] text-[#0B1B3F]"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Controle, rastreabilidade e{" "}
            <span className="text-[#1E47FF]">consentimento</span> em uma única
            experiência.
          </h2>
          <p className="max-w-[640px] text-pretty text-[17px] leading-[1.55] text-[rgba(11,27,63,0.62)]">
            O ELO.ME conecta pacientes, clínicas e auditoria em um fluxo seguro
            para compartilhamento de dados de saúde.
          </p>
        </header>

        <Tabs defaultValue="consent" className="flex flex-col items-center gap-12">
          <TabsList
            className="inline-flex h-auto flex-wrap justify-center gap-1 rounded-full border border-[rgba(11,27,63,0.10)] bg-white p-1.5"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}
          >
            {[
              { v: "consent", icon: <ShieldCheck className="size-4" />, label: "Consentimento granular" },
              { v: "audit", icon: <FileCheck2 className="size-4" />, label: "Auditoria on-chain" },
              { v: "identity", icon: <Fingerprint className="size-4" />, label: "Identidade segura" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-[rgba(11,27,63,0.62)] transition-all",
                  "hover:text-[#0B1B3F]",
                  "data-[state=active]:bg-[#0B1B3F] data-[state=active]:text-white",
                )}
              >
                <span className="text-[rgba(11,27,63,0.45)] group-data-[state=active]:text-[#BDD0FF]">
                  {t.icon}
                </span>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="consent" className="w-full focus-visible:outline-none">
            <Panel
              kicker="01 — Consentimento granular"
              title="Compartilhe apenas o necessário."
              desc="O paciente escolhe quais dados liberar, por quanto tempo e para qual finalidade. Cada permissão é explícita, revogável e auditável."
              cta="Ver fluxo de consentimento"
              visual={<ConsentVisual />}
            />
          </TabsContent>
          <TabsContent value="audit" className="w-full focus-visible:outline-none">
            <Panel
              kicker="02 — Auditoria on-chain"
              title="Cada acesso deixa um rastro verificável."
              desc="Eventos de acesso, expiração e revogação são exibidos como uma linha do tempo auditável, ancorada via Chainlink CRE."
              cta="Ver auditoria"
              visual={<AuditVisual />}
            />
          </TabsContent>
          <TabsContent value="identity" className="w-full focus-visible:outline-none">
            <Panel
              kicker="03 — Identidade segura"
              title="Identidade verificada para pacientes e clínicas."
              desc="Wallet, credenciais e permissões trabalham juntas para reduzir acesso indevido e garantir que cada parte seja quem diz ser."
              cta="Ver identidade"
              visual={<IdentityVisual />}
            />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function Panel({
  kicker,
  title,
  desc,
  cta,
  visual,
}: {
  kicker: string;
  title: string;
  desc: string;
  cta: string;
  visual: ReactNode;
}) {
  return (
    <div
      className="grid grid-cols-1 items-center gap-10 rounded-[22px] border border-[rgba(11,27,63,0.10)] bg-white p-8 lg:grid-cols-2 lg:gap-14 lg:p-11"
      style={{ boxShadow: "0 30px 60px -50px rgba(11,27,63,0.20)" }}
    >
      <div className="flex flex-col gap-5">
        <span className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[rgba(11,27,63,0.45)]">
          {kicker}
        </span>
        <h3
          className="text-balance font-bold leading-[1.1] tracking-[-0.02em] text-[#0B1B3F]"
          style={{ fontSize: "clamp(24px, 2.6vw, 36px)" }}
        >
          {title}
        </h3>
        <p className="text-pretty text-base leading-[1.55] text-[rgba(11,27,63,0.62)]">
          {desc}
        </p>
        <div>
          <Button className="group rounded-full bg-[#1E47FF] text-white hover:bg-[#1638E0]">
            {cta} <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </div>
      <Frame>{visual}</Frame>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-[18px] border border-[rgba(11,27,63,0.10)]"
      style={{
        aspectRatio: "5/4",
        background:
          "radial-gradient(600px 320px at 50% 110%, #DCE6FF 0%, transparent 60%), linear-gradient(180deg, #F4F7FE 0%, #E9EFFA 100%)",
      }}
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(rgba(11,27,63,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(11,27,63,0.05) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, #000 30%, transparent 80%)",
        }}
      />
      <div className="relative flex size-full flex-col gap-3 p-5">{children}</div>
    </div>
  );
}

/* ----------------------------- Visuals ---------------------------------- */

const consentScopes = [
  { label: "Exames laboratoriais", on: true, ttl: "24h" },
  { label: "Prontuário cardiológico", on: true, ttl: "consulta única" },
  { label: "Histórico de internações", on: false, ttl: "—" },
  { label: "Imagem · ressonância", on: true, ttl: "48h" },
];

function ConsentVisual() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(11,27,63,0.45)]">
          Solicitação de acesso
        </span>
        <span className="rounded-full bg-[rgba(30,71,255,0.08)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1E47FF]">
          Hospital São Lucas
        </span>
      </div>
      <div className="rounded-xl border border-[rgba(11,27,63,0.10)] bg-white px-3.5 py-3 text-xs text-[rgba(11,27,63,0.62)]">
        Dr. M. Andrade · Cardiologia · finalidade clínica
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {consentScopes.map((s) => (
          <div
            key={s.label}
            className="flex items-center justify-between rounded-[10px] border border-[rgba(11,27,63,0.10)] bg-white px-3.5 py-2.5"
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex h-4 w-[30px] items-center rounded-full p-0.5 transition-colors",
                  s.on ? "bg-[#1E47FF]" : "bg-[rgba(11,27,63,0.15)]",
                )}
              >
                <span
                  className={cn(
                    "size-3 rounded-full bg-white shadow-sm transition-transform",
                    s.on && "translate-x-[14px]",
                  )}
                />
              </span>
              <span className="text-[13px] font-semibold text-[#0B1B3F]">{s.label}</span>
            </div>
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.06em] text-[rgba(11,27,63,0.45)]">
              {s.ttl}
            </span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mt-1 self-start rounded-full bg-[#0B1B3F] px-4 py-2 text-xs font-semibold text-white"
      >
        Assinar consentimento
      </button>
    </>
  );
}

const auditEvents = [
  { t: "14:32", who: "Dr. M. Andrade", scope: "ECG · 48h", state: "ok", hash: "0x1432…" },
  { t: "11:18", who: "Laboratório Vita", scope: "Hemograma", state: "pending", hash: "0x1118…" },
  { t: "09:04", who: "Operadora Conexa", scope: "Internações", state: "denied", hash: "0x0904…" },
  { t: "08:47", who: "Dra. R. Salem", scope: "Prontuário", state: "ok", hash: "0x0847…" },
] as const;

const dotColor = {
  ok: "bg-[#1FAE6A]",
  pending: "bg-[#F0A02B]",
  denied: "bg-[#D54040]",
};

function AuditVisual() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(11,27,63,0.45)]">
          Trilha de auditoria
        </span>
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[#1E47FF]">
          Chainlink CRE
        </span>
      </div>
      <div className="relative flex flex-1 flex-col gap-2.5 pl-5">
        <span aria-hidden className="absolute bottom-1.5 left-[6px] top-1.5 w-px bg-[rgba(11,27,63,0.10)]" />
        {auditEvents.map((e) => (
          <div key={e.t} className="relative rounded-xl border border-[rgba(11,27,63,0.10)] bg-white px-3 py-2.5">
            <span
              className={cn(
                "absolute -left-5 top-3.5 size-2.5 rounded-full ring-4 ring-[#F4F7FE]",
                dotColor[e.state],
              )}
            />
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-[#0B1B3F]">{e.who}</div>
                <div className="text-[11px] text-[rgba(11,27,63,0.45)]">{e.scope}</div>
              </div>
              <div className="text-right">
                <div className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(11,27,63,0.45)]">{e.t}</div>
                <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.06em] text-[rgba(11,27,63,0.30)]">
                  {e.hash}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function IdentityVisual() {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.16em] text-[rgba(11,27,63,0.45)]">
          Identidade ELO
        </span>
        <span className="rounded-full bg-[rgba(31,174,106,0.10)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1FAE6A]">
          Verificado
        </span>
      </div>
      <div className="rounded-2xl border border-[rgba(11,27,63,0.10)] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="relative size-[46px] shrink-0 rounded-full bg-gradient-to-br from-[#1E47FF] to-[#BDD0FF]">
            <span className="absolute inset-1 rounded-full border-[1.5px] border-white/70" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-bold text-[#0B1B3F]">Carolina Mendes</div>
            <div className="font-[family-name:var(--font-mono)] text-[11px] text-[rgba(11,27,63,0.45)]">
              did:elo:0x9af3…b21c
            </div>
          </div>
          <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.10em] text-[#1E47FF]">
            Wallet
          </span>
        </div>
        <div className="mt-3.5 grid grid-cols-2 gap-2 text-[11px]">
          {[
            { k: "Credencial", v: "CPF · CNS · biometria" },
            { k: "Permissões", v: "4 ativas · 2 expiradas" },
          ].map((c) => (
            <div key={c.k} className="rounded-lg border border-[rgba(11,27,63,0.10)] bg-[rgba(220,230,255,0.30)] px-3 py-2">
              <div className="font-[family-name:var(--font-mono)] uppercase tracking-[0.10em] text-[rgba(11,27,63,0.45)]">
                {c.k}
              </div>
              <div className="mt-0.5 font-semibold text-[#0B1B3F]">{c.v}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-2">
        {["Paciente", "Clínica", "Auditor"].map((role, i) => (
          <div
            key={role}
            className={cn(
              "flex min-h-[76px] flex-col justify-between rounded-xl border border-[rgba(11,27,63,0.10)] bg-white p-3",
              i === 0 && "shadow-[0_0_0_2px_#1E47FF,0_0_0_4px_#F4F7FE]",
            )}
          >
            <span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.10em] text-[rgba(11,27,63,0.45)]">
              Papel
            </span>
            <span className="text-[13px] font-bold text-[#0B1B3F]">{role}</span>
          </div>
        ))}
      </div>
    </>
  );
}