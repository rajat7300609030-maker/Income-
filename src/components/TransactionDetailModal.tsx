import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  Clock,
  Calendar,
  CreditCard,
  Tag,
  User,
  FileText,
  Hash,
  Edit3,
  Trash2,
  Copy,
  Check,
  Pause,
  Play,
} from 'lucide-react';
import { Transaction } from '../types';
import { useApp } from '../context/AppContext';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { persons } = useApp();
  const [secondsRemaining, setSecondsRemaining] = useState<number>(5);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [copiedRef, setCopiedRef] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format currency in Indian format
  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Reset timer on open
  useEffect(() => {
    if (!isOpen || !transaction) {
      setSecondsRemaining(5);
      setIsPaused(false);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      return;
    }

    setSecondsRemaining(5);
    setIsPaused(false);

    // 1-second interval to update remaining seconds for user display
    countdownIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // 5-second automatic close timeout
    timerRef.current = setTimeout(() => {
      onClose();
    }, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isOpen, transaction, onClose]);

  const handleCopyRef = (refText?: string) => {
    if (!refText) return;
    navigator.clipboard?.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const isIncome = transaction?.type === 'Income';
  const isExpense = transaction?.type === 'Expense';
  const isPayment = transaction?.type === 'Payment';
  const isPaid = isPayment && transaction?.paymentDirection === 'Paid';

  // Resolve Person Name
  const resolvedPersonName = transaction?.personName || (transaction?.personId && persons.find(p => p.id === transaction.personId)?.name) || '';

  const typeColor = isIncome
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400'
    : isExpense
    ? 'text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'
    : 'text-amber-800 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';

  const bannerGradient = isIncome
    ? 'from-emerald-500 via-emerald-600 to-teal-600'
    : isExpense
    ? 'from-rose-500 via-rose-600 to-pink-600'
    : 'from-amber-500 via-amber-600 to-orange-600';

  return (
    <AnimatePresence>
      {isOpen && transaction && (
        <motion.div
          key="transaction-detail-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          id="transaction-detail-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md transition-all"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            key="transaction-detail-floating-card"
          id="transaction-detail-floating-card"
          initial={{ opacity: 0, scale: 0.88, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="w-full max-w-sm bg-white dark:bg-black rounded-3xl shadow-2xl overflow-hidden border border-white/50 dark:border-neutral-800 flex flex-col relative"
        >
          {/* Top Progress Countdown Bar (5 Seconds Auto-close indicator) */}
          <div className="w-full bg-slate-100 dark:bg-neutral-900 h-1.5 overflow-hidden relative">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              className={`h-full ${
                isIncome ? 'bg-emerald-500' : isExpense ? 'bg-rose-500' : 'bg-amber-500'
              }`}
            />
          </div>

          {/* Card Header Banner */}
          <div className={`p-5 text-white bg-gradient-to-r ${bannerGradient} relative`}>
            {/* Close button */}
            <motion.button
              id="transaction-detail-close-btn"
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors shadow-xs"
              title="Close window"
            >
              <X className="w-4 h-4" />
            </motion.button>

            {/* Auto Close Badge */}
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-xs text-[10px] font-semibold text-white/95 mb-2.5 border border-white/10">
              <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Auto-closing in {secondsRemaining}s</span>
            </div>

            {/* Transaction Type & Icon */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                {isIncome && <ArrowDownLeft className="w-4 h-4" />}
                {isExpense && <ArrowUpRight className="w-4 h-4" />}
                {isPayment && <Handshake className="w-4 h-4" />}
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                {transaction.type}
                {transaction.paymentDirection ? ` • ${transaction.paymentDirection}` : ''}
              </span>
            </div>

            {/* Amount Display */}
            <div className="mt-3">
              <p className="text-[11px] text-white/80 font-medium">Transaction Amount</p>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
                {isExpense || isPaid ? '-' : '+'}
                {formatINR(transaction.amount)}
              </h2>
            </div>
          </div>

          {/* Full Transaction Details Body */}
          <div className="p-5 space-y-3.5 max-h-[60vh] overflow-y-auto">
            {/* Person / Party Name */}
            {resolvedPersonName && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    isPayment ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400'
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      Party / Person
                    </p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{resolvedPersonName}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${
                  isPayment ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40'
                }`}>
                  Account Ledger
                </span>
              </div>
            )}

            {/* Category (for Expenses/Income) */}
            {transaction.category && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      Category
                    </p>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{transaction.category}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Date & Time Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Date</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{transaction.date}</p>
              </div>

              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">Method</span>
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{transaction.paymentMethod}</p>
              </div>
            </div>

            {/* Reference Number */}
            {transaction.referenceNumber && (
              <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                    <Hash className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                      Ref / UTR Number
                    </p>
                    <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100">
                      {transaction.referenceNumber}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCopyRef(transaction.referenceNumber)}
                  className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-neutral-800 text-slate-500 dark:text-slate-400 transition-colors"
                  title="Copy reference number"
                >
                  {copiedRef ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </motion.button>
              </div>
            )}

            {/* Note / Remarks */}
            {transaction.note && (
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-black border border-slate-100 dark:border-neutral-800">
                <div className="flex items-center space-x-1.5 text-slate-400 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide">
                    Note / Description
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-neutral-900 p-2 rounded-xl border border-slate-100 dark:border-neutral-800">
                  "{transaction.note}"
                </p>
              </div>
            )}

            {/* System ID & Record status */}
            <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>ID: {transaction.id}</span>
              <span className="inline-flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Active Ledger Record</span>
              </span>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="p-4 bg-slate-50/80 dark:bg-black border-t border-slate-100 dark:border-neutral-800 flex items-center space-x-2">
            {onEdit && (
              <motion.button
                id="transaction-detail-edit-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-900/30 transition-all border border-blue-400/40 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-300 drop-shadow-xs" />
                <span>Edit Record</span>
              </motion.button>
            )}

            {onDelete && (
              <motion.button
                id="transaction-detail-delete-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  onClose();
                  onDelete(transaction);
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer"
                title="Delete this record"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </motion.button>
            )}

            <motion.button
              id="transaction-detail-dismiss-btn"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className={`py-2.5 px-4 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors shadow-2xs cursor-pointer ${
                !onEdit && !onDelete ? 'w-full' : ''
              }`}
            >
              Close Now
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
