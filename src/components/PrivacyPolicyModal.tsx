import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl text-slate-800 dark:text-slate-100 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-neutral-800 shrink-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black">Privacy Policy &amp; Ad Disclosure</h3>
                <p className="text-[10px] text-slate-400">Google AdMob &amp; Data Safety Compliance</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                <span>1. Overview &amp; Local Storage</span>
              </h4>
              <p>
                Income &amp; Expense Tracker values your privacy. Your personal financial transactions, contact lists, invoices, and ledger records are stored securely on your device and private cloud database. We never sell or share your financial data with third parties.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>2. Google AdMob &amp; Third-Party Advertising</span>
              </h4>
              <p>
                This application uses <strong>Google AdMob</strong> to display mobile advertisements (banners, interstitials, and rewarded video ads). Google may collect and use pseudonymous device identifiers (such as Android Advertising ID or IDFA), IP address, and app interaction data to serve contextual or personalized ads in accordance with Google's Privacy Policy.
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" />
                <span>3. User Consent &amp; GDPR / UMP Compliance</span>
              </h4>
              <p>
                Users in the European Economic Area (EEA), UK, or regions subject to consent regulations have the right to choose between personalized and non-personalized ads. You can reset your Advertising ID or opt out of personalized ads at any time via your Android Device Settings (<em>Settings &gt; Google &gt; Ads</em>).
              </p>
            </div>

            <div>
              <h4 className="font-black text-slate-900 dark:text-slate-100 mb-1 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                <span>4. Developer app-ads.txt Notice</span>
              </h4>
              <p>
                Our advertising inventory is authorized under the IAB Tech Lab <code>app-ads.txt</code> standard to prevent ad fraud and protect publisher credibility.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200/80 dark:border-neutral-800 text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-200 block mb-0.5">Contact Support</span>
              <p className="text-slate-500 dark:text-slate-400">
                For questions regarding this policy or data safety, email: <span className="font-mono text-blue-600 dark:text-blue-400">support@apexinfotech.in</span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950/50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              I Understand &amp; Agree
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
