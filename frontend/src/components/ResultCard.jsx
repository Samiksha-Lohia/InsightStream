import { Cpu, Terminal, FileText, BarChart3, Clock, HelpCircle, HardDrive, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateTitle } from '../utils/titleGenerator';

export default function ResultCard({ document }) {
  const { _id, content, insights, createdAt, retention = 'Indefinite' } = document;

  // Refactored dynamic section parser
  const parseMarkdownSections = (rawText) => {
    if (!rawText) return [];

    const sections = [];
    const lines = rawText.split('\n');
    let currentSection = null;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Identify markdown headers (## Title) or bold titles (**Title**)
      const mdHeaderMatch = trimmed.match(/^#+\s+(.+)$/);
      const boldHeaderMatch = trimmed.match(/^\*\*([^*]+)\*\*:?$/);

      if (mdHeaderMatch) {
        const title = mdHeaderMatch[1].replace(/[:#]/g, '').trim();
        currentSection = { title, items: [], rawText: '' };
        sections.push(currentSection);
      } else if (boldHeaderMatch) {
        const title = boldHeaderMatch[1].trim();
        currentSection = { title, items: [], rawText: '' };
        sections.push(currentSection);
      } else {
        if (!currentSection) {
          // If text appears before any heading, put it in a default Overview section
          currentSection = { title: 'Overview', items: [], rawText: '' };
          sections.push(currentSection);
        }

        // Check if line is a bullet/numbered list item
        const bulletMatch = trimmed.match(/^[-*\u2022]\s+(.+)$/) || trimmed.match(/^\d+\.\s+(.+)$/);
        if (bulletMatch) {
          currentSection.items.push(bulletMatch[1]);
        } else {
          currentSection.rawText += (currentSection.rawText ? '\n' : '') + trimmed;
        }
      }
    });

    // Fallbacks if no sections parsed
    if (sections.length === 0 && rawText) {
      sections.push({
        title: 'Executive Summary',
        items: [],
        rawText: rawText
      });
    }

    return sections;
  };

  const sections = parseMarkdownSections(insights);
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : 0;
  const createdDate = new Date(createdAt).toLocaleString();

  const getSectionIcon = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes('summary') || lower.includes('overview')) return <Cpu className="w-4.5 h-4.5 text-brand-primary neon-text-glow" />;
    if (lower.includes('insight') || lower.includes('finding') || lower.includes('takeaway')) return <BarChart3 className="w-4.5 h-4.5 text-brand-secondary neon-text-glow" />;
    if (lower.includes('action') || lower.includes('recommend') || lower.includes('step')) return <CheckCircle2 className="w-4.5 h-4.5 text-brand-primary neon-text-glow" />;
    if (lower.includes('tech') || lower.includes('stack')) return <Terminal className="w-4.5 h-4.5 text-brand-secondary neon-text-glow" />;
    return <FileText className="w-4.5 h-4.5 text-txt-secondary" />;
  };

  return (
    <div className="results-card w-full max-w-4xl mx-auto glass-panel rounded-3xl p-8 border border-brand-primary/20 relative shadow-2xl transition-all">
      
      {/* Background glow lines */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-border-main">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-brand-primary/15 border border-brand-primary/30 text-brand-primary">
              <FileText className="w-4 h-4 neon-text-glow" />
            </div>
            <span className="text-xs font-mono text-brand-secondary font-bold tracking-wider">
              PIPELINE SUCCESS // ID: {_id.substring(0, 12)}
            </span>
          </div>
          <h2 className="text-2xl font-black text-txt-primary tracking-tight">
            {generateTitle(insights, content)}
          </h2>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 flex items-center gap-1.5 shadow-sm shadow-emerald-500/10">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-border-main text-txt-secondary">
            v1.2.0-groq
          </span>
        </div>
      </div>

      {/* Metadata Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-b border-border-main">
        <div className="p-4 rounded-xl bg-black/5 dark:bg-black/35 border border-border-main">
          <div className="flex items-center gap-1.5 text-txt-secondary text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5" />
            Analyzed At
          </div>
          <p className="text-sm font-bold text-txt-primary mt-2 truncate">
            {createdDate}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-black/5 dark:bg-black/35 border border-border-main">
          <div className="flex items-center gap-1.5 text-txt-secondary text-xs font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            Payload Size
          </div>
          <p className="text-sm font-bold text-txt-primary mt-2">
            {wordCount} words
          </p>
        </div>
        <div className="p-4 rounded-xl bg-black/5 dark:bg-black/35 border border-border-main">
          <div className="flex items-center gap-1.5 text-txt-secondary text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-3.5 h-3.5" />
            Model Version
          </div>
          <p className="text-sm font-bold text-txt-primary mt-2">
            Llama-3.3-70b (Groq)
          </p>
        </div>
        <div className="p-4 rounded-xl bg-black/5 dark:bg-black/35 border border-border-main">
          <div className="flex items-center gap-1.5 text-txt-secondary text-xs font-semibold uppercase tracking-wider">
            <HardDrive className="w-3.5 h-3.5" />
            Data Retention
          </div>
          <p className="text-sm font-bold text-brand-primary mt-2">
            {retention}
          </p>
        </div>
      </div>

      {/* Dynamic Data Layout */}
      <div className="space-y-8 py-6">
        {sections.map((section, idx) => {
          const isList = section.items.length > 0;
          return (
            <div key={idx} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-txt-primary uppercase tracking-wider">
                {getSectionIcon(section.title)}
                {section.title}
              </h3>
              <div className="bg-black/5 dark:bg-black/25 p-6 rounded-2xl border border-border-main">
                {isList ? (
                  <ul className="list-disc pl-5 space-y-2 text-sm text-txt-primary leading-relaxed">
                    {section.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="hover:text-brand-secondary transition-colors">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <span className="inline">{children}</span>
                          }}
                        >
                          {item}
                        </ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-txt-primary leading-relaxed space-y-2">
                    <ReactMarkdown>
                      {section.rawText}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Source Payload Code Drawer */}
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold text-txt-secondary uppercase tracking-wider">
            <Terminal className="w-4.5 h-4.5" />
            Source Payload Preview
          </h3>
          <div className="bg-black/5 dark:bg-black/60 rounded-xl p-4 border border-border-main max-h-40 overflow-y-auto">
            <pre className="font-mono text-xs text-txt-primary dark:text-txt-secondary whitespace-pre-wrap leading-relaxed">
              {content}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
