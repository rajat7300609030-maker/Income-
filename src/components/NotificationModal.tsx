import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, ArrowDownLeft, ArrowUpRight, Handshake, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotificationModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen = false, onClose = () => {} }) => {
  const { notifications } = useApp();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        key="notifications-modal-backdrop"
        className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-slate-950/40 backdrop-blur-xs"
      >
        <motion.div
          key="notifications-modal-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col max-h-[80vh] overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 15 }}
                className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs"
              >
                <Bell className="w-4 h-4" />
              </motion.div>
              <h3 className="font-bold text-slate-800 text-base">Notifications</h3>
            </div>
            <motion.button
              id="notification-modal-close"
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 py-2">
            {notifications.map((n, idx) => (
              <motion.div
                key={`${n.id || 'notif'}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ x: 2 }}
                className="py-3 flex items-start space-x-3 rounded-xl px-1 hover:bg-slate-50/60 transition-colors"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                    n.type === 'income'
                      ? 'bg-emerald-100 text-emerald-600'
                      : n.type === 'expense'
                      ? 'bg-rose-100 text-rose-600'
                      : n.type === 'payment'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-amber-100 text-amber-600'
                  }`}
                >
                  {n.type === 'income' && <ArrowDownLeft className="w-4 h-4" />}
                  {n.type === 'expense' && <ArrowUpRight className="w-4 h-4" />}
                  {n.type === 'payment' && <Handshake className="w-4 h-4" />}
                  {n.type === 'alert' && <Bell className="w-4 h-4" />}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-800 truncate">{n.title}</p>
                    <span className="text-[10px] text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-tight">{n.message}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <motion.button
              id="notification-mark-read"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark All as Read</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
