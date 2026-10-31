import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { WorkspaceType } from '../../types/database';
import { Building2, User, X, AlertCircle } from 'lucide-react';

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { createWorkspace } = useWorkspace();

  const [name, setName] = useState('');
  const [type, setType] = useState<WorkspaceType>('personal');
  const [currency, setCurrency] = useState('INR');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const res = await createWorkspace({
      name,
      workspace_type: type,
      currency,
      description,
    });

    if (!res.success) {
      setError(res.error || 'Failed to create workspace');
    } else {
      onSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Create JEVRA Workspace</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">Workspace Environment</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('personal')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  type === 'personal'
                    ? 'border-blue-600 bg-blue-50/70 text-blue-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <User className="w-5 h-5 text-blue-600 mb-2" />
                <div>
                  <span className="block text-xs font-bold">Personal Vault</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Individual, family, or personal financial commitments
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setType('organisation')}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                  type === 'organisation'
                    ? 'border-purple-600 bg-purple-50/70 text-purple-900 font-semibold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-purple-600 mb-2" />
                <div>
                  <span className="block text-xs font-bold">Organisation</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Apartments, NGOs, clubs, societies &amp; small orgs
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Workspace Title</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={type === 'personal' ? 'e.g. Family Treasury' : 'e.g. Green Valley RWA'}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            >
              <option value="INR">INR (₹) — Indian Rupee (Default)</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="AED">AED — UAE Dirham</option>
              <option value="SGD">SGD (S$) — Singapore Dollar</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Purpose and fiduciary responsibility of this workspace..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer shadow-sm"
            >
              Establish Workspace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
