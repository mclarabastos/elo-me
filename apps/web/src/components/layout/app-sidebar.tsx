import Link from "next/link";

const navigationItems = [
  { href: "/patient/dashboard", label: "Paciente" },
  { href: "/doctor/dashboard", label: "Médico" },
  { href: "/clinic/dashboard", label: "Clínica" },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-72 border-r border-blue-100 bg-white p-6 lg:block">
      <Link href="/" className="text-xl font-black tracking-tight text-blue-600">
        ELO.ME
      </Link>

      <nav className="mt-10 space-y-2">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
