import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { formatCurrency, Loan } from '../../types/database';
import {
  Handshake,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Scale,
} from 'lucide-react';

export const LoansView: React.FC = () => {
  const { activeWorkspace, canRecordTransaction } = useWorkspace();
  const { currentUser } = useAuth();

  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState<'all' | 'given' | 'taken' | 'settled'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [settlingLoan, setSettlingLoan] = useState<Loan | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');

  // Form states for new loan
  const [loanType, setLoanType] = useState<Loan['loan_type']>('given');
  const [lenderName, setLenderName] = useState('');
  const [borrowerName, setBorrowerName] = useState('');
  const [principalAmount, setPrincipalAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const currency = activeWorkspace?.currency || 'INR';

  const loans = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getLoans(currentUser.id, activeWorkspace.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id, activeWorkspace?.id, refreshKey]);

  // Filtered loans list
  const filteredLoans = useMemo(() => {
    if (filter === 'given') return loans.filter((l) => l.loan_type === 'given' && l.status !== 'settled');
    if (filter === 'taken') return loans.filter((l) => l.loan_type === 'taken' && l.status !== 'settled');
    if (filter === 'settled') return loans.filter((l) => l.status === 'settled');
    return loans;
  }, [loans, filter]);

  // Aggregated metrics
  const activeGiven = useMemo(() => {
    return loans.filter((l) => l.loan_type === 'given' && l.status !== 'settled');
  }, [loans]);

  const activeTaken = useMemo(() => {
    return loans.filter((l) => l.loan_type === 'taken' && l.status !== 'settled');
  }, [loans]);

  const totalLentOutstanding = useMemo(() => {
    return activeGiven.reduce((acc, l) => acc + l.outstanding_amount, 0);
  }, [activeGiven]);

  const totalBorrowedOutstanding = useMemo(() => {
    return activeTaken.reduce((acc, l) => acc + l.outstanding_amount, 0);
  }, [activeTaken]);

  const netPosition = totalLentOutstanding - totalBorrowedOutstanding;

  // Open add loan with smart defaults
  const handleOpenAddModal = () => {
    const defaultName = currentUser?.full_name || activeWorkspace?.name || 'Self';
    setLenderName(loanType === 'given' ? defaultName : '');
    setBorrowerName(loanType === 'taken' ? defaultName : '');
    setPrincipalAmount('');
    setDueDate('');
    setShowAddModal(true);
  };

  const handleCreateLoan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeWorkspace) return;

    const amount = Number(principalAmount);
    if (!amount || amount <= 0) return;

    dataEngine.addLoan(currentUser.id, activeWorkspace.id, {
      lender_name: lenderName.trim() || (loanType === 'given' ? currentUser.full_name : 'External Party'),
      borrower_name: borrowerName.trim() || (loanType === 'taken' ? currentUser.full_name : 'External Party'),
      principal_amount: amount,
      outstanding_amount: amount,
      loan_type: loanType,
      due_date: dueDate || null,
      status: 'active',
    });

    setShowAddModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeWorkspace || !settlingLoan) return;

    const partial = Number(repaymentAmount);
    dataEngine.settleLoan(
      currentUser.id,
      activeWorkspace.id,
      settlingLoan.id,
      partial > 0 ? partial : undefined
    );

    setSettlingLoan(null);
    setRepaymentAmount('');
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Handshake className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Lending &amp; Borrowing Ledger</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track personal loans given, institutional commitments, debt obligations, and settlement records.
          </p>
        </div>

        {canRecordTransaction && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Record Loan / Debt Entry</span>
          </button>
        )}
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Lent (Given) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Money Lent (Given Out)</span>
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-teal-600">
              {formatCurrency(totalLentOutstanding, currency)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {activeGiven.length} active borrower {activeGiven.length === 1 ? 'account' : 'accounts'}
            </p>
          </div>
        </div>

        {/* Total Borrowed (Taken) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Money Borrowed (Taken)</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-amber-600">
              {formatCurrency(totalBorrowedOutstanding, currency)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {activeTaken.length} active lender {activeTaken.length === 1 ? 'debt' : 'debts'}
            </p>
          </div>
        </div>

        {/* Net Position */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase">
            <span>Net Lending Position</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`text-2xl font-extrabold ${
                netPosition >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              {netPosition >= 0 ? '+' : '-'} {formatCurrency(Math.abs(netPosition), currency)}
            </span>
            <p className="text-xs text-slate-500 mt-1">
              {netPosition >= 0 ? 'Net Creditor (Receivable)' : 'Net Debtor (Payable)'}
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
          All Records ({loans.length})
        </button>
        <button
          onClick={() => setFilter('given')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            filter === 'given'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Lent / Given ({activeGiven.length})
        </button>
        <button
          onClick={() => setFilter('taken')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            filter === 'taken'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Borrowed / Taken ({activeTaken.length})
        </button>
        <button
          onClick={() => setFilter('settled')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
            filter === 'settled'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          Settled ({loans.filter((l) => l.status === 'settled').length})
        </button>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Audited Loan &amp; Debt Records</span>
            <span className="text-xs font-normal text-slate-400">({filteredLoans.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase text-[10px] font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Lender</th>
                <th className="py-3.5 px-4">Borrower</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Principal</th>
                <th className="py-3.5 px-4">Outstanding</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Handshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600">No loan or debt entries found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Click &quot;Record Loan / Debt Entry&quot; above to log money lent or borrowed.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((l) => {
                  const isGiven = l.loan_type === 'given';
                  const isSettled = l.status === 'settled';

                  return (
                    <tr key={l.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {l.lender_name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {l.borrower_name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isGiven
                              ? 'bg-teal-50 text-teal-700 border border-teal-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isGiven ? (
                            <>
                              <ArrowUpRight className="w-3 h-3" /> Lent Out
                            </>
                          ) : (
                            <>
                              <ArrowDownLeft className="w-3 h-3" /> Borrowed
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {formatCurrency(l.principal_amount, currency)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold">
                        <span className={isSettled ? 'text-slate-400 line-through' : 'text-slate-900'}>
                          {formatCurrency(l.outstanding_amount, currency)}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {l.due_date ? l.due_date : <span className="text-slate-400 italic">No term</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isSettled
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {!isSettled ? (
                          <button
                            onClick={() => {
                              setSettlingLoan(l);
                              setRepaymentAmount(String(l.outstanding_amount));
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer shadow-xs transition"
                          >
                            Repay / Settle
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Loan Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Record Loan / Debt Entry</h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Enter mutual commitment details for ledger tracking and audit verification.
            </p>

            <form onSubmit={handleCreateLoan} className="space-y-3.5 text-xs">
              {/* Type selector */}
              <div>
                <label className="block font-medium text-slate-700 mb-1.5">Commitment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoanType('given');
                      setLenderName(currentUser?.full_name || activeWorkspace?.name || 'Self');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold cursor-pointer transition ${
                      loanType === 'given'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    I Lent Money (Given)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoanType('taken');
                      setBorrowerName(currentUser?.full_name || activeWorkspace?.name || 'Self');
                    }}
                    className={`py-2 px-3 rounded-xl border text-center font-semibold cursor-pointer transition ${
                      loanType === 'taken'
                        ? 'border-amber-600 bg-amber-50 text-amber-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    I Borrowed Money (Taken)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Lender Name {loanType === 'given' ? '(You / Entity)' : '(Creditor)'}
                </label>
                <input
                  type="text"
                  required
                  value={lenderName}
                  onChange={(e) => setLenderName(e.target.value)}
                  placeholder="e.g. Priya Sharma or Bank"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Borrower Name {loanType === 'taken' ? '(You / Entity)' : '(Debtor)'}
                </label>
                <input
                  type="text"
                  required
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="e.g. Rohan Sharma"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Principal Amount ({currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={principalAmount}
                  onChange={(e) => setPrincipalAmount(e.target.value)}
                  placeholder="25000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Expected Settlement Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Save Loan Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settle / Repayment Modal */}
      {settlingLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Record Repayment / Settlement</h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Clear or partially repay this financial commitment.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs mb-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Lender:</span>
                <span className="font-semibold text-slate-800">{settlingLoan.lender_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Borrower:</span>
                <span className="font-semibold text-slate-800">{settlingLoan.borrower_name}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-700 font-semibold">Current Outstanding:</span>
                <span className="font-mono font-bold text-amber-700">
                  {formatCurrency(settlingLoan.outstanding_amount, currency)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Repayment Amount ({currency})
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={settlingLoan.outstanding_amount}
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Entering {settlingLoan.outstanding_amount} will mark the loan as fully settled.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettlingLoan(null)}
                  className="px-3.5 py-2 text-slate-600 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold cursor-pointer shadow-xs"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
