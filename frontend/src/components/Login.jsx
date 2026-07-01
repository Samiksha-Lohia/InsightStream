import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';
import { Mail, Lock, LogIn, Sparkles, FileText } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast('Please enter both email and password', 'error');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in successfully!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full max-w-md"
    >
      <div className="glass-panel p-8 rounded-3xl border border-border-main shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top visual glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-brand-primary/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-brand-secondary/10 blur-3xl" />

        {/* Header/Branding */}
        <div className="text-center space-y-2 relative z-10">
          <div className="inline-flex p-3 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-2">
            <FileText className="w-8 h-8 neon-text-glow animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-txt-primary tracking-tight">
            Insight<span className="text-brand-secondary font-extrabold">Stream</span>
          </h2>
          <p className="text-sm text-txt-secondary">
            Sign in to access your AI analysis pipeline
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-5 h-5 text-txt-secondary" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-12 pr-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-primary/75 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium placeholder-txt-secondary/50"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-txt-secondary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-primary/75 focus:ring-1 focus:ring-brand-primary/30 transition-all font-medium placeholder-txt-secondary/50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-bold text-sm shadow-lg hover:shadow-brand-primary/20 transition-all duration-300 relative cursor-pointer active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed group border border-white/10"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-txt-secondary relative z-10 pt-2 border-t border-border-main/40">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-secondary hover:text-brand-secondary/80 font-bold transition-colors underline decoration-brand-secondary/30 hover:decoration-brand-secondary"
          >
            Create account
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
