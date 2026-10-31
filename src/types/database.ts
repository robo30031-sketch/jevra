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
  owner_id: string;
  currency: string;
  description?: string | null;
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
