import { HeroSection } from "@/components/layout/hero-section";
import { ProtocolTrust } from "@/components/feedback/protocol-trust";
import { AuditSection } from "@/components/sections/audit-section";
import { Web3Ledger } from "@/components/sections/web3-ledger";
import { FaqSection } from "@/components/sections/faq-section";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { MarqueeStrip } from "@/components/layout/marquee-strip";

export default function HomePage() {
  return (
    <div
      className="min-h-screen font-[family-name:var(--font-sans)] text-[#0B1B3F]"
      style={{
        background:
          "radial-gradient(1200px 600px at 50% -200px, #C9D8F4 0%, transparent 60%), radial-gradient(900px 500px at 90% 30%, #DDE7F8 0%, transparent 60%), linear-gradient(180deg, #E8EEF9 0%, #DCE6F6 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <main
        className="relative mx-auto my-6 max-w-[1320px] overflow-hidden rounded-[28px] border border-[rgba(11,27,63,0.10)] bg-[#F7F8FC]"
        style={{
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.8), 0 30px 80px -40px rgba(11,27,63,0.25), 0 8px 30px -20px rgba(11,27,63,0.15)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,27,63,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(11,27,63,0.03) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(900px 900px at 50% 0%, #000 30%, transparent 80%)",
            WebkitMaskImage:
              "radial-gradient(900px 900px at 50% 0%, #000 30%, transparent 80%)",
          }}
        />

        <SiteHeader />
        <HeroSection />

        <MarqueeStrip />


        <ScrollReveal>
          <ProtocolTrust />
        </ScrollReveal>

        <ScrollReveal>
          <AuditSection />
        </ScrollReveal>

        <ScrollReveal>
          <Web3Ledger />
        </ScrollReveal>

        <ScrollReveal>
          <FaqSection />
        </ScrollReveal>

        <ScrollReveal>
          <SiteFooter />
        </ScrollReveal>
      </main>
    </div>
  );
}