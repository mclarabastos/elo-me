import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const items = [
  {
    q: "O que é a identidade ELO?",
    a: "A identidade ELO é uma identidade digital soberana (DID) emitida em nome do paciente. Ela vive com você, não dentro de um hospital ou operadora, e é o que permite consentir — ou revogar — acessos aos seus dados clínicos em qualquer instituição conectada à rede.",
  },
  {
    q: "Como funciona o consentimento granular?",
    a: "Cada pedido de acesso especifica escopo (qual dado), finalidade (por quê), prazo (até quando) e requisitante (quem). Você aprova ou nega item por item — e pode revogar a qualquer momento, com efeito imediato.",
  },
  {
    q: "Onde meus dados ficam armazenados?",
    a: "Os dados clínicos permanecem nas instituições de origem, em conformidade com a LGPD. A ELO.ME registra apenas os eventos de consentimento e auditoria — não armazena prontuário.",
  },
  {
    q: "O que é registrado on-chain via Chainlink CRE?",
    a: "Apenas os eventos de auditoria — concessões, revogações, leituras — são ancorados on-chain, de forma que ninguém possa reescrever o histórico. Nenhum dado clínico sensível trafega pela blockchain.",
  },
  {
    q: "Hospitais e operadoras precisam mudar seus sistemas?",
    a: "Não. A integração acontece via APIs e conectores que se acoplam aos sistemas existentes (HIS, RIS, LIS), com handshake de consentimento padronizado.",
  },
  {
    q: "É compatível com a LGPD e regulamentação setorial?",
    a: "Sim. A arquitetura segue os princípios de minimização, finalidade e consentimento explícito, e produz trilha de auditoria pronta para apresentação a reguladores e DPOs.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="border-t border-[rgba(11,27,63,0.10)] px-9 py-[100px]">
      <h3
        className="mx-auto mb-10 max-w-[800px] text-center font-bold tracking-[-0.02em] text-[#0B1B3F]"
        style={{ fontSize: "clamp(32px, 3.6vw, 50px)" }}
      >
        Boas <span className="text-[#1E47FF]">perguntas</span>, respostas{" "}
        <span className="text-[#1E47FF]">claras.</span>
      </h3>

      <Accordion
        type="single"
        collapsible
        defaultValue="q-0"
        className="mx-auto max-w-[860px] rounded-[22px] border border-[rgba(11,27,63,0.10)] bg-white px-7"
      >
        {items.map((item, i) => (
          <AccordionItem
            key={item.q}
            value={`q-${i}`}
            className="border-b border-[rgba(11,27,63,0.06)] last:border-b-0"
          >
            <AccordionTrigger className="py-5 text-[16px] font-semibold text-[#0B1B3F] hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="max-w-[700px] pb-5 text-[14.5px] leading-[1.6] text-[rgba(11,27,63,0.62)]">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-9 text-center">
        <p className="mb-3.5 text-[14.5px] text-[rgba(11,27,63,0.62)]">
          Não encontrou sua resposta?
        </p>
        <Button
          asChild
          className="rounded-full bg-[#1E47FF] text-white hover:bg-[#1638E0]"
        >
          <Link href="#contato">
            Falar com nosso time <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}