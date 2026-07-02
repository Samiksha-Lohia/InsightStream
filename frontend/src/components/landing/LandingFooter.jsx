import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import Logo from './Logo';

export default function LandingFooter() {
  const currentYear = new Date().getFullYear();

  const sections = [
    {
      title: 'Platform',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'FAQs', href: '#faqs' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { name: 'API Reference', href: '#' },
        { name: 'System Status', href: '#' },
        { name: 'Documentation', href: '#' }
      ]
    },
    {
      title: 'Compliance',
      links: [
        { name: 'Terms of Service', href: '#' },
        { name: 'Privacy Policy', href: '#' },
        { name: 'Security Policy', href: '#' }
      ]
    }
  ];

  return (
    <footer className="w-full border-t border-lp-border/40 bg-black/40 py-16 px-6 md:px-12 select-none">
      <div className="max-w-[1320px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 items-start">
        {/* Brand Description */}
        <div className="lg:col-span-2 space-y-4">
          <a href="#" className="flex items-center gap-3 w-fit">
            <div className="p-1 rounded-xl bg-lp-primary/10 border border-lp-primary/20 text-lp-primary flex items-center justify-center">
              <Logo className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-lp-secondary">
                Insight<span className="text-lp-primary font-extrabold">Stream</span>
              </span>
              <span className="block text-[10px] text-lp-muted font-mono tracking-widest uppercase">
                AI Analysis Pipeline
              </span>
            </div>
          </a>
          <p className="text-xs md:text-sm text-lp-muted max-w-sm leading-relaxed">
            A premium, sub-second NLP document analysis workspace. Process metadata, nodes, and summaries backed by zero-delay Redis buffers.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="p-2 bg-white/5 border border-lp-border rounded-xl text-lp-muted hover:text-lp-primary hover:border-lp-primary/40 transition-all cursor-pointer" aria-label="Twitter">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href="#" className="p-2 bg-white/5 border border-lp-border rounded-xl text-lp-muted hover:text-lp-primary hover:border-lp-primary/40 transition-all cursor-pointer" aria-label="GitHub">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <a href="#" className="p-2 bg-white/5 border border-lp-border rounded-xl text-lp-muted hover:text-lp-primary hover:border-lp-primary/40 transition-all cursor-pointer" aria-label="LinkedIn">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>

        {/* Link Columns */}
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-lp-secondary uppercase border-b border-lp-border/30 pb-2">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-xs md:text-sm text-lp-muted hover:text-lp-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lp-primary/50 rounded-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright Notice */}
      <div className="max-w-[1320px] mx-auto mt-16 pt-8 border-t border-lp-border/20 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-lp-muted">
        <span>InsightStream Pipeline &copy; {currentYear} // System fully operational.</span>
        <span>Made with premium dark neon aesthetics.</span>
      </div>
    </footer>
  );
}
