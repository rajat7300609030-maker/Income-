import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, CreditCard, X, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../services/calculations';

export const PersonDeleteBlockedModal: React.FC = () => {
  const {
    personDeleteBlocked,
    closePersonDeleteBlocked,
    startSettlePaymentForPerson,
  } = useApp();

  const isOpen = Boolean(personDeleteBlocked?.isOpen && personDeleteBlocked?.person && personDeleteBlocked?.summary);
  const person = personDeleteBlocked?.person;
  const summary = personDeleteBlocked?.summary;
  const isToReceive = summary?.status === 'to_receive';
  const isEmployee = person ? (['Employee', 'Staff', 'Worker'].includes(person.type) || Boolean(person.salaryAmount && person.salaryAmount > 0)) : false;

  return (
    <AnimatePresence>
      {isOpen && person && summary && (
        <motion.div
          key="person-delete-blocked-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <motion.div
            key="person-delete-blocked-card"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-rose-100 flex flex-col items-center text-center relative overflow-hidden"
          >
          {/* Subtle Ambient Red Glow */}
          <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          {/* Close Top Right X */}
          <button
            type="button"
            onClick={closePersonDeleteBlocked}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Animated Shield/Alert Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -25 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 220 }}
            className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3 shadow-md shadow-rose-200/60"
          >
            <ShieldAlert className="w-7 h-7" />
          </motion.div>

          {/* Title and Subtitle */}
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            Cannot Delete Person
          </h3>
          <p className="text-xs font-bold text-rose-600 mb-1">
            {isEmployee ? 'Salary Balance Pending' : 'Payment Due Pending'}
          </p>

          <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
            This person has an outstanding balance. To protect data integrity, a contact cannot be deleted until their account is fully settled (<span className="font-semibold text-slate-700">₹0</span>).
          </p>

          {/* Person Ledger Summary Card */}
          <div className="w-full bg-rose-50/70 border border-rose-100 rounded-2xl p-3.5 mb-4 text-left shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100/70">
              <div>
                <p className="text-xs font-black text-slate-800">{person.name}</p>
                <p className="text-[10px] text-slate-500">{person.type} • {person.mobile || 'No Mobile'}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isToReceive
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-rose-100 text-rose-800 border border-rose-200'
                }`}
              >
                {isToReceive ? 'Advance Paid' : isEmployee ? 'Remaining Salary' : 'To Pay'}
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <span className="text-xs font-semibold text-slate-600">
                {isEmployee ? 'Remaining Salary:' : isToReceive ? 'Due to Receive:' : 'Due to Pay:'}
              </span>
              <span className="text-base font-black text-red-700">
                {formatINR(summary.pendingAmount)}
              </span>
            </div>

            {summary.totalAmount > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-rose-100/60 flex items-center justify-between text-[10px] text-slate-500">
                <span>{isEmployee ? 'Total Salary:' : 'Total Amount:'} {formatINR(summary.totalAmount)}</span>
                <span>Paid: {formatINR(isToReceive ? summary.totalReceived : summary.totalPaid)}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 w-full">
            <motion.button
              id="person-delete-blocked-settle-btn"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startSettlePaymentForPerson(person, summary)}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center justify-center space-x-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Settle Payment Now</span>
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </motion.button>

            <motion.button
              id="person-delete-blocked-close-btn"
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={closePersonDeleteBlocked}
              className="w-full py-2 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all"
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
