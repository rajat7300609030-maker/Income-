import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Unlock, AlertTriangle, Calendar, FileText, CheckCircle2, Handshake } from 'lucide-react';
import { Person, PersonCalculations } from '../types';
import { formatINR } from '../services/calculations';

interface PersonClosedModalProps {
  person: Person | null;
  summary: PersonCalculations | null;
  isOpen: boolean;
  onClose: () => void;
  onCloseAccount: (closedDate: string, closedReason?: string) => void;
  onReopenAccount: () => void;
  onSettleAndClose?: () => void;
}

export const PersonClosedModal: React.FC<PersonClosedModalProps> = ({
  person,
  summary,
  isOpen,
  onClose,
  onCloseAccount,
  onReopenAccount,
  onSettleAndClose,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [closedDate, setClosedDate] = useState<string>(todayStr);
  const [closedReason, setClosedReason] = useState<string>('');

  useEffect(() => {
    if (person) {
      setClosedDate(person.closedDate || todayStr);
      setClosedReason(person.closedReason || '');
    }
  }, [person, isOpen]);

  const isAlreadyClosed = person?.status === 'Closed';
  const hasPending = summary ? summary.pendingAmount > 0 : false;

  const handleClose = () => {
    onCloseAccount(closedDate || todayStr, closedReason);
    onClose();
  };

  const handleReopen = () => {
    onReopenAccount();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && person && summary && (
        <motion.div
          key="person-closed-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <motion.div
            key="person-closed-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`p-5 text-white flex items-center justify-between ${
            isAlreadyClosed
              ? 'bg-gradient-to-r from-slate-700 to-slate-800'
              : 'bg-gradient-to-r from-rose-600 to-rose-700'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                {isAlreadyClosed ? <Lock className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {isAlreadyClosed ? 'Account Closed' : 'Close Account'}
                </h3>
                <p className="text-xs text-white/80 font-medium">{person.name} • {person.type}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Financial Ledger Summary Shelf */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Final Settlement Snapshot
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-white rounded-xl border border-slate-200/70">
                  <span className="text-[10px] text-slate-500 font-bold block">Total Salary</span>
                  <span className="text-xs font-black text-slate-900 mt-0.5 block truncate">
                    {formatINR(summary.totalAmount)}
                  </span>
                </div>

                <div className="p-2 bg-blue-50/70 rounded-xl border border-blue-100">
                  <span className="text-[10px] text-blue-700 font-bold block">Total Paid</span>
                  <span className="text-xs font-black text-blue-800 mt-0.5 block truncate">
                    {formatINR(summary.totalPaid)}
                  </span>
                </div>

                <div className="p-2 bg-red-50/80 rounded-xl border border-red-200">
                  <span className="text-[10px] text-red-700 font-bold block">Remaining Due</span>
                  <span className="text-xs font-black text-red-700 mt-0.5 block truncate">
                    {formatINR(summary.pendingAmount)}
                  </span>
                </div>
              </div>

              {summary.salaryRateDescription && (
                <p className="text-[11px] font-semibold text-slate-600 mt-2 text-center truncate">
                  {summary.salaryRateDescription}
                </p>
              )}
            </div>

            {isAlreadyClosed ? (
              /* Already Closed Card */
              <div className="p-4 rounded-2xl bg-slate-100 border border-slate-300 text-slate-700 space-y-2">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>This account is currently CLOSED</span>
                </div>
                <p className="text-xs text-slate-600">
                  Closed on: <strong>{person.closedDate || 'Recorded'}</strong>
                </p>
                {person.closedReason && (
                  <p className="text-xs text-slate-600">
                    Reason: <em>"{person.closedReason}"</em>
                  </p>
                )}
                <p className="text-[11px] text-slate-500 pt-1">
                  Salary accrual is frozen as of the closing date. You can reopen this account at any time.
                </p>
              </div>
            ) : (
              /* Close Form */
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Effective Closing Date</span>
                  </label>
                  <input
                    type="date"
                    value={closedDate}
                    onChange={(e) => setClosedDate(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">
                    Salary will calculate up to this date and stop accruing afterward.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 mb-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Closing Reason / Remarks (Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={closedReason}
                    onChange={(e) => setClosedReason(e.target.value)}
                    placeholder="e.g. Completed milestone, Resigned, Full & Final settled"
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2 px-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center space-x-2">
              {isAlreadyClosed ? (
                <button
                  type="button"
                  onClick={handleReopen}
                  className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Reopen as Active</span>
                </button>
              ) : (
                <>
                  {hasPending && onSettleAndClose && (
                    <button
                      type="button"
                      onClick={() => {
                        onCloseAccount(closedDate || todayStr, closedReason);
                        onClose();
                        onSettleAndClose();
                      }}
                      className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1 transition-all"
                      title="Settle remaining balance and close account"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>Settle & Close</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClose}
                    className="py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center space-x-1.5 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Close</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
