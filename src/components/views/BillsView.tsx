import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency, Bill } from '../../types/database';
import { CalendarClock, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const BillsView: React.FC = () => {
  const { activeWorkspace, canRecordTransaction, dataVersion } = useWorkspace();
  const { currentUser } = useAuth();
  const [showAddBill, setShowAddBill] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<Bill['recurrence']>('monthly');
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');

  const bills = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getBills(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, dataVersion, showAddBill]);

  const currency = activeWorkspace?.currency || 'INR';

  const filteredBills = useMemo(() => {
    if (filter === 'unpaid') return bills.filter((b) => b.payment_status !== 'paid');
    if (filter === 'paid') return bills.filter((b) => b.payment_status === 'paid');
    return bills;
  }, [bills, filter]);

  const totalDue = useMemo(() => {
    return bills
      .filter((b) => b.payment_status !== 'paid')
      .reduce((sum, b) => sum + b.amount, 0);
  }, [bills]);

  const totalPaid = useMemo(() => {
    return bills
      .filter((b) => b.payment_status === 'paid')
      .reduce((sum, b) => sum + b.amount, 0);
  }, [bills]);

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeWorkspace) return;
    dataEngine.addBill(currentUser.id, activeWorkspace.id, {
      title: title.trim(),
      amount: Number(amount),
      currency,
      due_date: dueDate || new Date().toISOString().split('T')[0],
      recurrence,
      assigned_user_id: currentUser.id,
      payment_status: 'unpaid',
    });
    setTitle('');
    setAmount('');
    setDueDate('');
    setShowAddBill(false);
  };

  const handleMarkPaid = (billId: string) => {
    if (!currentUser || !activeWorkspace) return;
    dataEngine.markBillPaid(currentUser.id, activeWorkspace.id, billId);
    setShowAddBill((prev) => !prev); // trigger refresh
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Bills &amp; Financial Commitments</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage scheduled obligations, recurring subscriptions, utilities, and due dates.
          </p>
        </div>

        {canRecordTransaction && (
          <button
            onClick={() => setShowAddBill(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Scheduled Bill</span>
          </button>
        )}
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Pending Due Obligations</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatCurrency(totalDue, currency)}
            </span>
            <p className="text-xs text-amber-600 font-medium mt-1">
              {bills.filter((b) => b.payment_status !== 'paid').length} bills awaiting settlement
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Settled / Paid Bills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-600">
              {formatCurrency(totalPaid, currency)}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {bills.filter((b) => b.payment_status === 'paid').length} cleared commitments
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Total Registered</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900">
              {bills.length}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              Active scheduled obligations
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            filter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          All Commitments ({bills.length})
        </button>
        <button
          onClick={() => setFilter('unpaid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            filter === 'unpaid'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Unpaid / Pending ({bills.filter((b) => b.payment_status !== 'paid').length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            filter === 'paid'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Paid ({bills.filter((b) => b.payment_status === 'paid').length})
        </button>
      </div>

      {/* Bills Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBills.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 shadow-xs">
            <CalendarClock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No commitments found</p>
            <p className="text-[11px] text-slate-400 mt-1">
              Click &quot;New Scheduled Bill&quot; to register upcoming obligations or utility dues.
            </p>
          </div>
        ) : (
          filteredBills.map((b) => (
            <div
              key={b.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center justify-between text-xs gap-2">
                  <span className="font-bold text-slate-900 truncate">{b.title}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
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
                    Due Date: <span className="font-semibold text-slate-700">{b.due_date}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 capitalize">
                    Frequency: {b.recurrence.replace('_', ' ')}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {b.payment_status === 'paid' ? 'Settled' : 'Action Required'}
                </span>
                {b.payment_status !== 'paid' ? (
                  <button
                    onClick={() => handleMarkPaid(b.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition"
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

      {/* Add Bill Modal */}
      {showAddBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Add Scheduled Bill / Commitment</h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Schedule a recurring or one-time expense obligation.
            </p>
            <form onSubmit={handleCreateBill} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Bill Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Office Internet / Society Water"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
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
                  placeholder="3500"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Recurrence Schedule</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as Bill['recurrence'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                  <option value="one_time">One-time</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBill(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
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
