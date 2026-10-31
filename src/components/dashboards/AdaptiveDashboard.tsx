import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { WORKSPACE_CATEGORIES, formatCurrency } from '../../types/database';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Target,
  Users,
  AlertCircle,
  Building2,
  GraduationCap,
  Hospital,
  Shield,
  Flame,
  Store,
  Landmark,
  FileText,
  BadgeCheck,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { EditTransactionModal } from '../modals/EditTransactionModal';
import { Transaction } from '../../types/database';

interface AdaptiveDashboardProps {
  onOpenNewTransaction: () => void;
  onNavigateTab: (tab: any) => void;
}

const COLORS = ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const AdaptiveDashboard: React.FC<AdaptiveDashboardProps> = ({
  onOpenNewTransaction,
  onNavigateTab,
}) => {
  const { activeWorkspace, userRole, canRecordTransaction, canApprove, dataVersion } = useWorkspace();
  const { currentUser, isDemoMode } = useAuth();

  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const category = activeWorkspace?.workspace_category || 'personal_finance';
  const categoryInfo = WORKSPACE_CATEGORIES[category] || WORKSPACE_CATEGORIES.personal_finance;
  const terms = categoryInfo.terminology;
  const currency = activeWorkspace?.currency || 'INR';

  const transactions = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getTransactions(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, dataVersion]);

  const budgets = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getBudgets(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, dataVersion]);

  const bills = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getBills(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, dataVersion]);

  const approvals = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getApprovals(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, dataVersion]);

  // Aggregates
  const totalInflow = useMemo(() => {
    return transactions
      .filter((t) => ['income', 'contribution'].includes(t.transaction_type) && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalOutflow = useMemo(() => {
    return transactions
      .filter((t) => t.transaction_type === 'expense' && ['completed', 'approved'].includes(t.status))
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const netBalance = totalInflow - totalOutflow;

  const pendingApprovals = approvals.filter((a) => a.approval_status === 'pending');
  const unpaidBills = bills.filter((b) => b.payment_status !== 'paid');

  // Category breakdown for chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.transaction_type === 'expense')
      .forEach((t) => {
        const cat = t.category?.name || 'General';
        map[cat] = (map[cat] || 0) + t.amount;
      });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  // Monthly flow mock chart based on actual transactions
  const monthlyFlowData = [
    { month: 'Oct', inflow: totalInflow * 0.8, outflow: totalOutflow * 0.75 },
    { month: 'Nov', inflow: totalInflow * 0.9, outflow: totalOutflow * 0.85 },
    { month: 'Dec', inflow: totalInflow * 0.95, outflow: totalOutflow * 0.9 },
    { month: 'Jan', inflow: totalInflow, outflow: totalOutflow },
  ];

  const isOrg = activeWorkspace?.workspace_type === 'organisation';

  return (
    <div className="space-y-6">
      {/* Dynamic Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900">{activeWorkspace?.name}</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
              {categoryInfo.name}
            </span>
            {activeWorkspace?.is_demo && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                Sample Data
              </span>
            )}
            {activeWorkspace?.verification_status === 'verified' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {activeWorkspace?.description || categoryInfo.description}
          </p>
        </div>

        {canRecordTransaction && (
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
        )}
      </div>

      {/* KPI Cards adapted to category terminology */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Net Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {terms.balanceTitle}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(netBalance, currency)}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Available Liquidity</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Total Inflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {terms.inflowTitle}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalInflow, currency)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Verified earned inflow</p>
          </div>
        </div>

        {/* Metric 3: Total Outflow */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {terms.outflowTitle}
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalOutflow, currency)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Burn rate: {totalInflow > 0 ? ((totalOutflow / totalInflow) * 100).toFixed(0) : 0}% of revenue
            </p>
          </div>
        </div>

        {/* Metric 4: Organization Approvals or Personal Bills */}
        {isOrg ? (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {terms.approvalsTitle}
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
                {pendingApprovals.length}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Awaiting authorization
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {terms.commitmentsTitle}
              </span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formatCurrency(
                  unpaidBills.reduce((acc, b) => acc + b.amount, 0),
                  currency
                )}
              </span>
              <p className="text-xs text-amber-600 font-medium mt-1">
                {unpaidBills.length} pending obligations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Inflow vs. Outflow Trajectory</h2>
              <p className="text-[11px] text-slate-400">Monthly fiscal trend</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {terms.inflowTitle}
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> {terms.outflowTitle}
              </span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFlowData}>
                <defs>
                  <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outflowGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => formatCurrency(Number(val) || 0, currency)}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#inflowGrad)" />
                <Area type="monotone" dataKey="outflow" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#outflowGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Spending by Category</h2>
            <p className="text-[11px] text-slate-400">Expense distribution</p>
          </div>
          <div className="h-44 w-full my-auto">
            {categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expense data recorded yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val) || 0, currency)}
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#334155',
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-1 max-h-24 overflow-y-auto pt-2 border-t border-slate-100">
            {categoryData.map((cat, i) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600 truncate">{cat.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{formatCurrency(cat.value, currency)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Ledger Records Table with Empty State */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent {terms.ledgerSubtitle}</h2>
            <p className="text-[11px] text-slate-400">Audited financial records with proof vouchers</p>
          </div>
          <button
            onClick={() => onNavigateTab('money_manager')}
            className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
          >
            Full Ledger →
          </button>
        </div>

        {transactions.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2.5 opacity-60" />
            <h3 className="text-xs font-bold text-slate-800">No transactions recorded yet</h3>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto mt-1 mb-4">
              Your {categoryInfo.name} workspace is newly initialized. Record your first income, expense, or grant allocation to activate analytics.
            </p>
            {canRecordTransaction && (
              <button
                onClick={onOpenNewTransaction}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer shadow-xs"
              >
                Record First Entry
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Payment</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                  <th className="pb-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((t) => {
                  const isPositive = ['income', 'contribution'].includes(t.transaction_type);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 text-slate-600 font-mono text-[11px]">{t.transaction_date}</td>
                      <td className="py-3 font-semibold text-slate-900">{t.description}</td>
                      <td className="py-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {t.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 uppercase text-[10px] text-slate-500 font-mono font-medium">
                        {t.payment_method}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            t.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'pending_approval'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td
                        className={`py-3 text-right font-bold text-xs ${
                          isPositive ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isPositive ? '+' : '-'} {formatCurrency(t.amount, t.currency)}
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingTx(t)}
                            title="Edit entry"
                            className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTx(t)}
                            title="Delete entry"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        transaction={editingTx}
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        onSuccess={() => setEditingTx(null)}
      />

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm mb-2">
              <Trash2 className="w-5 h-5 shrink-0" />
              <span>Delete Financial Entry</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this record from the ledger?
            </p>
            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Description:</span>
                <span className="font-semibold text-slate-900 truncate max-w-[170px]">{deletingTx.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(deletingTx.amount, deletingTx.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nature:</span>
                <span className="capitalize font-semibold text-slate-700">{deletingTx.transaction_type}</span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingTx(null)}
                className="px-3.5 py-1.5 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentUser && activeWorkspace) {
                    dataEngine.deleteTransaction(currentUser.id, activeWorkspace.id, deletingTx.id);
                  }
                  setDeletingTx(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl cursor-pointer shadow-xs transition"
              >
                Delete Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
