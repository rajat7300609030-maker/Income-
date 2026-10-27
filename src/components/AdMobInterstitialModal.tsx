import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, ExternalLink, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { admobService } from '../services/admobService';

interface AdMobInterstitialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCompleted?: () => void;
}

export const AdMobInterstitialModal: React.FC<AdMobInterstitialModalProps> = ({
  isOpen,
  onClose,
  onAdCompleted,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const config = admobService.getConfig();
  const adUnitId = admobService.getActiveAdUnitId('interstitial');

  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setCanClose(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanClose(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleClose = () => {
    if (canClose) {
      if (onAdCompleted) onAdCompleted();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
        >
          {/* Top Bar: Ad by Google, Sound Toggle, Countdown / Close Button */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-b border-neutral-800 shrink-0">
            <div className="flex items-center space-x-2">
              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-white text-black">
                Ad
              </span>
              <span className="text-[11px] font-bold text-neutral-400">
                Google AdMob
              </span>
              {config.isTestMode && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8.5px] font-bold border border-amber-500/30">
                  TEST AD
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-full bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {canClose ? (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  className="px-2.5 py-1 rounded-full bg-white text-black text-xs font-black flex items-center space-x-1 cursor-pointer hover:bg-neutral-200 transition-colors"
                >
                  <span>Close</span>
                  <X className="w-3.5 h-3.5" />
                </motion.button>
              ) : (
                <div className="px-2.5 py-1 rounded-full bg-neutral-800 text-[10.5px] font-bold text-neutral-300">
                  Skip in {countdown}s
                </div>
              )}
            </div>
          </div>

          {/* Ad Creative Body */}
          <div className="flex-1 p-5 flex flex-col justify-between space-y-4 overflow-y-auto">
            {/* Visual Hero Banner */}
            <div className="relative rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 p-6 text-center text-white shadow-lg overflow-hidden">
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white text-2xl font-black shadow-md">
                ₹
              </div>
              <h3 className="text-lg font-black tracking-tight leading-tight mb-1">
                Khatabook Digital Ledger Pro
              </h3>
              <p className="text-xs text-white/90 leading-relaxed max-w-xs mx-auto">
                India's #1 trusted business ledger & automatic payment reminders on WhatsApp.
              </p>

              <div className="flex items-center justify-center space-x-1 mt-3 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
                <span className="text-[11px] font-bold text-white ml-1">4.8 (1M+ Reviews)</span>
              </div>
            </div>

            {/* Value props */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-neutral-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Free, Safe & Secure Cloud Backups</span>
              </div>
              <div className="flex items-center space-x-2 text-neutral-300">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Send Free SMS & WhatsApp Payment Links</span>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Install from Play Store</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>
              <p className="text-[9.5px] text-center text-neutral-500 mt-2">
                Clicking will open Play Store. Google AdMob Interstitial Ad.
              </p>
            </div>
          </div>

          {/* Footer test unit identifier */}
          {config.isTestMode && (
            <div className="px-4 py-2 bg-neutral-950 text-center border-t border-neutral-800 text-[9px] font-mono text-neutral-400">
              Unit: {adUnitId}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
