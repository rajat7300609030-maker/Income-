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
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getDailyMetrics, formatINR } from '../services/calculations';
import { Transaction } from '../types';

export const DailyView: React.FC = () => {
  const {
    selectedDailyDate,
    setSelectedDailyDate,
    income,
    expenses,
    payments,
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
        className="bg-white px-4 py-3 border-b border-slate-100 shrink-0 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs"
            >
              <Calendar className="w-4 h-4" />
            </motion.div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 tracking-tight">Daily Financial Ledger</h3>
              <p className="text-[10px] text-slate-400">Track day-by-day cashflow</p>
            </div>
          </div>

          <motion.button
            id="daily-btn-today"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSetToday}
            className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold hover:bg-blue-100 transition-colors"
          >
            Today
          </motion.button>
        </div>

        {/* Date Selector row with Prev, Next, and Interactive Input */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5">
          <motion.button
            id="daily-nav-prev"
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrevDay}
            className="w-8 h-8 rounded-xl bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors"
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
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 pointer-events-none">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{formattedDateTitle}</span>
            </div>
          </motion.div>

          <motion.button
            id="daily-nav-next"
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNextDay}
            className="w-8 h-8 rounded-xl bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-colors"
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
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Daily Income
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: 12 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-base font-black text-emerald-600 tracking-tight">
              {formatINR(metrics.dailyIncome)}
            </p>
          </motion.div>

          {/* Daily Expenses */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                Daily Expenses
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: -12 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-base font-black text-rose-600 tracking-tight">
              {formatINR(metrics.dailyExpenses)}
            </p>
          </motion.div>

          {/* Daily Payments */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Daily Payments
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"
              >
                <Handshake className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-base font-black text-blue-600 tracking-tight">
              {formatINR(metrics.dailyPayments)}
            </p>
          </motion.div>

          {/* Daily Balance */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -2, scale: 1.01 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1 text-slate-400">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                Daily Balance
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: -10 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-5 h-5 rounded-full bg-slate-50 text-slate-500 flex items-center justify-center"
              >
                <Wallet className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p
              className={`text-base font-black tracking-tight ${
                metrics.dailyBalance >= 0 ? 'text-blue-700' : 'text-rose-700'
              }`}
            >
              {formatINR(metrics.dailyBalance)}
            </p>
          </motion.div>
        </div>

        {/* Day's Transactions List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Transactions on {selectedDailyDate} ({dayTransactions.length})
            </h4>
          </div>

          {dayTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 border border-slate-100 text-center flex flex-col items-center shadow-xs"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2"
              >
                <Clock className="w-5 h-5" />
              </motion.div>
              <p className="text-xs font-semibold text-slate-600">No transactions recorded for this day</p>
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
                  <motion.div
                    key={`${tx.id || 'daily-tx'}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(0.3, idx * 0.04), duration: 0.2 }}
                    whileHover={{ x: 3, backgroundColor: "rgba(248, 250, 252, 0.9)" }}
                    className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-xs flex items-center justify-between hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                          tx.type === 'Income'
                            ? 'bg-emerald-100 text-emerald-600'
                            : tx.type === 'Expense'
                            ? 'bg-rose-100 text-rose-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {tx.type === 'Income' && <ArrowDownLeft className="w-5 h-5" />}
                        {tx.type === 'Expense' && <ArrowUpRight className="w-5 h-5" />}
                        {tx.type === 'Payment' && <Handshake className="w-5 h-5" />}
                      </motion.div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-800">
                          {tx.personName || tx.category || tx.type}
                        </h5>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{tx.time || '12:00'}</span>
                          <span>•</span>
                          <span className="font-medium text-slate-600">{tx.paymentMethod}</span>
                          {tx.paymentDirection && (
                            <span className="text-blue-600 font-bold">({tx.paymentDirection})</span>
                          )}
                        </div>
                        {tx.note && (
                          <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[180px]">{tx.note}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-sm font-black tracking-tight ${
                          tx.type === 'Income'
                            ? 'text-emerald-600'
                            : tx.type === 'Expense'
                            ? 'text-rose-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {tx.type === 'Expense' ? '-' : '+'}
                        {formatINR(tx.amount)}
                      </p>

                      <div className="flex items-center justify-end space-x-1.5 mt-1.5">
                        <motion.button
                          id={`daily-edit-${tx.id}`}
                          whileHover={{ scale: 1.15, rotate: 6 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(tx)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 shadow-2xs transition-all"
                          title="Edit Record"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                        </motion.button>
                        <motion.button
                          id={`daily-delete-${tx.id}`}
                          whileHover={{ scale: 1.15, rotate: -6 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(tx)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 shadow-2xs transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
