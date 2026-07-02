import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LargeTestimonial() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    // GSAP memory leak prevention: wrap all animations in a context
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          opacity: 0,
          y: 40,
          scale: 0.98,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-6 flex justify-center items-center">
      <div
        ref={cardRef}
        className="w-full max-w-[1100px] p-8 md:p-14 rounded-3xl lp-glass-panel border border-lp-border/80 relative overflow-hidden bg-gradient-to-br from-lp-card via-[#111514] to-black/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
      >
        {/* Background Glowing Orb */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-lp-primary/5 rounded-full blur-[80px]" />
        
        {/* Big Quote Symbol */}
        <Quote className="absolute top-6 left-6 md:top-10 md:left-10 w-16 h-16 text-lp-primary/10 select-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-12 text-left">
          {/* Avatar Area */}
          <div className="relative flex-shrink-0">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-lp-primary/10 border-2 border-lp-primary/30 flex items-center justify-center text-4xl font-black text-lp-primary font-mono shadow-[0_0_20px_rgba(120,252,214,0.15)]">
              SL
            </div>
            {/* Small status dot */}
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-lp-hover border-2 border-lp-bg rounded-full animate-pulse" />
          </div>

          {/* Quote Details */}
          <div className="space-y-6 flex-grow">
            <p className="text-xl md:text-3xl font-medium text-lp-secondary leading-relaxed">
              &ldquo;InsightStream has completely removed our document processing bottlenecks. Payloads that previously took minutes are now analyzed, cataloged, and rendered in under a second.&rdquo;
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-lp-border/40">
              <div>
                <span className="font-bold text-lp-primary text-base md:text-lg block">Samiksha Lohia</span>
                <span className="text-xs md:text-sm text-lp-muted">Principal Architect, Pointer Systems</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-lp-primary uppercase bg-lp-primary/10 border border-lp-primary/20 px-3 py-1 rounded-full">
                  Enterprise Partner
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
