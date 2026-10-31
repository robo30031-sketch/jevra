import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface EntrySplashProps {
  onComplete: () => void;
}

export const EntrySplash: React.FC<EntrySplashProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    // 5-step choreographed sequence as specified:
    // 1. Dark navy background appears (0s)
    // 2. JEVRA logo smoothly enters (0.6s)
    // 3. Financial line animation appears (1.4s)
    // 4. Tagline fades in (2.2s)
    // 5. Transition to main interface (3.4s)
    const t1 = setTimeout(() => setStep(2), 600);
    const t2 = setTimeout(() => setStep(3), 1400);
    const t3 = setTimeout(() => setStep(4), 2200);
    const t4 = setTimeout(() => setStep(5), 3200);
    const t5 = setTimeout(() => onComplete(), 3900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070D1F] text-white overflow-hidden select-none">
      {/* Background ambient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(14,165,233,0.15),rgba(255,255,255,0))]" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-lg px-6 text-center">
        {/* Step 2: JEVRA Emblem & Logo Entrance */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3.5 mb-6"
            >
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-[0_0_40px_rgba(37,99,235,0.4)]">
                <div className="flex items-center justify-center w-full h-full rounded-[14px] bg-[#0A1128]">
                  <Shield className="w-8 h-8 text-cyan-400 stroke-[2.2]" />
                </div>
              </div>
              <div className="text-left">
                <span className="text-3xl font-extrabold tracking-wider font-sans bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                  JEVRA
                </span>
                <span className="block text-[10px] tracking-[0.25em] uppercase text-cyan-400 font-semibold">
                  Finance &amp; Accountability
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Financial line animation */}
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: '100%' }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="w-full max-w-xs h-10 my-2 relative flex items-center justify-center"
          >
            <svg className="w-full h-12 overflow-visible" viewBox="0 0 280 40" fill="none">
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
                </linearGradient>
              </defs>
              <motion.path
                d="M 10 32 Q 50 10, 90 24 T 170 12 T 240 28 T 270 6"
                stroke="url(#lineGrad)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: 'easeInOut' }}
              />
              <motion.circle
                cx="270"
                cy="6"
                r="4"
                fill="#10b981"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.4, 1] }}
                transition={{ delay: 0.9, duration: 0.4 }}
              />
            </svg>
          </motion.div>
        )}

        {/* Step 4: Tagline Fades in */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-4"
            >
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-slate-100">
                Every Rupee. <span className="text-cyan-400">Every Responsibility.</span> Every Record.
              </h2>
              <p className="mt-2 text-xs md:text-sm text-slate-400 font-normal">
                Unified financial governance for individuals, families, groups &amp; organisations.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip button for instant entry */}
        <div className="mt-10">
          <button
            onClick={onComplete}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
          >
            <span>Enter JEVRA Console</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
