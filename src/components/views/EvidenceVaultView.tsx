import React, { useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { FileCheck2, Download, ShieldCheck, FileText, Lock } from 'lucide-react';

export const EvidenceVaultView: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const { currentUser } = useAuth();

  const files = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getEvidenceFiles(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Evidence Vault</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Private, workspace-isolated document proof repository for receipts, invoices, and vouchers.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold">
          <Lock className="w-3.5 h-3.5 text-slate-500" />
          <span>Storage Bucket: jevra-evidence</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-semibold">
            <tr>
              <th className="py-3 px-4">Document File Name</th>
              <th className="py-3 px-4">MIME Type</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Storage Path</th>
              <th className="py-3 px-4">Uploaded At</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  No evidence files uploaded in this workspace. Attach receipts from the Financial Ledger.
                </td>
              </tr>
            ) : (
              files.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{f.file_name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{f.file_type}</td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {(f.file_size / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[10px] max-w-xs truncate">
                    {f.storage_path}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">{f.created_at.split('T')[0]}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => alert(`Verified document voucher: ${f.file_name}`)}
                      className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] cursor-pointer"
                    >
                      View Voucher
                    </button>
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
