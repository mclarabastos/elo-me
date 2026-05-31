"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  Mail,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { loginWithDemoWallet } from "@/lib/api";
import { cn } from "@/lib/utils";

type Role = "patient" | "clinic" | "doctor";
type LoginMethod = "google" | "email" | "phone" | "passkey";
type Step = "role" | "method";

const roles: Array<{
  id: Role;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "patient",
    label: "Paciente",
    description: "Acesse documentos, solicitações e consentimentos.",
    icon: <UserRound className="h-4 w-4" strokeWidth={1.8} />,
  },
  {
    id: "clinic",
    label: "Clínica",
    description: "Envie documentos e solicite permissões de acesso.",
    icon: <Building2 className="h-4 w-4" strokeWidth={1.8} />,
  },
  {
    id: "doctor",
    label: "Médica",
    description: "Consulte apenas dados autorizados pelo paciente.",
    icon: <Stethoscope className="h-4 w-4" strokeWidth={1.8} />,
  },
];

const loginMethods: Array<{
  id: LoginMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "google",
    label: "Continuar com Google",
    description: "Acesse com sua conta Google.",
    icon: <FaGoogle className="h-4 w-4" />,
  },
  {
    id: "email",
    label: "Continuar com e-mail",
    description: "Entre usando um endereço de e-mail.",
    icon: <Mail className="h-4 w-4" strokeWidth={1.8} />,
  },
  {
    id: "phone",
    label: "Continuar com telefone",
    description: "Receba acesso usando seu número de telefone.",
    icon: <Phone className="h-4 w-4" strokeWidth={1.8} />,
  },
  {
    id: "passkey",
    label: "Continuar com passkey",
    description: "Use uma chave de acesso segura, sem senha.",
    icon: <KeyRound className="h-4 w-4" strokeWidth={1.8} />,
  },
];

export default function Page() {
  const router = useRouter();

  const [step, setStep] = React.useState<Step>("role");
  const [selectedRole, setSelectedRole] = React.useState<Role>("patient");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const selected = roles.find((role) => role.id === selectedRole) ?? roles[0];

  function handleContinue() {
    setError(null);
    setStep("method");
  }

  async function handleLogin(method: LoginMethod) {
    try {
      setIsLoading(true);
      setError(null);

      const result = await loginWithDemoWallet(selectedRole, method);

      router.push(result.route);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Não foi possível iniciar a sessão demo.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--card)] text-[var(--navy)]">

      <main className="px-5 pb-12 pt-8 sm:px-8 lg:px-12">
        <section className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-6xl items-center">
          <div className="grid w-full overflow-hidden border border-[var(--line)] bg-[var(--paper)] shadow-[0_24px_70px_rgba(11,27,63,0.08)] lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative flex min-h-[420px] flex-col justify-between overflow-hidden border-b border-[var(--line)] bg-[linear-gradient(135deg,rgba(238,243,255,0.95),rgba(255,255,255,0.96))] p-7 sm:p-10 lg:border-b-0 lg:border-r">
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[rgba(30,71,255,0.10)] blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[rgba(189,208,255,0.42)] blur-3xl" />

              <div className="relative">
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src="/images/elo.me_logoF.png"
                    alt="ELO.me"
                    width={210}
                    height={110}
                    priority
                    className="h-auto w-[150px] object-contain sm:w-[165px]"
                  />
                </Link>

                <div className="mt-10 max-w-[470px]">
                  <h1 className="mt-4 text-balance text-[34px] font-bold leading-[1.02] tracking-[-0.04em] text-[var(--navy)] sm:text-[44px] md:text-[52px]">
                    Acesse sua identidade médica.
                  </h1>

                  <p className="mt-5 max-w-[430px] text-[15px] leading-[1.65] text-[var(--ink-60)]">
                    Entre como paciente, clínica ou médica para acessar a
                    experiência Elo.me de consentimento, compartilhamento e
                    auditoria de dados médicos.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center p-6 sm:p-10">
              <div className="w-full max-w-[430px]">
                <div
                  key={step}
                  className="animate-[loginStep_260ms_ease-out] motion-reduce:animate-none"
                >
                  {step === "role" ? (
                    <>
                      <div className="mb-7">
                        <h2 className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-[var(--navy)]">
                          Escolha seu perfil
                        </h2>

                        <p className="mt-2 text-[14px] leading-[1.55] text-[var(--ink-60)]">
                          A demonstração será aberta conforme o papel
                          selecionado.
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {roles.map((role) => {
                          const isActive = selectedRole === role.id;

                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => {
                                setSelectedRole(role.id);
                                setError(null);
                              }}
                              className={cn(
                                "grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border px-4 py-4 text-left transition-all duration-200",
                                isActive
                                  ? "border-[var(--blue)] bg-[rgba(30,71,255,0.06)] shadow-[0_12px_30px_rgba(30,71,255,0.08)]"
                                  : "border-[var(--line)] bg-white hover:border-[rgba(30,71,255,0.35)] hover:bg-[var(--card)]",
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-flex h-10 w-10 items-center justify-center border transition-colors",
                                  isActive
                                    ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                                    : "border-[var(--line)] bg-[var(--card)] text-[var(--blue)]",
                                )}
                              >
                                {role.icon}
                              </span>

                              <span className="min-w-0">
                                <span className="block text-[14px] font-semibold text-[var(--navy)]">
                                  {role.label}
                                </span>

                                <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--ink-60)]">
                                  {role.description}
                                </span>
                              </span>

                              <span
                                className={cn(
                                  "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
                                  isActive
                                    ? "border-[var(--blue)] bg-[var(--blue)] text-white"
                                    : "border-[var(--line)] bg-[var(--card)] text-transparent",
                                )}
                              >
                                <CheckCircle2
                                  className="h-3.5 w-3.5"
                                  strokeWidth={2}
                                />
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={handleContinue}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--navy)] px-4 py-3.5 text-[13px] font-semibold text-white transition hover:-translate-y-0.5 hover:opacity-95"
                      >
                        Continuar como {selected.label}
                        <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mb-7">
                        <button
                          type="button"
                          onClick={() => {
                            setError(null);
                            setStep("role");
                          }}
                          className="mb-5 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)] transition hover:opacity-80"
                        >
                          <ArrowRight
                            className="h-3.5 w-3.5 rotate-180"
                            strokeWidth={1.8}
                          />
                          Trocar perfil
                        </button>

                        <h2 className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-[var(--navy)]">
                          Entrar como {selected.label}
                        </h2>

                        <p className="mt-2 text-[14px] leading-[1.55] text-[var(--ink-60)]">
                          Escolha um método para iniciar a demonstração.
                        </p>
                      </div>

                      <div className="grid gap-3">
                        {loginMethods.map((method) => (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => handleLogin(method.id)}
                            disabled={isLoading}
                            className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border border-[var(--line)] bg-white px-4 py-4 text-left transition-all duration-200 hover:border-[rgba(30,71,255,0.35)] hover:bg-[var(--card)] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="inline-flex h-10 w-10 items-center justify-center border border-[var(--line)] bg-[var(--card)] text-[var(--blue)]">
                              {method.icon}
                            </span>

                            <span className="min-w-0">
                              <span className="block text-[14px] font-semibold text-[var(--navy)]">
                                {method.label}
                              </span>

                              <span className="mt-0.5 block text-[12px] leading-relaxed text-[var(--ink-60)]">
                                {method.description}
                              </span>
                            </span>

                            <ArrowRight
                              className="h-4 w-4 text-[var(--ink-45)]"
                              strokeWidth={1.8}
                            />
                          </button>
                        ))}
                      </div>

                      {error ? (
                        <div className="mt-4 border border-red-200 bg-red-50 px-4 py-3">
                          <p className="text-[12px] leading-relaxed text-red-700">
                            {error}
                          </p>
                        </div>
                      ) : null}


                      {isLoading ? (
                        <p className="mt-3 text-[12px] text-[var(--ink-60)]">
                          Criando sessão segura da demonstração...
                        </p>
                      ) : null}
                    </>
                  )}
                </div>

                <Link
                  href="/"
                  className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--blue)] transition hover:opacity-80"
                >
                  <ArrowRight
                    className="h-3.5 w-3.5 rotate-180"
                    strokeWidth={1.8}
                  />
                  Voltar para a página inicial
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes loginStep {
          from {
            opacity: 0;
            transform: translateX(12px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}