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
import { Transaction, TransactionType, PaymentMethod, PAYMENT_METHODS, PAYMENT_METHOD_CONFIGS } from '../types';
import { formatINR } from '../services/calculations';
import { TransactionDetailModal } from './TransactionDetailModal';
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
    paymentMethodFilter,
    setPaymentMethodFilter,
  } = useApp();

  const [activeType, setActiveType] = useState<TransactionType | 'All'>(() => transactionFilter || 'All');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | 'All'>(() => paymentMethodFilter || 'All');
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

  // Sync with global payment method filter when changed from Dashboard School/Salary/Other cards
  React.useEffect(() => {
    if (paymentMethodFilter !== undefined) {
      setSelectedPaymentMethod(paymentMethodFilter);
      setDisplayLimit(INITIAL_PAGE_SIZE);
    }
  }, [paymentMethodFilter]);

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
      if (selectedPaymentMethod !== 'All' && t.paymentMethod !== selectedPaymentMethod) return false;

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
          {(activeType !== 'All' || selectedPaymentMethod !== 'All') && (
            <motion.div
              key="active-filter-notification-banner"
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs shadow-2xs border bg-slate-50 dark:bg-neutral-900 border-slate-200 dark:border-neutral-800 flex-wrap gap-2"
            >
              <div className="flex items-center space-x-2 truncate flex-wrap gap-1">
                {activeType !== 'All' && (
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-[11px] font-bold text-slate-800 dark:text-slate-100">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        activeType === 'Income'
                          ? 'bg-emerald-500'
                          : activeType === 'Expense'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>{activeType}</span>
                    <button
                      type="button"
                      onClick={() => handleSelectType('All')}
                      className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="Clear type filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedPaymentMethod !== 'All' && (
                  <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-lg bg-white dark:bg-black border border-slate-200 dark:border-neutral-700 text-[11px] font-bold text-slate-800 dark:text-slate-100">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${PAYMENT_METHOD_CONFIGS[selectedPaymentMethod]?.dotColor || 'bg-slate-400'}`} />
                    <span>Mode: {selectedPaymentMethod}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod('All');
                        setDisplayLimit(INITIAL_PAGE_SIZE);
                      }}
                      className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      title="Clear mode filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  ({filteredTransactions.length} found)
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  handleSelectType('All');
                  setSelectedPaymentMethod('All');
                  setStartDate('');
                  setEndDate('');
                }}
                className="font-bold text-[11px] text-blue-600 dark:text-blue-400 underline flex items-center space-x-1 shrink-0 ml-2 cursor-pointer hover:opacity-80"
              >
                <span>Reset All</span>
                <X className="w-3.5 h-3.5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Date Range & Payment Mode Collapsible Filters */}
        <AnimatePresence>
          {showDateFilters && (
            <motion.div
              key="date-range-filter-panel"
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="p-3 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-slate-200/80 dark:border-neutral-800 space-y-3 overflow-hidden shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
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
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-0.5 cursor-pointer text-[10.5px]"
                    >
                      <X className="w-3 h-3" />
                      <span>Clear Date</span>
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
              </div>

              {/* Payment Mode (Method) Filter */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-neutral-800">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  <span>Payment Mode</span>
                  {selectedPaymentMethod !== 'All' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPaymentMethod('All');
                        setDisplayLimit(INITIAL_PAGE_SIZE);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline text-[10px] cursor-pointer"
                    >
                      Reset Mode
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPaymentMethod('All');
                      setDisplayLimit(INITIAL_PAGE_SIZE);
                    }}
                    className={`py-1.5 px-2 text-center rounded-xl text-[10.5px] font-bold transition-all border cursor-pointer ${
                      selectedPaymentMethod === 'All'
                        ? 'bg-slate-800 text-white border-slate-700 shadow-xs'
                        : 'bg-white dark:bg-black text-slate-600 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:bg-slate-100'
                    }`}
                  >
                    All Modes
                  </button>
                  {PAYMENT_METHODS.map(method => {
                    const cfg = PAYMENT_METHOD_CONFIGS[method];
                    const isSelected = selectedPaymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => {
                          setSelectedPaymentMethod(method);
                          setDisplayLimit(INITIAL_PAGE_SIZE);
                        }}
                        className={`py-1.5 px-2 text-center rounded-xl text-[10.5px] font-bold transition-all border cursor-pointer flex items-center justify-center space-x-1 ${
                          isSelected
                            ? cfg.activeClass
                            : cfg.inactiveClass
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? 'bg-white' : cfg.dotColor}`} />
                        <span>{method}</span>
                      </button>
                    );
                  })}
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
            {visibleTransactions.map((tx, idx) => (
              <TransactionCard
                key={`${tx.id || 'tx'}-${idx}`}
                transaction={tx}
                onClick={() => setSelectedTxDetail(tx)}
                onEdit={() => handleEdit(tx)}
                onDelete={() => handleDelete(tx)}
                displayMode="date"
                idPrefix="tx"
              />
            ))}

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
