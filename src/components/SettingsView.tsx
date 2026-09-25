import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User,
  Fingerprint,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  Info,
  Check,
  ChevronRight,
  Sparkles,
  Database,
  ArrowLeft,
  Trash2,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Clock,
  AlertTriangle,
  Send,
  Calendar,
  X,
  Sun,
  Moon,
  Monitor,
  Smartphone,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { InstallAppModal } from './InstallAppModal';

export const SettingsView: React.FC = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const {
    logout,
    currency,
    setCurrency,
    isBiometricLocked,
    lockBiometric,
    notify,
    openDeleteConfirm,
    refreshData,
    persons,
    income,
    expenses,
    payments,
    recycleBinCount,
    setCurrentView,
    goBack,
    theme,
    isDark,
    setTheme,
    toggleDarkMode,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBack = () => {
    goBack();
  };

  // Fully Automatic Notification states (persisted in localStorage)
  const [autoNotifyEnabled, setAutoNotifyEnabled] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_notify_enabled') !== 'false';
  });
  const [autoNotifyDailySummary, setAutoNotifyDailySummary] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_notify_daily') !== 'false';
  });
  const [autoNotifyHighExpense, setAutoNotifyHighExpense] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_notify_high_exp') !== 'false';
  });
  const [highExpenseThreshold, setHighExpenseThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('app_auto_notify_threshold');
    return saved ? Number(saved) : 5000;
  });
  const [autoNotifyPendingDues, setAutoNotifyPendingDues] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_notify_dues') !== 'false';
  });
  const [autoNotifySalary, setAutoNotifySalary] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_notify_salary') !== 'false';
  });
  const [autoNotifySound, setAutoNotifySound] = useState<boolean>(() => {
    return localStorage.getItem('app_auto_notify_sound') !== 'false';
  });
  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const toggleAutoNotifyMaster = (val: boolean) => {
    setAutoNotifyEnabled(val);
    localStorage.setItem('app_auto_notify_enabled', String(val));
    notify(val ? 'Automatic notifications enabled' : 'Automatic notifications turned off', val ? 'success' : 'info');
  };

  const toggleAutoNotifyRule = (rule: 'daily' | 'high_exp' | 'dues' | 'salary' | 'sound', val: boolean) => {
    if (rule === 'daily') {
      setAutoNotifyDailySummary(val);
      localStorage.setItem('app_auto_notify_daily', String(val));
    } else if (rule === 'high_exp') {
      setAutoNotifyHighExpense(val);
      localStorage.setItem('app_auto_notify_high_exp', String(val));
    } else if (rule === 'dues') {
      setAutoNotifyPendingDues(val);
      localStorage.setItem('app_auto_notify_dues', String(val));
    } else if (rule === 'salary') {
      setAutoNotifySalary(val);
      localStorage.setItem('app_auto_notify_salary', String(val));
    } else if (rule === 'sound') {
      setAutoNotifySound(val);
      localStorage.setItem('app_auto_notify_sound', String(val));
    }
  };

  // Play a pleasant notification chime
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be blocked by browser policy
    }
  };

  // Instant Automated Smart Notification Scanner and Tester
  const handleTestAutoNotification = () => {
    if (autoNotifySound) {
      playNotificationChime();
    }

    // Scan real dataset to formulate the smartest contextual automated alert
    const debtors = persons.filter(p => (Number(p.openingBalance) || 0) > 0);
    const bigExpenses = expenses.filter(e => (Number(e.amount) || 0) >= highExpenseThreshold);
    const employees = persons.filter(p => ['Employee', 'Staff', 'Worker'].includes(p.type));

    if (autoNotifyHighExpense && bigExpenses.length > 0) {
      const topExp = bigExpenses[0];
      notify(`[Auto Alert] High expense detected: ₹${topExp.amount.toLocaleString('en-IN')} for ${topExp.category || 'Purchase'}`, 'info');
    } else if (autoNotifyPendingDues && debtors.length > 0) {
      const top = debtors[0];
      notify(`[Auto Reminder] Outstanding collection due: ₹${Number(top.openingBalance).toLocaleString('en-IN')} from ${top.name}`, 'info');
    } else if (autoNotifySalary && employees.length > 0) {
      const emp = employees[0];
      notify(`[Auto Salary Alert] Payroll cycle active for employee ${emp.name} (${emp.salaryType || 'Monthly'})`, 'info');
    } else {
      notify(`[Auto Daily Summary] All accounts reconciled. Financial ledger is up to date!`, 'success');
    }
  };

  const handleRequestBrowserPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setBrowserPermission(perm);
        if (perm === 'granted') {
          notify('Browser push notification access granted!', 'success');
        } else {
          notify('Notification permission was not granted', 'info');
        }
      } catch {
        notify('Could not request notification permission', 'error');
      }
    } else {
      notify('Browser push notifications not supported in this environment', 'info');
    }
  };

  // Backup Data to JSON
  const handleBackupData = () => {
    const backupJson = storage.exportData();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `income_expense_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify('Data backup downloaded successfully', 'success');
  };

  // Trigger File Input for Restore
  const handleTriggerRestore = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Restore file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const success = storage.importData(content);
        if (success) {
          refreshData();
          notify('Ledger restored successfully from backup', 'success');
        } else {
          notify('Invalid backup file format', 'error');
        }
      } catch (err) {
        notify('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset All Data
  const handleResetData = () => {
    openDeleteConfirm(
      'Reset All Data?',
      'This will erase all recorded transactions, payments, and persons, resetting the ledger to initial sample defaults. Are you sure?',
      () => {
        storage.clearAll();
        storage.seedInitialData();
        refreshData();
        notify('All data reset to fresh default states', 'info');
      }
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {/* Top Header with Back button */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center space-x-2"
      >
        <motion.button
          whileHover={{ scale: 1.1, x: -2 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleBack}
          className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 transition-colors"
          title="Go Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Settings</h2>
          <p className="text-xs text-slate-400 dark:text-slate-400">Manage appearance, preferences, security & backups</p>
        </div>
      </motion.div>

      {/* Hidden File Input for Restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* 1. Theme & Appearance (Fully Functional Light & Dark Mode) */}
      <motion.div
        id="settings-theme-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-black rounded-3xl p-5 border border-slate-100 dark:border-neutral-800 shadow-xs space-y-4 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.15, rotate: isDark ? 20 : 45 }}
              transition={{ duration: 0.3 }}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs transition-colors ${
                isDark
                  ? 'bg-indigo-900/80 text-amber-300 border border-indigo-700/50'
                  : 'bg-amber-100 text-amber-600 border border-amber-200/60'
              }`}
            >
              {isDark ? <Moon className="w-5 h-5 fill-amber-300/30" /> : <Sun className="w-5 h-5" />}
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Appearance &amp; Theme
                </h4>
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wide ${
                    isDark
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-800/60'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {theme === 'system' ? 'System Sync' : isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">
                Choose light, dark, or automatic system appearance
              </p>
            </div>
          </div>

          {/* Quick 1-tap Toggle */}
          <motion.button
            id="theme-quick-toggle-btn"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              toggleDarkMode();
              if (autoNotifySound) playNotificationChime();
              notify(isDark ? 'Switched to Light mode' : 'Switched to Dark mode', 'info');
            }}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer relative ${
              isDark ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
            title="Toggle Light / Dark mode"
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs flex items-center justify-center ${
                isDark ? 'ml-auto' : 'ml-0'
              }`}
            >
              {isDark ? (
                <Moon className="w-3 h-3 text-indigo-600" />
              ) : (
                <Sun className="w-3 h-3 text-amber-500" />
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* 3-Mode Visual Selector: Light, Dark, System */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {/* Light Mode Button */}
          <motion.button
            type="button"
            id="theme-select-light"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTheme('light');
              if (autoNotifySound) playNotificationChime();
              notify('Light mode activated', 'success');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'light'
                ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  theme === 'light'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4" />
              </div>
              {theme === 'light' && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Light</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Crisp &amp; Clean</p>
            </div>
          </motion.button>

          {/* Dark Mode Button */}
          <motion.button
            type="button"
            id="theme-select-dark"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTheme('dark');
              if (autoNotifySound) playNotificationChime();
              notify('Dark mode activated', 'success');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'dark'
                ? 'bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/40 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" />
              </div>
              {theme === 'dark' && (
                <span className="w-4 h-4 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Dark</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Easy on eyes</p>
            </div>
          </motion.button>

          {/* System Default Button */}
          <motion.button
            type="button"
            id="theme-select-system"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              setTheme('system');
              if (autoNotifySound) playNotificationChime();
              notify('System theme sync activated', 'info');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'system'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 ring-2 ring-blue-500/40 shadow-xs'
                : 'bg-slate-50 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/70'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center ${
                  theme === 'system'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </div>
              {theme === 'system' && (
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">System</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Auto match OS</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* 2. Install Mobile App (APK / PWA) */}
      <motion.div
        id="settings-install-app-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.09 }}
        whileHover={{ y: -2 }}
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white rounded-3xl p-5 border border-blue-400/40 shadow-lg shadow-blue-900/20 space-y-3.5 transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner"
            >
              <Smartphone className="w-5 h-5 text-cyan-200" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Install Mobile App (APK)
                </h4>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 tracking-wide">
                  Android APK
                </span>
              </div>
              <p className="text-[10px] text-blue-100">
                Install as standalone app on your Android home screen
              </p>
            </div>
          </div>

          <motion.button
            id="settings-install-app-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInstallModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Install Now</span>
          </motion.button>
        </div>

        <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-blue-100 font-medium">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
            <span>Direct 1-Tap installation • Offline ready</span>
          </span>
          <button
            onClick={() => setShowInstallModal(true)}
            className="text-cyan-200 hover:text-white underline cursor-pointer font-bold"
          >
            Installation Guide
          </button>
        </div>
      </motion.div>

      {/* 3. Preferences & Security */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4 hover:shadow-md transition-all"
      >
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Preferences &amp; Security
        </h4>

        {/* Currency Selector */}
        <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-slate-700/60">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Primary Currency</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">Default for all financial transactions</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/70 p-1 rounded-xl">
            {(['INR', 'USD', 'EUR'] as const).map(c => (
              <motion.button
                key={c}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrency(c);
                  notify(`Currency set to ${c}`, 'info');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currency === c
                    ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {c === 'INR' ? '₹ INR' : c === 'USD' ? '$ USD' : '€ EUR'}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Biometric App Lock */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.15, rotate: 10 }}
              className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs"
            >
              <Fingerprint className="w-4 h-4" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Biometric App Lock</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Lock application when leaving or idle</p>
            </div>
          </div>
          <motion.button
            id="settings-lock-now"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={lockBiometric}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors"
          >
            Lock Now
          </motion.button>
        </div>
      </motion.div>

      {/* 3. Fully Automatic Smart Notifications Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs transition-colors ${
                autoNotifyEnabled ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-300'
              }`}
            >
              <BellRing className="w-4 h-4" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                  Automatic Notifications
                </h4>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 tracking-wide">
                  Smart Auto
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Intelligent alerts, dues &amp; daily ledger summaries</p>
            </div>
          </div>

          {/* Master Toggle */}
          <motion.button
            id="toggle-auto-notify-master"
            whileTap={{ scale: 0.92 }}
            onClick={() => toggleAutoNotifyMaster(!autoNotifyEnabled)}
            className={`w-12 h-6.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer relative ${
              autoNotifyEnabled ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
            title={autoNotifyEnabled ? 'Disable auto notifications' : 'Enable auto notifications'}
          >
            <motion.div
              layout
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className={`w-5.5 h-5.5 rounded-full bg-white shadow-xs ${
                autoNotifyEnabled ? 'ml-auto' : 'ml-0'
              }`}
            />
          </motion.button>
        </div>

        {autoNotifyEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 pt-1 border-t border-slate-50 dark:border-slate-700/60"
          >
            {/* Rule 1: Daily Summary Alert */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-blue-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Daily EOD Financial Summary</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400">Auto-summary of today's income, expenses &amp; cashflow</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoNotifyDailySummary}
                onChange={e => toggleAutoNotifyRule('daily', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Rule 2: High Expense Alert */}
            <div className="py-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100">High Expense Warning</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-400">Alert when single expense exceeds threshold</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoNotifyHighExpense}
                  onChange={e => toggleAutoNotifyRule('high_exp', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
                />
              </div>
              {autoNotifyHighExpense && (
                <div className="ml-5.5 flex items-center space-x-2">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Alert limit:</span>
                  <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-700/70 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-0.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">₹</span>
                    <input
                      type="number"
                      value={highExpenseThreshold}
                      onChange={e => {
                        const val = Math.max(100, Number(e.target.value) || 0);
                        setHighExpenseThreshold(val);
                        localStorage.setItem('app_auto_notify_threshold', String(val));
                      }}
                      className="w-20 text-xs font-bold text-slate-800 dark:text-slate-100 bg-transparent focus:outline-none"
                      min={100}
                      step={500}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Rule 3: Pending Balance & Recovery Reminder */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <User className="w-3.5 h-3.5 text-amber-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Pending Collection Reminder</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400">Auto-detect unpaid customer dues &amp; balances</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoNotifyPendingDues}
                onChange={e => toggleAutoNotifyRule('dues', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Rule 4: Employee Salary Payroll Cycle Alert */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Staff Salary Payout Alerts</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400">Automatic reminder when wages/salary are due</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoNotifySalary}
                onChange={e => toggleAutoNotifyRule('salary', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Rule 5: Audible Notification Sound Chime */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center space-x-2">
                {autoNotifySound ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Sound Chime Feedback</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400">Play pleasant audio chime on automatic alerts</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoNotifySound}
                onChange={e => toggleAutoNotifyRule('sound', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Test Automated Notification Action */}
            <div className="pt-2 flex items-center space-x-2">
              <motion.button
                id="btn-test-auto-notification"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleTestAutoNotification}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center space-x-1.5 border border-blue-200 dark:border-blue-800 transition-colors shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Test Automatic Notification Now</span>
              </motion.button>

              {browserPermission !== 'granted' && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleRequestBrowserPermission}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[11px] font-bold transition-colors"
                  title="Enable browser system push notifications"
                >
                  Push Access
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* 4. Data Management (Backup, Restore, Reset) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-3 hover:shadow-md transition-all"
      >
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Data Management
        </h4>

        {/* Recycle Bin (15-day retention) */}
        <motion.div
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView('recycle_bin')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Recycle Bin</p>
                {recycleBinCount > 0 ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50">
                    {recycleBinCount} items
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                    Empty
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Restore or permanently delete • Auto-purged in 15 days</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500" />
        </motion.div>

        {/* Backup */}
        <motion.div
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBackupData}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 10 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs"
            >
              <Download className="w-4 h-4" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Backup Data (JSON)</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Download complete ledger history to device</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500" />
        </motion.div>

        {/* Restore */}
        <motion.div
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleTriggerRestore}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 border border-slate-100 dark:border-slate-700 cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.2, rotate: -10 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center shadow-xs"
            >
              <Upload className="w-4 h-4" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Restore Data</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-400">Import records from backup JSON</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500" />
        </motion.div>

        {/* Reset All Data */}
        <motion.div
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleResetData}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-900/40 border border-rose-100 dark:border-rose-900/50 cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.div>
            <div>
              <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Reset All Data</p>
              <p className="text-[10px] text-rose-400 dark:text-rose-400">Clear all records and restore initial state</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300 dark:text-rose-500" />
        </motion.div>
      </motion.div>

      {/* 5. About App & Logout */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700/80 shadow-xs space-y-4 hover:shadow-md transition-all"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.div whileHover={{ rotate: 20 }}>
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </motion.div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">About App</span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">v2.4.0 (Pro)</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">
          Income &amp; Expense Tracker is a modern financial-management solution designed for
          professionals, freelancers, and businesses to track balances, customers, and daily cashflow.
        </p>

        <motion.button
          id="settings-logout-btn"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={logout}
          className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
        >
          <motion.div
            whileHover={{ x: -2 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <LogOut className="w-4 h-4" />
          </motion.div>
          <span>Logout of Account</span>
        </motion.button>
      </motion.div>

      {/* Install App Modal */}
      <InstallAppModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />
    </div>
  );
};
