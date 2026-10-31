-- ==============================================================================
-- JEVRA — PHASE 1: FOUNDATION, DATABASE & SECURITY MIGRATION
-- Migration: 20250101000000_jevra_phase1_foundation.sql
-- Tagline: Every Rupee. Every Responsibility. Every Record.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. SCHEMAS & TABLES
-- ==============================================================================

-- A. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,
    preferred_currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- B. WORKSPACES
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    workspace_type TEXT NOT NULL CHECK (workspace_type IN ('personal', 'organisation')),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    currency TEXT NOT NULL DEFAULT 'INR',
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- C. WORKSPACE_MEMBERS
CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'finance_manager', 'treasurer', 'approver', 'member', 'viewer')),
    membership_status TEXT NOT NULL DEFAULT 'active' CHECK (membership_status IN ('active', 'invited', 'suspended')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    CONSTRAINT unique_workspace_user UNIQUE (workspace_id, user_id)
);

-- D. WORKSPACE_INVITATIONS
CREATE TABLE IF NOT EXISTS public.workspace_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    invited_email TEXT NOT NULL,
    assigned_role TEXT NOT NULL CHECK (assigned_role IN ('finance_manager', 'treasurer', 'approver', 'member', 'viewer')),
    invitation_token_hash TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- E. CATEGORIES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_type TEXT NOT NULL CHECK (category_type IN ('income', 'expense')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- F. TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    responsible_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense', 'contribution', 'repayment', 'transfer')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    description TEXT NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'upi' CHECK (payment_method IN ('bank_transfer', 'upi', 'cash', 'card', 'cheque', 'other')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('draft', 'pending_approval', 'approved', 'rejected', 'completed')),
    evidence_status TEXT NOT NULL DEFAULT 'none' CHECK (evidence_status IN ('none', 'uploaded', 'verified', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- G. BUDGETS
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('monthly', 'quarterly', 'yearly', 'custom')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- H. FINANCIAL_GOALS
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_amount NUMERIC(15, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'paused', 'cancelled')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- I. BILLS
CREATE TABLE IF NOT EXISTS public.bills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    due_date DATE NOT NULL,
    recurrence TEXT NOT NULL DEFAULT 'monthly' CHECK (recurrence IN ('one_time', 'weekly', 'monthly', 'quarterly', 'yearly')),
    assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- J. LOANS
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    lender_name TEXT NOT NULL,
    borrower_name TEXT NOT NULL,
    principal_amount NUMERIC(15, 2) NOT NULL CHECK (principal_amount > 0),
    outstanding_amount NUMERIC(15, 2) NOT NULL CHECK (outstanding_amount >= 0),
    due_date DATE,
    loan_type TEXT NOT NULL CHECK (loan_type IN ('given', 'taken')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'settled', 'defaulted')),
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- K. CONTRIBUTIONS
CREATE TABLE IF NOT EXISTS public.contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    contributor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purpose TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('pledged', 'received', 'acknowledged')),
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- L. APPROVALS
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    requested_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    approver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    comments TEXT,
    requested_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    reviewed_at TIMESTAMPTZ,
    -- Rule: Approver cannot approve their own requests
    CONSTRAINT no_self_approval CHECK (requested_by != approver_id OR approver_id IS NULL)
);

-- M. AUDIT_LOGS (Append-only)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    previous_values JSONB,
    new_values JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- N. EVIDENCE_FILES
CREATE TABLE IF NOT EXISTS public.evidence_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 26214400), -- max 25MB
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- O. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'approval_request', 'approval_granted', 'approval_rejected',
        'contribution_received', 'bill_due', 'member_joined', 'system'
    )),
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ==============================================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_user ON public.workspace_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_ws ON public.workspace_members(workspace_id);
CREATE INDEX IF NOT EXISTS idx_workspace_members_role ON public.workspace_members(workspace_id, role);
CREATE INDEX IF NOT EXISTS idx_transactions_ws_date ON public.transactions(workspace_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_budgets_ws ON public.budgets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_goals_ws ON public.financial_goals(workspace_id);
CREATE INDEX IF NOT EXISTS idx_bills_ws_due ON public.bills(workspace_id, due_date);
CREATE INDEX IF NOT EXISTS idx_loans_ws ON public.loans(workspace_id);
CREATE INDEX IF NOT EXISTS idx_contributions_ws ON public.contributions(workspace_id);
CREATE INDEX IF NOT EXISTS idx_approvals_ws_status ON public.approvals(workspace_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ws_created ON public.audit_logs(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at);

-- ==============================================================================
-- 4. SECURITY & IMMUTABILITY TRIGGERS
-- ==============================================================================

-- 4.1 Strict append-only enforcement for audit_logs
CREATE OR REPLACE FUNCTION public.enforce_audit_log_immutability()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    RAISE EXCEPTION 'JEVRA Security Violation: audit_logs is append-only. Updates and deletions are strictly forbidden.';
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_logs_immutable ON public.audit_logs;
CREATE TRIGGER trg_audit_logs_immutable
BEFORE UPDATE OR DELETE ON public.audit_logs
FOR EACH ROW EXECUTE FUNCTION public.enforce_audit_log_immutability();

-- 4.2 Updated_at timestamp automatic refresher
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 5. ACCESS CONTROL & ROLE HELPER FUNCTIONS (SECURITY INVOKER & STABLE)
-- ==============================================================================

-- Helper to check if current user is active member of workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_ws_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = target_ws_id
          AND user_id = auth.uid()
          AND membership_status = 'active'
    );
$$;

-- Helper to get current user's role in a workspace
CREATE OR REPLACE FUNCTION public.get_workspace_role(target_ws_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT role FROM public.workspace_members
    WHERE workspace_id = target_ws_id
      AND user_id = auth.uid()
      AND membership_status = 'active'
    LIMIT 1;
$$;

-- Helper to check if user has one of permitted roles
CREATE OR REPLACE FUNCTION public.has_workspace_role(target_ws_id UUID, allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = target_ws_id
          AND user_id = auth.uid()
          AND membership_status = 'active'
          AND role = ANY(allowed_roles)
    );
$$;

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across every single table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 6.1 PROFILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Users can view profiles of co-members in shared workspaces"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.workspace_members wm1
            JOIN public.workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
            WHERE wm1.user_id = auth.uid()
              AND wm2.user_id = public.profiles.id
        )
    );

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6.2 WORKSPACES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view authorized workspaces"
    ON public.workspaces FOR SELECT
    TO authenticated
    USING (
        public.is_workspace_member(id) OR owner_id = auth.uid()
    );

CREATE POLICY "Authenticated users can create workspaces"
    ON public.workspaces FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Only workspace owner can update workspace details"
    ON public.workspaces FOR UPDATE
    TO authenticated
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Only workspace owner can delete workspace"
    ON public.workspaces FOR DELETE
    TO authenticated
    USING (owner_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 6.3 WORKSPACE_MEMBERS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view co-members of their workspaces"
    ON public.workspace_members FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Owners and finance managers can invite/add members"
    ON public.workspace_members FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager'])
        OR (user_id = auth.uid() AND role = 'owner') -- Self-registration on workspace creation
    );

CREATE POLICY "Only owners can update member roles; members cannot elevate own permissions"
    ON public.workspace_members FOR UPDATE
    TO authenticated
    USING (
        public.has_workspace_role(workspace_id, ARRAY['owner'])
        AND user_id != auth.uid() -- Owners cannot downgrade themselves if sole owner
    )
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner'])
    );

CREATE POLICY "Owners can remove members or users can leave"
    ON public.workspace_members FOR DELETE
    TO authenticated
    USING (
        public.has_workspace_role(workspace_id, ARRAY['owner'])
        OR user_id = auth.uid()
    );

-- ------------------------------------------------------------------------------
-- 6.4 WORKSPACE_INVITATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view invitations of their workspace"
    ON public.workspace_invitations FOR SELECT
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager']));

CREATE POLICY "Authorized managers can create invitations"
    ON public.workspace_invitations FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager'])
        AND invited_by = auth.uid()
    );

CREATE POLICY "Owners can cancel invitations"
    ON public.workspace_invitations FOR DELETE
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner']));

-- ------------------------------------------------------------------------------
-- 6.5 CATEGORIES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view workspace categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Managers and treasurers can insert categories"
    ON public.categories FOR INSERT
    TO authenticated
    WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']));

CREATE POLICY "Managers can update categories"
    ON public.categories FOR UPDATE
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager']))
    WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager']));

CREATE POLICY "Managers can delete categories"
    ON public.categories FOR DELETE
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager']));

-- ------------------------------------------------------------------------------
-- 6.6 TRANSACTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Authorized members can view transactions"
    ON public.transactions FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Treasurers, managers, and owners can record transactions"
    ON public.transactions FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer'])
        AND created_by = auth.uid()
    );

CREATE POLICY "Treasurers and managers can update unapproved or draft transactions"
    ON public.transactions FOR UPDATE
    TO authenticated
    USING (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer'])
        AND status IN ('draft', 'pending_approval')
    )
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer'])
    );

CREATE POLICY "Only owners can delete transactions"
    ON public.transactions FOR DELETE
    TO authenticated
    USING (
        public.has_workspace_role(workspace_id, ARRAY['owner'])
        AND status IN ('draft', 'rejected')
    );

-- ------------------------------------------------------------------------------
-- 6.7 BUDGETS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view workspace budgets"
    ON public.budgets FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Managers and owners can manage budgets"
    ON public.budgets FOR ALL
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager']))
    WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager']));

-- ------------------------------------------------------------------------------
-- 6.8 FINANCIAL GOALS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view financial goals"
    ON public.financial_goals FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Managers, treasurers, and owners can manage goals"
    ON public.financial_goals FOR ALL
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']))
    WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']));

-- ------------------------------------------------------------------------------
-- 6.9 BILLS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view workspace bills"
    ON public.bills FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Authorized members can manage bills"
    ON public.bills FOR ALL
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']))
    WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']));

-- ------------------------------------------------------------------------------
-- 6.10 LOANS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view workspace loans"
    ON public.loans FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Managers, treasurers, and owners can manage loans"
    ON public.loans FOR ALL
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']))
    WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']));

-- ------------------------------------------------------------------------------
-- 6.11 CONTRIBUTIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view contributions in their workspace"
    ON public.contributions FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Members can submit contributions"
    ON public.contributions FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_workspace_member(workspace_id)
        AND contributor_user_id = auth.uid()
    );

CREATE POLICY "Treasurers and managers can update contribution status"
    ON public.contributions FOR UPDATE
    TO authenticated
    USING (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']))
    WITH CHECK (public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer']));

-- ------------------------------------------------------------------------------
-- 6.12 APPROVALS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view approvals in their workspace"
    ON public.approvals FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Staff can request approvals"
    ON public.approvals FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer'])
        AND requested_by = auth.uid()
    );

CREATE POLICY "Approvers and owners can review approvals (no self-approval)"
    ON public.approvals FOR UPDATE
    TO authenticated
    USING (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'approver'])
        AND requested_by != auth.uid() -- Strict separation of duties: cannot approve own request!
    )
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'approver'])
        AND requested_by != auth.uid()
    );

-- ------------------------------------------------------------------------------
-- 6.13 AUDIT_LOGS POLICIES (Append-only)
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view audit logs for their workspace"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Authenticated users can append audit entries for their actions"
    ON public.audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_workspace_member(workspace_id)
        AND actor_user_id = auth.uid()
    );

-- Notice: NO UPDATE or DELETE policies exist for audit_logs, plus the trigger strictly aborts.

-- ------------------------------------------------------------------------------
-- 6.14 EVIDENCE_FILES POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Members can view evidence file records in their workspace"
    ON public.evidence_files FOR SELECT
    TO authenticated
    USING (public.is_workspace_member(workspace_id));

CREATE POLICY "Treasurers and uploaders can register evidence files"
    ON public.evidence_files FOR INSERT
    TO authenticated
    WITH CHECK (
        public.has_workspace_role(workspace_id, ARRAY['owner', 'finance_manager', 'treasurer'])
        AND uploaded_by = auth.uid()
    );

-- ------------------------------------------------------------------------------
-- 6.15 NOTIFICATIONS POLICIES
-- ------------------------------------------------------------------------------
CREATE POLICY "Users can view and manage their own notifications"
    ON public.notifications FOR ALL
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ==============================================================================
-- 7. SUPABASE STORAGE BUCKET & POLICIES ('jevra-evidence')
-- ==============================================================================

-- Storage bucket creation (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'jevra-evidence',
    'jevra-evidence',
    false,
    26214400, -- 25MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Download/Read only if member of workspace in path: (storage_path format: 'workspace_id/filename')
CREATE POLICY "Authorized members can read workspace evidence files"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'jevra-evidence'
        AND public.is_workspace_member((storage.foldername(name))[1]::uuid)
    );

CREATE POLICY "Treasurers and managers can upload evidence files"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'jevra-evidence'
        AND public.has_workspace_role((storage.foldername(name))[1]::uuid, ARRAY['owner', 'finance_manager', 'treasurer'])
    );

-- ==============================================================================
-- 8. AUTOMATIC ONBOARDING TRIGGER (Profiles + Default Personal Workspace)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_profile_name TEXT;
    new_ws_id UUID;
BEGIN
    -- Derive display name
    new_profile_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Create profile
    INSERT INTO public.profiles (id, full_name, avatar_url, preferred_currency)
    VALUES (
        NEW.id,
        new_profile_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'INR'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name;

    -- Create default Personal Workspace
    INSERT INTO public.workspaces (name, workspace_type, owner_id, currency, description)
    VALUES (
        new_profile_name || '''s Personal Vault',
        'personal',
        NEW.id,
        'INR',
        'Default personal finance & responsibility vault'
    )
    RETURNING id INTO new_ws_id;

    -- Assign user as Owner
    INSERT INTO public.workspace_members (workspace_id, user_id, role, membership_status)
    VALUES (new_ws_id, NEW.id, 'owner', 'active');

    -- Insert default categories for personal workspace
    INSERT INTO public.categories (workspace_id, name, category_type) VALUES
        (new_ws_id, 'Salary & Earnings', 'income'),
        (new_ws_id, 'Investments & Dividends', 'income'),
        (new_ws_id, 'Housing & Rent', 'expense'),
        (new_ws_id, 'Groceries & Household', 'expense'),
        (new_ws_id, 'Utilities & Bills', 'expense'),
        (new_ws_id, 'Health & Insurance', 'expense'),
        (new_ws_id, 'Education & Growth', 'expense'),
        (new_ws_id, 'Emergency Fund', 'expense');

    -- Log system audit
    INSERT INTO public.audit_logs (workspace_id, actor_user_id, action, entity_type, entity_id, new_values)
    VALUES (
        new_ws_id,
        NEW.id,
        'WORKSPACE_CREATED',
        'workspace',
        new_ws_id,
        jsonb_build_object('name', new_profile_name || '''s Personal Vault', 'type', 'personal')
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_registration();

-- ==============================================================================
-- 9. DATA API EXPOSURE & GRANTS
-- ==============================================================================
-- Grant usage on public schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
-- Anonymous users are strictly denied data access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ==============================================================================
-- END OF MIGRATION
-- ==============================================================================
