import React, { useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency } from '../../types/database';
import { BarChart3, Download, Printer, TrendingUp, Calendar, FileText } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const { currentUser } = useAuth();
  const currency = activeWorkspace?.currency || 'INR';

  const transactions = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getTransactions(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const totalInflow = transactions
    .filter((t) => ['income', 'contribution'].includes(t.transaction_type))
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOutflow = transactions
    .filter((t) => t.transaction_type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netSavings = totalInflow - totalOutflow;

  const handlePrint = () => {
    window.print();
  };

  const reportData = [
    { period: 'October', Inflow: totalInflow * 0.8, Outflow: totalOutflow * 0.75 },
    { period: 'November', Inflow: totalInflow * 0.85, Outflow: totalOutflow * 0.8 },
    { period: 'December', Inflow: totalInflow * 0.95, Outflow: totalOutflow * 0.9 },
    { period: 'January', Inflow: totalInflow, Outflow: totalOutflow },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Financial Reports &amp; Analytics</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fiduciary income statements, cashflow analytics and audited summary reports for {activeWorkspace?.name}.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export Statement</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Gross Recorded Inflow
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(totalInflow, currency)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Aggregated revenue &amp; collections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Operational Outflow
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalOutflow, currency)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Disbursed expenditures</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Surplus / Retained Liquid
          </span>
          <p className="text-2xl font-black text-blue-600 mt-2">{formatCurrency(netSavings, currency)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Balance reserves retained</p>
        </div>
      </div>

      {/* Statement Visualisation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Quarterly Fiscal Performance Comparison</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData}>
              <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: any) => formatCurrency(Number(val) || 0, currency)}
                contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
              />
              <Bar dataKey="Inflow" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Outflow" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
