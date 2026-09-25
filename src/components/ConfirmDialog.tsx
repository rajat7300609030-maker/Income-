import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConfirmDialog: React.FC = () => {
  const { deleteConfirm, closeDeleteConfirm } = useApp();

  if (!deleteConfirm?.isOpen) return null;

  return (
    <AnimatePresence>
      <div
        key="confirm-dialog-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
      >
        <motion.div
          key="confirm-dialog-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm"
          >
            <AlertTriangle className="w-6 h-6" />
          </motion.div>

          <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-2">
            {deleteConfirm.title}
          </h3>

          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {deleteConfirm.message}
          </p>

          <div className="grid grid-cols-2 gap-3 w-full">
            <motion.button
              id="confirm-dialog-cancel"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={closeDeleteConfirm}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all shadow-2xs"
            >
              Cancel
            </motion.button>
            <motion.button
              id="confirm-dialog-delete"
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={deleteConfirm.onConfirm}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-bold text-sm shadow-md shadow-rose-600/30 hover:from-rose-700 hover:to-red-700 transition-all flex items-center justify-center space-x-1.5 border border-rose-400/30"
            >
              <Trash2 className="w-4 h-4 text-rose-100" />
              <span>Delete</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
