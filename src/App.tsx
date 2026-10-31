import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import { EntrySplash } from './components/EntrySplash';
import { AuthView } from './components/AuthView';
import { Sidebar, NavigationTab } from './components/Sidebar';
import { Header } from './components/Header';
import { PersonalDashboard } from './components/dashboards/PersonalDashboard';
import { OrganisationDashboard } from './components/dashboards/OrganisationDashboard';
import { TransactionsView } from './components/views/TransactionsView';
import { ApprovalsView } from './components/views/ApprovalsView';
import { BudgetsView } from './components/views/BudgetsView';
import { BillsView } from './components/views/BillsView';
import { MembersView } from './components/views/MembersView';
import { AuditView } from './components/views/AuditView';
import { Phase1TestSuite } from './components/Phase1TestSuite';
import { AddTransactionModal } from './components/modals/AddTransactionModal';
import { NewWorkspaceModal } from './components/modals/NewWorkspaceModal';
import { SupabaseMigrationModal } from './components/modals/SupabaseMigrationModal';

function MainApp() {
  const { currentUser, isLoading } = useAuth();
  const { activeWorkspace, refreshWorkspaceData } = useWorkspace();

  const [hasCompletedSplash, setHasCompletedSplash] = useState(false);
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');

  // Modals state
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [showNewWsModal, setShowNewWsModal] = useState(false);
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);

  // If splash not completed yet, show the 5-step animation
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

  // If unauthenticated
  if (!currentUser) {
    return <AuthView onSuccess={() => setCurrentTab('dashboard')} />;
  }

  const isOrg = activeWorkspace?.workspace_type === 'organisation';

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800 font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewWorkspace={() => setShowNewWsModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Header */}
        <Header
          onOpenNewTransaction={() => setShowAddTxModal(true)}
          onOpenNewWorkspace={() => setShowNewWsModal(true)}
          onOpenSupabaseModal={() => setShowSupabaseModal(true)}
          onOpenTestSuite={() => setCurrentTab('test_suite')}
        />

        {/* View Router */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto pb-12">
            {currentTab === 'dashboard' && (
              isOrg ? (
                <OrganisationDashboard
                  onOpenNewTransaction={() => setShowAddTxModal(true)}
                  onNavigateTab={setCurrentTab}
                />
              ) : (
                <PersonalDashboard
                  onOpenNewTransaction={() => setShowAddTxModal(true)}
                  onNavigateTab={setCurrentTab}
                />
              )
            )}

            {currentTab === 'transactions' && (
              <TransactionsView onOpenNewTransaction={() => setShowAddTxModal(true)} />
            )}

            {currentTab === 'approvals' && <ApprovalsView />}

            {currentTab === 'budgets' && <BudgetsView />}

            {currentTab === 'bills' && <BillsView />}

            {currentTab === 'members' && <MembersView />}

            {currentTab === 'audit' && <AuditView />}

            {currentTab === 'test_suite' && <Phase1TestSuite />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={showAddTxModal}
        onClose={() => setShowAddTxModal(false)}
        onSuccess={() => refreshWorkspaceData()}
      />

      <NewWorkspaceModal
        isOpen={showNewWsModal}
        onClose={() => setShowNewWsModal(false)}
        onSuccess={() => refreshWorkspaceData()}
      />

      <SupabaseMigrationModal
        isOpen={showSupabaseModal}
        onClose={() => setShowSupabaseModal(false)}
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
