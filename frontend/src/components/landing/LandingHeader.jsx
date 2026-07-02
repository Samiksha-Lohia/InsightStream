import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Menu, X, ArrowRight } from 'lucide-react';
import Logo from './Logo';

export default function LandingHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQs', href: '#faqs' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full lp-glass-panel border-b border-lp-border/40 py-4 px-6 md:px-12 flex justify-between items-center transition-all">
      {/* Brand logo */}
      <a href="#" className="flex items-center gap-3 group">
        <div className="p-1 rounded-xl bg-lp-primary/10 border border-lp-primary/20 text-lp-primary group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
          <Logo className="w-8 h-8" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-lp-secondary group-hover:text-lp-primary transition-colors">
            Insight<span className="text-lp-primary font-extrabold">Stream</span>
          </span>
          <span className="block text-[10px] text-lp-muted font-mono tracking-widest uppercase">
            AI Analysis Pipeline
          </span>
        </div>
      </a>

      {/* Desktop Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        {navLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            className="text-sm font-medium text-lp-muted hover:text-lp-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary/50 rounded-sm"
          >
            {link.name}
          </a>
        ))}
      </nav>

      {/* Auth Actions */}
      <div className="hidden md:flex items-center gap-4">
        <Link
          to="/login"
          className="text-sm font-semibold text-lp-secondary hover:text-lp-primary transition-colors px-4 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary/50 rounded-lg"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-lp-primary hover:bg-lp-hover text-lp-bg text-sm font-bold shadow-[0_0_15px_rgba(120,252,214,0.25)] hover:shadow-[0_0_20px_rgba(0,255,182,0.4)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary/50"
        >
          Get Started
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-xl text-lp-muted hover:text-lp-primary hover:bg-white/5 border border-transparent hover:border-lp-border transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-primary/50"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Drawer (Framer Motion) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 mx-4 p-6 rounded-2xl lp-glass-panel border border-lp-border flex flex-col gap-6 shadow-2xl md:hidden"
          >
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-lp-muted hover:text-lp-primary transition-colors py-1 border-b border-white/5"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            <div className="flex flex-col gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 rounded-xl border border-lp-border text-sm font-bold text-lp-secondary hover:text-lp-primary hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-3 rounded-xl bg-lp-primary hover:bg-lp-hover text-lp-bg text-sm font-bold shadow-md hover:shadow-lp-primary/10 transition-all flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
