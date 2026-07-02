import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CTAFooter() {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // GSAP memory leak prevention: wrap all animations in a context
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        {
          opacity: 0,
          scale: 0.97,
          y: 40,
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            end: 'bottom 20%',
            toggleActions: 'play none none none',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="w-full py-12 flex justify-center items-center">
      <div
        ref={contentRef}
        className="w-full max-w-[1100px] p-8 md:p-16 rounded-3xl relative overflow-hidden bg-gradient-to-br from-[#1b1624] via-[#0a0b10] to-black border border-lp-primary/40 shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_30px_rgba(168, 85, 247, 0.06)] text-center flex flex-col items-center gap-6"
      >
        {/* Decorative Grid Mesh Overlay */}
        <div className="absolute inset-0 bg-grid-color opacity-20 pointer-events-none" />

        {/* Ambient Glowing Spot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-lp-primary/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Small Icon Badge */}
        <div className="p-3 bg-lp-primary/10 border border-lp-primary/20 rounded-2xl text-lp-primary w-fit z-10 animate-bounce">
          <Sparkles className="w-6 h-6 text-lp-primary" />
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-5xl font-black text-lp-secondary tracking-tight max-w-2xl leading-tight z-10">
          Ready to Accelerate Your AI Document Summaries?
        </h2>

        {/* Sub-headline */}
        <p className="text-sm sm:text-base text-lp-muted max-w-lg z-10">
          Join thousands of developers utilizing InsightStream pipelines to run structural analyses in under 400 milliseconds.
        </p>

        {/* Action Button */}
        <div className="pt-4 z-10">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-lp-primary hover:bg-lp-hover text-lp-bg font-extrabold text-base md:text-lg shadow-[0_0_20px_rgba(120,252,214,0.25)] hover:shadow-[0_0_30px_rgba(0,255,182,0.45)] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-lp-primary/50"
          >
            Create Your Pipeline Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
