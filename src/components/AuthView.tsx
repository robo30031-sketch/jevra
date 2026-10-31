import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, Mail, User, KeyRound, ArrowRight, CheckCircle2, AlertCircle, Sparkles, Building2, UserCheck } from 'lucide-react';
import { CURRENCY_SYMBOLS } from '../types/database';

interface AuthViewProps {
  onSuccess?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export const AuthView: React.FC<AuthViewProps> = ({ onSuccess }) => {
  const { signIn, signUp, resetPassword, switchUser, allUsers, isSupabaseLive, supabaseStatus } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to sign in. Verify your credentials.');
        } else {
          onSuccess?.();
        }
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name');
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName, currency);
        if (!res.success) {
          setErrorMsg(res.error || 'Registration failed');
        } else {
          setSuccessMsg('Account created! Your personal workspace is ready.');
          setTimeout(() => onSuccess?.(), 800);
        }
      } else if (mode === 'forgot') {
        const res = await resetPassword(email);
        if (!res.success) {
          setErrorMsg(res.error || 'Failed to send reset link');
        } else {
          setSuccessMsg(res.message || 'Password reset link sent to your email.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = (userId: string) => {
    switchUser(userId);
    onSuccess?.();
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#070D1F] text-slate-100 p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Background visual layers */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(37,99,235,0.18),transparent)]" />
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-[0_0_35px_rgba(37,99,235,0.35)] mb-4">
            <div className="flex items-center justify-center w-full h-full rounded-[14px] bg-[#0A1128]">
              <Shield className="w-7 h-7 text-cyan-400 stroke-[2.2]" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">JEVRA</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">
            Every Rupee. Every Responsibility. Every Record.
          </p>

          {/* Connection status tag */}
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-slate-900/80 border border-slate-800 text-slate-400">
            <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
            <span>{isSupabaseLive ? 'Live Supabase PostgreSQL Connected' : 'Relational Engine Active (RLS Ready)'}</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0D152D]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60">
          {/* Tabs */}
          <div className="flex border-b border-slate-800 pb-3 mb-6">
            <button
              onClick={() => { setMode('signin'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-2 text-sm font-medium transition-all text-center border-b-2 -mb-[13px] ${
                mode === 'signin'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`flex-1 pb-2 text-sm font-medium transition-all text-center border-b-2 -mb-[13px] ${
                mode === 'signup'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-200 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Preferred Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                >
                  <option value="INR">INR (₹) — Indian Rupee (Default)</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                  <option value="AED">AED — UAE Dirham</option>
                  <option value="SGD">SGD (S$) — Singapore Dollar</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Onboarding creates your default Personal Vault automatically.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/30 transition disabled:opacity-60 cursor-pointer"
            >
              <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In to JEVRA' : mode === 'signup' ? 'Create Account & Vault' : 'Send Recovery Link'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {mode === 'forgot' && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setMode('signin')}
                className="text-xs text-slate-400 hover:text-white transition"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Quick Test Accounts for Phase 1 Testing */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                Quick Test Personas (Phase 1 Security Tests)
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allUsers.slice(0, 4).map((u, i) => (
                <button
                  key={u.id}
                  onClick={() => handleQuickSwitch(u.id)}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 text-left transition group cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 border border-slate-700">
                    <img src={u.avatar_url || `https://avatar.vercel.sh/${u.id}`} alt={u.full_name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-200 group-hover:text-cyan-300 truncate">
                      {u.full_name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {i === 0 ? 'Owner / Priya' : i === 1 ? 'Treasurer / Rahul' : i === 2 ? 'Approver / Ananya' : 'Outsider / Vikram'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security disclaimer */}
        <p className="text-center text-[11px] text-slate-500 mt-4">
          Protected by PostgreSQL Row Level Security (RLS) &amp; Append-Only Audit Trigger
        </p>
      </div>
    </div>
  );
};
