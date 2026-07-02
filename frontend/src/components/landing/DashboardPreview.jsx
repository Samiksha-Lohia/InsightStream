import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Activity, BarChart2, Cpu, Database, DatabaseIcon, Terminal } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function DashboardPreview() {
  const previewRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // GSAP memory leak prevention: wrap all animations in a context
    const ctx = gsap.context(() => {
      gsap.fromTo(
        previewRef.current,
        {
          opacity: 0,
          y: 60,
          scale: 0.92,
          rotateX: 10,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: 1.5,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-10 px-2 md:px-4 perspective-[1000px] flex justify-center items-center overflow-hidden"
    >
      <div
        ref={previewRef}
        className="w-full max-w-[1100px] rounded-2xl lp-glass-panel border border-lp-border/80 shadow-[0_30px_100px_rgba(0,0,0,0.8),0_0_50px_rgba(120,252,214,0.08)] overflow-hidden bg-black/40"
      >
        {/* Mock Window Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-lp-border/50 bg-[#161a19]/80">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="text-xs font-mono text-lp-muted select-none flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-lp-border/40">
            <Cpu className="w-3 h-3 text-lp-primary" />
            <span>insightstream-node-01@pipeline: /upload</span>
          </div>
          <div className="w-14" />
        </div>

        {/* Dashboard Frame Grid */}
        <div className="grid grid-cols-[220px_1fr] min-h-[500px] text-left text-sm font-sans select-none">
          {/* Mock Sidebar */}
          <aside className="border-r border-lp-border/40 p-4 bg-[#111514]/60 space-y-6 hidden sm:block">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lp-muted uppercase tracking-wider px-2 block mb-2">Workspace</span>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-lp-primary/10 border border-lp-primary/20 text-lp-primary font-bold">
                <Activity className="w-4 h-4" />
                <span>Live Analyzer</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-lp-muted hover:text-lp-secondary hover:bg-white/5 transition-colors">
                <BarChart2 className="w-4 h-4" />
                <span>System Health</span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-lp-muted hover:text-lp-secondary hover:bg-white/5 transition-colors">
                <Database className="w-4 h-4" />
                <span>Redis Queues</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-lp-muted uppercase tracking-wider px-2 block mb-2">Metrics</span>
              <div className="px-3 space-y-2">
                <div className="flex justify-between text-xs text-lp-muted">
                  <span>RAM usage</span>
                  <span className="text-lp-primary">42%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-lp-primary h-full rounded-full" style={{ width: '42%' }} />
                </div>
                
                <div className="flex justify-between text-xs text-lp-muted pt-1">
                  <span>Queue Depth</span>
                  <span className="text-lp-hover">0 / 125</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-lp-hover h-full rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Canvas Mockup */}
          <main className="p-6 bg-black/25 flex flex-col gap-6">
            {/* Stat Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-lp-border bg-[#141817]/40 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-lp-muted font-bold uppercase block">Analysis Rate</span>
                  <span className="text-2xl font-black text-lp-secondary tracking-tight">4.2k payload/m</span>
                </div>
                <div className="p-2 bg-lp-primary/10 border border-lp-primary/20 rounded-xl text-lp-primary">
                  <Activity className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-lp-border bg-[#141817]/40 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-lp-muted font-bold uppercase block">Mean Process Time</span>
                  <span className="text-2xl font-black text-lp-secondary tracking-tight">384 ms</span>
                </div>
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                  <Cpu className="w-5 h-5" />
                </div>
              </div>

              <div className="p-4 rounded-xl border border-lp-border bg-[#141817]/40 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs text-lp-muted font-bold uppercase block">Redis Cache Hit</span>
                  <span className="text-2xl font-black text-lp-secondary tracking-tight">99.81%</span>
                </div>
                <div className="p-2 bg-lp-hover/10 border border-lp-hover/20 rounded-xl text-lp-hover">
                  <DatabaseIcon className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Core Interaction Block Mockup */}
            <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Terminal View */}
              <div className="lg:col-span-2 p-5 rounded-xl border border-lp-border/60 bg-black/60 font-mono text-xs text-emerald-400/90 flex flex-col justify-between min-h-[220px]">
                <div className="space-y-1.5 select-text">
                  <div className="text-lp-muted flex items-center gap-1.5 border-b border-lp-border pb-2 mb-2 font-sans">
                    <Terminal className="w-4 h-4 text-lp-primary" />
                    <span>Real-time Stream Engine Console</span>
                  </div>
                  <p><span className="text-lp-primary">[sys]</span> Initializing InsightStream core analysis module...</p>
                  <p><span className="text-lp-primary">[sys]</span> Redis socket connection established on port 6379.</p>
                  <p><span className="text-lp-primary">[job]</span> Document 8bf37cb1-d419 registered for indexing.</p>
                  <p><span className="text-lp-hover">[nlp]</span> Extracted 42 linked nodes (confidence coefficient: 0.985)</p>
                  <p><span className="text-lp-hover">[nlp]</span> Summarizer pipeline processed payload in 128ms.</p>
                  <p><span className="text-lp-primary">[job]</span> Job pipeline complete. Stream synced to client.</p>
                </div>
                <div className="flex items-center gap-2 text-lp-primary mt-4 select-none">
                  <span className="animate-ping w-2 h-2 rounded-full bg-lp-primary" />
                  <span>Pipeline Active // Idle listener.</span>
                </div>
              </div>

              {/* Graphic/Visual Mockup */}
              <div className="p-5 rounded-xl border border-lp-border bg-[#141817]/40 flex flex-col justify-between min-h-[220px]">
                <span className="text-xs text-lp-muted font-bold uppercase block border-b border-lp-border pb-2">Topic Linkage Weights</span>
                <div className="flex-grow flex items-center justify-center py-4">
                  {/* Glowing custom SVG Chart Mockup */}
                  <svg viewBox="0 0 100 80" className="w-full max-h-[140px] drop-shadow-[0_0_10px_rgba(120,252,214,0.3)]">
                    {/* Grid lines */}
                    <line x1="10" y1="10" x2="10" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="10" y1="70" x2="90" y2="70" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                    <line x1="50" y1="10" x2="50" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    <line x1="90" y1="10" x2="90" y2="70" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    {/* Path */}
                    <path
                      d="M 10 65 Q 25 15 45 45 T 75 25 T 90 10"
                      fill="none"
                      stroke="#78fcd6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Gradient fill area */}
                    <path
                      d="M 10 70 L 10 65 Q 25 15 45 45 T 75 25 T 90 10 L 90 70 Z"
                      fill="url(#chartGrad)"
                      opacity="0.12"
                    />
                    {/* Chart points */}
                    <circle cx="45" cy="45" r="3.5" fill="#00ffb6" />
                    <circle cx="75" cy="25" r="3.5" fill="#00ffb6" />
                    {/* Definitions */}
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#78fcd6" />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-lp-muted border-t border-lp-border pt-2 select-none">
                  <span>Sentiment Linkage: <strong className="text-lp-primary">0.82 (High)</strong></span>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}
