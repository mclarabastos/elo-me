"use client";

import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface AuroraBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
}

/**
 * Aurora background tuned to the ELO.ME palette
 * (#1e47ff → #3b82f6 → #60a5fa → #bdd0ff → #22d3ee → #0b1b3f).
 * Sits behind its children via z-index, content lifted by `relative z-10`.
 */
export function AuroraBackground({
  children,
  className,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) {
  return (
    <div
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute -inset-[10px] animate-[elo-aurora_60s_linear_infinite] opacity-55 blur-[60px] saturate-[1.25] mix-blend-multiply"
          style={{
            backgroundImage:
              "repeating-linear-gradient(100deg,#1e47ff 8%,#3b82f6 18%,#60a5fa 30%,#bdd0ff 42%,#22d3ee 54%,#0b1b3f 66%,#1e47ff 78%), repeating-linear-gradient(100deg,#000 0%,#000 7%,transparent 10%,transparent 12%,#000 16%)",
            backgroundSize: "300% 200%, 200% 200%",
            backgroundPosition: "50% 50%, 50% 50%",
            ...(showRadialGradient
              ? {
                  WebkitMaskImage:
                    "radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%)",
                  maskImage:
                    "radial-gradient(ellipse at 50% 40%, #000 30%, transparent 75%)",
                }
              : {}),
          }}
        />
        <div className="absolute inset-0 bg-white/55" />
      </div>

      {/* Keyframes — keep this <style> co-located so you don't need a Tailwind config change */}
      <style>{`
        @keyframes elo-aurora {
          0%   { background-position: 50% 50%, 50% 50%; }
          100% { background-position: 350% 50%, 350% 50%; }
        }
      `}</style>

      <div className="relative z-10">{children}</div>
    </div>
  );
}