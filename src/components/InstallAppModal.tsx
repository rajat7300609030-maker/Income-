import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  X,
  Share2,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        key="install-modal-backdrop"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      >
        <motion.div
          key="install-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                <Smartphone className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <h3 className="text-base font-bold">Install Mobile App (APK)</h3>
                <p className="text-xs text-blue-100 font-medium">Standalone Android App Installation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4 overflow-y-auto">
            {/* App Preview Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 dark:from-slate-700/60 dark:to-slate-700/30 border border-blue-100 dark:border-slate-600/70 flex items-center space-x-3.5">
              <img
                src="/pwa-192x192.png"
                alt="App Logo"
                className="w-13 h-13 rounded-2xl shadow-md border border-white/80 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                    Income &amp; Expense Tracker
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-[9px] font-black text-white shrink-0">
                    PRO
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-300 font-medium">
                  Direct Android Install • Offline Capable
                </p>
                <div className="mt-1 flex items-center space-x-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                  <span className="flex items-center space-x-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                  <span>•</span>
                  <span>Instant Launch</span>
                </div>
              </div>
            </div>

            {/* Direct 1-Tap Install Button if available */}
            {isInstallable && !isInstalled && !installSuccess && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 animate-bounce" />
                <span>Install App on Phone Now (1-Tap)</span>
              </motion.button>
            )}

            {installSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>App installed successfully! Check your phone's Home Screen.</span>
              </div>
            )}

            {/* Step-by-Step Installation Guide */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center space-x-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>How to Install on Android Phone (Hindi &amp; English)</span>
              </h5>

              <div className="space-y-2 text-xs">
                {/* Step 1 */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700 flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      Open in Mobile Chrome / Edge browser
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Apne Android phone ke Chrome browser me ye app link open karein.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700 flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      Tap the Menu (3 Dots ⋮) at top right
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Chrome ke top-right corner me 3 dots menu button par click karein.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700 flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">
                      Tap "Install App" or "Add to Home Screen"
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Menu me <strong>"Install App"</strong> ya <strong>"Add to Home Screen"</strong> option select karein.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <p className="font-bold text-emerald-900 dark:text-emerald-200">
                      Done! Native Android App Ready
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
                      App bina kisi browser bar ke, phone ke app drawer aur home screen par full native app icon ke saath open hogi!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Advantages */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200/80 dark:border-slate-700 space-y-1.5">
              <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider block">
                Why Install as WebAPK / PWA:
              </span>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                <li>Zero storage clutter (instant lightweight APK installation)</li>
                <li>Offline support with automatic ledger caching</li>
                <li>Full-screen Android experience without browser address bar</li>
                <li>Cloud synchronization directly to Firebase Firestore</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
