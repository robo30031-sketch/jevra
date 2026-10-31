import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency, Approval } from '../../types/database';
import {
  Building2,
  Vault,
  Coins,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Plus,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface OrganisationDashboardProps {
  onOpenNewTransaction: () => void;
  onNavigateTab: (tab: any) => void;
}

export const OrganisationDashboard: React.FC<OrganisationDashboardProps> = ({
  onOpenNewTransaction,
  onNavigateTab,
}) => {
  const { activeWorkspace, userRole, canApprove } = useWorkspace();
  const { currentUser } = useAuth();
  const [reviewMsg, setReviewMsg] = useState<{ id: string; error?: string; success?: string } | null>(null);

  const transactions = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getTransactions(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const approvals = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getApprovals(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, reviewMsg]);

  const contributions = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getContributions(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const auditLogs = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getAuditLogs(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, reviewMsg]);

  // Financial aggregates
  const totalFundsCollected = useMemo(() => {
    return transactions
      .filter((t) => ['income', 'contribution'].includes(t.transaction_type) && t.status === 'completed')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalExpenditure = useMemo(() => {
    return transactions
      .filter((t) => t.transaction_type === 'expense' && ['completed', 'approved'].includes(t.status))
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const availableFunds = totalFundsCollected - totalExpenditure;

  const pendingApprovals = approvals.filter((a) => a.approval_status === 'pending');

  const currency = activeWorkspace?.currency || 'INR';

  // Quarterly comparison chart data
  const treasuryFlowData = [
    { period: 'Q1', collections: totalFundsCollected * 0.7, expenses: totalExpenditure * 0.6 },
    { period: 'Q2', collections: totalFundsCollected * 0.85, expenses: totalExpenditure * 0.8 },
    { period: 'Q3', collections: totalFundsCollected * 0.95, expenses: totalExpenditure * 0.9 },
    { period: 'Q4 (Current)', collections: totalFundsCollected, expenses: totalExpenditure },
  ];

  const handleDecision = (apprId: string, decision: 'approved' | 'rejected') => {
    if (!currentUser) return;
    const res = dataEngine.reviewApproval(currentUser.id, apprId, decision);
    if (!res.success) {
      setReviewMsg({ id: apprId, error: res.error });
    } else {
      setReviewMsg({ id: apprId, success: `Request successfully ${decision}. Audit record appended.` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">{activeWorkspace?.name}</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 uppercase">
              Organisation Treasury
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Association governance &amp; fiduciary accountability. Dual-authorization &amp; immutable record-keeping.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm shadow-purple-500/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Treasury Entry</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Treasury Funds */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Treasury Funds
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Vault className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(availableFunds, currency)}
            </span>
            <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Fiduciary Reserve</span>
            </div>
          </div>
        </div>

        {/* Total Funds Collected */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Funds Collected
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
              {formatCurrency(totalFundsCollected, currency)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Dues &amp; member contributions</p>
          </div>
        </div>

        {/* Total Expenditure */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenditure
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-red-600">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {formatCurrency(totalExpenditure, currency)}
            </span>
            <p className="text-xs text-slate-400 mt-1">Approved vendor &amp; operational costs</p>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600 tracking-tight">
              {pendingApprovals.length}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              Awaiting committee authorization
            </p>
          </div>
        </div>
      </div>

      {/* Treasury Analytics Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Collections vs Expenditure Trend</h2>
            <p className="text-[11px] text-slate-400">Quarterly fiduciary performance</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Collections
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Expenditure
            </span>
          </div>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={treasuryFlowData}>
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
              <Bar dataKey="collections" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#9333EA" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Governance & Pending Approvals Queue */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Governance Queue — Pending Approvals ({pendingApprovals.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Current Role: <span className="font-bold uppercase text-purple-700">{userRole}</span>
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="p-6 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">Governance queue clear</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All organisation expenses have been reviewed and audited.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingApprovals.map((appr) => {
              const isRequester = appr.requested_by === currentUser?.id;
              const msg = reviewMsg?.id === appr.id ? reviewMsg : null;

              return (
                <div
                  key={appr.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {formatCurrency(appr.transaction?.amount || 0, currency)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        Pending Clearance
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 mt-1">
                      {appr.transaction?.description}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Requested by: <span className="font-medium text-slate-700">{appr.requester?.full_name || 'Staff'}</span> • Date: {appr.transaction?.transaction_date}
                    </p>
                    {appr.comments && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-2 italic">
                        "{appr.comments}"
                      </p>
                    )}

                    {/* Notice if current user is the requester */}
                    {isRequester && (
                      <div className="mt-2 text-[11px] text-amber-700 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Separation of Duties: You cannot approve your own request. Another approver/owner must review.</span>
                      </div>
                    )}

                    {msg?.error && (
                      <div className="mt-2 text-[11px] text-red-600 bg-red-50 p-2 rounded border border-red-200">
                        {msg.error}
                      </div>
                    )}
                    {msg?.success && (
                      <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200">
                        {msg.success}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(appr.id, 'rejected')}
                      disabled={isRequester}
                      className="px-3 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleDecision(appr.id, 'approved')}
                      disabled={isRequester}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-40 cursor-pointer"
                    >
                      Approve &amp; Release
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member Contributions & Recent Activities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Contributions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <h2 className="text-sm font-bold text-slate-900">Member Contributions &amp; Dues</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {contributions.length} recorded
            </span>
          </div>

          <div className="space-y-2.5">
            {contributions.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No contributions logged</p>
            ) : (
              contributions.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{c.purpose}</p>
                    <p className="text-[11px] text-slate-500">
                      Member: {c.contributor?.full_name || 'Member'} • {c.contribution_date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-extrabold text-emerald-600">
                      +{formatCurrency(c.amount, currency)}
                    </p>
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Audit Activities (Append-Only Proof) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <h2 className="text-sm font-bold text-slate-900">Recent Immutable Audit Trail</h2>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-purple-600 hover:underline font-medium"
            >
              Full Vault →
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 font-mono text-[11px]">{log.action}</span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Actor: <span className="font-medium text-slate-900">{log.actor?.full_name || 'System'}</span> on{' '}
                  <span className="font-mono text-purple-700">{log.entity_type}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
