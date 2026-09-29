import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Handshake, Check, Calendar, User, Tag, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentDirection, PaymentMethod, PaymentRecord, PaymentCategory, PAYMENT_CATEGORIES } from '../types';

export const PaymentFormModal: React.FC = () => {
  const { activeModal, closeQuickAction, savePayment, persons, editItem } = useApp();

  const isOpen = activeModal === 'add_payment';
  const isExistingRecord = Boolean(editItem?.type === 'payment' && editItem?.data?.id);
  const isPrefill = Boolean(editItem?.type === 'payment' && editItem?.data && !editItem?.data?.id);
  const isEditing = isExistingRecord;

  const [personId, setPersonId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<PaymentDirection>('Received');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [category, setCategory] = useState<PaymentCategory>('Other');

  // Store original snapshot for edit comparisons
  const original = useMemo(() => {
    if (isEditing && editItem?.data) {
      const p: PaymentRecord = editItem.data;
      return {
        personId: p.personId || '',
        amount: String(p.amount || ''),
        date: p.date || '',
        type: p.type || 'Received',
        paymentMethod: p.paymentMethod || 'UPI',
        category: (p.category as PaymentCategory) || 'Other',
      };
    }
    return null;
  }, [isEditing, editItem]);

  useEffect(() => {
    if ((isExistingRecord || isPrefill) && editItem?.data) {
      const p: PaymentRecord = editItem.data;
      setPersonId(p.personId || persons[0]?.id || '');
      setAmount(p.amount ? String(p.amount) : '');
      setDate(p.date || new Date().toISOString().split('T')[0]);
      setType(p.type || 'Received');
      setPaymentMethod(p.paymentMethod || 'UPI');
      setCategory((p.category as PaymentCategory) || 'Other');
    } else {
      setPersonId(persons[0]?.id || '');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setType('Received');
      setPaymentMethod('UPI');
      setCategory('Other');
    }
  }, [isOpen, isExistingRecord, isPrefill, editItem, persons]);

  // Track modified fields
  const isAmountModified = isEditing && original && amount !== original.amount;
  const isPersonModified = isEditing && original && personId !== original.personId;
  const isDateModified = isEditing && original && date !== original.date;
  const isTypeModified = isEditing && original && type !== original.type;
  const isMethodModified = isEditing && original && paymentMethod !== original.paymentMethod;
  const isCategoryModified = isEditing && original && category !== original.category;

  const totalModifications = [
    isAmountModified,
    isPersonModified,
    isDateModified,
    isTypeModified,
    isMethodModified,
    isCategoryModified,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    const matchedPerson = persons.find(p => p.id === personId);
    const finalPersonId = matchedPerson?.id || personId || (isEditing ? editItem.data.personId : persons[0]?.id || 'per_gen');
    const finalPersonName = matchedPerson?.name || (isEditing ? editItem.data.personName : persons[0]?.name || 'General Contact');

    savePayment(
      {
        personId: finalPersonId,
        personName: finalPersonName,
        amount: parsedAmount,
        date,
        type,
        paymentMethod,
        category,
      },
      isEditing ? editItem.data.id : undefined
    );
  };

  const paymentMethods: PaymentMethod[] = ['UPI', 'Cash', 'Bank', 'Other'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="payment-form-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs"
        >
          <motion.div
            key="payment-form-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-amber-50/60">
            <div className="flex items-center space-x-2.5">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs"
              >
                <Handshake className="w-5 h-5" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    {isEditing ? 'Edit Payment' : isPrefill ? `Record Payment • ${editItem?.data?.personName || 'Contact'}` : 'Record Payment'}
                  </h3>
                  {isEditing && totalModifications > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-xs flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 inline" />
                      <span>{totalModifications} Changed</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-700 font-medium">
                  {isEditing ? 'Existing details loaded. Modified fields shown in new color.' : isPrefill ? 'Ledger balance settlement' : 'Clear ledger & settlements'}
                </p>
              </div>
            </div>

            <motion.button
              id="payment-form-close"
              type="button"
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeQuickAction}
              className="w-8 h-8 rounded-full hover:bg-slate-200/60 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Payment Direction: Received vs Paid */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Payment Direction <span className="text-rose-500">*</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isTypeModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isTypeModified ? `New (${type})` : 'Existing Direction'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  type="button"
                  id="payment-type-received"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setType('Received')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    type === 'Received'
                      ? isTypeModified
                        ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400'
                        : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Received (Money In)</span>
                </motion.button>
                <motion.button
                  type="button"
                  id="payment-type-paid"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setType('Paid')}
                  className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                    type === 'Paid'
                      ? isTypeModified
                        ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400'
                        : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Paid (Money Out)</span>
                </motion.button>
              </div>
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                  Payment Amount (₹) <span className="text-rose-500">*</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isAmountModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isAmountModified ? 'New Amount' : 'Existing Amount'}
                  </span>
                )}
              </div>
              <div className="relative">
                <span
                  className={`font-extrabold absolute left-4 top-1/2 -translate-y-1/2 text-2xl ${
                    isAmountModified ? 'text-violet-600' : 'text-amber-600'
                  }`}
                >
                  ₹
                </span>
                <input
                  id="payment-form-amount"
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl text-xl font-black outline-none transition-all ${
                    isAmountModified
                      ? 'bg-violet-50 border-2 border-violet-500 text-violet-950 ring-4 ring-violet-500/10'
                      : 'bg-amber-50/30 border-2 border-amber-200 text-amber-900 placeholder-amber-300 focus:border-amber-600 focus:ring-4 focus:ring-amber-600/10'
                  }`}
                />
              </div>
              {isAmountModified && original && (
                <p className="text-[10px] text-violet-700 font-semibold mt-1">
                  Original: ₹{parseFloat(original.amount || '0').toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Select Person */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Select Person <span className="text-rose-500">*</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isPersonModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPersonModified ? 'New Contact' : 'Existing Contact'}
                  </span>
                )}
              </div>
              <div className="relative">
                <User
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isPersonModified ? 'text-violet-600' : 'text-slate-400'
                  }`}
                />
                <select
                  id="payment-form-person"
                  required
                  value={personId}
                  onChange={e => setPersonId(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold outline-none appearance-none transition-all ${
                    isPersonModified
                      ? 'bg-violet-50 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
                  }`}
                >
                  <option value="" disabled>
                    -- Select Contact --
                  </option>
                  {persons.map((p, idx) => (
                    <option key={`${p.id || 'p'}-${idx}`} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Payment Date <span className="text-rose-500">*</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isDateModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDateModified ? 'New Date' : 'Existing Date'}
                  </span>
                )}
              </div>
              <div className="relative">
                <Calendar
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDateModified ? 'text-violet-600' : 'text-slate-400'
                  }`}
                />
                <input
                  id="payment-form-date"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDateModified
                      ? 'bg-violet-50 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
                  }`}
                />
              </div>
              {isDateModified && original && (
                <p className="text-[10px] text-violet-700 font-semibold mt-1">
                  Original Date: {original.date}
                </p>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Payment Method
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isMethodModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isMethodModified ? `New (${paymentMethod})` : 'Existing Method'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2">
                {paymentMethods.map(method => (
                  <motion.button
                    key={method}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 text-center rounded-xl text-xs font-bold transition-all ${
                      paymentMethod === method
                        ? isMethodModified
                          ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-400'
                          : 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {method}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Category / Purpose Dropdown */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center space-x-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>Category / Purpose</span>
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isCategoryModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCategoryModified ? 'New Category' : 'Existing Category'}
                  </span>
                )}
              </div>

              <div className="relative">
                <select
                  id="payment-form-category"
                  value={category}
                  onChange={e => setCategory(e.target.value as PaymentCategory)}
                  className={`w-full px-3.5 py-3 rounded-xl border text-xs font-bold appearance-none outline-none transition-all cursor-pointer ${
                    isCategoryModified
                      ? 'bg-violet-50 border-violet-500 text-violet-950 ring-2 ring-violet-500/20'
                      : 'bg-slate-50/80 border-slate-200 text-slate-800 hover:border-slate-300 focus:bg-white focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20'
                  }`}
                >
                  <option value="School & College">School & College</option>
                  <option value="Home">Home</option>
                  <option value="Salary & Pension">Salary & Pension</option>
                  <option value="Rent">Rent</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Quick Select Category Badges */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {PAYMENT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                      category === cat
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {isCategoryModified && original && (
                <p className="text-[10px] text-violet-700 font-semibold mt-1.5">
                  Original Category: &ldquo;{original.category || 'Other'}&rdquo;
                </p>
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <motion.button
                id="payment-form-save-btn"
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  isEditing && totalModifications > 0
                    ? 'bg-gradient-to-r from-violet-700 to-indigo-600 shadow-violet-600/30 hover:from-violet-800 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-amber-600 to-amber-500 shadow-amber-600/30 hover:from-amber-700 hover:to-amber-600'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {isEditing
                    ? totalModifications > 0
                      ? `Update Payment (${totalModifications} Changes)`
                      : 'Update Payment'
                    : 'Save Payment'}
                </span>
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
