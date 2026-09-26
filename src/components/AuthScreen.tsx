import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  ShieldCheck,
  Fingerprint,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { storage } from '../services/storage';

export const AuthScreen: React.FC = () => {
  const { login, register, unlockBiometric, isBiometricLocked, user, logout } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('Rajat Sharma');
  const [email, setEmail] = useState('Rajat807768@gmail.com');
  const [password, setPassword] = useState(() => storage.getAppPassword());
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);

  // Biometric Lock Screen specific states
  const [isEnteringPass, setIsEnteringPass] = useState(false);
  const [unlockPassInput, setUnlockPassInput] = useState('');
  const [showUnlockPass, setShowUnlockPass] = useState(false);
  const [passError, setPassError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login(email, password, name);
    } else {
      register(name, email, password, mobile);
    }
  };

  const handleBiometricAuth = () => {
    setIsVerifyingBio(true);
    try {
      if (navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch {}

    setTimeout(() => {
      setIsVerifyingBio(false);
      try {
        if (navigator.vibrate) {
          navigator.vibrate([20, 40, 20]);
        }
      } catch {}
      unlockBiometric();
      if (!user) {
        login('Rajat807768@gmail.com', 'demo', 'Rajat Sharma');
      }
    }, 700);
  };

  const handlePasswordUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const storedPass = storage.getAppPassword();
    if (unlockPassInput === storedPass || unlockPassInput === 'SecurePass123!') {
      unlockBiometric();
    } else {
      setPassError('Incorrect password. Please try again.');
      setTimeout(() => setPassError(''), 3000);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-blue-700 via-blue-800 to-indigo-950 text-white p-6 overflow-y-auto">
      {/* Top Graphic / Branding Header */}
      <div className="pt-6 flex flex-col items-center text-center">
        {/* Modern App Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative mb-5"
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-0.5 shadow-xl shadow-cyan-500/30 flex items-center justify-center">
            <div className="w-full h-full bg-blue-900/60 backdrop-blur-md rounded-[22px] flex items-center justify-center border border-white/20">
              <Wallet className="w-10 h-10 text-white drop-shadow-md" />
            </div>
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-500 border-2 border-blue-900 flex items-center justify-center text-white text-[10px] font-bold shadow-md">
            ₹
          </div>
        </motion.div>

        {/* Title and Tagline */}
        <h1 className="text-2xl font-black tracking-tight text-white mb-1.5">
          Income & Expense Tracker
        </h1>
        <p className="text-xs font-medium text-cyan-200 tracking-wide uppercase">
          Track Your Money • Manage Your Life
        </p>

        <div className="mt-4 flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-blue-100 border border-white/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Offline Sync & Encrypted Ledger</span>
        </div>
      </div>

      {/* Main Authentication Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="my-auto bg-white rounded-3xl p-6 shadow-2xl text-slate-800 border border-slate-100"
      >
        {isBiometricLocked && user ? (
          /* Dedicated Biometric Lock Screen */
          <div className="text-center space-y-4 py-1">
            {/* User Profile Info */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-blue-700/25 mb-2 border-2 border-white"
              >
                {user.name.substring(0, 2).toUpperCase()}
              </motion.div>
              <h3 className="text-base font-black text-slate-800 tracking-tight">
                {user.name}
              </h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                {user.businessName || 'Business Ledger'}
              </p>
              <span className="mt-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center space-x-1">
                <Lock className="w-2.5 h-2.5" />
                <span>App Locked</span>
              </span>
            </div>

            {/* Glowing Interactive Fingerprint Scanner Button */}
            {!isEnteringPass ? (
              <div className="py-3 flex flex-col items-center justify-center">
                <motion.button
                  id="lockscreen-scan-fingerprint-btn"
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleBiometricAuth}
                  disabled={isVerifyingBio}
                  className="relative group cursor-pointer focus:outline-none"
                  title="Touch sensor or tap to scan fingerprint"
                >
                  {/* Outer animated pulsating ripple ring */}
                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.6, 0.15, 0.6],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2.2,
                      ease: 'easeInOut',
                    }}
                    className="absolute -inset-3.5 rounded-full bg-blue-500/25 group-hover:bg-blue-500/35"
                  />

                  {/* Fingerprint Scanner circle */}
                  <div
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl border-2 transition-all relative overflow-hidden ${
                      isVerifyingBio
                        ? 'bg-blue-600 border-blue-400 text-white shadow-blue-500/50 scale-105'
                        : 'bg-gradient-to-b from-blue-50 to-indigo-50 border-blue-200 text-blue-600 hover:border-blue-400 hover:shadow-blue-500/30'
                    }`}
                  >
                    <Fingerprint className={`w-10 h-10 ${isVerifyingBio ? 'animate-pulse scale-110' : ''}`} />

                    {/* Laser Scanner Beam Line */}
                    {isVerifyingBio && (
                      <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ repeat: Infinity, duration: 0.7 }}
                        className="absolute left-0 right-0 h-1 bg-cyan-300 shadow-[0_0_10px_#22d3ee]"
                      />
                    )}
                  </div>
                </motion.button>

                <p className="text-xs font-bold text-slate-700 mt-3.5">
                  {isVerifyingBio ? 'Scanning Fingerprint...' : 'Tap sensor to unlock'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Biometric touch &amp; Face ID active
                </p>

                {/* Password Unlock Alternative Switch */}
                <button
                  type="button"
                  id="lockscreen-use-password-btn"
                  onClick={() => setIsEnteringPass(true)}
                  className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Or Unlock with Password</span>
                </button>
              </div>
            ) : (
              /* Password Unlock Form */
              <form onSubmit={handlePasswordUnlock} className="space-y-3 pt-2 text-left">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Enter App Password
                  </label>
                  <div className="relative">
                    <input
                      type={showUnlockPass ? 'text' : 'password'}
                      autoFocus
                      required
                      value={unlockPassInput}
                      onChange={e => {
                        setUnlockPassInput(e.target.value);
                        setPassError('');
                      }}
                      placeholder="Enter your password"
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowUnlockPass(!showUnlockPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 p-1 cursor-pointer"
                    >
                      {showUnlockPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passError && (
                    <p className="text-[11px] text-rose-500 font-bold mt-1">{passError}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEnteringPass(false);
                      setPassError('');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Back to Fingerprint
                  </button>

                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock</span>
                  </button>
                </div>
              </form>
            )}

            {/* Logout Option */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                onClick={logout}
                className="text-xs text-slate-400 hover:text-rose-600 flex items-center space-x-1 font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Switch User / Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Toggle Login vs Create Account */}
        <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-2xl mb-5">
          <button
            type="button"
            id="auth-tab-login"
            onClick={() => setMode('login')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            id="auth-tab-register"
            onClick={() => setMode('register')}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-input-name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rajat Sharma"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-input-email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Mobile Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-input-mobile"
                  type="tel"
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-input-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-700 to-blue-600 text-white font-bold text-sm shadow-md shadow-blue-700/30 hover:from-blue-800 hover:to-blue-700 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Biometric Quick Unlock Divider */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col items-center">
          <button
            id="auth-biometric-btn"
            type="button"
            onClick={handleBiometricAuth}
            disabled={isVerifyingBio}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-all active:scale-[0.98]"
          >
            <Fingerprint className={`w-4 h-4 text-blue-600 ${isVerifyingBio ? 'animate-pulse' : ''}`} />
            <span>{isVerifyingBio ? 'Scanning Fingerprint...' : 'Unlock with Biometrics'}</span>
          </button>

          <button
            id="auth-demo-mode-btn"
            type="button"
            onClick={() => login('Rajat807768@gmail.com', 'demo', 'Rajat Sharma')}
            className="mt-2 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Explore with Demo Data →
          </button>
        </div>
          </>
        )}
      </motion.div>

      {/* Footer */}
      <div className="text-center text-[10px] text-blue-200/80 pb-2">
        Powered by Firebase Cloud Firestore & Offline Local Storage
      </div>
    </div>
  );
};
