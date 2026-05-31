import {
  Bell,
  CheckCircle2,
  Database,
  FileCheck2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

const protectionCards = [
  {
    title: "Fica protegido",
    description:
      "Dados médicos, documentos, perfis, notificações e solicitações ficam fora de registros públicos.",
    icon: LockKeyhole,
  },
  {
    title: "Fica registrado",
    description:
      "Consentimentos, revogações e eventos de acesso geram uma trilha verificável para auditoria.",
    icon: FileCheck2,
  },
  {
    title: "Fica conferido",
    description:
      "Antes de liberar uma consulta, o sistema confere instituição, profissional, permissão e dados autorizados.",
    icon: ShieldCheck,
  },
];

const privacyRows = [
  {
    item: "Dados médicos",
    protected: "Prontuários, exames e documentos não são publicados.",
    registered: "Apenas uma prova do acesso autorizado fica registrada.",
    state: "protected",
    stateLabel: "Protegido",
  },
  {
    item: "Identidade do paciente",
    protected: "Login, perfil e dados pessoais ficam na aplicação.",
    registered: "A permissão concedida pode ser rastreada.",
    state: "protected",
    stateLabel: "Protegido",
  },
  {
    item: "Solicitações de acesso",
    protected: "O pedido aparece para o paciente aprovar, recusar ou limitar.",
    registered: "A decisão fica associada ao escopo, prazo e finalidade.",
    state: "verified",
    stateLabel: "Verificável",
  },
  {
    item: "Histórico de auditoria",
    protected: "O conteúdo médico continua privado.",
    registered: "A plataforma mostra quem solicitou, quando e quais dados foram liberados.",
    state: "ok",
    stateLabel: "Auditável",
  },
] as const;

const flowItems = [
  {
    label: "Paciente",
    text: "decide quais dados compartilhar",
    icon: UserRound,
  },
  {
    label: "Notificação",
    text: "avisa sobre novas solicitações",
    icon: Bell,
  },
  {
    label: "Permissão",
    text: "define escopo, prazo e finalidade",
    icon: CheckCircle2,
  },
  {
    label: "Histórico",
    text: "mantém a trilha de acesso organizada",
    icon: RefreshCw,
  },
];

const pip = {
  ok: "bg-[#1FAE6A]",
  verified: "bg-[#1E47FF]",
  protected: "bg-[#7EA2FF]",
};

export function Web3Ledger() {
  return (
    <>
      <section
        id="privacidade"
        className="border-t border-[rgba(11,27,63,0.10)] px-5 py-[88px] sm:px-8 lg:px-[72px]"
      >
        <div className="mx-auto max-w-[980px] text-center">
          <div className="font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[rgba(11,27,63,0.45)]">
            Segurança e privacidade
          </div>

          <h2
            className="mx-auto my-5 max-w-[820px] font-bold leading-tight tracking-[-0.02em] text-[#0B1B3F]"
            style={{ fontSize: "clamp(34px, 4.2vw, 56px)" }}
          >
            O dado médico fica protegido. O acesso fica{" "}
            <span className="text-[#1E47FF]">comprovável.</span>
          </h2>

          <p className="mx-auto max-w-[720px] text-[15px] leading-[1.65] text-[rgba(11,27,63,0.62)] sm:text-[16px]">
            A Elo.me não expõe prontuários, exames ou dados sensíveis em
            registros públicos. O que fica registrado é a permissão de acesso:
            quem solicitou, o que foi autorizado, por quanto tempo e com qual
            finalidade.
          </p>
        </div>

        <div className="mt-12 grid gap-3 md:grid-cols-3">
          {protectionCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="border border-[rgba(11,27,63,0.10)] bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-28px_rgba(11,27,63,0.28)]"
              >
                <div className="grid size-[38px] place-items-center rounded-[10px] bg-[#DCE6FF] text-[#1E47FF]">
                  <Icon className="size-5" strokeWidth={1.7} />
                </div>

                <h3 className="mt-4 text-[18px] font-bold leading-tight tracking-[-0.01em] text-[#0B1B3F]">
                  {item.title}
                </h3>

                <p className="mt-2 text-[13.5px] leading-[1.6] text-[rgba(11,27,63,0.62)]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t border-[rgba(11,27,63,0.10)] px-5 pb-[90px] pt-[70px] sm:px-8 lg:px-[72px]">
        <header className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.18em] text-[#1E47FF]">
              O que acontece por trás
            </p>

            <h3
              className="m-0 max-w-[760px] text-balance font-bold leading-[1.05] tracking-[-0.02em] text-[#0B1B3F]"
              style={{ fontSize: "clamp(28px, 3vw, 44px)" }}
            >
              A plataforma separa conteúdo sensível de prova de autorização.
            </h3>
          </div>

          <p className="max-w-[460px] text-[15px] leading-[1.65] text-[rgba(11,27,63,0.62)] lg:ml-auto lg:text-right">
            O conteúdo médico continua privado. A autorização
            de acesso fica rastreável para que paciente e instituição tenham
            confiança no processo.
          </p>
        </header>

        <div className="overflow-hidden border border-[rgba(11,27,63,0.10)] bg-white">
          <div className="hidden grid-cols-[1fr_1.35fr_1.35fr_120px] border-b border-[rgba(11,27,63,0.10)] bg-gradient-to-b from-[#F8FAFF] to-white px-5 py-3.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.12em] text-[rgba(11,27,63,0.45)] md:grid">
            <div>Elemento</div>
            <div>O que fica protegido</div>
            <div>O que fica registrado</div>
            <div>Status</div>
          </div>

          {privacyRows.map((row) => (
            <div
              key={row.item}
              className="grid gap-3 border-b border-[rgba(11,27,63,0.06)] px-5 py-4 text-[13.5px] last:border-b-0 md:grid-cols-[1fr_1.35fr_1.35fr_120px] md:items-center"
            >
              <div className="font-semibold text-[#0B1B3F]">{row.item}</div>

              <div className="text-[rgba(11,27,63,0.68)]">
                <span className="mb-1 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(11,27,63,0.40)] md:hidden">
                  O que fica protegido
                </span>
                {row.protected}
              </div>

              <div className="text-[rgba(11,27,63,0.68)]">
                <span className="mb-1 block font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.12em] text-[rgba(11,27,63,0.40)] md:hidden">
                  O que fica registrado
                </span>
                {row.registered}
              </div>

              <div className="inline-flex items-center gap-1.5 font-[family-name:var(--font-mono)] text-[11px] uppercase tracking-[0.06em] text-[#0B1B3F]">
                <span
                  className={cn("size-[7px] rounded-full", pip[row.state])}
                />
                {row.stateLabel}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}