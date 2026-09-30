import React, { createContext, useContext, useEffect, useMemo, useState, useCallback, useRef } from 'react';
import {
  ActiveTab,
  DashboardTotals,
  ExpenseRecord,
  IncomeRecord,
  PaymentDirection,
  PaymentRecord,
  Person,
  PersonCalculations,
  PersonDeleteBlockedState,
  PersonStatus,
  QuickActionModal,
  RecycleBinItem,
  Transaction,
  TransactionType,
  PaymentMethod,
  UserProfile,
  AppTheme,
} from '../types';
import { calculateDashboardTotals, calculatePersonSummary } from '../services/calculations';
import {
  buildTransactionsList,
  INITIAL_EXPENSES,
  INITIAL_INCOME,
  INITIAL_PAYMENTS,
  INITIAL_PERSONS,
  INITIAL_RECYCLE_BIN,
  INITIAL_USER,
  LocalStorageManager,
} from '../services/storage';
import {
  auth,
  signInWithGoogle,
  signInAsGuest,
  logOutFirebase,
  FirestoreSync,
} from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'income' | 'expense' | 'payment' | 'alert';
}

interface DeleteConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface AppContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isBiometricLocked: boolean;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentView: string; // supports 'dashboard' | 'daily' | 'persons' | 'payments' | 'reports' | 'transactions' | 'search' | 'settings'
  setCurrentView: (view: string) => void;
  goBack: () => void;
  viewHistory: string[];

  // Modals & Sub-pages
  activeModal: QuickActionModal;
  openQuickAction: (action: QuickActionModal) => void;
  closeQuickAction: () => void;
  selectedPersonForProfile: Person | null;
  setSelectedPersonForProfile: (person: Person | null) => void;
  editItem: { type: 'person' | 'income' | 'expense' | 'payment'; data: any } | null;
  setEditItem: (item: { type: 'person' | 'income' | 'expense' | 'payment'; data: any } | null) => void;
  startEditItem: (item: { type: 'person' | 'income' | 'expense' | 'payment'; data: any }) => void;

  // Confirm dialog
  deleteConfirm: DeleteConfirmState | null;
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeDeleteConfirm: () => void;

  // Person Delete Blocked Error Dialog
  personDeleteBlocked: PersonDeleteBlockedState;
  showPersonDeleteBlocked: (person: Person, summary: PersonCalculations) => void;
  closePersonDeleteBlocked: () => void;
  startSettlePaymentForPerson: (person: Person, summary: PersonCalculations) => void;
  openPaymentForPerson: (person: Person, direction: PaymentDirection, defaultAmount?: number, defaultNote?: string) => void;

  // Selected date & month states
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  selectedDailyDate: string;
  setSelectedDailyDate: (date: string) => void;

  // Data
  persons: Person[];
  income: IncomeRecord[];
  expenses: ExpenseRecord[];
  payments: PaymentRecord[];
  transactions: Transaction[];
  totals: DashboardTotals;

  // CRUD
  savePerson: (personData: Omit<Person, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  deletePerson: (id: string) => void;
  updatePersonLeave: (id: string, leaveDays: number, status?: PersonStatus, startDate?: string, endDate?: string, leaveDates?: string[]) => void;
  updatePersonClosed: (id: string, isClosed: boolean, closedDate?: string, closedReason?: string) => void;
  updatePersonGradientTheme: (id: string, gradientTheme: string) => void;

  saveIncome: (incomeData: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  deleteIncome: (id: string) => void;

  saveExpense: (expenseData: Omit<ExpenseRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  deleteExpense: (id: string) => void;

  savePayment: (paymentData: Omit<PaymentRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => void;
  deletePayment: (id: string) => void;

  // Recycle Bin (15-Day Auto-Purge)
  recycleBin: RecycleBinItem[];
  recycleBinCount: number;
  restoreFromRecycleBin: (id: string) => void;
  deletePermanently: (id: string) => void;
  emptyRecycleBin: () => void;

  // Auth & System
  login: (email: string, pass: string, name?: string) => void;
  register: (name: string, email: string, pass: string, mobile?: string) => void;
  logout: () => void;
  unlockBiometric: () => void;
  lockBiometric: () => void;
  toggleBiometric: (enabled: boolean) => void;
  resetToSampleData: () => void;
  resetAllDataPermanently: () => Promise<void>;
  refreshData: () => void;
  currency: string;
  setCurrency: (currency: string) => void;
  updateUserProfile: (profileData: Partial<UserProfile>, silent?: boolean) => Promise<void> | void;
  transactionFilter: TransactionType | 'All';
  setTransactionFilter: (filter: TransactionType | 'All') => void;
  openTransactionsWithType: (type: TransactionType | 'All') => void;
  paymentMethodFilter: PaymentMethod | 'All';
  setPaymentMethodFilter: (filter: PaymentMethod | 'All') => void;
  openTransactionsWithPaymentMethod: (method: PaymentMethod | 'All') => void;

  // Appearance & Theme (Light / Dark / System)
  theme: AppTheme;
  isDark: boolean;
  setTheme: (theme: AppTheme) => void;
  toggleDarkMode: () => void;

  // Notifications & Toasts
  notifications: AppNotification[];
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  notify: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: (id: string) => void;

  // Firebase sync status & Cloud Database
  firebaseUser: FirebaseUser | null;
  isCloudSyncing: boolean;
  signInWithGooglePopup: () => Promise<void>;
  signInAsGuestUser: () => Promise<void>;
  logoutFirebaseUser: () => Promise<void>;
  syncWithCloud: () => Promise<void>;
  downloadFromCloud: () => Promise<void>;
  firebaseStatus: {
    isOnline: boolean;
    lastSync: string;
    syncQueueCount: number;
    syncNow: () => void;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => LocalStorageManager.getUser());
  const [isBiometricLocked, setIsBiometricLocked] = useState<boolean>(() => {
    const savedUser = LocalStorageManager.getUser();
    return savedUser?.biometricEnabled ? LocalStorageManager.isBiometricLocked() : false;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [currentView, setCurrentViewState] = useState<string>('dashboard');
  const [viewHistory, setViewHistory] = useState<string[]>(['dashboard']);
  const [activeModal, setActiveModal] = useState<QuickActionModal>(null);
  const [selectedPersonForProfile, setSelectedPersonForProfileState] = useState<Person | null>(null);
  const [editItem, setEditItem] = useState<{ type: 'person' | 'income' | 'expense' | 'payment'; data: any } | null>(null);
  const [deleteConfirm, setDeleteConfirmState] = useState<DeleteConfirmState | null>(null);
  const [personDeleteBlocked, setPersonDeleteBlockedState] = useState<PersonDeleteBlockedState>({
    isOpen: false,
    person: null,
    summary: null,
  });

  // Synchronous refs to prevent stale closure in history and event listeners
  const currentViewRef = useRef<string>('dashboard');
  const viewHistoryRef = useRef<string[]>(['dashboard']);
  const activeModalRef = useRef<QuickActionModal>(null);
  const selectedPersonRef = useRef<Person | null>(null);
  const deleteConfirmRef = useRef<DeleteConfirmState | null>(null);
  const personDeleteBlockedRef = useRef<PersonDeleteBlockedState>(personDeleteBlocked);
  const lastBackPressRef = useRef<number>(0);
  const isHandlingBackRef = useRef<boolean>(false);

  // Default month: Current YYYY-MM
  const currentMonthStr = useMemo(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Default daily date: Today
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDailyDate, setSelectedDailyDate] = useState<string>(todayStr);

  // Collections
  const [persons, setPersons] = useState<Person[]>(() => LocalStorageManager.getPersons());
  const [income, setIncome] = useState<IncomeRecord[]>(() => LocalStorageManager.getIncome());
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => LocalStorageManager.getExpenses());
  const [payments, setPayments] = useState<PaymentRecord[]>(() => LocalStorageManager.getPayments());
  const [recycleBin, setRecycleBin] = useState<RecycleBinItem[]>(() => LocalStorageManager.getRecycleBin());
  const [transactionFilter, setTransactionFilter] = useState<TransactionType | 'All'>('All');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | 'All'>('All');

  // Fully functional Light and Dark Mode system
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('app_theme') as AppTheme;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {}
    return 'light';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Listen to system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setSystemPrefersDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const isDark = theme === 'dark' || (theme === 'system' && systemPrefersDark);

  // Sync dark class and data-theme to HTML root
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
  }, [isDark]);

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('app_theme', newTheme);
    } catch {}
  }, []);

  const toggleDarkMode = useCallback(() => {
    setThemeState(prev => {
      const currentlyDark = prev === 'dark' || (prev === 'system' && systemPrefersDark);
      const next: AppTheme = currentlyDark ? 'light' : 'dark';
      try {
        localStorage.setItem('app_theme', next);
      } catch {}
      return next;
    });
  }, [systemPrefersDark]);

  // Toasts & Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>(() => LocalStorageManager.getLastSync());
  const [isOnline, setIsOnline] = useState<boolean>(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(() => auth.currentUser);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          // Fetch cloud profile if exists and sync to local state
          const cloudProfile = await FirestoreSync.fetchUserProfile(fbUser.uid);
          if (cloudProfile) {
            setUser(prev => {
              const merged: UserProfile = {
                ...(prev || INITIAL_USER),
                ...cloudProfile,
                uid: fbUser.uid,
              };
              LocalStorageManager.setUser(merged);
              return merged;
            });
          }

          const cloudData = await FirestoreSync.fetchAllFromCloud();
          if (cloudData && (cloudData.persons.length > 0 || cloudData.income.length > 0 || cloudData.expenses.length > 0)) {
            setPersons(cloudData.persons);
            setIncome(cloudData.income);
            setExpenses(cloudData.expenses);
            setPayments(cloudData.payments);
            setRecycleBin(cloudData.recycleBin);
            LocalStorageManager.setPersons(cloudData.persons);
            LocalStorageManager.setIncome(cloudData.income);
            LocalStorageManager.setExpenses(cloudData.expenses);
            LocalStorageManager.setPayments(cloudData.payments);
            LocalStorageManager.setRecycleBin(cloudData.recycleBin);
            showToast('Firebase Cloud records synchronized', 'success');
          }
        } catch (err) {
          console.warn('Auto cloud sync notice:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen for online/offline events and cross-tab storage sync
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Network restored - live sync active', 'info');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Working offline - changes saved locally', 'info');
    };
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('income_expense_tracker_')) {
        refreshData();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const notifications: AppNotification[] = useMemo(() => [
    {
      id: 'notif_1',
      title: 'Payment Received',
      message: '₹25,000 received from Amit Verma via UPI',
      time: 'Today, 12:00 PM',
      type: 'payment',
    },
    {
      id: 'notif_2',
      title: 'Expense Alert',
      message: 'Server hosting expense ₹6,800 logged',
      time: 'Today, 09:15 AM',
      type: 'expense',
    },
    {
      id: 'notif_3',
      title: 'Monthly Balance Positive',
      message: 'Your total income exceeds expenses by 38%',
      time: 'Yesterday',
      type: 'alert',
    },
  ], []);

  // Compute unified transactions list
  const transactions = useMemo(() => {
    return buildTransactionsList(income, expenses, payments);
  }, [income, expenses, payments]);

  // Compute live dashboard totals
  const totals = useMemo(() => {
    return calculateDashboardTotals(income, expenses, payments, persons, selectedMonth);
  }, [income, expenses, payments, persons, selectedMonth]);

  // Toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Keep localStorage updated on every state change
  useEffect(() => {
    LocalStorageManager.setPersons(persons);
  }, [persons]);

  useEffect(() => {
    LocalStorageManager.setIncome(income);
  }, [income]);

  useEffect(() => {
    LocalStorageManager.setExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    LocalStorageManager.setPayments(payments);
  }, [payments]);

  useEffect(() => {
    LocalStorageManager.setRecycleBin(recycleBin);
  }, [recycleBin]);

  // Automatic 15-day purge check (runs on mount and every 60s)
  useEffect(() => {
    const purgeExpiredRecycleBin = () => {
      const now = Date.now();
      setRecycleBin(prev => {
        const active = prev.filter(item => new Date(item.expiresAt).getTime() > now);
        if (active.length !== prev.length) {
          LocalStorageManager.setRecycleBin(active);
        }
        return active;
      });
    };

    purgeExpiredRecycleBin();
    const timer = setInterval(purgeExpiredRecycleBin, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    LocalStorageManager.setUser(user);
  }, [user]);

  // Set current view with history tracking
  const setCurrentView = useCallback((newView: string, pushHistory = true) => {
    if (!newView || newView === currentViewRef.current) return;

    currentViewRef.current = newView;
    setCurrentViewState(newView);
    setActiveTab(newView as ActiveTab);

    if (newView === 'dashboard') {
      viewHistoryRef.current = ['dashboard'];
      setViewHistory(['dashboard']);
    } else if (pushHistory) {
      viewHistoryRef.current = [...viewHistoryRef.current, newView];
      setViewHistory(viewHistoryRef.current);
    }

    if (pushHistory) {
      try {
        window.history.pushState({ type: 'view', view: newView, timestamp: Date.now() }, '');
      } catch {}
    }
  }, []);

  // Sync tab with currentView when tab clicked
  const handleSetActiveTab = useCallback((tab: ActiveTab) => {
    setCurrentView(tab);
    setSelectedPersonForProfileState(null);
    selectedPersonRef.current = null;
  }, [setCurrentView]);

  // Navigate to transactions view with pre-set filter type (Income, Expense, Payment, or All)
  const openTransactionsWithType = useCallback((type: TransactionType | 'All') => {
    setTransactionFilter(type);
    setCurrentView('transactions');
  }, [setCurrentView]);

  // Navigate to transactions view with pre-set payment method filter (UPI, Cash, Bank, School, Salary, Other)
  const openTransactionsWithPaymentMethod = useCallback((method: PaymentMethod | 'All') => {
    setPaymentMethodFilter(method);
    setTransactionFilter('All');
    setCurrentView('transactions');
  }, [setCurrentView]);

  const openQuickAction = useCallback((action: QuickActionModal, clearEdit = true) => {
    if (clearEdit) {
      setEditItem(null);
    }
    setActiveModal(action);
    activeModalRef.current = action;
    try {
      window.history.pushState({ type: 'modal', modal: action, timestamp: Date.now() }, '');
    } catch {}
  }, []);

  const closeQuickAction = useCallback(() => {
    setActiveModal(null);
    activeModalRef.current = null;
    setEditItem(null);
  }, []);

  const startEditItem = useCallback((item: { type: 'person' | 'income' | 'expense' | 'payment'; data: any }) => {
    setEditItem(item);
    // Dismiss profile modal if open so edit form gets full foreground
    if (selectedPersonRef.current) {
      setSelectedPersonForProfileState(null);
      selectedPersonRef.current = null;
    }
    const modalTypeMap: Record<string, QuickActionModal> = {
      person: 'add_person',
      income: 'add_income',
      expense: 'add_expense',
      payment: 'add_payment',
    };
    const targetModal = modalTypeMap[item.type];
    if (targetModal) {
      setActiveModal(targetModal);
      activeModalRef.current = targetModal;
      try {
        window.history.pushState({ type: 'modal', modal: targetModal, timestamp: Date.now() }, '');
      } catch {}
    }
  }, []);

  const setSelectedPersonForProfile = useCallback((person: Person | null) => {
    setSelectedPersonForProfileState(person);
    selectedPersonRef.current = person;
    if (person) {
      try {
        window.history.pushState({ type: 'profile', personId: person.id, timestamp: Date.now() }, '');
      } catch {}
    }
  }, []);

  const openDeleteConfirm = useCallback((title: string, message: string, onConfirm: () => void) => {
    const state: DeleteConfirmState = {
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setDeleteConfirmState(null);
        deleteConfirmRef.current = null;
      },
    };
    setDeleteConfirmState(state);
    deleteConfirmRef.current = state;
    try {
      window.history.pushState({ type: 'confirm', timestamp: Date.now() }, '');
    } catch {}
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setDeleteConfirmState(null);
    deleteConfirmRef.current = null;
  }, []);

  const showPersonDeleteBlocked = useCallback((person: Person, summary: PersonCalculations) => {
    const state = { isOpen: true, person, summary };
    setPersonDeleteBlockedState(state);
    personDeleteBlockedRef.current = state;
    try {
      window.history.pushState({ type: 'person_blocked', timestamp: Date.now() }, '');
    } catch {}
  }, []);

  const closePersonDeleteBlocked = useCallback(() => {
    const state = { isOpen: false, person: null, summary: null };
    setPersonDeleteBlockedState(state);
    personDeleteBlockedRef.current = state;
  }, []);

  const startSettlePaymentForPerson = useCallback((person: Person, summary: PersonCalculations) => {
    closePersonDeleteBlocked();
    if (selectedPersonRef.current) {
      setSelectedPersonForProfileState(null);
      selectedPersonRef.current = null;
    }
    openQuickAction('add_payment');
    setEditItem({
      type: 'payment',
      data: {
        id: '',
        userId: user?.uid || 'user_default',
        personId: person.id,
        personName: person.name,
        amount: summary.pendingAmount > 0 ? summary.pendingAmount : '',
        date: new Date().toISOString().split('T')[0],
        type: summary.status === 'to_receive' ? 'Received' : 'Paid',
        paymentMethod: 'Cash',
        note: `Settlement payment for ${person.name} (${summary.status === 'to_receive' ? 'To Receive' : 'To Pay'})`,
        createdAt: '',
        updatedAt: '',
      } as any,
    });
  }, [closePersonDeleteBlocked, openQuickAction, user?.uid]);

  const openPaymentForPerson = useCallback((
    person: Person,
    direction: PaymentDirection,
    defaultAmount?: number,
    defaultNote?: string
  ) => {
    closePersonDeleteBlocked();
    openQuickAction('add_payment');
    setEditItem({
      type: 'payment',
      data: {
        id: '', // Blank ID marks this as new payment with pre-filled person details
        userId: user?.uid || 'user_default',
        personId: person.id,
        personName: person.name,
        amount: defaultAmount && defaultAmount > 0 ? defaultAmount : '',
        date: new Date().toISOString().split('T')[0],
        type: direction,
        paymentMethod: 'UPI',
        note: defaultNote || '',
        createdAt: '',
        updatedAt: '',
      } as any,
    });
  }, [closePersonDeleteBlocked, openQuickAction, user?.uid]);

  // Step-by-step back navigation algorithm (closes modals, then steps back views, then guards app exit)
  const goBackInternal = useCallback((isFromPopState = false): boolean => {
    // 0. If Person Delete Blocked Dialog is open, close it first
    if (personDeleteBlockedRef.current?.isOpen) {
      closePersonDeleteBlocked();
      return true;
    }

    // 1. If Delete Confirmation dialog is open, close it first
    if (deleteConfirmRef.current?.isOpen) {
      setDeleteConfirmState(null);
      deleteConfirmRef.current = null;
      return true;
    }

    // 2. If Person Profile modal is open, close it
    if (selectedPersonRef.current) {
      setSelectedPersonForProfileState(null);
      selectedPersonRef.current = null;
      return true;
    }

    // 3. If Quick Action modal is open, close it
    if (activeModalRef.current) {
      setActiveModal(null);
      activeModalRef.current = null;
      setEditItem(null);
      return true;
    }

    // 4. If user is in a sub-view (Daily, Persons, Payments, Reports, Transactions, Search, Settings)
    if (currentViewRef.current !== 'dashboard' || viewHistoryRef.current.length > 1) {
      const history = [...viewHistoryRef.current];
      history.pop(); // remove current view
      const previousView = history.length > 0 ? history[history.length - 1] : 'dashboard';

      viewHistoryRef.current = history.length > 0 ? history : ['dashboard'];
      setViewHistory(viewHistoryRef.current);

      currentViewRef.current = previousView;
      setCurrentViewState(previousView);
      setActiveTab(previousView as ActiveTab);
      return true;
    }

    // 5. User is on Root Dashboard! Prevent accidental exit
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      showToast('Exiting application...', 'info');
      return false;
    } else {
      lastBackPressRef.current = now;
      showToast('Press back again to exit', 'info');
      if (isFromPopState) {
        try {
          window.history.pushState({ type: 'view', view: 'dashboard', root: true }, '');
        } catch {}
      }
      return true;
    }
  }, [showToast]);

  const goBack = useCallback(() => {
    isHandlingBackRef.current = true;
    const handled = goBackInternal(false);
    try {
      if (handled && window.history.length > 1) {
        window.history.back();
      }
    } catch {}
    setTimeout(() => {
      isHandlingBackRef.current = false;
    }, 120);
  }, [goBackInternal]);

  // Global browser popstate and Escape key listeners
  useEffect(() => {
    try {
      window.history.replaceState({ type: 'view', view: 'dashboard', root: true }, '');
    } catch {}

    const handlePopState = () => {
      if (isHandlingBackRef.current) {
        isHandlingBackRef.current = false;
        return;
      }
      goBackInternal(true);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        goBack();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goBackInternal, goBack]);

  // Person CRUD
  const savePerson = (personData: Omit<Person, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = new Date().toISOString();
    if (id) {
      setPersons(prev =>
        prev.map(p => (p.id === id ? { ...p, ...personData, updatedAt: now } : p))
      );
      if (selectedPersonForProfile?.id === id) {
        setSelectedPersonForProfileState(prev => prev ? { ...prev, ...personData, updatedAt: now } : null);
      }
      // Also update personName in cached income, expenses, payments
      setIncome(prev => prev.map(i => i.personId === id ? { ...i, personName: personData.name } : i));
      setExpenses(prev => prev.map(e => e.personId === id ? { ...e, personName: personData.name } : e));
      setPayments(prev => prev.map(p => p.personId === id ? { ...p, personName: personData.name } : p));
      showToast(`Updated person "${personData.name}"`);
    } else {
      const newPerson: Person = {
        id: 'per_' + Date.now(),
        userId: user?.uid || 'user_default',
        ...personData,
        createdAt: now,
        updatedAt: now,
      };
      setPersons(prev => [newPerson, ...prev]);
      showToast(`Added person "${personData.name}"`);
    }
    closeQuickAction();
  };

  const updatePersonLeave = (
    id: string,
    leaveDays: number,
    status?: PersonStatus,
    startDate?: string,
    endDate?: string,
    leaveDates?: string[]
  ) => {
    const now = new Date().toISOString();
    const effectiveStatus: PersonStatus = status || (leaveDays > 0 ? 'On Leave' : 'Active');
    setPersons(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated: Person = {
            ...p,
            leaveDays: Math.max(0, leaveDays),
            status: effectiveStatus,
            leaveStartDate: startDate || (leaveDays > 0 ? p.leaveStartDate : undefined),
            leaveEndDate: endDate || (leaveDays > 0 ? p.leaveEndDate : undefined),
            leaveDates: leaveDates !== undefined ? leaveDates : (leaveDays > 0 ? p.leaveDates : []),
            updatedAt: now,
          };
          return updated;
        }
        return p;
      })
    );
    if (selectedPersonForProfile?.id === id) {
      setSelectedPersonForProfileState(prev => prev ? {
        ...prev,
        leaveDays: Math.max(0, leaveDays),
        status: effectiveStatus,
        leaveStartDate: startDate || (leaveDays > 0 ? prev.leaveStartDate : undefined),
        leaveEndDate: endDate || (leaveDays > 0 ? prev.leaveEndDate : undefined),
        leaveDates: leaveDates !== undefined ? leaveDates : (leaveDays > 0 ? prev.leaveDates : []),
        updatedAt: now,
      } : null);
    }
    showToast(`Updated leave for person (${leaveDays} days, ${effectiveStatus})`);
  };

  const updatePersonClosed = (id: string, isClosed: boolean, closedDate?: string, closedReason?: string) => {
    const now = new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];
    const newStatus: PersonStatus = isClosed ? 'Closed' : 'Active';
    setPersons(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated: Person = {
            ...p,
            status: newStatus,
            closedDate: isClosed ? (closedDate || todayStr) : undefined,
            closedReason: isClosed ? closedReason : undefined,
            updatedAt: now,
          };
          return updated;
        }
        return p;
      })
    );
    if (selectedPersonForProfile?.id === id) {
      setSelectedPersonForProfileState(prev => prev ? {
        ...prev,
        status: newStatus,
        closedDate: isClosed ? (closedDate || todayStr) : undefined,
        closedReason: isClosed ? closedReason : undefined,
        updatedAt: now,
      } : null);
    }
    showToast(isClosed ? `Account marked as Closed (${closedDate || todayStr})` : `Account re-opened as Active`);
  };

  const updatePersonGradientTheme = (id: string, gradientTheme: string) => {
    const now = new Date().toISOString();
    setPersons(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated: Person = {
            ...p,
            gradientTheme,
            updatedAt: now,
          };
          return updated;
        }
        return p;
      })
    );
    if (selectedPersonForProfile?.id === id) {
      setSelectedPersonForProfileState(prev => (prev ? { ...prev, gradientTheme, updatedAt: now } : null));
    }
  };

  const deletePerson = (id: string) => {
    const person = persons.find(p => p.id === id);
    if (!person) return;

    // Strict validation: if person has any pending payments or unsettled balance, deletion is blocked!
    const summary = calculatePersonSummary(person, income, expenses, payments);
    if (summary.pendingAmount > 0 || summary.status !== 'settled') {
      showPersonDeleteBlocked(person, summary);
      showToast(`Cannot delete "${person.name}". Payment is due: ₹${summary.pendingAmount.toLocaleString('en-IN')}`, 'error');
      return;
    }

    setPersons(prev => prev.filter(p => p.id !== id));
    if (selectedPersonForProfile?.id === id) {
      setSelectedPersonForProfile(null);
    }

    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const binItem: RecycleBinItem = {
      id: 'bin_per_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      originalId: person.id,
      itemType: 'person',
      title: person.name,
      subtitle: `${person.type} • ${person.mobile || 'No Mobile'}`,
      amount: person.openingBalance,
      data: person,
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    setRecycleBin(prev => [binItem, ...prev]);
    showToast(`Moved "${person.name}" to Recycle Bin (auto-deletes in 15 days)`, 'info');
  };

  // Income CRUD
  const saveIncome = (incomeData: Omit<IncomeRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = new Date().toISOString();
    if (id) {
      setIncome(prev =>
        prev.map(i => (i.id === id ? { ...i, ...incomeData, updatedAt: now } : i))
      );
      showToast(`Updated Income entry of ₹${incomeData.amount.toLocaleString('en-IN')}`);
    } else {
      const newInc: IncomeRecord = {
        id: 'inc_' + Date.now(),
        userId: user?.uid || 'user_default',
        ...incomeData,
        createdAt: now,
        updatedAt: now,
      };
      setIncome(prev => [newInc, ...prev]);
      showToast(`Added Income of ₹${incomeData.amount.toLocaleString('en-IN')}`);
    }
    closeQuickAction();
  };

  const deleteIncome = (id: string) => {
    const inc = income.find(i => i.id === id);
    if (!inc) return;
    setIncome(prev => prev.filter(i => i.id !== id));

    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const binItem: RecycleBinItem = {
      id: 'bin_inc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      originalId: inc.id,
      itemType: 'income',
      title: `Income: ₹${inc.amount.toLocaleString('en-IN')}`,
      subtitle: `${inc.personName ? 'From ' + inc.personName + ' • ' : ''}${inc.paymentMethod} • ${inc.date}${inc.description ? ' • ' + inc.description : ''}`,
      amount: inc.amount,
      data: inc,
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    setRecycleBin(prev => [binItem, ...prev]);
    showToast('Moved Income to Recycle Bin (auto-deletes in 15 days)', 'info');
  };

  // Expense CRUD
  const saveExpense = (expenseData: Omit<ExpenseRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = new Date().toISOString();
    if (id) {
      setExpenses(prev =>
        prev.map(e => (e.id === id ? { ...e, ...expenseData, updatedAt: now } : e))
      );
      showToast(`Updated Expense entry of ₹${expenseData.amount.toLocaleString('en-IN')}`);
    } else {
      const newExp: ExpenseRecord = {
        id: 'exp_' + Date.now(),
        userId: user?.uid || 'user_default',
        ...expenseData,
        createdAt: now,
        updatedAt: now,
      };
      setExpenses(prev => [newExp, ...prev]);
      showToast(`Added Expense of ₹${expenseData.amount.toLocaleString('en-IN')}`);
    }
    closeQuickAction();
  };

  const deleteExpense = (id: string) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    setExpenses(prev => prev.filter(e => e.id !== id));

    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const binItem: RecycleBinItem = {
      id: 'bin_exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      originalId: exp.id,
      itemType: 'expense',
      title: `Expense: ₹${exp.amount.toLocaleString('en-IN')}`,
      subtitle: `${exp.category}${exp.personName ? ' • ' + exp.personName : ''} • ${exp.paymentMethod} • ${exp.date}${exp.description ? ' • ' + exp.description : ''}`,
      amount: exp.amount,
      data: exp,
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    setRecycleBin(prev => [binItem, ...prev]);
    showToast('Moved Expense to Recycle Bin (auto-deletes in 15 days)', 'info');
  };

  // Payment CRUD
  const savePayment = (paymentData: Omit<PaymentRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>, id?: string) => {
    const now = new Date().toISOString();
    if (id) {
      setPayments(prev =>
        prev.map(p => (p.id === id ? { ...p, ...paymentData, updatedAt: now } : p))
      );
      showToast(`Updated Payment of ₹${paymentData.amount.toLocaleString('en-IN')}`);
    } else {
      const newPay: PaymentRecord = {
        id: 'pay_' + Date.now(),
        userId: user?.uid || 'user_default',
        ...paymentData,
        createdAt: now,
        updatedAt: now,
      };
      setPayments(prev => [newPay, ...prev]);
      showToast(`Recorded ₹${paymentData.amount.toLocaleString('en-IN')} ${paymentData.type} payment`);
    }
    closeQuickAction();
  };

  const deletePayment = (id: string) => {
    const pay = payments.find(p => p.id === id);
    if (!pay) return;
    setPayments(prev => prev.filter(p => p.id !== id));

    const now = new Date();
    const expires = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
    const binItem: RecycleBinItem = {
      id: 'bin_pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      originalId: pay.id,
      itemType: 'payment',
      title: `Payment: ₹${pay.amount.toLocaleString('en-IN')} (${pay.type})`,
      subtitle: `${pay.type === 'Received' ? 'From' : 'To'} ${pay.personName} • ${pay.paymentMethod} • ${pay.date}${pay.note ? ' • ' + pay.note : ''}`,
      amount: pay.amount,
      data: pay,
      deletedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    setRecycleBin(prev => [binItem, ...prev]);
    showToast('Moved Payment to Recycle Bin (auto-deletes in 15 days)', 'info');
  };

  // Recycle Bin Operations
  const restoreFromRecycleBin = (id: string) => {
    const item = recycleBin.find(i => i.id === id);
    if (!item) return;

    if (item.itemType === 'person') {
      setPersons(prev => [item.data as Person, ...prev.filter(p => p.id !== item.originalId)]);
    } else if (item.itemType === 'income') {
      setIncome(prev => [item.data as IncomeRecord, ...prev.filter(i => i.id !== item.originalId)]);
    } else if (item.itemType === 'expense') {
      setExpenses(prev => [item.data as ExpenseRecord, ...prev.filter(e => e.id !== item.originalId)]);
    } else if (item.itemType === 'payment') {
      setPayments(prev => [item.data as PaymentRecord, ...prev.filter(p => p.id !== item.originalId)]);
    }

    setRecycleBin(prev => prev.filter(i => i.id !== id));
    showToast(`Restored "${item.title}" successfully`, 'success');
  };

  const deletePermanently = (id: string) => {
    setRecycleBin(prev => prev.filter(i => i.id !== id));
    showToast('Permanently deleted from Recycle Bin', 'info');
  };

  const emptyRecycleBin = () => {
    if (recycleBin.length === 0) {
      showToast('Recycle Bin is already empty', 'info');
      return;
    }
    openDeleteConfirm(
      'Empty Recycle Bin?',
      `Are you sure you want to permanently delete all ${recycleBin.length} items? This action cannot be undone.`,
      () => {
        setRecycleBin([]);
        showToast('Recycle Bin emptied completely', 'info');
      }
    );
  };

  // Auth & System actions
  const login = (email: string, pass: string, name?: string) => {
    const existing = LocalStorageManager.getUser();
    const profile: UserProfile = {
      ...(existing || INITIAL_USER),
      uid: existing?.uid || ('user_' + (email.split('@')[0] || 'account')),
      name: name || existing?.name || email.split('@')[0].toUpperCase(),
      email: email || existing?.email || 'Rajat807768@gmail.com',
      phone: existing?.phone || existing?.mobile || '+91 98765 43210',
      mobile: existing?.mobile || existing?.phone || '+91 98765 43210',
      businessName: existing?.businessName || 'Apex Infotech & Consulting',
      address: existing?.address || 'Sector 62, Noida, Uttar Pradesh',
      role: existing?.role || 'Business Owner / Proprietor',
      photoURL: existing?.photoURL || '',
      currencySymbol: '₹',
      biometricEnabled: true,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(profile);
    LocalStorageManager.setUser(profile);
    setIsBiometricLocked(false);
    showToast(`Welcome back, ${profile.name}!`);
  };

  const register = (name: string, email: string, pass: string, mobile?: string) => {
    const existing = LocalStorageManager.getUser();
    const profile: UserProfile = {
      ...(existing || INITIAL_USER),
      uid: 'user_' + Date.now(),
      name,
      email,
      phone: mobile || '+91 98765 00000',
      mobile: mobile || '+91 98765 00000',
      currencySymbol: '₹',
      businessName: `${name}'s Enterprise`,
      biometricEnabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(profile);
    LocalStorageManager.setUser(profile);
    setIsBiometricLocked(false);
    showToast(`Account created for ${name}!`);
  };

  const logout = () => {
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const unlockBiometric = () => {
    setIsBiometricLocked(false);
    LocalStorageManager.setBiometricLocked(false);
    showToast('Biometric authentication verified');
  };

  const toggleBiometric = (enabled: boolean) => {
    const existing = user || LocalStorageManager.getUser() || INITIAL_USER;
    const updated: UserProfile = { ...existing, biometricEnabled: enabled };
    setUser(updated);
    LocalStorageManager.setUser(updated);
    if (!enabled) {
      setIsBiometricLocked(false);
      LocalStorageManager.setBiometricLocked(false);
    }
    showToast(`Biometric lock ${enabled ? 'enabled' : 'disabled'}`);
  };

  const [currency, setCurrency] = useState<string>('INR');

  const lockBiometric = () => {
    setIsBiometricLocked(true);
    LocalStorageManager.setBiometricLocked(true);
    showToast('App locked with Biometrics');
  };

  const refreshData = () => {
    setPersons(LocalStorageManager.getPersons());
    setIncome(LocalStorageManager.getIncome());
    setExpenses(LocalStorageManager.getExpenses());
    setPayments(LocalStorageManager.getPayments());
    setRecycleBin(LocalStorageManager.getRecycleBin());
    setUser(LocalStorageManager.getUser());
  };

  const updateUserProfile = useCallback((profileData: Partial<UserProfile>, silent = false) => {
    setUser(prev => {
      const existing = prev || LocalStorageManager.getUser() || INITIAL_USER;
      const updated: UserProfile = {
        ...existing,
        ...profileData,
        uid: auth.currentUser?.uid || existing.uid || 'user_default_rajat',
        updatedAt: new Date().toISOString(),
      };

      LocalStorageManager.setUser(updated);
      LocalStorageManager.setProfileDraft(null);

      // Async sync to cloud if user is logged in
      if (auth.currentUser) {
        FirestoreSync.saveUserProfile(updated).catch(err => {
          console.warn('Firestore profile update notice:', err);
        });
      }

      return updated;
    });

    if (!silent) {
      showToast('Personal profile saved successfully', 'success');
    }
  }, [showToast]);

  const notify = (message: string, type?: 'success' | 'error' | 'info') => {
    showToast(message, type);
  };

  const resetToSampleData = () => {
    setPersons(INITIAL_PERSONS);
    setIncome(INITIAL_INCOME);
    setExpenses(INITIAL_EXPENSES);
    setPayments(INITIAL_PAYMENTS);
    setRecycleBin(INITIAL_RECYCLE_BIN);
    setUser(INITIAL_USER);
    LocalStorageManager.setRecycleBin(INITIAL_RECYCLE_BIN);
    showToast('Reset to default financial records');
  };

  const resetAllDataPermanently = async () => {
    try {
      setIsCloudSyncing(true);
      // 1. Permanently wipe all LocalStorage records
      LocalStorageManager.clearAllPermanently();

      // 2. Clear all React state lists to empty arrays
      setPersons([]);
      setIncome([]);
      setExpenses([]);
      setPayments([]);
      setRecycleBin([]);
      setSelectedPersonForProfileState(null);
      setEditItem(null);

      // 3. Clear cloud database collections if logged in to Firestore
      if (auth.currentUser?.uid) {
        await FirestoreSync.deleteAllFromCloud();
      }

      showToast('All financial records, persons & transactions deleted permanently', 'success');
    } catch (err: any) {
      console.error('Error during permanent data reset:', err);
      showToast('Data reset locally, cloud sync may have pending items', 'info');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const syncNow = () => {
    refreshData();
    const now = new Date().toISOString();
    setLastSyncTime(now);
    LocalStorageManager.setLastSync(now);
    showToast('All records & ledgers synced successfully', 'success');
  };

  const signInWithGooglePopup = async () => {
    try {
      setIsCloudSyncing(true);
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        setFirebaseUser(fbUser);
        showToast(`Signed in as ${fbUser.displayName || fbUser.email}`, 'success');
        await downloadFromCloud();
      }
    } catch (err: any) {
      showToast(err?.message || 'Google sign-in failed', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const signInAsGuestUser = async () => {
    try {
      setIsCloudSyncing(true);
      const fbUser = await signInAsGuest();
      if (fbUser) {
        setFirebaseUser(fbUser);
        showToast('Signed in as Guest', 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Guest sign-in failed', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const logoutFirebaseUser = async () => {
    try {
      await logOutFirebase();
      setFirebaseUser(null);
      showToast('Signed out of Firebase', 'info');
    } catch (err: any) {
      showToast(err?.message || 'Sign out failed', 'error');
    }
  };

  const syncWithCloud = async () => {
    try {
      setIsCloudSyncing(true);
      await FirestoreSync.uploadAllToCloud({
        persons,
        income,
        expenses,
        payments,
        recycleBin,
      });
      const now = new Date().toISOString();
      setLastSyncTime(now);
      LocalStorageManager.setLastSync(now);
      showToast('Cloud database synchronized successfully', 'success');
    } catch (err: any) {
      showToast(err?.message || 'Cloud sync failed', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const downloadFromCloud = async () => {
    try {
      setIsCloudSyncing(true);
      const cloudData = await FirestoreSync.fetchAllFromCloud();
      if (cloudData) {
        setPersons(cloudData.persons || []);
        setIncome(cloudData.income || []);
        setExpenses(cloudData.expenses || []);
        setPayments(cloudData.payments || []);
        setRecycleBin(cloudData.recycleBin || []);
        LocalStorageManager.setPersons(cloudData.persons || []);
        LocalStorageManager.setIncome(cloudData.income || []);
        LocalStorageManager.setExpenses(cloudData.expenses || []);
        LocalStorageManager.setPayments(cloudData.payments || []);
        LocalStorageManager.setRecycleBin(cloudData.recycleBin || []);
        showToast('Restored latest data from Firestore Cloud', 'success');
      }
    } catch (err: any) {
      showToast(err?.message || 'Download from cloud failed', 'error');
    } finally {
      setIsCloudSyncing(false);
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isBiometricLocked,
        activeTab,
        setActiveTab: handleSetActiveTab,
        currentView,
        setCurrentView,
        goBack,
        viewHistory,
        activeModal,
        openQuickAction,
        closeQuickAction,
        selectedPersonForProfile,
        setSelectedPersonForProfile,
        editItem,
        setEditItem,
        startEditItem,
        deleteConfirm,
        openDeleteConfirm,
        closeDeleteConfirm,
        personDeleteBlocked,
        showPersonDeleteBlocked,
        closePersonDeleteBlocked,
        startSettlePaymentForPerson,
        openPaymentForPerson,
        selectedMonth,
        setSelectedMonth,
        selectedDailyDate,
        setSelectedDailyDate,
        persons,
        income,
        expenses,
        payments,
        transactions,
        totals,
        savePerson,
        deletePerson,
        updatePersonLeave,
        updatePersonClosed,
        updatePersonGradientTheme,
        saveIncome,
        deleteIncome,
        saveExpense,
        deleteExpense,
        savePayment,
        deletePayment,
        recycleBin,
        recycleBinCount: recycleBin.length,
        restoreFromRecycleBin,
        deletePermanently,
        emptyRecycleBin,
        login,
        register,
        logout,
        unlockBiometric,
        lockBiometric,
        toggleBiometric,
        resetToSampleData,
        resetAllDataPermanently,
        refreshData,
        currency,
        setCurrency,
        updateUserProfile,
        transactionFilter,
        setTransactionFilter,
        openTransactionsWithType,
        paymentMethodFilter,
        setPaymentMethodFilter,
        openTransactionsWithPaymentMethod,
        theme,
        isDark,
        setTheme,
        toggleDarkMode,
        notifications,
        toasts,
        showToast,
        notify,
        dismissToast,
        firebaseUser,
        isCloudSyncing,
        signInWithGooglePopup,
        signInAsGuestUser,
        logoutFirebaseUser,
        syncWithCloud,
        downloadFromCloud,
        firebaseStatus: {
          isOnline,
          lastSync: lastSyncTime,
          syncQueueCount: 0,
          syncNow,
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
};
