import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import { EntrySplash } from './components/EntrySplash';
import { AuthView } from './components/AuthView';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { AdaptiveDashboard } from './components/dashboards/AdaptiveDashboard';
import { TransactionsView } from './components/views/TransactionsView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { BudgetsView } from './components/views/BudgetsView';
import { BillsView } from './components/views/BillsView';
import { LoansView } from './components/views/LoansView';
import { FamilyGroupsView } from './components/views/FamilyGroupsView';
import { OrganisationsView } from './components/views/OrganisationsView';
import { ReportsView } from './components/views/ReportsView';
import { NotificationsView } from './components/views/NotificationsView';
import { SettingsView } from './components/views/SettingsView';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { WorkspaceOnboardingModal } from './components/onboarding/WorkspaceOnboardingModal';

function MainApp() {
  const { currentUser, isLoading, isDemoMode, exitDemoMode } = useAuth();
  const { activeWorkspace, refreshWorkspaceData } = useWorkspace();

  const [hasCompletedSplash, setHasCompletedSplash] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Sidebar collapse states (desktop & mobile)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // If splash not completed yet, show the brand entrance
  if (!hasCompletedSplash) {
    return <EntrySplash onComplete={() => setHasCompletedSplash(true)} />;
  }

  // If loading auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D1F] flex items-center justify-center text-white text-xs">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-slate-400 font-medium">Initializing JEVRA Secure Session...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated and not in demo mode
  if (!currentUser) {
    return (
      <>
        <AuthView
          onSuccess={() => setCurrentTab('dashboard')}
          onRequestOnboarding={() => setShowOnboardingModal(true)}
        />
        <WorkspaceOnboardingModal
          isOpen={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onSuccess={() => {
            refreshWorkspaceData();
            setCurrentTab('dashboard');
          }}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewWorkspace={() => setShowOnboardingModal(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header with Hamburger Menu and Workspace Switcher */}
        <Header
          onToggleSidebar={() => {
            // If on mobile (screen < 1024), toggle mobile drawer, else toggle desktop collapse
            if (window.innerWidth < 1024) {
              setIsMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          onOpenNewTransaction={() => setShowAddTxModal(true)}
          onOpenNewWorkspace={() => setShowOnboardingModal(true)}
        />

        {/* Demo Experience Banner when active */}
        {isDemoMode && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-xs shrink-0 select-none">
            <div className="flex items-center gap-2 truncate">
              <span className="px-1.5 py-0.5 rounded bg-black/20 text-[10px] uppercase tracking-wider font-extrabold">
                Demo Experience
              </span>
              <span className="truncate">
                Browsing sample financial environment with realistic fictional records.
              </span>
            </div>
            <button
              onClick={exitDemoMode}
              className="px-2.5 py-1 rounded-md bg-slate-900 text-white hover:bg-black text-[11px] font-bold cursor-pointer shrink-0 ml-3"
            >
              Exit Demo &amp; Sign In
            </button>
          </div>
        )}

        {/* Dynamic View Router */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              <AdaptiveDashboard
                onOpenNewTransaction={() => setShowAddTxModal(true)}
                onNavigateTab={setCurrentTab}
              />
            )}

            {currentTab === 'money_manager' && (
              <TransactionsView onOpenNewTransaction={() => setShowAddTxModal(true)} />
            )}

            {currentTab === 'family_groups' && <FamilyGroupsView />}

            {currentTab === 'organisations' && (
              <OrganisationsView onOpenNewWorkspace={() => setShowOnboardingModal(true)} />
            )}

            {currentTab === 'accountability' && <ApprovalsView />}

            {currentTab === 'bills' && <BillsView />}

            {currentTab === 'loans' && <LoansView />}

            {currentTab === 'budgets' && <BudgetsView />}

            {currentTab === 'reports' && <ReportsView />}

            {currentTab === 'notifications' && <NotificationsView />}

            {currentTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Record Entry Modal */}
      <AddTransactionModal
        isOpen={showAddTxModal}
        onClose={() => setShowAddTxModal(false)}
        onSuccess={() => refreshWorkspaceData()}
      />

      {/* Workspace Onboarding & Category Setup Modal */}
      <WorkspaceOnboardingModal
        isOpen={showOnboardingModal}
        onClose={() => setShowOnboardingModal(false)}
        onSuccess={() => refreshWorkspaceData()}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <MainApp />
      </WorkspaceProvider>
    </AuthProvider>
  );
}
