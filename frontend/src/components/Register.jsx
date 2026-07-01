import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';
import { Mail, Lock, User, UserPlus, FileText } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !email || !password || !confirmPassword) {
      addToast('Please fill out all registration fields', 'error');
      return;
    }

    if (password.length < 6) {
      addToast('Password must be at least 6 characters long', 'error');
      return;
    }

    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(username, email, password);
      addToast('Registration successful! Welcome to InsightStream.', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.message || 'Registration failed. Try a different username/email.', 'error');
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
          <div className="inline-flex p-3 rounded-2xl bg-brand-secondary/10 border border-brand-secondary/20 text-brand-secondary mb-2">
            <FileText className="w-8 h-8 neon-text-glow animate-pulse" />
          </div>
          <h2 className="text-3xl font-black text-txt-primary tracking-tight">
            Insight<span className="text-brand-primary font-extrabold">Stream</span>
          </h2>
          <p className="text-sm text-txt-secondary">
            Create an account to begin parsing payloads
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Username field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
              Username
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 w-5 h-5 text-txt-secondary" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="developer123"
                className="w-full pl-12 pr-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-secondary/75 focus:ring-1 focus:ring-brand-secondary/30 transition-all font-medium placeholder-txt-secondary/50"
              />
            </div>
          </div>

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
                className="w-full pl-12 pr-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-secondary/75 focus:ring-1 focus:ring-brand-secondary/30 transition-all font-medium placeholder-txt-secondary/50"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-txt-secondary" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full pl-12 pr-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-secondary/75 focus:ring-1 focus:ring-brand-secondary/30 transition-all font-medium placeholder-txt-secondary/50"
              />
            </div>
          </div>

          {/* Confirm Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-txt-secondary uppercase tracking-wider">
              Confirm Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 w-5 h-5 text-txt-secondary" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full pl-12 pr-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-secondary/75 focus:ring-1 focus:ring-brand-secondary/30 transition-all font-medium placeholder-txt-secondary/50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-brand-secondary hover:bg-brand-secondary/90 text-white font-bold text-sm shadow-lg hover:shadow-brand-secondary/20 transition-all duration-300 relative cursor-pointer active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed group border border-white/10"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-5 h-5 transition-transform group-hover:scale-105" />
                Sign Up
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-xs text-txt-secondary relative z-10 pt-2 border-t border-border-main/40">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-primary hover:text-brand-primary/80 font-bold transition-colors underline decoration-brand-primary/30 hover:decoration-brand-primary"
          >
            Log In
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
