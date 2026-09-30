import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  CreditCard,
  BarChart3,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  UserPlus,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, currentView, setCurrentView, openQuickAction } = useApp();
  const [speedDialOpen, setSpeedDialOpen] = useState(false);

  const navItems: { tab: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { tab: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { tab: 'daily', label: 'Daily', icon: Calendar },
    { tab: 'persons', label: 'Persons', icon: Users },
    { tab: 'payments', label: 'Payments', icon: CreditCard },
    { tab: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  const handleAction = (action: 'add_person' | 'add_income' | 'add_expense' | 'add_payment') => {
    setSpeedDialOpen(false);
    openQuickAction(action);
  };

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setCurrentView(tab);
  };

  return (
    <>
      {/* Backdrop for speed dial */}
      <AnimatePresence>
        {speedDialOpen && (
          <motion.div
            key="speeddial-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSpeedDialOpen(false)}
            className="absolute inset-0 z-40 bg-slate-950/50 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Floating Speed Dial Actions */}
      <AnimatePresence>
        {speedDialOpen && (
          <motion.div
            key="speeddial-actions-container"
            className="absolute bottom-24 right-5 z-50 flex flex-col items-end space-y-3 pointer-events-auto"
          >
            {/* Add Income */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.8 }}
              transition={{ delay: 0.03 }}
              whileHover={{ scale: 1.05, x: -4 }}
              className="flex items-center space-x-2"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-emerald-50 via-emerald-50/70 to-white dark:from-emerald-950/70 dark:via-neutral-900 dark:to-black text-emerald-950 dark:text-emerald-200 text-xs font-black px-3 py-1.5 rounded-xl shadow-md border border-emerald-300 dark:border-emerald-700/80 border-l-4 border-l-emerald-500"
              >
                Add Income
              </motion.span>
              <motion.button
                id="speeddial-add-income"
                whileHover={{ scale: 1.15, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAction('add_income')}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 ring-2 ring-emerald-400/50 hover:brightness-110 transition-all cursor-pointer"
              >
                <ArrowDownLeft className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Add Expense */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.8 }}
              transition={{ delay: 0.06 }}
              whileHover={{ scale: 1.05, x: -4 }}
              className="flex items-center space-x-2"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-rose-50 via-rose-50/70 to-white dark:from-rose-950/70 dark:via-neutral-900 dark:to-black text-rose-950 dark:text-rose-200 text-xs font-black px-3 py-1.5 rounded-xl shadow-md border border-rose-300 dark:border-rose-700/80 border-l-4 border-l-rose-500"
              >
                Add Expense
              </motion.span>
              <motion.button
                id="speeddial-add-expense"
                whileHover={{ scale: 1.15, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAction('add_expense')}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-red-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 ring-2 ring-rose-400/50 hover:brightness-110 transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Add Payment */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.8 }}
              transition={{ delay: 0.09 }}
              whileHover={{ scale: 1.05, x: -4 }}
              className="flex items-center space-x-2"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-white dark:from-amber-950/70 dark:via-neutral-900 dark:to-black text-amber-950 dark:text-amber-200 text-xs font-black px-3 py-1.5 rounded-xl shadow-md border border-amber-300 dark:border-amber-700/80 border-l-4 border-l-amber-500"
              >
                Add Payment
              </motion.span>
              <motion.button
                id="speeddial-add-payment"
                whileHover={{ scale: 1.15, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAction('add_payment')}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/40 ring-2 ring-amber-400/50 hover:brightness-110 transition-all cursor-pointer"
              >
                <Handshake className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Add Person */}
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.8 }}
              transition={{ delay: 0.12 }}
              whileHover={{ scale: 1.05, x: -4 }}
              className="flex items-center space-x-2"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-r from-blue-50 via-blue-50/70 to-white dark:from-blue-950/70 dark:via-neutral-900 dark:to-black text-blue-950 dark:text-blue-200 text-xs font-black px-3 py-1.5 rounded-xl shadow-md border border-blue-300 dark:border-blue-700/80 border-l-4 border-l-blue-500"
              >
                Add Person
              </motion.span>
              <motion.button
                id="speeddial-add-person"
                whileHover={{ scale: 1.15, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAction('add_person')}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/40 ring-2 ring-blue-400/50 hover:brightness-110 transition-all cursor-pointer"
              >
                <UserPlus className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Speed Dial Toggle Button */}
      <div className="absolute bottom-20 right-5 z-40">
        <motion.button
          id="floating-speed-dial-toggle"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          onClick={() => setSpeedDialOpen(!speedDialOpen)}
          className={`w-13 h-13 rounded-full flex items-center justify-center shadow-xl transition-colors duration-300 ${
            speedDialOpen
              ? 'bg-slate-800 text-white ring-4 ring-slate-800/30'
              : 'bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-blue-600/40 ring-4 ring-blue-500/20'
          }`}
          title="Quick Add Actions"
        >
          <motion.div
            animate={{ rotate: speedDialOpen ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {speedDialOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7 stroke-[2.5]" />}
          </motion.div>
        </motion.button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white dark:bg-black border-t border-slate-200/80 dark:border-neutral-800 px-2 py-1.5 shrink-0 z-30 shadow-lg select-none transition-colors duration-200">
        <div className="grid grid-cols-5 items-center justify-items-center">
          {navItems.map(item => {
            const Icon = item.icon;
            const isSelected = activeTab === item.tab && (currentView === item.tab || (item.tab === 'dashboard' && !['daily', 'persons', 'payments', 'reports'].includes(currentView)));
            return (
              <motion.button
                key={item.tab}
                id={`bottomnav-tab-${item.tab}`}
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -2 }}
                onClick={() => handleTabClick(item.tab)}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all w-full max-w-[64px] ${
                  isSelected
                    ? 'text-blue-600 dark:text-blue-400 font-bold'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-medium'
                }`}
              >
                <motion.div
                  animate={isSelected ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className={`w-9 h-7 rounded-full flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <motion.div
                    whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Icon className={`w-4.5 h-4.5 ${isSelected ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                  </motion.div>
                </motion.div>
                <span className="text-[10px] mt-0.5 tracking-tight leading-none whitespace-nowrap">
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
