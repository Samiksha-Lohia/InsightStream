import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';
import { Sparkles, History, FileText, Lock, X } from 'lucide-react';
import Logo from './landing/Logo';
import ProfileDropdown from './ProfileDropdown';

export default function Header({ theme, onThemeChange }) {
  const { user, updatePassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Password change states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const dropdownRef = useRef(null);

  // Unauthenticated user redirection logic
  useEffect(() => {
    if (!user && currentPath !== '/login' && currentPath !== '/register') {
      navigate('/login');
    }
  }, [user, currentPath, navigate]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle password update submit
  const handlePasswordUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      addToast('All password fields are required', 'error');
      return;
    }

    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      await updatePassword(oldPassword, newPassword);
      addToast('Password updated successfully!', 'success');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      addToast(err.message || 'Incorrect old password', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Get user initials for the avatar
  const getInitials = () => {
    if (!user || !user.username) return '?';
    const parts = user.username.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const isAuthPage = currentPath === '/login' || currentPath === '/register';

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-border-main py-4 px-6 md:px-12 flex justify-between items-center transition-all">
        {/* Brand Logo Link */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-1 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
            <Logo className="w-8 h-8" />
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

        {/* Navigation Elements - Redesigned, Decoupled & Fully Styled */}
        {!isAuthPage && user && (
          <div className="flex items-center gap-5 relative" ref={dropdownRef}>
            {/* Pill Box ONLY for navigation links */}
            <div className="flex gap-1 bg-black/10 dark:bg-black/25 p-1 rounded-xl border border-border-main relative items-center">
              {/* 1. Upload & Process Link */}
              <Link
                to="/"
                className={`relative px-4 py-2 rounded-lg flex items-center gap-2 text-xs md:text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                  currentPath === '/' ? 'text-brand-primary font-bold' : 'text-txt-secondary hover:text-txt-primary'
                }`}
              >
                {currentPath === '/' && (
                  <motion.div
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/15 border border-brand-primary/25 rounded-lg -z-10"
                  />
                )}
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">Upload & Process</span>
              </Link>

              {/* 2. Dashboard Link */}
              <Link
                to="/history"
                className={`relative px-4 py-2 rounded-lg flex items-center gap-2 text-xs md:text-sm font-semibold transition-colors duration-300 cursor-pointer ${
                  currentPath === '/history' ? 'text-brand-primary font-bold' : 'text-txt-secondary hover:text-txt-primary'
                }`}
              >
                {currentPath === '/history' && (
                  <motion.div
                    layoutId="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    className="absolute inset-0 bg-brand-primary/10 dark:bg-brand-primary/15 border border-brand-primary/25 rounded-lg -z-10"
                  />
                )}
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </div>

            {/* 3. Decoupled Profile Avatar button with zoom and hover ring feedback */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/30 hover:border-brand-primary flex items-center justify-center text-sm font-black text-brand-primary hover:bg-brand-primary/20 transition-all duration-300 cursor-pointer select-none hover:scale-105 active:scale-95 focus:outline-none shadow-md hover:shadow-brand-primary/15 ring-2 ring-offset-2 ring-offset-bg-main ring-transparent hover:ring-brand-primary/45"
            >
              {getInitials()}
            </button>

            {/* Profile Dropdown Popover */}
            <AnimatePresence>
              {dropdownOpen && (
                <ProfileDropdown
                  theme={theme}
                  onThemeChange={onThemeChange}
                  onClose={() => setDropdownOpen(false)}
                  onChangePasswordClick={() => setShowPasswordModal(true)}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </nav>

      {/* Viewport Overlay Password Change Modal - Relocated to avoid unmount bugs */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPasswordModal(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-md bg-bg-main border border-border-main p-8 rounded-3xl shadow-2xl z-10 space-y-6 text-txt-primary"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-border-main text-txt-secondary hover:text-txt-primary transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="space-y-1 text-center md:text-left">
                <div className="inline-flex p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary mb-1">
                  <Lock className="w-6 h-6 neon-text-glow" />
                </div>
                <h3 className="text-xl font-black text-txt-primary tracking-tight">
                  Update Password
                </h3>
                <p className="text-xs text-txt-secondary">
                  Secure your account by entering a new authorization password
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handlePasswordUpdateSubmit} className="space-y-4">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-primary/75 focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-txt-secondary/40 font-medium"
                  />
                </div>

                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-primary/75 focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-txt-secondary/40 font-medium"
                  />
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-txt-secondary uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-3 bg-black/25 rounded-xl border border-border-main text-sm text-txt-primary focus:outline-none focus:border-brand-primary/75 focus:ring-1 focus:ring-brand-primary/30 transition-all placeholder-txt-secondary/40 font-medium"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 rounded-xl border border-border-main text-sm font-bold text-txt-secondary hover:text-txt-primary hover:bg-white/5 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 py-3 rounded-xl bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-sm shadow-md hover:shadow-brand-primary/10 transition-all duration-300 relative cursor-pointer active:scale-[0.98] disabled:opacity-55 disabled:cursor-not-allowed border border-white/10"
                  >
                    {passwordLoading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block vertical-middle" />
                    ) : (
                      'Update'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
