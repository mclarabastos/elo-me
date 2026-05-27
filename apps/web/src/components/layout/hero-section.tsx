import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Sparkle({ filled = true, className }: { filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        d="M12 2 L13.6 9 C13.9 10.3 14.7 11.1 16 11.4 L23 13 L16 14.6 C14.7 14.9 13.9 15.7 13.6 17 L12 24 L10.4 17 C10.1 15.7 9.3 14.9 8 14.6 L1 13 L8 11.4 C9.3 11.1 10.1 10.3 10.4 9 Z"
        fill={filled ? "currentColor" : "none"}
        stroke={filled ? "none" : "currentColor"}
        strokeWidth={filled ? undefined : 1.5}
        strokeLinejoin={filled ? undefined : "round"}
      />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-9 pt-[90px] text-center">
      <AuroraBackground className="absolute inset-0">{null}</AuroraBackground>

      {/* sparkle decorations */}
      <Sparkle className="absolute left-[7%] top-[12%] size-[18px] text-[#1E47FF] opacity-50" />
      <Sparkle filled={false} className="absolute right-[9%] top-[20%] size-[22px] text-[#1E47FF] opacity-50" />
      <Sparkle className="absolute left-[18%] top-[56%] size-[14px] text-[#1E47FF] opacity-40" />
      <Sparkle filled={false} className="absolute right-[16%] top-[60%] size-[16px] text-[#1E47FF] opacity-45" />

      <div className="relative z-10">
        <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[rgba(11,27,63,0.10)] bg-white px-3.5 py-1.5 font-[family-name:var(--font-mono)] text-[11px] font-medium uppercase tracking-[0.14em] text-[rgba(11,27,63,0.62)]">
          <span className="size-1.5 rounded-full bg-[#1E47FF] shadow-[0_0_0_4px_rgba(30,71,255,0.12)]" />
          Identidade digital em saúde · Web3
        </div>

        <h1
          className="mx-auto max-w-[1080px] text-balance font-bold leading-[1.02] tracking-[-0.025em] text-[#0B1B3F]"
          style={{ fontSize: "clamp(40px, 5.4vw, 76px)" }}
        >
          Seus dados clínicos,
          <br />
          sob <span className="text-[#1E47FF]">seu consentimento</span>
          <Sparkle className="ml-1 inline-block size-[42px] -translate-y-1 text-[#1E47FF]" />
        </h1>

        <p className="mx-auto mt-7 max-w-[640px] text-pretty text-[17px] leading-[1.55] text-[rgba(11,27,63,0.62)]">
          A ELO.ME é a infraestrutura de identidade digital em saúde que devolve ao paciente o controle total sobre quem acessa, quando acessa e por quanto tempo — com auditoria verificável on-chain via Chainlink CRE.
        </p>

        <div className="mt-9 inline-flex gap-3">
          <Button
            asChild
            className="rounded-full bg-[#1E47FF] px-[22px] py-[14px] text-[15px] font-semibold text-white hover:bg-[#1638E0]"
          >
            <Link href="#consentimento">
              Criar identidade ELO <ArrowRight className="ml-2 size-3.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="rounded-full border-[rgba(11,27,63,0.10)] bg-transparent px-[22px] py-[14px] text-[15px] font-semibold text-[#0B1B3F] hover:bg-white"
          >
            <Link href="#contato">Falar com nosso time</Link>
          </Button>
        </div>

        <HeroVisual />
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div
      className="relative mx-9 mt-16 min-h-[360px] overflow-hidden rounded-[22px] border border-[rgba(11,27,63,0.10)]"
      style={{
        aspectRatio: "16 / 8",
        background:
          "radial-gradient(800px 400px at 50% 120%, #B8C7F0 0%, transparent 60%), linear-gradient(180deg, #EDF1FB 0%, #DDE6F6 100%)",
      }}
    >
      {/* grid mask */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(11,27,63,0.05) 0 1px, transparent 1px 80px), repeating-linear-gradient(0deg, rgba(11,27,63,0.05) 0 1px, transparent 1px 80px)",
          mask: "radial-gradient(700px 350px at 50% 50%, transparent 30%, #000 70%)",
          WebkitMask:
            "radial-gradient(700px 350px at 50% 50%, transparent 30%, #000 70%)",
        }}
      />
      {/* floor */}
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-b from-transparent to-[#C9D5EC]/100" />

      {/* connector lines */}
      <svg className="pointer-events-none absolute inset-0 size-full" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1E47FF" stopOpacity="0" />
            <stop offset="50%" stopColor="#1E47FF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1E47FF" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[
          "M 240 240 Q 420 250 540 300",
          "M 960 200 Q 800 240 660 300",
          "M 970 450 Q 820 400 660 340",
          "M 230 470 Q 400 420 540 340",
        ].map((d) => (
          <path key={d} d={d} stroke="url(#lg)" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
        ))}
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div className="relative w-[360px] -translate-y-1.5">
          <Satellite className="left-[-150px] top-[18%]" label="Hospital São Lucas" value="Acesso autorizado · 24h" pip="green" />
          <Satellite className="right-[-160px] top-[8%]" label="Laboratório Vita" value="Aguardando consentimento" pip="amber" />
          <Satellite className="right-[-130px] bottom-[6%]" label="Auditoria on-chain" value="Chainlink CRE · verified" />
          <Satellite className="left-[-130px] bottom-[-2%]" label="Última leitura" value="Dr. M. Andrade · cardio" pip="green" />

          <div
            className="relative z-[3] rounded-[18px] border border-[rgba(11,27,63,0.10)] bg-white px-5 py-4.5"
            style={{ boxShadow: "0 30px 60px -30px rgba(11,27,63,0.35)" }}
          >
            <div className="flex items-center justify-between gap-3.5">
              <div className="flex items-center gap-3">
                <div className="relative size-[42px] rounded-full bg-gradient-to-br from-[#1E47FF] to-[#BDD0FF]">
                  <span className="absolute inset-1 rounded-full border-[1.5px] border-white" style={{ mask: "radial-gradient(circle, transparent 55%, #000 56%)", WebkitMask: "radial-gradient(circle, transparent 55%, #000 56%)" }} />
                </div>
                <div className="leading-[1.1] text-left">
                  <b className="block text-[14px] font-bold text-[#0B1B3F]">Carolina Mendes</b>
                  <small className="font-[family-name:var(--font-mono)] text-[10.5px] tracking-[0.05em] text-[rgba(11,27,63,0.45)]">
                    did:elo:0x9af3…b21c
                  </small>
                </div>
              </div>
              <span className="rounded-full bg-[rgba(30,71,255,0.08)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-[10px] font-semibold uppercase tracking-[0.06em] text-[#1E47FF]">
                Identidade ELO
              </span>
            </div>
            <div className="mt-3.5 flex justify-between gap-3 border-t border-dashed border-[rgba(11,27,63,0.10)] pt-3 font-[family-name:var(--font-mono)] text-[11px] tracking-[0.04em] text-[rgba(11,27,63,0.45)]">
              <span>ÚLT. ACESSO <b className="font-semibold text-[#0B1B3F]">há 12 min</b></span>
              <span>PERMISSÕES ATIVAS <b className="font-semibold text-[#0B1B3F]">4</b></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Satellite({
  label,
  value,
  pip,
  className,
}: {
  label: string;
  value: string;
  pip?: "green" | "amber";
  className?: string;
}) {
  const pipColor =
    pip === "green" ? "bg-[#1FAE6A]" : pip === "amber" ? "bg-[#F0A02B]" : "bg-[#1E47FF]";
  return (
    <div
      className={cn(
        "absolute z-[2] hidden min-w-[188px] rounded-[14px] border border-[rgba(11,27,63,0.10)] bg-white p-3 text-[12px] text-[#0B1B3F] xl:block",
        className,
      )}
      style={{ boxShadow: "0 20px 50px -30px rgba(11,27,63,0.30)" }}
    >
      <div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.08em] text-[rgba(11,27,63,0.45)]">
        {label}
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[13px] font-bold">
        <span className={cn("size-2 rounded-full", pipColor)} />
        {value}
      </div>
    </div>
  );
}