import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Trash2,
  RotateCcw,
  Clock,
  Search,
  Users,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertTriangle,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RecycleBinItem, RecycleBinItemType } from '../types';

export const RecycleBinView: React.FC = () => {
  const {
    recycleBin,
    restoreFromRecycleBin,
    deletePermanently,
    emptyRecycleBin,
    openDeleteConfirm,
    goBack,
    setCurrentView,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | RecycleBinItemType>('all');

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    return recycleBin.filter(item => {
      const matchesFilter = selectedFilter === 'all' || item.itemType === selectedFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesFilter;

      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.itemType.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [recycleBin, selectedFilter, searchQuery]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: recycleBin.length,
      person: recycleBin.filter(i => i.itemType === 'person').length,
      income: recycleBin.filter(i => i.itemType === 'income').length,
      expense: recycleBin.filter(i => i.itemType === 'expense').length,
      payment: recycleBin.filter(i => i.itemType === 'payment').length,
    };
  }, [recycleBin]);

  // Helper to calculate days remaining until 15-day auto purge
  const getDaysRemaining = (expiresAt: string) => {
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    if (days <= 0) return { days: 0, text: 'Auto-deleting today', urgent: true };
    if (days === 1) return { days: 1, text: '1 day left', urgent: true };
    return { days, text: `${days} days left`, urgent: days <= 3 };
  };

  const getItemTypeConfig = (type: RecycleBinItemType) => {
    switch (type) {
      case 'person':
        return {
          icon: Users,
          label: 'Person',
          badgeBg: 'bg-indigo-50',
          badgeText: 'text-indigo-700',
          iconBg: 'bg-indigo-100',
          iconColor: 'text-indigo-600',
        };
      case 'income':
        return {
          icon: TrendingUp,
          label: 'Income',
          badgeBg: 'bg-emerald-50',
          badgeText: 'text-emerald-700',
          iconBg: 'bg-emerald-100',
          iconColor: 'text-emerald-600',
        };
      case 'expense':
        return {
          icon: TrendingDown,
          label: 'Expense',
          badgeBg: 'bg-rose-50',
          badgeText: 'text-rose-700',
          iconBg: 'bg-rose-100',
          iconColor: 'text-rose-600',
        };
      case 'payment':
        return {
          icon: CreditCard,
          label: 'Payment',
          badgeBg: 'bg-amber-50',
          badgeText: 'text-amber-700',
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
        };
    }
  };

  const handlePermanentDeleteClick = (item: RecycleBinItem) => {
    openDeleteConfirm(
      'Permanently Delete Item?',
      `Are you sure you want to permanently delete "${item.title}"? This item cannot be recovered.`,
      () => deletePermanently(item.id)
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-black overflow-hidden">
      {/* Top Header */}
      <div className="bg-white dark:bg-black border-b border-slate-100 dark:border-neutral-800 px-4 py-3.5 flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={goBack}
            className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-600 dark:text-slate-300 transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100">Recycle Bin</h1>
              {recycleBin.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold text-[10px] border border-rose-100 dark:border-rose-900/40">
                  {recycleBin.length} items
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-400">Items auto-delete after 15 days</p>
          </div>
        </div>

        {recycleBin.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={emptyRecycleBin}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold border border-rose-200/60 dark:border-rose-800/60 transition-colors"
            title="Empty all items permanently"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Empty Bin</span>
          </motion.button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5">
        {/* 15-Day Auto-Purge Policy Notice Card */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-amber-500/10 via-rose-500/5 to-transparent border border-amber-200/80 rounded-2xl p-3.5 flex items-start space-x-3 shadow-xs"
        >
          <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0 mt-0.5">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <div className="flex items-center space-x-1.5 font-bold text-slate-800">
              <span>Automatic 15-Day Retention</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-semibold">
                Auto-Purge
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              Any deleted item is safely stored here for <strong>15 days</strong>. You can restore it to your active ledger anytime. After 15 days, it is automatically and permanently purged.
            </p>
          </div>
        </motion.div>

        {recycleBin.length > 0 && (
          <>
            {/* Search and Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search deleted items..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {(
                  [
                    { key: 'all', label: 'All', count: counts.all },
                    { key: 'person', label: 'Persons', count: counts.person },
                    { key: 'income', label: 'Income', count: counts.income },
                    { key: 'expense', label: 'Expenses', count: counts.expense },
                    { key: 'payment', label: 'Payments', count: counts.payment },
                  ] as const
                ).map(tab => (
                  <motion.button
                    key={tab.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center space-x-1 border ${
                      selectedFilter === tab.key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-black text-slate-600 dark:text-slate-300 border-slate-200 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        selectedFilter === tab.key
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Recycle Bin Items List */}
            {filteredItems.length === 0 ? (
              <div className="bg-white dark:bg-black rounded-2xl p-6 text-center border border-slate-100 dark:border-neutral-800 space-y-2 mt-4">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">No items match your filter</p>
                <p className="text-[11px] text-slate-400">Try adjusting your search query or tab</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, idx) => {
                    const config = getItemTypeConfig(item.itemType);
                    const { text: daysText, urgent } = getDaysRemaining(item.expiresAt);
                    const Icon = config.icon;

                    const deletedDateStr = new Date(item.deletedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });

                    const autoDeleteDateStr = new Date(item.expiresAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    });

                    return (
                      <motion.div
                        key={`${item.id || 'bin'}-${idx}`}
                        layout
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="bg-white dark:bg-black rounded-2xl p-3.5 border border-slate-200/80 dark:border-neutral-800 shadow-xs hover:border-slate-300 dark:hover:border-neutral-700 transition-all space-y-3"
                      >
                        {/* Header of Card */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div className={`p-2 rounded-xl ${config.iconBg} ${config.iconColor} shrink-0`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${config.badgeBg} ${config.badgeText}`}>
                                  {config.label}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center space-x-1 ${
                                    urgent
                                      ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                  title={`Auto-deletes on ${autoDeleteDateStr}`}
                                >
                                  <Clock className="w-3 h-3 inline mr-0.5" />
                                  <span>{daysText}</span>
                                </span>
                              </div>
                              <h3 className="text-xs font-bold text-slate-800 mt-1">
                                {item.title}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Subtitle / Details */}
                        {item.subtitle && (
                          <p className="text-[11px] text-slate-500 bg-slate-50/80 p-2 rounded-xl border border-slate-100 leading-relaxed">
                            {item.subtitle}
                          </p>
                        )}

                        {/* Timeline Information */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Deleted: {deletedDateStr}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-slate-500">
                            <span>Auto-purge:</span>
                            <span className="font-semibold text-rose-600">{autoDeleteDateStr}</span>
                          </div>
                        </div>

                        {/* Actions: Restore & Delete Permanently */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => restoreFromRecycleBin(item.id)}
                            className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200/70 transition-all flex items-center justify-center space-x-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore</span>
                          </motion.button>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handlePermanentDeleteClick(item)}
                            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200/80 transition-all flex items-center justify-center space-x-1.5 shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delete Forever</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </>
        )}

        {/* Empty State when no items in bin */}
        {recycleBin.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-xs space-y-4 my-8"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-sm font-bold text-slate-800">Recycle Bin is Empty</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                Whenever you delete a person, income record, expense, or payment, it will be moved here and kept safely for 15 days before automatic permanent removal.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setCurrentView('dashboard')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center space-x-1.5"
            >
              <span>Back to Dashboard</span>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
