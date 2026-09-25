import {
  DashboardTotals,
  ExpenseRecord,
  IncomeRecord,
  PaymentRecord,
  Person,
  PersonCalculations,
  Transaction
} from '../types';

/**
 * Format numbers in standard Indian Rupee format (e.g. ₹1,25,000.00)
 */
export function formatINR(amount: number | undefined | null, includeDecimals = false): string {
  const safeNum = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const isNegative = safeNum < 0;
  const absVal = Math.abs(safeNum);

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  };

  try {
    const formatted = new Intl.NumberFormat('en-IN', options).format(absVal);
    return isNegative ? `-${formatted}` : formatted;
  } catch {
    return `${isNegative ? '-' : ''}₹${absVal.toLocaleString('en-IN')}`;
  }
}

/**
 * Calculate dashboard totals accurately from the raw records.
 */
export function calculateDashboardTotals(
  incomeList: IncomeRecord[] = [],
  expenseList: ExpenseRecord[] = [],
  paymentList: PaymentRecord[] = [],
  personList: Person[] = [],
  selectedMonth: string = '' // YYYY-MM
): DashboardTotals {
  const todayStr = new Date().toISOString().split('T')[0];
  const safeIncome = Array.isArray(incomeList) ? incomeList : [];
  const safeExpense = Array.isArray(expenseList) ? expenseList : [];
  const safePayment = Array.isArray(paymentList) ? paymentList : [];
  const safePerson = Array.isArray(personList) ? personList : [];
  const safeMonth = typeof selectedMonth === 'string' ? selectedMonth : '';

  // Total Income = sum of all Income records
  const totalIncome = safeIncome.reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  // Total Expenses = sum of all Expense records
  const totalExpenses = safeExpense.reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  // Total Payments = sum of all Payment records
  const totalPayments = safePayment.reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  // Payments breakdown by payment method and type (Received adds to funds, Paid deducts from funds)
  const cashPaymentsReceived = safePayment
    .filter(p => p && p.paymentMethod === 'Cash' && p.type === 'Received')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);
  const cashPaymentsPaid = safePayment
    .filter(p => p && p.paymentMethod === 'Cash' && p.type === 'Paid')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);

  const bankPaymentsReceived = safePayment
    .filter(p => p && p.paymentMethod === 'Bank' && p.type === 'Received')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);
  const bankPaymentsPaid = safePayment
    .filter(p => p && p.paymentMethod === 'Bank' && p.type === 'Paid')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);

  const upiPaymentsReceived = safePayment
    .filter(p => p && p.paymentMethod === 'UPI' && p.type === 'Received')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);
  const upiPaymentsPaid = safePayment
    .filter(p => p && p.paymentMethod === 'UPI' && p.type === 'Paid')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);

  const otherPaymentsReceived = safePayment
    .filter(p => p && p.paymentMethod === 'Other' && p.type === 'Received')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);
  const otherPaymentsPaid = safePayment
    .filter(p => p && p.paymentMethod === 'Other' && p.type === 'Paid')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);

  // Pure Income breakdown by payment method (Income only - without expense or other amount):
  const cashIncome = safeIncome
    .filter(item => item && item.paymentMethod === 'Cash')
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const pureBankIncome = safeIncome
    .filter(item => item && item.paymentMethod === 'Bank')
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const upiIncome = safeIncome
    .filter(item => item && item.paymentMethod === 'UPI')
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  // Banking Income combines Bank and UPI income (only income, without expense or other deductions)
  const bankingIncome = pureBankIncome + upiIncome;

  const otherIncome = safeIncome
    .filter(item => item && item.paymentMethod === 'Other')
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  // Current Net Balance: directly Total Income minus Total Expenses (income mese expense subtract)
  const netBalance = totalIncome - totalExpenses;
  const currentBalance = totalIncome - totalExpenses;

  // Pending Payments = sum of all person pending amounts that are to receive or to pay
  const personStats = safePerson.map(p => calculatePersonSummary(p, safeIncome, safeExpense, safePayment));
  const pendingPayments = personStats.reduce((acc, p) => acc + Math.max(0, p.pendingAmount || 0), 0);

  // Today's metrics
  const todayIncome = safeIncome
    .filter(item => item && item.date === todayStr)
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const todayExpenses = safeExpense
    .filter(item => item && item.date === todayStr)
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const todayPayments = safePayment
    .filter(item => item && item.date === todayStr)
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  // Month metrics
  const thisMonthIncome = safeIncome
    .filter(item => item && typeof item.date === 'string' && safeMonth && item.date.startsWith(safeMonth))
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const thisMonthExpenses = safeExpense
    .filter(item => item && typeof item.date === 'string' && safeMonth && item.date.startsWith(safeMonth))
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const thisMonthNet = thisMonthIncome - thisMonthExpenses;

  return {
    totalIncome,
    totalExpenses,
    netBalance,
    totalPayments,
    pendingPayments,
    currentBalance,
    bankBalance: bankingIncome,
    cashBalance: cashIncome,
    bankingIncome,
    cashIncome,
    pureBankIncome,
    upiIncome,
    todayIncome,
    todayExpenses,
    todayPayments,
    thisMonthIncome,
    thisMonthExpenses,
    thisMonthNet,
  };
}

/**
 * Calculate detailed balances for a specific person.
 * Formula:
 * - Total Received: All payments received + incomes linked to this person
 * - Total Paid: All payments paid + expenses linked to this person
 * - For Customer:
 *   - Total Amount: Opening balance due + business incomes + payments received
 *   - Pending Amount: (Opening balance + unpaid dues) - received + paid
 * - For Employee / Vendor / Other:
 *   - Total Amount: Opening balance owed + business expenses + payments paid
 *   - Pending Amount: (Opening balance + unpaid expenses) - paid + received
 */
export function calculatePersonSummary(
  person: Person,
  incomeList: IncomeRecord[] = [],
  expenseList: ExpenseRecord[] = [],
  paymentList: PaymentRecord[] = []
): PersonCalculations {
  if (!person) {
    return {
      person: { id: '', userId: '', name: 'Unknown', mobile: '', openingBalance: 0, type: 'Customer', createdAt: '', updatedAt: '' },
      totalAmount: 0,
      totalPaid: 0,
      totalReceived: 0,
      pendingAmount: 0,
      status: 'settled',
    };
  }

  const safeIncome = Array.isArray(incomeList) ? incomeList : [];
  const safeExpense = Array.isArray(expenseList) ? expenseList : [];
  const safePayment = Array.isArray(paymentList) ? paymentList : [];

  const opening = Number(person.openingBalance) || 0;

  const matchesPerson = (item: { personId?: string; personName?: string }) => {
    if (!item) return false;
    if (item.personId && item.personId === person.id) return true;
    if (item.personName && person.name && item.personName.trim().toLowerCase() === person.name.trim().toLowerCase()) return true;
    return false;
  };

  // Income tied to this person (Inflows received from this person)
  const personIncome = safeIncome
    .filter(i => matchesPerson(i))
    .reduce((acc, i) => acc + (Number(i?.amount) || 0), 0);

  // Expenses tied to this person (Outflows paid to/for this person)
  const personExpenses = safeExpense
    .filter(e => matchesPerson(e))
    .reduce((acc, e) => acc + (Number(e?.amount) || 0), 0);

  // Payments received from this person
  const receivedPayments = safePayment
    .filter(p => matchesPerson(p) && p.type === 'Received')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);

  // Payments paid to this person
  const paidPayments = safePayment
    .filter(p => matchesPerson(p) && p.type === 'Paid')
    .reduce((acc, p) => acc + (Number(p?.amount) || 0), 0);

  // All money received from this person (Payments Received + Incomes)
  const totalReceived = receivedPayments + personIncome;

  // All money paid to this person (Payments Paid + Expenses)
  const totalPaid = paidPayments + personExpenses;

  // Calculate salary accrued from joining date up to today (or closed date)
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

  let endUtc = todayUtc;
  if (person.status === 'Closed' && person.closedDate) {
    const rawClosed = person.closedDate.split('T')[0];
    const parts = rawClosed.split(/[-/]/).map(Number);
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        endUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
      } else if (parts[2] > 1000) {
        endUtc = Date.UTC(parts[2], parts[1] - 1, parts[0]);
      }
    } else {
      const parsed = new Date(person.closedDate);
      if (!isNaN(parsed.getTime())) {
        endUtc = Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
    }
  }

  let joinUtc = endUtc;
  const rawJoinDate = person.joiningDate || (person.createdAt ? person.createdAt.split('T')[0] : '');

  if (rawJoinDate) {
    const clean = rawJoinDate.split('T')[0];
    const parts = clean.split(/[-/]/).map(Number);
    if (parts.length === 3) {
      if (parts[0] > 1000) {
        // YYYY-MM-DD
        joinUtc = Date.UTC(parts[0], parts[1] - 1, parts[2]);
      } else if (parts[2] > 1000) {
        // DD-MM-YYYY
        joinUtc = Date.UTC(parts[2], parts[1] - 1, parts[0]);
      }
    } else {
      const parsed = new Date(rawJoinDate);
      if (!isNaN(parsed.getTime())) {
        joinUtc = Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
      }
    }
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  // Inclusive days from joining date up to today (e.g. 1st Sep to 23rd Sep = 23 days)
  const totalDays = endUtc >= joinUtc ? Math.floor((endUtc - joinUtc) / msPerDay) + 1 : 1;
  const leaveDays = Math.max(0, Number(person.leaveDays) || (Array.isArray(person.leaveDates) ? person.leaveDates.length : 0));
  const activeWorkingDays = Math.max(0, totalDays - leaveDays);
  const daysSinceJoined = totalDays;

  // Check if person has a salary structure (Daily, Weekly, Monthly) configured, regardless of type
  const hasConfiguredSalary = Boolean(
    (person.salaryType && person.salaryType !== 'None') ||
    (person.salaryAmount && Number(person.salaryAmount) > 0)
  );
  const isEmployeeRole = person.type === 'Employee' || person.type === 'Staff' || person.type === 'Worker';
  const isEmployee = isEmployeeRole || hasConfiguredSalary;

  const effectiveSalaryType = (person.salaryType && person.salaryType !== 'None')
    ? person.salaryType
    : (isEmployee ? 'Monthly' : undefined);

  // If employee/staff/worker without configured salary, default to ₹30,000/mo or base monthly payroll
  const effectiveSalaryAmount = Number(person.salaryAmount) > 0
    ? Number(person.salaryAmount)
    : (isEmployee ? 30000 : 0);

  let totalSalary = 0;
  let salaryRateDescription = '';

  if (effectiveSalaryType && effectiveSalaryAmount > 0) {
    const rate = effectiveSalaryAmount;
    if (effectiveSalaryType === 'Daily') {
      totalSalary = activeWorkingDays * rate;
      salaryRateDescription = leaveDays > 0
        ? `₹${rate.toLocaleString('en-IN')}/day × ${activeWorkingDays}D (${leaveDays}D leave) = ₹${totalSalary.toLocaleString('en-IN')}`
        : `₹${rate.toLocaleString('en-IN')}/day × ${activeWorkingDays} days = ₹${totalSalary.toLocaleString('en-IN')}`;
    } else if (effectiveSalaryType === 'Weekly') {
      const dailyRate = rate / 7;
      totalSalary = Math.round(activeWorkingDays * dailyRate);
      salaryRateDescription = `₹${rate.toLocaleString('en-IN')}/wk · ${activeWorkingDays}D worked`;
    } else if (effectiveSalaryType === 'Monthly') {
      // Standard monthly payroll: Daily rate = rate / 30
      // Total salary from joining date to today = activeWorkingDays × (rate / 30)
      const dailyRate = rate / 30;
      totalSalary = Math.round(activeWorkingDays * dailyRate);
      salaryRateDescription = leaveDays > 0
        ? `₹${rate.toLocaleString('en-IN')}/mo · ${activeWorkingDays}D (${leaveDays}D leave)`
        : `₹${rate.toLocaleString('en-IN')}/mo · ${activeWorkingDays}D accrued`;
    }
  }

  let totalAmount = 0;
  let pendingAmount = 0;
  let status: 'to_receive' | 'to_pay' | 'settled' = 'settled';

  if (hasConfiguredSalary || isEmployeeRole) {
    // For anyone with salary / daily wage structure (Customer with daily wage, Employee, Staff, Worker, etc.):
    // Total Salary strictly reflects (joining date to today date salary) + opening balance
    totalAmount = Math.max(0, opening) + totalSalary;

    // Amount paid against salary: if paid is recorded under totalPaid or totalReceived (e.g. ₹500)
    const paidAgainstSalary = totalPaid > 0 ? totalPaid : (totalReceived > 0 ? totalReceived : 0);

    // Due salary: Total Salary - Paid Amount (e.g. 12000 - 500 = 11500)
    const diff = totalAmount - paidAgainstSalary;
    if (diff > 0) {
      status = 'to_pay'; // Due salary to pay to person
      pendingAmount = diff;
    } else if (diff < 0) {
      status = 'to_receive'; // Advance salary paid
      pendingAmount = Math.abs(diff);
    } else {
      status = 'settled';
      pendingAmount = 0;
    }
  } else if (person.type === 'Customer') {
    // Standard retail customer without salary structure:
    // Total amount billed / due is opening balance + business sales/incomes
    totalAmount = Math.max(0, opening) + personIncome;
    if (totalReceived > totalAmount && opening === 0 && personIncome === 0) {
      totalAmount = totalReceived;
    }

    // Pending amount = Total Amount minus Received Amount
    const diff = totalAmount - totalReceived;
    if (diff > 0) {
      status = 'to_receive';
      pendingAmount = diff;
    } else if (diff < 0) {
      status = 'to_pay'; // Advance received from customer
      pendingAmount = Math.abs(diff);
    } else {
      status = 'settled';
      pendingAmount = 0;
    }
  } else {
    // For Vendor/Other:
    totalAmount = Math.max(0, opening) + personExpenses;
    if (totalPaid > totalAmount && opening === 0 && personExpenses === 0) {
      totalAmount = totalPaid;
    }

    const diff = totalAmount - totalPaid;
    if (diff > 0) {
      status = 'to_pay';
      pendingAmount = diff;
    } else if (diff < 0) {
      status = 'to_receive';
      pendingAmount = Math.abs(diff);
    } else {
      status = 'settled';
      pendingAmount = 0;
    }
  }

  // Final paid figure for person with salary
  const effectivePaid = (hasConfiguredSalary || isEmployeeRole)
    ? (totalPaid > 0 ? totalPaid : totalReceived)
    : totalPaid;

  return {
    person,
    totalAmount,
    totalPaid: effectivePaid,
    totalReceived,
    pendingAmount,
    status,
    daysSinceJoined,
    activeWorkingDays,
    leaveDays,
    isClosed: person.status === 'Closed',
    isOnLeave: person.status === 'On Leave',
    accruedSalary: totalSalary,
    totalSalary,
    dueSalary: status === 'to_pay' ? pendingAmount : 0,
    remainingSalary: status === 'to_pay' ? pendingAmount : 0,
    salaryRateDescription,
  };
}

/**
 * Filter transactions for daily view
 */
export function getDailyMetrics(
  dateStr: string,
  incomeList: IncomeRecord[] = [],
  expenseList: ExpenseRecord[] = [],
  paymentList: PaymentRecord[] = []
) {
  const safeIncome = Array.isArray(incomeList) ? incomeList : [];
  const safeExpense = Array.isArray(expenseList) ? expenseList : [];
  const safePayment = Array.isArray(paymentList) ? paymentList : [];

  const dailyIncome = safeIncome
    .filter(item => item && item.date === dateStr)
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const dailyExpenses = safeExpense
    .filter(item => item && item.date === dateStr)
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const dailyPayments = safePayment
    .filter(item => item && item.date === dateStr)
    .reduce((acc, item) => acc + (Number(item?.amount) || 0), 0);

  const dailyBalance = dailyIncome - dailyExpenses;

  return {
    dailyIncome,
    dailyExpenses,
    dailyPayments,
    dailyBalance,
  };
}
