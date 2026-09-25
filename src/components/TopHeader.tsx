import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Bell, ChevronLeft, ChevronRight, RefreshCw, Search, Wallet } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopHeaderProps {
  onOpenNotifications: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenNotifications }) => {
  const { user, selectedMonth, setSelectedMonth, setCurrentView, currentView, notifications, firebaseStatus } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = () => {
    setIsSyncing(true);
    firebaseStatus.syncNow();
    setTimeout(() => setIsSyncing(false), 800);
  };

  // Format YYYY-MM to readable "September 2026"
  const formattedMonth = React.useMemo(() => {
    try {
      const [year, month] = selectedMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const prevY = date.getFullYear();
    const prevM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${prevY}-${prevM}`);
  };

  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const date = new Date(y, m, 1);
    const nextY = date.getFullYear();
    const nextM = String(date.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${nextY}-${nextM}`);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-5 pt-3 pb-5 rounded-b-3xl shadow-md shrink-0"
    >
      {/* Upper row: App Logo & Brand Name, Actions */}
      <div className="flex items-center justify-between">
        {/* Left: App Logo & Name (Replaces user name display) */}
        <div
          id="topheader-app-brand"
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center space-x-2.5 select-none cursor-pointer group"
          title="Income & Expense Tracker - Go to Dashboard"
        >
          <motion.div
            whileHover={{ scale: 1.08, rotate: [0, -6, 6, 0] }}
            whileTap={{ scale: 0.94 }}
            className="w-10 h-10 rounded-2xl bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-inner shrink-0 transition-colors"
          >
            {/* Custom high-res App Logo */}
            <div className="relative flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white drop-shadow-xs" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border border-blue-700 flex items-center justify-center text-[8px] font-black text-slate-900 shadow-2xs">
                ₹
              </span>
            </div>
          </motion.div>

          <div className="flex flex-col justify-center">
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-black text-white tracking-tight leading-none group-hover:text-blue-50 transition-colors">
                Income &amp; Expense
              </h1>
            </div>
            <p className="text-[10.5px] text-blue-100/90 font-medium tracking-wide mt-0.5">
              Financial Tracker
            </p>
          </div>
        </div>

        {/* Right: Sync, Search & Notification */}
        <div className="flex items-center space-x-2">
          <motion.button
            id="topheader-sync-btn"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleSyncClick}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center relative transition-colors"
            title="Sync all data & ledgers"
          >
            <motion.div
              animate={{ rotate: isSyncing ? 360 : 0 }}
              transition={isSyncing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0.3 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            <span
              className={`absolute bottom-1 right-1 w-2 h-2 rounded-full border border-blue-700 ${
                firebaseStatus.isOnline ? 'bg-emerald-400' : 'bg-rose-400'
              }`}
              title={firebaseStatus.isOnline ? 'Online' : 'Offline'}
            />
          </motion.button>

          <motion.button
            id="topheader-search-btn"
            whileHover={{ scale: 1.12, rotate: 10 }}
            whileTap={{ scale: 0.88 }}
            transition={{ type: "spring", stiffness: 400 }}
            onClick={() => setCurrentView('search')}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              currentView === 'search'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'bg-white/15 hover:bg-white/25 text-white'
            }`}
            title="Search transactions and persons"
          >
            <Search className="w-4 h-4" />
          </motion.button>

          <motion.button
            id="topheader-notifications-btn"
            whileHover={{ scale: 1.12, rotate: [-10, 10, -5, 0] }}
            whileTap={{ scale: 0.88 }}
            transition={{ duration: 0.35 }}
            onClick={onOpenNotifications}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <motion.span
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-blue-700"
              />
            )}
          </motion.button>
        </div>
      </div>

      {/* Month Selector Bar */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="mt-3.5 flex items-center justify-between bg-black/15 backdrop-blur-xs rounded-xl px-3 py-1.5 border border-white/10"
      >
        <motion.button
          id="month-selector-prev"
          whileHover={{ scale: 1.2, x: -2 }}
          whileTap={{ scale: 0.85 }}
          onClick={handlePrevMonth}
          className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </motion.button>

        <div className="flex items-center space-x-1 text-xs font-semibold tracking-wide text-white">
          <span>{formattedMonth}</span>
        </div>

        <motion.button
          id="month-selector-next"
          whileHover={{ scale: 1.2, x: 2 }}
          whileTap={{ scale: 0.85 }}
          onClick={handleNextMonth}
          className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </motion.header>
  );
};
