import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  TrendingUp,
  Wallet,
  Clock,
  Edit2,
  Trash2,
  ArrowLeft,
  Tag,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDailyMetrics, formatINR } from '../services/calculations';
import { Transaction, PAYMENT_METHOD_CONFIGS } from '../types';
import { TransactionCard } from './TransactionCard';

// Clean payment note and category to remove (recv), (received), and 'received for person' artifacts
const cleanPaymentNote = (note?: string): string => {
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

const cleanCategory = (cat?: string): string => {
  if (!cat) return '';
  return cat.replace(/\s*\(recv\)/gi, '').replace(/\s*\(received\)/gi, '').trim();
};

export const DailyView: React.FC = () => {
  const {
    selectedDailyDate,
    setSelectedDailyDate,
    income,
    expenses,
    payments,
    persons,
    transactions,
    openQuickAction,
    startEditItem,
    openDeleteConfirm,
    deleteIncome,
    deleteExpense,
    deletePayment,
    setCurrentView,
    goBack,
  } = useApp();

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Parse and format selected date for clean display (e.g., "Saturday, 13 September 2026")
  const formattedDateTitle = useMemo(() => {
    try {
      const parts = selectedDailyDate.split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return selectedDailyDate;
    }
  }, [selectedDailyDate]);

  const handlePrevDay = () => {
    try {
      const parts = (selectedDailyDate || new Date().toISOString().split('T')[0]).split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2] - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setSelectedDailyDate(`${y}-${m}-${day}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextDay = () => {
    try {
      const parts = (selectedDailyDate || new Date().toISOString().split('T')[0]).split('-').map(Number);
      const d = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setSelectedDailyDate(`${y}-${m}-${day}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetToday = () => {
    setSelectedDailyDate(new Date().toISOString().split('T')[0]);
  };

  // Daily calculations
  const metrics = useMemo(() => {
    return getDailyMetrics(selectedDailyDate, income, expenses, payments);
  }, [selectedDailyDate, income, expenses, payments]);

  // Transactions on this specific date
  const dayTransactions = useMemo(() => {
    return transactions.filter(t => t.date === selectedDailyDate);
  }, [selectedDailyDate, transactions]);

  const handleEdit = (tx: Transaction) => {
    const rawId = tx.id.replace(/^tx_/, '');
    if (tx.type === 'Income') {
      const item = income.find(i => i.id === rawId || i.id === tx.id);
      if (item) {
        startEditItem({ type: 'income', data: item });
      }
    } else if (tx.type === 'Expense') {
      const item = expenses.find(e => e.id === rawId || e.id === tx.id);
      if (item) {
        startEditItem({ type: 'expense', data: item });
      }
    } else if (tx.type === 'Payment') {
      const item = payments.find(p => p.id === rawId || p.id === tx.id);
      if (item) {
        startEditItem({ type: 'payment', data: item });
      }
    }
  };

  const handleDelete = (tx: Transaction) => {
    const rawId = tx.id.replace(/^tx_/, '');
    openDeleteConfirm(
      `Delete ${tx.type}?`,
      `Are you sure you want to delete this ${formatINR(tx.amount)} ${tx.type} record?`,
      () => {
        if (tx.type === 'Income') deleteIncome(rawId);
        else if (tx.type === 'Expense') deleteExpense(rawId);
        else if (tx.type === 'Payment') deletePayment(rawId);
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Date Navigator Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-black px-4 py-3 border-b border-slate-100 dark:border-neutral-800 shrink-0 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs"
            >
              <Calendar className="w-4 h-4" />
            </motion.div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight">Daily Financial Ledger</h3>
              <p className="text-[10px] text-slate-400">Track day-by-day cashflow</p>
            </div>
          </div>

          <motion.button
            id="daily-btn-today"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSetToday}
            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border dark:border-blue-900/50 text-[11px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-colors"
          >
            Today
          </motion.button>
        </div>

        {/* Date Selector row with Prev, Next, and Interactive Input */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-neutral-950 border border-slate-200/80 dark:border-neutral-800 rounded-2xl p-1.5">
          <motion.button
            id="daily-nav-prev"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevDay}
            className="w-8 h-8 rounded-xl bg-white dark:bg-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-900 border dark:border-neutral-800 flex items-center justify-center shadow-xs transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>

          {/* Interactive Date Picker Container */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative flex items-center justify-center flex-1 cursor-pointer"
          >
            <input
              id="daily-date-picker-input"
              type="date"
              value={selectedDailyDate}
              onChange={e => setSelectedDailyDate(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 pointer-events-none">
              <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{formattedDateTitle}</span>
            </div>
          </motion.div>

          <motion.button
            id="daily-nav-next"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextDay}
            className="w-8 h-8 rounded-xl bg-white dark:bg-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-900 border dark:border-neutral-800 flex items-center justify-center shadow-xs transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* 4 Summary Cards: Daily Income, Daily Expenses, Daily Payments, Daily Balance */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Daily Income */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Daily Income
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: 12 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-base font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatINR(metrics.dailyIncome)}
            </p>
          </motion.div>

          {/* Daily Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Daily Expenses
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: -12 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-base font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {formatINR(metrics.dailyExpenses)}
            </p>
          </motion.div>

          {/* Daily Payments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Daily Payments
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center"
              >
                <Handshake className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-base font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {formatINR(metrics.dailyPayments)}
            </p>
          </motion.div>

          {/* Daily Balance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Daily Balance
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: -10 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-slate-50 dark:bg-neutral-900 text-slate-500 dark:text-slate-400 flex items-center justify-center"
              >
                <Wallet className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p
              className={`text-base font-black tracking-tight ${
                metrics.dailyBalance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {formatINR(metrics.dailyBalance)}
            </p>
          </motion.div>
        </div>

        {/* Day's Transactions List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Transactions on {selectedDailyDate} ({dayTransactions.length})
            </h4>
          </div>

          {dayTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-black rounded-2xl p-8 border border-slate-100 dark:border-neutral-800 text-center flex flex-col items-center shadow-xs"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-400 flex items-center justify-center mb-2"
              >
                <Clock className="w-5 h-5" />
              </motion.div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No transactions recorded for this day</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Use the quick actions below to log an entry</p>

              <div className="flex items-center space-x-2 mt-3">
                <motion.button
                  id="daily-add-income"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openQuickAction('add_income')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  + Income
                </motion.button>
                <motion.button
                  id="daily-add-expense"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => openQuickAction('add_expense')}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors shadow-xs"
                >
                  + Expense
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {dayTransactions.map((tx, idx) => (
                  <TransactionCard
                    key={`${tx.id || 'daily-tx'}-${idx}`}
                    transaction={tx}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onClick={handleEdit}
                    displayMode="time"
                    idPrefix="daily"
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
