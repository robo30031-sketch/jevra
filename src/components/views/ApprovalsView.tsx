import React, { useMemo, useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency } from '../../types/database';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  UserCheck,
  Building2,
  FileText,
} from 'lucide-react';

export const ApprovalsView: React.FC = () => {
  const { activeWorkspace, userRole, canApprove } = useWorkspace();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionNotice, setActionNotice] = useState<{ id: string; error?: string; success?: string } | null>(null);

  const approvals = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getApprovals(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, actionNotice]);

  const filtered = useMemo(() => {
    if (filter === 'all') return approvals;
    return approvals.filter((a) => a.approval_status === filter);
  }, [approvals, filter]);

  const currency = activeWorkspace?.currency || 'INR';

  const handleReview = (approvalId: string, decision: 'approved' | 'rejected') => {
    if (!currentUser) return;
    const res = dataEngine.reviewApproval(currentUser.id, approvalId, decision);
    if (!res.success) {
      setActionNotice({ id: approvalId, error: res.error });
    } else {
      setActionNotice({ id: approvalId, success: `Request successfully ${decision}.` });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900">Approvals &amp; Fiduciary Governance</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Separation of duties &amp; dual-authorization gateway. Approvers and owners authorize expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-xs">
          <span className="text-purple-700 font-semibold">Your Authority:</span>
          <span className="font-bold uppercase text-purple-900">{userRole}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 text-xs w-fit">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-3 py-1.5 rounded-lg font-bold capitalize text-[11px] transition cursor-pointer ${
              filter === t
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-800">No {filter} requests found</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Financial requests requiring approval will appear here.
            </p>
          </div>
        ) : (
          filtered.map((appr) => {
            const isRequester = appr.requested_by === currentUser?.id;
            const isPending = appr.approval_status === 'pending';
            const notice = actionNotice?.id === appr.id ? actionNotice : null;

            return (
              <div
                key={appr.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(appr.transaction?.amount || 0, currency)}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        appr.approval_status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : appr.approval_status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {appr.approval_status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {appr.transaction?.description}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Requested by: <span className="font-medium text-slate-700">{appr.requester?.full_name}</span> •{' '}
                    Date: {appr.requested_at.split('T')[0]}
                  </p>

                  {appr.comments && (
                    <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="font-semibold text-slate-700">Governance Notes:</span> {appr.comments}
                    </div>
                  )}

                  {isPending && isRequester && (
                    <div className="mt-2 text-[11px] text-amber-700 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        Self-Approval Restriction: You cannot approve your own request. Another approver must review.
                      </span>
                    </div>
                  )}

                  {notice?.error && (
                    <div className="mt-2 text-[11px] text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                      {notice.error}
                    </div>
                  )}
                  {notice?.success && (
                    <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                      {notice.success}
                    </div>
                  )}
                </div>

                {isPending && canApprove && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReview(appr.id, 'rejected')}
                      disabled={isRequester}
                      className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition disabled:opacity-40 cursor-pointer"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleReview(appr.id, 'approved')}
                      disabled={isRequester}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-40 cursor-pointer"
                    >
                      Approve &amp; Disburse
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
