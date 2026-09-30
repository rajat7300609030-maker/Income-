import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  Calendar,
  Clock,
  User,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Transaction, PaymentMethod } from '../types';
import { useApp } from '../context/AppContext';
import { formatINR } from '../services/calculations';

export const PAYMENT_METHOD_CONFIGS: Record<PaymentMethod, {
  label: string;
  badgeClass: string;
  borderClass: string;
  dotColor: string;
  activeClass: string;
  inactiveClass: string;
}> = {
  UPI: {
    label: 'UPI',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 border border-blue-300/60',
    borderClass: 'border-blue-400',
    dotColor: 'bg-blue-500',
    activeClass: 'bg-blue-600 text-white border-blue-600 shadow-xs',
    inactiveClass: 'bg-white dark:bg-black text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60 hover:bg-blue-50',
  },
  Cash: {
    label: 'Cash',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300/60',
    borderClass: 'border-emerald-400',
    dotColor: 'bg-emerald-500',
    activeClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    inactiveClass: 'bg-white dark:bg-black text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60 hover:bg-emerald-50',
  },
  Bank: {
    label: 'Bank',
    badgeClass: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300 border border-cyan-300/60',
    borderClass: 'border-cyan-400',
    dotColor: 'bg-cyan-500',
    activeClass: 'bg-cyan-600 text-white border-cyan-600 shadow-xs',
    inactiveClass: 'bg-white dark:bg-black text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/60 hover:bg-cyan-50',
  },
  School: {
    label: 'School',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 border border-teal-300/60',
    borderClass: 'border-teal-400',
    dotColor: 'bg-teal-500',
    activeClass: 'bg-teal-600 text-white border-teal-600 shadow-xs',
    inactiveClass: 'bg-white dark:bg-black text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/60 hover:bg-teal-50',
  },
  Salary: {
    label: 'Salary',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/60 dark:text-fuchsia-300 border border-fuchsia-300/60',
    borderClass: 'border-fuchsia-400',
    dotColor: 'bg-fuchsia-500',
    activeClass: 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-xs',
    inactiveClass: 'bg-white dark:bg-black text-fuchsia-700 dark:text-fuchsia-400 border-fuchsia-200 dark:border-fuchsia-900/60 hover:bg-fuchsia-50',
  },
  Other: {
    label: 'Other',
    badgeClass: 'bg-slate-200 text-slate-800 dark:bg-neutral-800 dark:text-slate-200 border border-slate-300/60',
    borderClass: 'border-slate-400',
    dotColor: 'bg-slate-500',
    activeClass: 'bg-slate-700 text-white border-slate-700 shadow-xs',
    inactiveClass: 'bg-white dark:bg-black text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:bg-slate-50',
  },
};

export const cleanCategory = (cat?: string): string => {
  if (!cat) return '';
  return cat.replace(/\s*\(Payment\)/gi, '').trim();
};

export const cleanPaymentNote = (note?: string): string => {
  if (!note) return '';
  return note
    .replace(/\s*\(recv\)/gi, '')
    .replace(/\s*\(received\)/gi, '')
    .replace(/\s*\(paid\)/gi, '')
    .replace(/\s*received\s+for\s+person/gi, '')
    .replace(/\s*received\s+for\s+[^\n•]+/gi, '')
    .replace(/\s*payment\s+received\s+from\s+[^\n•]+/gi, '')
    .replace(/\s*payment\s+made\s+to\s+[^\n•]+/gi, '')
    .replace(/\s*recv\b/gi, '')
    .trim();
};

/**
 * Format date string strictly to DD/MM/YYYY
 */
export function formatDDMMYYYY(dateStr?: string): string {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0];
  if (clean.includes('-')) {
    const parts = clean.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  } catch {}
  return dateStr;
}

export interface TransactionCardProps {
  transaction: Transaction;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
  onClick?: (tx: Transaction) => void;
  displayMode?: 'date' | 'time' | 'both';
  className?: string;
  idPrefix?: string;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction: tx,
  onEdit,
  onDelete,
  onClick,
  displayMode = 'both',
  className = '',
  idPrefix = 'tx',
}) => {
  const { persons, payments } = useApp();

  const isIncome = tx.type === 'Income';
  const isExpense = tx.type === 'Expense';
  const isPayment = tx.type === 'Payment';
  const isPaid = isPayment && tx.paymentDirection === 'Paid';

  // Resolve person name and type reliably across state
  let resolvedPersonName = (tx.personName || '').trim();
  let resolvedPersonType = '';

  if (tx.personId) {
    const found = persons.find(p => p.id === tx.personId);
    if (found) {
      resolvedPersonName = found.name || resolvedPersonName;
      resolvedPersonType = found.type;
    }
  }

  if (!resolvedPersonType && resolvedPersonName) {
    const found = persons.find(
      p => p.name && p.name.trim().toLowerCase() === resolvedPersonName.toLowerCase()
    );
    if (found) {
      resolvedPersonType = found.type;
      resolvedPersonName = found.name;
    }
  }

  if ((!resolvedPersonName || !resolvedPersonType) && (tx.sourceId || tx.id)) {
    const pay = payments.find(p => p.id === tx.sourceId || `tx_${p.id}` === tx.id);
    if (pay) {
      if (!resolvedPersonName) resolvedPersonName = pay.personName || '';
      if (pay.personId) {
        const found = persons.find(p => p.id === pay.personId);
        if (found) {
          resolvedPersonName = found.name || resolvedPersonName;
          resolvedPersonType = found.type;
        }
      }
    }
  }

  // Exact card styling matching the Daily Financial Ledger payment card
  const cardClasses = isPayment
    ? 'bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white dark:from-amber-950/40 dark:via-neutral-900 dark:to-black border-amber-300 dark:border-amber-700/80 border-l-4 border-l-amber-500 hover:border-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/60 shadow-xs shadow-amber-500/10'
    : isExpense
    ? 'bg-gradient-to-r from-rose-50/90 via-rose-50/50 to-white dark:from-rose-950/40 dark:via-neutral-900 dark:to-black border-rose-300 dark:border-rose-700/80 border-l-4 border-l-rose-500 hover:border-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/60 shadow-xs shadow-rose-500/10'
    : 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/50 to-white dark:from-emerald-950/40 dark:via-neutral-900 dark:to-black border-emerald-300 dark:border-emerald-700/80 border-l-4 border-l-emerald-500 hover:border-emerald-400 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/60 shadow-xs shadow-emerald-500/10';

  const iconBoxClasses = isIncome
    ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
    : isExpense
    ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
    : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/50';

  const amountColor = isIncome
    ? 'text-emerald-600 dark:text-emerald-400'
    : isExpense
    ? 'text-rose-600 dark:text-rose-400'
    : 'text-amber-600 dark:text-amber-400';

  const amountSign = isExpense || isPaid ? '-' : '+';

  return (
    <motion.div
      whileHover={{ x: 3 }}
      onClick={() => onClick && onClick(tx)}
      className={`rounded-2xl p-3.5 border flex items-center justify-between transition-all ${
        onClick ? 'cursor-pointer' : ''
      } ${cardClasses} ${className}`}
    >
      {/* Left Side: Icon & Details */}
      <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
        <motion.div
          whileHover={{ scale: 1.15, rotate: 10 }}
          transition={{ type: 'spring', stiffness: 400 }}
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${iconBoxClasses}`}
        >
          {isIncome && <ArrowDownLeft className="w-5 h-5" />}
          {isExpense && <ArrowUpRight className="w-5 h-5" />}
          {isPayment && <Handshake className="w-5 h-5" />}
        </motion.div>

        <div className="min-w-0 flex-1">
          {/* Title Row */}
          <div className="flex items-center space-x-1.5 flex-wrap">
            {isPayment ? (
              <>
                <h5 className="text-xs font-black text-amber-950 dark:text-amber-200 truncate">
                  {resolvedPersonName || cleanCategory(tx.category) || 'Payment'}
                </h5>
                {resolvedPersonType && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300/60">
                    {resolvedPersonType}
                  </span>
                )}
              </>
            ) : isExpense ? (
              <>
                <h5 className="text-xs font-black text-rose-950 dark:text-rose-200 truncate">
                  {tx.category || tx.note || 'Expense'}
                </h5>
                {resolvedPersonName && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200 border border-rose-300/60">
                    {resolvedPersonName}
                  </span>
                )}
              </>
            ) : (
              <>
                <h5 className="text-xs font-black text-emerald-950 dark:text-emerald-200 truncate">
                  {resolvedPersonName || tx.note || 'Income'}
                </h5>
                {resolvedPersonType && (
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-300/60">
                    {resolvedPersonType}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Meta row: Date with Glowing Animation (DD/MM/YYYY) • Payment Mode badge */}
          <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1 flex-wrap gap-y-1">
            {displayMode === 'time' ? (
              <span className="flex items-center space-x-1 font-mono text-[10px] text-slate-400">
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span>{tx.time || '12:00'}</span>
              </span>
            ) : (
              <motion.span
                animate={{
                  boxShadow: [
                    '0 0 0px rgba(59, 130, 246, 0.2)',
                    '0 0 10px rgba(59, 130, 246, 0.65)',
                    '0 0 0px rgba(59, 130, 246, 0.2)',
                  ],
                  borderColor: [
                    'rgba(147, 197, 253, 0.6)',
                    'rgba(59, 130, 246, 1)',
                    'rgba(147, 197, 253, 0.6)',
                  ],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg font-mono text-[10.5px] font-black text-blue-700 dark:text-blue-300 bg-blue-50/90 dark:bg-blue-950/70 border border-blue-300 dark:border-blue-700/80 shadow-xs"
                title={`Date: ${formatDDMMYYYY(tx.date)}`}
              >
                <Calendar className="w-3 h-3 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>{formatDDMMYYYY(tx.date)}</span>
              </motion.span>
            )}
            <span>•</span>
            <span
              className={`font-semibold px-1.5 py-0.2 rounded text-[9.5px] ${
                PAYMENT_METHOD_CONFIGS[tx.paymentMethod]?.badgeClass ||
                'text-slate-600 dark:text-slate-300'
              }`}
            >
              {tx.paymentMethod}
            </span>
          </div>

          {/* Details row: Note text (tags removed as requested) */}
          {isPayment ? (
            cleanPaymentNote(tx.note) ? (
              <div className="flex items-center space-x-1.5 text-[10px] mt-1 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-amber-800 dark:text-amber-300">Note:</span>
                <span className="truncate max-w-[220px] italic">
                  "{cleanPaymentNote(tx.note)}"
                </span>
              </div>
            ) : null
          ) : isExpense ? (
            tx.note ? (
              <div className="flex items-center space-x-1.5 text-[10px] mt-1 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-rose-800 dark:text-rose-300">Note:</span>
                <span className="truncate max-w-[220px] italic">
                  "{tx.note}"
                </span>
              </div>
            ) : null
          ) : (
            tx.note ? (
              <div className="flex items-center space-x-1.5 text-[10px] mt-1 text-slate-600 dark:text-slate-300">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Note:</span>
                <span className="truncate max-w-[220px] italic">
                  "{tx.note}"
                </span>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Right Side: Amount with Glowing Animation, Type Badge, and Actions */}
      <div className="text-right shrink-0">
        <motion.p
          animate={{
            textShadow: [
              isIncome
                ? '0 0 0px rgba(16, 185, 129, 0.2)'
                : isExpense || isPaid
                ? '0 0 0px rgba(244, 63, 94, 0.2)'
                : '0 0 0px rgba(245, 158, 11, 0.2)',
              isIncome
                ? '0 0 10px rgba(16, 185, 129, 0.9), 0 0 18px rgba(16, 185, 129, 0.5)'
                : isExpense || isPaid
                ? '0 0 10px rgba(244, 63, 94, 0.9), 0 0 18px rgba(244, 63, 94, 0.5)'
                : '0 0 10px rgba(245, 158, 11, 0.9), 0 0 18px rgba(245, 158, 11, 0.5)',
              isIncome
                ? '0 0 0px rgba(16, 185, 129, 0.2)'
                : isExpense || isPaid
                ? '0 0 0px rgba(244, 63, 94, 0.2)'
                : '0 0 0px rgba(245, 158, 11, 0.2)',
            ],
            scale: [1, 1.04, 1],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`text-sm sm:text-base font-black tracking-tight font-mono ${amountColor}`}
        >
          {amountSign}
          {formatINR(tx.amount)}
        </motion.p>

        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
            isIncome
              ? 'bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white shadow-xs font-bold border border-emerald-400/50'
              : isExpense
              ? 'bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white shadow-xs font-bold border border-rose-400/50'
              : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-xs font-bold border border-amber-400/50'
          }`}
        >
          {isPayment ? 'Payment' : tx.type}
        </span>

        {(onEdit || onDelete) && (
          <div className="flex items-center justify-end space-x-1.5 mt-1.5">
            {onEdit && (
              <motion.button
                id={`${idPrefix}-edit-${tx.id}`}
                type="button"
                whileHover={{ scale: 1.15, rotate: 6 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation();
                  onEdit(tx);
                }}
                className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 shadow-2xs transition-all cursor-pointer"
                title="Edit Record"
              >
                <Edit2 className="w-3.5 h-3.5 text-blue-600" />
              </motion.button>
            )}
            {onDelete && (
              <motion.button
                id={`${idPrefix}-delete-${tx.id}`}
                type="button"
                whileHover={{ scale: 1.15, rotate: -6 }}
                whileTap={{ scale: 0.9 }}
                onClick={e => {
                  e.stopPropagation();
                  onDelete(tx);
                }}
                className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 shadow-2xs transition-all cursor-pointer"
                title="Delete Record"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
