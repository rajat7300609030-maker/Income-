import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Filter,
  ArrowLeft,
  QrCode,
  Banknote,
  GraduationCap,
  Briefcase,
  Package,
  Landmark,
  Layers,
  Table,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Handshake,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../services/calculations';

export const ReportsView: React.FC = () => {
  const { transactions, totals, notify, goBack, openTransactionsWithPaymentMethod } = useApp();
  const [reportPeriod, setReportPeriod] = useState<'Monthly' | 'Yearly' | 'All' | 'Custom'>('Monthly');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  // Filtered transactions based on report period
  const activeTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    if (reportPeriod === 'All') {
      return list;
    }
    if (reportPeriod === 'Monthly') {
      const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "YYYY-MM"
      return list.filter(t => typeof t?.date === 'string' && t.date.startsWith(currentMonthPrefix));
    }
    if (reportPeriod === 'Yearly') {
      const currentYear = new Date().getFullYear().toString();
      return list.filter(t => typeof t?.date === 'string' && t.date.startsWith(currentYear));
    }
    return list.filter(t => typeof t?.date === 'string' && t.date >= customStart && t.date <= customEnd);
  }, [transactions, reportPeriod, customStart, customEnd]);

  // Core calculations for current report period
  const periodIncome = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [activeTransactions]);

  const periodExpense = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [activeTransactions]);

  const periodPayments = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'Payment')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [activeTransactions]);

  const periodPaymentsReceived = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'Payment' && t.paymentDirection === 'Received')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [activeTransactions]);

  const periodPaymentsPaid = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'Payment' && t.paymentDirection === 'Paid')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  }, [activeTransactions]);

  const periodNetBalance = periodIncome - periodExpense;
  const periodTotalOutflows = periodExpense + periodPayments;

  // Breakdown for UPI, Cash, School, Salary, Other, Bank
  const modesData = useMemo(() => {
    const list = [
      {
        id: 'UPI',
        name: 'UPI',
        subtitle: 'Digital & QR Payments',
        icon: QrCode,
        colorBg: 'bg-blue-50/80 dark:bg-blue-950/40',
        colorBorder: 'border-blue-200/80 dark:border-blue-800/60',
        colorText: 'text-blue-800 dark:text-blue-300',
        badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300',
        iconBox: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
      },
      {
        id: 'Cash',
        name: 'Cash',
        subtitle: 'Physical Cash In-Hand',
        icon: Banknote,
        colorBg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
        colorBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
        colorText: 'text-emerald-800 dark:text-emerald-300',
        badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300',
        iconBox: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
      },
      {
        id: 'School',
        name: 'School',
        subtitle: 'Education, College & Fees',
        icon: GraduationCap,
        colorBg: 'bg-teal-50/80 dark:bg-teal-950/40',
        colorBorder: 'border-teal-200/80 dark:border-teal-800/60',
        colorText: 'text-teal-800 dark:text-teal-300',
        badgeBg: 'bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300',
        iconBox: 'bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300',
      },
      {
        id: 'Salary',
        name: 'Salary',
        subtitle: 'Staff, Wages & Pension',
        icon: Briefcase,
        colorBg: 'bg-fuchsia-50/80 dark:bg-fuchsia-950/40',
        colorBorder: 'border-fuchsia-200/80 dark:border-fuchsia-800/60',
        colorText: 'text-fuchsia-800 dark:text-fuchsia-300',
        badgeBg: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/60 dark:text-fuchsia-300',
        iconBox: 'bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-700 dark:text-fuchsia-300',
      },
      {
        id: 'Other',
        name: 'Other',
        subtitle: 'Miscellaneous & Other Modes',
        icon: Package,
        colorBg: 'bg-slate-100/80 dark:bg-neutral-900/60',
        colorBorder: 'border-slate-200/80 dark:border-neutral-800',
        colorText: 'text-slate-800 dark:text-slate-200',
        badgeBg: 'bg-slate-200 text-slate-800 dark:bg-neutral-800 dark:text-slate-300',
        iconBox: 'bg-slate-200 dark:bg-neutral-800 text-slate-700 dark:text-slate-300',
      },
      {
        id: 'Bank',
        name: 'Bank',
        subtitle: 'Direct Account / NEFT / IMPS',
        icon: Landmark,
        colorBg: 'bg-cyan-50/80 dark:bg-cyan-950/40',
        colorBorder: 'border-cyan-200/80 dark:border-cyan-800/60',
        colorText: 'text-cyan-800 dark:text-cyan-300',
        badgeBg: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/60 dark:text-cyan-300',
        iconBox: 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300',
      },
    ];

    return list.map(mode => {
      const modeTx = activeTransactions.filter(t => t.paymentMethod === mode.id);

      const incomeAmt = modeTx
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const expenseAmt = modeTx
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const paymentAmt = modeTx
        .filter(t => t.type === 'Payment')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const paymentReceivedAmt = modeTx
        .filter(t => t.type === 'Payment' && t.paymentDirection === 'Received')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const paymentPaidAmt = modeTx
        .filter(t => t.type === 'Payment' && t.paymentDirection === 'Paid')
        .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

      const totalOutflow = expenseAmt + paymentAmt;
      const count = modeTx.length;

      // Also get all-time figures for comparison
      let allTimeExpense = 0;
      let allTimePayment = 0;
      let allTimeTotal = 0;
      let allTimeIncome = 0;

      if (mode.id === 'UPI') {
        allTimeExpense = totals.upiExpenses;
        allTimePayment = totals.upiPayments;
        allTimeTotal = totals.upiTotal;
        allTimeIncome = totals.upiIncome;
      } else if (mode.id === 'Cash') {
        allTimeExpense = totals.cashExpenses;
        allTimePayment = totals.cashPayments;
        allTimeTotal = totals.cashTotal;
        allTimeIncome = totals.cashIncome;
      } else if (mode.id === 'School') {
        allTimeExpense = totals.schoolExpenses;
        allTimePayment = totals.schoolPayments;
        allTimeTotal = totals.schoolTotal;
      } else if (mode.id === 'Salary') {
        allTimeExpense = totals.salaryExpenses;
        allTimePayment = totals.salaryPayments;
        allTimeTotal = totals.salaryTotal;
      } else if (mode.id === 'Other') {
        allTimeExpense = totals.otherExpenses;
        allTimePayment = totals.otherPayments;
        allTimeTotal = totals.otherTotal;
      } else if (mode.id === 'Bank') {
        allTimeExpense = totals.bankExpenses;
        allTimePayment = totals.bankPayments;
        allTimeTotal = totals.bankTotal;
        allTimeIncome = totals.pureBankIncome;
      }

      return {
        ...mode,
        incomeAmt,
        expenseAmt,
        paymentAmt,
        paymentReceivedAmt,
        paymentPaidAmt,
        totalOutflow,
        count,
        allTimeExpense,
        allTimePayment,
        allTimeTotal,
        allTimeIncome,
      };
    });
  }, [activeTransactions, totals]);

  // Category-wise Expense Breakdown
  const categoryBreakdown = useMemo(() => {
    const map: { [cat: string]: number } = {};
    activeTransactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        const cat = t.category || 'General Expense';
        map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
      });

    const entries = Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: periodExpense > 0 ? Math.round((amount / periodExpense) * 100) : 0,
    }));

    return entries.sort((a, b) => b.amount - a.amount);
  }, [activeTransactions, periodExpense]);

  // Export to CSV functionality with complete details
  const handleExportCSV = () => {
    if (activeTransactions.length === 0) {
      notify('No transactions to export for this period', 'error');
      return;
    }

    const periodLabel = reportPeriod === 'All' ? 'All-Time' : reportPeriod;

    // Header section
    const summaryLines = [
      `"FINANCIAL STATEMENT & SUMMARY REPORT - ${periodLabel.toUpperCase()}"`,
      `"Generated On","${new Date().toLocaleString('en-IN')}"`,
      `"Total Income (INR)","${periodIncome}"`,
      `"Total Expense (INR)","${periodExpense}"`,
      `"Net Balance (INR)","${periodNetBalance}"`,
      `"Total Payments (INR)","${periodPayments}"`,
      `"Total Outflows (INR)","${periodTotalOutflows}"`,
      '',
      '"MODE & CHANNEL SUMMARY BREAKDOWN"',
      '"Mode / Category","Income (INR)","Expense (INR)","Payments (INR)","Total Outflow (INR)","All-Time Total (INR)"',
      ...modesData.map(m =>
        `"${m.name}","${m.incomeAmt}","${m.expenseAmt}","${m.paymentAmt}","${m.totalOutflow}","${m.allTimeTotal}"`
      ),
      '',
      '"DETAILED TRANSACTION LEDGER"',
      '"Date","Type","Person / Category","Payment Method","Amount (INR)","Note"',
    ];

    const txRows = activeTransactions.map(t =>
      `"${t.date}","${t.type}","${(t.personName || t.category || '').replace(/"/g, '""')}","${t.paymentMethod}","${t.amount}","${(t.note || '').replace(/"/g, '""')}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [...summaryLines, ...txRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${reportPeriod.toLowerCase()}_details.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Comprehensive CSV Report downloaded successfully', 'success');
  };

  // Export to PDF / Printable statement with all UPI, Cash, School, Salary, Other figures
  const handleExportPDF = () => {
    if (activeTransactions.length === 0) {
      notify('No transactions to export for this period', 'error');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      notify('Pop-up was blocked. Please allow pop-ups to print/export PDF.', 'error');
      return;
    }

    const periodLabel = reportPeriod === 'All' ? 'All-Time Lifetime' : `${reportPeriod} Statement`;

    // Mode rows HTML
    const modeRowsHtml = modesData
      .map(
        m => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 11px;">
        <td style="padding: 7px 10px; font-weight: bold; color: #1e293b;">${m.name}</td>
        <td style="padding: 7px 10px; text-align: right; color: #059669; font-weight: 600;">₹${m.incomeAmt.toLocaleString('en-IN')}</td>
        <td style="padding: 7px 10px; text-align: right; color: #e11d48; font-weight: 600;">₹${m.expenseAmt.toLocaleString('en-IN')}</td>
        <td style="padding: 7px 10px; text-align: right; color: #d97706; font-weight: 600;">₹${m.paymentAmt.toLocaleString('en-IN')}</td>
        <td style="padding: 7px 10px; text-align: right; color: #2563eb; font-weight: bold;">₹${m.totalOutflow.toLocaleString('en-IN')}</td>
        <td style="padding: 7px 10px; text-align: right; color: #475569; font-weight: bold;">₹${m.allTimeTotal.toLocaleString('en-IN')}</td>
      </tr>
    `
      )
      .join('');

    // Transaction rows HTML (up to 300 rows for print safety)
    const rowsHtml = activeTransactions
      .slice(0, 300)
      .map(
        t => `
      <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11px;">
        <td style="padding: 6px 8px;">${t.date}</td>
        <td style="padding: 6px 8px; font-weight: bold; color: ${
          t.type === 'Income' ? '#059669' : t.type === 'Expense' ? '#e11d48' : '#d97706'
        };">${t.type}</td>
        <td style="padding: 6px 8px;">${t.personName || t.category || '-'}</td>
        <td style="padding: 6px 8px; font-weight: 500;">${t.paymentMethod}</td>
        <td style="padding: 6px 8px; text-align: right; font-weight: bold;">₹${t.amount.toLocaleString('en-IN')}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Financial Report - ${periodLabel}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 28px; color: #0f172a; line-height: 1.4; }
            h1 { color: #1e3a8a; margin: 0 0 4px 0; font-size: 22px; font-weight: 800; }
            .header-bar { display: flex; justify-content: space-between; border-bottom: 3px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }
            .metric-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; text-align: center; }
            .section-title { font-size: 13px; font-weight: 800; color: #1e293b; text-transform: uppercase; margin: 20px 0 8px 0; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 20px; }
            th { background: #f1f5f9; text-align: left; padding: 8px 10px; font-size: 10.5px; text-transform: uppercase; color: #475569; font-weight: 700; border-bottom: 2px solid #cbd5e1; }
            .total-row { background: #f8fafc; font-weight: bold; border-top: 2px solid #94a3b8; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1>Financial Statement & Details</h1>
              <p style="color: #64748b; font-size: 12px; margin: 0;">Comprehensive Ledger Report • ${periodLabel}</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #64748b;">
              Generated on: <strong>${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          </div>

          <div class="metric-grid">
            <div class="metric-box">
              <div style="font-size: 10px; color: #059669; font-weight: 700;">TOTAL INCOME</div>
              <div style="font-size: 17px; font-weight: 800; color: #059669; margin-top: 2px;">₹${periodIncome.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 10px; color: #e11d48; font-weight: 700;">TOTAL EXPENSE</div>
              <div style="font-size: 17px; font-weight: 800; color: #e11d48; margin-top: 2px;">₹${periodExpense.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 10px; color: #d97706; font-weight: 700;">TOTAL PAYMENTS</div>
              <div style="font-size: 17px; font-weight: 800; color: #d97706; margin-top: 2px;">₹${periodPayments.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 10px; color: #2563eb; font-weight: 700;">NET BALANCE</div>
              <div style="font-size: 17px; font-weight: 800; color: #2563eb; margin-top: 2px;">₹${periodNetBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div class="section-title">UPI, Cash, School, Salary, Other & Bank Details</div>
          <table>
            <thead>
              <tr>
                <th>Mode / Channel</th>
                <th style="text-align: right;">Income (₹)</th>
                <th style="text-align: right;">Expense (₹)</th>
                <th style="text-align: right;">Payments (₹)</th>
                <th style="text-align: right;">Total Outflow (₹)</th>
                <th style="text-align: right;">All-Time Outflow (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${modeRowsHtml}
              <tr class="total-row">
                <td style="padding: 8px 10px;">GRAND TOTAL</td>
                <td style="padding: 8px 10px; text-align: right; color: #059669;">₹${periodIncome.toLocaleString('en-IN')}</td>
                <td style="padding: 8px 10px; text-align: right; color: #e11d48;">₹${periodExpense.toLocaleString('en-IN')}</td>
                <td style="padding: 8px 10px; text-align: right; color: #d97706;">₹${periodPayments.toLocaleString('en-IN')}</td>
                <td style="padding: 8px 10px; text-align: right; color: #2563eb;">₹${periodTotalOutflows.toLocaleString('en-IN')}</td>
                <td style="padding: 8px 10px; text-align: right; color: #0f172a;">₹${(totals.totalExpenses + totals.totalPayments).toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div class="section-title">Transaction Records (${activeTransactions.length} items)</div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Party / Category</th>
                <th>Mode</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
    notify('Print / PDF statement dialog launched', 'info');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white dark:bg-black px-4 pt-3 pb-3 border-b border-slate-100 dark:border-neutral-800 shrink-0 space-y-3 shadow-2xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight">Financial Reports</h2>
              <p className="text-xs text-slate-400">Total Income, Expense, UPI, Cash, School, Salary & Other Details</p>
            </div>
          </div>
        </div>

        {/* Period Selector: This Month / This Year / All-Time / Custom */}
        <div className="grid grid-cols-4 bg-slate-100 dark:bg-neutral-900 p-1 rounded-xl border border-slate-200/60 dark:border-neutral-800 gap-1">
          {([
            { id: 'Monthly', label: 'Month' },
            { id: 'Yearly', label: 'Year' },
            { id: 'All', label: 'All-Time' },
            { id: 'Custom', label: 'Custom' },
          ] as const).map(p => (
            <motion.button
              key={p.id}
              id={`report-period-${p.id.toLowerCase()}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setReportPeriod(p.id)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                reportPeriod === p.id
                  ? 'bg-white dark:bg-black text-blue-700 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              {p.label}
            </motion.button>
          ))}
        </div>

        {/* Custom Range Picker if active */}
        {reportPeriod === 'Custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-2 gap-2 pt-1"
          >
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-neutral-900 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5 font-bold uppercase">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-neutral-800 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-neutral-900 outline-none"
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Scrollable Report Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Financial Metrics: Total Income, Total Expense, Net Balance, Total Payments */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          {/* Total Income */}
          <motion.div
            id="report-total-income-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-emerald-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                Total Income
              </span>
              <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                <ArrowDownLeft className="w-3 h-3" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 text-left">
              {formatINR(periodIncome)}
            </p>
            <p className="text-[9.5px] text-slate-400 text-left mt-0.5">
              All money inflows
            </p>
          </motion.div>

          {/* Total Expense */}
          <motion.div
            id="report-total-expense-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-rose-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
                Total Expense
              </span>
              <div className="w-5 h-5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 flex items-center justify-center">
                <ArrowUpRight className="w-3 h-3" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 text-left">
              {formatINR(periodExpense)}
            </p>
            <p className="text-[9.5px] text-slate-400 text-left mt-0.5">
              Direct expenditures
            </p>
          </motion.div>

          {/* Total Payments */}
          <motion.div
            id="report-total-payments-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-amber-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                Total Payments
              </span>
              <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Handshake className="w-3 h-3" />
              </div>
            </div>
            <p className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 text-left">
              {formatINR(periodPayments)}
            </p>
            <p className="text-[9.5px] text-slate-400 text-left mt-0.5">
              Paid: {formatINR(periodPaymentsPaid)}
            </p>
          </motion.div>

          {/* Net Balance */}
          <motion.div
            id="report-net-balance-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white dark:bg-black p-3 rounded-2xl border border-blue-100 dark:border-neutral-800 shadow-xs hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                Net Balance
              </span>
              <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Wallet className="w-3 h-3" />
              </div>
            </div>
            <p
              className={`text-base sm:text-lg font-black text-left ${
                periodNetBalance >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              {formatINR(periodNetBalance)}
            </p>
            <p className="text-[9.5px] text-slate-400 text-left mt-0.5">
              Income - Expense
            </p>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* PAYMENT MODES & CHANNELS: UPI, CASH, SCHOOL, SALARY, OTHER ALL DETAILS */}
        {/* ------------------------------------------------------------------ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="bg-white dark:bg-black p-4 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-2">
                <span>All Mode Details</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-[9px] font-extrabold text-blue-700 dark:text-blue-300">
                  UPI • CASH • SCHOOL • SALARY • OTHER
                </span>
              </h3>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                Detailed Payments, Expenses, Income and Total Outflows
              </p>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Outflows ({reportPeriod})</span>
              <span className="text-xs font-black text-blue-700 dark:text-blue-400">
                {formatINR(periodTotalOutflows)}
              </span>
            </div>
          </div>

          {/* Quick Aggregate Ribbon */}
          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200/70 dark:border-neutral-800 text-center">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Payments</span>
              <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                {formatINR(periodPayments)}
              </span>
            </div>
            <div className="border-x border-slate-200 dark:border-neutral-800">
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Expenses</span>
              <span className="text-xs font-black text-rose-600 dark:text-rose-400">
                {formatINR(periodExpense)}
              </span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase block">Total Outflows</span>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                {formatINR(periodTotalOutflows)}
              </span>
            </div>
          </div>

          {/* Mode Detail Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
            {modesData.map(m => {
              const IconComp = m.icon;
              return (
                <motion.div
                  key={m.id}
                  id={`report-mode-card-${m.id.toLowerCase()}`}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openTransactionsWithPaymentMethod(m.id as any)}
                  className={`p-3 rounded-2xl ${m.colorBg} border ${m.colorBorder} hover:shadow-md transition-all cursor-pointer group`}
                  title={`${m.name}: Tap to filter transactions`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-7 h-7 rounded-xl ${m.iconBox} flex items-center justify-center shrink-0 shadow-2xs`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight">
                          {m.name}
                        </h4>
                        <span className="text-[9.5px] text-slate-400">{m.subtitle}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${m.badgeBg}`}>
                      {m.count} txns
                    </span>
                  </div>

                  {/* Main Metric: Total Outflow Amount for period */}
                  <div className="bg-white/80 dark:bg-black/60 rounded-xl p-2.5 border border-slate-200/50 dark:border-neutral-800/80 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold text-slate-500 uppercase">Total Amount ({reportPeriod})</span>
                      <span className="text-[9px] font-semibold text-slate-400">Outflows</span>
                    </div>
                    <p className={`text-base font-black ${m.colorText} tracking-tight mt-0.5`}>
                      {formatINR(m.totalOutflow)}
                    </p>
                  </div>

                  {/* Sub-breakdown rows */}
                  <div className="space-y-1 text-[10px] font-medium pt-1 border-t border-slate-200/60 dark:border-neutral-800/80">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Payments ({reportPeriod}):</span>
                      <strong className="text-amber-700 dark:text-amber-400 font-bold">{formatINR(m.paymentAmt)}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Expenses ({reportPeriod}):</span>
                      <strong className="text-rose-700 dark:text-rose-400 font-bold">{formatINR(m.expenseAmt)}</strong>
                    </div>
                    {m.incomeAmt > 0 && (
                      <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                        <span>Income Inflow:</span>
                        <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{formatINR(m.incomeAmt)}</strong>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-400 pt-0.5 border-t border-dashed border-slate-200/60 dark:border-neutral-800/60 text-[9px]">
                      <span>All-Time Outflow:</span>
                      <span className="font-extrabold text-slate-700 dark:text-slate-300">{formatINR(m.allTimeTotal)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Comprehensive Details Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="bg-white dark:bg-black p-4 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-xs overflow-hidden"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                Full Financial Summary Table
              </h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400">
              Period: {reportPeriod}
            </span>
          </div>

          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-neutral-800 text-[10px] font-bold uppercase text-slate-400">
                  <th className="pb-2">Mode / Channel</th>
                  <th className="pb-2 text-right text-emerald-700 dark:text-emerald-400">Income (₹)</th>
                  <th className="pb-2 text-right text-rose-700 dark:text-rose-400">Expenses (₹)</th>
                  <th className="pb-2 text-right text-amber-700 dark:text-amber-400">Payments (₹)</th>
                  <th className="pb-2 text-right text-blue-700 dark:text-blue-400">Total Outflow (₹)</th>
                  <th className="pb-2 text-right text-slate-600 dark:text-slate-300">All-Time Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-neutral-850">
                {modesData.map(m => (
                  <tr
                    key={m.id}
                    onClick={() => openTransactionsWithPaymentMethod(m.id as any)}
                    className="hover:bg-slate-50 dark:hover:bg-neutral-900/60 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span>{m.name}</span>
                    </td>
                    <td className="py-2.5 text-right font-medium text-emerald-600 dark:text-emerald-400">
                      {formatINR(m.incomeAmt)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-rose-600 dark:text-rose-400">
                      {formatINR(m.expenseAmt)}
                    </td>
                    <td className="py-2.5 text-right font-medium text-amber-600 dark:text-amber-400">
                      {formatINR(m.paymentAmt)}
                    </td>
                    <td className="py-2.5 text-right font-black text-blue-700 dark:text-blue-300">
                      {formatINR(m.totalOutflow)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-slate-700 dark:text-slate-300">
                      {formatINR(m.allTimeTotal)}
                    </td>
                  </tr>
                ))}
                {/* Total Summary Row */}
                <tr className="bg-slate-50/90 dark:bg-neutral-900/80 font-black text-slate-900 dark:text-slate-100 border-t-2 border-slate-200 dark:border-neutral-700">
                  <td className="py-3 uppercase text-[10.5px]">GRAND TOTAL</td>
                  <td className="py-3 text-right text-emerald-700 dark:text-emerald-400">
                    {formatINR(periodIncome)}
                  </td>
                  <td className="py-3 text-right text-rose-700 dark:text-rose-400">
                    {formatINR(periodExpense)}
                  </td>
                  <td className="py-3 text-right text-amber-700 dark:text-amber-400">
                    {formatINR(periodPayments)}
                  </td>
                  <td className="py-3 text-right text-blue-700 dark:text-blue-300 text-sm font-black">
                    {formatINR(periodTotalOutflows)}
                  </td>
                  <td className="py-3 text-right text-slate-800 dark:text-slate-200 text-sm font-black">
                    {formatINR(totals.totalExpenses + totals.totalPayments)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Visual Comparison: Income vs Expense */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white dark:bg-black p-4 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Inflow vs Outflow Ratio</span>
            </h4>
            <span className="text-[10px] font-semibold text-slate-400">
              Savings Ratio: {periodIncome > 0 ? Math.max(0, Math.round((periodNetBalance / periodIncome) * 100)) : 0}%
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>Inflows (Income)</span>
                <span className="text-emerald-600">{formatINR(periodIncome)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${periodIncome + periodExpense > 0 ? (periodIncome / (periodIncome + periodExpense)) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">
                <span>Outflows (Expenses)</span>
                <span className="text-rose-600">{formatINR(periodExpense)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${periodIncome + periodExpense > 0 ? (periodExpense / (periodIncome + periodExpense)) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category-wise Expense Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="bg-white dark:bg-black p-4 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-xs"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
              <PieChart className="w-4 h-4 text-purple-600" />
              <span>Category-wise Expense Breakdown</span>
            </h4>
          </div>

          {categoryBreakdown.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">No expense items logged for this period</p>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map((item, index) => {
                const colors = ['bg-rose-500', 'bg-amber-500', 'bg-purple-500', 'bg-blue-500', 'bg-teal-500'];
                const barColor = colors[index % colors.length];

                return (
                  <motion.div
                    key={`${item.name || 'cat'}-${index}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + index * 0.04 }}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                      <div className="space-x-2 text-right">
                        <span className="text-[11px] text-slate-400">{item.percentage}%</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-bold">{formatINR(item.amount)}</strong>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-neutral-900 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 + index * 0.05 }}
                        className={`h-full rounded-full ${barColor}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Export Options: Export as PDF & Export as CSV */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-black p-4 rounded-3xl border border-slate-100 dark:border-neutral-800 shadow-xs space-y-2.5 hover:shadow-md transition-all"
        >
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Export Statements &amp; Reports
          </h4>
          <p className="text-xs text-slate-400">Download formatted financial statement including all UPI, Cash, School, Salary &amp; Other details</p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <motion.button
              id="report-export-pdf"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExportPDF}
              className="py-3 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-rose-600" />
              <span>Export as PDF</span>
            </motion.button>

            <motion.button
              id="report-export-csv"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExportCSV}
              className="py-3 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-neutral-900 dark:hover:bg-neutral-850 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export as CSV</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
