import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";

function Sparkle({
  filled = true,
  className,
}: {
  filled?: boolean;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
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
    <section className="relative overflow-hidden px-9 pb-[64px] pt-[85px] text-center">
      <AuroraBackground className="absolute inset-0">{null}</AuroraBackground>

      {/* sparkle decorations */}
      <Sparkle className="absolute left-[7%] top-[12%] size-[18px] text-[var(--color-brand-blue)] opacity-50" />
      <Sparkle
        filled={false}
        className="absolute right-[9%] top-[20%] size-[22px] text-[var(--color-brand-blue)] opacity-50"
      />
      <Sparkle className="absolute left-[18%] top-[56%] size-[14px] text-[var(--color-brand-blue)] opacity-40" />
      <Sparkle
        filled={false}
        className="absolute right-[16%] top-[60%] size-[16px] text-[var(--color-brand-blue)] opacity-45"
      />

      <div className="relative z-10">
        <div aria-hidden="true" className="mb-7 h-[34px]" />

        <h1
          className="mx-auto max-w-[1080px] text-balance font-bold leading-[1.02] tracking-[-0.025em] text-brand-navy"
          style={{ fontSize: "clamp(40px, 5.4vw, 76px)" }}
        >
          Seus dados médicos,
          <br />
          sob{" "}
          <span className="text-[var(--color-brand-blue)]">
            seu consentimento
          </span>
          <Sparkle className="ml-1 inline-block size-[42px] -translate-y-1 text-[var(--color-brand-blue)]" />
        </h1>

        <p className="mx-auto mt-7 max-w-[640px] text-pretty text-[17px] leading-[1.55] text-text-muted">
          A Elo.me ajuda pacientes, clínicas e profissionais de saúde a controlar, autorizar e registrar o acesso a
          prontuários e documentos médicos, com consentimento claro, prazo definido e histórico verificável.
        </p>

        <div className="mt-9 inline-flex flex-col gap-3 sm:flex-row">
          <Button
            asChild
            className="rounded-full bg-[var(--color-brand-blue)] px-[22px] py-[14px] text-[15px] font-semibold text-white hover:bg-[#1638E0]"
          >
            <Link href="/auth/login">
              Criar identidade <ArrowRight className="ml-2 size-3.5" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="rounded-full border-border-subtle bg-transparent px-[22px] py-[14px] text-[15px] font-semibold text-brand-navy transition-colors hover:border-border-subtle hover:bg-[var(--color-background-card)] hover:text-[var(--color-text-primary)]"
          >
            <Link href="#workflow">Ver demonstração</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}