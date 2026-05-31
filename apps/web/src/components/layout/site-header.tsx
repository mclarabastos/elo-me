import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "#produto", label: "Produto", active: true },
  { href: "#problema", label: "Problema" },
  { href: "#workflow", label: "Como funciona" },
  { href: "#privacidade", label: "Segurança" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  return (
    <nav className="relative z-20 grid grid-cols-[1fr_auto_1fr] items-center px-5 pt-6 sm:px-9 sm:pt-7">
      <div className="flex h-12 items-center justify-start">
        <Link
          href="/"
          aria-label="Ir para a página inicial da ELO.me"
          className="flex items-center"
        >
          <Image
            src="/images/elo.me_teste.png"
            alt="ELO.me"
            width={120}
            height={40}
            priority
            className="h-6 w-auto object-contain"
          />
        </Link>
      </div>

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

      <div className="flex h-12 items-center justify-end gap-2">
        <Link
          href="/auth/login"
          className="inline-flex items-center rounded-full border border-border-subtle bg-background-paper px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 ease-out hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-white"
        >
          Entrar
        </Link>

        <Link
          href="https://github.com/mclarabastos/elo-me"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-2 rounded-full border border-border-subtle bg-background-paper px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 ease-out hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-white sm:inline-flex"
        >
          <FaGithub className="size-4" aria-hidden="true" />
          GitHub
        </Link>
      </div>
    </nav>
  );
}