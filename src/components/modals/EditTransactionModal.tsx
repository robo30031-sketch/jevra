import React, { useState, useEffect, useMemo } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { dataEngine } from '../../lib/dataEngine';
import { Transaction, TransactionType, PaymentMethod, formatCurrency } from '../../types/database';
import { Pencil, X, AlertCircle } from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { activeWorkspace } = useWorkspace();
  const { currentUser } = useAuth();

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [date, setDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setType(transaction.transaction_type);
      setAmount(String(transaction.amount));
      setDescription(transaction.description);
      setCategoryId(transaction.category_id || '');
      setPaymentMethod(transaction.payment_method);
      setDate(transaction.transaction_date);
      setError(null);
    }
  }, [transaction]);

  const categories = useMemo(() => {
    if (!currentUser || !activeWorkspace) return [];
    return dataEngine.getCategories(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser || !activeWorkspace) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a valid positive number');
      return;
    }

    const res = dataEngine.updateTransaction(currentUser.id, activeWorkspace.id, transaction.id, {
      category_id: categoryId || null,
      transaction_type: type,
      amount: numAmount,
      description,
      payment_method: paymentMethod,
      transaction_date: date,
    });

    if (!res.success) {
      setError(res.error || 'Failed to update transaction');
    } else {
      onSuccess();
      onClose();
    }
  };

  const currency = transaction.currency || activeWorkspace?.currency || 'INR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Edit Financial Entry
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4 text-xs">
          {/* Nature / Type selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Transaction Nature</label>
            <div className="grid grid-cols-4 gap-2">
              {(['expense', 'income', 'contribution', 'transfer'] as const).map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-2 rounded-xl uppercase text-[10px] font-bold tracking-wider transition border cursor-pointer ${
                    type === t
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Amount ({currency})</label>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="2500.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description / Memo</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Electricity payment / Monthly salary"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="">General / Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category_type})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500"
              >
                <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                <option value="bank_transfer">NEFT / RTGS / IMPS</option>
                <option value="cash">Cash Voucher</option>
                <option value="card">Card / POS</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-xs"
            >
              Update Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
