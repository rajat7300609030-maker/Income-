import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Handshake, Search, ArrowDownLeft, ArrowUpRight, Clock, Hash, Calendar, Edit2, Trash2, User, ArrowLeft, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentDirection, PaymentRecord } from '../types';
import { formatINR, calculatePersonSummary } from '../services/calculations';

export const PaymentsView: React.FC = () => {
  const { payments, openQuickAction, startEditItem, openDeleteConfirm, deletePayment, setSelectedPersonForProfile, persons, setCurrentView, goBack, totals, income, expenses } = useApp();
  const [activeTab, setActiveTab] = useState<PaymentDirection | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPayments = useMemo(() => {
    const list = Array.isArray(payments) ? payments : [];
    const q = (searchQuery || '').toLowerCase();
    return list.filter(p => {
      if (!p) return false;
      const matchesTab = activeTab === 'All' || p.type === activeTab;
      const matchesSearch =
        !q ||
        (p.personName && p.personName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(q)) ||
        (p.note && p.note.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [payments, activeTab, searchQuery]);

  const totalReceived = useMemo(() => {
    return (payments || [])
      .filter(p => p && p.type === 'Received')
      .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);
  }, [payments]);

  const totalPending = useMemo(() => {
    if (totals?.pendingPayments !== undefined) {
      return totals.pendingPayments;
    }
    const safePersons = Array.isArray(persons) ? persons : [];
    const stats = safePersons.map(p => calculatePersonSummary(p, income, expenses, payments));
    return stats.reduce((acc, p) => acc + Math.max(0, p.pendingAmount || 0), 0);
  }, [totals, persons, income, expenses, payments]);

  const handleEdit = (p: PaymentRecord) => {
    startEditItem({ type: 'payment', data: p });
  };

  const handleDelete = (p: PaymentRecord) => {
    openDeleteConfirm(
      'Delete Payment Record?',
      `Delete payment of ${formatINR(p.amount)} with ${p.personName}? The person's pending ledger balance will automatically adjust.`,
      () => deletePayment(p.id)
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Header & Received/Pending Summary */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-black px-4 pt-3 pb-3 border-b border-slate-100 dark:border-neutral-800 shrink-0 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-3">
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
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Payments Ledger</h2>
              <p className="text-xs text-slate-400">Direct settlements, UPI & bank transfers</p>
            </div>
          </div>
          <motion.button
            id="payments-add-btn"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openQuickAction('add_payment')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs hover:bg-amber-600 transition-all"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.div>
            <span>Record Payment</span>
          </motion.button>
        </div>

        {/* Top Summary: Received vs Pending */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab(activeTab === 'Received' ? 'All' : 'Received')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              activeTab === 'Received'
                ? 'bg-emerald-50 dark:bg-black border-emerald-300 dark:border-emerald-500/50 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-slate-50 dark:bg-black border-slate-100 dark:border-neutral-800 hover:bg-emerald-50/40 dark:hover:bg-neutral-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                Total Received
              </span>
              <motion.div
                whileHover={{ scale: 1.25, rotate: 12 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </motion.div>
            </div>
            <p className="text-base font-black text-emerald-700 dark:text-emerald-400">{formatINR(totalReceived)}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCurrentView('persons')}
            className="p-3 rounded-2xl border cursor-pointer transition-all bg-rose-50/70 dark:bg-black border-rose-200/90 dark:border-neutral-800 hover:bg-rose-100/60 dark:hover:bg-neutral-900 shadow-xs"
            title="View Persons with Pending Balances"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-rose-800 dark:text-rose-400 uppercase tracking-wider">
                Total Pending
              </span>
              <motion.div
                whileHover={{ scale: 1.25 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Clock className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              </motion.div>
            </div>
            <p className="text-base font-black text-rose-700 dark:text-rose-400">{formatINR(totalPending)}</p>
          </motion.div>
        </div>

        {/* Tab selector */}
        <div className="grid grid-cols-3 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl mb-2.5 border dark:border-neutral-800">
          {(['All', 'Received', 'Paid'] as const).map(tab => (
            <motion.button
              key={tab}
              id={`payments-tab-${tab.toLowerCase()}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-white dark:bg-black text-slate-800 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {tab}
            </motion.button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="payments-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by person, ref no, or note..."
            className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-medium text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none"
          />
        </div>
      </motion.div>

      {/* Payment Records List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPayments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3 shadow-xs"
            >
              <Handshake className="w-6 h-6" />
            </motion.div>
            <p className="text-sm font-semibold text-slate-700">No payments found</p>
            <p className="text-xs text-slate-400 mt-1">
              Record payments received from clients or paid to employees/vendors
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openQuickAction('add_payment')}
              className="mt-4 px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold shadow-xs hover:bg-amber-600 transition-colors"
            >
              Record Payment
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPayments.map((p, idx) => {
              const isReceived = p.type === 'Received';
              const matchedPerson = persons.find(item => item.id === p.personId);

              return (
                <motion.div
                  key={`${p.id || 'payment'}-${idx}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: Math.min(0.3, idx * 0.04), duration: 0.25 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  className="bg-white dark:bg-black rounded-2xl p-4 border border-slate-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <motion.div
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 400 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                          isReceived ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {isReceived ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </motion.div>

                      <div>
                        <button
                          onClick={() => matchedPerson && setSelectedPersonForProfile(matchedPerson)}
                          className="text-xs font-bold text-slate-800 hover:text-blue-600 transition-colors text-left block"
                        >
                          {p.personName}
                        </button>

                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{p.date}</span>
                          </span>
                          <span>•</span>
                          <span className="font-semibold text-slate-600">{p.paymentMethod}</span>
                        </div>

                        {p.category && (
                          <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 mt-1">
                            <Tag className="w-2.5 h-2.5 text-amber-600" />
                            <span>{p.category}</span>
                          </div>
                        )}

                        {p.referenceNumber && (
                          <div className="flex items-center space-x-1 text-[10px] text-slate-500 mt-1">
                            <Hash className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">{p.referenceNumber}</span>
                          </div>
                        )}

                        {p.note && (
                          <p className="text-[11px] text-slate-600 mt-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100 leading-snug">
                            {p.note}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-base font-black tracking-tight ${
                          isReceived ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {isReceived ? '+' : '-'}
                        {formatINR(p.amount)}
                      </p>
                      <span
                        className={`text-[10px] font-bold block mt-0.5 ${
                          isReceived ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {isReceived ? 'Received In' : 'Paid Out'}
                      </span>

                      {/* Action buttons with Colorful Icons */}
                      <div className="flex items-center justify-end space-x-1 mt-2">
                        <motion.button
                          id={`payment-edit-${p.id}`}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Payment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.button
                          id={`payment-delete-${p.id}`}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Payment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
