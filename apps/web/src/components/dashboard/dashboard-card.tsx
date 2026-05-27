import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

type DashboardCardProps = React.ComponentProps<"div"> & {
  children: ReactNode;
  interactive?: boolean;
};

export function DashboardCard({
  children,
  className,
  interactive = false,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "border border-[var(--line)] bg-[var(--paper)] p-5",
        interactive && "transition hover:bg-[var(--card)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type DashboardMetricCardProps = {
  label: string;
  value: string | number;
  helper: string;
  className?: string;
};

export function DashboardMetricCard({
  label,
  value,
  helper,
  className,
}: DashboardMetricCardProps) {
  return (
    <DashboardCard className={className}>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
        {label}
      </p>

      <p className="mt-4 font-mono text-[30px] font-semibold tracking-[-0.04em] text-[var(--navy)]">
        {value}
      </p>

      <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
        {helper}
      </p>
    </DashboardCard>
  );
}

type DashboardDataCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  tag?: string;
  metaLabel?: string;
  metaValue?: string;
  actionLabel?: string;
  className?: string;
};

export function DashboardDataCard({
  eyebrow,
  title,
  description,
  tag,
  metaLabel,
  metaValue,
  actionLabel = "Ver",
  className,
}: DashboardDataCardProps) {
  return (
    <DashboardCard
      interactive
      className={cn(
        "flex min-h-[220px] flex-col justify-between border-b border-r border-[var(--line)]",
        className
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            {eyebrow ? (
              <p className="text-[13px] font-medium text-[var(--ink-60)]">
                {eyebrow}
              </p>
            ) : null}

            <h3 className="mt-3 text-[18px] font-bold tracking-[-0.02em] text-[var(--navy)]">
              {title}
            </h3>

            {description ? (
              <p className="mt-2 max-w-[320px] text-[13px] leading-relaxed text-[var(--ink-60)]">
                {description}
              </p>
            ) : null}
          </div>

          {tag ? (
            <span className="rounded-[6px] border border-[var(--blue)] px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--blue)]">
              {tag}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-4">
        {(metaLabel || metaValue) ? (
          <div>
            {metaLabel ? (
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                {metaLabel}
              </p>
            ) : null}

            {metaValue ? (
              <p className="mt-1 text-[13px] font-semibold text-[var(--navy)]">
                {metaValue}
              </p>
            ) : null}
          </div>
        ) : (
          <div />
        )}

        <span className="inline-flex items-center gap-2 rounded-[6px] bg-[var(--navy)] px-3 py-2 text-[12px] font-semibold text-white transition group-hover:opacity-90">
          {actionLabel}
        </span>
      </div>
    </DashboardCard>
  );
}

type DashboardPanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DashboardPanel({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={cn("border border-[var(--line)] bg-[var(--paper)]", className)}
    >
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] p-5 md:flex-row md:items-start">
        <div>
          {eyebrow ? (
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
              {eyebrow}
            </p>
          ) : null}

          <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
            {title}
          </h2>

          {description ? (
            <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
              {description}
            </p>
          ) : null}
        </div>

        {action}
      </div>

      {children}
    </section>
  );
}

type DashboardGridProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardMetricGrid({
  children,
  className,
}: DashboardGridProps) {
  return (
    <section
      className={cn(
        "grid border border-[var(--line)] bg-[var(--paper)] sm:grid-cols-2 xl:grid-cols-3",
        className
      )}
    >
      {children}
    </section>
  );
}

export function DashboardDataGrid({ children, className }: DashboardGridProps) {
  return (
    <div className={cn("grid sm:grid-cols-2 xl:grid-cols-3", className)}>
      {children}
    </div>
  );
}

type DashboardActionLinkProps = {
  children: ReactNode;
  className?: string;
};

export function DashboardActionLink({
  children,
  className,
}: DashboardActionLinkProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)]",
        className
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
    </span>
  );
}