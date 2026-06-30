import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, History, Settings, FileText } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { path: '/', label: 'Upload & Process', icon: Sparkles },
    { path: '/history', label: 'Dashboard', icon: History },
    { path: '/preferences', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full glass-panel border-b border-border-main py-4 px-6 md:px-12 flex justify-between items-center transition-all">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="p-2 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary group-hover:scale-105 transition-transform duration-300">
          <FileText className="w-6 h-6 neon-text-glow" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-txt-primary group-hover:text-brand-primary transition-colors">
            Insight<span className="text-brand-secondary font-extrabold">Stream</span>
          </span>
          <span className="block text-[10px] text-txt-secondary font-mono tracking-widest uppercase">
            AI Analysis Pipeline
          </span>
        </div>
      </Link>

      <div className="flex gap-1 bg-black/10 dark:bg-black/25 p-1 rounded-xl border border-border-main relative">
        {links.map((link) => {
          const isActive = currentPath === link.path;
          const Icon = link.icon;

          return (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                isActive ? 'text-brand-primary' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active-pill"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/15 border border-brand-primary/30 rounded-lg -z-10"
                />
              )}
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
