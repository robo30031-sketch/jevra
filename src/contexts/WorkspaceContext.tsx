import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { Workspace, WorkspaceRole, WorkspaceType, WorkspaceMember } from '../types/database';
import { useAuth } from './AuthContext';
import { dataEngine } from '../lib/dataEngine';

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  userRole: WorkspaceRole | null;
  members: (WorkspaceMember & { profile?: import('../types/database').Profile })[];
  isLoading: boolean;
  canManageMembers: boolean;
  canManageBudgets: boolean;
  canRecordTransaction: boolean;
  canApprove: boolean;
  isOwner: boolean;
  isTreasurer: boolean;
  isViewer: boolean;
  setActiveWorkspaceId: (workspaceId: string) => void;
  createWorkspace: (data: {
    name: string;
    workspace_type: WorkspaceType;
    currency?: string;
    description?: string;
  }) => Promise<{ success: boolean; workspace?: Workspace; error?: string }>;
  inviteMember: (email: string, role: WorkspaceRole) => Promise<{ success: boolean; error?: string }>;
  updateMemberRole: (targetUserId: string, newRole: WorkspaceRole) => Promise<{ success: boolean; error?: string }>;
  refreshWorkspaceData: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const ACTIVE_WS_STORAGE_KEY = 'jevra_active_workspace_id';

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<(WorkspaceMember & { profile?: import('../types/database').Profile })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWorkspacesForUser = () => {
    if (!currentUser) {
      setWorkspaces([]);
      setActiveWorkspace(null);
      setMembers([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // Enforce RLS: Only workspaces where user is active member or owner
    const authorized = dataEngine.getAuthorizedWorkspaces(currentUser.id);
    setWorkspaces(authorized);

    // Determine active workspace
    const storedWsId = localStorage.getItem(ACTIVE_WS_STORAGE_KEY);
    let target = authorized.find((w) => w.id === storedWsId);
    if (!target && authorized.length > 0) {
      target = authorized[0];
    }

    setActiveWorkspace(target || null);
    if (target) {
      localStorage.setItem(ACTIVE_WS_STORAGE_KEY, target.id);
      setMembers(dataEngine.getWorkspaceMembers(currentUser.id, target.id));
    } else {
      setMembers([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadWorkspacesForUser();
  }, [currentUser?.id]);

  const setActiveWorkspaceId = (workspaceId: string) => {
    if (!currentUser) return;
    const ws = dataEngine.getWorkspace(currentUser.id, workspaceId);
    if (ws) {
      setActiveWorkspace(ws);
      localStorage.setItem(ACTIVE_WS_STORAGE_KEY, ws.id);
      setMembers(dataEngine.getWorkspaceMembers(currentUser.id, ws.id));
    } else {
      console.warn('RLS Access Denied: User is not authorized to access workspace:', workspaceId);
    }
  };

  const userRole = useMemo<WorkspaceRole | null>(() => {
    if (!currentUser || !activeWorkspace) return null;
    return dataEngine.getRole(currentUser.id, activeWorkspace.id);
  }, [currentUser?.id, activeWorkspace?.id, members]);

  // Permissions based on userRole & workspace type
  const isOwner = userRole === 'owner';
  const isTreasurer = userRole === 'treasurer';
  const isViewer = userRole === 'viewer';
  const canManageMembers = isOwner;
  const canManageBudgets = isOwner || userRole === 'finance_manager';
  const canRecordTransaction =
    isOwner ||
    userRole === 'finance_manager' ||
    userRole === 'treasurer' ||
    (activeWorkspace?.workspace_type === 'personal' && userRole === 'member');
  const canApprove = isOwner || userRole === 'approver';

  const createWorkspace = async (data: {
    name: string;
    workspace_type: WorkspaceType;
    currency?: string;
    description?: string;
  }) => {
    if (!currentUser) return { success: false, error: 'Not authenticated' };

    try {
      const newWs = dataEngine.createWorkspace(currentUser.id, data);
      const authorized = dataEngine.getAuthorizedWorkspaces(currentUser.id);
      setWorkspaces(authorized);
      setActiveWorkspace(newWs);
      localStorage.setItem(ACTIVE_WS_STORAGE_KEY, newWs.id);
      setMembers(dataEngine.getWorkspaceMembers(currentUser.id, newWs.id));
      return { success: true, workspace: newWs };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  };

  const inviteMember = async (email: string, role: WorkspaceRole) => {
    if (!currentUser || !activeWorkspace) return { success: false, error: 'No active workspace' };
    const res = dataEngine.inviteMember(currentUser.id, activeWorkspace.id, email, role);
    if (res.success) {
      setMembers(dataEngine.getWorkspaceMembers(currentUser.id, activeWorkspace.id));
    }
    return res;
  };

  const updateMemberRole = async (targetUserId: string, newRole: WorkspaceRole) => {
    if (!currentUser || !activeWorkspace) return { success: false, error: 'No active workspace' };
    const res = dataEngine.updateMemberRole(currentUser.id, activeWorkspace.id, targetUserId, newRole);
    if (res.success) {
      setMembers(dataEngine.getWorkspaceMembers(currentUser.id, activeWorkspace.id));
    }
    return res;
  };

  const refreshWorkspaceData = () => {
    loadWorkspacesForUser();
  };

  const value = useMemo(
    () => ({
      workspaces,
      activeWorkspace,
      userRole,
      members,
      isLoading,
      canManageMembers,
      canManageBudgets,
      canRecordTransaction,
      canApprove,
      isOwner,
      isTreasurer,
      isViewer,
      setActiveWorkspaceId,
      createWorkspace,
      inviteMember,
      updateMemberRole,
      refreshWorkspaceData,
    }),
    [
      workspaces,
      activeWorkspace,
      userRole,
      members,
      isLoading,
      canManageMembers,
      canManageBudgets,
      canRecordTransaction,
      canApprove,
      isOwner,
      isTreasurer,
      isViewer,
    ]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
