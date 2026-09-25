import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Phone, ArrowRight, ArrowLeft, UserCheck, Plus, ChevronRight, AlertCircle, Building2, User, Edit2, Trash2, Calendar, ArrowDownLeft, ArrowUpRight, Handshake, CheckCircle2, Layers, Briefcase, Palmtree, Lock, Unlock, Percent, Activity, Palette, Sparkles, X, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Person, PersonCalculations, PersonType } from '../types';
import { calculatePersonSummary, formatINR } from '../services/calculations';
import { getPersonGradientTheme, PERSON_GRADIENT_THEMES, GradientTheme } from '../utils/personGradients';
import { PersonLeaveModal } from './PersonLeaveModal';
import { PersonClosedModal } from './PersonClosedModal';

export const PersonsView: React.FC = () => {
  const {
    persons,
    income,
    expenses,
    payments,
    openQuickAction,
    startEditItem,
    openDeleteConfirm,
    deletePerson,
    showPersonDeleteBlocked,
    setSelectedPersonForProfile,
    setCurrentView,
    goBack,
    openPaymentForPerson,
    updatePersonLeave,
    updatePersonClosed,
    updatePersonGradientTheme,
    startSettlePaymentForPerson,
    showToast,
  } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | PersonType>('All');
  const [leavePerson, setLeavePerson] = useState<Person | null>(null);
  const [closedPersonData, setClosedPersonData] = useState<{ person: Person; summary: PersonCalculations } | null>(null);
  const [themePickerPerson, setThemePickerPerson] = useState<Person | null>(null);

  const filterOptions: ('All' | PersonType)[] = ['All', 'Customer', 'Employee', 'Staff', 'Worker', 'Other'];

  const personsWithCalculations = useMemo(() => {
    return (persons || []).map(p => ({
      person: p,
      summary: calculatePersonSummary(p, income, expenses, payments),
    }));
  }, [persons, income, expenses, payments]);

  const filteredPersons = useMemo(() => {
    return personsWithCalculations.filter(({ person: p }) => {
      if (!p) return false;
      const pName = p.name || '';
      const pMobile = p.mobile || '';
      const pAddr = p.address || '';
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        pName.toLowerCase().includes(q) ||
        pMobile.includes(searchQuery) ||
        pAddr.toLowerCase().includes(q);
      const matchesType = activeFilter === 'All' || p.type === activeFilter;
      return matchesSearch && matchesType;
    });
  }, [personsWithCalculations, searchQuery, activeFilter]);

  // Color generator for circular avatars
  const getAvatarColor = (name: string = '') => {
    const colors = [
      'bg-slate-800 text-white ring-1 ring-slate-700/20',
      'bg-blue-700 text-white ring-1 ring-blue-600/20',
      'bg-indigo-700 text-white ring-1 ring-indigo-600/20',
      'bg-teal-700 text-white ring-1 ring-teal-600/20',
      'bg-purple-700 text-white ring-1 ring-purple-600/20',
      'bg-emerald-700 text-white ring-1 ring-emerald-600/20',
    ];
    let hash = 0;
    const safeName = name || 'User';
    for (let i = 0; i < safeName.length; i++) hash += safeName.charCodeAt(i);
    return colors[Math.abs(hash) % colors.length];
  };

  const getPersonCardTheme = (status: 'to_receive' | 'to_pay' | 'settled') => {
    if (status === 'to_receive') {
      return {
        cardClass:
          'bg-white border border-slate-200/90 hover:border-emerald-400 hover:shadow-md shadow-xs transition-all duration-200',
        statusBorder: 'border-l-4 border-l-emerald-500',
        badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90',
        amountColor: 'text-emerald-700',
        dot: 'bg-emerald-500',
      };
    }
    if (status === 'to_pay') {
      return {
        cardClass:
          'bg-white border border-slate-200/90 hover:border-rose-400 hover:shadow-md shadow-xs transition-all duration-200',
        statusBorder: 'border-l-4 border-l-rose-500',
        badge: 'bg-rose-50 text-rose-800 border border-rose-200/90',
        amountColor: 'text-rose-700',
        dot: 'bg-rose-600',
      };
    }
    return {
      cardClass:
        'bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md shadow-xs transition-all duration-200',
      statusBorder: 'border-l-4 border-l-slate-300',
      badge: 'bg-slate-100 text-slate-700 border border-slate-200',
      amountColor: 'text-slate-700',
      dot: 'bg-slate-400',
    };
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Customer':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case 'Employee':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'Staff':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'Worker':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'Supplier':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200/80';
    }
  };

  const isEmployeeRole = (pType?: string) => pType === 'Employee' || pType === 'Staff' || pType === 'Worker';

  const formatLeaveDisplay = (person: Person) => {
    if (person.leaveStartDate && person.leaveEndDate) {
      const s = new Date(person.leaveStartDate + 'T00:00:00');
      const e = new Date(person.leaveEndDate + 'T00:00:00');
      if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
        const sStr = s.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const eStr = e.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        return `${sStr} - ${eStr} (${person.leaveDays || 1}D)`;
      }
    }
    return `${person.leaveDays || 0}D Leave`;
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Top Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-white px-4 pt-3 pb-3 border-b border-slate-100 shrink-0 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-3">
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
              <h2 className="text-base font-bold text-slate-800 tracking-tight">Persons & Contacts</h2>
              <p className="text-xs text-slate-400">Manage customers, employees & vendor ledgers</p>
            </div>
          </div>
          <motion.button
            id="persons-top-add-btn"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openQuickAction('add_person')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs hover:bg-blue-700 transition-all"
          >
            <motion.div
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.div>
            <span>Add Person</span>
          </motion.button>
        </div>

        {/* Search bar */}
        <div className="relative mb-2.5">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="persons-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, address..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
          />
        </div>

        {/* Filter Chips: All / Customer / Employee / Other */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 no-scrollbar">
          {filterOptions.map(f => (
            <motion.button
              key={f}
              id={`persons-filter-${f.toLowerCase()}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Person List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredPersons.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3"
            >
              <User className="w-6 h-6" />
            </motion.div>
            <p className="text-sm font-semibold text-slate-700">No persons found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
              {searchQuery ? 'Try matching another name or mobile' : 'Tap Add Person to create your first contact'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openQuickAction('add_person')}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Add Person Now
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredPersons.map(({ person, summary }, idx) => {
              const initials = (person.name || 'User')
                .split(' ')
                .filter(Boolean)
                .map(w => w[0])
                .join('')
                .substring(0, 2)
                .toUpperCase() || 'U';

              const theme = getPersonCardTheme(summary.status);

              // Calculate settlement / clearance percentage
              const totalAmt = summary.totalAmount || 0;
              const clearedAmt = person.type === 'Customer' ? summary.totalReceived : summary.totalPaid;
              let percent = 0;
              if (totalAmt > 0) {
                percent = Math.min(100, Math.max(0, Math.round((clearedAmt / totalAmt) * 100)));
              } else if (summary.pendingAmount === 0 && (summary.totalReceived > 0 || summary.totalPaid > 0)) {
                percent = 100;
              } else if (summary.pendingAmount === 0) {
                percent = 100;
              } else {
                percent = 0;
              }

              // Color change condition at 20%
              const isUnderOrEqual20 = percent <= 20;

              return (
                <motion.div
                  key={`${person.id || 'person'}-${idx}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: Math.min(0.15, idx * 0.02), duration: 0.18 }}
                  whileHover={{ y: -1 }}
                  onClick={() => setSelectedPersonForProfile(person)}
                  className={`${theme.cardClass} ${theme.statusBorder} rounded-xl p-3 cursor-pointer group relative overflow-hidden transition-all`}
                >
                  {/* Top Row: Avatar, Identity, Balance & Actions */}
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    {/* Left: Avatar & Identity Details */}
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs tracking-wider shadow-2xs shrink-0 ${getAvatarColor(
                          person.name
                        )}`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                          <h4 className="text-[13.5px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[140px] sm:max-w-none">
                            {person.name}
                          </h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase tracking-wider border ${getTypeBadge(
                              person.type
                            )}`}
                          >
                            {person.type}
                          </span>
                          {person.status === 'Closed' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-800 text-white flex items-center space-x-0.5 shadow-2xs">
                              <Lock className="w-2.5 h-2.5 text-slate-300" />
                              <span>Closed</span>
                            </span>
                          ) : person.status === 'On Leave' ? (
                            <span
                              className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-0.5 shadow-2xs"
                              title={`Leave: ${formatLeaveDisplay(person)}`}
                            >
                              <Palmtree className="w-2.5 h-2.5 text-amber-700" />
                              <span>{formatLeaveDisplay(person)}</span>
                            </span>
                          ) : null}
                        </div>

                        {/* Inline Contact & Salary Info */}
                        <div className="flex items-center space-x-2 text-slate-500 text-[11px] mt-0.5 flex-wrap">
                          <a
                            href={`tel:${person.mobile}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center space-x-1 font-medium hover:text-blue-600 transition-colors"
                            title="Call directly"
                          >
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span>{person.mobile}</span>
                          </a>
                          {person.salaryType && person.salaryType !== 'None' && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="font-semibold text-slate-700 bg-slate-100 px-1 py-0.2 rounded text-[10px] border border-slate-200">
                                ₹{person.salaryAmount?.toLocaleString('en-IN')}/{person.salaryType === 'Daily' ? 'day' : person.salaryType === 'Weekly' ? 'wk' : 'mo'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Balance & Compact Action Bar */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="text-right">
                        <p className={`text-[14px] font-black tracking-tight leading-tight ${theme.amountColor}`}>
                          {formatINR(summary.pendingAmount)}
                        </p>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded inline-flex items-center space-x-1 mt-0.5 ${theme.badge}`}
                        >
                          <span className={`w-1 h-1 rounded-full ${theme.dot}`} />
                          <span className="truncate max-w-[85px]">
                            {summary.status === 'to_receive'
                              ? 'To Receive'
                              : summary.status === 'to_pay'
                              ? (isEmployeeRole(person.type) || (person.salaryAmount && person.salaryAmount > 0) ? 'Remaining Salary' : 'To Pay')
                              : 'Settled'}
                          </span>
                        </span>
                      </div>

                      {/* Compact Actions Toolbar */}
                      <div className="flex items-center space-x-0.5 pl-1.5 border-l border-slate-200 bg-slate-50/80 rounded-lg p-0.5 border border-slate-100">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLeavePerson(person);
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            person.status === 'On Leave'
                              ? 'text-amber-800 bg-amber-100'
                              : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                          }`}
                          title={`Manage Leave for ${person.name}`}
                        >
                          <Palmtree className="w-3 h-3" />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setClosedPersonData({ person, summary });
                          }}
                          className={`p-1 rounded-md transition-colors ${
                            person.status === 'Closed'
                              ? 'text-slate-900 bg-slate-200'
                              : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
                          }`}
                          title={`Close / Settle Account for ${person.name}`}
                        >
                          <Lock className="w-3 h-3" />
                        </motion.button>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditItem({ type: 'person', data: person });
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title={`Edit ${person.name}`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (summary.pendingAmount > 0 || summary.status !== 'settled') {
                              showPersonDeleteBlocked(person, summary);
                              return;
                            }
                            openDeleteConfirm(
                              `Delete ${person.name}?`,
                              'This will move this person to Recycle Bin (auto-purged in 15 days). Associated transaction records will remain.',
                              () => deletePerson(person.id)
                            );
                          }}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title={`Delete ${person.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  {/* Slim Percentage Progress Bar with 20% Threshold color change */}
                  <div className="mt-2 pt-1 relative z-10">
                    <div className="flex items-center justify-between text-[10px] mb-1">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        <span className="font-semibold text-slate-500 truncate">
                          {person.type === 'Customer'
                            ? 'Received'
                            : isEmployeeRole(person.type) || (person.salaryAmount && person.salaryAmount > 0)
                            ? 'Salary Paid'
                            : 'Cleared'}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-black tracking-tight border transition-colors ${
                            isUnderOrEqual20
                              ? 'bg-rose-100/90 text-rose-700 border-rose-200'
                              : 'bg-emerald-100/90 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {percent}%
                        </span>
                      </div>

                      {/* 20% Threshold Status Indicator */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isUnderOrEqual20 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                          }`}
                        />
                        <span
                          className={`text-[9.5px] font-bold ${
                            isUnderOrEqual20 ? 'text-rose-600' : 'text-emerald-700'
                          }`}
                        >
                          {isUnderOrEqual20
                            ? '≤ 20% Low'
                            : percent === 100
                            ? '✓ 100% Cleared'
                            : '> 20% Cleared'}
                        </span>
                      </div>
                    </div>

                    {/* Compact Dynamic Color Progress Bar: Red when <= 20%, Emerald when > 20% */}
                    <div
                      className={`w-full h-1.5 rounded-full overflow-hidden relative border transition-colors ${
                        isUnderOrEqual20
                          ? 'bg-rose-100/80 border-rose-200/60'
                          : 'bg-emerald-100/60 border-emerald-200/60'
                      }`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percent, percent > 0 ? 3 : 0)}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isUnderOrEqual20
                            ? 'bg-gradient-to-r from-red-600 via-rose-500 to-rose-600 shadow-[0_0_6px_rgba(244,63,94,0.35)]'
                            : 'bg-gradient-to-r from-teal-500 via-emerald-500 to-emerald-600 shadow-[0_0_6px_rgba(16,185,129,0.3)]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Compact 3-Column Ledger Shelf */}
                  <div className="mt-2 grid grid-cols-3 gap-1.5 relative z-10">
                    {/* 1. Total Amount / Total Salary */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPersonForProfile(person);
                      }}
                      className="bg-slate-50/90 hover:bg-slate-100 p-1.5 px-2 rounded-lg border border-slate-200/70 transition-all cursor-pointer"
                      title="Click to view full financial ledger"
                    >
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {isEmployeeRole(person.type) || (person.salaryAmount && person.salaryAmount > 0)
                          ? 'Total Salary'
                          : 'Total'}
                      </div>
                      <p className="text-[12.5px] font-black text-slate-900 mt-0.5 tracking-tight truncate">
                        {formatINR(summary.totalAmount)}
                      </p>
                    </div>

                    {/* 2. Paid / Received */}
                    <div
                      className={`p-1.5 px-2 rounded-lg border transition-all ${
                        person.type === 'Customer'
                          ? 'bg-emerald-50/50 hover:bg-emerald-50/80 border-emerald-200/80'
                          : 'bg-blue-50/50 hover:bg-blue-50/80 border-blue-200/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                        <span className={`truncate mr-1 ${person.type === 'Customer' ? 'text-emerald-800' : 'text-blue-800'}`}>
                          {person.type === 'Customer'
                            ? 'Received'
                            : 'Paid'}
                        </span>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (person.type === 'Customer') {
                              openPaymentForPerson(
                                person,
                                'Received',
                                summary.status === 'to_receive' ? summary.pendingAmount : undefined
                              );
                            } else {
                              openPaymentForPerson(
                                person,
                                'Paid',
                                summary.status === 'to_pay' ? summary.pendingAmount : undefined
                              );
                            }
                          }}
                          className={`px-1 py-0.2 rounded text-[8.5px] font-bold text-white shadow-2xs transition-colors shrink-0 ${
                            person.type === 'Customer'
                              ? 'bg-emerald-600 hover:bg-emerald-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          title={person.type === 'Customer' ? 'Record receipt' : 'Record payment'}
                        >
                          {person.type === 'Customer' ? '+ In' : '+ Pay'}
                        </motion.button>
                      </div>
                      <p
                        className={`text-[12.5px] font-black mt-0.5 tracking-tight truncate ${
                          person.type === 'Customer' ? 'text-emerald-700' : 'text-blue-700'
                        }`}
                      >
                        {formatINR(person.type === 'Customer' ? summary.totalReceived : summary.totalPaid)}
                      </p>
                    </div>

                    {/* 3. Due Salary / Pending */}
                    <div className={`p-1.5 px-2 rounded-lg border transition-all ${
                      summary.pendingAmount > 0
                        ? 'bg-rose-50/50 hover:bg-rose-50/80 border-rose-200/80'
                        : 'bg-slate-50/80 border-slate-200/70'
                    }`}>
                      <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wider">
                        <span className={`truncate mr-1 ${summary.pendingAmount > 0 ? 'text-rose-800' : 'text-slate-600'}`}>
                          {isEmployeeRole(person.type) || (person.salaryAmount && person.salaryAmount > 0)
                            ? 'Due Salary'
                            : 'Pending'}
                        </span>
                        {summary.pendingAmount > 0 ? (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.08 }}
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openPaymentForPerson(
                                person,
                                summary.status === 'to_receive' ? 'Received' : 'Paid',
                                summary.pendingAmount
                              );
                            }}
                            className={`px-1 py-0.2 rounded text-[8.5px] font-bold text-white shadow-2xs transition-colors shrink-0 ${
                              summary.status === 'to_receive'
                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                            title="Settle due amount"
                          >
                            Settle
                          </motion.button>
                        ) : (
                          <span className="text-[8.5px] font-bold text-emerald-700 shrink-0">✓ Settled</span>
                        )}
                      </div>
                      <p className={`text-[12.5px] font-black mt-0.5 tracking-tight truncate ${
                        summary.pendingAmount > 0 ? 'text-rose-700' : 'text-slate-500'
                      }`}>
                        {formatINR(summary.pendingAmount)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Floating Blue "+" Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <motion.button
          id="persons-fab-add"
          whileHover={{ scale: 1.12, rotate: 90 }}
          whileTap={{ scale: 0.88 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          onClick={() => openQuickAction('add_person')}
          className="w-13 h-13 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 hover:bg-blue-700 transition-colors ring-4 ring-blue-600/20"
          title="Add Person"
        >
          <Plus className="w-7 h-7 stroke-[2.5]" />
        </motion.button>
      </div>

      {/* Leave Modal */}
      <PersonLeaveModal
        person={leavePerson}
        isOpen={Boolean(leavePerson)}
        onClose={() => setLeavePerson(null)}
        onSaveLeave={(days, newStatus, start, end, leaveDates) => {
          if (leavePerson) {
            updatePersonLeave(leavePerson.id, days, newStatus, start, end, leaveDates);
          }
        }}
      />

      {/* Closed Modal */}
      <PersonClosedModal
        person={closedPersonData?.person || null}
        summary={closedPersonData?.summary || null}
        isOpen={Boolean(closedPersonData)}
        onClose={() => setClosedPersonData(null)}
        onCloseAccount={(date, reason) => {
          if (closedPersonData) {
            updatePersonClosed(closedPersonData.person.id, true, date, reason);
          }
        }}
        onReopenAccount={() => {
          if (closedPersonData) {
            updatePersonClosed(closedPersonData.person.id, false);
          }
        }}
        onSettleAndClose={() => {
          if (closedPersonData && closedPersonData.summary.pendingAmount > 0) {
            startSettlePaymentForPerson(closedPersonData.person, closedPersonData.summary);
          }
        }}
      />
    </div>
  );
};
