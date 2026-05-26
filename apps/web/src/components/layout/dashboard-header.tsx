type DashboardHeaderProps = {
  title: string;
  description?: string;
};

export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <header className="border-b border-blue-100 bg-white px-8 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
        ELO.ME
      </p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
    </header>
  );
}
