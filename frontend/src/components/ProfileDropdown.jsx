import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthProvider';
import { useToast } from '../context/ToastProvider';
import { Sliders, Key, LogOut, Eye, Bell, ShieldAlert } from 'lucide-react';

export default function ProfileDropdown({ theme, onThemeChange, onClose, onChangePasswordClick }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();

  const [showSettings, setShowSettings] = useState(false);

  // Quick settings states synced with localStorage
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('setting-email-alerts') === 'true');
  const [browserAlerts, setBrowserAlerts] = useState(() => localStorage.getItem('setting-browser-alerts') !== 'false');
  const [audioAlerts, setAudioAlerts] = useState(() => localStorage.getItem('setting-audio-alerts') === 'true');
  const [retention, setRetention] = useState(() => localStorage.getItem('setting-retention') || 'Indefinite');

  const handleToggle = (setting, stateSetter, stateVal) => {
    const newVal = !stateVal;
    stateSetter(newVal);
    localStorage.setItem(`setting-${setting}`, newVal.toString());
    addToast(`Quick Update: ${setting} is now ${newVal ? 'ENABLED' : 'DISABLED'}`, 'success');
  };

  const handleRetentionChange = (option) => {
    setRetention(option);
    localStorage.setItem('setting-retention', option);
    addToast(`Quick Update: Data retention period is now ${option}`, 'success');
  };

  const themes = [
    { id: 'dark', name: 'Dark' },
    { id: 'light', name: 'Light' },
    { id: 'cyberpunk', name: 'Cyberpunk' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
      className="absolute right-0 top-full mt-3 w-80 bg-bg-main border border-border-main rounded-2xl shadow-2xl overflow-hidden z-50 text-txt-primary"
    >
      {/* User Profile Header */}
      <div className="p-5 border-b border-border-main/50 bg-black/15">
        <p className="text-xs text-txt-secondary font-semibold uppercase tracking-wider">Account</p>
        <p className="text-base font-bold text-txt-primary truncate mt-1">{user?.username}</p>
        <p className="text-xs text-txt-secondary truncate mt-0.5">{user?.email}</p>
      </div>

      {/* Options List */}
      <div className="p-2 space-y-1">
        {/* Settings Collapsible Button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold hover:bg-white/5 transition-all text-left cursor-pointer ${
            showSettings ? 'text-brand-primary bg-white/5' : 'text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <span className="flex items-center gap-3">
            <Sliders className="w-4.5 h-4.5" />
            Quick Settings
          </span>
          <span className="text-xs text-txt-secondary bg-black/25 px-2 py-0.5 rounded-full border border-border-main">
            {showSettings ? 'Hide' : 'Show'}
          </span>
        </button>

        {/* Quick Settings Panel (Collapsible) */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-black/15 rounded-xl border border-border-main/40 mx-2 p-3 space-y-3"
            >
              {/* Theme Selector */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-brand-primary" /> Visual Theme
                </p>
                <div className="flex gap-1 p-0.5 bg-black/20 rounded-lg border border-border-main/50">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onThemeChange(t.id)}
                      className={`flex-1 text-center py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                        theme === t.id
                          ? 'bg-brand-primary text-white shadow-sm'
                          : 'text-txt-secondary hover:text-txt-primary'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Switch Toggles */}
              <div className="space-y-2 pt-1 border-t border-border-main/30">
                <p className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-brand-secondary" /> Alerts
                </p>
                
                {/* Email Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-txt-secondary font-medium">Email Alerts</span>
                  <button
                    onClick={() => handleToggle('email-alerts', setEmailAlerts, emailAlerts)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                      emailAlerts ? 'bg-brand-primary' : 'bg-black/40 border border-border-main'
                    }`}
                  >
                    <div className={`w-3.8 h-3.8 rounded-full bg-white transition-transform ${emailAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Browser Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-txt-secondary font-medium">Browser Toasts</span>
                  <button
                    onClick={() => handleToggle('browser-alerts', setBrowserAlerts, browserAlerts)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                      browserAlerts ? 'bg-brand-primary' : 'bg-black/40 border border-border-main'
                    }`}
                  >
                    <div className={`w-3.8 h-3.8 rounded-full bg-white transition-transform ${browserAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Audio Toggle */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-txt-secondary font-medium">Audio Chime</span>
                  <button
                    onClick={() => handleToggle('audio-alerts', setAudioAlerts, audioAlerts)}
                    className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center cursor-pointer ${
                      audioAlerts ? 'bg-brand-primary' : 'bg-black/40 border border-border-main'
                    }`}
                  >
                    <div className={`w-3.8 h-3.8 rounded-full bg-white transition-transform ${audioAlerts ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Data Retention */}
              <div className="space-y-1.5 pt-1 border-t border-border-main/30">
                <p className="text-[11px] font-bold text-txt-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-brand-secondary" /> Data Retention
                </p>
                <div className="grid grid-cols-2 gap-1 bg-black/20 p-0.5 rounded-lg border border-border-main/50">
                  {['24 Hours', '7 Days', '30 Days', 'Indefinite'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleRetentionChange(opt)}
                      className={`text-center py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                        retention === opt
                          ? 'bg-brand-secondary text-white shadow-sm'
                          : 'text-txt-secondary hover:text-txt-primary'
                      }`}
                    >
                      {opt === '24 Hours' ? '24h' : opt === '7 Days' ? '7d' : opt === '30 Days' ? '30d' : 'Indef.'}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Change Password Button */}
        <button
          onClick={() => {
            onChangePasswordClick();
            onClose(); // close dropdown popover
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-txt-secondary hover:text-txt-primary hover:bg-white/5 transition-all text-left cursor-pointer"
        >
          <Key className="w-4.5 h-4.5 text-brand-secondary" />
          Change Password
        </button>

        {/* Logout Button */}
        <button
          onClick={() => {
            logout();
            onClose();
            addToast('Session cleared. Goodbye!', 'info');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/15 transition-all text-left cursor-pointer border-t border-border-main/30 mt-1"
        >
          <LogOut className="w-4.5 h-4.5" />
          Sign Out
        </button>
      </div>
    </motion.div>
  );
}
