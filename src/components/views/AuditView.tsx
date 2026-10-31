import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { ScrollText, Lock, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

export const AuditView: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const { currentUser } = useAuth();
  const [tamperResult, setTamperResult] = useState<string | null>(null);

  const logs = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getAuditLogs(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const handleSimulateTamper = () => {
    const res = dataEngine.attemptAuditLogModification('any-id');
    setTamperResult(res.error);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5 text-slate-800" />
            <h1 className="text-xl font-bold text-slate-900">Immutable Audit Vault</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Append-only historical ledger for {activeWorkspace?.name}. Protected by PostgreSQL trigger{' '}
            <code className="text-cyan-700 bg-cyan-50 px-1 py-0.5 rounded text-[11px]">trg_audit_logs_immutable</code>.
          </p>
        </div>

        <button
          onClick={handleSimulateTamper}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold transition cursor-pointer"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Test Tamper Resistance (Trigger Check)</span>
        </button>
      </div>

      {tamperResult && (
        <div className="p-4 rounded-xl bg-red-950/80 text-red-200 border border-red-800 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-white">
            <XCircle className="w-4 h-4 text-red-400" />
            <span>Database Security Defense Activated:</span>
          </div>
          <p className="font-mono text-[11px]">{tamperResult}</p>
          <p className="text-[10px] text-red-300">
            Audit history is cryptographically protected against updates and deletions.
          </p>
        </div>
      )}

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-4">Timestamp (UTC)</th>
              <th className="py-3 px-4">Action Event</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Entity Type</th>
              <th className="py-3 px-4">Payload Changes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  No audit entries in this workspace yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 font-mono">
                  <td className="py-3 px-4 text-slate-500 text-[10px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-800 font-medium">
                    {log.actor?.full_name || 'System Auto'}
                  </td>
                  <td className="py-3 px-4 text-purple-700 text-[11px]">{log.entity_type}</td>
                  <td className="py-3 px-4 text-[10px] text-slate-600 max-w-xs truncate">
                    {log.new_values ? JSON.stringify(log.new_values) : '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
