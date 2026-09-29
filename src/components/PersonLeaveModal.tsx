import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  UserCheck,
  Palmtree,
  Check,
  Plus,
  CalendarDays,
  Sparkles,
  Calculator,
} from 'lucide-react';
import { Person, PersonStatus } from '../types';

interface PersonLeaveModalProps {
  person: Person | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveLeave: (
    leaveDays: number,
    status?: PersonStatus,
    startDate?: string,
    endDate?: string,
    leaveDates?: string[]
  ) => void;
}

export const PersonLeaveModal: React.FC<PersonLeaveModalProps> = ({
  person,
  isOpen,
  onClose,
  onSaveLeave,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(todayStr);
  const [leaveDays, setLeaveDays] = useState<number>(0);
  const [status, setStatus] = useState<PersonStatus>('Active');

  // Single date picker to add a specific leave date
  const [singleDateInput, setSingleDateInput] = useState<string>(todayStr);
  // List of specifically added leave dates
  const [leaveDatesList, setLeaveDatesList] = useState<string[]>([]);

  useEffect(() => {
    if (person) {
      const initialDays = person.leaveDays || 0;
      setLeaveDays(initialDays);
      setStatus(
        person.status === 'Closed'
          ? 'Closed'
          : person.status || (initialDays > 0 ? 'On Leave' : 'Active')
      );

      const existingDates = Array.isArray(person.leaveDates)
        ? Array.from(new Set(person.leaveDates.filter(Boolean)))
        : [];
      setLeaveDatesList(existingDates);

      if (person.leaveStartDate) {
        setStartDate(person.leaveStartDate);
      } else {
        setStartDate(todayStr);
      }

      if (person.leaveEndDate) {
        setEndDate(person.leaveEndDate);
      } else if (initialDays > 1) {
        const d = new Date();
        d.setDate(d.getDate() + initialDays - 1);
        setEndDate(d.toISOString().split('T')[0]);
      } else {
        setEndDate(todayStr);
      }
    }
  }, [person, isOpen, todayStr]);

  // Automatic "Add More Leave Days" function: increments days & extends date range automatically
  const handleAddMoreDays = (daysToAdd: number) => {
    const current = Math.max(0, leaveDays);
    const newTotal = current + daysToAdd;
    setLeaveDays(newTotal);
    if (status !== 'Closed') setStatus('On Leave');

    // Automatically extend end date by additional days
    const baseDateStr = endDate || startDate || todayStr;
    const baseDate = new Date(baseDateStr + 'T00:00:00');
    if (!isNaN(baseDate.getTime())) {
      const newEnd = new Date(baseDate);
      newEnd.setDate(newEnd.getDate() + daysToAdd);
      setEndDate(newEnd.toISOString().split('T')[0]);
    }
  };

  // Add a specific individual leave date
  const handleAddSingleDate = () => {
    if (!singleDateInput) return;
    if (!leaveDatesList.includes(singleDateInput)) {
      const updated = [...leaveDatesList, singleDateInput].sort();
      setLeaveDatesList(updated);
      setLeaveDays(Math.max(updated.length, leaveDays + 1));
      if (status !== 'Closed') setStatus('On Leave');

      // Adjust start & end range to enclose new date
      if (singleDateInput < startDate) setStartDate(singleDateInput);
      if (singleDateInput > endDate) setEndDate(singleDateInput);
    }
  };

  // Remove a specific individual leave date
  const handleRemoveSingleDate = (dateToRemove: string) => {
    const updated = leaveDatesList.filter(d => d !== dateToRemove);
    setLeaveDatesList(updated);
    const newDays = Math.max(0, leaveDays - 1);
    setLeaveDays(newDays);
    if (newDays === 0) {
      setStatus('Active');
    }
  };

  // Manual Adjust Stepper
  const handleManualDaysChange = (newDays: number) => {
    const val = Math.max(0, newDays);
    setLeaveDays(val);
    if (val === 0) {
      setStatus('Active');
      setLeaveDatesList([]);
    } else {
      if (status !== 'Closed') setStatus('On Leave');
      const startD = new Date(startDate + 'T00:00:00');
      if (!isNaN(startD.getTime())) {
        const endD = new Date(startD);
        endD.setDate(endD.getDate() + val - 1);
        setEndDate(endD.toISOString().split('T')[0]);
      }
    }
  };

  const handleSave = () => {
    const finalStatus: PersonStatus =
      status === 'Closed' ? 'Closed' : leaveDays > 0 ? 'On Leave' : 'Active';
    onSaveLeave(
      leaveDays,
      finalStatus,
      leaveDays > 0 ? startDate : undefined,
      leaveDays > 0 ? endDate : undefined,
      leaveDatesList
    );
    onClose();
  };

  const rate = Number(person?.salaryAmount) || 0;
  const isDaily = person?.salaryType === 'Daily';
  const isMonthly = person?.salaryType === 'Monthly';
  const dailyRate = isDaily ? rate : isMonthly ? Math.round(rate / 30) : 0;
  const totalDeduction = leaveDays * dailyRate;

  // Calculate working days from joining date
  const joiningDateObj = person?.joiningDate ? new Date(person.joiningDate + 'T00:00:00') : new Date();
  const totalDaysSinceJoining = Math.max(
    1,
    Math.round((Date.now() - joiningDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
  const activeWorkingDays = Math.max(0, totalDaysSinceJoining - leaveDays);

  return (
    <AnimatePresence>
      {isOpen && person && (
        <motion.div
          key="person-leave-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        >
          <motion.div
            key="person-leave-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                <Palmtree className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold">Leave Management</h3>
                <p className="text-xs text-amber-100 font-medium">
                  {person.name} • {person.type}
                  {person.salaryAmount ? ` (₹${person.salaryAmount.toLocaleString('en-IN')}/${person.salaryType === 'Daily' ? 'day' : 'mo'})` : ''}
                  {leaveDays > 0 ? ` • ${leaveDays} ${leaveDays === 1 ? 'Day' : 'Days'} Leave` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4.5 space-y-4 overflow-y-auto">
            {/* Employment Status Selector */}
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
                Staff Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatus('Active');
                    setLeaveDays(0);
                    setLeaveDatesList([]);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    status === 'Active' && leaveDays === 0
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-2 ring-emerald-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Active at Work</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStatus('On Leave');
                    if (leaveDays === 0) setLeaveDays(1);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                    status === 'On Leave' || leaveDays > 0
                      ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-xs ring-2 ring-amber-400/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Palmtree className="w-4 h-4 text-amber-600" />
                  <span>Mark On Leave</span>
                </button>
              </div>
            </div>

            {/* 1. Option to Add Person's Specific Leave Date */}
            <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 flex items-center space-x-1.5">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span>Add Specific Leave Date</span>
                </span>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                  Individual Date
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={singleDateInput}
                  onChange={e => setSingleDateInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-blue-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddSingleDate}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Date</span>
                </button>
              </div>

              {/* Chips of added dates */}
              {leaveDatesList.length > 0 && (
                <div className="pt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Added Leave Dates ({leaveDatesList.length}):
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {leaveDatesList.map((dateStr, idx) => (
                      <span
                        key={`leave-chip-${dateStr}-${idx}`}
                        className="inline-flex items-center space-x-1 bg-white border border-blue-200 text-blue-900 text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-2xs"
                      >
                        <span>
                          {new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSingleDate(dateStr)}
                          className="hover:text-rose-600 transition-colors cursor-pointer ml-1 p-0.5"
                          title="Remove date"
                        >
                          <X className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 2. Fully Automatic "Add More Leave Days" Option */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Add More Leave Days (Automatic)</span>
                </span>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md">
                  Instant Extension
                </span>
              </div>

              <p className="text-[11px] text-slate-600">
                Click any button to automatically add more leave days and extend leave period:
              </p>

              {/* Quick Add Buttons: +1, +2, +3, +5, +7, +10, +15 */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {[1, 2, 3, 5, 7, 10, 15].map(d => (
                  <button
                    key={`leave-more-days-${d}`}
                    type="button"
                    onClick={() => handleAddMoreDays(d)}
                    className="py-1.5 px-1 bg-white hover:bg-indigo-600 hover:text-white text-indigo-800 font-extrabold text-xs rounded-xl border border-indigo-200 transition-all shadow-2xs cursor-pointer active:scale-95 text-center flex flex-col items-center justify-center group"
                  >
                    <span>+{d}</span>
                    <span className="text-[9px] font-medium opacity-70 group-hover:text-indigo-100">
                      {d === 1 ? 'Day' : 'Days'}
                    </span>
                  </button>
                ))}
              </div>

              {/* Manual Increment/Decrement Stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-indigo-200/60">
                <span className="text-[11px] font-bold text-slate-700">Custom Days Adjust:</span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleManualDaysChange(leaveDays - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center text-sm shadow-2xs cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="0"
                    value={leaveDays}
                    onChange={e => handleManualDaysChange(parseInt(e.target.value) || 0)}
                    className="w-14 text-center py-1 bg-white border border-indigo-200 rounded-lg font-black text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleManualDaysChange(leaveDays + 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-indigo-200 text-indigo-900 font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center text-sm shadow-2xs cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Automated Salary Impact & Working Days Calculation */}
            {rate > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white shadow-md space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold flex items-center space-x-1.5 text-amber-300">
                    <Calculator className="w-4 h-4" />
                    <span>Automatic Salary Adjustment</span>
                  </span>
                  <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-slate-200">
                    Auto-Calculated
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white/10 p-2 rounded-xl">
                    <p className="text-[10px] text-slate-300">Total Period</p>
                    <p className="text-xs font-black text-white">{totalDaysSinceJoining} Days</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <p className="text-[10px] text-amber-300">Leave Deducted</p>
                    <p className="text-xs font-black text-amber-400">-{leaveDays} Days</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-xl">
                    <p className="text-[10px] text-emerald-300">Active Work</p>
                    <p className="text-xs font-black text-emerald-400">{activeWorkingDays} Days</p>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 pt-1 flex items-center justify-between border-t border-white/10">
                  <span>
                    Rate: ₹{dailyRate.toLocaleString('en-IN')}/day • Total Deduction:
                  </span>
                  <span className="text-xs font-black text-rose-400">
                    -₹{totalDeduction.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-bold shadow-md shadow-amber-600/30 flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Leave Record ({leaveDays} Days)</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};
