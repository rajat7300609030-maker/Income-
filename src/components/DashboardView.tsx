import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Clock,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  UserPlus,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Search,
  Settings,
  User,
  Calendar,
  Users,
  BarChart3,
  History,
  Landmark,
  Banknote,
  Trash2,
  Edit2,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../services/calculations';
import { AnimatedCounter } from './AnimatedCounter';
import { TransactionDetailModal } from './TransactionDetailModal';
import { Transaction } from '../types';

export const DashboardView: React.FC = () => {
  const {
    user,
    totals,
    openQuickAction,
    setCurrentView,
    setActiveTab,
    transactions,
    income,
    expenses,
    payments,
    startEditItem,
    recycleBinCount,
    openTransactionsWithType,
  } = useApp();

  // Selected Transaction for Floating Detail Popup (with 5-second auto-close)
  const [selectedTxDetail, setSelectedTxDetail] = React.useState<Transaction | null>(null);

  // Handle clicking a transaction in the recent list -> opens floating popup modal
  const handleTxClick = (tx: (typeof transactions)[0]) => {
    setSelectedTxDetail(tx);
  };

  // Handle editing transaction from within the detail popup or direct click
  const handleEditFromDetail = (tx: Transaction) => {
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

  // Income vs Expense Filter State: 'day' | 'week' | 'month' | 'year'
  const [chartFilter, setChartFilter] = React.useState<'day' | 'week' | 'month' | 'year'>('month');
  const [hoveredBarIndex, setHoveredBarIndex] = React.useState<number | null>(null);

  // Fully automatic multi-timeframe calculation for the Income vs Expense chart
  const chartData = React.useMemo(() => {
    const safeInc = Array.isArray(income) ? income : [];
    const safeExp = Array.isArray(expenses) ? expenses : [];
    const now = new Date();

    if (chartFilter === 'day') {
      // Last 7 days ending today
      const items = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const dayName = i === 0 ? 'Today' : i === 1 ? 'Y\'day' : d.toLocaleDateString('en-US', { weekday: 'short' });
        const fullLabel = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });

        const dInc = safeInc
          .filter(item => item && item.date === dateStr)
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        const dExp = safeExp
          .filter(item => item && item.date === dateStr)
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        items.push({
          key: dateStr,
          label: dayName,
          fullLabel,
          income: dInc,
          expense: dExp,
        });
      }
      return items;
    }

    if (chartFilter === 'week') {
      // Last 5 weeks ending this week
      const items = [];
      for (let i = 4; i >= 0; i--) {
        const endD = new Date(now);
        endD.setDate(now.getDate() - i * 7);
        const startD = new Date(endD);
        startD.setDate(endD.getDate() - 6);

        const startStr = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`;
        const endStr = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;

        const wLabel = i === 0 ? 'This Wk' : i === 1 ? 'Last Wk' : `Wk -${i}`;
        const fullLabel = `${startD.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - ${endD.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;

        const wInc = safeInc
          .filter(item => item && typeof item.date === 'string' && item.date >= startStr && item.date <= endStr)
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        const wExp = safeExp
          .filter(item => item && typeof item.date === 'string' && item.date >= startStr && item.date <= endStr)
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        items.push({
          key: `week-${i}`,
          label: wLabel,
          fullLabel,
          income: wInc,
          expense: wExp,
        });
      }
      return items;
    }

    if (chartFilter === 'month') {
      // Last 6 months ending current month
      const items = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const monthPrefix = `${yyyy}-${mm}`;
        const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
        const fullLabel = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const realInc = safeInc
          .filter(item => item && typeof item.date === 'string' && item.date.startsWith(monthPrefix))
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        const realExp = safeExp
          .filter(item => item && typeof item.date === 'string' && item.date.startsWith(monthPrefix))
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        items.push({
          key: monthPrefix,
          label: monthShort,
          fullLabel,
          income: realInc,
          expense: realExp,
        });
      }
      return items;
    }

    if (chartFilter === 'year') {
      // Last 4 years
      const currentYear = now.getFullYear();
      const items = [];

      for (let i = 3; i >= 0; i--) {
        const y = currentYear - i;
        const yearPrefix = `${y}`;

        const realInc = safeInc
          .filter(item => item && typeof item.date === 'string' && item.date.startsWith(yearPrefix))
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        const realExp = safeExp
          .filter(item => item && typeof item.date === 'string' && item.date.startsWith(yearPrefix))
          .reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);

        items.push({
          key: yearPrefix,
          label: `${y}`,
          fullLabel: `Financial Year ${y}`,
          income: realInc,
          expense: realExp,
        });
      }
      return items;
    }

    return [];
  }, [chartFilter, income, expenses]);

  const maxChartVal = React.useMemo(() => {
    const highest = Math.max(...chartData.map(d => Math.max(d.income, d.expense)), 0);
    return highest > 0 ? highest : 1000;
  }, [chartData]);

  const chartPeriodTotals = React.useMemo(() => {
    const totalInc = chartData.reduce((acc, d) => acc + d.income, 0);
    const totalExp = chartData.reduce((acc, d) => acc + d.expense, 0);
    const net = totalInc - totalExp;
    return { totalInc, totalExp, net };
  }, [chartData]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {/* Integrated App Brand Header & Top Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between bg-white dark:bg-black rounded-2xl p-3 border border-slate-100 dark:border-neutral-800 shadow-xs"
      >
        {/* App Logo & Name (Replaces Rajat Sharma with official App branding & logo) */}
        <div
          id="dashboard-app-brand"
          className="flex items-center space-x-2.5 select-none"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: [0, -5, 5, 0] }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs border border-blue-500/30 shrink-0"
          >
            <div className="relative flex items-center justify-center">
              <Wallet className="w-4.5 h-4.5 text-white" />
              <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border border-blue-700 flex items-center justify-center text-[7px] font-black text-slate-950">
                ₹
              </span>
            </div>
          </motion.div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                Income &amp; Expense
              </h3>
              <span className="px-1 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/60 text-[8px] font-black text-blue-700 dark:text-blue-300">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
              Financial Tracker &amp; Ledger
            </p>
          </div>
        </div>

        {/* Action Shortcuts: Search & Settings */}
        <div className="flex items-center space-x-1.5">
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setCurrentView('search')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700 transition-colors"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setCurrentView('settings')}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-slate-700/60 border border-slate-100 dark:border-slate-700 transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Integrated Section Navigation Grid */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { view: 'daily', tab: 'daily', label: 'Daily', Icon: Calendar, bg: 'bg-blue-50', text: 'text-blue-600', borderHover: 'hover:border-blue-200 hover:bg-blue-50/40' },
          { view: 'persons', tab: 'persons', label: 'Persons', Icon: Users, bg: 'bg-indigo-50', text: 'text-indigo-600', borderHover: 'hover:border-indigo-200 hover:bg-indigo-50/40' },
          { view: 'payments', tab: 'payments', label: 'Payments', Icon: CreditCard, bg: 'bg-amber-50', text: 'text-amber-600', borderHover: 'hover:border-amber-200 hover:bg-amber-50/40' },
          { view: 'reports', tab: 'reports', label: 'Reports', Icon: BarChart3, bg: 'bg-purple-50', text: 'text-purple-600', borderHover: 'hover:border-purple-200 hover:bg-purple-50/40' },
        ].map((item, index) => (
          <motion.button
            key={item.view}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.25 }}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setCurrentView(item.view as any);
              setActiveTab(item.tab as any);
            }}
            className={`flex flex-col items-center justify-center p-2.5 rounded-2xl bg-white dark:bg-black border border-slate-100 dark:border-neutral-800 shadow-xs ${item.borderHover} transition-all text-center group`}
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0], scale: 1.15 }}
              transition={{ duration: 0.3 }}
              className={`w-8 h-8 rounded-full ${item.bg} ${item.text} flex items-center justify-center mb-1 shadow-xs`}
            >
              <item.Icon className="w-4 h-4" />
            </motion.div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
          </motion.button>
        ))}
      </div>

      {/* 1. Primary Highlight Card: Current Balance */}
      <motion.div
        id="current-net-balance-card"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        whileHover={{ y: -2 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-black dark:via-black dark:to-black dark:bg-black text-white p-5 border border-blue-300/40 dark:border-neutral-800 shadow-lg shadow-blue-900/30 dark:shadow-none"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-100 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 15 }}
            >
              <Wallet className="w-4 h-4 text-cyan-300 dark:text-cyan-400" />
            </motion.div>
            <span>Current Net Balance</span>
          </div>
          <span
            className="text-[10px] font-bold bg-white/20 dark:bg-neutral-900 text-white dark:text-slate-200 px-2.5 py-0.5 rounded-full border border-white/30 dark:border-neutral-800 backdrop-blur-xs shadow-2xs"
          >
            Real-time
          </span>
        </div>

        <div className="mt-3">
          <h2 className="text-3xl font-black tracking-tight text-white drop-shadow-xs flex items-center">
            <AnimatedCounter
              value={totals.currentBalance}
              glow
              glowColor="white"
              duration={1000}
            />
          </h2>
          <p className="text-xs text-blue-200 dark:text-slate-400 mt-1 flex items-center flex-wrap gap-1">
            <span>Total Income (</span>
            <AnimatedCounter value={totals.totalIncome} duration={1000} className="font-semibold text-white/95 dark:text-slate-200" />
            <span>) − Total Expenses (</span>
            <AnimatedCounter value={totals.totalExpenses} duration={1000} className="font-semibold text-white/95 dark:text-slate-200" />
            <span>)</span>
          </p>
        </div>

        {/* Dual Income Breakdown: Banking Income & Cash Income (Only Income, No Expense or Other deductions) */}
        <div className="mt-4 pt-3 border-t border-white/20 dark:border-neutral-800 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10.5px] font-bold text-blue-100 dark:text-slate-300 uppercase tracking-wider flex items-center space-x-1">
              <span>Income Breakdown</span>
            </span>
            <span className="text-[9.5px] font-bold bg-white/20 dark:bg-neutral-900 text-white dark:text-slate-200 px-2 py-0.5 rounded-full backdrop-blur-xs border dark:border-neutral-800">
              Income Only
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Banking Income Card (Bank & UPI) */}
            <motion.div
              id="net-balance-bank-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentView('payments');
                setActiveTab('payments');
              }}
              className="bg-white/12 dark:bg-neutral-950 backdrop-blur-xs rounded-2xl p-3 border border-cyan-300/30 dark:border-neutral-800 hover:border-cyan-300 dark:hover:border-neutral-700 shadow-md shadow-cyan-950/20 dark:shadow-none transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <motion.div
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  className="w-6 h-6 rounded-lg bg-cyan-400/25 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-200 dark:text-cyan-400 shrink-0 shadow-2xs"
                >
                  <Landmark className="w-3.5 h-3.5" />
                </motion.div>
                <span className="text-[10.5px] font-bold text-cyan-200 dark:text-cyan-400 uppercase tracking-wider truncate">
                  Banking Income
                </span>
              </div>
              <p id="net-balance-bank-amount" className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                <AnimatedCounter
                  value={totals.bankingIncome}
                  glow
                  glowColor="cyan"
                  duration={1000}
                />
              </p>
              <div className="mt-1 flex items-center space-x-1 text-[9.5px] text-cyan-200/90 dark:text-cyan-300/80 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 inline-block shadow-[0_0_8px_rgba(6,182,212,0.9)]" />
                <span className="truncate">Bank & UPI</span>
              </div>
            </motion.div>

            {/* Cash Income Card */}
            <motion.div
              id="net-balance-cash-card"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentView('daily');
                setActiveTab('daily');
              }}
              className="bg-white/12 dark:bg-neutral-950 backdrop-blur-xs rounded-2xl p-3 border border-emerald-300/30 dark:border-neutral-800 hover:border-emerald-300 dark:hover:border-neutral-700 shadow-md shadow-emerald-950/20 dark:shadow-none transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-1.5 mb-1.5">
                <motion.div
                  whileHover={{ rotate: -12, scale: 1.1 }}
                  className="w-6 h-6 rounded-lg bg-emerald-400/25 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-200 dark:text-emerald-400 shrink-0 shadow-2xs"
                >
                  <Banknote className="w-3.5 h-3.5" />
                </motion.div>
                <span className="text-[10.5px] font-bold text-emerald-200 dark:text-emerald-400 uppercase tracking-wider truncate">
                  Cash Income
                </span>
              </div>
              <p id="net-balance-cash-amount" className="text-base sm:text-lg font-black text-white tracking-tight leading-tight">
                <AnimatedCounter
                  value={totals.cashIncome}
                  glow
                  glowColor="emerald"
                  duration={1000}
                />
              </p>
              <div className="mt-1 flex items-center space-x-1 text-[9.5px] text-emerald-200/90 dark:text-emerald-300/80 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 inline-block shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                <span className="truncate">Cash Received</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Floating background decorative shape */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none blur-2xl" />
      </motion.div>

      {/* 2. Colorful Quick Actions Bar */}
      <motion.div
        id="quick-actions-bar"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white/90 dark:bg-black backdrop-blur-xs rounded-2xl p-3 border border-slate-100 dark:border-neutral-800 shadow-sm"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
            Quick Actions
          </h3>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {/* Add Person */}
          <motion.button
            id="quick-action-add-person"
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => openQuickAction('add_person')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50/80 dark:bg-black border border-slate-100 dark:border-neutral-800 hover:border-blue-300 transition-all group cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
              transition={{ duration: 0.35 }}
              className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 shadow-xs"
            >
              <UserPlus className="w-4.5 h-4.5" />
            </motion.div>
            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-center">
              Add Person
            </span>
          </motion.button>

          {/* Add Income */}
          <motion.button
            id="quick-action-add-income"
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => openQuickAction('add_income')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50/80 dark:bg-black border border-slate-100 dark:border-neutral-800 hover:border-emerald-300 transition-all group cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
              transition={{ duration: 0.35 }}
              className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 shadow-xs"
            >
              <ArrowDownLeft className="w-4.5 h-4.5" />
            </motion.div>
            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-center">
              Add Income
            </span>
          </motion.button>

          {/* Add Expense */}
          <motion.button
            id="quick-action-add-expense"
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => openQuickAction('add_expense')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50/80 dark:bg-black border border-slate-100 dark:border-neutral-800 hover:border-rose-300 transition-all group cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
              transition={{ duration: 0.35 }}
              className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1 shadow-xs"
            >
              <ArrowUpRight className="w-4.5 h-4.5" />
            </motion.div>
            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-center">
              Add Expense
            </span>
          </motion.button>

          {/* Add Payment */}
          <motion.button
            id="quick-action-add-payment"
            whileHover={{ y: -3, scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={() => openQuickAction('add_payment')}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50/80 dark:bg-black border border-slate-100 dark:border-neutral-800 hover:border-amber-300 transition-all group cursor-pointer"
          >
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }}
              transition={{ duration: 0.35 }}
              className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1 shadow-xs"
            >
              <Handshake className="w-4.5 h-4.5" />
            </motion.div>
            <span className="text-[10.5px] font-bold text-slate-700 dark:text-slate-200 leading-tight text-center">
              Add Payment
            </span>
          </motion.button>
        </div>
      </motion.div>

      {/* 3. Summary Cards Grid: Total Income, Total Expenses, Total Payments, Pending Payments */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Financial Summary
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Total Income */}
          <motion.div
            id="card-total-income"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openTransactionsWithType('Income')}
            className="bg-white dark:bg-black rounded-2xl p-3.5 border border-emerald-100/90 dark:border-neutral-800 shadow-sm hover:shadow-md hover:shadow-emerald-500/15 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Total Income</span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: 12 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs shadow-emerald-500/30"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              <AnimatedCounter
                value={totals.totalIncome}
                glow
                glowColor="emerald"
                duration={1000}
              />
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Sum of all inflows • Tap for Income only</p>
          </motion.div>

          {/* Total Expenses */}
          <motion.div
            id="card-total-expenses"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openTransactionsWithType('Expense')}
            className="bg-white dark:bg-black rounded-2xl p-3.5 border border-rose-100/90 dark:border-neutral-800 shadow-sm hover:shadow-md hover:shadow-rose-500/15 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Total Expenses</span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: -12 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs shadow-rose-500/30"
              >
                <TrendingDown className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">
              <AnimatedCounter
                value={totals.totalExpenses}
                glow
                glowColor="rose"
                duration={1000}
              />
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Sum of all outflows • Tap for Expenses only</p>
          </motion.div>

          {/* Total Payments */}
          <motion.div
            id="card-total-payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openTransactionsWithType('Payment')}
            className="bg-white dark:bg-black rounded-2xl p-3.5 border border-blue-100/90 dark:border-neutral-800 shadow-sm hover:shadow-md hover:shadow-blue-500/15 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Total Payments</span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs shadow-blue-500/30"
              >
                <CreditCard className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400 tracking-tight">
              <AnimatedCounter
                value={totals.totalPayments}
                glow
                glowColor="blue"
                duration={1000}
              />
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Settlements cleared • Tap for Payments only</p>
          </motion.div>

          {/* Pending Payments */}
          <motion.div
            id="card-pending-payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openTransactionsWithType('Payment')}
            className="bg-white dark:bg-black rounded-2xl p-3.5 border border-red-100/90 dark:border-neutral-800 shadow-sm hover:shadow-md hover:shadow-red-500/15 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">Pending Amount</span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: -15 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 flex items-center justify-center shadow-xs shadow-red-500/30"
              >
                <Clock className="w-3.5 h-3.5" />
              </motion.div>
            </div>
            <p className="text-lg font-black text-red-700 dark:text-red-400 tracking-tight">
              <AnimatedCounter
                value={totals.pendingPayments}
                glow
                glowColor="rose"
                duration={1000}
              />
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5">Person ledger balance • Tap for Payments only</p>
          </motion.div>
        </div>
      </div>

      {/* 4. Today vs This Month Metrics */}
      <motion.div
        id="periodic-breakdown-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-black rounded-2xl p-4 border border-indigo-100/70 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
      >
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-3">
          Periodic Breakdown
        </h3>

        {/* Today's Section */}
        <div className="mb-3 pb-3 border-b border-slate-100 dark:border-neutral-800">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Today's Activity
          </span>
          <div className="grid grid-cols-3 gap-2 text-center">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="p-2 rounded-xl bg-emerald-50/80 dark:bg-neutral-950 border border-emerald-100/60 dark:border-neutral-800 shadow-[0_2px_8px_rgba(16,185,129,0.12)] transition-all"
            >
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block">Income</span>
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <AnimatedCounter
                  value={totals.todayIncome}
                  glow
                  glowColor="emerald"
                  duration={1000}
                />
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="p-2 rounded-xl bg-rose-50/80 dark:bg-neutral-950 border border-rose-100/60 dark:border-neutral-800 shadow-[0_2px_8px_rgba(244,63,94,0.12)] transition-all"
            >
              <span className="text-[10px] font-semibold text-rose-700 dark:text-rose-400 block">Expense</span>
              <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
                <AnimatedCounter
                  value={totals.todayExpenses}
                  glow
                  glowColor="rose"
                  duration={1000}
                />
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="p-2 rounded-xl bg-blue-50/80 dark:bg-neutral-950 border border-blue-100/60 dark:border-neutral-800 shadow-[0_2px_8px_rgba(59,130,246,0.12)] transition-all"
            >
              <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 block">Payments</span>
              <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                <AnimatedCounter
                  value={totals.todayPayments}
                  glow
                  glowColor="blue"
                  duration={1000}
                />
              </span>
            </motion.div>
          </div>
        </div>

        {/* This Month's Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              This Month's Totals
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-neutral-900 px-2 py-0.5 rounded-full border dark:border-neutral-800">
              Net = Income − Expense
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <motion.div
              whileHover={{ scale: 1.02, x: 2 }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-100/80 dark:border-neutral-800 shadow-[0_2px_8px_rgba(16,185,129,0.08)] transition-all"
            >
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Month's Income</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <AnimatedCounter
                  value={totals.thisMonthIncome}
                  glow
                  glowColor="emerald"
                  duration={1100}
                />
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.02, x: -2 }}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-100/80 dark:border-neutral-800 shadow-[0_2px_8px_rgba(244,63,94,0.08)] transition-all"
            >
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Month's Expense</span>
              <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                <AnimatedCounter
                  value={totals.thisMonthExpenses}
                  glow
                  glowColor="rose"
                  duration={1100}
                />
              </span>
            </motion.div>
          </div>

          {/* Month Net Balance (Income minus Expense) */}
          <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/90 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Month Net (Income − Expense):</span>
            <span className={`text-xs font-black ${totals.thisMonthNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              <AnimatedCounter
                value={totals.thisMonthNet}
                glow
                glowColor={totals.thisMonthNet >= 0 ? 'emerald' : 'rose'}
                duration={1100}
              />
            </span>
          </div>
        </div>
      </motion.div>

      {/* 5. Income vs Expense Chart with Automatic Day, Week, Month, Year Filter */}
      <motion.div
        id="income-vs-expense-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-black rounded-2xl p-4 border border-sky-100/80 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all"
      >
        {/* Card Header with Filter Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Income vs Expense
              </h3>
              <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider border border-blue-100">
                Auto
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {chartFilter === 'day' && 'Daily cashflow breakdown (Last 7 days)'}
              {chartFilter === 'week' && 'Weekly cashflow breakdown (Last 5 weeks)'}
              {chartFilter === 'month' && '6-Month financial cashflow trend'}
              {chartFilter === 'year' && 'Annual financial growth comparison'}
            </p>
          </div>

          {/* Fully Automatic Day / Week / Month / Year Filter Buttons */}
          <div
            id="chart-filter-controls"
            className="flex items-center self-start sm:self-auto bg-slate-100/90 dark:bg-neutral-950 p-1 rounded-xl border border-slate-200/70 dark:border-neutral-800"
          >
            {(['day', 'week', 'month', 'year'] as const).map((filter) => {
              const isActive = chartFilter === filter;
              return (
                <motion.button
                  key={filter}
                  id={`chart-filter-${filter}`}
                  onClick={() => {
                    setChartFilter(filter);
                    setHoveredBarIndex(null);
                  }}
                  whileTap={{ scale: 0.94 }}
                  className={`relative px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all capitalize select-none cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-neutral-800'
                  }`}
                >
                  {filter}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Automatic Period Summary Strip */}
        <div className="bg-slate-50/80 dark:bg-neutral-950 rounded-xl p-2.5 mb-3 border border-slate-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 inline-block shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Income:</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <AnimatedCounter value={chartPeriodTotals.totalInc} glow glowColor="emerald" duration={800} />
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 inline-block shadow-[0_0_5px_rgba(244,63,94,0.5)]"></span>
            <span className="text-[10.5px] text-slate-500 dark:text-slate-400 font-medium">Expense:</span>
            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">
              <AnimatedCounter value={chartPeriodTotals.totalExp} glow glowColor="rose" duration={800} />
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="text-[10.5px] text-slate-400 font-medium">Net:</span>
            <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${
              chartPeriodTotals.net >= 0 ? 'bg-emerald-100/70 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-rose-100/70 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
            }`}>
              {chartPeriodTotals.net >= 0 ? '+' : ''}{formatINR(chartPeriodTotals.net)}
            </span>
          </div>
        </div>

        {chartPeriodTotals.totalInc === 0 && chartPeriodTotals.totalExp === 0 && (
          <div className="py-2 px-3 text-center text-[11px] text-slate-400 font-medium bg-slate-50/70 dark:bg-neutral-950 rounded-xl mb-2 border border-dashed border-slate-200 dark:border-neutral-800">
            No income or expense records found for this period
          </div>
        )}

        {/* Interactive Active Bar Tooltip Banner */}
        {hoveredBarIndex !== null && chartData[hoveredBarIndex] && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-neutral-900 border dark:border-neutral-800 text-white text-[11px] flex items-center justify-between shadow-sm"
          >
            <span className="font-bold text-cyan-300">{chartData[hoveredBarIndex].fullLabel}</span>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-300">
                Inc: <span className="font-bold">{formatINR(chartData[hoveredBarIndex].income)}</span>
              </span>
              <span className="text-rose-300">
                Exp: <span className="font-bold">{formatINR(chartData[hoveredBarIndex].expense)}</span>
              </span>
              <span className={`font-bold ${
                chartData[hoveredBarIndex].income - chartData[hoveredBarIndex].expense >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {chartData[hoveredBarIndex].income - chartData[hoveredBarIndex].expense >= 0 ? '+' : ''}
                {formatINR(chartData[hoveredBarIndex].income - chartData[hoveredBarIndex].expense)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Bar Chart Visualizer with Animated Bars */}
        <div className="h-44 flex items-end justify-between pt-4 pb-2 px-1 border-b border-slate-100 dark:border-neutral-800">
          {chartData.map((d, i) => {
            const isHovered = hoveredBarIndex === i;
            const incHeight = d.income > 0 ? Math.max(6, (d.income / maxChartVal) * 115) : 0;
            const expHeight = d.expense > 0 ? Math.max(6, (d.expense / maxChartVal) * 115) : 0;

            return (
              <div
                key={`bar-${chartFilter}-${d.key || i}-${i}`}
                onMouseEnter={() => setHoveredBarIndex(i)}
                onMouseLeave={() => setHoveredBarIndex(null)}
                onClick={() => setHoveredBarIndex(hoveredBarIndex === i ? null : i)}
                className={`flex flex-col items-center flex-1 space-y-1.5 transition-all p-1 rounded-xl cursor-pointer ${
                  isHovered ? 'bg-slate-50 dark:bg-neutral-900 ring-1 ring-blue-400/40 shadow-2xs' : 'hover:bg-slate-50/60 dark:hover:bg-neutral-900/60'
                }`}
              >
                <div className="flex items-end space-x-1 sm:space-x-1.5 h-32">
                  {/* Income Bar */}
                  <motion.div
                    key={`inc-${chartFilter}-${d.key || i}-${i}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${incHeight}px` }}
                    transition={{ duration: 0.45, delay: i * 0.04, ease: "easeOut" }}
                    whileHover={{ scaleY: 1.05, filter: "brightness(1.1)" }}
                    className={`w-2.5 sm:w-3.5 rounded-t-md transition-all shadow-xs origin-bottom ${
                      d.income > 0 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-transparent'
                    }`}
                    title={`${d.fullLabel} Income: ${formatINR(d.income)}`}
                  />
                  {/* Expense Bar */}
                  <motion.div
                    key={`exp-${chartFilter}-${d.key || i}-${i}`}
                    initial={{ height: 0 }}
                    animate={{ height: `${expHeight}px` }}
                    transition={{ duration: 0.45, delay: i * 0.04 + 0.02, ease: "easeOut" }}
                    whileHover={{ scaleY: 1.05, filter: "brightness(1.1)" }}
                    className={`w-2.5 sm:w-3.5 rounded-t-md transition-all shadow-xs origin-bottom ${
                      d.expense > 0 ? 'bg-rose-500 hover:bg-rose-600' : 'bg-transparent'
                    }`}
                    title={`${d.fullLabel} Expense: ${formatINR(d.expense)}`}
                  />
                </div>
                <span className={`text-[9.5px] sm:text-[10px] font-semibold truncate max-w-full text-center ${
                  isHovered ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend & Quick Hint */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
          <span className="italic">Hover or tap on bar to view details</span>
          <div className="flex items-center space-x-3 font-semibold">
            <span className="flex items-center space-x-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
              <span>Income</span>
            </span>
            <span className="flex items-center space-x-1 text-rose-600">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
              <span>Expense</span>
            </span>
          </div>
        </div>
      </motion.div>

      {/* 6. Recent Transactions Preview */}
      <motion.div
        id="recent-transactions-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-black rounded-2xl p-4 border border-indigo-50/90 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all mb-2"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Recent Transactions
          </h3>
          <motion.button
            id="dashboard-view-all-tx"
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openTransactionsWithType('All')}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center space-x-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No transactions recorded yet</p>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-neutral-800">
            {transactions.slice(0, 4).map((tx, idx) => (
              <motion.div
                key={`${tx.id || 'tx'}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 * idx, duration: 0.2 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleTxClick(tx)}
                className="py-2.5 px-2 rounded-xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-neutral-900 transition-all cursor-pointer"
                title="Tap to view or edit"
              >
                <div className="flex items-center space-x-3">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                      tx.type === 'Income'
                        ? 'bg-emerald-100 text-emerald-600'
                        : tx.type === 'Expense'
                        ? 'bg-rose-100 text-rose-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {tx.type === 'Income' && <ArrowDownLeft className="w-4 h-4" />}
                    {tx.type === 'Expense' && <ArrowUpRight className="w-4 h-4" />}
                    {tx.type === 'Payment' && <Handshake className="w-4 h-4" />}
                  </motion.div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {tx.type === 'Expense'
                        ? (tx.note || tx.category || tx.type)
                        : tx.type === 'Income'
                        ? (tx.note || tx.personName || tx.type)
                        : (tx.personName || tx.category || tx.type)}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {tx.date} • {tx.paymentMethod}
                      {tx.type === 'Expense' && tx.note && tx.category && ` • ${tx.category}`}
                      {tx.type === 'Income' && tx.note && ` • ${tx.personName || 'Income'}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p
                      className={`text-xs font-black ${
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
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                      {tx.type}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.15, rotate: 6 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditFromDetail(tx);
                    }}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 shadow-2xs transition-all"
                    title="Edit Record"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Floating Transaction Detail Popup Window with Backdrop Blur and 5s Auto-Close */}
      <TransactionDetailModal
        transaction={selectedTxDetail}
        isOpen={Boolean(selectedTxDetail)}
        onClose={() => setSelectedTxDetail(null)}
        onEdit={handleEditFromDetail}
      />
    </div>
  );
};
