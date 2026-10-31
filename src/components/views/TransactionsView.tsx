import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { Transaction, TransactionType, formatCurrency } from '../../types/database';
import {
  ReceiptText,
  Plus,
  Filter,
  FileCheck2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Upload,
} from 'lucide-react';

interface TransactionsViewProps {
  onOpenNewTransaction: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ onOpenNewTransaction }) => {
  const { activeWorkspace, userRole, canRecordTransaction } = useWorkspace();
  const { currentUser } = useAuth();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceModalTx, setEvidenceModalTx] = useState<Transaction | null>(null);

  const transactions = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getTransactions(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchType = typeFilter === 'all' || t.transaction_type === typeFilter;
      const matchSearch =
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.name?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchSearch;
    });
  }, [transactions, typeFilter, searchQuery]);

  const currency = activeWorkspace?.currency || 'INR';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900">Financial Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction records for {activeWorkspace?.name}. Every entry is tracked in the immutable audit log.
          </p>
        </div>

        {canRecordTransaction && (
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Transaction</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider shrink-0">
            Type:
          </span>
          {['all', 'income', 'expense', 'contribution', 'transfer'].map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-lg uppercase text-[10px] font-bold tracking-wider transition cursor-pointer shrink-0 ${
                typeFilter === t
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description or category..."
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs w-full sm:w-64 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => {
                  const isPositive = ['income', 'contribution'].includes(t.transaction_type);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                        {t.transaction_date}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {t.description}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {t.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize text-[11px] font-medium text-slate-600">
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[10px] text-slate-500 font-mono">
                        {t.payment_method}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            t.status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : t.status === 'pending_approval'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : t.status === 'approved'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {t.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setEvidenceModalTx(t)}
                          className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                        >
                          <FileCheck2 className="w-3.5 h-3.5" />
                          <span>{t.evidence_status === 'none' ? 'Attach File' : t.evidence_status}</span>
                        </button>
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-bold font-mono text-xs ${
                          isPositive ? 'text-emerald-600' : 'text-slate-900'
                        }`}
                      >
                        {isPositive ? '+' : '-'} {formatCurrency(t.amount, t.currency)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Modal */}
      {evidenceModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Evidence &amp; Receipt Voucher</h3>
              <button
                onClick={() => setEvidenceModalTx(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="my-4 text-xs text-slate-600 space-y-2">
              <p>
                <span className="font-semibold text-slate-800">Transaction:</span> {evidenceModalTx.description}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Amount:</span> {formatCurrency(evidenceModalTx.amount, evidenceModalTx.currency)}
              </p>
              <p>
                <span className="font-semibold text-slate-800">Private Bucket:</span> <code className="bg-slate-100 px-1 py-0.5 rounded text-[10px]">storage/jevra-evidence/{activeWorkspace?.id}/...</code>
              </p>

              <div className="mt-4 p-4 border-2 border-dashed border-slate-200 rounded-xl text-center">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Upload Receipt / Invoice</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, PDF up to 25MB (PostgreSQL Storage RLS Enforced)</p>
                <button
                  onClick={() => {
                    dataEngine.uploadEvidenceFile(currentUser!.id, activeWorkspace!.id, evidenceModalTx.id, {
                      name: `voucher_${Date.now()}.pdf`,
                      type: 'application/pdf',
                      size: 245000,
                    });
                    setEvidenceModalTx(null);
                  }}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Simulate Verified Upload
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
