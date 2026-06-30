import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto w-full"
            >
              <div className={`glass-panel neon-glow flex items-start gap-3 p-4 rounded-xl shadow-lg border ${
                toast.type === 'success' 
                  ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-300' 
                  : toast.type === 'error' 
                  ? 'border-rose-500/30 bg-rose-950/20 text-rose-300' 
                  : 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary'
              }`}>
                <div className="flex-shrink-0 mt-0.5">
                  {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
                  {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-400" />}
                </div>
                
                <div className="flex-grow text-sm font-medium">
                  {toast.message}
                </div>

                <button 
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 text-txt-secondary hover:text-txt-primary transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
