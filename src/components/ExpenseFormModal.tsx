import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowUpRight, Check, Calendar, User, Sparkles, AlertCircle, Handshake } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, ExpenseRecord, PAYMENT_METHODS, PAYMENT_METHOD_CONFIGS } from '../types';

export const ExpenseFormModal: React.FC = () => {
  const { activeModal, closeQuickAction, saveExpense, savePayment, deleteExpense, persons, editItem } = useApp();

  const isOpen = activeModal === 'add_expense';
  const isEditing = editItem?.type === 'expense' && editItem.data;

  const [category, setCategory] = useState('General Expense');
  const [personId, setPersonId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [description, setDescription] = useState('');
  const [noteError, setNoteError] = useState('');

  const isGeneralOverhead = false;

  // Store original snapshot for edit comparisons
  const original = useMemo(() => {
    if (isEditing && editItem?.data) {
      const exp: ExpenseRecord = editItem.data;
      return {
        category: exp.category || 'General Expense',
        personId: exp.personId || '',
        amount: String(exp.amount || ''),
        date: exp.date || '',
        paymentMethod: exp.paymentMethod || 'UPI',
        description: exp.description || '',
      };
    }
    return null;
  }, [isEditing, editItem]);

  useEffect(() => {
    setNoteError('');
    if (isEditing && editItem?.data) {
      const exp: ExpenseRecord = editItem.data;
      setCategory(exp.category || 'General Expense');
      setPersonId(exp.personId || '');
      setAmount(String(exp.amount || ''));
      setDate(exp.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(exp.paymentMethod || 'UPI');
      setDescription(exp.description || '');
    } else {
      setCategory('General Expense');
      setPersonId('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setDescription('');
    }
  }, [isOpen, isEditing, editItem]);

  // Track modified fields
  const isAmountModified = isEditing && original && amount !== original.amount;
  const isPersonModified = isEditing && original && personId !== original.personId;
  const isDateModified = isEditing && original && date !== original.date;
  const isMethodModified = isEditing && original && paymentMethod !== original.paymentMethod;
  const isDescModified = isEditing && original && description !== original.description;

  const totalModifications = [
    isAmountModified,
    isPersonModified,
    isDateModified,
    isMethodModified,
    isDescModified,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    // Strict validation: Note is mandatory when General Overhead is selected
    if (isGeneralOverhead && !description.trim()) {
      setNoteError('General Overhead ke liye Note bharna zaroori hai! Kripya kharch ka vivran (details) likhein.');
      const descEl = document.getElementById('expense-form-desc');
      if (descEl) descEl.focus();
      return;
    }

    const matchedPerson = persons.find(p => p.id === personId);

    if (matchedPerson) {
      // User requirement: When a person is selected in Add Expense,
      // the entry must be saved directly under that person's Payment (Paid)
      if (isEditing && editItem?.type === 'expense' && editItem?.data?.id) {
        deleteExpense(editItem.data.id);
      }

      savePayment(
        {
          personId: matchedPerson.id,
          personName: matchedPerson.name,
          amount: parsedAmount,
          date,
          type: 'Paid',
          paymentMethod,
          category: category || 'Expense Payment',
          note: description.trim(),
        },
        isEditing && editItem?.type === 'payment' ? editItem.data.id : undefined
      );
    } else {
      // General expense without specific person (General Overhead, utilities, etc.)
      saveExpense(
        {
          category,
          amount: parsedAmount,
          date,
          paymentMethod,
          description: description.trim(),
        },
        isEditing ? editItem.data.id : undefined
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="expense-form-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs"
        >
          <motion.div
            key="expense-form-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header - Red Accent for Expense */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-rose-50/60">
            <div className="flex items-center space-x-2.5">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs"
              >
                <ArrowUpRight className="w-5 h-5" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    {isEditing ? 'Edit Expense' : 'Add Expense'}
                  </h3>
                  {isEditing && totalModifications > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-xs flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 inline" />
                      <span>{totalModifications} Changed</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-rose-700 font-medium">
                  {isEditing ? 'Existing details loaded. Modified fields shown in new color.' : 'Record money outflow'}
                </p>
              </div>
            </div>

            <motion.button
              id="expense-form-close"
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
            {/* Amount */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">
                  Expense Amount (₹) <span className="text-rose-500">*</span>
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
                    isAmountModified ? 'text-violet-600' : 'text-rose-600'
                  }`}
                >
                  ₹
                </span>
                <input
                  id="expense-form-amount"
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
                      : 'bg-rose-50/30 border-2 border-rose-200 text-rose-800 placeholder-rose-300 focus:border-rose-600 focus:ring-4 focus:ring-rose-600/10'
                  }`}
                />
              </div>
              {isAmountModified && original && (
                <p className="text-[10px] text-violet-700 font-semibold mt-1">
                  Original: ₹{parseFloat(original.amount || '0').toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Select Person / Vendor (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Payee / Person / Vendor (Optional)
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isPersonModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isPersonModified ? 'New Payee' : 'Existing Payee'}
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
                  id="expense-form-person"
                  value={personId}
                  onChange={e => setPersonId(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-semibold outline-none appearance-none transition-all ${
                    isPersonModified
                      ? 'bg-violet-50 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 bg-white focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20'
                  }`}
                >
                  <option value="">General Overhead (No specific person)</option>
                  {persons.map((p, idx) => (
                    <option key={`${p.id || 'p'}-${idx}`} value={p.id}>
                      {p.name} ({p.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Informative notification when a person is selected */}
              {Boolean(personId) && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-200 text-xs flex items-center space-x-2"
                >
                  <Handshake className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <div className="leading-tight">
                    <span className="font-extrabold text-amber-900 dark:text-amber-100">Person Selected: </span>
                    Ye entry person ke <span className="font-bold underline text-amber-800 dark:text-amber-300">Payment (Paid)</span> me add ho kar show hogi.
                  </div>
                </motion.div>
              )}
            </div>

            {/* Date */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Date <span className="text-rose-500">*</span>
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
                  id="expense-form-date"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDateModified
                      ? 'bg-violet-50 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20'
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
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(method => {
                  const cfg = PAYMENT_METHOD_CONFIGS[method];
                  const isSelected = paymentMethod === method;
                  return (
                    <motion.button
                      key={method}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-2.5 text-center rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center justify-center space-x-1.5 ${
                        isSelected
                          ? cfg.activeClass
                          : cfg.inactiveClass
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? 'bg-white' : cfg.dotColor}`} />
                      <span>{method}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Description / Note */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>Description / Note</span>
                  {isGeneralOverhead ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 flex items-center space-x-1 animate-pulse">
                      <span>* MANDATORY</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 font-normal lowercase text-[10px]">(optional)</span>
                  )}
                </label>
                {isEditing && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                      isDescModified
                        ? 'bg-violet-100 text-violet-800 border border-violet-300 font-bold'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isDescModified ? 'New Note' : 'Existing Note'}
                  </span>
                )}
              </div>

              {/* High-visibility Warning Notice when General Overhead is selected */}
              {isGeneralOverhead && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300/90 text-amber-950 text-xs flex items-start space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <span className="font-extrabold text-amber-900">Most Important: </span>
                    General Overhead select hone par note fill karna zaroori hai taaki overhead expense track ho sake.
                  </div>
                </motion.div>
              )}

              <textarea
                id="expense-form-desc"
                rows={2}
                required={isGeneralOverhead}
                value={description}
                onChange={e => {
                  setDescription(e.target.value);
                  if (noteError && e.target.value.trim()) setNoteError('');
                }}
                placeholder={
                  isGeneralOverhead
                    ? 'e.g. Office maintenance, internet charges, tea/snacks, electricity (REQUIRED)...'
                    : 'e.g. Office electricity bill, team lunch, stationery...'
                }
                className={`w-full p-3 rounded-xl border text-xs outline-none transition-all ${
                  noteError
                    ? 'bg-rose-50 border-2 border-rose-500 text-rose-950 ring-4 ring-rose-500/20'
                    : isGeneralOverhead && !description.trim()
                    ? 'bg-amber-50/50 border-amber-300 text-slate-800 placeholder-amber-700/60 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : isDescModified
                    ? 'bg-violet-50 border-violet-500 text-violet-950 font-semibold ring-2 ring-violet-500/20'
                    : 'border-slate-200 text-slate-800 placeholder-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-600/20'
                }`}
              ></textarea>
              {noteError ? (
                <p className="text-xs text-rose-600 font-bold mt-1.5 flex items-center space-x-1 animate-bounce">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{noteError}</span>
                </p>
              ) : isDescModified && original ? (
                <p className="text-[10px] text-violet-700 font-semibold mt-1">
                  Original: &ldquo;{original.description || 'Empty'}&rdquo;
                </p>
              ) : null}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <motion.button
                id="expense-form-save-btn"
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  isEditing && totalModifications > 0
                    ? 'bg-gradient-to-r from-violet-700 to-indigo-600 shadow-violet-600/30 hover:from-violet-800 hover:to-indigo-700'
                    : personId
                    ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 shadow-amber-600/30 hover:from-amber-600 hover:to-orange-700'
                    : 'bg-gradient-to-r from-rose-600 to-rose-500 shadow-rose-600/30 hover:from-rose-700 hover:to-rose-600'
                }`}
              >
                {personId ? <Handshake className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                <span>
                  {isEditing
                    ? totalModifications > 0
                      ? `Update Entry (${totalModifications} Changes)`
                      : personId
                      ? 'Update Person Payment'
                      : 'Update Expense'
                    : personId
                    ? 'Save to Person Payment (Paid)'
                    : 'Save Expense'}
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
