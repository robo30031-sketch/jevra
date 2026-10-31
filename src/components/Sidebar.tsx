import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  ReceiptText,
  ShieldCheck,
  PieChart,
  CalendarCheck2,
  Users,
  ScrollText,
  FileCheck2,
  TestTube2,
  LogOut,
  Shield,
  Building2,
  User,
  PlusCircle,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'transactions'
  | 'approvals'
  | 'budgets'
  | 'bills'
  | 'members'
  | 'audit'
  | 'test_suite';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewWorkspace: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenNewWorkspace }) => {
  const { activeWorkspace, userRole } = useWorkspace();
  const { currentUser, signOut } = useAuth();

  const isOrg = activeWorkspace?.workspace_type === 'organisation';

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    {
      id: 'dashboard',
      label: isOrg ? 'Org Dashboard' : 'Personal Vault',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions',
      label: 'Financial Ledger',
      icon: ReceiptText,
    },
    {
      id: 'approvals',
      label: 'Approvals & Governance',
      icon: ShieldCheck,
      badge: isOrg ? '1' : undefined,
    },
    {
      id: 'budgets',
      label: 'Budgets & Goals',
      icon: PieChart,
    },
    {
      id: 'bills',
      label: 'Bills & Commitments',
      icon: CalendarCheck2,
    },
    {
      id: 'members',
      label: 'Members & Roles',
      icon: Users,
    },
    {
      id: 'audit',
      label: 'Audit Log Vault',
      icon: ScrollText,
    },
    {
      id: 'test_suite',
      label: 'Phase 1 Security Tests',
      icon: TestTube2,
      badge: '10/10',
    },
  ];

  return (
    <aside className="w-64 bg-[#070D1F] border-r border-slate-800 flex flex-col justify-between shrink-0 select-none text-slate-300">
      {/* Brand Header */}
      <div>
        <div className="p-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <div className="w-full h-full bg-[#0A1128] rounded-[11px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight font-sans">
                JEVRA
              </span>
              <span className="text-[10px] tracking-wider text-cyan-400 font-semibold uppercase">
                Finance &amp; Accountability
              </span>
            </div>
          </div>
        </div>

        {/* Active Workspace Banner */}
        <div className="px-4 py-3 bg-[#0A1229]/60 border-b border-slate-800/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              Active Context
            </span>
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                isOrg
                  ? 'bg-purple-950/70 text-purple-300 border border-purple-800/60'
                  : 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60'
              }`}
            >
              {isOrg ? 'Organisation' : 'Personal Vault'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isOrg ? (
              <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <User className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <p className="text-xs font-semibold text-white truncate">
              {activeWorkspace?.name || 'Loading Workspace...'}
            </p>
          </div>
          {userRole && (
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Your Role:</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {userRole.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  active
                    ? 'bg-blue-600/15 text-white border-l-2 border-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#060B1A]">
        <button
          onClick={onOpenNewWorkspace}
          className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white transition cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>New Workspace</span>
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0">
              <img
                src={currentUser?.avatar_url || `https://avatar.vercel.sh/${currentUser?.id}`}
                alt={currentUser?.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {currentUser?.full_name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {currentUser?.preferred_currency || 'INR'} Vault
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
