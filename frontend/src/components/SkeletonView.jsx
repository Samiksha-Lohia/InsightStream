import { Cpu, Terminal, FileText, BarChart3 } from 'lucide-react';

export default function SkeletonView() {
  return (
    <div className="skeleton-container w-full max-w-4xl mx-auto glass-panel rounded-3xl p-8 border border-border-main relative overflow-hidden shadow-2xl">
      {/* Background glowing aura */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border-main">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
              <FileText className="w-3.5 h-3.5 text-brand-primary shimmer-bg" />
            </div>
            <div className="h-4 w-32 shimmer-bg rounded-md" />
          </div>
          <div className="h-7 w-64 shimmer-bg rounded-lg" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-24 shimmer-bg rounded-full" />
          <div className="h-8 w-32 shimmer-bg rounded-full" />
        </div>
      </div>

      {/* Meta Grid Skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-border-main">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-black/5 dark:bg-black/20 border border-border-main space-y-2">
            <div className="h-3 w-16 shimmer-bg rounded" />
            <div className="h-5 w-24 shimmer-bg rounded-md" />
          </div>
        ))}
      </div>

      {/* Content Blocks */}
      <div className="space-y-8 py-6">
        
        {/* Summary Block */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brand-primary font-bold">
            <Cpu className="w-4 h-4" />
            <div className="h-4 w-28 shimmer-bg rounded" />
          </div>
          <div className="space-y-2 bg-black/5 dark:bg-black/15 p-5 rounded-2xl border border-border-main">
            <div className="h-4 w-full shimmer-bg rounded" />
            <div className="h-4 w-11/12 shimmer-bg rounded" />
            <div className="h-4 w-4/5 shimmer-bg rounded" />
          </div>
        </div>

        {/* Key Findings Block */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-brand-secondary font-bold">
            <BarChart3 className="w-4 h-4" />
            <div className="h-4 w-32 shimmer-bg rounded" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-black/5 dark:bg-black/15 border border-border-main flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-secondary/35 mt-1.5 flex-shrink-0 shimmer-bg" />
                <div className="space-y-2 w-full">
                  <div className="h-4 w-11/12 shimmer-bg rounded" />
                  <div className="h-3 w-3/4 shimmer-bg rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Console / Log Block */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-txt-secondary font-bold">
            <Terminal className="w-4 h-4" />
            <div className="h-4 w-24 shimmer-bg rounded" />
          </div>
          <div className="bg-black/5 dark:bg-black/40 rounded-xl p-4 font-mono space-y-2 border border-border-main">
            <div className="h-3 w-1/3 shimmer-bg rounded" />
            <div className="h-3 w-1/2 shimmer-bg rounded" />
            <div className="h-3 w-2/3 shimmer-bg rounded" />
          </div>
        </div>

      </div>
    </div>
  );
}
