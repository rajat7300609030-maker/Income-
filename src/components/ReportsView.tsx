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
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../services/calculations';

export const ReportsView: React.FC = () => {
  const { transactions, income, expenses, payments, totals, notify, setCurrentView, goBack } = useApp();
  const [reportPeriod, setReportPeriod] = useState<'Monthly' | 'Yearly' | 'Custom'>('Monthly');
  const [customStart, setCustomStart] = useState('2026-09-01');
  const [customEnd, setCustomEnd] = useState('2026-09-30');

  // Filtered transactions based on report period
  const activeTransactions = useMemo(() => {
    const list = Array.isArray(transactions) ? transactions : [];
    if (reportPeriod === 'Monthly') {
      const currentMonthPrefix = new Date().toISOString().substring(0, 7); // "2026-09"
      return list.filter(t => typeof t?.date === 'string' && t.date.startsWith(currentMonthPrefix));
    }
    if (reportPeriod === 'Yearly') {
      const currentYear = new Date().getFullYear().toString();
      return list.filter(t => typeof t?.date === 'string' && t.date.startsWith(currentYear));
    }
    return list.filter(t => typeof t?.date === 'string' && t.date >= customStart && t.date <= customEnd);
  }, [transactions, reportPeriod, customStart, customEnd]);

  // Calculations for current report period
  const periodIncome = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'Income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [activeTransactions]);

  const periodExpense = useMemo(() => {
    return activeTransactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [activeTransactions]);

  const periodNetBalance = periodIncome - periodExpense;

  // Category-wise Expense Breakdown
  const categoryBreakdown = useMemo(() => {
    const map: { [cat: string]: number } = {};
    activeTransactions
      .filter(t => t.type === 'Expense')
      .forEach(t => {
        const cat = t.category || 'Other Expense';
        map[cat] = (map[cat] || 0) + t.amount;
      });

    const entries = Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
      percentage: periodExpense > 0 ? Math.round((amount / periodExpense) * 100) : 0,
    }));

    return entries.sort((a, b) => b.amount - a.amount);
  }, [activeTransactions, periodExpense]);

  // Export to CSV functionality
  const handleExportCSV = () => {
    if (activeTransactions.length === 0) {
      notify('No transactions to export for this period', 'error');
      return;
    }

    const headers = ['Date', 'Type', 'Person / Category', 'Payment Method', 'Amount (INR)', 'Note'];
    const rows = activeTransactions.map(t => [
      t.date,
      t.type,
      `"${(t.personName || t.category || '').replace(/"/g, '""')}"`,
      t.paymentMethod,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${reportPeriod.toLowerCase()}_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('CSV Report downloaded successfully', 'success');
  };

  // Export to PDF / Printable statement
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

    const rowsHtml = activeTransactions
      .map(
        t => `
      <tr style="border-bottom: 1px solid #e2e8f0; font-size: 12px;">
        <td style="padding: 8px;">${t.date}</td>
        <td style="padding: 8px; font-weight: bold; color: ${
          t.type === 'Income' ? '#059669' : t.type === 'Expense' ? '#e11d48' : '#2563eb'
        };">${t.type}</td>
        <td style="padding: 8px;">${t.personName || t.category || '-'}</td>
        <td style="padding: 8px;">${t.paymentMethod}</td>
        <td style="padding: 8px; text-align: right; font-weight: bold;">₹${t.amount.toLocaleString('en-IN')}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Income & Expense Report - ${reportPeriod}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #1e293b; }
            h1 { color: #1d4ed8; margin-bottom: 4px; }
            .header-bar { display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 12px; margin-bottom: 20px; }
            .metric-box { display: inline-block; width: 30%; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-right: 2%; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f1f5f9; text-align: left; padding: 10px 8px; font-size: 11px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1>Income & Expense Tracker</h1>
              <p style="color: #64748b; font-size: 13px; margin: 0;">Financial Statement • ${reportPeriod} Report</p>
            </div>
            <div style="text-align: right; font-size: 12px; color: #64748b;">
              Generated on: ${new Date().toLocaleDateString('en-IN')}
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <div class="metric-box">
              <div style="font-size: 11px; color: #059669; font-weight: bold;">TOTAL INCOME</div>
              <div style="font-size: 18px; font-weight: bold; color: #059669;">₹${periodIncome.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 11px; color: #e11d48; font-weight: bold;">TOTAL EXPENSE</div>
              <div style="font-size: 18px; font-weight: bold; color: #e11d48;">₹${periodExpense.toLocaleString('en-IN')}</div>
            </div>
            <div class="metric-box">
              <div style="font-size: 11px; color: #2563eb; font-weight: bold;">NET BALANCE</div>
              <div style="font-size: 18px; font-weight: bold; color: #2563eb;">₹${periodNetBalance.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <h3>Transaction Breakdown (${activeTransactions.length} records)</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Party / Category</th>
                <th>Mode</th>
                <th style="text-align: right;">Amount</th>
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
    notify('Print/PDF export dialog launched', 'info');
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white px-4 pt-3 pb-3 border-b border-slate-100 shrink-0 space-y-3 shadow-2xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={goBack}
              className="p-1.5 -ml-1.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
              title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
            <div>
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Financial Reports</h2>
              <p className="text-xs text-slate-400">Analytical summaries & exportable statements</p>
            </div>
          </div>
        </div>

        {/* Period Selector: Monthly / Yearly / Custom */}
        <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl">
          {(['Monthly', 'Yearly', 'Custom'] as const).map(p => (
            <motion.button
              key={p}
              id={`report-period-${p.toLowerCase()}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setReportPeriod(p)}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                reportPeriod === p
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p === 'Monthly' ? "This Month" : p === 'Yearly' ? "This Year" : 'Custom Range'}
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
              <label className="text-[10px] text-slate-400 block mb-0.5">Start Date</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">End Date</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-slate-50"
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Scrollable Report Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Metric Cards: Total Income, Total Expense, Net Balance */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
          >
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
              Income
            </span>
            <p className="text-sm font-black text-emerald-600 mt-1">{formatINR(periodIncome)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
          >
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
              Expense
            </span>
            <p className="text-sm font-black text-rose-600 mt-1">{formatINR(periodExpense)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
          >
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
              Net Balance
            </span>
            <p
              className={`text-sm font-black mt-1 ${
                periodNetBalance >= 0 ? 'text-blue-700' : 'text-rose-700'
              }`}
            >
              {formatINR(periodNetBalance)}
            </p>
          </motion.div>
        </div>

        {/* Visual Chart: Income vs Expense Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -1 }}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Income vs Expense Comparison
            </h4>
            <span className="text-[10px] font-semibold text-slate-400">
              Savings Ratio: {periodIncome > 0 ? Math.max(0, Math.round((periodNetBalance / periodIncome) * 100)) : 0}%
            </span>
          </div>

          {/* Ratio bar visual */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Inflows (Income)</span>
                <span className="text-emerald-600">{formatINR(periodIncome)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
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
              <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                <span>Outflows (Expense)</span>
                <span className="text-rose-600">{formatINR(periodExpense)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
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
          transition={{ delay: 0.25 }}
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Category-wise Expense Breakdown
            </h4>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.4 }}
            >
              <PieChart className="w-4 h-4 text-slate-400" />
            </motion.div>
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
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <div className="space-x-2 text-right">
                        <span className="text-[11px] text-slate-400">{item.percentage}%</span>
                        <strong className="text-slate-800 font-bold">{formatINR(item.amount)}</strong>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
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
          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-2.5 hover:shadow-md transition-all"
        >
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Export Options
          </h4>
          <p className="text-xs text-slate-400">Download formatted financial statements</p>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <motion.button
              id="report-export-pdf"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExportPDF}
              className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: -8 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <FileText className="w-4 h-4 text-rose-600" />
              </motion.div>
              <span>Export as PDF</span>
            </motion.button>

            <motion.button
              id="report-export-csv"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleExportCSV}
              className="py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 8 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              </motion.div>
              <span>Export as CSV</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
