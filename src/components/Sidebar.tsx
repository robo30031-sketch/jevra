import React from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';
import { WORKSPACE_CATEGORIES } from '../types/database';
import {
  LayoutDashboard,
  Wallet,
  Users,
  Building2,
  ShieldCheck,
  CalendarClock,
  Handshake,
  PieChart,
  FileCheck2,
  BarChart3,
  Sparkles,
  Bell,
  Settings,
  PlusCircle,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  GraduationCap,
  Hospital,
  Flame,
  Store,
  Landmark,
} from 'lucide-react';

export type NavigationTab =
  | 'dashboard'
  | 'money_manager'
  | 'family_groups'
  | 'organisations'
  | 'accountability'
  | 'bills'
  | 'loans'
  | 'budgets'
  | 'evidence'
  | 'reports'
  | 'intelligence'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenNewWorkspace: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewWorkspace,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { activeWorkspace, userRole } = useWorkspace();
  const { currentUser, signOut, isDemoMode, exitDemoMode } = useAuth();

  const categoryInfo = activeWorkspace?.workspace_category
    ? WORKSPACE_CATEGORIES[activeWorkspace.workspace_category]
    : undefined;

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'money_manager', label: 'Money Manager', icon: Wallet },
    { id: 'family_groups', label: 'Family & Groups', icon: Users },
    { id: 'organisations', label: 'Organisations', icon: Building2 },
    { id: 'accountability', label: 'Accountability Centre', icon: ShieldCheck, badge: activeWorkspace?.workspace_type === 'organisation' ? 'Review' : undefined },
    { id: 'bills', label: 'Bills & Commitments', icon: CalendarClock },
    { id: 'loans', label: 'Lending & Borrowing', icon: Handshake },
    { id: 'budgets', label: 'Budget & Savings', icon: PieChart },
    { id: 'evidence', label: 'Evidence Vault', icon: FileCheck2 },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'intelligence', label: 'JEVRA Intelligence', icon: Sparkles },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const getWorkspaceCategoryIcon = () => {
    switch (activeWorkspace?.workspace_category) {
      case 'school_education':
        return <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'hospital_health':
        return <Hospital className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'police_station':
        return <Shield className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'fire_station':
        return <Flame className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'small_business':
        return <Store className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'government_dept':
        return <Landmark className="w-4 h-4 text-slate-300 shrink-0" />;
      case 'family_finance':
        return <Users className="w-4 h-4 text-teal-400 shrink-0" />;
      case 'society_apartment':
        return <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />;
      default:
        return <User className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between select-none bg-[#070D1F] text-slate-300">
      {/* Brand Header */}
      <div>
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <div className="w-full h-full bg-[#0A1128] rounded-[11px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 stroke-[2.2]" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <span className="text-lg font-bold tracking-tight text-white block leading-tight font-sans">
                  JEVRA
                </span>
                <span className="text-[10px] tracking-wider text-cyan-400 font-semibold uppercase truncate block">
                  Finance &amp; Accountability
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle button */}
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Workspace Mini-Card */}
        {!isCollapsed ? (
          <div className="px-4 py-3 bg-[#0A1229]/80 border-b border-slate-800/60">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold tracking-wider text-slate-400 uppercase">
                Active Workspace
              </span>
              <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {categoryInfo?.name || (activeWorkspace?.workspace_type === 'organisation' ? 'Organisation' : 'Personal')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {getWorkspaceCategoryIcon()}
              <p className="text-xs font-bold text-white truncate">
                {activeWorkspace?.name || 'My Financial Vault'}
              </p>
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Role: <strong className="text-emerald-400 uppercase">{userRole?.replace('_', ' ')}</strong></span>
              <span className="text-cyan-400 font-semibold">{activeWorkspace?.currency || 'INR'} (₹)</span>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-slate-800/60" title={activeWorkspace?.name}>
            <div className="p-2 rounded-xl bg-slate-800/80">
              {getWorkspaceCategoryIcon()}
            </div>
          </div>
        )}

        {/* Navigation items list */}
        <nav className="p-2.5 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${
                  isCollapsed ? 'justify-center px-2 py-2.5' : 'justify-between px-3 py-2.5'
                } rounded-xl text-xs font-medium transition cursor-pointer relative group ${
                  active
                    ? 'bg-blue-600/20 text-white border-l-2 border-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold shrink-0">
                    {item.badge}
                  </span>
                )}

                {/* Floating tooltip when collapsed on desktop */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-lg shadow-xl border border-slate-700 pointer-events-none opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Account & Quick Actions */}
      <div className="p-3 border-t border-slate-800/80 bg-[#060B1A]">
        {!isCollapsed && (
          <button
            onClick={onOpenNewWorkspace}
            className="w-full mb-3 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Create Workspace</span>
          </button>
        )}

        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-700 shrink-0">
              <img
                src={currentUser?.avatar_url || `https://avatar.vercel.sh/${currentUser?.id}`}
                alt={currentUser?.full_name}
                className="w-full h-full object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.full_name || 'Account'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {isDemoMode ? 'Sample Demo Mode' : 'Verified Member'}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => (isDemoMode ? exitDemoMode() : signOut())}
              title={isDemoMode ? 'Exit Demo Experience' : 'Sign out'}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/60 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 border-r border-slate-800 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Slide-in Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
