import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import {
  ChevronDown,
  Building2,
  User,
  Plus,
  Database,
  Bell,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Sparkles,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { dataEngine } from '../lib/dataEngine';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenNewWorkspace: () => void;
  onOpenSupabaseModal: () => void;
  onOpenTestSuite: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTransaction,
  onOpenNewWorkspace,
  onOpenSupabaseModal,
  onOpenTestSuite,
}) => {
  const { workspaces, activeWorkspace, setActiveWorkspaceId, userRole, canRecordTransaction } = useWorkspace();
  const { currentUser, switchUser, allUsers, isSupabaseLive, supabaseStatus } = useAuth();

  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const wsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsDropdownOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = currentUser ? dataEngine.getNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const personalWorkspaces = workspaces.filter((w) => w.workspace_type === 'personal');
  const orgWorkspaces = workspaces.filter((w) => w.workspace_type === 'organisation');

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Workspace Switcher */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={wsRef}>
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100/80 transition cursor-pointer text-left"
          >
            <div className="p-1 rounded-lg bg-slate-200 text-slate-700">
              {activeWorkspace?.workspace_type === 'organisation' ? (
                <Building2 className="w-4 h-4 text-purple-600" />
              ) : (
                <User className="w-4 h-4 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 max-w-[180px] truncate">
                  {activeWorkspace?.name || 'Select Workspace'}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  {activeWorkspace?.currency || 'INR'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 capitalize">
                {activeWorkspace?.workspace_type || 'Workspace'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Workspace Dropdown */}
          {wsDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Personal Vaults
              </div>
              <div className="space-y-1 mb-2">
                {personalWorkspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setWsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                      activeWorkspace?.id === ws.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {activeWorkspace?.id === ws.id && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))}
              </div>

              <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-t border-slate-100 pt-2">
                Organisations &amp; Societies
              </div>
              <div className="space-y-1 mb-2">
                {orgWorkspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspaceId(ws.id);
                      setWsDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition cursor-pointer ${
                      activeWorkspace?.id === ws.id
                        ? 'bg-purple-50 text-purple-700 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {activeWorkspace?.id === ws.id && <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />}
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-1.5 mt-1">
                <button
                  onClick={() => {
                    setWsDropdownOpen(false);
                    onOpenNewWorkspace();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs text-blue-600 hover:bg-blue-50 font-medium transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Currency badge */}
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
          <span>Currency:</span>
          <span className="text-cyan-700">{activeWorkspace?.currency || 'INR'} (₹)</span>
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Supabase Connection Status Pill */}
        <button
          onClick={onOpenSupabaseModal}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition cursor-pointer ${
            isSupabaseLive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
              : 'bg-cyan-50 text-cyan-800 border-cyan-200 hover:bg-cyan-100/70'
          }`}
          title="Supabase Database &amp; SQL Migration Studio"
        >
          <Database className={`w-3.5 h-3.5 ${isSupabaseLive ? 'text-emerald-600' : 'text-cyan-600'}`} />
          <span className="hidden md:inline">
            {isSupabaseLive ? 'Supabase Live' : 'Supabase Studio &amp; Schema'}
          </span>
          <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-500'}`} />
        </button>

        {/* Quick Phase 1 Test Launcher */}
        <button
          onClick={onOpenTestSuite}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Verify Phase 1 Security</span>
        </button>

        {/* Record Transaction Button */}
        {canRecordTransaction && (
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Record Entry</span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">Governance Notifications</span>
                <span className="text-[10px] text-slate-500">{notifications.length} alerts</span>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl text-xs border ${
                        n.read_at ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-blue-50/50 border-blue-100 text-slate-800'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{n.title}</p>
                      <p className="text-[11px] text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[9px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-slate-300">
              <img
                src={currentUser?.avatar_url || `https://avatar.vercel.sh/${currentUser?.id}`}
                alt={currentUser?.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left hidden lg:block">
              <span className="text-xs font-bold text-slate-800 block leading-tight">
                {currentUser?.full_name?.split(' ')[0] || 'User'}
              </span>
              <span className="text-[9px] font-semibold uppercase text-cyan-600 block">
                {userRole || 'Member'}
              </span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{currentUser?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.id}</p>
              </div>

              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Persona (Test RLS)
              </div>
              <div className="space-y-1">
                {allUsers.slice(0, 4).map((u, i) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                      currentUser?.id === u.id ? 'bg-cyan-50 text-cyan-800 font-semibold' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{u.full_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {i === 0 ? 'Owner (Palm Grove + Vault)' : i === 1 ? 'Treasurer (Palm Grove)' : i === 2 ? 'Approver (Palm Grove)' : 'Outsider (Vikram Malhotra)'}
                      </p>
                    </div>
                    {currentUser?.id === u.id && <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
