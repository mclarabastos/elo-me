"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Search,
  ShieldCheck,
} from "lucide-react";

import type { NotificationResponse } from "@/types/api";
import { cn } from "@/lib/utils";

type NotificationRole = "patient" | "doctor" | "clinic";
type NotificationFilter = "all" | "unread" | "access_request" | "audit";

type NotificationsListProps = {
  title: string;
  description: string;
  notifications: NotificationResponse[];
  role: NotificationRole;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getNotificationHref(
  notification: NotificationResponse,
  role: NotificationRole,
) {
  if (role === "patient") {
    return "/patient/permissions";
  }

  if (role === "doctor") {
    return "/doctor/records";
  }

  if (role === "clinic") {
    return "/clinic/records";
  }

  return "#";
}

function getActionLabel(role: NotificationRole) {
  if (role === "patient") {
    return "Revisar solicitação";
  }

  if (role === "doctor") {
    return "Ver dados autorizados";
  }

  return "Ver registros";
}

function getRoleCopy(role: NotificationRole) {
  if (role === "patient") {
    return {
      eyebrow: "Paciente",
      emptyTitle: "Nenhuma solicitação recebida por enquanto",
      emptyDescription:
        "Quando uma clínica ou profissional solicitar acesso ao seu prontuário, a notificação aparecerá aqui.",
    };
  }

  if (role === "doctor") {
    return {
      eyebrow: "Profissional",
      emptyTitle: "Nenhuma atualização de acesso por enquanto",
      emptyDescription:
        "Quando um paciente aprovar ou limitar uma solicitação, a atualização aparecerá aqui.",
    };
  }

  return {
    eyebrow: "Clínica",
    emptyTitle: "Nenhuma atualização operacional por enquanto",
    emptyDescription:
      "Quando houver resposta de paciente, solicitação ou registro autorizado, a notificação aparecerá aqui.",
  };
}

function getNotificationTypeLabel(type: string) {
  if (type === "access_request") {
    return "Solicitação de acesso";
  }

  if (type === "audit") {
    return "Auditoria";
  }

  if (type === "consent") {
    return "Consentimento";
  }

  return "Atualização";
}

function getNotificationIcon(type: string, isUnread: boolean) {
  const iconClassName = "h-4 w-4";
  const strokeWidth = 1.6;

  if (type === "access_request") {
    return <FileCheck2 className={iconClassName} strokeWidth={strokeWidth} />;
  }

  if (type === "audit") {
    return <ShieldCheck className={iconClassName} strokeWidth={strokeWidth} />;
  }

  if (isUnread) {
    return <Bell className={iconClassName} strokeWidth={strokeWidth} />;
  }

  return <CheckCircle2 className={iconClassName} strokeWidth={strokeWidth} />;
}

export function NotificationsList({
  title,
  description,
  notifications,
  role,
}: NotificationsListProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<NotificationFilter>("all");

  const roleCopy = getRoleCopy(role);

  const unreadCount = notifications.filter(
    (notification) => notification.status === "unread",
  ).length;

  const accessRequestCount = notifications.filter(
    (notification) => notification.type === "access_request",
  ).length;

  const auditCount = notifications.filter(
    (notification) => notification.type === "audit",
  ).length;

  const filteredNotifications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return notifications.filter((notification) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && notification.status === "unread") ||
        (filter === "access_request" &&
          notification.type === "access_request") ||
        (filter === "audit" && notification.type === "audit");

      const matchesQuery =
        normalizedQuery.length === 0 ||
        notification.title.toLowerCase().includes(normalizedQuery) ||
        notification.message.toLowerCase().includes(normalizedQuery) ||
        notification.type.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, notifications, query]);

  const filters: {
    id: NotificationFilter;
    label: string;
    count: number;
  }[] = [
    {
      id: "all",
      label: "Todas",
      count: notifications.length,
    },
    {
      id: "unread",
      label: "Não lidas",
      count: unreadCount,
    },
    {
      id: "access_request",
      label: "Solicitações",
      count: accessRequestCount,
    },
    {
      id: "audit",
      label: "Auditoria",
      count: auditCount,
    },
  ];

  return (
    <div className="space-y-[18px]">
      <section>

        <h1 className="mt-4 text-balance text-[30px] font-bold leading-[1.06] tracking-[-0.025em] text-[var(--navy)] sm:text-[36px] md:text-[42px]">
          {title}
        </h1>

        {description ? (
          <p className="mt-3 max-w-[660px] text-[15px] leading-[1.55] text-[var(--ink-60)]">
            {description}
          </p>
        ) : null}
      </section>

      <section className="border border-[var(--line)] bg-[var(--paper)]">
        <div className="border-b border-[var(--line)] bg-[var(--card)] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]">
                Central
              </p>

              <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                Notificações recentes
              </h2>
            </div>

            <div className="relative w-full lg:max-w-[320px]">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-45)]"
                strokeWidth={1.6}
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar notificação"
                className="h-10 w-full rounded-[6px] border border-[var(--line)] bg-[var(--paper)] pl-10 pr-3 text-[13px] text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)]"
              />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((item) => {
              const isActive = filter === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-[6px] border px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition",
                    isActive
                      ? "border-[var(--navy)] bg-[var(--navy)] text-white"
                      : "border-[var(--line)] bg-[var(--paper)] text-[var(--ink-60)] hover:bg-[var(--card)] hover:text-[var(--navy)]",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      isActive ? "text-white/70" : "text-[var(--ink-45)]",
                    )}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-5">
            <div className="border border-dashed border-[var(--line)] bg-[var(--card)] px-5 py-8 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--paper)] text-[var(--blue)]">
                <Bell className="h-4 w-4" strokeWidth={1.6} />
              </div>

              <h2 className="mt-4 text-[15px] font-bold text-[var(--navy)]">
                {query || filter !== "all"
                  ? "Nenhuma notificação encontrada"
                  : roleCopy.emptyTitle}
              </h2>

              <p className="mx-auto mt-2 max-w-[420px] text-[13px] leading-relaxed text-[var(--ink-60)]">
                {query || filter !== "all"
                  ? "Tente ajustar os filtros ou buscar por outro termo."
                  : roleCopy.emptyDescription}
              </p>
            </div>
          </div>
        ) : (
          <div>
            {filteredNotifications.map((notification) => {
              const isUnread = notification.status === "unread";
              const href = getNotificationHref(notification, role);
              const typeLabel = getNotificationTypeLabel(notification.type);

              return (
                <article
                  key={notification.id}
                  className={cn(
                    "grid gap-4 border-b border-[var(--line-2)] px-5 py-5 last:border-b-0 lg:grid-cols-[1fr_auto] lg:items-center",
                    isUnread ? "bg-[rgba(30,71,255,0.035)]" : "bg-[var(--paper)]",
                  )}
                >
                  <div className="flex gap-4">
                    <div
                      className={cn(
                        "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center border",
                        isUnread
                          ? "border-[rgba(30,71,255,0.18)] bg-[rgba(30,71,255,0.08)] text-[var(--blue)]"
                          : "border-[var(--line)] bg-[var(--card)] text-[var(--ink-45)]",
                      )}
                    >
                      {getNotificationIcon(notification.type, isUnread)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="border border-[var(--line)] bg-[var(--card)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--ink-45)]">
                          {typeLabel}
                        </span>

                        {isUnread ? (
                          <span className="border border-[rgba(30,71,255,0.18)] bg-white px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)]">
                            Nova
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 text-[15px] font-bold leading-snug text-[var(--navy)]">
                        {notification.title}
                      </h3>

                      <p className="mt-2 max-w-[820px] text-[13.5px] leading-relaxed text-[var(--ink-60)]">
                        {notification.message}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-3 text-[12px] text-[var(--ink-45)]">
                        <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.08em]">
                          <Clock className="h-3.5 w-3.5" strokeWidth={1.6} />
                          {formatDate(notification.created_at)}
                        </span>

                        <span className="font-mono uppercase tracking-[0.08em]">
                          {notification.channel}
                        </span>

                        {notification.related_access_request_id ? (
                          <span className="font-mono uppercase tracking-[0.08em]">
                            {notification.related_access_request_id}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={href}
                    className="inline-flex w-fit items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-2 text-[13px] font-semibold text-white transition hover:opacity-90"
                  >
                    {getActionLabel(role)}
                    <ExternalLink className="h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}