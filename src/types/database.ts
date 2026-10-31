/**
 * JEVRA - Type Definitions
 * Tagline: Every Rupee. Every Responsibility. Every Record.
 */

export type WorkspaceType = 'personal' | 'organisation';

export type WorkspaceRole =
  | 'owner'
  | 'finance_manager'
  | 'treasurer'
  | 'approver'
  | 'member'
  | 'viewer';

export type MembershipStatus = 'active' | 'invited' | 'suspended';

export type TransactionType =
  | 'income'
  | 'expense'
  | 'contribution'
  | 'repayment'
  | 'transfer';

export type PaymentMethod =
  | 'bank_transfer'
  | 'upi'
  | 'cash'
  | 'card'
  | 'cheque'
  | 'other';

export type TransactionStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'completed';

export type EvidenceStatus = 'none' | 'uploaded' | 'verified' | 'rejected';

export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly' | 'custom';

export type GoalStatus = 'active' | 'achieved' | 'paused' | 'cancelled';

export type BillRecurrence =
  | 'one_time'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly';

export type BillPaymentStatus = 'unpaid' | 'paid' | 'overdue';

export type LoanType = 'given' | 'taken';

export type LoanStatus = 'active' | 'settled' | 'defaulted';

export type ContributionStatus = 'pledged' | 'received' | 'acknowledged';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type NotificationType =
  | 'approval_request'
  | 'approval_granted'
  | 'approval_rejected'
  | 'contribution_received'
  | 'bill_due'
  | 'member_joined'
  | 'system';

export type WorkspaceCategory =
  | 'personal_finance'
  | 'family_finance'
  | 'society_apartment'
  | 'office_company'
  | 'school_education'
  | 'hospital_health'
  | 'police_station'
  | 'fire_station'
  | 'ngo_foundation'
  | 'club_association'
  | 'small_business'
  | 'government_dept'
  | 'other';

export type VerificationStatus =
  | 'unverified'
  | 'pending_verification'
  | 'verified'
  | 'institutional_exempt';

export interface InstitutionalDetails {
  institution_name?: string;
  registration_number?: string;
  location?: string;
  address?: string;
  admin_name?: string;
  admin_designation?: string;
  contact_phone?: string;
  contact_email?: string;
  department_name?: string;
  purpose_summary?: string;
  station_jurisdiction?: string;
  total_units_or_members?: number;
  custom_category_label?: string;
}

// A. Profiles
export interface Profile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  phone?: string | null;
  preferred_currency: string;
  created_at: string;
  updated_at: string;
}

// B. Workspaces
export interface Workspace {
  id: string;
  name: string;
  workspace_type: WorkspaceType;
  workspace_category: WorkspaceCategory;
  verification_status: VerificationStatus;
  owner_id: string;
  currency: string;
  description?: string | null;
  institution_details?: InstitutionalDetails;
  custom_config?: Record<string, unknown>;
  is_demo?: boolean;
  created_at: string;
  updated_at: string;
}

// C. Workspace Members
export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  membership_status: MembershipStatus;
  joined_at: string;
  profile?: Profile;
}

// D. Workspace Invitations
export interface WorkspaceInvitation {
  id: string;
  workspace_id: string;
  invited_email: string;
  assigned_role: WorkspaceRole;
  invitation_token_hash: string;
  invited_by: string;
  expires_at: string;
  accepted_at?: string | null;
  created_at: string;
}

// E. Categories
export interface Category {
  id: string;
  workspace_id: string;
  name: string;
  category_type: 'income' | 'expense';
  created_at: string;
}

// F. Transactions
export interface Transaction {
  id: string;
  workspace_id: string;
  category_id?: string | null;
  created_by: string;
  responsible_user_id?: string | null;
  transaction_type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  payment_method: PaymentMethod;
  transaction_date: string;
  status: TransactionStatus;
  evidence_status: EvidenceStatus;
  created_at: string;
  updated_at: string;
  category?: Category;
  created_by_profile?: Profile;
}

// G. Budgets
export interface Budget {
  id: string;
  workspace_id: string;
  name: string;
  category_id?: string | null;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  created_by: string;
  created_at: string;
  category?: Category;
}

// H. Financial Goals
export interface FinancialGoal {
  id: string;
  workspace_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  target_date?: string | null;
  status: GoalStatus;
  created_by: string;
  created_at: string;
}

// I. Bills
export interface Bill {
  id: string;
  workspace_id: string;
  title: string;
  amount: number;
  currency: string;
  due_date: string;
  recurrence: BillRecurrence;
  assigned_user_id?: string | null;
  payment_status: BillPaymentStatus;
  created_at: string;
  assigned_user?: Profile;
}

// J. Loans
export interface Loan {
  id: string;
  workspace_id: string;
  lender_name: string;
  borrower_name: string;
  principal_amount: number;
  outstanding_amount: number;
  due_date?: string | null;
  loan_type: LoanType;
  status: LoanStatus;
  created_by: string;
  created_at: string;
}

// K. Contributions
export interface Contribution {
  id: string;
  workspace_id: string;
  contributor_user_id: string;
  amount: number;
  contribution_date: string;
  purpose: string;
  status: ContributionStatus;
  transaction_id?: string | null;
  created_at: string;
  contributor?: Profile;
}

// L. Approvals
export interface Approval {
  id: string;
  workspace_id: string;
  transaction_id: string;
  requested_by: string;
  approver_id?: string | null;
  approval_status: ApprovalStatus;
  comments?: string | null;
  requested_at: string;
  reviewed_at?: string | null;
  transaction?: Transaction;
  requester?: Profile;
  approver?: Profile;
}

// M. Audit Logs
export interface AuditLog {
  id: string;
  workspace_id: string;
  actor_user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  previous_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  created_at: string;
  actor?: Profile;
}

// N. Evidence Files
export interface EvidenceFile {
  id: string;
  workspace_id: string;
  transaction_id: string;
  uploaded_by: string;
  storage_path: string;
  file_name: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

// O. Notifications
export interface Notification {
  id: string;
  user_id: string;
  workspace_id?: string | null;
  title: string;
  message: string;
  notification_type: NotificationType;
  read_at?: string | null;
  created_at: string;
}

// Currency Symbol Map
export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SGD: 'S$',
};

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || `${currency} `;
  return `${symbol}${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export interface WorkspaceCategoryInfo {
  id: WorkspaceCategory;
  name: string;
  group: 'personal_community' | 'professional_institutional';
  tagline: string;
  description: string;
  defaultType: WorkspaceType;
  terminology: {
    balanceTitle: string;
    inflowTitle: string;
    outflowTitle: string;
    reservesTitle: string;
    commitmentsTitle: string;
    approvalsTitle: string;
    ledgerSubtitle: string;
  };
}

export const WORKSPACE_CATEGORIES: Record<WorkspaceCategory, WorkspaceCategoryInfo> = {
  personal_finance: {
    id: 'personal_finance',
    name: 'Personal Finance',
    group: 'personal_community',
    tagline: 'Individual Money Management',
    description: 'Personal income, expenditure, discretionary savings, recurring bills and individual commitments.',
    defaultType: 'personal',
    terminology: {
      balanceTitle: 'Personal Balance',
      inflowTitle: 'Monthly Income',
      outflowTitle: 'Monthly Expenses',
      reservesTitle: 'Personal Savings',
      commitmentsTitle: 'Upcoming Bills',
      approvalsTitle: 'Clearance Queue',
      ledgerSubtitle: 'Personal income & expenditure ledger',
    },
  },
  family_finance: {
    id: 'family_finance',
    name: 'Family Finance',
    group: 'personal_community',
    tagline: 'Household Financial Governance',
    description: 'Household pooled budget, family member contributions, shared utilities and joint financial commitments.',
    defaultType: 'personal',
    terminology: {
      balanceTitle: 'Household Balance',
      inflowTitle: 'Family Income',
      outflowTitle: 'Household Expenses',
      reservesTitle: 'Emergency Reserves',
      commitmentsTitle: 'Family Bills & Rent',
      approvalsTitle: 'Family Clearances',
      ledgerSubtitle: 'Shared household income & expense ledger',
    },
  },
  society_apartment: {
    id: 'society_apartment',
    name: 'Apartment / Society',
    group: 'personal_community',
    tagline: 'Residential Owners Association',
    description: 'Maintenance collection, resident dues, sinking funds, vendor invoices, security staff payroll and common facility expenses.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Association Treasury',
      inflowTitle: 'Maintenance Collections',
      outflowTitle: 'Facility & Vendor Expenses',
      reservesTitle: 'Sinking Fund Reserves',
      commitmentsTitle: 'Utility Bills & AMCs',
      approvalsTitle: 'Management Committee Approvals',
      ledgerSubtitle: 'Community treasury inflow & disbursement ledger',
    },
  },
  office_company: {
    id: 'office_company',
    name: 'Office / Company',
    group: 'professional_institutional',
    tagline: 'Corporate Financial Management',
    description: 'Business revenue, vendor bill payments, employee travel reimbursements, departmental budgets and corporate expenditure.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Corporate Treasury',
      inflowTitle: 'Operating Revenue',
      outflowTitle: 'Operating Expenditure',
      reservesTitle: 'Retained Earnings',
      commitmentsTitle: 'Vendor Payables & Rent',
      approvalsTitle: 'Executive Approvals',
      ledgerSubtitle: 'Corporate income, expenses & disbursement ledger',
    },
  },
  school_education: {
    id: 'school_education',
    name: 'School / Educational Institution',
    group: 'professional_institutional',
    tagline: 'Academic Institution Accounts',
    description: 'Student fee collections, faculty and staff payroll, lab and library budgets, sports funds and educational event management.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'School Funds',
      inflowTitle: 'Fee Collections & Grants',
      outflowTitle: 'Operational Expenses',
      reservesTitle: 'Campus Development Fund',
      commitmentsTitle: 'Institutional Liabilities',
      approvalsTitle: 'Principal / Trustee Approvals',
      ledgerSubtitle: 'Institutional academic cashflow & expense ledger',
    },
  },
  hospital_health: {
    id: 'hospital_health',
    name: 'Hospital / Healthcare Institution',
    group: 'professional_institutional',
    tagline: 'Healthcare & Medical Facilities',
    description: 'Departmental budgets, pharmaceutical purchases, surgical equipment expenditures, staff rosters and patient service receipts.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Hospital Treasury Funds',
      inflowTitle: 'Patient & Insurance Receipts',
      outflowTitle: 'Medical & Departmental Costs',
      reservesTitle: 'Equipment Sinking Fund',
      commitmentsTitle: 'Supply & Pharma Payables',
      approvalsTitle: 'Clinical Directorate Approvals',
      ledgerSubtitle: 'Medical center departmental cashflow & vouchers',
    },
  },
  police_station: {
    id: 'police_station',
    name: 'Police Station',
    group: 'professional_institutional',
    tagline: 'Station Administration & Public Security',
    description: 'Station administrative funds, authorized departmental allowances, patrol vehicle fuel, station upkeep and verified accountability records.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Station Administrative Funds',
      inflowTitle: 'Allocated Treasury Grants',
      outflowTitle: 'Station Operating Expenses',
      reservesTitle: 'Emergency Contingency Fund',
      commitmentsTitle: 'Logistics & Fuel Liabilities',
      approvalsTitle: 'Station House Officer Approvals',
      ledgerSubtitle: 'Departmental public accountability ledger',
    },
  },
  fire_station: {
    id: 'fire_station',
    name: 'Fire Station / Emergency Services',
    group: 'professional_institutional',
    tagline: 'Emergency Response & Fleet Management',
    description: 'Apparatus & vehicle maintenance, firefighter safety gear equipment, station utilities and rapid response operational budgets.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Service Station Funds',
      inflowTitle: 'Civic Budget Allocations',
      outflowTitle: 'Fleet & Gear Expenditure',
      reservesTitle: 'Apparatus Replacement Fund',
      commitmentsTitle: 'Maintenance & Service Payables',
      approvalsTitle: 'Chief Officer Clearances',
      ledgerSubtitle: 'Emergency response logistics & operational ledger',
    },
  },
  ngo_foundation: {
    id: 'ngo_foundation',
    name: 'NGO / Foundation',
    group: 'professional_institutional',
    tagline: 'Non-Profit & Philanthropic Trust',
    description: 'Public donor contributions, CSR grants, mission campaign expenditures, field project budgets and transparent audit ledgers.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Foundation Reserves',
      inflowTitle: 'Grants & Public Donations',
      outflowTitle: 'Program & Mission Spend',
      reservesTitle: 'Endowment Reserves',
      commitmentsTitle: 'Program Commitments',
      approvalsTitle: 'Trustee Board Clearances',
      ledgerSubtitle: 'Transparent philanthropic disbursement ledger',
    },
  },
  club_association: {
    id: 'club_association',
    name: 'Club / Association',
    group: 'professional_institutional',
    tagline: 'Sports, Social & Cultural Clubs',
    description: 'Annual member subscriptions, tournament entry fees, banquet catering expenses, equipment purchase and club facility maintenance.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Club Treasury',
      inflowTitle: 'Member Subscriptions',
      outflowTitle: 'Event & Facility Expenses',
      reservesTitle: 'Club Development Fund',
      commitmentsTitle: 'Vendor Payables & AMCs',
      approvalsTitle: 'Executive Committee Approvals',
      ledgerSubtitle: 'Club membership & activity financial ledger',
    },
  },
  small_business: {
    id: 'small_business',
    name: 'Shop / Small Business',
    group: 'professional_institutional',
    tagline: 'Retail, Traders & Services',
    description: 'Daily cash and UPI billing, distributor and supplier wholesale bills, rent, utility bills and inventory restocking tracking.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Business Cashflow Balance',
      inflowTitle: 'Daily Revenue & Sales',
      outflowTitle: 'Wholesale & Operational Costs',
      reservesTitle: 'Working Capital Reserves',
      commitmentsTitle: 'Supplier Invoices Due',
      approvalsTitle: 'Payment Clearances',
      ledgerSubtitle: 'Trade revenue and procurement journal',
    },
  },
  government_dept: {
    id: 'government_dept',
    name: 'Government Department',
    group: 'professional_institutional',
    tagline: 'Public Administration & Civil Works',
    description: 'Fiscal year allocated budget, scheme disbursements, contractor invoice settlements, administrative expenses and statutory accountability.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Departmental Fiscal Allocation',
      inflowTitle: 'Exchequer Allocations',
      outflowTitle: 'Scheme & Civil Disbursements',
      reservesTitle: 'Contingency Allocation',
      commitmentsTitle: 'Contractor Liabilities',
      approvalsTitle: 'Sanctioning Authority Clearances',
      ledgerSubtitle: 'Statutory public accountability ledger',
    },
  },
  other: {
    id: 'other',
    name: 'Custom Financial Workspace',
    group: 'professional_institutional',
    tagline: 'Custom Financial Architecture',
    description: 'Tailored financial management framework for independent trusts, joint ventures, or unique accountability groups.',
    defaultType: 'organisation',
    terminology: {
      balanceTitle: 'Total Net Funds',
      inflowTitle: 'Total Inflow',
      outflowTitle: 'Total Outflow',
      reservesTitle: 'Reserve Allocation',
      commitmentsTitle: 'Upcoming Obligations',
      approvalsTitle: 'Pending Approvals',
      ledgerSubtitle: 'Custom financial management ledger',
    },
  },
};

