import {
  AppNotification,
  ExpenseRecord,
  IncomeRecord,
  PaymentRecord,
  Person,
  RecycleBinItem,
  Transaction,
  UserProfile
} from '../types';

const STORAGE_KEYS = {
  USER: 'iet_user_profile',
  PROFILE_DRAFT: 'iet_profile_draft',
  PERSONS: 'iet_persons',
  INCOME: 'iet_income',
  EXPENSES: 'iet_expenses',
  PAYMENTS: 'iet_payments',
  TRANSACTIONS: 'iet_transactions',
  RECYCLE_BIN: 'iet_recycle_bin',
  NOTIFICATIONS: 'iet_notifications',
  SYNC_QUEUE: 'iet_sync_queue',
  LAST_SYNC: 'iet_last_sync',
  BIOMETRIC_LOCKED: 'iet_biometric_locked',
  HAS_BEEN_RESET: 'iet_has_been_reset',
  APP_INITIALIZED: 'iet_app_initialized',
  APP_PASSWORD: 'iet_app_password',
  PASSWORD_HINT: 'iet_password_hint',
  PASSWORD_LAST_CHANGED: 'iet_password_last_changed',
};


// Seed initial realistic data for instant testability
export const INITIAL_USER: UserProfile = {
  uid: 'user_default_rajat',
  name: 'Rajat Sharma',
  email: 'Rajat807768@gmail.com',
  phone: '+91 98765 43210',
  mobile: '+91 98765 43210',
  businessName: 'Apex Infotech & Consulting',
  address: 'Sector 62, Noida, Uttar Pradesh',
  role: 'Business Owner / Proprietor',
  currencySymbol: '₹',
  biometricEnabled: true,
  createdAt: new Date().toISOString(),
};

const TODAY = new Date().toISOString().split('T')[0];
const YESTERDAY = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const TWO_DAYS_AGO = new Date(Date.now() - 172800000).toISOString().split('T')[0];
const FIVE_DAYS_AGO = new Date(Date.now() - 432000000).toISOString().split('T')[0];

export const INITIAL_PERSONS: Person[] = [
  {
    id: 'per_1',
    userId: 'user_default_rajat',
    name: 'Amit Verma',
    mobile: '+91 98234 11223',
    address: 'Sector 62, Noida, UP',
    openingBalance: 25000,
    type: 'Customer',
    gradientTheme: 'ocean',
    notes: 'Regular client for software maintenance',
    createdAt: FIVE_DAYS_AGO,
    updatedAt: FIVE_DAYS_AGO,
  },
  {
    id: 'per_2',
    userId: 'user_default_rajat',
    name: 'Priya Patel',
    mobile: '+91 97123 44556',
    address: 'MG Road, Bengaluru, KA',
    openingBalance: 40000,
    type: 'Customer',
    gradientTheme: 'sunset',
    notes: 'UI/UX Design milestone project',
    createdAt: FIVE_DAYS_AGO,
    updatedAt: FIVE_DAYS_AGO,
  },
  {
    id: 'per_3',
    userId: 'user_default_rajat',
    name: 'Ramesh Kumar',
    mobile: '+91 94555 77889',
    address: 'Nehru Place, New Delhi',
    openingBalance: 0,
    type: 'Employee',
    salaryType: 'Monthly',
    salaryAmount: 30000,
    joiningDate: '2026-09-01',
    gradientTheme: 'amethyst',
    notes: 'Senior Android App Developer',
    createdAt: FIVE_DAYS_AGO,
    updatedAt: FIVE_DAYS_AGO,
  },
  {
    id: 'per_4',
    userId: 'user_default_rajat',
    name: 'Sharma Cloud Servers',
    mobile: '+91 99887 66554',
    address: 'Bandra Kurla Complex, Mumbai',
    openingBalance: 8500,
    type: 'Other',
    gradientTheme: 'emerald',
    notes: 'AWS & GCP Infrastructure supplier',
    createdAt: FIVE_DAYS_AGO,
    updatedAt: FIVE_DAYS_AGO,
  },
];

export const INITIAL_INCOME: IncomeRecord[] = [
  {
    id: 'inc_1',
    userId: 'user_default_rajat',
    personId: 'per_1',
    personName: 'Amit Verma',
    amount: 35000,
    date: TODAY,
    paymentMethod: 'UPI',
    description: 'Q3 Maintenance retainer payment',
    createdAt: TODAY + 'T10:30:00Z',
    updatedAt: TODAY + 'T10:30:00Z',
  },
  {
    id: 'inc_2',
    userId: 'user_default_rajat',
    personId: 'per_2',
    personName: 'Priya Patel',
    amount: 55000,
    date: YESTERDAY,
    paymentMethod: 'Bank',
    description: 'Design prototype completion milestone',
    createdAt: YESTERDAY + 'T14:15:00Z',
    updatedAt: YESTERDAY + 'T14:15:00Z',
  },
  {
    id: 'inc_3',
    userId: 'user_default_rajat',
    amount: 18000,
    date: TWO_DAYS_AGO,
    paymentMethod: 'Cash',
    description: 'Tech consultation workshop fees',
    createdAt: TWO_DAYS_AGO + 'T11:00:00Z',
    updatedAt: TWO_DAYS_AGO + 'T11:00:00Z',
  },
];

export const INITIAL_EXPENSES: ExpenseRecord[] = [
  {
    id: 'exp_1',
    userId: 'user_default_rajat',
    personId: 'per_4',
    personName: 'Sharma Cloud Servers',
    category: 'Hosting & Servers',
    amount: 6800,
    date: TODAY,
    paymentMethod: 'UPI',
    description: 'Monthly cloud cluster hosting bill',
    createdAt: TODAY + 'T09:15:00Z',
    updatedAt: TODAY + 'T09:15:00Z',
  },
  {
    id: 'exp_2',
    userId: 'user_default_rajat',
    category: 'Office & Utilities',
    amount: 4500,
    date: TODAY,
    paymentMethod: 'Cash',
    description: 'High-speed internet & tea pantry supplies',
    createdAt: TODAY + 'T11:20:00Z',
    updatedAt: TODAY + 'T11:20:00Z',
  },
  {
    id: 'exp_3',
    userId: 'user_default_rajat',
    personId: 'per_3',
    personName: 'Ramesh Kumar',
    category: 'Salary & Allowances',
    amount: 25000,
    date: YESTERDAY,
    paymentMethod: 'Bank',
    description: 'Mid-month performance allowance & advance',
    createdAt: YESTERDAY + 'T16:00:00Z',
    updatedAt: YESTERDAY + 'T16:00:00Z',
  },
];

export const INITIAL_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_1',
    userId: 'user_default_rajat',
    personId: 'per_1',
    personName: 'Amit Verma',
    amount: 25000,
    date: TODAY,
    type: 'Received',
    paymentMethod: 'UPI',
    category: 'School & College',
    referenceNumber: 'UPI/2948293849/YESB',
    note: 'Clearance of initial pending balance',
    createdAt: TODAY + 'T12:00:00Z',
    updatedAt: TODAY + 'T12:00:00Z',
  },
  {
    id: 'pay_2',
    userId: 'user_default_rajat',
    personId: 'per_3',
    personName: 'Ramesh Kumar',
    amount: 12000,
    date: TWO_DAYS_AGO,
    type: 'Paid',
    paymentMethod: 'Bank',
    category: 'Salary & Pension',
    referenceNumber: 'NEFT-HDFC-9938210',
    note: 'Settlement of pending bonus balance',
    createdAt: TWO_DAYS_AGO + 'T15:30:00Z',
    updatedAt: TWO_DAYS_AGO + 'T15:30:00Z',
  },
];

// Helper to construct all transactions from income, expenses, and payments
export function buildTransactionsList(
  incomes: IncomeRecord[] = [],
  expenses: ExpenseRecord[] = [],
  payments: PaymentRecord[] = []
): Transaction[] {
  const list: Transaction[] = [];

  const safeIncomes = Array.isArray(incomes) ? incomes : [];
  const safeExpenses = Array.isArray(expenses) ? expenses : [];
  const safePayments = Array.isArray(payments) ? payments : [];

  const extractTime = (createdAt?: string): string => {
    if (!createdAt || typeof createdAt !== 'string') return '12:00';
    try {
      const parts = createdAt.split('T');
      return parts[1] ? parts[1].substring(0, 5) : '12:00';
    } catch {
      return '12:00';
    }
  };

  safeIncomes.forEach((i, idx) => {
    if (!i) return;
    const rawId = i.id || `inc_gen_${idx}_${Date.now()}`;
    list.push({
      id: `tx_${rawId}`,
      sourceId: rawId,
      userId: i.userId || '',
      type: 'Income',
      amount: Number(i.amount) || 0,
      date: i.date || new Date().toISOString().split('T')[0],
      time: extractTime(i.createdAt),
      personId: i.personId,
      personName: i.personName,
      paymentMethod: i.paymentMethod || 'Cash',
      note: i.description || '',
      createdAt: i.createdAt || new Date().toISOString(),
      updatedAt: i.updatedAt || new Date().toISOString(),
    });
  });

  safeExpenses.forEach((e, idx) => {
    if (!e) return;
    const rawId = e.id || `exp_gen_${idx}_${Date.now()}`;
    list.push({
      id: `tx_${rawId}`,
      sourceId: rawId,
      userId: e.userId || '',
      type: 'Expense',
      amount: Number(e.amount) || 0,
      date: e.date || new Date().toISOString().split('T')[0],
      time: extractTime(e.createdAt),
      personId: e.personId,
      personName: e.personName,
      category: e.category,
      paymentMethod: e.paymentMethod || 'Cash',
      note: e.description || '',
      createdAt: e.createdAt || new Date().toISOString(),
      updatedAt: e.updatedAt || new Date().toISOString(),
    });
  });

  safePayments.forEach((p, idx) => {
    if (!p) return;
    const rawId = p.id || `pay_gen_${idx}_${Date.now()}`;
    list.push({
      id: `tx_${rawId}`,
      sourceId: rawId,
      userId: p.userId || '',
      type: 'Payment',
      amount: Number(p.amount) || 0,
      date: p.date || new Date().toISOString().split('T')[0],
      time: extractTime(p.createdAt),
      personId: p.personId,
      personName: p.personName,
      paymentDirection: p.type || 'Received',
      paymentMethod: p.paymentMethod || 'Cash',
      category: p.category || 'Payment',
      referenceNumber: p.referenceNumber,
      note: p.note || '',
      createdAt: p.createdAt || new Date().toISOString(),
      updatedAt: p.updatedAt || new Date().toISOString(),
    });
  });

  // Ensure 100% uniqueness of IDs in list
  const seenIds = new Set<string>();
  const uniqueList: Transaction[] = [];
  for (let k = 0; k < list.length; k++) {
    const tx = list[k];
    let finalId = tx.id;
    if (seenIds.has(finalId)) {
      finalId = `${tx.id}_dup_${k}`;
      tx.id = finalId;
    }
    seenIds.add(finalId);
    uniqueList.push(tx);
  }

  // Sort descending by date and time safely
  return uniqueList.sort((a, b) => {
    const timeA = new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`).getTime() || 0;
    const timeB = new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`).getTime() || 0;
    return timeB - timeA;
  });
}

const TWO_DAYS_AGO_MS = Date.now() - 2 * 24 * 60 * 60 * 1000;
export const INITIAL_RECYCLE_BIN: RecycleBinItem[] = [
  {
    id: 'bin_sample_1',
    originalId: 'exp_sample_old',
    itemType: 'expense',
    title: 'Expense: ₹650',
    subtitle: 'Office Supplies • Stationery & Printing • Cash',
    amount: 650,
    data: {
      id: 'exp_sample_old',
      userId: 'user_default_rajat',
      category: 'Office Supplies',
      amount: 650,
      date: TWO_DAYS_AGO,
      paymentMethod: 'Cash',
      description: 'Stationery & Printing',
      createdAt: new Date(TWO_DAYS_AGO_MS).toISOString(),
      updatedAt: new Date(TWO_DAYS_AGO_MS).toISOString(),
    },
    deletedAt: new Date(TWO_DAYS_AGO_MS).toISOString(),
    expiresAt: new Date(TWO_DAYS_AGO_MS + 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export class LocalStorageManager {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('LocalStorage write error:', e);
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded on key:', key);
      }
    }
  }

  static getUser(): UserProfile | null {
    return this.get<UserProfile | null>(STORAGE_KEYS.USER, INITIAL_USER);
  }

  static setUser(user: UserProfile | null): void {
    this.set(STORAGE_KEYS.USER, user);
  }

  static getProfileDraft(): Partial<UserProfile> | null {
    return this.get<Partial<UserProfile> | null>(STORAGE_KEYS.PROFILE_DRAFT, null);
  }

  static setProfileDraft(draft: Partial<UserProfile> | null): void {
    if (draft === null) {
      try {
        localStorage.removeItem(STORAGE_KEYS.PROFILE_DRAFT);
      } catch {}
    } else {
      this.set(STORAGE_KEYS.PROFILE_DRAFT, draft);
    }
  }

  static deduplicateById<T extends { id?: string }>(items: T[]): T[] {
    if (!Array.isArray(items)) return [];
    const seen = new Set<string>();
    const result: T[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      const keyId = item.id || `gen_id_${i}`;
      if (!seen.has(keyId)) {
        seen.add(keyId);
        result.push(item);
      }
    }
    return result;
  }

  static hasBeenReset(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.HAS_BEEN_RESET) === 'true';
    } catch {
      return false;
    }
  }

  static isInitialized(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.APP_INITIALIZED) === 'true';
    } catch {
      return false;
    }
  }

  static getPersons(): Person[] {
    const defaultData = (this.hasBeenReset() || this.isInitialized()) ? [] : INITIAL_PERSONS;
    const rawList = this.deduplicateById(this.get<Person[]>(STORAGE_KEYS.PERSONS, defaultData));
    // Auto-migrate legacy employees/staff/workers that might lack explicit salary configurations
    return rawList.map(p => {
      if (p.type === 'Employee' || p.type === 'Staff' || p.type === 'Worker') {
        const needsUpdate = !p.salaryAmount || !p.salaryType || p.salaryType === 'None';
        if (needsUpdate) {
          return {
            ...p,
            salaryType: (p.salaryType && p.salaryType !== 'None') ? p.salaryType : 'Monthly',
            salaryAmount: Number(p.salaryAmount) > 0 ? Number(p.salaryAmount) : 30000,
            joiningDate: p.joiningDate || (p.createdAt ? p.createdAt.split('T')[0] : '2026-09-01'),
          };
        }
      }
      return p;
    });
  }

  static setPersons(persons: Person[]): void {
    this.set(STORAGE_KEYS.PERSONS, this.deduplicateById(persons));
  }

  static getIncome(): IncomeRecord[] {
    const defaultData = (this.hasBeenReset() || this.isInitialized()) ? [] : INITIAL_INCOME;
    return this.deduplicateById(this.get<IncomeRecord[]>(STORAGE_KEYS.INCOME, defaultData));
  }

  static setIncome(incomes: IncomeRecord[]): void {
    this.set(STORAGE_KEYS.INCOME, this.deduplicateById(incomes));
  }

  static getExpenses(): ExpenseRecord[] {
    const defaultData = (this.hasBeenReset() || this.isInitialized()) ? [] : INITIAL_EXPENSES;
    return this.deduplicateById(this.get<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, defaultData));
  }

  static setExpenses(expenses: ExpenseRecord[]): void {
    this.set(STORAGE_KEYS.EXPENSES, this.deduplicateById(expenses));
  }

  static getPayments(): PaymentRecord[] {
    const defaultData = (this.hasBeenReset() || this.isInitialized()) ? [] : INITIAL_PAYMENTS;
    return this.deduplicateById(this.get<PaymentRecord[]>(STORAGE_KEYS.PAYMENTS, defaultData));
  }

  static setPayments(payments: PaymentRecord[]): void {
    this.set(STORAGE_KEYS.PAYMENTS, this.deduplicateById(payments));
  }

  static getRecycleBin(): RecycleBinItem[] {
    const defaultData = (this.hasBeenReset() || this.isInitialized()) ? [] : INITIAL_RECYCLE_BIN;
    const raw = this.deduplicateById(this.get<RecycleBinItem[]>(STORAGE_KEYS.RECYCLE_BIN, defaultData));
    const now = Date.now();
    // Automatic 15-day purge: items where expire date is passed are purged permanently
    const active = raw.filter(item => {
      const expireTime = new Date(item.expiresAt).getTime();
      return expireTime > now;
    });
    if (active.length !== raw.length) {
      this.setRecycleBin(active);
    }
    return active;
  }

  static setRecycleBin(items: RecycleBinItem[]): void {
    this.set(STORAGE_KEYS.RECYCLE_BIN, this.deduplicateById(items));
  }

  static getNotifications(): AppNotification[] {
    const defaultData: AppNotification[] = (this.hasBeenReset() || this.isInitialized()) ? [] : [
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
    ];
    return this.get<AppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, defaultData);
  }

  static setNotifications(notifs: AppNotification[]): void {
    this.set(STORAGE_KEYS.NOTIFICATIONS, notifs);
  }


  static getLastSync(): string {
    return this.get<string>(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }

  static setLastSync(time: string): void {
    this.set(STORAGE_KEYS.LAST_SYNC, time);
  }

  static isBiometricLocked(): boolean {
    return this.get<boolean>(STORAGE_KEYS.BIOMETRIC_LOCKED, false);
  }

  static setBiometricLocked(locked: boolean): void {
    this.set(STORAGE_KEYS.BIOMETRIC_LOCKED, locked);
  }

  static getAppPassword(): string {
    return this.get<string>(STORAGE_KEYS.APP_PASSWORD, 'SecurePass123!');
  }

  static setAppPassword(password: string): void {
    this.set(STORAGE_KEYS.APP_PASSWORD, password);
    this.set(STORAGE_KEYS.PASSWORD_LAST_CHANGED, new Date().toISOString());
  }

  static getPasswordHint(): string {
    return this.get<string>(STORAGE_KEYS.PASSWORD_HINT, 'Default master password');
  }

  static setPasswordHint(hint: string): void {
    this.set(STORAGE_KEYS.PASSWORD_HINT, hint);
  }

  static getPasswordLastChanged(): string {
    return this.get<string>(STORAGE_KEYS.PASSWORD_LAST_CHANGED, new Date().toISOString());
  }

  static clearAllPermanently(): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HAS_BEEN_RESET, 'true');
      localStorage.setItem(STORAGE_KEYS.APP_INITIALIZED, 'true');
    } catch {}
    this.set(STORAGE_KEYS.PERSONS, []);
    this.set(STORAGE_KEYS.INCOME, []);
    this.set(STORAGE_KEYS.EXPENSES, []);
    this.set(STORAGE_KEYS.PAYMENTS, []);
    this.set(STORAGE_KEYS.TRANSACTIONS, []);
    this.set(STORAGE_KEYS.RECYCLE_BIN, []);
    this.set(STORAGE_KEYS.NOTIFICATIONS, []);
    try {
      localStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE);
      localStorage.removeItem(STORAGE_KEYS.PROFILE_DRAFT);
      localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    } catch {}
  }

  static clearAll(): void {
    this.clearAllPermanently();
  }

  static exportBackupJSON(): string {
    const data = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      user: this.getUser(),
      persons: this.getPersons(),
      income: this.getIncome(),
      expenses: this.getExpenses(),
      payments: this.getPayments(),
      recycleBin: this.getRecycleBin(),
    };
    return JSON.stringify(data, null, 2);
  }

  static importBackupJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.persons && Array.isArray(data.persons)) {
        this.setPersons(data.persons);
      }
      if (data.income && Array.isArray(data.income)) {
        this.setIncome(data.income);
      }
      if (data.expenses && Array.isArray(data.expenses)) {
        this.setExpenses(data.expenses);
      }
      if (data.payments && Array.isArray(data.payments)) {
        this.setPayments(data.payments);
      }
      if (data.recycleBin && Array.isArray(data.recycleBin)) {
        this.setRecycleBin(data.recycleBin);
      }
      if (data.user && typeof data.user === 'object') {
        this.setUser(data.user);
      }
      return true;
    } catch {
      return false;
    }
  }

  static exportData(): string {
    return this.exportBackupJSON();
  }

  static importData(jsonStr: string): boolean {
    return this.importBackupJSON(jsonStr);
  }

  static seedInitialData(): void {
    this.setPersons(INITIAL_PERSONS);
    this.setIncome(INITIAL_INCOME);
    this.setExpenses(INITIAL_EXPENSES);
    this.setPayments(INITIAL_PAYMENTS);
    this.setRecycleBin(INITIAL_RECYCLE_BIN);
    this.setUser(INITIAL_USER);
  }

  static setUserProfile(user: UserProfile | null): void {
    this.setUser(user);
  }

  static generateCSV(transactions: Transaction[]): string {
    const headers = ['Transaction ID', 'Type', 'Amount (INR)', 'Date', 'Time', 'Person', 'Category', 'Payment Method', 'Direction', 'Ref No', 'Notes'];
    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.amount,
      t.date,
      t.time || '',
      `"${(t.personName || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.paymentDirection || '',
      `"${(t.referenceNumber || '').replace(/"/g, '""')}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const storage = LocalStorageManager;
