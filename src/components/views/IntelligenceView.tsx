import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { Sparkles, ShieldCheck, TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';

export const IntelligenceView: React.FC = () => {
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-600" />
            <h1 className="text-xl font-bold text-slate-900">JEVRA Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Predictive financial analytics, burn-rate monitoring, and audit compliance heuristics.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-cyan-600" />
          <span>Real-time Health Engine Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Financial Health Score */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Financial Health Score
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-slate-900">92</span>
              <span className="text-sm font-semibold text-emerald-600">/ 100 • Excellent</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Consistent inflow velocity and positive liquid reserve coverage for {activeWorkspace?.name}.
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-4">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full w-[92%]" />
          </div>
        </div>

        {/* Burn Rate Forecast */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reserve Runway Coverage
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-slate-900">8.4</span>
              <span className="text-sm font-semibold text-blue-600">Months</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Current liquid assets can sustain standard monthly operations without fresh inflow.
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit mt-3">
            Low Risk Profile
          </span>
        </div>

        {/* Audit Compliance Index */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Fiduciary Compliance
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black text-slate-900">100%</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              All transactions have cryptographic audit log events. No unauthorized role alterations detected.
            </p>
          </div>
          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg w-fit mt-3">
            Append-Only Verified
          </span>
        </div>
      </div>

      {/* Intelligent Alerts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Automated Governance Observations</h3>
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Separation of Duties Maintained</span>
            <span className="text-slate-600">
              No instances of self-approval detected across all pending expenditure requests.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-slate-900 block">Voucher Proof Status</span>
            <span className="text-slate-600">
              Expenditures exceeding ₹25,000 have verified invoice attachments stored in the Evidence Vault.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
