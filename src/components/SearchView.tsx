import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  User,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  Calendar,
  X,
  Phone,
  ChevronRight,
  ArrowLeft,
  Edit2,
  Tag
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../services/calculations';
import { Transaction } from '../types';

export const SearchView: React.FC = () => {
  const {
    persons,
    transactions,
    income,
    expenses,
    payments,
    startEditItem,
    setSelectedPersonForProfile,
    setCurrentView,
    goBack,
    setActiveTab,
  } = useApp();

  const [query, setQuery] = useState('');

  const handleEditTx = (tx: Transaction) => {
    const rawId = tx.id.replace(/^tx_/, '');
    if (tx.type === 'Income') {
      const item = income.find(i => i.id === rawId || i.id === tx.id);
      if (item) startEditItem({ type: 'income', data: item });
    } else if (tx.type === 'Expense') {
      const item = expenses.find(e => e.id === rawId || e.id === tx.id);
      if (item) startEditItem({ type: 'expense', data: item });
    } else if (tx.type === 'Payment') {
      const item = payments.find(p => p.id === rawId || p.id === tx.id);
      if (item) startEditItem({ type: 'payment', data: item });
    }
  };

  // Real-time search across persons and transactions
  const matchedPersons = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return (persons || []).filter(
      p =>
        p && (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.mobile && p.mobile.includes(q)) ||
          (p.address && p.address.toLowerCase().includes(q)) ||
          (p.notes && p.notes.toLowerCase().includes(q))
        )
    );
  }, [persons, query]);

  const matchedTransactions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return (transactions || []).filter(
      t =>
        t && (
          (t.personName && t.personName.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.note && t.note.toLowerCase().includes(q)) ||
          (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q)) ||
          (t.type && t.type.toLowerCase().includes(q)) ||
          String(t.amount).includes(q)
        )
    );
  }, [transactions, query]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Search Input Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-black px-4 pt-3 pb-3 border-b border-slate-100 dark:border-neutral-800 shrink-0 shadow-2xs"
      >
        <div className="flex items-center space-x-2 mb-2">
          <motion.button
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Global Search</h2>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search persons, incomes, expenses, payments..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
          />
          {query && (
            <motion.button
              whileHover={{ scale: 1.2, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!query.trim() ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center text-slate-400"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400 shadow-xs"
            >
              <Search className="w-6 h-6" />
            </motion.div>
            <p className="text-sm font-semibold text-slate-600">Quick Global Search</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
              Type a contact name, phone number, category, or note to instantly find records.
            </p>
          </motion.div>
        ) : (
          <>
            {/* Person Matches */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Persons ({matchedPersons.length})
              </h3>

              {matchedPersons.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No contacts match "{query}"</p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {matchedPersons.map((person, idx) => (
                      <motion.div
                        key={`${person.id || 'person'}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(0.2, idx * 0.03), duration: 0.2 }}
                        whileHover={{ y: -2, scale: 1.01, x: 2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPersonForProfile(person)}
                        className="bg-white dark:bg-black p-3 rounded-2xl border border-slate-100 dark:border-neutral-800 shadow-xs flex items-center justify-between hover:border-blue-200 dark:hover:border-neutral-700 cursor-pointer transition-all"
                      >
                        <div className="flex items-center space-x-3">
                          <motion.div
                            whileHover={{ scale: 1.15, rotate: 6 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shadow-xs"
                          >
                            {person.name.substring(0, 2).toUpperCase()}
                          </motion.div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{person.name}</p>
                            <div className="flex items-center space-x-1 text-[10px] text-slate-400">
                              <Phone className="w-3 h-3" />
                              <span>{person.mobile}</span>
                              <span>•</span>
                              <span className="font-semibold text-slate-600 dark:text-slate-300">{person.type}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.15, rotate: 6 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditItem({ type: 'person', data: person });
                            }}
                            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80 shadow-2xs transition-all"
                            title={`Edit ${person.name}`}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          </motion.button>
                          <motion.div whileHover={{ x: 3 }}>
                            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                          </motion.div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Transaction Matches */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Transactions ({matchedTransactions.length})
              </h3>

              {matchedTransactions.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No transactions match "{query}"</p>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {matchedTransactions.map((tx, idx) => {
                      const isIncome = tx.type === 'Income';
                      const isExpense = tx.type === 'Expense';
                      const isPayment = tx.type === 'Payment';
                      const isPaid = isPayment && tx.paymentDirection === 'Paid';
                      const isReceived = isPayment && tx.paymentDirection === 'Received';

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

                      const iconBox = isIncome
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                        : isPaid
                        ? 'bg-amber-100 dark:bg-amber-900/70 text-amber-700 dark:text-amber-300 ring-2 ring-amber-400/50'
                        : 'bg-teal-100 dark:bg-teal-900/70 text-teal-700 dark:text-teal-300 ring-2 ring-teal-400/50';

                      const amountColor = isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'text-rose-600 dark:text-rose-400'
                        : isPaid
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-teal-600 dark:text-teal-400';

                      const amountSign = isExpense || isPaid ? '-' : '+';

                      const badgeClasses = isIncome
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                        : isExpense
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200'
                        : isPaid
                        ? 'bg-amber-100/90 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold'
                        : 'bg-teal-100/90 dark:bg-teal-950/50 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700 font-bold';

                      const cardClasses = isPayment
                        ? isPaid
                          ? 'bg-gradient-to-r from-amber-50/70 via-amber-50/30 to-white dark:from-amber-950/30 dark:via-neutral-900 dark:to-black border-amber-300/90 dark:border-amber-700/80 border-l-4 border-l-amber-500 hover:border-amber-400 hover:bg-amber-50/80'
                          : 'bg-gradient-to-r from-teal-50/70 via-teal-50/30 to-white dark:from-teal-950/30 dark:via-neutral-900 dark:to-black border-teal-300/90 dark:border-teal-700/80 border-l-4 border-l-teal-500 hover:border-teal-400 hover:bg-teal-50/80'
                        : isExpense
                        ? 'bg-white dark:bg-black border-slate-200/80 dark:border-neutral-800 border-l-4 border-l-rose-500 hover:border-rose-300 hover:bg-rose-50/10'
                        : 'bg-white dark:bg-black border-slate-200/80 dark:border-neutral-800 border-l-4 border-l-emerald-500 hover:border-emerald-300 hover:bg-emerald-50/10';

                      return (
                        <motion.div
                          key={`${tx.id || 'tx'}-${idx}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: Math.min(0.2, idx * 0.03), duration: 0.2 }}
                          whileHover={{ y: -2, scale: 1.01 }}
                          className={`p-3 rounded-2xl border shadow-xs flex items-center justify-between hover:shadow-md transition-all ${cardClasses}`}
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1 pr-2">
                            <motion.div
                              whileHover={{ scale: 1.15, rotate: 10 }}
                              transition={{ type: "spring", stiffness: 400 }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${iconBox}`}
                            >
                              {isIncome && <ArrowDownLeft className="w-4 h-4" />}
                              {isExpense && <ArrowUpRight className="w-4 h-4" />}
                              {isPayment && <Handshake className="w-4 h-4" />}
                            </motion.div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center space-x-1.5 flex-wrap">
                                {isPayment ? (
                                  <>
                                    <p className="text-xs font-black text-amber-950 dark:text-amber-200 truncate">
                                      {resolvedPersonName || tx.note || tx.category || 'Person Payment'}
                                    </p>
                                    {resolvedPersonType && (
                                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200 border border-amber-300/60">
                                        {resolvedPersonType}
                                      </span>
                                    )}
                                  </>
                                ) : isExpense ? (
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {tx.note || tx.category || 'Expense'}
                                  </p>
                                ) : (
                                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                    {tx.note || resolvedPersonName || 'Income'}
                                  </p>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                                {tx.date} • {tx.paymentMethod}
                                {isPayment && (
                                  <span className={`font-semibold ml-1 ${isPaid ? 'text-amber-700 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400'}`}>
                                    • {isPaid ? 'Paid to Person' : 'Received'}
                                  </span>
                                )}
                                {tx.type === 'Expense' && tx.note && tx.category && ` • ${tx.category}`}
                                {tx.type === 'Income' && tx.note && ` • ${resolvedPersonName || 'Income'}`}
                              </p>
                              {isPayment && (
                                <div className="flex items-center space-x-1.5 text-[9.5px] mt-1 flex-wrap">
                                  <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-amber-100/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-bold">
                                    <User className="w-2.5 h-2.5 text-amber-700 dark:text-amber-400" />
                                    <span className="truncate max-w-[120px]">{resolvedPersonName || 'Person'}</span>
                                  </span>
                                  {tx.category && (
                                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.2 rounded bg-white/90 dark:bg-neutral-800 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium">
                                      <Tag className="w-2.5 h-2.5 text-amber-600" />
                                      <span>{tx.category}</span>
                                    </span>
                                  )}
                                  {tx.note && (
                                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[120px] italic">
                                      "{tx.note}"
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <div className="text-right">
                              <p className={`text-xs font-black ${amountColor}`}>
                                {amountSign}
                                {formatINR(tx.amount)}
                              </p>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${badgeClasses}`}>
                                {isPayment
                                  ? isPaid
                                    ? 'Paid'
                                    : isReceived
                                    ? 'Received'
                                    : 'Payment'
                                  : tx.type}
                              </span>
                            </div>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.15, rotate: 6 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTx(tx);
                              }}
                              className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 shadow-2xs transition-all"
                              title="Edit Record"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
