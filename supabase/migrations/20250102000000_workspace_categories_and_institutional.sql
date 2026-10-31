-- ==============================================================================
-- JEVRA — PHASE 2: WORKSPACE CATEGORIES & INSTITUTIONAL CONFIGURATION
-- Migration: 20250102000000_workspace_categories_and_institutional.sql
-- Tagline: Every Rupee. Every Responsibility. Every Record.
-- ==============================================================================

-- 1. ADD WORKSPACE CATEGORY AND INSTITUTIONAL ATTRIBUTES
ALTER TABLE public.workspaces 
ADD COLUMN IF NOT EXISTS workspace_category TEXT NOT NULL DEFAULT 'personal_finance',
ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'unverified' 
    CHECK (verification_status IN ('unverified', 'pending_verification', 'verified', 'institutional_exempt')),
ADD COLUMN IF NOT EXISTS institution_details JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS custom_config JSONB DEFAULT '{}'::jsonb;

-- Index for category queries
CREATE INDEX IF NOT EXISTS idx_workspaces_category ON public.workspaces(workspace_category);

-- Comment for documentation
COMMENT ON COLUMN public.workspaces.workspace_category IS 'Category of workspace: personal_finance, family_finance, society_apartment, office_company, school_education, hospital_health, police_station, fire_station, ngo_foundation, club_association, small_business, government_dept, other';
COMMENT ON COLUMN public.workspaces.verification_status IS 'Verification state for institutional/public sector workspaces';
