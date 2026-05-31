const marqueeItems = [
  "DADOS SOB CONTROLE",
  "ACESSO COM CONSENTIMENTO",
  "AUDITORIA VERIFICÁVEL",
  "IDENTIDADE DO PACIENTE",
  "HISTÓRICO PORTÁTIL",
  "DOCUMENTOS OFF-CHAIN",
  "CHAINLINK CRE",
  "PRIVACIDADE POR DESIGN",
];

function MarqueeContent() {
  return (
    <div className="flex shrink-0 items-center gap-6 px-4">
      {marqueeItems.map((item, index) => (
        <div
          key={`${item}-${index}`}
          className="flex items-center gap-6 whitespace-nowrap"
        >
          <span className="font-[family-name:var(--font-mono)] text-[12px] font-semibold uppercase tracking-[0.18em] text-text-inverted">
            {item}
          </span>
          <span className="text-text-inverted/90">+++</span>
        </div>
      ))}
    </div>
  );
}

export function MarqueeStrip() {
  return (
    <section
      aria-label="Faixa informativa"
      className="relative overflow-hidden border-y border-border-subtle bg-brand-navy py-3"
    >
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </section>
  );
}