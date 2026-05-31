"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { Menu as MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "#produto", label: "Produto", active: true },
  { href: "#problema", label: "Problema" },
  { href: "#workflow", label: "Como funciona" },
  { href: "#privacidade", label: "Segurança" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  function closeMenu() {
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        event.target instanceof Node &&
        !menuRef.current.contains(event.target)
      ) {
        closeMenu();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  return (
    <header className="relative z-[9999]">
      <nav className="relative z-[9999] flex items-center justify-between px-4 pt-5 sm:px-9 sm:pt-7">
        <Link
          href="/"
          aria-label="Ir para a página inicial da ELO.me"
          className="flex h-10 items-center sm:h-12"
          onClick={closeMenu}
        >
          <Image
            src="/images/elo.me_teste.png"
            alt="ELO.me"
            width={120}
            height={40}
            priority
            className="h-[18px] w-auto object-contain sm:h-6"
          />
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

        <div className="flex h-10 items-center justify-end gap-2 sm:h-12">
          <Link
            href="/auth/login"
            className="hidden items-center rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 ease-out hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-white md:inline-flex"
          >
            Entrar
          </Link>

          <Link
            href="https://github.com/mclarabastos/elo-me"
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow-sm transition-all duration-200 ease-out hover:border-[var(--color-brand-blue)] hover:bg-[var(--color-brand-blue)] hover:text-white md:inline-flex"
          >
            <FaGithub className="size-4" aria-hidden="true" />
            GitHub
          </Link>

          <div ref={menuRef} className="relative md:hidden">
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              aria-label="Abrir menu"
              aria-expanded={isOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-white text-brand-navy shadow-sm transition-all duration-200 ease-out hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)] focus:outline-none focus:ring-2 focus:ring-[rgba(30,71,255,0.22)]"
            >
              <MenuIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
            </button>

            {isOpen ? (
              <div className="absolute right-0 top-[42px] z-[9999] w-[min(280px,calc(100vw-32px))] rounded-[18px] border border-[rgba(11,27,63,0.10)] bg-white p-2 shadow-[0_24px_70px_-36px_rgba(11,27,63,0.45)]">
                <div className="grid gap-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      className={cn(
                        "block rounded-[12px] px-4 py-3 text-[13px] font-semibold transition-colors",
                        item.active
                          ? "bg-brand-sky-soft text-[var(--color-brand-blue)]"
                          : "text-brand-navy hover:bg-brand-sky-soft hover:text-[var(--color-brand-blue)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="my-2 h-px bg-[rgba(11,27,63,0.10)]" />

                <div className="grid gap-2">
                  <Link
                    href="/auth/login"
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center rounded-full bg-[var(--color-brand-blue)] px-4 py-3 text-[13px] font-semibold text-white transition hover:bg-[#1638E0]"
                  >
                    Entrar
                  </Link>

                  <Link
                    href="https://github.com/mclarabastos/elo-me"
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMenu}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-3 text-[13px] font-semibold text-brand-navy transition hover:border-[var(--color-brand-blue)] hover:text-[var(--color-brand-blue)]"
                  >
                    <FaGithub className="size-4" aria-hidden="true" />
                    GitHub
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
}