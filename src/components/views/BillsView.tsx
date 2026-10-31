import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency, Bill, Loan } from '../../types/database';
import { CalendarClock, Plus, CheckCircle2, Handshake, AlertTriangle, ArrowRight } from 'lucide-react';

export const BillsView: React.FC = () => {
  const { activeWorkspace, userRole } = useWorkspace();
  const { currentUser } = useAuth();
  const [showAddBill, setShowAddBill] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<Bill['recurrence']>('monthly');

  const bills = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getBills(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, showAddBill]);

  const loans = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getLoans(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  const currency = activeWorkspace?.currency || 'INR';

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeWorkspace) return;
    dataEngine.addBill(currentUser.id, activeWorkspace.id, {
      title,
      amount: Number(amount),
      currency,
      due_date: dueDate || new Date().toISOString().split('T')[0],
      recurrence,
      assigned_user_id: currentUser.id,
      payment_status: 'unpaid',
    });
    setTitle('');
    setAmount('');
    setShowAddBill(false);
  };

  const handleMarkPaid = (billId: string) => {
    if (!currentUser || !activeWorkspace) return;
    dataEngine.markBillPaid(currentUser.id, activeWorkspace.id, billId);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl font-bold text-slate-900">Bills &amp; Financial Commitments</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled obligations, recurring subscriptions, utilities, and lending/borrowing records.
          </p>
        </div>

        <button
          onClick={() => setShowAddBill(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Scheduled Bill</span>
        </button>
      </div>

      {/* Bills Section */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Active Scheduled Obligations</span>
          <span className="text-xs font-normal text-slate-400">({bills.length})</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              No bills scheduled. Click "New Scheduled Bill" to register an obligation.
            </div>
          ) : (
            bills.map((b) => (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{b.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
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
                  <div className="mt-3">
                    <span className="text-2xl font-extrabold text-slate-900">
                      {formatCurrency(b.amount, b.currency)}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Due Date: <span className="font-semibold text-slate-700">{b.due_date}</span> • Recurrence:{' '}
                      {b.recurrence.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
                  {b.payment_status !== 'paid' ? (
                    <button
                      onClick={() => handleMarkPaid(b.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Mark Paid
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Paid &amp; Audited
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lending & Borrowing (Loans) */}
      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Handshake className="w-4 h-4 text-cyan-600" />
          <span>Lending &amp; Borrowing Ledger</span>
          <span className="text-xs font-normal text-slate-400">({loans.length})</span>
        </h2>
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-semibold text-slate-500">
              <tr>
                <th className="py-3 px-4">Lender</th>
                <th className="py-3 px-4">Borrower</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Principal</th>
                <th className="py-3 px-4">Outstanding</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No active loan or commitment records in this workspace.
                  </td>
                </tr>
              ) : (
                loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">{l.lender_name}</td>
                    <td className="py-3 px-4 text-slate-700">{l.borrower_name}</td>
                    <td className="py-3 px-4 capitalize font-medium">{l.loan_type}</td>
                    <td className="py-3 px-4 font-mono">{formatCurrency(l.principal_amount, currency)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-700">
                      {formatCurrency(l.outstanding_amount, currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Add Bill / Commitment</h3>
            <form onSubmit={handleCreateBill} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Bill Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broadband / Water"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="2500"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Recurrence</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  <option value="one_time">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddBill(false)}
                  className="px-3 py-1.5 text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 text-white rounded-xl font-semibold"
                >
                  Save Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
