import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowDownLeft, Check, Calendar, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaymentMethod, IncomeRecord, PAYMENT_METHODS, PAYMENT_METHOD_CONFIGS } from '../types';

export const IncomeFormModal: React.FC = () => {
  const { activeModal, closeQuickAction, saveIncome, editItem } = useApp();

  const isOpen = activeModal === 'add_income';
  const isEditing = editItem?.type === 'income' && editItem.data;

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [description, setDescription] = useState('');

  // Store original snapshot for edit comparisons
  const original = useMemo(() => {
    if (isEditing && editItem?.data) {
      const inc: IncomeRecord = editItem.data;
      return {
        amount: String(inc.amount || ''),
        date: inc.date || '',
        paymentMethod: inc.paymentMethod || 'UPI',
        description: inc.description || '',
      };
    }
    return null;
  }, [isEditing, editItem]);

  useEffect(() => {
    if (isEditing && editItem?.data) {
      const inc: IncomeRecord = editItem.data;
      setAmount(String(inc.amount || ''));
      setDate(inc.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(inc.paymentMethod || 'UPI');
      setDescription(inc.description || '');
    } else {
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('UPI');
      setDescription('');
    }
  }, [isOpen, isEditing, editItem]);

  // Track modified fields
  const isAmountModified = isEditing && original && amount !== original.amount;
  const isDateModified = isEditing && original && date !== original.date;
  const isMethodModified = isEditing && original && paymentMethod !== original.paymentMethod;
  const isDescModified = isEditing && original && description !== original.description;

  const totalModifications = [
    isAmountModified,
    isDateModified,
    isMethodModified,
    isDescModified,
  ].filter(Boolean).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    saveIncome(
      {
        personId: isEditing && editItem?.data?.personId ? editItem.data.personId : undefined,
        personName: isEditing && editItem?.data?.personName ? editItem.data.personName : undefined,
        amount: parsedAmount,
        date,
        paymentMethod,
        description: description.trim(),
      },
      isEditing ? editItem.data.id : undefined
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="income-form-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs"
        >
          <motion.div
            key="income-form-card"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="w-full max-w-md bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
        >
          {/* Header - Green Accent for Income */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-emerald-50/60">
            <div className="flex items-center space-x-2.5">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -10 }}
                className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs"
              >
                <ArrowDownLeft className="w-5 h-5" />
              </motion.div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-800 tracking-tight">
                    {isEditing ? 'Edit Income' : 'Add Income'}
                  </h3>
                  {isEditing && totalModifications > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-600 text-white shadow-xs flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 inline" />
                      <span>{totalModifications} Changed</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-700 font-medium">
                  {isEditing ? 'Existing details loaded. Modified fields shown in new color.' : 'Record money inflow'}
                </p>
              </div>
            </div>

            <motion.button
              id="income-form-close"
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
                <label className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                  Income Amount (₹) <span className="text-rose-500">*</span>
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
                    isAmountModified ? 'text-violet-600' : 'text-emerald-600'
                  }`}
                >
                  ₹
                </span>
                <input
                  id="income-form-amount"
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
                      : 'bg-emerald-50/30 border-2 border-emerald-200 text-emerald-800 placeholder-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'
                  }`}
                />
              </div>
              {isAmountModified && original && (
                <p className="text-[10px] text-violet-700 font-semibold mt-1">
                  Original: ₹{parseFloat(original.amount || '0').toLocaleString('en-IN')}
                </p>
              )}
            </div>

            {/* Description / Note */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Description / Note
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
              <textarea
                id="income-form-desc"
                rows={2}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Website development advance, consulting fee..."
                className={`w-full p-3 rounded-xl border text-xs outline-none transition-all ${
                  isDescModified
                    ? 'bg-violet-50 border-violet-500 text-violet-950 font-semibold ring-2 ring-violet-500/20'
                    : 'border-slate-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'
                }`}
              ></textarea>
              {isDescModified && original && (
                <p className="text-[10px] text-violet-700 font-semibold mt-1">
                  Original: &ldquo;{original.description || 'Empty'}&rdquo;
                </p>
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
                  id="income-form-date"
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs font-medium outline-none transition-all ${
                    isDateModified
                      ? 'bg-violet-50 border-violet-500 text-violet-950 font-bold ring-2 ring-violet-500/20'
                      : 'border-slate-200 text-slate-800 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20'
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

            {/* Save Button */}
            <div className="pt-2">
              <motion.button
                id="income-form-save-btn"
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                  isEditing && totalModifications > 0
                    ? 'bg-gradient-to-r from-violet-700 to-indigo-600 shadow-violet-600/30 hover:from-violet-800 hover:to-indigo-700'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-500 shadow-emerald-600/30 hover:from-emerald-700 hover:to-emerald-600'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>
                  {isEditing
                    ? totalModifications > 0
                      ? `Update Income (${totalModifications} Changes)`
                      : 'Update Income'
                    : 'Save Income'}
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
