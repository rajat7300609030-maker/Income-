import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Phone,
  MapPin,
  Edit2,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Handshake,
  MessageSquare,
  Plus,
  Receipt,
  FileText,
  Briefcase,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
  Palmtree,
  Lock,
  Unlock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculatePersonSummary, formatINR } from '../services/calculations';
import { PersonLeaveModal } from './PersonLeaveModal';
import { PersonClosedModal } from './PersonClosedModal';

export const PersonProfileModal: React.FC = () => {
  const {
    selectedPersonForProfile,
    setSelectedPersonForProfile,
    income,
    expenses,
    payments,
    transactions,
    startEditItem,
    openDeleteConfirm,
    deletePerson,
    showPersonDeleteBlocked,
    openPaymentForPerson,
    startSettlePaymentForPerson,
    updatePersonLeave,
    updatePersonClosed,
  } = useApp();

  const [activeMetricTab, setActiveMetricTab] = useState<'all' | 'paid' | 'received' | 'pending'>('all');
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isClosedModalOpen, setIsClosedModalOpen] = useState(false);

  const person = selectedPersonForProfile;

  const summary = useMemo(() => {
    if (!person) return null;
    return calculatePersonSummary(person, income, expenses, payments);
  }, [person, income, expenses, payments]);

  // Transactions belonging specifically to this person
  const personTransactions = useMemo(() => {
    if (!person) return [];
    return transactions.filter(t => t.personId === person.id);
  }, [person, transactions]);

  // Filtered transactions based on clicked metric card
  const filteredPersonTransactions = useMemo(() => {
    if (!personTransactions) return [];
    if (activeMetricTab === 'paid') {
      return personTransactions.filter(
        t => t.paymentDirection === 'Paid' || t.type === 'Expense'
      );
    }
    if (activeMetricTab === 'received') {
      return personTransactions.filter(
        t => t.paymentDirection === 'Received' || t.type === 'Income'
      );
    }
    return personTransactions;
  }, [personTransactions, activeMetricTab]);

  const initials = (person?.name || 'User')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0] || '')
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'U';

  const handleEdit = () => {
    if (person) {
      startEditItem({ type: 'person', data: person });
    }
  };

  const handleDelete = () => {
    if (!person || !summary) return;

    // Strict validation: Prevent deletion if any payment or balance is pending / due
    if (summary.pendingAmount > 0 || summary.status !== 'settled') {
      showPersonDeleteBlocked(person, summary);
      return;
    }

    openDeleteConfirm(
      `Delete ${person.name}?`,
      'This will move this person to Recycle Bin (auto-purged in 15 days). Associated transaction records will remain.',
      () => {
        deletePerson(person.id);
        setSelectedPersonForProfile(null);
      }
    );
  };

  const isEmployeeRole = person ? (person.type === 'Employee' || person.type === 'Staff' || person.type === 'Worker') : false;
  const hasSalaryStructure = person ? (isEmployeeRole || Boolean(person.salaryAmount && person.salaryAmount > 0)) : false;

  return (
    <>
      <AnimatePresence>
        {person && summary && (
          <motion.div
            key="person-profile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs"
          >
            <motion.div
              key="person-profile-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-md bg-slate-50 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header & Avatar Info */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 relative">
            <button
              id="person-profile-close"
              onClick={() => setSelectedPersonForProfile(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-white text-blue-800 flex items-center justify-center text-xl font-extrabold shadow-lg shrink-0">
                {initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-white tracking-tight truncate">
                    {person.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white uppercase tracking-wider">
                    {person.type}
                  </span>
                  {person.status === 'Closed' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900/80 text-white flex items-center space-x-1 border border-white/20">
                      <Lock className="w-3 h-3 text-slate-300" />
                      <span>Closed</span>
                    </span>
                  ) : person.status === 'On Leave' ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center space-x-1 shadow-2xs font-black">
                      <Palmtree className="w-3 h-3 text-amber-900" />
                      <span>
                        On Leave (
                        {person.leaveStartDate && person.leaveEndDate
                          ? `${new Date(person.leaveStartDate + 'T00:00:00').toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })} - ${new Date(person.leaveEndDate + 'T00:00:00').toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })} • ${person.leaveDays || 1}D`
                          : `${person.leaveDays || 0}D`}
                        )
                      </span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/80 text-white border border-emerald-400/40">
                      Active
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1.5 text-blue-100 text-xs mt-1">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{person.mobile}</span>
                </div>

                {person.address && (
                  <div className="flex items-center space-x-1.5 text-blue-200 text-xs mt-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{person.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Action Buttons for Person with Colorful Icons */}
            <div className="mt-4 flex items-center space-x-2 pt-2 border-t border-white/15">
              <motion.button
                id="person-profile-edit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleEdit}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-blue-900/40 border border-blue-400/40"
              >
                <motion.div whileHover={{ rotate: 15 }}>
                  <Edit2 className="w-3.5 h-3.5 text-amber-300 drop-shadow-xs" />
                </motion.div>
                <span>Edit Profile</span>
              </motion.button>

              <motion.button
                id="person-profile-delete"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleDelete}
                className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-rose-950/40 border border-rose-400/40"
              >
                <motion.div whileHover={{ scale: 1.2, rotate: 10 }}>
                  <Trash2 className="w-3.5 h-3.5 text-rose-100 drop-shadow-xs" />
                </motion.div>
                <span>Delete</span>
              </motion.button>
            </div>
          </div>

          {/* Scrollable Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Three Functional Financial Options: Total Amount, Paid OR Received (Only one), and Pending Amount */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Financial Ledger (Click to Filter)
                </span>
                {activeMetricTab !== 'all' && (
                  <button
                    onClick={() => setActiveMetricTab('all')}
                    className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md"
                  >
                    Reset Filter (Show All)
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Total Amount Card (Joined Date to Today) */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveMetricTab(activeMetricTab === 'all' ? 'all' : 'all')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    activeMetricTab === 'all'
                      ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span className="flex items-center space-x-1">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{hasSalaryStructure ? 'Total Salary' : 'Total Amount'}</span>
                    </span>
                    {activeMetricTab === 'all' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <p className="text-base font-black text-slate-900 mt-1">
                    {formatINR(summary.totalAmount)}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[9px]">
                    <span className="text-blue-600 font-bold truncate mr-1">
                      {hasSalaryStructure
                        ? (summary.salaryRateDescription || 'Total Salary')
                        : 'Accrued Ledger'}
                    </span>
                    <span className="text-slate-400 font-medium shrink-0">All Ledger →</span>
                  </div>
                </motion.div>

                {/* 2. ONLY ONE OPTION: Total Received (for Customer) OR Total Paid (for Employee/Other) */}
                {person.type === 'Customer' ? (
                  /* Customer: Show Received Amount */
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveMetricTab(activeMetricTab === 'received' ? 'all' : 'received')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      activeMetricTab === 'received'
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-100 shadow-xs hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Received Amount</span>
                      </span>
                      {activeMetricTab === 'received' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <p className="text-base font-black text-emerald-700 mt-1">
                      {formatINR(summary.totalReceived)}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-emerald-600">
                      <span>Received from customer</span>
                      <span className="font-bold underline">Filter</span>
                    </div>
                  </motion.div>
                ) : (
                  /* Employee / Staff / Worker / Other: Show Paid Amount */
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveMetricTab(activeMetricTab === 'paid' ? 'all' : 'paid')}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                      activeMetricTab === 'paid'
                        ? 'bg-blue-50/80 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-100 shadow-xs hover:border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                      <span className="flex items-center space-x-1">
                        <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
                        <span>{hasSalaryStructure ? 'Paid Salary' : 'Paid Amount'}</span>
                      </span>
                      {activeMetricTab === 'paid' && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-base font-black text-blue-700 mt-1">
                      {formatINR(summary.totalPaid)}
                    </p>
                    <div className="flex items-center justify-between mt-1 text-[9px] text-blue-600">
                      <span>{hasSalaryStructure ? `Paid to ${person.type.toLowerCase()}` : 'Outflow paid'}</span>
                      <span className="font-bold underline">Filter</span>
                    </div>
                  </motion.div>
                )}

                {/* 3. Remaining Salary / Pending Amount Card */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveMetricTab(activeMetricTab === 'pending' ? 'all' : 'pending')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative ${
                    activeMetricTab === 'pending'
                      ? 'bg-red-50/90 border-red-500 shadow-md ring-2 ring-red-500/20'
                      : summary.status === 'to_receive'
                      ? 'bg-red-50/40 border-red-200 hover:border-red-300 shadow-xs'
                      : summary.status === 'to_pay'
                      ? 'bg-red-50/60 border-red-200 hover:border-red-300 shadow-xs'
                      : 'bg-white border-slate-100 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                    <span className="flex items-center space-x-1 text-red-700">
                      <Handshake className="w-3.5 h-3.5 text-red-700" />
                      <span>{hasSalaryStructure ? 'Remaining Salary' : 'Pending Amount'}</span>
                    </span>
                    {activeMetricTab === 'pending' && (
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    )}
                  </div>
                  <p className="text-base font-black mt-1 text-red-700">
                    {formatINR(summary.pendingAmount)}
                  </p>
                  <div className="flex items-center justify-between mt-1 text-[9px] font-bold uppercase">
                    <span className={
                      summary.status === 'to_receive'
                        ? 'text-emerald-700'
                        : summary.status === 'to_pay'
                        ? 'text-rose-700'
                        : 'text-emerald-600'
                    }>
                      {summary.status === 'to_receive'
                        ? '• Advance Paid'
                        : summary.status === 'to_pay'
                        ? (hasSalaryStructure ? '• Remaining Salary' : '• To Pay')
                        : '• Cleared ✓'}
                    </span>
                    <span className="text-slate-400 font-medium normal-case">
                      {person.type === 'Customer'
                        ? 'Total - Received'
                        : hasSalaryStructure
                        ? 'Total Salary - Paid'
                        : 'Total - Paid'}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Functional Action Bar: Leave, Closed, and Receive */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsLeaveModalOpen(true)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all ${
                  person.status === 'On Leave'
                    ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400/50'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80'
                }`}
                title="Manage employee leaves"
              >
                <Palmtree className="w-4 h-4 text-amber-700" />
                <span>{person.status === 'On Leave' ? `Leave (${person.leaveDays || 0}D)` : 'Leave'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsClosedModalOpen(true)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all ${
                  person.status === 'Closed'
                    ? 'bg-slate-800 hover:bg-slate-900 text-white'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80'
                }`}
                title="Close or reopen account"
              >
                {person.status === 'Closed' ? <Lock className="w-4 h-4 text-slate-300" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                <span>{person.status === 'Closed' ? 'Closed 🔒' : 'Closed'}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setSelectedPersonForProfile(null);
                  openPaymentForPerson(
                    person,
                    'Received',
                    summary.status === 'to_receive' ? summary.pendingAmount : undefined
                  );
                }}
                className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all"
                title="Record money received"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>+ In</span>
              </motion.button>
            </div>

            {/* One-Click Settle Banner (when pending > 0) */}
            {summary.pendingAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                  summary.status === 'to_receive'
                    ? 'bg-emerald-500/10 border-emerald-300'
                    : 'bg-rose-500/10 border-rose-300'
                }`}
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <Handshake className={`w-4 h-4 ${summary.status === 'to_receive' ? 'text-emerald-700' : 'text-rose-700'}`} />
                    <span className="text-xs font-black text-slate-800">
                      {summary.status === 'to_receive' ? 'Outstanding Dues' : 'Payable Dues'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Balance: <strong className="text-red-700">{formatINR(summary.pendingAmount)}</strong>
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    startSettlePaymentForPerson(person, summary);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-xs transition-all ${
                    summary.status === 'to_receive'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Settle {formatINR(summary.pendingAmount)}
                </motion.button>
              </motion.div>
            )}

            {/* Opening Balance Card (if set) */}
            {person.openingBalance !== undefined && person.openingBalance > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xs shadow-2xs">
                    ₹
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Opening Balance
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      {formatINR(person.openingBalance)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {person.type === 'Customer' ? 'Initial Due' : 'Initial Payable'}
                </span>
              </motion.div>
            )}

            {/* Joining Date Card */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -1 }}
              className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Joining Date
                  </span>
                  <p className="text-xs font-bold text-slate-800">
                    {person.joiningDate
                      ? new Date(person.joiningDate + 'T00:00:00').toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : person.createdAt
                      ? new Date(person.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })
                      : 'Not Specified'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Active Member
              </span>
            </motion.div>

            {/* Configured Salary Structure Card (with complete breakdown) */}
            {person.salaryType && person.salaryType !== 'None' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22 }}
                className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-slate-50 p-3.5 rounded-2xl border border-indigo-200/70 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                        Salary Structure
                      </span>
                      <p className="text-sm font-black text-indigo-950">
                        ₹{person.salaryAmount !== undefined ? person.salaryAmount.toLocaleString('en-IN') : 0}
                        <span className="text-xs font-semibold text-indigo-600 ml-1">
                          / {person.salaryType === 'Daily' ? 'Day' : person.salaryType === 'Weekly' ? 'Week' : 'Month'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-2xs">
                    {person.salaryType} Rate
                  </span>
                </div>

                {/* Salary Calculation Breakdown aligned with Salary Structure */}
                <div className="pt-2 border-t border-indigo-100/80 grid grid-cols-3 gap-1.5 text-center">
                  <div className="p-2 rounded-xl bg-white/90 border border-indigo-100/70">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      Total Salary
                    </span>
                    <p className="text-xs font-black text-slate-900 mt-0.5">
                      {formatINR(summary.totalAmount)}
                    </p>
                    <span className="text-[8.5px] text-indigo-600 font-semibold block truncate">
                      {summary.salaryRateDescription || 'Full Salary'}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-white/90 border border-blue-100/70">
                    <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">
                      Paid Salary
                    </span>
                    <p className="text-xs font-black text-blue-700 mt-0.5">
                      {formatINR(summary.totalPaid)}
                    </p>
                    <span className="text-[8.5px] text-blue-500 font-medium block truncate">
                      Paid Outflows
                    </span>
                  </div>

                  <div className="p-2 rounded-xl border bg-red-50/90 border-red-200">
                    <span className="text-[9px] font-bold uppercase tracking-wider block text-red-800">
                      Remaining Salary
                    </span>
                    <p className="text-xs font-black mt-0.5 text-red-700">
                      {formatINR(summary.pendingAmount)}
                    </p>
                    <span className="text-[8.5px] font-bold block truncate text-red-700">
                      {summary.status === 'to_receive' ? 'Advance Paid' : summary.status === 'to_pay' ? 'Remaining Salary' : 'Settled ✓'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Notes if any */}
            {person.notes && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                whileHover={{ y: -1 }}
                className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex items-start space-x-2 hover:shadow-md transition-all"
              >
                <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Notes
                  </span>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{person.notes}</p>
                </div>
              </motion.div>
            )}

            {/* Recent Transactions Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    {activeMetricTab === 'all'
                      ? `All Transactions (${personTransactions.length})`
                      : activeMetricTab === 'paid'
                      ? `Paid Outflows (${filteredPersonTransactions.length})`
                      : activeMetricTab === 'received'
                      ? `Received Inflows (${filteredPersonTransactions.length})`
                      : `Pending Ledger Records (${personTransactions.length})`}
                  </h4>
                  {activeMetricTab !== 'all' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Filtered
                    </span>
                  )}
                </div>

                {activeMetricTab !== 'all' && (
                  <button
                    onClick={() => setActiveMetricTab('all')}
                    className="text-[10px] text-slate-500 hover:text-slate-800 font-semibold underline"
                  >
                    View All ({personTransactions.length})
                  </button>
                )}
              </div>

              {filteredPersonTransactions.length === 0 ? (
                <div className="bg-white rounded-2xl p-6 border border-slate-100 text-center">
                  <p className="text-xs text-slate-400">
                    {activeMetricTab === 'paid'
                      ? 'No paid payments or expenses recorded for this contact'
                      : activeMetricTab === 'received'
                      ? 'No received payments or income recorded for this contact'
                      : 'No transactions recorded for this contact yet'}
                  </p>
                  {activeMetricTab !== 'all' && (
                    <button
                      onClick={() => setActiveMetricTab('all')}
                      className="mt-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg"
                    >
                      Show All Records
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl divide-y divide-slate-100 border border-slate-100 shadow-xs overflow-hidden">
                  {filteredPersonTransactions.map((tx, idx) => (
                    <motion.div
                      key={`${tx.id || 'person-tx'}-${idx}`}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(0.3, 0.15 + idx * 0.04) }}
                      whileHover={{ x: 2, backgroundColor: "rgba(248, 250, 252, 0.9)" }}
                      className="p-3 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 10 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-xs ${
                            tx.type === 'Income'
                              ? 'bg-emerald-100 text-emerald-600'
                              : tx.type === 'Expense'
                              ? 'bg-rose-100 text-rose-600'
                              : tx.paymentDirection === 'Paid'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-emerald-100 text-emerald-600'
                          }`}
                        >
                          {tx.type === 'Income' && <ArrowDownLeft className="w-4 h-4" />}
                          {tx.type === 'Expense' && <ArrowUpRight className="w-4 h-4" />}
                          {tx.type === 'Payment' && (
                            tx.paymentDirection === 'Paid' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )
                          )}
                        </motion.div>

                        <div>
                          <p className="text-xs font-bold text-slate-800">
                            {tx.type} {tx.paymentDirection ? `(${tx.paymentDirection})` : ''}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {tx.date} • {tx.paymentMethod}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs font-black ${
                            tx.type === 'Income' || tx.paymentDirection === 'Received'
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {tx.type === 'Expense' || tx.paymentDirection === 'Paid' ? '-' : '+'}
                          {formatINR(tx.amount)}
                        </p>
                        {tx.note && (
                          <p className="text-[10px] text-slate-400 max-w-[120px] truncate">{tx.note}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

      {/* Fully Functional Leave Modal */}
      {person && (
        <PersonLeaveModal
          key="profile-leave-modal"
          person={person}
          isOpen={isLeaveModalOpen}
          onClose={() => setIsLeaveModalOpen(false)}
          onSaveLeave={(days, newStatus, start, end, leaveDates) => {
            if (person) {
              updatePersonLeave(person.id, days, newStatus, start, end, leaveDates);
            }
          }}
        />
      )}

      {/* Fully Functional Closed Modal */}
      {person && summary && (
        <PersonClosedModal
          key="profile-closed-modal"
          person={person}
          summary={summary}
          isOpen={isClosedModalOpen}
          onClose={() => setIsClosedModalOpen(false)}
          onCloseAccount={(date, reason) => {
            if (person) {
              updatePersonClosed(person.id, true, date, reason);
            }
          }}
          onReopenAccount={() => {
            if (person) {
              updatePersonClosed(person.id, false);
            }
          }}
          onSettleAndClose={() => {
            if (person && summary.pendingAmount > 0) {
              startSettlePaymentForPerson(person, summary);
            }
          }}
        />
      )}
    </>
  );
};
