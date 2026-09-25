import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, ShieldCheck, Fingerprint, ArrowRight, Sparkles, Lock, Mail, User, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthScreen: React.FC = () => {
  const { login, register, unlockBiometric, isBiometricLocked, user } = useApp();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form states
  const [name, setName] = useState('Rajat Sharma');
  const [email, setEmail] = useState('Rajat807768@gmail.com');
  const [password, setPassword] = useState('SecurePass123!');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [isVerifyingBio, setIsVerifyingBio] = useState(false);

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
    setTimeout(() => {
      setIsVerifyingBio(false);
      unlockBiometric();
      if (!user) {
        login('Rajat807768@gmail.com', 'demo', 'Rajat Sharma');
      }
    }, 900);
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
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 font-medium focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 outline-none transition-all"
              />
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
      </motion.div>

      {/* Footer */}
      <div className="text-center text-[10px] text-blue-200/80 pb-2">
        Powered by Firebase Cloud Firestore & Offline Local Storage
      </div>
    </div>
  );
};
