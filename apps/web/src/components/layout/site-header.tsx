import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "#produto", label: "Produto", active: true },
  { href: "#consentimento", label: "Consentimento" },
  { href: "#auditoria", label: "Auditoria" },
  { href: "#web3", label: "Web3" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <nav className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-center px-9 pt-7">
      <Link href="/" className="flex items-center gap-2.5 text-[#0B1B3F]">
        <svg viewBox="0 0 24 24" className="size-[22px] text-[#1E47FF]" fill="currentColor">
          <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
        </svg>
        <span className="text-[18px] font-bold tracking-[0.02em]">
          ELO<span className="text-[#1E47FF]">.</span>
          <span className="font-medium text-[#1B2C58]">me</span>
        </span>
      </Link>

      <div
        className="hidden items-center gap-1 rounded-full border border-[rgba(11,27,63,0.10)] bg-white p-1.5 md:inline-flex"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              item.active
                ? "bg-[#0B1B3F] text-white"
                : "text-[rgba(11,27,63,0.62)] hover:bg-[#DCE6FF] hover:text-[#0B1B3F]",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3.5">
        <Link
          href="/login"
          className="text-sm font-medium text-[#0B1B3F] hover:text-[#1E47FF]"
        >
          Entrar
        </Link>
        <Button
          asChild
          className="rounded-full bg-[#1E47FF] px-[18px] py-2.5 text-sm font-semibold text-white hover:bg-[#1638E0]"
        >
          <Link href="#produto">Criar identidade →</Link>
        </Button>
      </div>
    </nav>
  );
}