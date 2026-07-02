import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const subHeadlineRef = useRef(null);
  const ctaRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    // GSAP memory leak prevention: wrap all animations in a context
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.8 }
      )
      .fromTo(
        headlineRef.current,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.5'
      )
      .fromTo(
        subHeadlineRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )
      .fromTo(
        ctaRef.current,
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.5'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[85vh] flex flex-col justify-center items-center text-center py-20 px-4 md:px-8 overflow-hidden"
    >
      {/* Dynamic Animated Radial Overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(168,85,247,0.07)_0%,transparent_60%)] pointer-events-none" />

      <div className="z-10 max-w-4xl space-y-8 flex flex-col items-center">
        {/* Badge Indicator */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-lp-border/60 backdrop-blur-md shadow-inner text-xs font-semibold text-lp-primary"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>InsightStream Pipeline v1.0.0 Now Live</span>
        </div>

        {/* Centered Headline */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-lp-secondary leading-[1.1] md:leading-[1.15]"
        >
          Transform Raw Documents Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-lp-primary via-lp-hover to-indigo-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.15)]">
            Active Intelligence
          </span>
        </h1>

        {/* Sub-headline */}
        <p
          ref={subHeadlineRef}
          className="text-base sm:text-xl text-lp-muted max-w-2xl mx-auto leading-relaxed"
        >
          Submit text payloads to run structural summaries, entity linkages, and keyword analysis in real-time. Experience lightning-fast Redis-backed pipeline queues.
        </p>

        {/* Oversized pill CTA */}
        <div ref={ctaRef} className="pt-4 flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-lp-primary hover:bg-lp-hover text-lp-bg font-extrabold text-base md:text-lg shadow-[0_0_25px_rgba(120,252,214,0.3)] hover:shadow-[0_0_35px_rgba(0,255,182,0.55)] transition-all duration-300 transform hover:scale-[1.03] active:scale-95 focus:outline-none focus:ring-2 focus:ring-lp-primary/50"
          >
            Start Analyzing Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <a
            href="#features"
            className="inline-flex items-center justify-center px-8 py-4 rounded-full border border-lp-border hover:border-lp-primary/60 hover:bg-white/5 text-lp-secondary font-bold text-base transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-lp-primary/50"
          >
            Explore Platform
          </a>
        </div>
      </div>
    </section>
  );
}
