import React, { useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency } from '../../types/database';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CalendarClock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Receipt,
  FileCheck2,
  Clock,
  CheckCircle2,
  AlertTriangle,
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

interface PersonalDashboardProps {
  onOpenNewTransaction: () => void;
  onNavigateTab: (tab: any) => void;
}

const COLORS = ['#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export const PersonalDashboard: React.FC<PersonalDashboardProps> = ({
  onOpenNewTransaction,
  onNavigateTab,
}) => {
  const { activeWorkspace } = useWorkspace();
  const { currentUser } = useAuth();

  const transactions = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getTransactions(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const goals = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getGoals(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const bills = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getBills(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const loans = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getLoans(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  // Aggregate metrics
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.transaction_type === 'income' && t.status === 'completed')
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.transaction_type === 'expense' && ['completed', 'approved'].includes(t.status))
        .reduce((acc, t) => acc + t.amount, 0),
    [transactions]
  );

  const netBalance = totalIncome - totalExpense;

  const unpaidBillsTotal = useMemo(
    () => bills.filter((b) => b.payment_status !== 'paid').reduce((acc, b) => acc + b.amount, 0),
    [bills]
  );

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
    { month: 'Oct', income: totalIncome * 0.8, expense: totalExpense * 0.75 },
    { month: 'Nov', income: totalIncome * 0.9, expense: totalExpense * 0.85 },
    { month: 'Dec', income: totalIncome * 0.95, expense: totalExpense * 0.9 },
    { month: 'Jan', income: totalIncome, expense: totalExpense },
  ];

  const currency = activeWorkspace?.currency || 'INR';

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{activeWorkspace?.name}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase">
              Personal Vault
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Personal financial autonomy. Every commitment, every bill, every rupee accounted for.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Net Balance
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

        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Inflow / Income
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalIncome, currency)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Verified earned inflow</p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalExpense, currency)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Burn rate: {totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(0) : 0}% of income
            </p>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Upcoming Bills Due
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(unpaidBillsTotal, currency)}
            </span>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {bills.filter((b) => b.payment_status === 'unpaid').length} pending commitments
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cash Flow Timeline */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Income vs. Expense Trend</h2>
              <p className="text-[11px] text-slate-400">Monthly financial stability trajectory</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Outflow
              </span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyFlowData}>
                <defs>
                  <linearGradient id="incomeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
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
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeFill)" />
                <Area type="monotone" dataKey="expense" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#expenseFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
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
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
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

      {/* Two Column Section: Savings Goals & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Goals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-600" />
              <h2 className="text-sm font-bold text-slate-900">Savings &amp; Financial Goals</h2>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {goals.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No goals set up yet</p>
            ) : (
              goals.map((g) => {
                const pct = Math.min(100, Math.round((g.current_amount / g.target_amount) * 100));
                return (
                  <div key={g.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-slate-800">{g.title}</span>
                      <span className="font-bold text-cyan-700">{pct}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                      <span>Saved: {formatCurrency(g.current_amount, currency)}</span>
                      <span>Target: {formatCurrency(g.target_amount, currency)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming Bills & Commitments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">Upcoming Bills &amp; Responsibilities</h2>
            </div>
            <button
              onClick={() => onNavigateTab('bills')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Manage Bills
            </button>
          </div>
          <div className="space-y-2.5">
            {bills.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No upcoming bills</p>
            ) : (
              bills.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{b.title}</p>
                    <p className="text-[11px] text-slate-500">
                      Due: {b.due_date} • Recurrence: {b.recurrence.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-extrabold text-slate-900">
                      {formatCurrency(b.amount, b.currency)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                        b.payment_status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.payment_status === 'overdue'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.payment_status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-[11px] text-slate-400">Audited financial records with proof status</p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Full Ledger →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Category</th>
                <th className="pb-3 font-medium">Payment</th>
                <th className="pb-3 font-medium">Evidence</th>
                <th className="pb-3 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No transactions recorded yet in this workspace. Click "Add Transaction" to start.
                  </td>
                </tr>
              ) : (
                transactions.slice(0, 5).map((t) => {
                  const isInc = t.transaction_type === 'income';
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 text-slate-600 font-mono text-[11px]">{t.transaction_date}</td>
                      <td className="py-3 font-medium text-slate-900">{t.description}</td>
                      <td className="py-3 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {t.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 uppercase text-[10px] text-slate-500 font-medium">
                        {t.payment_method}
                      </td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            t.evidence_status === 'verified'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.evidence_status === 'uploaded'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FileCheck2 className="w-3 h-3" />
                          <span>{t.evidence_status}</span>
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold text-xs ${isInc ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isInc ? '+' : '-'} {formatCurrency(t.amount, t.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
