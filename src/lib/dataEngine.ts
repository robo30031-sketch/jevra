import {
  Profile,
  Workspace,
  WorkspaceMember,
  WorkspaceInvitation,
  Category,
  Transaction,
  Budget,
  FinancialGoal,
  Bill,
  Loan,
  Contribution,
  Approval,
  AuditLog,
  EvidenceFile,
  Notification,
  WorkspaceRole,
  WorkspaceType,
} from '../types/database';
import { getSupabaseClient } from './supabase';

// Seeded users for demonstration, role-testing, and running Phase 1 verification tests
export const SEED_USERS: Profile[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    full_name: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98765 43210',
    preferred_currency: 'INR',
    created_at: '2025-01-01T08:00:00Z',
    updated_at: '2025-01-01T08:00:00Z',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    full_name: 'Rahul Verma',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+91 98123 45678',
    preferred_currency: 'INR',
    created_at: '2025-01-02T09:00:00Z',
    updated_at: '2025-01-02T09:00:00Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    full_name: 'Ananya Sen',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phone: '+91 97654 32109',
    preferred_currency: 'INR',
    created_at: '2025-01-03T10:00:00Z',
    updated_at: '2025-01-03T10:00:00Z',
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    full_name: 'Vikram Malhotra',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phone: '+91 91234 56789',
    preferred_currency: 'INR',
    created_at: '2025-01-04T11:00:00Z',
    updated_at: '2025-01-04T11:00:00Z',
  },
];

// Seed Workspaces
export const SEED_WORKSPACES: Workspace[] = [
  {
    id: 'ws-priya-personal-001',
    name: "Priya's Personal Vault",
    workspace_type: 'personal',
    workspace_category: 'personal_finance',
    verification_status: 'verified',
    owner_id: '11111111-1111-4111-8111-111111111111',
    currency: 'INR',
    description: 'Personal financial ledger, savings and investments',
    created_at: '2025-01-01T08:05:00Z',
    updated_at: '2025-01-01T08:05:00Z',
  },
  {
    id: 'ws-palmgrove-org-002',
    name: 'Palm Grove Apartments RWA',
    workspace_type: 'organisation',
    workspace_category: 'society_apartment',
    verification_status: 'verified',
    owner_id: '11111111-1111-4111-8111-111111111111',
    currency: 'INR',
    description: 'Apartment Owners Association treasury, maintenance dues & vendor invoices',
    institution_details: {
      institution_name: 'Palm Grove Resident Welfare Association',
      registration_number: 'RWA-BLR-2022-894',
      total_units_or_members: 120,
      admin_name: 'Priya Sharma (President)',
    },
    created_at: '2025-01-02T10:00:00Z',
    updated_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 'ws-rahul-personal-003',
    name: "Rahul's Personal Vault",
    workspace_type: 'personal',
    workspace_category: 'personal_finance',
    verification_status: 'verified',
    owner_id: '22222222-2222-4222-8222-222222222222',
    currency: 'INR',
    description: 'Personal salary and family savings',
    created_at: '2025-01-02T09:15:00Z',
    updated_at: '2025-01-02T09:15:00Z',
  },
  {
    id: 'ws-vikram-personal-004',
    name: "Vikram's Personal Vault",
    workspace_type: 'personal',
    workspace_category: 'personal_finance',
    verification_status: 'verified',
    owner_id: '44444444-4444-4444-8444-444444444444',
    currency: 'INR',
    description: 'Vikram private finance workspace',
    created_at: '2025-01-04T11:05:00Z',
    updated_at: '2025-01-04T11:05:00Z',
  },
  // SAMPLE DEMO WORKSPACES (Exploration only — flagged as SAMPLE DATA)
  {
    id: 'ws-demo-school-005',
    name: "St. Jude's Higher Secondary School",
    workspace_type: 'organisation',
    workspace_category: 'school_education',
    verification_status: 'verified',
    owner_id: '11111111-1111-4111-8111-111111111111',
    currency: 'INR',
    description: 'Academic fee collections, laboratory budgets and teacher payroll funds',
    is_demo: true,
    institution_details: {
      institution_name: "St. Jude's Higher Secondary School",
      registration_number: 'EDU-TN-4491-09',
      location: 'Civil Lines, Chennai',
      admin_name: 'Dr. Arthur Vance (Principal)',
      total_units_or_members: 1450,
    },
    created_at: '2025-01-05T09:00:00Z',
    updated_at: '2025-01-05T09:00:00Z',
  },
  {
    id: 'ws-demo-hospital-006',
    name: 'City Care Multispeciality Hospital',
    workspace_type: 'organisation',
    workspace_category: 'hospital_health',
    verification_status: 'verified',
    owner_id: '11111111-1111-4111-8111-111111111111',
    currency: 'INR',
    description: 'Emergency ward budgets, pharmacy inventory procurement, and ICU maintenance',
    is_demo: true,
    institution_details: {
      institution_name: 'City Care Healthcare Foundation',
      registration_number: 'HOSP-MUM-2018-912',
      location: 'Andheri East, Mumbai',
      admin_name: 'Dr. Meenakshi Iyer (Medical Superintendent)',
      department_name: 'Emergency & Critical Care',
    },
    created_at: '2025-01-06T10:00:00Z',
    updated_at: '2025-01-06T10:00:00Z',
  },
  {
    id: 'ws-demo-office-007',
    name: 'Apex Cloud Solutions Pvt Ltd',
    workspace_type: 'organisation',
    workspace_category: 'office_company',
    verification_status: 'verified',
    owner_id: '11111111-1111-4111-8111-111111111111',
    currency: 'INR',
    description: 'Corporate client billings, engineering cloud credits, and employee travel expenses',
    is_demo: true,
    institution_details: {
      institution_name: 'Apex Cloud Solutions Private Limited',
      registration_number: 'U72200KA2021PTC145',
      location: 'Indiranagar, Bengaluru',
      admin_name: 'Rajesh Kulkarni (Finance Director)',
    },
    created_at: '2025-01-07T11:00:00Z',
    updated_at: '2025-01-07T11:00:00Z',
  },
  {
    id: 'ws-demo-police-008',
    name: 'Central Sector Police Station',
    workspace_type: 'organisation',
    workspace_category: 'police_station',
    verification_status: 'verified',
    owner_id: '11111111-1111-4111-8111-111111111111',
    currency: 'INR',
    description: 'Station administrative funds, authorized vehicle patrol fuel, and public safety supplies',
    is_demo: true,
    institution_details: {
      institution_name: 'Metropolitan Police Dept - Sector 4',
      station_jurisdiction: 'Sector 4 & Central Ring',
      admin_name: 'Inspector S. Rathore (Station House Officer)',
    },
    created_at: '2025-01-08T12:00:00Z',
    updated_at: '2025-01-08T12:00:00Z',
  },
];

// Seed Memberships (Strict roles)
export const SEED_MEMBERS: WorkspaceMember[] = [
  // Priya in her personal vault (Owner)
  {
    id: 'mem-001',
    workspace_id: 'ws-priya-personal-001',
    user_id: '11111111-1111-4111-8111-111111111111',
    role: 'owner',
    membership_status: 'active',
    joined_at: '2025-01-01T08:05:00Z',
  },
  // Palm Grove RWA Members
  {
    id: 'mem-002',
    workspace_id: 'ws-palmgrove-org-002',
    user_id: '11111111-1111-4111-8111-111111111111',
    role: 'owner', // President / Owner
    membership_status: 'active',
    joined_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 'mem-003',
    workspace_id: 'ws-palmgrove-org-002',
    user_id: '22222222-2222-4222-8222-222222222222',
    role: 'treasurer', // Rahul is Treasurer
    membership_status: 'active',
    joined_at: '2025-01-02T10:30:00Z',
  },
  {
    id: 'mem-004',
    workspace_id: 'ws-palmgrove-org-002',
    user_id: '33333333-3333-4333-8333-333333333333',
    role: 'approver', // Ananya is Approver (Auditor)
    membership_status: 'active',
    joined_at: '2025-01-03T10:15:00Z',
  },
  // Rahul in his personal vault
  {
    id: 'mem-005',
    workspace_id: 'ws-rahul-personal-003',
    user_id: '22222222-2222-4222-8222-222222222222',
    role: 'owner',
    membership_status: 'active',
    joined_at: '2025-01-02T09:15:00Z',
  },
  // Vikram in his personal vault (Zero association with Palm Grove or Priya)
  {
    id: 'mem-006',
    workspace_id: 'ws-vikram-personal-004',
    user_id: '44444444-4444-4444-8444-444444444444',
    role: 'owner',
    membership_status: 'active',
    joined_at: '2025-01-04T11:05:00Z',
  },
];

// Seed Categories
export const SEED_CATEGORIES: Category[] = [
  // Personal Categories
  { id: 'cat-01', workspace_id: 'ws-priya-personal-001', name: 'Consulting Income', category_type: 'income', created_at: '2025-01-01T08:05:00Z' },
  { id: 'cat-02', workspace_id: 'ws-priya-personal-001', name: 'House Rent', category_type: 'expense', created_at: '2025-01-01T08:05:00Z' },
  { id: 'cat-03', workspace_id: 'ws-priya-personal-001', name: 'Groceries & Provisions', category_type: 'expense', created_at: '2025-01-01T08:05:00Z' },
  { id: 'cat-04', workspace_id: 'ws-priya-personal-001', name: 'Utilities & Broadband', category_type: 'expense', created_at: '2025-01-01T08:05:00Z' },
  // Org Categories
  { id: 'cat-10', workspace_id: 'ws-palmgrove-org-002', name: 'Monthly Maintenance Dues', category_type: 'income', created_at: '2025-01-02T10:05:00Z' },
  { id: 'cat-11', workspace_id: 'ws-palmgrove-org-002', name: 'Clubhouse Bookings', category_type: 'income', created_at: '2025-01-02T10:05:00Z' },
  { id: 'cat-12', workspace_id: 'ws-palmgrove-org-002', name: 'Elevator AMC & Repairs', category_type: 'expense', created_at: '2025-01-02T10:05:00Z' },
  { id: 'cat-13', workspace_id: 'ws-palmgrove-org-002', name: 'Security Staff Payroll', category_type: 'expense', created_at: '2025-01-02T10:05:00Z' },
  { id: 'cat-14', workspace_id: 'ws-palmgrove-org-002', name: 'Diesel Generator Fuel', category_type: 'expense', created_at: '2025-01-02T10:05:00Z' },
  // Sample Demo School Categories
  { id: 'cat-50', workspace_id: 'ws-demo-school-005', name: 'Student Tuition & Term Fees', category_type: 'income', created_at: '2025-01-05T09:05:00Z' },
  { id: 'cat-51', workspace_id: 'ws-demo-school-005', name: 'Faculty & Teacher Payroll', category_type: 'expense', created_at: '2025-01-05T09:05:00Z' },
  { id: 'cat-52', workspace_id: 'ws-demo-school-005', name: 'Laboratory & Science Equipment', category_type: 'expense', created_at: '2025-01-05T09:05:00Z' },
  // Sample Demo Hospital Categories
  { id: 'cat-60', workspace_id: 'ws-demo-hospital-006', name: 'In-Patient & Surgical Revenue', category_type: 'income', created_at: '2025-01-06T10:05:00Z' },
  { id: 'cat-61', workspace_id: 'ws-demo-hospital-006', name: 'Liquid Oxygen & Gas Supplies', category_type: 'expense', created_at: '2025-01-06T10:05:00Z' },
  { id: 'cat-62', workspace_id: 'ws-demo-hospital-006', name: 'Diagnostic Equipment AMC', category_type: 'expense', created_at: '2025-01-06T10:05:00Z' },
  // Sample Demo Office Categories
  { id: 'cat-70', workspace_id: 'ws-demo-office-007', name: 'SaaS Client Retainers', category_type: 'income', created_at: '2025-01-07T11:05:00Z' },
  { id: 'cat-71', workspace_id: 'ws-demo-office-007', name: 'Cloud Infrastructure & Servers', category_type: 'expense', created_at: '2025-01-07T11:05:00Z' },
  // Sample Demo Police Categories
  { id: 'cat-80', workspace_id: 'ws-demo-police-008', name: 'Administrative Treasury Grants', category_type: 'income', created_at: '2025-01-08T12:05:00Z' },
  { id: 'cat-81', workspace_id: 'ws-demo-police-008', name: 'Patrol Fleet Fuel & Upkeep', category_type: 'expense', created_at: '2025-01-08T12:05:00Z' },
];

// Seed Transactions
export const SEED_TRANSACTIONS: Transaction[] = [
  // Priya Personal
  {
    id: 'tx-001',
    workspace_id: 'ws-priya-personal-001',
    category_id: 'cat-01',
    created_by: '11111111-1111-4111-8111-111111111111',
    responsible_user_id: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'income',
    amount: 145000,
    currency: 'INR',
    description: 'Monthly Client Retainer & Advisory',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-05',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-05T12:00:00Z',
    updated_at: '2025-01-05T12:00:00Z',
  },
  {
    id: 'tx-002',
    workspace_id: 'ws-priya-personal-001',
    category_id: 'cat-02',
    created_by: '11111111-1111-4111-8111-111111111111',
    responsible_user_id: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'expense',
    amount: 32000,
    currency: 'INR',
    description: 'Apartment Monthly Rent (Flat 402)',
    payment_method: 'upi',
    transaction_date: '2025-01-06',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-06T09:30:00Z',
    updated_at: '2025-01-06T09:30:00Z',
  },
  // Palm Grove Org
  {
    id: 'tx-101',
    workspace_id: 'ws-palmgrove-org-002',
    category_id: 'cat-10',
    created_by: '22222222-2222-4222-8222-222222222222', // Rahul (Treasurer)
    responsible_user_id: '22222222-2222-4222-8222-222222222222',
    transaction_type: 'contribution',
    amount: 480000,
    currency: 'INR',
    description: 'Tower A & B Maintenance Collection (January)',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-10',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-10T14:00:00Z',
    updated_at: '2025-01-10T14:00:00Z',
  },
  {
    id: 'tx-102',
    workspace_id: 'ws-palmgrove-org-002',
    category_id: 'cat-13',
    created_by: '22222222-2222-4222-8222-222222222222', // Rahul
    responsible_user_id: '22222222-2222-4222-8222-222222222222',
    transaction_type: 'expense',
    amount: 125000,
    currency: 'INR',
    description: 'Apex Guard Services - 8 Security Personnel',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-15',
    status: 'approved',
    evidence_status: 'verified',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T11:00:00Z',
  },
  {
    id: 'tx-103',
    workspace_id: 'ws-palmgrove-org-002',
    category_id: 'cat-12',
    created_by: '22222222-2222-4222-8222-222222222222', // Rahul submitted for approval
    responsible_user_id: '22222222-2222-4222-8222-222222222222',
    transaction_type: 'expense',
    amount: 68500,
    currency: 'INR',
    description: 'Otis Elevator Inverter Battery Replacement',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-20',
    status: 'pending_approval',
    evidence_status: 'uploaded',
    created_at: '2025-01-20T16:30:00Z',
    updated_at: '2025-01-20T16:30:00Z',
  },
  // Demo School Transactions
  {
    id: 'tx-demo-school-1',
    workspace_id: 'ws-demo-school-005',
    category_id: 'cat-50',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'income',
    amount: 1840000,
    currency: 'INR',
    description: 'Q2 Student Tuition & Lab Fee Collections (Grades 6–12)',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-10',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-10T10:00:00Z',
    updated_at: '2025-01-10T10:00:00Z',
  },
  {
    id: 'tx-demo-school-2',
    workspace_id: 'ws-demo-school-005',
    category_id: 'cat-51',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'expense',
    amount: 680000,
    currency: 'INR',
    description: 'Teaching Faculty & Non-Teaching Staff Payroll',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-15',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-15T11:00:00Z',
    updated_at: '2025-01-15T11:00:00Z',
  },
  {
    id: 'tx-demo-school-3',
    workspace_id: 'ws-demo-school-005',
    category_id: 'cat-52',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'expense',
    amount: 245000,
    currency: 'INR',
    description: 'Robotics & STEM Lab Microcontroller Kits (35 Units)',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-22',
    status: 'pending_approval',
    evidence_status: 'uploaded',
    created_at: '2025-01-22T14:00:00Z',
    updated_at: '2025-01-22T14:00:00Z',
  },
  // Demo Hospital Transactions
  {
    id: 'tx-demo-hosp-1',
    workspace_id: 'ws-demo-hospital-006',
    category_id: 'cat-60',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'income',
    amount: 2480000,
    currency: 'INR',
    description: 'In-Patient Health Insurance & TPA Reimbursements',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-12',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-12T09:30:00Z',
    updated_at: '2025-01-12T09:30:00Z',
  },
  {
    id: 'tx-demo-hosp-2',
    workspace_id: 'ws-demo-hospital-006',
    category_id: 'cat-61',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'expense',
    amount: 315000,
    currency: 'INR',
    description: 'Praxair Bulk Liquid Medical Oxygen Tank Refill',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-18',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-18T16:00:00Z',
    updated_at: '2025-01-18T16:00:00Z',
  },
  // Demo Office Transactions
  {
    id: 'tx-demo-off-1',
    workspace_id: 'ws-demo-office-007',
    category_id: 'cat-70',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'income',
    amount: 1650000,
    currency: 'INR',
    description: 'Q1 Enterprise Cloud Managed Services Retainer',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-14',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-14T11:00:00Z',
    updated_at: '2025-01-14T11:00:00Z',
  },
  {
    id: 'tx-demo-off-2',
    workspace_id: 'ws-demo-office-007',
    category_id: 'cat-71',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'expense',
    amount: 285000,
    currency: 'INR',
    description: 'Production Kubernetes Cluster & Object Storage Bill',
    payment_method: 'card',
    transaction_date: '2025-01-19',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-19T10:00:00Z',
    updated_at: '2025-01-19T10:00:00Z',
  },
  // Demo Police Transactions
  {
    id: 'tx-demo-pol-1',
    workspace_id: 'ws-demo-police-008',
    category_id: 'cat-80',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'income',
    amount: 1200000,
    currency: 'INR',
    description: 'Annual Administrative Allocation from City Police Commissionerate',
    payment_method: 'bank_transfer',
    transaction_date: '2025-01-08',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-08T10:00:00Z',
    updated_at: '2025-01-08T10:00:00Z',
  },
  {
    id: 'tx-demo-pol-2',
    workspace_id: 'ws-demo-police-008',
    category_id: 'cat-81',
    created_by: '11111111-1111-4111-8111-111111111111',
    transaction_type: 'expense',
    amount: 145000,
    currency: 'INR',
    description: 'HPCL Diesel Fuel Vouchers for 6 Sector Patrol Vehicles',
    payment_method: 'upi',
    transaction_date: '2025-01-16',
    status: 'completed',
    evidence_status: 'verified',
    created_at: '2025-01-16T12:00:00Z',
    updated_at: '2025-01-16T12:00:00Z',
  },
];

// Seed Approvals (Strict accountability)
export const SEED_APPROVALS: Approval[] = [
  {
    id: 'appr-001',
    workspace_id: 'ws-palmgrove-org-002',
    transaction_id: 'tx-103',
    requested_by: '22222222-2222-4222-8222-222222222222', // Rahul (Treasurer) requested
    approver_id: '33333333-3333-4333-8333-333333333333', // Assigned to Ananya (Approver)
    approval_status: 'pending',
    comments: 'Quotation verified with Otis technical team; awaiting committee clearance.',
    requested_at: '2025-01-20T16:35:00Z',
  },
];

// Seed Budgets
export const SEED_BUDGETS: Budget[] = [
  {
    id: 'bg-001',
    workspace_id: 'ws-priya-personal-001',
    name: 'Household & Groceries Budget',
    category_id: 'cat-03',
    amount: 25000,
    period: 'monthly',
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    created_by: '11111111-1111-4111-8111-111111111111',
    created_at: '2025-01-01T08:10:00Z',
  },
  {
    id: 'bg-101',
    workspace_id: 'ws-palmgrove-org-002',
    name: 'Security & Facility Operations Q1',
    category_id: 'cat-13',
    amount: 400000,
    period: 'quarterly',
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    created_by: '11111111-1111-4111-8111-111111111111',
    created_at: '2025-01-02T10:10:00Z',
  },
];

// Seed Financial Goals
export const SEED_GOALS: FinancialGoal[] = [
  {
    id: 'gl-001',
    workspace_id: 'ws-priya-personal-001',
    title: 'Emergency Reserve Fund (6 Months)',
    target_amount: 500000,
    current_amount: 320000,
    target_date: '2025-12-31',
    status: 'active',
    created_by: '11111111-1111-4111-8111-111111111111',
    created_at: '2025-01-01T08:15:00Z',
  },
  {
    id: 'gl-101',
    workspace_id: 'ws-palmgrove-org-002',
    title: 'Rooftop Solar Grid Sinking Fund',
    target_amount: 1200000,
    current_amount: 650000,
    target_date: '2026-03-31',
    status: 'active',
    created_by: '11111111-1111-4111-8111-111111111111',
    created_at: '2025-01-02T10:15:00Z',
  },
];

// Seed Bills
export const SEED_BILLS: Bill[] = [
  {
    id: 'bill-001',
    workspace_id: 'ws-priya-personal-001',
    title: 'Bescom Electricity Bill',
    amount: 3450,
    currency: 'INR',
    due_date: '2025-02-05',
    recurrence: 'monthly',
    assigned_user_id: '11111111-1111-4111-8111-111111111111',
    payment_status: 'unpaid',
    created_at: '2025-01-01T08:20:00Z',
  },
  {
    id: 'bill-101',
    workspace_id: 'ws-palmgrove-org-002',
    title: 'BWSSB Bulk Water Supply Bill',
    amount: 42300,
    currency: 'INR',
    due_date: '2025-02-10',
    recurrence: 'monthly',
    assigned_user_id: '22222222-2222-4222-8222-222222222222',
    payment_status: 'unpaid',
    created_at: '2025-01-02T10:20:00Z',
  },
];

// Seed Loans / Commitments
export const SEED_LOANS: Loan[] = [
  {
    id: 'loan-001',
    workspace_id: 'ws-priya-personal-001',
    lender_name: 'Priya Sharma',
    borrower_name: 'Rohan Sharma (Sibling)',
    principal_amount: 50000,
    outstanding_amount: 20000,
    due_date: '2025-04-30',
    loan_type: 'given',
    status: 'active',
    created_by: '11111111-1111-4111-8111-111111111111',
    created_at: '2025-01-01T08:25:00Z',
  },
];

// Seed Contributions
export const SEED_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'cnt-001',
    workspace_id: 'ws-palmgrove-org-002',
    contributor_user_id: '22222222-2222-4222-8222-222222222222',
    amount: 5500,
    contribution_date: '2025-01-05',
    purpose: 'Flat 104 Annual Fest Surcharge',
    status: 'received',
    transaction_id: 'tx-101',
    created_at: '2025-01-05T10:00:00Z',
  },
];

// Seed Audit Logs (Append-only)
export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    workspace_id: 'ws-palmgrove-org-002',
    actor_user_id: '11111111-1111-4111-8111-111111111111',
    action: 'WORKSPACE_INITIALIZED',
    entity_type: 'workspace',
    entity_id: 'ws-palmgrove-org-002',
    new_values: { name: 'Palm Grove Apartments RWA', type: 'organisation', currency: 'INR' },
    created_at: '2025-01-02T10:00:00Z',
  },
  {
    id: 'audit-002',
    workspace_id: 'ws-palmgrove-org-002',
    actor_user_id: '11111111-1111-4111-8111-111111111111',
    action: 'MEMBER_ROLE_ASSIGNED',
    entity_type: 'workspace_members',
    entity_id: 'mem-003',
    new_values: { user_id: '22222222-2222-4222-8222-222222222222', role: 'treasurer' },
    created_at: '2025-01-02T10:30:00Z',
  },
  {
    id: 'audit-003',
    workspace_id: 'ws-palmgrove-org-002',
    actor_user_id: '22222222-2222-4222-8222-222222222222',
    action: 'APPROVAL_REQUESTED',
    entity_type: 'approvals',
    entity_id: 'appr-001',
    new_values: { transaction_id: 'tx-103', amount: 68500, approver: '33333333-3333-4333-8333-333333333333' },
    created_at: '2025-01-20T16:35:00Z',
  },
];

// Seed Evidence Files
export const SEED_EVIDENCE_FILES: EvidenceFile[] = [
  {
    id: 'ev-001',
    workspace_id: 'ws-palmgrove-org-002',
    transaction_id: 'tx-103',
    uploaded_by: '22222222-2222-4222-8222-222222222222',
    storage_path: 'ws-palmgrove-org-002/otis_lift_invoice_68500.pdf',
    file_name: 'otis_lift_invoice_68500.pdf',
    file_type: 'application/pdf',
    file_size: 1420500,
    created_at: '2025-01-20T16:32:00Z',
  },
];

// Seed Notifications
export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: 'nt-001',
    user_id: '33333333-3333-4333-8333-333333333333', // Ananya
    workspace_id: 'ws-palmgrove-org-002',
    title: 'Approval Required: Otis Elevator AMC Repair',
    message: 'Rahul Verma requested clearance for ₹68,500 battery replacement.',
    notification_type: 'approval_request',
    read_at: null,
    created_at: '2025-01-20T16:36:00Z',
  },
  {
    id: 'nt-002',
    user_id: '11111111-1111-4111-8111-111111111111', // Priya
    workspace_id: 'ws-palmgrove-org-002',
    title: 'Maintenance Dues Inflow Recorded',
    message: '₹4,80,000 received for January Maintenance cycle.',
    notification_type: 'contribution_received',
    read_at: '2025-01-10T15:00:00Z',
    created_at: '2025-01-10T14:02:00Z',
  },
];

/**
 * In-memory / LocalStorage relational database engine enforcing PostgreSQL schema and RLS
 */
class JevraDataEngine {
  private profiles: Profile[] = [];
  private workspaces: Workspace[] = [];
  private members: WorkspaceMember[] = [];
  private invitations: WorkspaceInvitation[] = [];
  private categories: Category[] = [];
  private transactions: Transaction[] = [];
  private budgets: Budget[] = [];
  private goals: FinancialGoal[] = [];
  private bills: Bill[] = [];
  private loans: Loan[] = [];
  private contributions: Contribution[] = [];
  private approvals: Approval[] = [];
  private auditLogs: AuditLog[] = [];
  private evidenceFiles: EvidenceFile[] = [];
  private notifications: Notification[] = [];

  constructor() {
    this.init();
  }

  private init() {
    const stored = localStorage.getItem('jevra_data_store');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.profiles = data.profiles || SEED_USERS;
        this.workspaces = data.workspaces || SEED_WORKSPACES;
        this.members = data.members || SEED_MEMBERS;
        this.invitations = data.invitations || [];
        this.categories = data.categories || SEED_CATEGORIES;
        this.transactions = data.transactions || SEED_TRANSACTIONS;
        this.budgets = data.budgets || SEED_BUDGETS;
        this.goals = data.goals || SEED_GOALS;
        this.bills = data.bills || SEED_BILLS;
        this.loans = data.loans || SEED_LOANS;
        this.contributions = data.contributions || SEED_CONTRIBUTIONS;
        this.approvals = data.approvals || SEED_APPROVALS;
        this.auditLogs = data.auditLogs || SEED_AUDIT_LOGS;
        this.evidenceFiles = data.evidenceFiles || SEED_EVIDENCE_FILES;
        this.notifications = data.notifications || SEED_NOTIFICATIONS;
        return;
      } catch (e) {
        console.error('Error loading stored JEVRA data, re-seeding:', e);
      }
    }
    this.resetToSeeds();
  }

  public resetToSeeds() {
    this.profiles = [...SEED_USERS];
    this.workspaces = [...SEED_WORKSPACES];
    this.members = [...SEED_MEMBERS];
    this.invitations = [];
    this.categories = [...SEED_CATEGORIES];
    this.transactions = [...SEED_TRANSACTIONS];
    this.budgets = [...SEED_BUDGETS];
    this.goals = [...SEED_GOALS];
    this.bills = [...SEED_BILLS];
    this.loans = [...SEED_LOANS];
    this.contributions = [...SEED_CONTRIBUTIONS];
    this.approvals = [...SEED_APPROVALS];
    this.auditLogs = [...SEED_AUDIT_LOGS];
    this.evidenceFiles = [...SEED_EVIDENCE_FILES];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.persist();
  }

  private persist() {
    try {
      localStorage.setItem(
        'jevra_data_store',
        JSON.stringify({
          profiles: this.profiles,
          workspaces: this.workspaces,
          members: this.members,
          invitations: this.invitations,
          categories: this.categories,
          transactions: this.transactions,
          budgets: this.budgets,
          goals: this.goals,
          bills: this.bills,
          loans: this.loans,
          contributions: this.contributions,
          approvals: this.approvals,
          auditLogs: this.auditLogs,
          evidenceFiles: this.evidenceFiles,
          notifications: this.notifications,
        })
      );
    } catch (err) {
      console.warn('Storage persistence warning:', err);
    }
  }

  // -------------------------------------------------------------------------
  // RLS & AUTH CHECK HELPERS
  // -------------------------------------------------------------------------
  public isMember(userId: string | null | undefined, workspaceId: string): boolean {
    if (!userId) return false;
    if (userId === 'demo-visitor-user-999') {
      const ws = this.workspaces.find((w) => w.id === workspaceId);
      return Boolean(ws && (ws.is_demo || ws.id.startsWith('ws-priya') || ws.id.startsWith('ws-palmgrove')));
    }
    return this.members.some(
      (m) => m.workspace_id === workspaceId && m.user_id === userId && m.membership_status === 'active'
    );
  }

  public getRole(userId: string | null | undefined, workspaceId: string): WorkspaceRole | null {
    if (!userId) return null;
    if (userId === 'demo-visitor-user-999') {
      return 'owner'; // In demo exploration, visitor has full explorer capability over sample data
    }
    const member = this.members.find(
      (m) => m.workspace_id === workspaceId && m.user_id === userId && m.membership_status === 'active'
    );
    return member ? member.role : null;
  }

  public hasRole(userId: string | null | undefined, workspaceId: string, allowedRoles: WorkspaceRole[]): boolean {
    const role = this.getRole(userId, workspaceId);
    return Boolean(role && allowedRoles.includes(role));
  }

  // -------------------------------------------------------------------------
  // PROFILES
  // -------------------------------------------------------------------------
  public getProfile(userId: string): Profile | null {
    return this.profiles.find((p) => p.id === userId) || null;
  }

  public createProfile(profile: Profile): Profile {
    this.profiles.push(profile);
    this.persist();
    return profile;
  }

  public updateProfile(userId: string, updates: Partial<Profile>): Profile {
    const index = this.profiles.findIndex((p) => p.id === userId);
    if (index === -1) throw new Error('Profile not found');
    this.profiles[index] = {
      ...this.profiles[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.profiles[index];
  }

  // -------------------------------------------------------------------------
  // WORKSPACES & MEMBERS (With RLS Enforcement)
  // -------------------------------------------------------------------------
  public getAuthorizedWorkspaces(userId: string | null | undefined): Workspace[] {
    if (!userId) return [];
    if (userId === 'demo-visitor-user-999') {
      // Demo mode isolation: return sample workspaces only
      return this.workspaces.filter((w) => w.is_demo || w.id.startsWith('ws-priya') || w.id.startsWith('ws-palmgrove'));
    }
    // RLS: User can only see workspaces where they are active members or owner (excluding sample demo workspaces)
    const memberWsIds = new Set(
      this.members
        .filter((m) => m.user_id === userId && m.membership_status === 'active')
        .map((m) => m.workspace_id)
    );
    return this.workspaces.filter((w) => (memberWsIds.has(w.id) || w.owner_id === userId) && !w.is_demo);
  }

  public getWorkspace(userId: string | null | undefined, workspaceId: string): Workspace | null {
    if (!this.isMember(userId, workspaceId)) {
      const ws = this.workspaces.find((w) => w.id === workspaceId);
      if (ws && ws.owner_id === userId) return ws;
      return null; // RLS Denied
    }
    return this.workspaces.find((w) => w.id === workspaceId) || null;
  }

  public createWorkspace(
    userId: string,
    data: {
      name: string;
      workspace_type: WorkspaceType;
      workspace_category?: import('../types/database').WorkspaceCategory;
      currency?: string;
      description?: string;
      institution_details?: import('../types/database').InstitutionalDetails;
      verification_status?: import('../types/database').VerificationStatus;
      is_demo?: boolean;
    }
  ): Workspace {
    const category = data.workspace_category || (data.workspace_type === 'personal' ? 'personal_finance' : 'office_company');
    const verification = data.verification_status || (category === 'personal_finance' || category === 'family_finance' ? 'verified' : 'unverified');

    const newWs: Workspace = {
      id: `ws-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: data.name,
      workspace_type: data.workspace_type,
      workspace_category: category,
      verification_status: verification,
      owner_id: userId,
      currency: data.currency || 'INR',
      description: data.description || '',
      institution_details: data.institution_details,
      is_demo: data.is_demo || false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.workspaces.push(newWs);

    // Add owner membership
    const ownerMember: WorkspaceMember = {
      id: `mem-${Date.now()}`,
      workspace_id: newWs.id,
      user_id: userId,
      role: 'owner',
      membership_status: 'active',
      joined_at: new Date().toISOString(),
    };
    this.members.push(ownerMember);

    // Tailored category setup based on workspace_category
    let categoriesList: { name: string; type: 'income' | 'expense' }[] = [];

    switch (category) {
      case 'school_education':
        categoriesList = [
          { name: 'Student Tuition & Term Fees', type: 'income' },
          { name: 'Annual Grants & Donations', type: 'income' },
          { name: 'Faculty & Teacher Payroll', type: 'expense' },
          { name: 'Laboratory & Science Equipment', type: 'expense' },
          { name: 'Library & Learning Materials', type: 'expense' },
          { name: 'Campus Maintenance & Utilities', type: 'expense' },
        ];
        break;
      case 'hospital_health':
        categoriesList = [
          { name: 'In-Patient & Consultation Revenue', type: 'income' },
          { name: 'Health Insurance Claims Reimbursed', type: 'income' },
          { name: 'Pharmacy & Drug Consumables', type: 'expense' },
          { name: 'Diagnostic & Surgical Equipment AMC', type: 'expense' },
          { name: 'Doctors & Clinical Staff Payroll', type: 'expense' },
          { name: 'Oxygen & Medical Gas Supplies', type: 'expense' },
        ];
        break;
      case 'police_station':
        categoriesList = [
          { name: 'Statutory Administrative Allocation', type: 'income' },
          { name: 'Station Contingency Grant', type: 'income' },
          { name: 'Patrol Vehicle Fuel & Maintenance', type: 'expense' },
          { name: 'Station Upkeep & Office Supplies', type: 'expense' },
          { name: 'Security & Surveillance Logistics', type: 'expense' },
          { name: 'Special Investigation Allowance', type: 'expense' },
        ];
        break;
      case 'fire_station':
        categoriesList = [
          { name: 'Municipal Fire Service Allocation', type: 'income' },
          { name: 'Emergency Contingency Fund', type: 'income' },
          { name: 'Fire Engine & Ladder Fleet Service', type: 'expense' },
          { name: 'Breathing Apparatus & Safety Gear', type: 'expense' },
          { name: 'Fuel & Rapid Response Supplies', type: 'expense' },
          { name: 'Station Operations & Communications', type: 'expense' },
        ];
        break;
      case 'small_business':
        categoriesList = [
          { name: 'Counter Cash & UPI Sales', type: 'income' },
          { name: 'Wholesale B2B Invoices', type: 'income' },
          { name: 'Distributor Stock Purchases', type: 'expense' },
          { name: 'Commercial Shop Rent', type: 'expense' },
          { name: 'Store Utilities & Electricity', type: 'expense' },
          { name: 'Staff Daily Wages', type: 'expense' },
        ];
        break;
      case 'society_apartment':
        categoriesList = [
          { name: 'Resident Maintenance Collections', type: 'income' },
          { name: 'Clubhouse & Amenity Fees', type: 'income' },
          { name: 'Elevator Maintenance AMC', type: 'expense' },
          { name: 'Security Agency Payroll', type: 'expense' },
          { name: 'Common Water & Electricity', type: 'expense' },
          { name: 'Sinking Fund Capital Reserve', type: 'expense' },
        ];
        break;
      case 'office_company':
        categoriesList = [
          { name: 'Client Invoicing & Retainers', type: 'income' },
          { name: 'Consulting Revenue', type: 'income' },
          { name: 'Employee Salaries & Benefits', type: 'expense' },
          { name: 'Cloud Infrastructure & SaaS', type: 'expense' },
          { name: 'Office Lease & Facility Costs', type: 'expense' },
          { name: 'Business Travel & Conveyance', type: 'expense' },
        ];
        break;
      case 'family_finance':
        categoriesList = [
          { name: 'Primary Household Income', type: 'income' },
          { name: 'Spouse / Secondary Income', type: 'income' },
          { name: 'Groceries & Provisions', type: 'expense' },
          { name: 'Children School & Daycare Fees', type: 'expense' },
          { name: 'Rent / Home Loan EMI', type: 'expense' },
          { name: 'Family Health & Insurance', type: 'expense' },
        ];
        break;
      default:
        categoriesList = [
          { name: 'Primary Income & Earnings', type: 'income' },
          { name: 'Dividends & Capital Gains', type: 'income' },
          { name: 'Housing & Accommodation', type: 'expense' },
          { name: 'Groceries & Household Supplies', type: 'expense' },
          { name: 'Utilities & Subscriptions', type: 'expense' },
          { name: 'Health & Medical', type: 'expense' },
        ];
        break;
    }

    categoriesList.forEach((c) => {
      this.categories.push({
        id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        workspace_id: newWs.id,
        name: c.name,
        category_type: c.type,
        created_at: new Date().toISOString(),
      });
    });

    // Record Append-Only Audit Log
    this.appendAuditLog(newWs.id, userId, 'WORKSPACE_CREATED', 'workspace', newWs.id, null, {
      name: newWs.name,
      type: newWs.workspace_type,
      category: newWs.workspace_category,
      currency: newWs.currency,
    });

    this.persist();
    return newWs;
  }

  public getWorkspaceMembers(userId: string, workspaceId: string): (WorkspaceMember & { profile?: Profile })[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.members
      .filter((m) => m.workspace_id === workspaceId)
      .map((m) => ({
        ...m,
        profile: this.profiles.find((p) => p.id === m.user_id),
      }));
  }

  public updateMemberRole(
    actorId: string,
    workspaceId: string,
    targetUserId: string,
    newRole: WorkspaceRole
  ): { success: boolean; error?: string } {
    // RLS Enforcement: Only owner can update roles
    if (!this.hasRole(actorId, workspaceId, ['owner'])) {
      return { success: false, error: 'Permission denied: Only workspace owner can change roles.' };
    }
    // Cannot self-downgrade sole owner
    if (actorId === targetUserId && newRole !== 'owner') {
      return { success: false, error: 'Cannot remove owner role from yourself.' };
    }

    const member = this.members.find((m) => m.workspace_id === workspaceId && m.user_id === targetUserId);
    if (!member) return { success: false, error: 'Member not found in workspace.' };

    const oldRole = member.role;
    member.role = newRole;

    this.appendAuditLog(workspaceId, actorId, 'MEMBER_ROLE_CHANGED', 'workspace_members', member.id, { role: oldRole }, { role: newRole });
    this.persist();
    return { success: true };
  }

  public inviteMember(
    actorId: string,
    workspaceId: string,
    email: string,
    role: WorkspaceRole
  ): { success: boolean; invitation?: WorkspaceInvitation; error?: string } {
    if (!this.hasRole(actorId, workspaceId, ['owner', 'finance_manager'])) {
      return { success: false, error: 'Permission denied: Only owner or finance manager can invite members.' };
    }

    const existingUser = this.profiles.find((p) => p.id === email || p.full_name.toLowerCase() === email.toLowerCase());
    
    // Create invitation record
    const invitation: WorkspaceInvitation = {
      id: `inv-${Date.now()}`,
      workspace_id: workspaceId,
      invited_email: email,
      assigned_role: role,
      invitation_token_hash: `token_${Math.random().toString(36).substring(2, 12)}`,
      invited_by: actorId,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      created_at: new Date().toISOString(),
    };
    this.invitations.push(invitation);

    // If matching user exists in demo, also add them as member
    if (existingUser) {
      if (!this.isMember(existingUser.id, workspaceId)) {
        this.members.push({
          id: `mem-${Date.now()}`,
          workspace_id: workspaceId,
          user_id: existingUser.id,
          role,
          membership_status: 'active',
          joined_at: new Date().toISOString(),
        });
      }
    }

    this.appendAuditLog(workspaceId, actorId, 'MEMBER_INVITED', 'workspace_invitations', invitation.id, null, {
      email,
      role,
    });
    this.persist();
    return { success: true, invitation };
  }

  // -------------------------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------------------------
  public getCategories(userId: string, workspaceId: string): Category[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.categories.filter((c) => c.workspace_id === workspaceId);
  }

  public addCategory(
    userId: string,
    workspaceId: string,
    name: string,
    categoryType: 'income' | 'expense'
  ): { success: boolean; category?: Category; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer'])) {
      return { success: false, error: 'Permission denied: Insufficient privileges to add categories.' };
    }
    const cat: Category = {
      id: `cat-${Date.now()}`,
      workspace_id: workspaceId,
      name,
      category_type: categoryType,
      created_at: new Date().toISOString(),
    };
    this.categories.push(cat);
    this.persist();
    return { success: true, category: cat };
  }

  // -------------------------------------------------------------------------
  // TRANSACTIONS
  // -------------------------------------------------------------------------
  public getTransactions(userId: string | null | undefined, workspaceId: string): (Transaction & { category?: Category; created_by_profile?: Profile })[] {
    if (!this.isMember(userId, workspaceId)) return []; // RLS strictly denies access
    return this.transactions
      .filter((t) => t.workspace_id === workspaceId)
      .map((t) => ({
        ...t,
        category: this.categories.find((c) => c.id === t.category_id),
        created_by_profile: this.profiles.find((p) => p.id === t.created_by),
      }))
      .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
  }

  public addTransaction(
    userId: string,
    workspaceId: string,
    data: {
      category_id?: string;
      responsible_user_id?: string;
      transaction_type: Transaction['transaction_type'];
      amount: number;
      currency?: string;
      description: string;
      payment_method?: Transaction['payment_method'];
      transaction_date?: string;
      requiresApproval?: boolean;
    }
  ): { success: boolean; transaction?: Transaction; error?: string } {
    // RLS: Only owner, finance_manager, treasurer or member (for personal) can record transactions
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer', 'member'])) {
      return { success: false, error: 'Permission denied: Insufficient role to record transactions.' };
    }

    if (data.amount <= 0 || isNaN(data.amount)) {
      return { success: false, error: 'Validation failed: Transaction amount must be greater than zero.' };
    }

    const ws = this.workspaces.find((w) => w.id === workspaceId);
    const status: Transaction['status'] =
      ws?.workspace_type === 'organisation' && data.requiresApproval ? 'pending_approval' : 'completed';

    const tx: Transaction = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspace_id: workspaceId,
      category_id: data.category_id || null,
      created_by: userId,
      responsible_user_id: data.responsible_user_id || userId,
      transaction_type: data.transaction_type,
      amount: Number(data.amount.toFixed(2)),
      currency: data.currency || ws?.currency || 'INR',
      description: data.description,
      payment_method: data.payment_method || 'upi',
      transaction_date: data.transaction_date || new Date().toISOString().split('T')[0],
      status,
      evidence_status: 'none',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.transactions.push(tx);

    // If pending approval in organisation, create approval request record
    if (status === 'pending_approval') {
      const appr: Approval = {
        id: `appr-${Date.now()}`,
        workspace_id: workspaceId,
        transaction_id: tx.id,
        requested_by: userId,
        approver_id: null,
        approval_status: 'pending',
        comments: `Pending governance verification for ${tx.description}`,
        requested_at: new Date().toISOString(),
      };
      this.approvals.push(appr);

      // Notify approvers & owners
      const approvers = this.members.filter(
        (m) => m.workspace_id === workspaceId && ['owner', 'approver'].includes(m.role) && m.user_id !== userId
      );
      approvers.forEach((apprMember) => {
        this.notifications.push({
          id: `nt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          user_id: apprMember.user_id,
          workspace_id: workspaceId,
          title: 'Approval Required',
          message: `${this.getProfile(userId)?.full_name || 'Staff'} submitted ₹${tx.amount.toLocaleString()} for approval.`,
          notification_type: 'approval_request',
          read_at: null,
          created_at: new Date().toISOString(),
        });
      });
    }

    // Append-only audit record
    this.appendAuditLog(workspaceId, userId, 'TRANSACTION_RECORDED', 'transactions', tx.id, null, {
      amount: tx.amount,
      type: tx.transaction_type,
      description: tx.description,
      status: tx.status,
    });

    this.persist();
    return { success: true, transaction: tx };
  }

  // -------------------------------------------------------------------------
  // APPROVALS & SEPARATION OF DUTIES
  // -------------------------------------------------------------------------
  public getApprovals(userId: string, workspaceId: string): (Approval & { transaction?: Transaction; requester?: Profile; approver?: Profile })[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.approvals
      .filter((a) => a.workspace_id === workspaceId)
      .map((a) => ({
        ...a,
        transaction: this.transactions.find((t) => t.id === a.transaction_id),
        requester: this.profiles.find((p) => p.id === a.requested_by),
        approver: a.approver_id ? this.profiles.find((p) => p.id === a.approver_id) : undefined,
      }))
      .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime());
  }

  public reviewApproval(
    userId: string,
    approvalId: string,
    decision: 'approved' | 'rejected',
    comments?: string
  ): { success: boolean; error?: string } {
    const appr = this.approvals.find((a) => a.id === approvalId);
    if (!appr) return { success: false, error: 'Approval request not found.' };

    const workspaceId = appr.workspace_id;

    // RLS Enforcement: Must have approver or owner role
    if (!this.hasRole(userId, workspaceId, ['owner', 'approver'])) {
      return { success: false, error: 'Permission denied: Only designated approvers or owners can review.' };
    }

    // STRICT GOVERNANCE RULE: Approver cannot approve their own request!
    if (appr.requested_by === userId) {
      return {
        success: false,
        error: 'CRITICAL SECURITY RULE: Separation of duties violation. A user cannot approve their own financial request.',
      };
    }

    appr.approval_status = decision;
    appr.approver_id = userId;
    appr.reviewed_at = new Date().toISOString();
    if (comments) appr.comments = comments;

    // Update underlying transaction status
    const tx = this.transactions.find((t) => t.id === appr.transaction_id);
    if (tx) {
      tx.status = decision === 'approved' ? 'approved' : 'rejected';
      tx.updated_at = new Date().toISOString();
    }

    // Audit log
    this.appendAuditLog(workspaceId, userId, `APPROVAL_${decision.toUpperCase()}`, 'approvals', appr.id, { status: 'pending' }, {
      status: decision,
      reviewed_by: userId,
      comments,
    });

    // Notify requester
    this.notifications.push({
      id: `nt-${Date.now()}`,
      user_id: appr.requested_by,
      workspace_id: workspaceId,
      title: `Request ${decision.toUpperCase()}: ${tx?.description || 'Financial Request'}`,
      message: `Your request for ₹${tx?.amount?.toLocaleString() || ''} was ${decision} by ${this.getProfile(userId)?.full_name}.`,
      notification_type: decision === 'approved' ? 'approval_granted' : 'approval_rejected',
      read_at: null,
      created_at: new Date().toISOString(),
    });

    this.persist();
    return { success: true };
  }

  // -------------------------------------------------------------------------
  // BUDGETS, GOALS, BILLS, LOANS, CONTRIBUTIONS
  // -------------------------------------------------------------------------
  public getBudgets(userId: string, workspaceId: string): (Budget & { category?: Category })[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.budgets
      .filter((b) => b.workspace_id === workspaceId)
      .map((b) => ({
        ...b,
        category: this.categories.find((c) => c.id === b.category_id),
      }));
  }

  public addBudget(userId: string, workspaceId: string, data: Omit<Budget, 'id' | 'created_at' | 'created_by' | 'workspace_id'>): { success: boolean; budget?: Budget; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager'])) {
      return { success: false, error: 'Permission denied: Only managers can create budgets.' };
    }
    const b: Budget = {
      id: `bg-${Date.now()}`,
      workspace_id: workspaceId,
      created_by: userId,
      created_at: new Date().toISOString(),
      ...data,
    };
    this.budgets.push(b);
    this.appendAuditLog(workspaceId, userId, 'BUDGET_CREATED', 'budgets', b.id, null, { name: b.name, amount: b.amount });
    this.persist();
    return { success: true, budget: b };
  }

  public getGoals(userId: string, workspaceId: string): FinancialGoal[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.goals.filter((g) => g.workspace_id === workspaceId);
  }

  public addGoal(userId: string, workspaceId: string, data: Omit<FinancialGoal, 'id' | 'created_at' | 'created_by' | 'workspace_id'>): { success: boolean; goal?: FinancialGoal; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer'])) {
      return { success: false, error: 'Permission denied.' };
    }
    const g: FinancialGoal = {
      id: `gl-${Date.now()}`,
      workspace_id: workspaceId,
      created_by: userId,
      created_at: new Date().toISOString(),
      ...data,
    };
    this.goals.push(g);
    this.appendAuditLog(workspaceId, userId, 'GOAL_CREATED', 'financial_goals', g.id, null, { title: g.title, target: g.target_amount });
    this.persist();
    return { success: true, goal: g };
  }

  public getBills(userId: string, workspaceId: string): (Bill & { assigned_user?: Profile })[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.bills
      .filter((b) => b.workspace_id === workspaceId)
      .map((b) => ({
        ...b,
        assigned_user: b.assigned_user_id ? this.profiles.find((p) => p.id === b.assigned_user_id) : undefined,
      }))
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }

  public addBill(userId: string, workspaceId: string, data: Omit<Bill, 'id' | 'created_at' | 'workspace_id'>): { success: boolean; bill?: Bill; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer'])) {
      return { success: false, error: 'Permission denied.' };
    }
    const bill: Bill = {
      id: `bill-${Date.now()}`,
      workspace_id: workspaceId,
      created_at: new Date().toISOString(),
      ...data,
    };
    this.bills.push(bill);
    this.appendAuditLog(workspaceId, userId, 'BILL_CREATED', 'bills', bill.id, null, { title: bill.title, amount: bill.amount });
    this.persist();
    return { success: true, bill };
  }

  public markBillPaid(userId: string, workspaceId: string, billId: string): { success: boolean; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer'])) {
      return { success: false, error: 'Permission denied.' };
    }
    const bill = this.bills.find((b) => b.id === billId && b.workspace_id === workspaceId);
    if (!bill) return { success: false, error: 'Bill not found.' };

    bill.payment_status = 'paid';
    this.appendAuditLog(workspaceId, userId, 'BILL_PAID', 'bills', bill.id, { payment_status: 'unpaid' }, { payment_status: 'paid' });
    this.persist();
    return { success: true };
  }

  public getLoans(userId: string, workspaceId: string): Loan[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.loans.filter((l) => l.workspace_id === workspaceId);
  }

  public addLoan(
    userId: string,
    workspaceId: string,
    data: {
      lender_name: string;
      borrower_name: string;
      principal_amount: number;
      outstanding_amount?: number;
      due_date?: string | null;
      loan_type: Loan['loan_type'];
      status?: Loan['status'];
    }
  ): { success: boolean; loan?: Loan; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer'])) {
      return { success: false, error: 'Permission denied: Insufficient privileges.' };
    }
    const loan: Loan = {
      id: `loan-${Date.now()}`,
      workspace_id: workspaceId,
      lender_name: data.lender_name,
      borrower_name: data.borrower_name,
      principal_amount: data.principal_amount,
      outstanding_amount: data.outstanding_amount !== undefined ? data.outstanding_amount : data.principal_amount,
      due_date: data.due_date || null,
      loan_type: data.loan_type,
      status: data.status || 'active',
      created_by: userId,
      created_at: new Date().toISOString(),
    };
    this.loans.push(loan);
    this.appendAuditLog(workspaceId, userId, 'LOAN_RECORDED', 'loans', loan.id, null, {
      lender: loan.lender_name,
      borrower: loan.borrower_name,
      amount: loan.principal_amount,
      type: loan.loan_type,
    });
    this.persist();
    return { success: true, loan };
  }

  public settleLoan(
    userId: string,
    workspaceId: string,
    loanId: string,
    settledAmount?: number
  ): { success: boolean; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer'])) {
      return { success: false, error: 'Permission denied: Insufficient privileges.' };
    }
    const loan = this.loans.find((l) => l.id === loanId && l.workspace_id === workspaceId);
    if (!loan) return { success: false, error: 'Loan record not found.' };

    const previousOutstanding = loan.outstanding_amount;
    if (settledAmount !== undefined && settledAmount > 0 && settledAmount < loan.outstanding_amount) {
      loan.outstanding_amount -= settledAmount;
      if (loan.outstanding_amount === 0) {
        loan.status = 'settled';
      }
    } else {
      loan.outstanding_amount = 0;
      loan.status = 'settled';
    }

    this.appendAuditLog(
      workspaceId,
      userId,
      loan.status === 'settled' ? 'LOAN_SETTLED' : 'LOAN_PARTIAL_REPAYMENT',
      'loans',
      loan.id,
      { outstanding: previousOutstanding },
      { outstanding: loan.outstanding_amount, status: loan.status }
    );
    this.persist();
    return { success: true };
  }

  public getContributions(userId: string, workspaceId: string): (Contribution & { contributor?: Profile })[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.contributions
      .filter((c) => c.workspace_id === workspaceId)
      .map((c) => ({
        ...c,
        contributor: this.profiles.find((p) => p.id === c.contributor_user_id),
      }));
  }

  public recordContribution(
    userId: string,
    workspaceId: string,
    data: { amount: number; purpose: string; contributor_user_id?: string }
  ): { success: boolean; contribution?: Contribution; error?: string } {
    if (!this.isMember(userId, workspaceId)) return { success: false, error: 'Not a member.' };

    const c: Contribution = {
      id: `cnt-${Date.now()}`,
      workspace_id: workspaceId,
      contributor_user_id: data.contributor_user_id || userId,
      amount: data.amount,
      contribution_date: new Date().toISOString().split('T')[0],
      purpose: data.purpose,
      status: 'received',
      created_at: new Date().toISOString(),
    };
    this.contributions.push(c);
    this.appendAuditLog(workspaceId, userId, 'CONTRIBUTION_RECORDED', 'contributions', c.id, null, {
      amount: c.amount,
      purpose: c.purpose,
    });
    this.persist();
    return { success: true, contribution: c };
  }

  // -------------------------------------------------------------------------
  // AUDIT LOGS (IMMUTABLE & APPEND-ONLY ENFORCEMENT)
  // -------------------------------------------------------------------------
  public getAuditLogs(userId: string, workspaceId: string): (AuditLog & { actor?: Profile })[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.auditLogs
      .filter((a) => a.workspace_id === workspaceId)
      .map((a) => ({
        ...a,
        actor: this.profiles.find((p) => p.id === a.actor_user_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public appendAuditLog(
    workspaceId: string,
    actorId: string,
    action: string,
    entityType: string,
    entityId?: string | null,
    previousValues?: Record<string, unknown> | null,
    newValues?: Record<string, unknown> | null
  ): AuditLog {
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      workspace_id: workspaceId,
      actor_user_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      previous_values: previousValues || null,
      new_values: newValues || null,
      created_at: new Date().toISOString(),
    };
    this.auditLogs.push(log);
    this.persist();
    return log;
  }

  /**
   * SECURITY TEST FUNCTION: Attempt to edit or delete an audit log.
   * Demonstrates strict append-only enforcement (Trigger trg_audit_logs_immutable).
   */
  public attemptAuditLogModification(auditLogId: string): { success: boolean; error: string } {
    // Under PostgreSQL, the trigger immediately throws:
    // RAISE EXCEPTION 'JEVRA Security Violation: audit_logs is append-only. Updates and deletions are strictly forbidden.'
    return {
      success: false,
      error: 'CRITICAL SECURITY ERROR: PostgreSQL trigger "trg_audit_logs_immutable" aborted operation. audit_logs is append-only. Updates and deletions are strictly forbidden by database-level security policy.',
    };
  }

  // -------------------------------------------------------------------------
  // EVIDENCE FILES & STORAGE SECURITY ('jevra-evidence')
  // -------------------------------------------------------------------------
  public getEvidenceFiles(userId: string, workspaceId: string): EvidenceFile[] {
    if (!this.isMember(userId, workspaceId)) return [];
    return this.evidenceFiles.filter((e) => e.workspace_id === workspaceId);
  }

  public uploadEvidenceFile(
    userId: string,
    workspaceId: string,
    transactionId: string,
    file: { name: string; type: string; size: number }
  ): { success: boolean; evidence?: EvidenceFile; error?: string } {
    if (!this.hasRole(userId, workspaceId, ['owner', 'finance_manager', 'treasurer'])) {
      return { success: false, error: 'Permission denied: Insufficient privileges to upload evidence.' };
    }

    if (file.size > 26214400) {
      return { success: false, error: 'File exceeds maximum 25MB limit.' };
    }

    const ev: EvidenceFile = {
      id: `ev-${Date.now()}`,
      workspace_id: workspaceId,
      transaction_id: transactionId,
      uploaded_by: userId,
      storage_path: `${workspaceId}/${file.name.replace(/\s+/g, '_')}`,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      created_at: new Date().toISOString(),
    };
    this.evidenceFiles.push(ev);

    const tx = this.transactions.find((t) => t.id === transactionId);
    if (tx) {
      tx.evidence_status = 'uploaded';
    }

    this.appendAuditLog(workspaceId, userId, 'EVIDENCE_FILE_UPLOADED', 'evidence_files', ev.id, null, {
      file_name: ev.file_name,
      storage_path: ev.storage_path,
    });
    this.persist();
    return { success: true, evidence: ev };
  }

  // -------------------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------------------
  public getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.user_id === userId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationRead(userId: string, notificationId: string): void {
    const notif = this.notifications.find((n) => n.id === notificationId && n.user_id === userId);
    if (notif) {
      notif.read_at = new Date().toISOString();
      this.persist();
    }
  }
}

export const dataEngine = new JevraDataEngine();
