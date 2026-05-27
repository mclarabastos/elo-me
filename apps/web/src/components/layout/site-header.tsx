import Link from "next/link";
import { FaGithub } from "react-icons/fa";

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
      <Link href="/" className="flex items-center gap-2.5 text-brand-navy">
        <svg
          viewBox="0 0 24 24"
          className="size-[22px] text-brand-blue"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" />
        </svg>

        <span className="text-[18px] font-bold tracking-[0.02em]">
          ELO<span className="text-brand-blue">.</span>
          <span className="font-medium text-brand-navy-soft">me</span>
        </span>
      </Link>

      <div
        className="hidden items-center gap-1 rounded-full border border-border-subtle bg-background-paper p-1.5 md:inline-flex"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)" }}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              item.active
                ? "bg-brand-navy text-text-inverted"
                : "text-text-muted hover:bg-brand-sky-soft hover:text-brand-navy",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="https://github.com/mclarabastos/elo-me"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background-paper px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 ease-out hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-white"
        >
          <FaGithub className="size-4" aria-hidden="true" />
          GitHub
        </Link>
      </div>
    </nav>
  );
}