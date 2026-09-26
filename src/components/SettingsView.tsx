import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Edit3,
  ShieldCheck,
  Copy,
  Share2,
  Building,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';
import { InstallAppModal } from './InstallAppModal';

export const SettingsView: React.FC = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);
  const {
    user,
    updateUserProfile,
    firebaseUser,
    signInWithGooglePopup,
    syncWithCloud,
    isCloudSyncing,
    logout,
    currency,
    setCurrency,
    isBiometricLocked,
    lockBiometric,
    notify,
    openDeleteConfirm,
    refreshData,
    resetAllDataPermanently,
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

  // Profile Card States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || 'Rajat Sharma');
  const [profileBusiness, setProfileBusiness] = useState(user?.businessName || 'Apex Infotech & Consulting');
  const [profileRole, setProfileRole] = useState(user?.role || 'Business Owner / Proprietor');
  const [profilePhone, setProfilePhone] = useState(user?.phone || user?.mobile || '+91 98765 43210');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'Rajat807768@gmail.com');
  const [profileAddress, setProfileAddress] = useState(user?.address || 'Sector 62, Noida, Uttar Pradesh');
  const [avatarTheme, setAvatarTheme] = useState<'blue' | 'purple' | 'emerald' | 'amber' | 'rose'>(() => {
    return (localStorage.getItem('app_avatar_theme') as any) || 'blue';
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileBusiness(user.businessName || '');
      setProfileRole(user.role || '');
      setProfilePhone(user.phone || user.mobile || '');
      setProfileEmail(user.email || '');
      setProfileAddress(user.address || '');
    }
  }, [user]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profileName.trim()) {
      notify('Name cannot be empty', 'error');
      return;
    }
    setIsSavingProfile(true);
    try {
      await updateUserProfile({
        name: profileName.trim(),
        businessName: profileBusiness.trim(),
        role: profileRole.trim(),
        phone: profilePhone.trim(),
        mobile: profilePhone.trim(),
        email: profileEmail.trim(),
        address: profileAddress.trim(),
      });
      setIsEditingProfile(false);
      notify('Profile updated successfully!', 'success');
    } catch {
      notify('Failed to save profile', 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleCopyProfileCard = () => {
    const text = `👤 ${user?.name || profileName}\n🏢 ${user?.businessName || profileBusiness}\n💼 ${user?.role || profileRole}\n📞 ${user?.phone || user?.mobile || profilePhone}\n✉️ ${user?.email || profileEmail}\n📍 ${user?.address || profileAddress}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    notify('Profile card details copied to clipboard!', 'info');
    setTimeout(() => setIsCopied(false), 2500);
  };

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

  // Reset All Data Permanently
  const handleResetData = () => {
    openDeleteConfirm(
      'Permanently Delete All Data?',
      'Are you sure you want to permanently delete ALL data? All persons, transactions, income records, expenses, payments, and recycle bin items will be completely erased forever. This action cannot be undone.',
      async () => {
        await resetAllDataPermanently();
        notify('All records deleted permanently', 'success');
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

      {/* 0. User Profile Card (Interactive & Fully Functional) */}
      <motion.div
        id="settings-user-profile-card"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        whileHover={{ y: -2 }}
        className="bg-white dark:bg-black rounded-3xl p-5 border border-slate-100 dark:border-neutral-800 shadow-xs space-y-4 hover:shadow-md transition-all relative overflow-hidden"
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Profile Card Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            {/* Animated Avatar with Dynamic Gradient & Online Pulse */}
            <div className="relative">
              <motion.div
                whileHover={{ scale: 1.1, rotate: [0, -6, 6, 0] }}
                transition={{ duration: 0.3 }}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md border-2 border-white dark:border-neutral-800 ${
                  avatarTheme === 'purple'
                    ? 'bg-gradient-to-tr from-purple-700 via-indigo-700 to-purple-500'
                    : avatarTheme === 'emerald'
                    ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-400'
                    : avatarTheme === 'amber'
                    ? 'bg-gradient-to-tr from-amber-600 via-orange-600 to-yellow-500'
                    : avatarTheme === 'rose'
                    ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-red-500'
                    : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500'
                }`}
              >
                {(user?.name || profileName || 'RS').substring(0, 2).toUpperCase()}
              </motion.div>
              {/* Online / Active status pulse */}
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-black" />
              </span>
            </div>

            {/* Profile Info Details */}
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black text-slate-800 dark:text-slate-100 tracking-tight truncate">
                  {user?.name || profileName || 'Rajat Sharma'}
                </h3>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center space-x-1 shrink-0">
                  <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Pro</span>
                </span>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">{user?.businessName || profileBusiness || 'Apex Infotech & Consulting'}</span>
              </div>

              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 flex items-center space-x-1">
                <span className="font-medium">{user?.role || profileRole || 'Business Owner / Proprietor'}</span>
              </p>
            </div>
          </div>

          {/* Quick Action: Toggle Edit Profile */}
          <motion.button
            id="profile-toggle-edit-btn"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className={`p-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs ${
              isEditingProfile
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60'
            }`}
            title={isEditingProfile ? 'Cancel editing' : 'Edit profile'}
          >
            {isEditingProfile ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cancel</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </>
            )}
          </motion.button>
        </div>

        {/* Quick Contact & Details Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800">
            <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
              {user?.email || profileEmail || 'Rajat807768@gmail.com'}
            </span>
          </div>

          <div className="flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800">
            <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
              {user?.phone || user?.mobile || profilePhone || '+91 98765 43210'}
            </span>
          </div>

          {(user?.address || profileAddress) && (
            <div className="col-span-1 sm:col-span-2 flex items-center space-x-2 p-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-100 dark:border-neutral-800">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
                {user?.address || profileAddress}
              </span>
            </div>
          )}
        </div>

        {/* Ledger Statistics Summary Ribbon */}
        <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/70 to-blue-50/70 dark:from-neutral-950 dark:via-neutral-950 dark:to-neutral-950 border border-blue-100/80 dark:border-neutral-800 text-center">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contacts</p>
            <p className="text-sm font-black text-blue-700 dark:text-blue-400 mt-0.5">{persons.length}</p>
          </div>
          <div className="border-x border-blue-200/50 dark:border-neutral-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Records</p>
            <p className="text-sm font-black text-indigo-700 dark:text-indigo-400 mt-0.5">
              {income.length + expenses.length + payments.length}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Currency</p>
            <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{currency}</p>
          </div>
        </div>

        {/* Action Buttons Toolbar: Copy Info, Avatar Themes, Cloud Connect */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-neutral-800">
          {/* Avatar Color Palette */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
              <Palette className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">Theme:</span>
            </span>
            {(['blue', 'purple', 'emerald', 'amber', 'rose'] as const).map(color => (
              <motion.button
                key={color}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setAvatarTheme(color);
                  localStorage.setItem('app_avatar_theme', color);
                  notify(`Avatar theme updated to ${color}`, 'info');
                }}
                className={`w-4.5 h-4.5 rounded-full transition-all cursor-pointer ${
                  color === 'blue'
                    ? 'bg-blue-600'
                    : color === 'purple'
                    ? 'bg-purple-600'
                    : color === 'emerald'
                    ? 'bg-emerald-600'
                    : color === 'amber'
                    ? 'bg-amber-500'
                    : 'bg-rose-600'
                } ${avatarTheme === color ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-black scale-110' : 'opacity-70 hover:opacity-100'}`}
                title={`Set ${color} avatar theme`}
              />
            ))}
          </div>

          <div className="flex items-center space-x-2">
            {/* Copy Info Button */}
            <motion.button
              id="profile-copy-info-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopyProfileCard}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-200/80 dark:border-neutral-800 cursor-pointer"
              title="Copy complete profile & business info"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy Info</span>
                </>
              )}
            </motion.button>

            {/* Cloud Sync / Connect Google Button */}
            <motion.button
              id="profile-cloud-sync-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (firebaseUser) {
                  await syncWithCloud();
                } else {
                  await signInWithGooglePopup();
                }
              }}
              disabled={isCloudSyncing}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-2xs ${
                firebaseUser
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/30'
              }`}
              title={firebaseUser ? 'Sync with Firebase Cloud' : 'Connect Google account'}
            >
              {isCloudSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : firebaseUser ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Cloud Active</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Google Sync</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Animated Edit Profile Inline Form Drawer */}
        <AnimatePresence>
          {isEditingProfile && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              onSubmit={handleSaveProfile}
              className="overflow-hidden pt-3 border-t border-slate-100 dark:border-neutral-800 space-y-3"
            >
              <div className="flex items-center justify-between pb-1">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Profile Details</span>
                </span>
                <span className="text-[10px] text-slate-400">All fields fully saved</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Your Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    placeholder="e.g. Rajat Sharma"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                {/* Business / Enterprise Name */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Business / Enterprise Name
                  </label>
                  <input
                    type="text"
                    value={profileBusiness}
                    onChange={e => setProfileBusiness(e.target.value)}
                    placeholder="e.g. Apex Infotech & Consulting"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                {/* Role / Designation */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Designation / Profession
                  </label>
                  <input
                    type="text"
                    value={profileRole}
                    onChange={e => setProfileRole(e.target.value)}
                    placeholder="e.g. Business Owner / Proprietor"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                {/* Phone / Mobile */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="text"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    placeholder="e.g. user@example.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>

                {/* Address / Location */}
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Office / City Address
                  </label>
                  <input
                    type="text"
                    value={profileAddress}
                    onChange={e => setProfileAddress(e.target.value)}
                    placeholder="e.g. Sector 62, Noida, UP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-black focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-neutral-800 hover:bg-slate-100 dark:hover:bg-neutral-900 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>

                <motion.button
                  id="profile-save-btn"
                  type="submit"
                  disabled={isSavingProfile}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-blue-900/30 transition-all border border-blue-400/40 cursor-pointer"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

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
        className="bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 dark:from-black dark:via-black dark:to-black dark:bg-black text-white rounded-3xl p-5 border border-blue-400/40 dark:border-neutral-800 shadow-lg shadow-blue-900/20 dark:shadow-none space-y-3.5 transition-all"
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
        className="bg-white dark:bg-black rounded-3xl p-5 border border-slate-100 dark:border-neutral-800 shadow-xs space-y-4 hover:shadow-md transition-all"
      >
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Preferences &amp; Security
        </h4>

        {/* Currency Selector */}
        <div className="flex items-center justify-between py-1 border-b border-slate-50 dark:border-neutral-800">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Primary Currency</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-400">Default for all financial transactions</p>
          </div>
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl border dark:border-neutral-800">
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
                    ? 'bg-white dark:bg-black text-blue-700 dark:text-blue-400 shadow-xs'
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
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-900 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors border dark:border-neutral-800"
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
        className="bg-white dark:bg-black rounded-3xl p-5 border border-slate-100 dark:border-neutral-800 shadow-xs space-y-4 hover:shadow-md transition-all"
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
        className="bg-white dark:bg-black rounded-3xl p-5 border border-slate-100 dark:border-neutral-800 shadow-xs space-y-3 hover:shadow-md transition-all"
      >
        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          Data Management
        </h4>

        {/* Recycle Bin (15-day retention) */}
        <motion.div
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCurrentView('recycle_bin')}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-neutral-950 hover:bg-rose-50/50 dark:hover:bg-neutral-900 border border-slate-100 dark:border-neutral-800 cursor-pointer transition-all"
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
                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-neutral-900 text-slate-500 dark:text-slate-400">
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
          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-neutral-950 hover:bg-blue-50/50 dark:hover:bg-neutral-900 border border-slate-100 dark:border-neutral-800 cursor-pointer transition-all"
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
          className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-neutral-950 hover:bg-blue-50/50 dark:hover:bg-neutral-900 border border-slate-100 dark:border-neutral-800 cursor-pointer transition-all"
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

        {/* Reset & Delete All Data Permanently */}
        <motion.div
          id="settings-reset-all-data-btn"
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleResetData}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-rose-50/60 dark:bg-neutral-950 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 border border-rose-100 dark:border-neutral-800 cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-2.5">
            <motion.div
              whileHover={{ scale: 1.2, rotate: 180 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
            </motion.div>
            <div>
              <div className="flex items-center space-x-1.5">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-300">Reset &amp; Delete All Data</p>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-rose-200/80 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                  Permanent
                </span>
              </div>
              <p className="text-[10px] text-rose-400 dark:text-rose-400">Permanently delete all persons, transactions &amp; ledgers</p>
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
        className="bg-white dark:bg-black rounded-3xl p-5 border border-slate-100 dark:border-neutral-800 shadow-xs space-y-4 hover:shadow-md transition-all"
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
