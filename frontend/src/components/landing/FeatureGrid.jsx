import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Sparkles, Cpu, Layers, GitMerge } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FeatureGrid() {
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP memory leak prevention: wrap all animations in a context
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.bento-card',
        {
          opacity: 0,
          y: 40,
          scale: 0.96,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Bento card mock items
  const features = [
    {
      title: 'Sub-second Data Synthesis',
      description: 'Streamline huge raw texts into structural summaries and actionable indicators instantly using parallel indexing workers.',
      icon: <Sparkles className="w-6 h-6 text-lp-primary" />,
      className: 'md:col-span-2 md:row-span-1 bg-gradient-to-br from-lp-card to-purple-950/10',
      element: (
        <div className="relative w-full h-32 mt-4 bg-black/40 rounded-lg border border-lp-border flex items-center justify-center overflow-hidden">
          {/* Simulated scanning wave */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-lp-primary/10 to-transparent w-full h-full -translate-x-full animate-[shimmer-bg_2.5s_infinite_linear]" style={{ animationName: 'skeleton-shimmer' }} />
          <div className="flex gap-3 items-center text-xs font-mono text-lp-muted">
            <span className="bg-lp-primary/10 border border-lp-primary/20 text-lp-primary px-2 py-1 rounded">Text Payload</span>
            <span className="text-lp-primary">➔</span>
            <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Indexed Nodes</span>
            <span className="text-indigo-400">➔</span>
            <span className="bg-lp-hover/10 border border-lp-hover/20 text-lp-hover px-2 py-1 rounded">Synthesized Entity</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Redis Buffered Queues',
      description: 'Zero loss backpressured analysis queue backing up thousands of payloads under peak network requests.',
      icon: <Cpu className="w-6 h-6 text-lp-primary" />,
      className: 'md:col-span-1 md:row-span-1 bg-gradient-to-br from-lp-card to-black/30',
      element: (
        <div className="relative w-full h-32 mt-4 bg-black/40 rounded-lg border border-lp-border flex flex-col gap-2 p-3 font-mono text-[10px] overflow-hidden justify-center">
          <div className="flex justify-between items-center text-lp-muted border-b border-lp-border pb-1 mb-1">
            <span>redis_queue_0</span>
            <span className="text-lp-primary">Active</span>
          </div>
          <div className="flex gap-1.5 overflow-hidden">
            <div className="h-6 w-12 bg-lp-primary/20 border border-lp-primary/30 rounded flex items-center justify-center text-lp-primary font-bold">128ms</div>
            <div className="h-6 w-12 bg-lp-primary/25 border border-lp-primary/35 rounded flex items-center justify-center text-lp-primary font-bold">220ms</div>
            <div className="h-6 w-12 bg-lp-primary/15 border border-lp-primary/25 rounded flex items-center justify-center text-lp-primary font-bold">95ms</div>
            <div className="h-6 w-12 bg-white/5 border border-lp-border rounded flex items-center justify-center text-lp-muted">...</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Enterprise Cryptography Shield',
      description: 'Your text processing payloads are fully encrypted at rest with multi-tenant data isolation keys.',
      icon: <Shield className="w-6 h-6 text-lp-primary" />,
      className: 'md:col-span-1 md:row-span-1 bg-gradient-to-br from-lp-card to-black/30',
      element: (
        <div className="relative w-full h-32 mt-4 bg-black/40 rounded-lg border border-lp-border flex items-center justify-center gap-2 select-text font-mono text-[9px] text-lp-muted px-4 overflow-hidden">
          <div className="flex flex-col gap-0.5">
            <span className="text-lp-primary">AES-256 GCM</span>
            <span>Cipher: a8f73b64c01ee4a7</span>
            <span>IV: 7a83f982d</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Multi-Tenant Partitioning',
      description: 'Configure and isolate data retention policies by account to satisfy absolute compliance regulations.',
      icon: <Layers className="w-6 h-6 text-lp-primary" />,
      className: 'md:col-span-2 md:row-span-1 bg-gradient-to-br from-lp-card to-purple-950/10',
      element: (
        <div className="relative w-full h-32 mt-4 bg-black/40 rounded-lg border border-lp-border flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-white/5 rounded p-3.5 text-left font-mono text-[10px] flex justify-between items-center">
            <span>Client Tenant Retention Policy:</span>
            <span className="text-lp-primary font-bold bg-lp-primary/10 border border-lp-primary/20 px-3 py-1 rounded">Indefinite Retention (Compliance Secured)</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section id="features" ref={containerRef} className="space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-lp-secondary">
          Platform Architecture & Security
        </h2>
        <p className="text-sm md:text-base text-lp-muted max-w-xl mx-auto">
          Explore how InsightStream distributes document processing across fully encrypted Redis message queues.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(260px,_auto)]">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            whileHover={{
              y: -5,
              borderColor: 'rgba(168, 85, 247, 0.3)',
              boxShadow: '0 12px 30px rgba(168, 85, 247, 0.05)',
            }}
            transition={{ duration: 0.3 }}
            className={`bento-card p-6 rounded-2xl border border-lp-border/60 flex flex-col justify-between group overflow-hidden ${feature.className}`}
          >
            <div className="space-y-3">
              <div className="p-3 bg-white/5 border border-lp-border/40 rounded-xl w-fit group-hover:scale-105 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-lp-secondary group-hover:text-lp-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-lp-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
            {feature.element}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
