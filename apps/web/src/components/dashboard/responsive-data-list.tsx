"use client";

import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export type ResponsiveDataColumn<T> = {
  key: keyof T;
  header: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  width?: string;
};

type ResponsiveDataListProps<T extends Record<string, unknown>> = {
  data: T[];
  columns: ResponsiveDataColumn<T>[];
  mobileRender: (row: T, index: number) => React.ReactNode;
  title?: string;
  description?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
};

export function ResponsiveDataList<T extends Record<string, unknown>>({
  data,
  columns,
  mobileRender,
  title,
  description,
  searchable = true,
  searchPlaceholder = "Buscar...",
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Quando houver dados disponíveis, eles aparecerão aqui.",
  className,
}: ResponsiveDataListProps<T>) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: "asc" | "desc";
  }>({
    key: null,
    direction: "asc",
  });

  const filteredData = useMemo(() => {
    if (!search.trim()) {
      return data;
    }

    const normalizedSearch = search.toLowerCase();

    return data.filter((row) =>
      columns.some((column) => {
        const value = row[column.key];

        if (value === null || value === undefined) {
          return false;
        }

        return String(value).toLowerCase().includes(normalizedSearch);
      })
    );
  }, [columns, data, search]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) {
      return filteredData;
    }

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!];
      const bValue = b[sortConfig.key!];

      const aString = String(aValue ?? "");
      const bString = String(bValue ?? "");

      if (aString < bString) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }

      if (aString > bString) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }

      return 0;
    });
  }, [filteredData, sortConfig]);

  function handleSort(key: keyof T) {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  return (
    <section
      className={cn(
        "rounded-[22px] border border-[var(--line)] bg-[var(--paper)]",
        className
      )}
      style={{
        boxShadow: "var(--shadow-card)",
      }}
    >
      {(title || description || searchable) && (
        <div className="flex flex-col gap-4 border-b border-[var(--line)] p-5 sm:p-[22px] lg:flex-row lg:items-center lg:justify-between">
          {(title || description) && (
            <div>
              {title ? (
                <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[var(--navy)]">
                  {title}
                </h2>
              ) : null}

              {description ? (
                <p className="mt-1 text-[13px] leading-relaxed text-[var(--ink-60)]">
                  {description}
                </p>
              ) : null}
            </div>
          )}

          {searchable ? (
            <div className="relative w-full lg:max-w-[320px]">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-45)]"
                strokeWidth={1.6}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full rounded-full border border-[var(--line)] bg-[var(--card)] pl-10 pr-4 text-[13px] text-[var(--navy)] outline-none transition placeholder:text-[var(--ink-45)] focus:border-[var(--blue)] focus:ring-4 focus:ring-[rgba(30,71,255,0.12)]"
              />
            </div>
          ) : null}
        </div>
      )}

      {sortedData.length > 0 ? (
        <>
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="border-b border-[var(--line)] bg-[var(--card)]">
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      style={column.width ? { width: column.width } : undefined}
                      className={cn(
                        "px-5 py-4 text-left font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-45)]",
                        column.sortable &&
                          "cursor-pointer select-none hover:text-[var(--navy)]"
                      )}
                      onClick={() =>
                        column.sortable ? handleSort(column.key) : undefined
                      }
                    >
                      <span className="inline-flex items-center gap-2">
                        {column.header}

                        {column.sortable ? (
                          <span className="flex flex-col">
                            <ChevronUp
                              className={cn(
                                "h-3 w-3",
                                sortConfig.key === column.key &&
                                  sortConfig.direction === "asc"
                                  ? "text-[var(--blue)]"
                                  : "text-[var(--ink-30)]"
                              )}
                              strokeWidth={1.6}
                            />
                            <ChevronDown
                              className={cn(
                                "-mt-1 h-3 w-3",
                                sortConfig.key === column.key &&
                                  sortConfig.direction === "desc"
                                  ? "text-[var(--blue)]"
                                  : "text-[var(--ink-30)]"
                              )}
                              strokeWidth={1.6}
                            />
                          </span>
                        ) : null}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {sortedData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-b border-[var(--line-2)] transition last:border-b-0 hover:bg-[rgba(220,230,255,0.30)]"
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-5 py-4 text-[13.5px] font-medium text-[var(--navy)]"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : String(row[column.key] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 lg:hidden">
            {sortedData.map((row, index) => mobileRender(row, index))}
          </div>
        </>
      ) : (
        <div className="px-5 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[var(--sky-2)] text-[var(--blue)]">
            <Search className="h-6 w-6" strokeWidth={1.6} />
          </div>

          <h3 className="mt-4 text-[22px] font-bold tracking-[-0.02em] text-[var(--navy)]">
            {emptyTitle}
          </h3>

          <p className="mx-auto mt-2 max-w-[360px] text-[14px] leading-[1.55] text-[var(--ink-60)]">
            {emptyDescription}
          </p>
        </div>
      )}
    </section>
  );
}