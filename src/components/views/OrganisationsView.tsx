import React from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { WORKSPACE_CATEGORIES } from '../../types/database';
import { Building2, Plus, ShieldCheck, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface OrganisationsViewProps {
  onOpenNewWorkspace: () => void;
}

export const OrganisationsView: React.FC<OrganisationsViewProps> = ({ onOpenNewWorkspace }) => {
  const { workspaces, activeWorkspace, setActiveWorkspaceId } = useWorkspace();

  const orgWorkspaces = workspaces.filter((w) => w.workspace_type === 'organisation');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">Institutions &amp; Organisations</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Societies, Schools, Hospitals, Stations &amp; Corporate workplaces with strict fiduciary governance.
          </p>
        </div>

        <button
          onClick={onOpenNewWorkspace}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Organisation</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {orgWorkspaces.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
            No institutional workspaces joined yet. Click "Add Organisation" to establish one.
          </div>
        ) : (
          orgWorkspaces.map((ws) => {
            const isCurrent = activeWorkspace?.id === ws.id;
            const cat = WORKSPACE_CATEGORIES[ws.workspace_category];
            return (
              <div
                key={ws.id}
                className={`p-5 rounded-2xl border transition bg-white flex flex-col justify-between ${
                  isCurrent ? 'border-indigo-600 shadow-sm ring-1 ring-indigo-500/30' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {cat?.name || 'Organisation'}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        ws.verification_status === 'verified'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {ws.verification_status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{ws.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ws.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">Currency: {ws.currency}</span>
                  {isCurrent ? (
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active Workspace
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveWorkspaceId(ws.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold cursor-pointer"
                    >
                      Switch to Workspace →
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
