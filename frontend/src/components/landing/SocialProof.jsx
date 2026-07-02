import { Cpu, Terminal, Shield, Zap, RefreshCw, Feather } from 'lucide-react';

export default function SocialProof() {
  // 6 mock technology / partner labels with SVG representation
  const partners = [
    { name: 'Apex AI', icon: <Cpu className="w-5 h-5" /> },
    { name: 'Prism Engine', icon: <Terminal className="w-5 h-5" /> },
    { name: 'Helix Security', icon: <Shield className="w-5 h-5" /> },
    { name: 'Sora Cloud', icon: <Zap className="w-5 h-5" /> },
    { name: 'Aether Data', icon: <RefreshCw className="w-5 h-5" /> },
    { name: 'Zenith Labs', icon: <Feather className="w-5 h-5" /> },
  ];

  // Repeat twice for seamless infinite scrolling loop
  const marqueeItems = [...partners, ...partners, ...partners];

  return (
    <section className="w-full py-8 border-y border-lp-border/40 overflow-hidden relative select-none">
      {/* Edge gradient overlays for smooth fading edges */}
      <div className="absolute top-0 bottom-0 left-0 w-16 md:w-32 bg-gradient-to-r from-lp-bg to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 bottom-0 right-0 w-16 md:w-32 bg-gradient-to-l from-lp-bg to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-12 animate-marquee">
        {marqueeItems.map((partner, index) => (
          <div
            key={`${partner.name}-${index}`}
            className="flex items-center gap-2.5 opacity-55 hover:opacity-100 hover:text-lp-primary hover:drop-shadow-[0_0_10px_rgba(120,252,214,0.3)] transition-all duration-300 cursor-pointer px-6"
          >
            <div className="text-lp-secondary hover:text-lp-primary transition-colors">
              {partner.icon}
            </div>
            <span className="text-sm font-semibold uppercase tracking-widest font-mono text-lp-secondary">
              {partner.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
