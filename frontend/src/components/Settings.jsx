import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, ShieldAlert, Bell, Sliders, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastProvider';

export default function Settings({ theme, onThemeChange }) {
  const { addToast } = useToast();
  
  // Settings states loaded from localStorage or defaults
  const [retention, setRetention] = useState(() => localStorage.getItem('setting-retention') || 'Indefinite');
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('setting-email-alerts') === 'true');
  const [browserAlerts, setBrowserAlerts] = useState(() => localStorage.getItem('setting-browser-alerts') !== 'false'); // Default to true
  const [audioAlerts, setAudioAlerts] = useState(() => localStorage.getItem('setting-audio-alerts') === 'true');

  const themes = [
    { id: 'dark', name: 'Dark Mode', desc: 'Minimalist glassmorphism with purple accents', bg: 'bg-[#0a0b10] border-purple-500/30' },
    { id: 'light', name: 'Light Slate', desc: 'Crisp clean layout with royal indigo lines', bg: 'bg-[#f8fafc] border-indigo-500/30' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', desc: 'High-contrast grid overlay, hot pink neon', bg: 'bg-[#030307] border-cyan-500/30' }
  ];

  const retentionOptions = ['24 Hours', '7 Days', '30 Days', 'Indefinite'];

  // Sync settings with LocalStorage
  const handleToggle = (setting, stateSetter, stateVal) => {
    const newVal = !stateVal;
    stateSetter(newVal);
    localStorage.setItem(`setting-${setting}`, newVal.toString());
    addToast(`Preferences updated: ${setting} is now ${newVal ? 'ENABLED' : 'DISABLED'}`, 'success');
  };

  const handleRetentionChange = (option) => {
    setRetention(option);
    localStorage.setItem('setting-retention', option);
    addToast(`Data retention period set to: ${option}`, 'success');
  };

  const ToggleSwitch = ({ active, onChange }) => (
    <div
      onClick={onChange}
      className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors relative flex items-center ${
        active ? 'bg-brand-primary' : 'bg-black/30 border border-border-main'
      }`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
        className="w-5 h-5 rounded-full bg-white shadow-md"
        animate={{ x: active ? 20 : 0 }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="max-w-4xl w-full mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-txt-primary tracking-tight">
          System Preferences
        </h1>
        <p className="text-sm text-txt-secondary mt-1">
          Customize UI aesthetics, layout themes, notifications, and ledger retention policies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Theme Configuration Panel */}
        <div className="md:col-span-3 glass-panel p-6 rounded-3xl border border-border-main space-y-4">
          <h3 className="text-lg font-bold text-txt-primary flex items-center gap-2">
            <Eye className="w-5 h-5 text-brand-primary" />
            Visual Themes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {themes.map((t) => {
              const isSelected = theme === t.id;
              
              return (
                <div
                  key={t.id}
                  onClick={() => onThemeChange(t.id)}
                  className={`glass-panel p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 relative flex flex-col justify-between h-36 hover:scale-[1.01] ${
                    isSelected ? `${t.bg} neon-glow ring-1 ring-brand-primary` : 'border-border-main hover:border-brand-primary/40'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-txt-primary text-sm flex items-center justify-between">
                      {t.name}
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-primary" />}
                    </h4>
                    <p className="text-xs text-txt-secondary mt-1 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <span className="w-4.5 h-4.5 rounded-full bg-brand-primary border border-white/20" />
                    <span className="w-4.5 h-4.5 rounded-full bg-brand-secondary border border-white/20" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Data Retention Policy */}
        <div className="glass-panel p-6 rounded-3xl border border-border-main space-y-4">
          <h3 className="text-lg font-bold text-txt-primary flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-secondary" />
            Ledger Data Retention
          </h3>
          <p className="text-xs text-txt-secondary leading-relaxed">
            Specify how long processed AI insights and raw payload content stay cached inside the MongoDB & Redis servers.
          </p>

          <div className="space-y-2 pt-2">
            {retentionOptions.map((option) => {
              const isActive = retention === option;
              
              return (
                <button
                  key={option}
                  onClick={() => handleRetentionChange(option)}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-brand-secondary/10 border-brand-secondary text-brand-secondary neon-glow' 
                      : 'bg-black/10 border-border-main text-txt-secondary hover:border-brand-secondary/40 hover:text-txt-primary'
                  }`}
                >
                  {option}
                  {isActive && <div className="w-2 h-2 rounded-full bg-brand-secondary animate-ping" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Notification Settings */}
        <div className="md:col-span-2 glass-panel p-6 rounded-3xl border border-border-main space-y-4">
          <h3 className="text-lg font-bold text-txt-primary flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand-primary" />
            Notification Settings
          </h3>
          <p className="text-xs text-txt-secondary leading-relaxed">
            Stay updated in real time when long-running queue processes complete, even when navigations occur.
          </p>

          <div className="divide-y divide-border-main/50">
            {/* Toggle row 1 */}
            <div className="flex justify-between items-center py-4">
              <div>
                <h4 className="text-sm font-bold text-txt-primary">Email Notifications</h4>
                <p className="text-xs text-txt-secondary mt-0.5">Send a digest report of completed insights.</p>
              </div>
              <ToggleSwitch 
                active={emailAlerts} 
                onChange={() => handleToggle('email-alerts', setEmailAlerts, emailAlerts)} 
              />
            </div>
            
            {/* Toggle row 2 */}
            <div className="flex justify-between items-center py-4">
              <div>
                <h4 className="text-sm font-bold text-txt-primary">Browser Toast Notifications</h4>
                <p className="text-xs text-txt-secondary mt-0.5">Display persistent floating alerts in the browser workspace.</p>
              </div>
              <ToggleSwitch 
                active={browserAlerts} 
                onChange={() => handleToggle('browser-alerts', setBrowserAlerts, browserAlerts)} 
              />
            </div>

            {/* Toggle row 3 */}
            <div className="flex justify-between items-center py-4">
              <div>
                <h4 className="text-sm font-bold text-txt-primary">Auditory Alerts</h4>
                <p className="text-xs text-txt-secondary mt-0.5">Play a notification chime when the pipeline finishes execution.</p>
              </div>
              <ToggleSwitch 
                active={audioAlerts} 
                onChange={() => handleToggle('audio-alerts', setAudioAlerts, audioAlerts)} 
              />
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
