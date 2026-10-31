import React, { useState, useRef, useEffect } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { WORKSPACE_CATEGORIES } from '../types/database';
import {
  Menu,
  ChevronDown,
  Building2,
  User,
  Plus,
  Bell,
  CheckCircle2,
  Users,
  Briefcase,
  GraduationCap,
  Hospital,
  Shield,
  Flame,
  Store,
  Landmark,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { dataEngine } from '../lib/dataEngine';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenNewTransaction: () => void;
  onOpenNewWorkspace: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenNewTransaction,
  onOpenNewWorkspace,
}) => {
  const { workspaces, activeWorkspace, setActiveWorkspaceId, userRole, canRecordTransaction, dataVersion } = useWorkspace();
  const { currentUser, signOut, isDemoMode, exitDemoMode } = useAuth();

  const [wsDropdownOpen, setWsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const wsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

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

  const getCatIcon = (catId?: string) => {
    switch (catId) {
      case 'school_education':
        return <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
      case 'hospital_health':
        return <Hospital className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      case 'police_station':
        return <Shield className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
      case 'fire_station':
        return <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
      case 'small_business':
        return <Store className="w-3.5 h-3.5 text-cyan-600 shrink-0" />;
      case 'family_finance':
        return <Users className="w-3.5 h-3.5 text-teal-600 shrink-0" />;
      case 'office_company':
        return <Briefcase className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
      case 'society_apartment':
        return <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />;
      default:
        return <User className="w-3.5 h-3.5 text-slate-700 shrink-0" />;
    }
  };

  const categoryInfo = activeWorkspace?.workspace_category
    ? WORKSPACE_CATEGORIES[activeWorkspace.workspace_category]
    : undefined;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: Hamburger Menu Button & Workspace Selector */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu Button */}
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer flex items-center justify-center border border-slate-200/80"
        >
          <Menu className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Workspace Selector Dropdown */}
        <div className="relative" ref={wsRef}>
          <button
            onClick={() => setWsDropdownOpen(!wsDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer text-left"
          >
            <div className="p-1 rounded-lg bg-white border border-slate-200 shadow-2xs">
              {getCatIcon(activeWorkspace?.workspace_category)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 max-w-[140px] sm:max-w-[200px] truncate">
                  {activeWorkspace?.name || 'Select Workspace'}
                </span>
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                  {activeWorkspace?.currency || 'INR'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 capitalize truncate max-w-[180px]">
                {categoryInfo?.name || activeWorkspace?.workspace_type || 'Workspace'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>

          {/* Workspace Dropdown */}
          {wsDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Authorised Workspace ({workspaces.length})
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto mb-2">
                {workspaces.map((ws) => {
                  const isCurrent = activeWorkspace?.id === ws.id;
                  const cat = WORKSPACE_CATEGORIES[ws.workspace_category];
                  return (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setActiveWorkspaceId(ws.id);
                        setWsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <div className="p-1 rounded-md bg-white border border-slate-200 shrink-0">
                          {getCatIcon(ws.workspace_category)}
                        </div>
                        <div className="text-left truncate">
                          <p className="truncate font-semibold text-slate-900">{ws.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {cat?.name || ws.workspace_type}
                          </p>
                        </div>
                      </div>
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-1.5">
                <button
                  onClick={() => {
                    setWsDropdownOpen(false);
                    onOpenNewWorkspace();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-blue-600 hover:bg-blue-50 font-semibold transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Financial Workspace</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Sample Demo Mode Badge */}
        {isDemoMode && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-semibold text-[11px] hidden sm:inline">DEMO EXPERIENCE: SAMPLE DATA</span>
            <button
              onClick={exitDemoMode}
              className="text-[10px] font-bold text-amber-800 underline hover:text-amber-950 ml-1 cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        )}

        {/* Currency badge */}
        <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-[11px] font-semibold text-slate-700 border border-slate-200">
          <span>Currency:</span>
          <span className="text-blue-700 font-bold">{activeWorkspace?.currency || 'INR'} (₹)</span>
        </span>

        {/* Record Transaction Button */}
        {canRecordTransaction && (
          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-xs shadow-blue-500/20 transition cursor-pointer"
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
                <span className="text-xs font-bold text-slate-800">Governance Alerts</span>
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

        {/* User Profile Menu */}
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
            <div className="text-left hidden md:block">
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
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{currentUser?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.preferred_currency} Vault</p>
              </div>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  if (isDemoMode) exitDemoMode();
                  else signOut();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 font-medium transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{isDemoMode ? 'Exit Demo Experience' : 'Sign Out'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
