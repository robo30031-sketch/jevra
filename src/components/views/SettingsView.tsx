import React, { useState } from 'react';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useAuth } from '../../contexts/AuthContext';
import { WORKSPACE_CATEGORIES } from '../../types/database';
import { Settings, Shield, User, Building2, CheckCircle2, Lock, Save } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { activeWorkspace } = useWorkspace();
  const { currentUser, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [savedMsg, setSavedMsg] = useState(false);

  const categoryInfo = activeWorkspace?.workspace_category
    ? WORKSPACE_CATEGORIES[activeWorkspace.workspace_category]
    : undefined;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({ full_name: fullName, phone });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-800" />
            <h1 className="text-xl font-bold text-slate-900">Workspace &amp; Account Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your profile, preferred currency, and financial workspace configuration.
          </p>
        </div>
      </div>

      {/* Active Workspace Info */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Active Workspace Parameters</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold block">Workspace Title</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{activeWorkspace?.name}</span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block">Classification Category</span>
            <span className="font-bold text-blue-700 text-sm mt-0.5 block">
              {categoryInfo?.name || 'Personal Finance'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block">Base Currency</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {activeWorkspace?.currency} (₹)
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block">Verification Status</span>
            <span className="font-bold text-emerald-700 text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 inline-block mt-0.5 capitalize">
              {activeWorkspace?.verification_status || 'Verified'}
            </span>
          </div>
        </div>

        {activeWorkspace?.institution_details && (
          <div className="pt-3 border-t border-slate-100 mt-2 text-xs text-slate-600 space-y-1">
            <span className="font-bold text-slate-800 block">Institutional Registration:</span>
            <p>Admin / Signatory: {activeWorkspace.institution_details.admin_name || 'Designated Lead'}</p>
            {activeWorkspace.institution_details.registration_number && (
              <p>Registration No: {activeWorkspace.institution_details.registration_number}</p>
            )}
            {activeWorkspace.institution_details.location && (
              <p>Headquarters Location: {activeWorkspace.institution_details.location}</p>
            )}
          </div>
        )}
      </div>

      {/* User Profile Settings */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-blue-600" />
          <span>Your Member Profile</span>
        </h3>

        {savedMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Account UUID</label>
            <input
              type="text"
              disabled
              value={currentUser?.id || ''}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-[10px] text-slate-500"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </form>
      </div>

      {/* Security Statement */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
          <Lock className="w-4 h-4" />
          <span>PostgreSQL Row Level Security Guarantee</span>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          All records created in {activeWorkspace?.name} are cryptographically isolated at the database level. Members cannot inspect records outside their authorized workspaces. Co-membership in an organisation conveys zero access to private personal finance vaults.
        </p>
      </div>
    </div>
  );
};
