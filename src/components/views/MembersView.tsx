import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { WorkspaceRole } from '../../types/database';
import { Users, UserPlus, Shield, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const MembersView: React.FC = () => {
  const { activeWorkspace, members, isOwner, updateMemberRole, inviteMember } = useWorkspace();
  const { currentUser } = useAuth();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>('member');
  const [feedback, setFeedback] = useState<{ error?: string; success?: string } | null>(null);

  const handleRoleChange = async (targetUserId: string, newRole: WorkspaceRole) => {
    setFeedback(null);
    const res = await updateMemberRole(targetUserId, newRole);
    if (!res.success) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: `Role successfully updated to ${newRole}.` });
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    const res = await inviteMember(inviteEmail, inviteRole);
    if (!res.success) {
      setFeedback({ error: res.error });
    } else {
      setFeedback({ success: `Invitation sent to ${inviteEmail} with role ${inviteRole}.` });
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900">Workspace Members &amp; Fiduciary Roles</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access control directory for {activeWorkspace?.name}. Enforces PostgreSQL Row Level Security role policies.
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Member</span>
          </button>
        )}
      </div>

      {feedback?.error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{feedback.error}</span>
        </div>
      )}

      {feedback?.success && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback.success}</span>
        </div>
      )}

      {/* Role explanation */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-xs">
        <h3 className="font-bold text-cyan-400 mb-2 uppercase text-[10px] tracking-wider">
          Fiduciary Role Matrix (PostgreSQL RLS Defined)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[11px] text-slate-300">
          <div>
            <span className="font-bold text-white block">Owner:</span>
            Full workspace administration, role management, approvals.
          </div>
          <div>
            <span className="font-bold text-white block">Finance Manager:</span>
            Manage budgets, generate reports, approve expenditures.
          </div>
          <div>
            <span className="font-bold text-white block">Treasurer:</span>
            Record collections, disburse expenses, upload evidence receipts.
          </div>
          <div>
            <span className="font-bold text-white block">Approver:</span>
            Dual-authorization clearance (strictly cannot approve own requests).
          </div>
          <div>
            <span className="font-bold text-white block">Member:</span>
            View authorized summaries and submit contributions.
          </div>
          <div>
            <span className="font-bold text-white block">Viewer:</span>
            Audited read-only access with zero write permissions.
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-4">Member Name</th>
              <th className="py-3 px-4">User ID (UUID)</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Joined At</th>
              {isOwner && <th className="py-3 px-4 text-right">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-300">
                      <img
                        src={m.profile?.avatar_url || `https://avatar.vercel.sh/${m.user_id}`}
                        alt={m.profile?.full_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{m.profile?.full_name || 'Member'}</span>
                      <span className="text-[10px] text-slate-400">{m.profile?.phone || 'No phone'}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">{m.user_id}</td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      m.role === 'owner'
                        ? 'bg-purple-100 text-purple-800'
                        : m.role === 'treasurer'
                        ? 'bg-blue-100 text-blue-800'
                        : m.role === 'approver'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.role.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                    {m.membership_status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                  {m.joined_at.split('T')[0]}
                </td>
                {isOwner && (
                  <td className="py-3.5 px-4 text-right">
                    {m.user_id !== currentUser?.id ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m.user_id, e.target.value as WorkspaceRole)}
                        className="px-2 py-1 bg-slate-50 border rounded-lg text-xs"
                      >
                        <option value="owner">Owner</option>
                        <option value="finance_manager">Finance Manager</option>
                        <option value="treasurer">Treasurer</option>
                        <option value="approver">Approver</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Self (Sole Owner)</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Invite Member to Workspace</h3>
            <form onSubmit={handleInviteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Email or Name</label>
                <input
                  type="text"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Fiduciary Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as WorkspaceRole)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="member">Member</option>
                  <option value="treasurer">Treasurer</option>
                  <option value="approver">Approver</option>
                  <option value="finance_manager">Finance Manager</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-purple-600 text-white rounded-xl font-semibold"
                >
                  Send Invitation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
