import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center space-y-2 pointer-events-none w-full max-w-xs px-4">
      <AnimatePresence>
        {toasts.map((t, idx) => (
          <motion.div
            key={`${t.id || 'toast'}-${idx}`}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`pointer-events-auto flex items-center space-x-2.5 px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium backdrop-blur-md border ${
              t.type === 'success'
                ? 'bg-emerald-900/90 text-white border-emerald-500/30'
                : t.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-500/30'
                : 'bg-slate-900/90 text-white border-slate-700/50'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span className="flex-1 leading-tight">{t.message}</span>
            <button
              id={`toast-dismiss-${t.id}`}
              onClick={() => dismissToast(t.id)}
              className="text-white/60 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
