import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  Calendar,
  Edit2,
  Trash2,
  SlidersHorizontal,
  X,
  ArrowLeft,
  Layers,
  ChevronDown,
  Tag,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Transaction, TransactionType } from '../types';
import { formatINR } from '../services/calculations';
import { TransactionDetailModal } from './TransactionDetailModal';

// Tab configuration with vibrant unique theme colors and icons
const TAB_CONFIG: Array<{
  id: 'All' | TransactionType;
  label: string;
  icon: React.ElementType;
  activeClass: string;
  inactiveClass: string;
  badgeActiveClass: string;
  badgeInactiveClass: string;
  accentColor: string;
}> = [
  {
    id: 'All',
    label: 'All',
    icon: Layers,
    activeClass: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md shadow-indigo-950/30 border-indigo-500/40 ring-1 ring-indigo-400/40',
    inactiveClass: 'bg-slate-100/90 text-slate-700 hover:bg-slate-200 border-slate-200/80',
    badgeActiveClass: 'bg-white/20 text-white border-white/20',
    badgeInactiveClass: 'bg-slate-200/90 text-slate-600',
    accentColor: 'indigo',
  },
  {
    id: 'Income',
    label: 'Income',
    icon: ArrowDownLeft,
    activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-700/30 border-emerald-400/50 ring-1 ring-emerald-400/40',
    inactiveClass: 'bg-emerald-50/90 text-emerald-800 hover:bg-emerald-100 border-emerald-200/80',
    badgeActiveClass: 'bg-white/20 text-white border-white/20',
    badgeInactiveClass: 'bg-emerald-200/70 text-emerald-800',
    accentColor: 'emerald',
  },
  {
    id: 'Expense',
    label: 'Expense',
    icon: ArrowUpRight,
    activeClass: 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md shadow-rose-700/30 border-rose-400/50 ring-1 ring-rose-400/40',
    inactiveClass: 'bg-rose-50/90 text-rose-800 hover:bg-rose-100 border-rose-200/80',
    badgeActiveClass: 'bg-white/20 text-white border-white/20',
    badgeInactiveClass: 'bg-rose-200/70 text-rose-800',
    accentColor: 'rose',
  },
  {
    id: 'Payment',
    label: 'Payment',
    icon: Handshake,
    activeClass: 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30 border-amber-400/50 ring-1 ring-amber-400/40',
    inactiveClass: 'bg-amber-50/90 text-amber-800 hover:bg-amber-100 border-amber-200/80 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/50',
    badgeActiveClass: 'bg-white/20 text-white border-white/20',
    badgeInactiveClass: 'bg-amber-200/70 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
    accentColor: 'amber',
  },
];

const INITIAL_PAGE_SIZE = 50;

export const TransactionHistoryView: React.FC = () => {
  const {
    transactions,
    income,
    expenses,
    payments,
    persons,
    startEditItem,
    openDeleteConfirm,
    deleteIncome,
    deleteExpense,
    deletePayment,
    goBack,
    transactionFilter,
    setTransactionFilter,
  } = useApp();

  const [activeType, setActiveType] = useState<TransactionType | 'All'>(() => transactionFilter || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [selectedTxDetail, setSelectedTxDetail] = useState<Transaction | null>(null);
  const [displayLimit, setDisplayLimit] = useState(INITIAL_PAGE_SIZE);

  // Sync with global transaction filter when changed from Dashboard finance summary cards
  React.useEffect(() => {
    if (transactionFilter) {
      setActiveType(transactionFilter);
      setDisplayLimit(INITIAL_PAGE_SIZE);
    }
  }, [transactionFilter]);

  const handleSelectType = (type: TransactionType | 'All') => {
    setActiveType(type);
    setTransactionFilter(type);
    setDisplayLimit(INITIAL_PAGE_SIZE);
  };

  // Efficient single-pass count calculation for instant tab responsiveness
  const typeCounts = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    let inc = 0;
    let exp = 0;
    let pay = 0;
    for (let i = 0; i < list.length; i++) {
      const t = list[i]?.type;
      if (t === 'Income') inc++;
      else if (t === 'Expense') exp++;
      else if (t === 'Payment') pay++;
    }
    return {
      All: list.length,
      Income: inc,
      Expense: exp,
      Payment: pay,
    };
  }, [transactions]);

  // Fast filtered transaction list calculation
  const filteredTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    const q = (searchQuery || '').trim().toLowerCase();
    const hasSearch = q.length > 0;
    const hasStartDate = Boolean(startDate);
    const hasEndDate = Boolean(endDate);

    return list.filter(t => {
      if (!t) return false;
      if (activeType !== 'All' && t.type !== activeType) return false;

      if (hasStartDate && (!t.date || t.date < startDate)) return false;
      if (hasEndDate && (!t.date || t.date > endDate)) return false;

      if (hasSearch) {
        const matchesPerson = t.personName && t.personName.toLowerCase().includes(q);
        const matchesCat = t.category && t.category.toLowerCase().includes(q);
        const matchesNote = t.note && t.note.toLowerCase().includes(q);
        const matchesPay = t.paymentMethod && t.paymentMethod.toLowerCase().includes(q);
        if (!matchesPerson && !matchesCat && !matchesNote && !matchesPay) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, activeType, searchQuery, startDate, endDate]);

  // High performance sliced items for instantaneous rendering without layout thrashing
  const visibleTransactions = useMemo(() => {
    return filteredTransactions.slice(0, displayLimit);
  }, [filteredTransactions, displayLimit]);

  const hasMore = filteredTransactions.length > displayLimit;

  const findMatchingRecord = (tx: Transaction) => {
    const candidates = [
      tx.sourceId,
      tx.id,
      tx.id.replace(/^tx_/, ''),
      tx.id.replace(/^tx_inc_/, 'inc_'),
      tx.id.replace(/^tx_exp_/, 'exp_'),
      tx.id.replace(/^tx_pay_/, 'pay_'),
      tx.id.replace(/^tx_inc_inc_/, 'inc_'),
      tx.id.replace(/^tx_exp_exp_/, 'exp_'),
      tx.id.replace(/^tx_pay_pay_/, 'pay_'),
      tx.sourceId?.replace(/^inc_inc_/, 'inc_'),
      tx.sourceId?.replace(/^exp_exp_/, 'exp_'),
      tx.sourceId?.replace(/^pay_pay_/, 'pay_'),
    ].filter(Boolean) as string[];

    if (tx.type === 'Income') {
      const match = income.find(i => candidates.includes(i.id) || (tx.personId && i.personId === tx.personId && i.amount === tx.amount && i.date === tx.date));
      return { type: 'income' as const, record: match, fallbackId: tx.sourceId || tx.id.replace(/^tx_/, '') };
    } else if (tx.type === 'Expense') {
      const match = expenses.find(e => candidates.includes(e.id) || (e.category === tx.category && e.amount === tx.amount && e.date === tx.date));
      return { type: 'expense' as const, record: match, fallbackId: tx.sourceId || tx.id.replace(/^tx_/, '') };
    } else {
      const match = payments.find(p => candidates.includes(p.id) || (tx.personId && p.personId === tx.personId && p.amount === tx.amount && p.date === tx.date));
      return { type: 'payment' as const, record: match, fallbackId: tx.sourceId || tx.id.replace(/^tx_/, '') };
    }
  };

  const handleEdit = (tx: Transaction) => {
    const { type, record, fallbackId } = findMatchingRecord(tx);
    if (type === 'income') {
      if (record) {
        startEditItem({ type: 'income', data: record });
      } else {
        startEditItem({
          type: 'income',
          data: {
            id: fallbackId,
            userId: tx.userId,
            personId: tx.personId,
            personName: tx.personName,
            amount: tx.amount,
            date: tx.date,
            paymentMethod: tx.paymentMethod,
            description: tx.note,
          },
        });
      }
    } else if (type === 'expense') {
      if (record) {
        startEditItem({ type: 'expense', data: record });
      } else {
        startEditItem({
          type: 'expense',
          data: {
            id: fallbackId,
            userId: tx.userId,
            personId: tx.personId,
            personName: tx.personName,
            category: tx.category || 'Other',
            amount: tx.amount,
            date: tx.date,
            paymentMethod: tx.paymentMethod,
            description: tx.note,
          },
        });
      }
    } else if (type === 'payment') {
      if (record) {
        startEditItem({ type: 'payment', data: record });
      } else {
        startEditItem({
          type: 'payment',
          data: {
            id: fallbackId,
            userId: tx.userId,
            personId: tx.personId || '',
            personName: tx.personName || 'Person',
            amount: tx.amount,
            date: tx.date,
            type: tx.paymentDirection || 'Received',
            paymentMethod: tx.paymentMethod,
            category: tx.category || 'Other',
            referenceNumber: tx.referenceNumber,
            note: tx.note,
          },
        });
      }
    }
  };

  const handleDelete = (tx: Transaction) => {
    const { type, record, fallbackId } = findMatchingRecord(tx);
    const targetId = record ? record.id : fallbackId;
    const desc = tx.personName ? `for ${tx.personName}` : (tx.category ? `for ${tx.category}` : '');

    openDeleteConfirm(
      `Delete ${tx.type}?`,
      `Are you sure you want to delete this ${formatINR(tx.amount)} ${tx.type} record ${desc}? It will be moved to the Recycle Bin (restorable for 15 days).`,
      () => {
        if (type === 'income') deleteIncome(targetId);
        else if (type === 'expense') deleteExpense(targetId);
        else if (type === 'payment') deletePayment(targetId);
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Header & Filter Controls */}
      <div className="bg-white dark:bg-black px-4 pt-3 pb-3 border-b border-slate-100 dark:border-neutral-800 shrink-0 space-y-2.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Transaction History</h2>
              <p className="text-xs text-slate-400">Complete audit ledger of all cashflow</p>
            </div>
          </div>
          <motion.button
            id="tx-toggle-date-filter"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDateFilters(!showDateFilters)}
            className={`px-2.5 py-1.5 rounded-xl border flex items-center space-x-1.5 text-xs font-semibold transition-colors shadow-xs cursor-pointer ${
              showDateFilters || startDate || endDate
                ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20'
                : 'bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-neutral-800'
            }`}
          >
            <motion.div
              animate={{ rotate: showDateFilters ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </motion.div>
            <span>Filter</span>
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="tx-search-input"
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setDisplayLimit(INITIAL_PAGE_SIZE);
            }}
            placeholder="Search transactions, category, note..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
          />
        </div>

        {/* Filter Type Pills: All, Income, Expense, Payment with Distinct Vibrant Colors & Animations */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100/90 dark:bg-neutral-950 rounded-2xl border border-slate-200/60 dark:border-neutral-800 shadow-xs">
          {TAB_CONFIG.map(tab => {
            const isActive = activeType === tab.id;
            const IconComponent = tab.icon;
            const count = typeCounts[tab.id];

            return (
              <motion.button
                key={tab.id}
                id={`tx-type-pill-${tab.id.toLowerCase()}`}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                onClick={() => handleSelectType(tab.id)}
                className={`relative py-2 px-1 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center border cursor-pointer select-none ${
                  isActive ? tab.activeClass : tab.inactiveClass
                }`}
              >
                {/* Active animated indicator highlight */}
                {isActive && (
                  <motion.div
                    layoutId="activeTransactionTabGlow"
                    className="absolute inset-0 rounded-xl pointer-events-none -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}

                <div className="flex items-center space-x-1">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </motion.div>
                  <span className="leading-none text-[11px] font-extrabold tracking-tight">
                    {tab.label}
                  </span>
                </div>

                {/* Counter Pill */}
                <span
                  className={`mt-1 text-[9.5px] px-1.5 py-0.2 rounded-full font-bold border transition-colors ${
                    isActive ? tab.badgeActiveClass : tab.badgeInactiveClass
                  }`}
                >
                  {count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Active Filter Notification Banner with Dynamic Matching Color Palette */}
        <AnimatePresence>
          {activeType !== 'All' && (
            <motion.div
              key="active-filter-notification-banner"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs shadow-2xs border ${
                activeType === 'Income'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : activeType === 'Expense'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center space-x-2 truncate">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    activeType === 'Income'
                      ? 'bg-emerald-500'
                      : activeType === 'Expense'
                      ? 'bg-rose-500'
                      : 'bg-blue-500'
                  }`}
                />
                <span className="font-medium truncate text-[11px]">
                  Filtered: <strong className="font-bold">{activeType} records</strong> ({filteredTransactions.length} found)
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelectType('All')}
                className="font-bold text-[11px] underline flex items-center space-x-1 shrink-0 ml-2 cursor-pointer hover:opacity-80"
              >
                <span>Show All</span>
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Range Collapsible Filters */}
        <AnimatePresence>
          {showDateFilters && (
            <motion.div
              key="date-range-filter-panel"
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="p-3 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200/80 dark:border-neutral-800 space-y-2 overflow-hidden shadow-xs"
            >
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <span>Date Range Selection</span>
                {(startDate || endDate) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setStartDate('');
                      setEndDate('');
                      setDisplayLimit(INITIAL_PAGE_SIZE);
                    }}
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear</span>
                  </motion.button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">From Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => {
                      setStartDate(e.target.value);
                      setDisplayLimit(INITIAL_PAGE_SIZE);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-black"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">To Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => {
                      setEndDate(e.target.value);
                      setDisplayLimit(INITIAL_PAGE_SIZE);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-black"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* High-Performance Transaction List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No matching transactions</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filters or logging a new record</p>
          </div>
        ) : (
          <>
            {visibleTransactions.map((tx, idx) => {
              const isIncome = tx.type === 'Income';
              const isExpense = tx.type === 'Expense';
              const isPayment = tx.type === 'Payment';
              const isPaid = isPayment && tx.paymentDirection === 'Paid';
              const isReceived = isPayment && tx.paymentDirection === 'Received';

              // Resolve Person Name and Type reliably
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
                const found = persons.find(p => p.name && p.name.trim().toLowerCase() === resolvedPersonName.toLowerCase());
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

              // Color Theme:
              // Expense = Rose/Red accent with clean white/black card
              // Income = Emerald/Green accent with clean white/black card
              // Payment = Matches the Payment tab button (from-amber-500 via-amber-600 to-orange-600 gradient icon, amber borders, amber accent)
              const cardClasses = isPayment
                ? 'bg-gradient-to-r from-amber-50/90 via-amber-50/50 to-white dark:from-amber-950/40 dark:via-neutral-900 dark:to-black border-amber-300 dark:border-amber-700/80 border-l-4 border-l-amber-500 hover:border-amber-400 hover:bg-amber-50/80 dark:hover:bg-amber-950/60 shadow-xs shadow-amber-500/10'
                : isExpense
                ? 'bg-white dark:bg-black border-slate-200/80 dark:border-neutral-800 border-l-4 border-l-rose-500 hover:border-rose-300 hover:bg-rose-50/10 shadow-xs'
                : 'bg-white dark:bg-black border-slate-200/80 dark:border-neutral-800 border-l-4 border-l-emerald-500 hover:border-emerald-300 hover:bg-emerald-50/10 shadow-xs';

              const iconBoxClasses = isIncome
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-300/40'
                : isExpense
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 ring-1 ring-rose-300/40'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/50';

              const amountColor = isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : isExpense
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-amber-600 dark:text-amber-400';

              const amountSign = isExpense || isPaid ? '-' : '+';

              const badgeClasses = isIncome
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60'
                : isExpense
                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white shadow-xs font-bold border border-amber-400/50';

              return (
                <div
                  key={`${tx.id || 'tx'}-${idx}`}
                  onClick={() => setSelectedTxDetail(tx)}
                  className={`rounded-2xl p-3.5 border flex items-center justify-between hover:shadow-md transition-all cursor-pointer ${cardClasses}`}
                >
                  {/* Left Side: Icon & Details */}
                  <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform hover:scale-110 ${iconBoxClasses}`}>
                      {isIncome && <ArrowDownLeft className="w-5 h-5" />}
                      {isExpense && <ArrowUpRight className="w-5 h-5" />}
                      {isPayment && <Handshake className="w-5 h-5" />}
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Title: Person Name for Payments, Note or Category for Expense/Income */}
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        {isPayment ? (
                          <>
                            <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 flex items-center space-x-1.5 truncate">
                              <span>{resolvedPersonName || tx.note || tx.category || 'Person Payment'}</span>
                            </h4>
                            {resolvedPersonType && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300/60">
                                {resolvedPersonType}
                              </span>
                            )}
                          </>
                        ) : isExpense ? (
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {tx.note || tx.category || 'Expense'}
                          </h4>
                        ) : (
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {tx.note || resolvedPersonName || 'Income'}
                          </h4>
                        )}
                      </div>

                      {/* Meta Line: Date • Payment Method • Direction */}
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 inline text-slate-400" />
                          <span>{tx.date}</span>
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{tx.paymentMethod}</span>
                        {isPayment && tx.paymentDirection && (
                          <>
                            <span>•</span>
                            <span className="font-bold text-amber-700 dark:text-amber-400">
                              {isPaid ? 'Paid to Person' : 'Received from Person'}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Details row: Matching rich Expenses card format with Tags, Person badge & Note */}
                      {isPayment ? (
                        <div className="flex items-center space-x-2 text-[10px] mt-1 flex-wrap gap-y-1">
                          {/* Person Tag with User icon - Matching Expense card format */}
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700/70 font-bold shadow-2xs">
                            <User className="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
                            <span className="truncate max-w-[130px]">{resolvedPersonName || 'Person'}</span>
                          </span>

                          {/* Category Tag */}
                          {tx.category && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-white/90 dark:bg-neutral-800 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-semibold">
                              <Tag className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate max-w-[140px]">{tx.category}</span>
                            </span>
                          )}

                          {/* Note if present */}
                          {tx.note && (
                            <span className="text-slate-600 dark:text-slate-300 truncate max-w-[150px] italic">
                              "{tx.note}"
                            </span>
                          )}
                        </div>
                      ) : isExpense ? (
                        <div className="flex items-center space-x-2 text-[10px] mt-1 flex-wrap gap-y-1">
                          {tx.category && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40 font-medium">
                              <Tag className="w-3 h-3 text-rose-500 shrink-0" />
                              <span className="truncate max-w-[140px]">{tx.category}</span>
                            </span>
                          )}
                          {resolvedPersonName && (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 font-medium">
                              <User className="w-3 h-3 text-slate-500 shrink-0" />
                              <span className="truncate max-w-[120px]">{resolvedPersonName}</span>
                            </span>
                          )}
                          {tx.note && tx.category && (
                            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">
                              {tx.note}
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-[10px] mt-1 flex-wrap gap-y-1">
                          {resolvedPersonName ? (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40 font-medium">
                              <User className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span className="truncate max-w-[140px]">{resolvedPersonName}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40 font-medium">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600 shrink-0" />
                              <span>Income</span>
                            </span>
                          )}
                          {tx.note && (
                            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
                              {tx.note}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Amount, Badge, and Action Buttons */}
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-black tracking-tight ${amountColor}`}>
                      {amountSign}
                      {formatINR(tx.amount)}
                    </p>

                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${badgeClasses}`}>
                      {isPayment
                        ? isPaid
                          ? 'Payment (Paid)'
                          : isReceived
                          ? 'Payment (Recv)'
                          : 'Payment'
                        : tx.type}
                    </span>

                    <div className="flex items-center justify-end space-x-1.5 mt-1.5">
                      <button
                        id={`tx-edit-${tx.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(tx);
                        }}
                        className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 shadow-2xs transition-all cursor-pointer active:scale-90"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      </button>
                      <button
                        id={`tx-delete-${tx.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(tx);
                        }}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 shadow-2xs transition-all cursor-pointer active:scale-90"
                        title="Delete Record"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load More Pagination for ultra smooth performance with high record counts */}
            {hasMore && (
              <div className="pt-2 pb-4 text-center">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setDisplayLimit(prev => prev + INITIAL_PAGE_SIZE)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 inline-flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Load More ({filteredTransactions.length - displayLimit} remaining)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Transaction Detail Popup Window */}
      <TransactionDetailModal
        transaction={selectedTxDetail}
        isOpen={Boolean(selectedTxDetail)}
        onClose={() => setSelectedTxDetail(null)}
        onEdit={(tx) => {
          setSelectedTxDetail(null);
          handleEdit(tx);
        }}
        onDelete={(tx) => {
          setSelectedTxDetail(null);
          handleDelete(tx);
        }}
      />
    </div>
  );
};
