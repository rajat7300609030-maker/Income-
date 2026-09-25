export type PersonType = 'Customer' | 'Employee' | 'Staff' | 'Worker' | 'Other';

export type AppTheme = 'light' | 'dark' | 'system';

export type SalaryType = 'None' | 'Daily' | 'Weekly' | 'Monthly';

export type PersonStatus = 'Active' | 'On Leave' | 'Closed';

export type PaymentMethod = 'Cash' | 'UPI' | 'Bank' | 'Other';

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
  bankingIncome: number;
  cashIncome: number;
  pureBankBalance?: number;
  upiBalance?: number;
  pureBankIncome?: number;
  upiIncome?: number;
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

