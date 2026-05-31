"use client";

import { Check, X } from "lucide-react";

type SuccessModalProps = {
  open: boolean;
  title: string;
  description?: string;
  metadata?: string;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  onClose: () => void;
};

export function SuccessModal({
  open,
  title,
  description,
  metadata,
  primaryActionLabel = "Continuar",
  onPrimaryAction,
  onClose,
}: SuccessModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[rgba(11,27,63,0.34)] px-4 backdrop-blur-[6px]">
      <div className="relative w-full max-w-[380px] border border-[var(--line)] bg-[var(--paper)] p-6 text-center shadow-[0_30px_90px_-40px_rgba(11,27,63,0.65)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-45)] transition hover:bg-[var(--card)] hover:text-[var(--navy)]"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(31,174,106,0.10)] text-[var(--success)]">
          <Check className="h-5 w-5" strokeWidth={2} />
        </div>

        <h2 className="mt-5 text-[20px] font-bold tracking-[-0.02em] text-[var(--navy)]">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ink-60)]">
            {description}
          </p>
        ) : null}

        {metadata ? (
          <p className="mt-4 rounded-[6px] border border-[var(--line)] bg-[var(--card)] px-3 py-2 font-mono text-[11px] font-semibold text-[var(--ink-60)]">
            {metadata}
          </p>
        ) : null}

        <button
          type="button"
          onClick={onPrimaryAction ?? onClose}
          className="mt-6 inline-flex w-full items-center justify-center rounded-[6px] bg-[var(--navy)] px-4 py-3 text-[13px] font-semibold text-white transition hover:opacity-90"
        >
          {primaryActionLabel}
        </button>
      </div>
    </div>
  );
}