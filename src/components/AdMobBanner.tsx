import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
import { admobService, AdMobConfig } from '../services/admobService';

interface AdCreative {
  title: string;
  tagline: string;
  sponsor: string;
  cta: string;
  badge: string;
  bgGradient: string;
  iconBg: string;
}

const AD_CREATIVES: AdCreative[] = [
  {
    title: 'Google Workspace for Business',
    tagline: 'Custom email, 2TB Cloud Storage & Meet. Start 14-day free trial.',
    sponsor: 'Google',
    cta: 'Try Free',
    badge: 'Productivity',
    bgGradient: 'from-blue-500/10 via-indigo-500/5 to-transparent border-blue-300 dark:border-blue-700/60',
    iconBg: 'bg-blue-600 text-white',
  },
  {
    title: 'Razorpay UPI & Instant Payments',
    tagline: 'Accept UPI, QR, Credit Cards with zero setup fee for small businesses.',
    sponsor: 'Razorpay India',
    cta: 'Get Started',
    badge: 'Fintech',
    bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent border-emerald-300 dark:border-emerald-700/60',
    iconBg: 'bg-emerald-600 text-white',
  },
  {
    title: 'Zoho Books - GST Invoicing & Accounting',
    tagline: 'Automate tax filing, invoices, and ledger tracking in 1-click.',
    sponsor: 'Zoho Corp',
    cta: 'Explore',
    badge: 'GST Ready',
    bgGradient: 'from-purple-500/10 via-fuchsia-500/5 to-transparent border-purple-300 dark:border-purple-700/60',
    iconBg: 'bg-purple-600 text-white',
  },
  {
    title: 'HDFC Vyapar Current Account',
    tagline: 'Zero balance digital current account with instant UPI QR standee.',
    sponsor: 'HDFC Bank',
    cta: 'Apply Now',
    badge: 'Banking',
    bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent border-amber-300 dark:border-amber-700/60',
    iconBg: 'bg-amber-600 text-white',
  },
];

interface AdMobBannerProps {
  className?: string;
  placement?: 'dashboard' | 'reports' | 'history' | 'bottom';
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  className = '',
  placement = 'bottom',
}) => {
  const [config, setConfig] = useState<AdMobConfig>(admobService.getConfig());
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    // Reload config on window focus or storage update
    const update = () => setConfig(admobService.getConfig());
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);

  // Rotate ads every 12 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex(prev => (prev + 1) % AD_CREATIVES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  if (!config.enabled || isDismissed) {
    return null;
  }

  // Check placement permissions
  if (placement === 'dashboard' && !config.showBannerOnDashboard) return null;
  if (placement === 'reports' && !config.showBannerOnReports) return null;
  if (placement === 'history' && !config.showBannerOnHistory) return null;

  const ad = AD_CREATIVES[currentAdIndex];
  const activeAdUnitId = admobService.getActiveAdUnitId('banner');

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className={`w-full max-w-lg mx-auto px-2 py-1.5 ${className}`}
      >
        <div
          className={`relative rounded-2xl bg-white dark:bg-neutral-900 border p-2.5 shadow-xs overflow-hidden transition-all duration-300 ${ad.bgGradient}`}
        >
          {/* Top meta strip */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1.5">
              <span className="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-black">
                Ad
              </span>
              <span className="text-[9.5px] font-bold text-slate-500 dark:text-slate-400">
                Google AdMob
              </span>
              {config.isTestMode && (
                <span className="px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[8.5px] font-extrabold border border-amber-300/60">
                  TEST MODE
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowInfoModal(true)}
                title="Ad Information"
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <Info className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                title="Close Ad"
                className="p-1 rounded-md text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Ad Content */}
          <div className="flex items-center justify-between space-x-2.5">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${ad.iconBg}`}
              >
                {ad.sponsor.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-1.5">
                  <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">
                    {ad.title}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {ad.tagline}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <motion.a
              href="#"
              onClick={e => {
                e.preventDefault();
                setShowInfoModal(true);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10.5px] font-bold shrink-0 shadow-xs flex items-center space-x-1 cursor-pointer"
            >
              <span>{ad.cta}</span>
              <ExternalLink className="w-3 h-3" />
            </motion.a>
          </div>
        </div>
      </motion.div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl text-slate-800 dark:text-slate-100"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-neutral-800">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-wider">
                    Google AdMob Info
                  </h3>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200/70 dark:border-neutral-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    Current Mode
                  </span>
                  <p className="font-black text-amber-700 dark:text-amber-400">
                    {config.isTestMode ? 'Test Mode (Official Google Test IDs)' : 'Production (Live IDs)'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-slate-200/70 dark:border-neutral-800">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">
                    Active Banner Ad Unit ID
                  </span>
                  <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 break-all">
                    {activeAdUnitId}
                  </p>
                </div>

                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  Ads help keep this financial ledger free. In production mode, you can connect your own AdMob Publisher ID in <strong>Settings → AdMob Configuration</strong>.
                </p>
              </div>

              <div className="mt-4 pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowInfoModal(false)}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
