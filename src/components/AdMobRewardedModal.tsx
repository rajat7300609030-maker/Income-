import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Award, CheckCircle2, Play, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { admobService } from '../services/admobService';

interface AdMobRewardedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: () => void;
  rewardTitle?: string;
}

export const AdMobRewardedModal: React.FC<AdMobRewardedModalProps> = ({
  isOpen,
  onClose,
  onRewardEarned,
  rewardTitle = 'Unlock Premium PDF Statement',
}) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const config = admobService.getConfig();
  const adUnitId = admobService.getActiveAdUnitId('rewarded');

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsCompleted(false);
      return;
    }

    const duration = 6000; // 6 seconds rewarded ad
    const intervalTime = 100;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setIsCompleted(true);
          onRewardEarned();
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, onRewardEarned]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-sm rounded-3xl bg-neutral-900 border border-neutral-800 text-white shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-neutral-950/80 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                Rewarded Ad
              </span>
              {config.isTestMode && (
                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[8.5px] font-bold">
                  TEST
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {isCompleted ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1"
                >
                  <span>Done</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-[10px] font-mono text-neutral-400">
                  {Math.max(0, Math.ceil((100 - progress) / 16.6))}s
                </span>
              )}
            </div>
          </div>

          {/* Video Progress Bar */}
          <div className="w-full h-1 bg-neutral-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Ad Content */}
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full mx-auto bg-gradient-to-tr from-amber-500 to-yellow-400 text-black flex items-center justify-center shadow-lg shadow-amber-500/30">
              {isCompleted ? (
                <CheckCircle2 className="w-8 h-8 text-black" />
              ) : (
                <Play className="w-8 h-8 text-black fill-current ml-1" />
              )}
            </div>

            <div>
              <h3 className="text-base font-black">
                {isCompleted ? 'Reward Granted!' : 'Watching Sponsored Video'}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                {isCompleted
                  ? `You have unlocked: ${rewardTitle}`
                  : `Watch till the end to unlock: ${rewardTitle}`}
              </p>
            </div>

            {isCompleted && (
              <motion.button
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
              >
                Claim &amp; Continue
              </motion.button>
            )}
          </div>

          {/* Ad Unit ID note */}
          {config.isTestMode && (
            <div className="px-4 py-1.5 bg-neutral-950 text-center border-t border-neutral-800 text-[8.5px] font-mono text-neutral-500">
              Unit: {adUnitId}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
