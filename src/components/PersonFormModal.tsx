import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Phone, Check, Briefcase, Sparkles, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Person, PersonType, SalaryType } from '../types';

export const PersonFormModal: React.FC = () => {
  const { activeModal, closeQuickAction, savePerson, editItem, showToast, persons } = useApp();

  const isOpen = activeModal === 'add_person';
  const isEditing = editItem?.type === 'person' && editItem.data;

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [type, setType] = useState<PersonType>('Customer');
  const [salaryType, setSalaryType] = useState<SalaryType>('None');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [joiningDate, setJoiningDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Store original snapshot for edit comparisons
  const original = useMemo(() => {
    if (isEditing && editItem?.data) {
      const p: Person = editItem.data;
      return {
        name: p.name || '',
        mobile: p.mobile || '',
        type: p.type || 'Customer',
        salaryType: (p.salaryType || 'None') as SalaryType,
        salaryAmount: p.salaryAmount !== undefined ? String(p.salaryAmount) : '',
        openingBalance: p.openingBalance !== undefined ? String(p.openingBalance) : '0',
        joiningDate: p.joiningDate || (p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]),
        notes: p.notes || '',
      };
    }
    return null;
  }, [isEditing, editItem]);

  useEffect(() => {
    if (isEditing && editItem?.data) {
      const p: Person = editItem.data;
      setName(p.name || '');
      setMobile(p.mobile || '');
      setType(p.type || 'Customer');
      setSalaryType((p.salaryType || 'None') as SalaryType);
      setSalaryAmount(p.salaryAmount !== undefined ? String(p.salaryAmount) : '');
      setOpeningBalance(p.openingBalance !== undefined ? String(p.openingBalance) : '0');
      setJoiningDate(p.joiningDate || (p.createdAt ? p.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]));
      setNotes(p.notes || '');
    } else {
      setName('');
      setMobile('');
      setType('Customer');
      setSalaryType('None');
      setSalaryAmount('');
      setOpeningBalance('0');
      setJoiningDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setSubmitAttempted(false);
  }, [isOpen, isEditing, editItem]);

  // When changing role to Employee/Staff/Worker, automatically recommend/default to salary if None
  const handleTypeChange = (newType: PersonType) => {
    setType(newType);
    if ((newType === 'Employee' || newType === 'Staff' || newType === 'Worker') && salaryType === 'None') {
      setSalaryType(newType === 'Worker' ? 'Daily' : 'Monthly');
    }
  };

  // Form Validation Logic (Form must be properly filled before person can be added)
  const isNameValid = name.trim().length >= 2;
  const cleanMobile = mobile.replace(/[^0-9]/g, '');
  const isMobileValid = cleanMobile.length >= 10;
  const isJoiningDateValid = Boolean(joiningDate && joiningDate.trim().length > 0);

  // Uniqueness validation: Each person/employee must have a unique name and phone number
  const isDuplicateName = useMemo(() => {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed) return false;
    return persons.some(p => {
      if (isEditing && editItem?.data?.id === p.id) return false;
      return p.name.trim().toLowerCase() === trimmed;
    });
  }, [name, persons, isEditing, editItem]);

  const isDuplicateMobile = useMemo(() => {
    if (cleanMobile.length < 10) return false;
    const last10 = cleanMobile.slice(-10);
    return persons.some(p => {
      if (isEditing && editItem?.data?.id === p.id) return false;
      const pDigits = (p.mobile || '').replace(/[^0-9]/g, '');
      return pDigits.length >= 10 && pDigits.slice(-10) === last10;
    });
  }, [cleanMobile, persons, isEditing, editItem]);
  
  // Salary validity: If role is Employee/Staff/Worker, salary cannot be None and amount must be > 0.
  // If role is Customer/Other but user picked Daily/Weekly/Monthly, amount must be > 0.
  const isEmployeeRole = ['Employee', 'Staff', 'Worker'].includes(type);
  const isSalaryRequired = isEmployeeRole || salaryType !== 'None';
  const isSalaryValid = !isSalaryRequired || (parseFloat(salaryAmount) > 0);

  // Overall form readiness
  const isFormComplete = isNameValid && !isDuplicateName && isMobileValid && !isDuplicateMobile && isSalaryValid && isJoiningDateValid;

  // Completion calculation for visual progress tracker
  const totalRequiredFields = isSalaryRequired ? 5 : 4;
  const completedFields = [
    isNameValid && !isDuplicateName,
    isMobileValid && !isDuplicateMobile,
    Boolean(type),
    isJoiningDateValid,
    isSalaryRequired ? isSalaryValid : null,
  ].filter(Boolean).length;
  const completionPercentage = Math.round((completedFields / totalRequiredFields) * 100);

  // Check if each specific field has been modified from original during edit
  const isNameModified = isEditing && original && name !== original.name;
  const isMobileModified = isEditing && original && mobile !== original.mobile;
  const isTypeModified = isEditing && original && type !== original.type;
  const isSalaryTypeModified = isEditing && original && salaryType !== original.salaryType;
  const isSalaryAmountModified = isEditing && original && salaryAmount !== original.salaryAmount;
  const isOpeningBalanceModified = isEditing && original && openingBalance !== original.openingBalance;
  const isJoiningDateModified = isEditing && original && joiningDate !== original.joiningDate;
  const isNotesModified = isEditing && original && notes !== original.notes;

  const totalModifications = [
    isNameModified,
    isMobileModified,
    isTypeModified,
    isSalaryTypeModified,
    isSalaryAmountModified,
    isOpeningBalanceModified,
    isJoiningDateModified,
    isNotesModified,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (isDuplicateName) {
      showToast(`Name "${name.trim()}" is already used by another person/employee. Each person must have a different name!`, 'error');
      return;
    }

    if (isDuplicateMobile) {
      showToast(`Mobile number "${mobile.trim()}" is already registered. Each person/employee must have a different number!`, 'error');
      return;
    }

    if (!isFormComplete) {
      if (!isNameValid) {
        showToast('Please enter a valid person name (at least 2 characters)!', 'error');
      } else if (!isMobileValid) {
        showToast('Please enter a valid 10-digit mobile number!', 'error');
      } else if (!isJoiningDateValid) {
        showToast('Please select a valid joining date!', 'error');
      } else if (!isSalaryValid) {
        showToast('Please select a salary frequency and enter a valid amount!', 'error');
      } else {
        showToast('Please fill all required fields!', 'error');
      }
      return;
    }

    savePerson(
      {
        name: name.trim(),
        mobile: mobile.trim(),
        address: isEditing && editItem?.data?.address ? editItem.data.address : '',
        openingBalance: parseFloat(openingBalance) || 0,
        type,
        salaryType,
        salaryAmount: salaryType !== 'None' ? parseFloat(salaryAmount) || 0 : undefined,
        joiningDate: joiningDate || new Date().toISOString().split('T')[0],
        notes: notes.trim() || undefined,
      },
      isEditing ? editItem.data.id : undefined
    );
  };

  const salaryOptions: { type: SalaryType; label: string; period: string }[] = [
    { type: 'None', label: 'None', period: 'No Salary' },
    { type: 'Daily', label: 'Daily', period: 'Per Day' },
    { type: 'Weekly', label: 'Weekly', period: 'Per Week' },
    { type: 'Monthly', label: 'Monthly', period: 'Per Month' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="person-form-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs"
        >
          <motion.div
            key="person-form-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-800 tracking-tight">
                  {isEditing ? 'Edit Person Details' : 'Add New Person'}
                </h3>
                {isEditing && totalModifications > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-xs flex items-center space-x-1">
                    <Sparkles className="w-3 h-3 inline" />
                    <span>{totalModifications} Changed</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? 'Pre-filled with existing details. Update required fields.'
                  : 'Enter person contact details and salary plan (Daily/Weekly/Monthly)'}
              </p>
            </div>
            <motion.button
              id="person-form-close"
              type="button"
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeQuickAction}
              className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Form Completion Progress Bar */}
          <div className="bg-slate-100/80 px-5 py-2 border-b border-slate-200/70">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-bold text-slate-700 flex items-center space-x-1">
                <span>Required Information:</span>
              </span>
              <span className={`font-black ${isFormComplete ? 'text-emerald-600' : 'text-blue-600'}`}>
                {completedFields}/{totalRequiredFields} Fields ({completionPercentage}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 0.3 }}
                className={`h-full rounded-full transition-all ${
                  isFormComplete ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
              />
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Person Type Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                  <span>Person Role</span>
                  <span className="text-rose-500">*</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      isTypeModified
                        ? 'bg-violet-100 text-violet-700 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isTypeModified ? `New (${type})` : 'Existing'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {(['Customer', 'Employee', 'Staff', 'Worker', 'Other'] as PersonType[]).map(t => (
                  <motion.button
                    key={t}
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => handleTypeChange(t)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                      type === t
                        ? isTypeModified
                          ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === t && <Check className="w-3 h-3 shrink-0" />}
                    <span>{t}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Person Name * (Required) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                  <span>Person Name</span>
                  <span className="text-rose-500 font-black">*</span>
                </label>
                {isDuplicateName ? (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>Name Already Exists</span>
                  </span>
                ) : isNameValid ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unique & Valid</span>
                  </span>
                ) : submitAttempted ? (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>Required</span>
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <User
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    isDuplicateName || (submitAttempted && !isNameValid)
                      ? 'text-rose-500'
                      : isNameModified
                      ? 'text-violet-600'
                      : 'text-slate-400'
                  }`}
                />
                <input
                  id="person-form-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDuplicateName || (submitAttempted && !isNameValid)
                      ? 'border-rose-400 bg-rose-50/50 text-rose-950 focus:ring-2 focus:ring-rose-400/20'
                      : isNameModified
                      ? 'bg-violet-50/80 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                  }`}
                />
              </div>
              {isDuplicateName && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>A person/employee with this name already exists. Name must be different!</span>
                </p>
              )}
              {submitAttempted && !isNameValid && !isDuplicateName && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Please enter a valid name (at least 2 characters)</span>
                </p>
              )}
            </div>

            {/* Mobile Number * (Required) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                  <span>Mobile Number</span>
                  <span className="text-rose-500 font-black">*</span>
                </label>
                {isDuplicateMobile ? (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>Number Already Registered</span>
                  </span>
                ) : isMobileValid ? (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-0.5">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unique (10 Digits)</span>
                  </span>
                ) : submitAttempted ? (
                  <span className="text-[10px] font-bold text-rose-600 flex items-center space-x-0.5">
                    <AlertCircle className="w-3 h-3" />
                    <span>10 Digits Required</span>
                  </span>
                ) : null}
              </div>
              <div className="relative">
                <Phone
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                    isDuplicateMobile || (submitAttempted && !isMobileValid)
                      ? 'text-rose-500'
                      : isMobileModified
                      ? 'text-violet-600'
                      : 'text-slate-400'
                  }`}
                />
                <input
                  id="person-form-mobile"
                  type="tel"
                  required
                  maxLength={15}
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDuplicateMobile || (submitAttempted && !isMobileValid)
                      ? 'border-rose-400 bg-rose-50/50 text-rose-950 focus:ring-2 focus:ring-rose-400/20'
                      : isMobileModified
                      ? 'bg-violet-50/80 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                  }`}
                />
              </div>
              {isDuplicateMobile && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>This mobile number is already used by another person. Number must be different!</span>
                </p>
              )}
              {submitAttempted && !isMobileValid && !isDuplicateMobile && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>Please enter a valid 10-digit mobile number</span>
                </p>
              )}
            </div>

            {/* Joining Date Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1">
                  <span>Joining Date</span>
                  <span className="text-rose-500 font-black">*</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isJoiningDateModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isJoiningDateModified ? 'New Date' : 'Existing Date'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Calendar
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    submitAttempted && !isJoiningDateValid
                      ? 'text-rose-500'
                      : isJoiningDateModified
                      ? 'text-violet-600'
                      : 'text-slate-400'
                  }`}
                />
                <input
                  id="person-form-joining-date"
                  type="date"
                  required
                  value={joiningDate}
                  onChange={e => setJoiningDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    submitAttempted && !isJoiningDateValid
                      ? 'border-rose-400 bg-rose-50/50 text-rose-950 focus:ring-2 focus:ring-rose-400/20'
                      : isJoiningDateModified
                      ? 'bg-violet-50/80 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                  }`}
                />
              </div>
              {/* Quick Date Presets */}
              <div className="flex items-center space-x-1.5 mt-1.5">
                <button
                  type="button"
                  onClick={() => setJoiningDate(new Date().toISOString().split('T')[0])}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                    joiningDate === new Date().toISOString().split('T')[0]
                      ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs font-bold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(d.getDate() - 1);
                    setJoiningDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  Yesterday
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const d = new Date();
                    d.setDate(1);
                    setJoiningDate(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all"
                >
                  1st of Month
                </button>
              </div>
              {isJoiningDateModified && original && (
                <p className="text-[10px] text-violet-700 font-semibold mt-1">
                  Original Date: {original.joiningDate}
                </p>
              )}
            </div>

            {/* DAILY, WEEKLY, MONTHLY SALARY OPTION SECTION */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Salary Structure (Daily / Weekly / Monthly)
                  </label>
                  {isEmployeeRole && <span className="text-rose-500 font-black">*</span>}
                </div>
                {salaryType !== 'None' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {salaryType} Plan
                  </span>
                )}
              </div>

              {/* Salary Frequency Selector Chips: None / Daily / Weekly / Monthly */}
              <div className="grid grid-cols-4 gap-1.5 mb-2.5">
                {salaryOptions.map(opt => (
                  <motion.button
                    key={opt.type}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSalaryType(opt.type)}
                    className={`py-2 px-1 rounded-xl text-center text-[11px] font-bold transition-all ${
                      salaryType === opt.type
                        ? isSalaryTypeModified
                          ? 'bg-violet-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span className="block leading-tight">{opt.label}</span>
                    <span className="text-[9px] opacity-80 block font-normal mt-0.5">{opt.period}</span>
                  </motion.button>
                ))}
              </div>

              {/* Salary Amount Input when Daily, Weekly, or Monthly is selected */}
              {salaryType !== 'None' ? (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`space-y-1.5 p-3 rounded-2xl border transition-all ${
                    submitAttempted && !isSalaryValid
                      ? 'bg-rose-50/70 border-rose-300'
                      : 'bg-blue-50/60 border-blue-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      {salaryType} Salary Amount (₹ / {salaryType})
                      <span className="text-rose-500 font-black ml-1">*</span>
                    </label>
                    {parseFloat(salaryAmount) > 0 ? (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-rose-600">Enter Amount</span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="text-blue-600 font-bold absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                      ₹
                    </span>
                    <input
                      id="person-form-salary-amount"
                      type="number"
                      step="any"
                      min="1"
                      required
                      value={salaryAmount}
                      onChange={e => setSalaryAmount(e.target.value)}
                      placeholder={
                        salaryType === 'Daily'
                          ? 'e.g. 500 (per day)'
                          : salaryType === 'Weekly'
                          ? 'e.g. 3500 (per week)'
                          : 'e.g. 15000 (per month)'
                      }
                      className={`w-full pl-8 pr-4 py-2 rounded-xl text-xs font-bold outline-none transition-all ${
                        submitAttempted && !isSalaryValid
                          ? 'bg-white border-2 border-rose-400 text-rose-950 ring-2 ring-rose-400/20'
                          : isSalaryAmountModified
                          ? 'bg-violet-50 border-2 border-violet-500 text-violet-950 ring-2 ring-violet-400/20'
                          : 'bg-white border border-blue-200 text-blue-950 focus:border-blue-600'
                      }`}
                    />
                  </div>
                  {submitAttempted && !isSalaryValid && (
                    <p className="text-[10px] text-rose-600 font-semibold mt-0.5 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Please enter a valid salary amount!</span>
                    </p>
                  )}
                  {parseFloat(salaryAmount) > 0 && (
                    <p className="text-[10px] text-blue-700 font-medium">
                      Rate: ₹{parseFloat(salaryAmount).toLocaleString('en-IN')} / {salaryType === 'Daily' ? 'Day' : salaryType === 'Weekly' ? 'Week' : 'Month'}
                    </p>
                  )}
                </motion.div>
              ) : isEmployeeRole ? (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Please select Daily, Weekly, or Monthly salary option for {type}s!</span>
                </div>
              ) : null}
            </div>

            {/* Opening Balance */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <span>Opening Balance</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isOpeningBalanceModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-white text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isOpeningBalanceModified ? 'New Balance' : 'Current Balance'}
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="text-slate-500 font-bold absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  ₹
                </span>
                <input
                  id="person-form-opening-balance"
                  type="number"
                  step="any"
                  value={openingBalance}
                  onChange={e => setOpeningBalance(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs font-bold outline-none transition-all ${
                    isOpeningBalanceModified
                      ? 'bg-violet-50 border-2 border-violet-500 text-violet-950 ring-2 ring-violet-400/20'
                      : 'bg-white border-slate-200 text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                  }`}
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                {type === 'Customer'
                  ? '• Initial due amount customer owes to you'
                  : '• Initial amount company owes to employee/vendor'}
              </p>
            </div>

            {/* Notes (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Remarks / Notes (Optional)
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isNotesModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isNotesModified ? 'New Value' : 'Existing Detail'}
                  </span>
                )}
              </div>
              <textarea
                id="person-form-notes"
                rows={2}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Add any additional notes or details..."
                className={`w-full px-3 py-2 rounded-xl border text-xs outline-none transition-all ${
                  isNotesModified
                    ? 'bg-violet-50/80 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                    : 'border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                }`}
              ></textarea>
            </div>

            {/* Save / Update Button */}
            <div className="pt-2">
              <motion.button
                id="person-form-save-btn"
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  !isFormComplete
                    ? 'bg-slate-400 hover:bg-slate-500 shadow-slate-400/30'
                    : isEditing && totalModifications > 0
                    ? 'bg-gradient-to-r from-violet-700 to-indigo-600 shadow-violet-600/30 hover:from-violet-800 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-blue-700 to-blue-600 shadow-blue-600/30 hover:from-blue-800 hover:to-blue-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {isEditing
                    ? totalModifications > 0
                      ? `Update Person (${totalModifications} Changes)`
                      : 'Update Person'
                    : isFormComplete
                    ? 'Save Person'
                    : 'Fill Required Fields to Add Person'}
                </span>
              </motion.button>
              {!isFormComplete && submitAttempted && (
                <p className="text-center text-[10px] text-rose-600 font-bold mt-1.5">
                  ⚠️ Please fill all required fields (Name, 10-digit Mobile & Salary)
                </p>
              )}
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
