import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Heart, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../types/database';

export const FamilyGroupsView: React.FC = () => {
  const { activeWorkspace, members } = useWorkspace();
  const { currentUser } = useAuth();
  const currency = activeWorkspace?.currency || 'INR';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900">Family &amp; Community Groups</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Shared household responsibilities, group contributions, and joint commitments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Members
          </span>
          <p className="text-2xl font-black text-slate-900 mt-2">{members.length}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Authorised members in workspace</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Household Pooled Allocation
          </span>
          <p className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(75000, currency)}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Current month shared pool</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Joint Goals Active
          </span>
          <p className="text-2xl font-black text-blue-600 mt-2">2</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Emergency &amp; Annual Sinking Fund</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Group Members Directory</h3>
        <div className="divide-y divide-slate-100">
          {members.map((m) => (
            <div key={m.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-200">
                  <img
                    src={m.profile?.avatar_url || `https://avatar.vercel.sh/${m.user_id}`}
                    alt={m.profile?.full_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{m.profile?.full_name || 'Member'}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{m.role.replace('_', ' ')}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                Active Member
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
