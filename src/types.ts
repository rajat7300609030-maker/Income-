export type PersonType = 'Customer' | 'Employee' | 'Staff' | 'Worker' | 'Other';

export type AppTheme = 'light' | 'dark' | 'system';

export type SalaryType = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export type PersonStatus = 'Active' | 'On Leave' | 'Closed';

export type PaymentMethod = 'UPI' | 'Cash' | 'Bank' | 'School' | 'Salary' | 'Other';

export const PAYMENT_METHODS: PaymentMethod[] = ['UPI', 'Cash', 'Bank', 'School', 'Salary', 'Other'];

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  activeClass: string;
  inactiveClass: string;
  badgeClass: string;
  dotColor: string;
}

export const PAYMENT_METHOD_CONFIGS: Record<PaymentMethod, PaymentMethodConfig> = {
  UPI: {
    id: 'UPI',
    label: 'UPI',
    activeClass: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/30 border-violet-400',
    inactiveClass: 'bg-violet-50 text-violet-800 hover:bg-violet-100 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/60',
    badgeClass: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-300 dark:border-violet-700',
    dotColor: 'bg-violet-500',
  },
  Cash: {
    id: 'Cash',
    label: 'Cash',
    activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 border-emerald-400',
    inactiveClass: 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700',
    dotColor: 'bg-emerald-500',
  },
  Bank: {
    id: 'Bank',
    label: 'Bank',
    activeClass: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-600/30 border-blue-400',
    inactiveClass: 'bg-blue-50 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-700',
    dotColor: 'bg-blue-500',
  },
  School: {
    id: 'School',
    label: 'School',
    activeClass: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/30 border-amber-400',
    inactiveClass: 'bg-amber-50 text-amber-900 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60',
    badgeClass: 'bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
    dotColor: 'bg-amber-500',
  },
  Salary: {
    id: 'Salary',
    label: 'Salary',
    activeClass: 'bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white shadow-md shadow-fuchsia-600/30 border-fuchsia-400',
    inactiveClass: 'bg-fuchsia-50 text-fuchsia-800 hover:bg-fuchsia-100 border-fuchsia-200 dark:bg-fuchsia-950/40 dark:text-fuchsia-300 dark:border-fuchsia-800/60',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950/60 dark:text-fuchsia-300 border border-fuchsia-300 dark:border-fuchsia-700',
    dotColor: 'bg-fuchsia-500',
  },
  Other: {
    id: 'Other',
    label: 'Other',
    activeClass: 'bg-gradient-to-r from-slate-700 to-zinc-800 text-white shadow-md shadow-slate-700/30 border-slate-500',
    inactiveClass: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-neutral-800 dark:text-slate-300 dark:border-neutral-700',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-slate-300 border border-slate-300 dark:border-neutral-700',
    dotColor: 'bg-slate-500',
  },
};

export type TransactionType = 'Income' | 'Expense' | 'Payment';

export type PaymentDirection = 'Received' | 'Paid';

export interface Person {
  id: string;
  userId: string;
  name: string;
  mobile: string;
  address?: string;
  openingBalance: number;
  type: PersonType;
  salaryType?: SalaryType;
  salaryAmount?: number;
  joiningDate?: string; // YYYY-MM-DD
  status?: PersonStatus;
  leaveDays?: number;
  leaveDates?: string[];
  leaveStartDate?: string; // YYYY-MM-DD
  leaveEndDate?: string; // YYYY-MM-DD
  closedDate?: string; // YYYY-MM-DD
  closedReason?: string;
  notes?: string;
  gradientTheme?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  sourceId?: string; // Original ID of the Income, Expense, or Payment record
  userId: string;
  type: TransactionType;
  amount: number;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  personId?: string;
  personName?: string;
  category?: string;
  paymentMethod: PaymentMethod;
  paymentDirection?: PaymentDirection; // For Payments: 'Received' or 'Paid'
  referenceNumber?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeRecord {
  id: string;
  userId: string;
  personId?: string;
  personName?: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseRecord {
  id: string;
  userId: string;
  personId?: string;
  personName?: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentCategory =
  | 'School & College'
  | 'Home'
  | 'Salary & Pension'
  | 'Rent'
  | 'Other';

export const PAYMENT_CATEGORIES: PaymentCategory[] = [
  'School & College',
  'Home',
  'Salary & Pension',
  'Rent',
  'Other',
];

export interface PaymentRecord {
  id: string;
  userId: string;
  personId: string;
  personName: string;
  amount: number;
  date: string;
  type: PaymentDirection; // 'Received' | 'Paid'
  paymentMethod: PaymentMethod;
  category?: string; // e.g. School & College, Home, Salary & Pension, Rent, Other
  referenceNumber?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  phone?: string;
  mobile?: string;
  businessName?: string;
  address?: string;
  role?: string;
  currencySymbol: string;
  biometricEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface PersonCalculations {
  person: Person;
  totalAmount: number; // Sum of business transactions, opening balance, or total salary
  totalPaid: number;   // Amount paid to person
  totalReceived: number; // Amount received from person
  pendingAmount: number; // What is pending / remaining salary (Total Amount - Paid Amount / Received Amount)
  status: 'to_receive' | 'to_pay' | 'settled';
  daysSinceJoined?: number; // Number of days from joining date to today (or closed date)
  activeWorkingDays?: number; // Working days (daysSinceJoined - leaveDays)
  leaveDays?: number;
  isClosed?: boolean;
  isOnLeave?: boolean;
  accruedSalary?: number;   // Salary amount
  totalSalary?: number;     // Total salary amount
  dueSalary?: number;       // Due salary amount (Total Salary - Paid)
  remainingSalary?: number; // Remaining salary amount to pay
  salaryRateDescription?: string; // Human-readable salary structure calculation (e.g. ₹750/day × 16 days = ₹12,000)
}

export interface DashboardTotals {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  totalPayments: number;
  pendingPayments: number;
  currentBalance: number;
  bankBalance: number;
  cashBalance: number;
  bankingBalance: number;
  bankingIncome: number;
  cashIncome: number;
  pureBankBalance?: number;
  upiBalance?: number;
  pureBankIncome?: number;
  upiIncome?: number;
  pureBankExpenses?: number;
  upiExpenses: number;
  upiPayments: number;
  upiTotal: number;
  bankingExpenses?: number;
  cashExpenses: number;
  cashPayments: number;
  cashTotal: number;
  bankExpenses: number;
  bankPayments: number;
  bankTotal: number;
  otherExpenses: number;
  schoolExpenses: number;
  schoolPayments: number;
  schoolTotal: number;
  salaryExpenses: number;
  salaryPayments: number;
  salaryTotal: number;
  otherPayments: number;
  otherTotal: number;
  nonBankingOutflowsTotal: number;
  todayIncome: number;
  todayExpenses: number;
  todayPayments: number;
  thisMonthIncome: number;
  thisMonthExpenses: number;
  thisMonthNet: number;
}

export interface PersonDeleteBlockedState {
  isOpen: boolean;
  person: Person | null;
  summary: PersonCalculations | null;
}

export type ActiveTab = 'dashboard' | 'daily' | 'persons' | 'payments' | 'reports';

export type QuickActionModal = 'add_person' | 'add_income' | 'add_expense' | 'add_payment' | null;

export type RecycleBinItemType = 'person' | 'income' | 'expense' | 'payment';

export interface RecycleBinItem {
  id: string;
  originalId: string;
  itemType: RecycleBinItemType;
  title: string;
  subtitle?: string;
  amount?: number;
  data: Person | IncomeRecord | ExpenseRecord | PaymentRecord;
  deletedAt: string; // ISO date string
  expiresAt: string; // ISO date string (15 days after deletedAt)
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'income' | 'expense' | 'payment' | 'alert';
}

