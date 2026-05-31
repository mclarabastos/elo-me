import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const items = [
  {
    q: "Qual problema a Elo.me resolve?",
    a: "A Elo.me resolve a falta de controle e rastreabilidade no acesso a dados médicos. Hoje, prontuários podem ficar fragmentados entre clínicas, profissionais, laboratórios e sistemas diferentes. A proposta é permitir que o paciente saiba quem solicitou acesso, quais dados foram pedidos, por qual finalidade e por quanto tempo.",
  },
  {
    q: "A Elo.me é um prontuário eletrônico?",
    a: "Não exatamente. A Elo.me não quer substituir o sistema da clínica. Ela funciona como uma camada de consentimento, controle de acesso e auditoria sobre dados médicos. A clínica continua usando seus sistemas, mas o acesso aos dados passa a depender de uma autorização clara do paciente.",
  },
  {
    q: "O paciente precisa entender blockchain ou criar carteira?",
    a: "Não. A experiência foi pensada com abstração de carteira. O paciente entra com Google, e-mail ou telefone, sem ver seed phrase, chave privada ou termos técnicos. A parte verificável acontece em segundo plano.",
  },
  {
    q: "Quais dados o paciente pode compartilhar?",
    a: "A solicitação pode ser feita por escopo. Por exemplo: alergias, medicamentos em uso, exames recentes, identificação básica ou contato de emergência. O paciente pode aprovar tudo, recusar ou liberar apenas parte dos dados solicitados.",
  },
  {
    q: "Os dados médicos ficam na blockchain?",
    a: "Não. Prontuários, exames, documentos e informações sensíveis permanecem fora da blockchain. O que pode ser registrado são provas de autorização, hashes, consentimentos, revogações e eventos de auditoria, sem expor o conteúdo médico.",
  },
  {
    q: "Onde entra a validação automatizada?",
    a: "Antes de liberar o acesso, a Elo.me verifica se a clínica, o profissional, o consentimento e os dados solicitados estão de acordo. Para o usuário, isso aparece como uma checagem simples. Tecnicamente, essa validação pode ser orquestrada com Chainlink CRE.",
  },
  {
    q: "Por que o foco em clínicas privadas?",
    a: "Clínicas privadas lidam com dados sensíveis, múltiplos profissionais, sistemas fragmentados, exames, laboratórios e necessidade de confiança do paciente. Também têm incentivo comercial para oferecer uma experiência mais segura, rastreável e premium para seus pacientes.",
  },
  {
    q: "Quem paga pela Elo.me?",
    a: "O modelo pensado é SaaS premium. Pacientes podem assinar planos individuais ou familiares para controlar seus dados e acessos. Clínicas privadas podem assinar planos institucionais para solicitar acessos, acompanhar pacientes, gerenciar profissionais vinculados e manter auditoria.",
  },
  {
    q: "A solução é compatível com LGPD?",
    a: "A proposta foi desenhada com princípios alinhados à LGPD, como finalidade, minimização de dados, consentimento e rastreabilidade. A Elo.me ajuda a deixar claro quais dados foram solicitados, por quem, por quanto tempo e com qual autorização.",
  },
  {
    q: "O que já está implementado na demo?",
    a: "A demo inclui fluxos para paciente, profissional de saúde e clínica, solicitação de acesso, aprovação parcial de dados, registros autorizados, logs de auditoria, notificações mockadas e endpoints de validação.",
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

    </section>
  );
}