import React from 'react';

// --- Corporate Role Structure ---
export type SystemRole = 
  | 'super_admin' 
  | 'admin'
  | 'hr'
  | 'hr_admin'
  | 'sales'
  | 'project_manager'
  | 'manager'
  | 'developer'
  | 'digital_marketer'
  | 'accountant'
  | 'payroll_admin'
  | 'client'
  | 'shift_supervisor' 
  | 'employee' 
  | 'intern' 
  | 'contract' 
  | 'auditor' 
  | 'it_support';

export type PermissionKey = 
  | 'all_access'           // Super Admin Exclusive
  | 'view_dashboard'
  
  // Calendar
  | 'calendar_view'
  | 'calendar_manage'      // Create schedules/events
  
  // User Management
  | 'user_view'
  | 'user_create'
  | 'user_edit'
  | 'user_delete'
  | 'user_manage'          // Legacy/Group: Create/Edit/Delete employees
  | 'role_manage'          // Configure permissions (Super Admin)
  
  // Payroll
  | 'payroll_view'
  | 'payroll_manage'
  
  // Projects
  | 'project_view'
  | 'project_create'
  | 'project_edit'
  | 'project_delete'
  | 'project_manage'       // Legacy/Group
  | 'project_access_restricted' // If true, can only see assigned projects
  
  // Clients
  | 'client_view'          // View Client Directory
  | 'client_create'
  | 'client_edit'
  | 'client_delete'
  | 'client_manage'        // Legacy/Group
  
  // Leads
  | 'lead_view'            // View Leads
  | 'lead_create'
  | 'lead_edit'
  | 'lead_delete'
  | 'lead_manage'          // Legacy/Group
  
  // Reports
  | 'reports_view'
  
  // Currency
  | 'currency_manage'      // Currency Conversion
  
  // Expenses
  | 'expense_view'         // View Expenses
  | 'expense_create'
  | 'expense_edit'
  | 'expense_delete'
  | 'expense_manage'       // Legacy/Group
  
  // Security
  | 'security_manage'
  
  // Marketing
  | 'marketing_view'
  | 'marketing_manage'
  
  // Finance
  | 'finance_view'
  | 'finance_create'
  | 'finance_edit'
  | 'finance_delete'
  | 'finance_manage'       // Legacy/Group
  | 'finance_view_profit'  // Financial Access Control (View Profit/Revenue)
  
  // Communication
  | 'communication_view'
  | 'communication_manage'
  
  // Document Management
  | 'document_view'
  | 'document_manage'
  
  // Compliance & Legal
  | 'compliance_view'
  | 'compliance_manage'
  
  // Resume Management
  | 'resume_view'
  | 'resume_manage';

// --- FINANCE & ACCOUNTS ---

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'credit_card' | 'upi' | 'cash' | 'cheque' | 'paypal';
export type Currency = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number; // Percentage (e.g., 18 for 18% GST)
  amount: number; // quantity * unitPrice
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string; // Linked to Client
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  currency: Currency;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  
  // Recurring
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'quarterly' | 'yearly';
  nextInvoiceDate?: string;
  
  // Template
  templateId: 'modern' | 'classic' | 'minimal';
  
  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  issueDate: string;
  validUntil: string;
  items: InvoiceItem[];
  subtotal: number;
  taxTotal: number;
  totalAmount: number;
  currency: Currency;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'converted'; // Converted to Invoice
  notes?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  category: string; // Service Type
  gstin?: string; // Tax ID
  paymentTerms?: string;
  balance: number; // Outstanding balance
  status: 'active' | 'inactive';
  address?: string;
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  contractStartDate?: string;
  contractEndDate?: string;
  website?: string;
}

export interface VendorPayment {
  id: string;
  vendorId: string;
  amount: number;
  paymentDate: string;
  method: PaymentMethod;
  referenceNumber?: string; // Transaction ID
  status: 'pending' | 'completed' | 'failed';
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  invoiceId?: string; // If linked to invoice (Incoming)
  vendorId?: string; // If linked to vendor (Outgoing)
  expenseId?: string; // If linked to expense (Outgoing)
  amount: number;
  date: string;
  type: 'income' | 'expense';
  method: PaymentMethod;
  reference?: string;
  status: 'completed' | 'pending';
}

// --- Expense Management ---

export type ExpenseType = 'recurring' | 'one-time';
export type ExpenseCategory = 'salary' | 'rent' | 'utilities' | 'software' | 'hardware' | 'marketing' | 'commission' | 'travel' | 'office_supplies' | 'other';
export type ExpenseStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  type: ExpenseType;
  date: string; // ISO Date
  status: ExpenseStatus;
  description?: string;
  
  // For recurring
  recurringDay?: number; // Day of month to auto-generate
  recurringInterval?: number; // Months (1=Monthly, 12=Yearly)
  isAutoGenerated?: boolean;
  
  createdBy: string;
  createdAt: string;
  receiptUrl?: string;
  
  // Payment Details
  paymentMode?: 'cash' | 'bank_transfer' | 'cheque' | 'upi' | 'credit_card' | 'other';
  bankAccount?: string;
}

export interface User {
  id: string; // System Generated
  
  // 2.1 Core Identity
  employeeCode: string;
  username: string; // Login ID
  passwordHash?: string; // Simulated encrypted
  firstName: string;
  lastName: string;
  displayName?: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  avatar?: string;
  
  // 2.2 Contact
  officialEmail: string;
  personalEmail?: string;
  mobileNumber: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;

  // 2.3 Account Status
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  
  // 2.4 Employment
  userType: 'employee' | 'intern' | 'contract' | 'consultant';
  employmentStatus: 'permanent' | 'probation' | 'notice-period' | 'temporary';
  department: string;
  position: string; // Designation
  reportingManagerId?: string;
  workLocation: string;
  workMode: 'office' | 'remote' | 'hybrid';
  joinDate: string;
  exitDate?: string; // For offboarding

  // 2.5 Role & Access
  role: SystemRole; 
  permissionGroup?: string; // ID of custom permission set
  dataVisibilityScope: 'self' | 'team' | 'department' | 'all';
  
  // 2.6 Attendance Config
  shiftId?: string; // Link to Shift Config
  attendanceMode: 'web' | 'mobile' | 'biometric' | 'all';
  ipRestriction: boolean;
  
  // 2.8 Intern Specifics
  internDetails?: {
    type: 'paid' | 'unpaid';
    startDate: string;
    endDate: string; // Auto-expiry
    stipendAmount?: number;
    mentorId: string;
    conversionEligibility: boolean;
  };

  // 2.9 Payroll (Restricted View)
  payrollDetails?: {
    salaryType: 'monthly' | 'hourly' | 'stipend';
    bankAccount?: string;
    ifsc?: string;
    pan?: string;
    uan?: string;
    isOvertimeEligible: boolean;
  };

  // 2.10 Audit
  createdBy: string;
  createdAt: string;
  modifiedBy?: string;
  modifiedAt?: string;
  
  // Legacy/UI props
  bio?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    notifications?: boolean;
    dashboardLayout?: string[];
  };

  // --- New Employee Management Fields ---
  documents?: EmployeeDocument[];
  kpis?: KPI[];
  leaveBalance?: LeaveBalance;
}

export interface EmployeeDocument {
  id: string;
  name: string;
  type: 'offer_letter' | 'contract' | 'id_proof' | 'resume' | 'other';
  url: string;
  uploadedAt: string;
}

export interface KPI {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string; // e.g., '%', 'sales', 'hours'
  weightage: number; // % contribution to performance
  status: 'pending' | 'on-track' | 'at-risk' | 'completed';
  period: 'monthly' | 'quarterly' | 'yearly';
}

export interface LeaveBalance {
  sick: number;
  casual: number;
  earned: number;
  unpaid: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  requiredPermission?: PermissionKey;
  isImportant?: boolean;
}

export interface Role {
  id: string;
  name: SystemRole | string; // Allow custom strings but strictly typed for system defaults
  displayName: string;
  description: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headOfDepartmentId?: string;
}

export interface Permission {
  id: PermissionKey;
  label: string;
  description: string;
  category: 'core' | 'hr' | 'finance' | 'operations' | 'it';
}

// --- CLIENT MODULE ---

export interface Client {
  id: string;
  // Basic Info
  clientName: string; // Display Name
  companyName: string; // Legal Name
  clientType: 'individual' | 'business' | 'enterprise';
  industry: string;
  website?: string;
  status: 'active' | 'inactive' | 'on-hold';
  
  // Contact
  primaryContactName: string;
  designation?: string;
  officialEmail: string;
  phone: string;
  address: string;
  billingAddress?: string;
  
  // Business
  accountOwnerId: string; // Internal Manager
  source: 'referral' | 'website' | 'direct' | 'campaign' | 'other';
  engagementType: 'project' | 'retainer' | 'amc';
  contractStartDate: string;
  contractEndDate?: string;
  paymentTerms: 'advance' | 'monthly' | 'milestone';
  
  // Financial (Restricted)
  currency: string;
  taxId?: string; // GST/VAT
  billingCategory?: 'high-value' | 'standard' | 'low-value';
  
  // Internal
  riskLevel: 'low' | 'medium' | 'high';
  internalNotes?: string;
}

// --- Attendance & Leave ---

export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'sick' | 'vacation' | 'personal' | 'emergency';
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'holiday' | 'weekend' | 'half-day' | 'late' | 'work-from-home' | 'on-duty';

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  adminComment?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  
  // Timings
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  
  // Calculations
  totalHours?: number; // Duration in hours
  overtimeHours?: number; // Overtime duration
  
  // Compliance
  isLocked?: boolean; // Payroll lock
  correctionRequested?: boolean;
  correctionReason?: string;
  
  // Metadata
  location?: string;
  ipAddress?: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: 'company' | 'national' | 'restricted';
}

export interface EventAttendee {
  userId: string;
  status: 'pending' | 'accepted' | 'declined' | 'present' | 'absent' | 'excused';
  notes?: string; // Reasons for absence or permission details
}

// --- RENEWAL MANAGEMENT ---

export type RenewalType = 'domain' | 'hosting' | 'ssl' | 'amc' | 'marketing' | 'software_license' | 'other';
export type RenewalStatus = 'active' | 'expiring_soon' | 'expired' | 'renewed' | 'cancelled';
export type RenewalFrequency = 'one-time' | 'monthly' | 'bimonthly' | 'quarterly' | 'half-yearly' | 'yearly';

export interface Renewal {
  id: string;
  name: string; // e.g., "google.com Domain"
  type: RenewalType;
  provider: string; // e.g., "GoDaddy", "AWS"
  expiryDate: string; // YYYY-MM-DD
  frequency: RenewalFrequency; // NEW: Frequency
  cost: number;
  currency: Currency;
  autoRenew: boolean;
  status: RenewalStatus;
  
  // Reminders
  reminderDays: number[]; // [60, 30, 15, 7]
  lastReminderSent?: string;
  
  // Linked Client (Optional)
  clientId?: string;
  
  // Linked Vendor (Optional)
  vendorId?: string;
  
  notes?: string;
  websiteUrl?: string; // For domains/hosting
  
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  duration?: number; // Minutes
  title: string;
  description?: string;
  type: 'maintenance' | 'holiday' | 'meeting' | 'reminder';
  priority: 'low' | 'medium' | 'high' | 'urgent'; 
  status: 'scheduled' | 'completed' | 'cancelled'; 
  
  // Outcome Data
  mom?: string; 
  feedback?: string; 
  
  createdBy: string;
  
  // Targeting Logic
  targetScope: 'all' | 'department' | 'user';
  targetDepartmentIds?: string[];
  targetUserIds?: string[];
  
  // Meeting Details
  attendees?: EventAttendee[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  timestamp: string;
  isRead: boolean;
  targetUserIds: string[]; // 'all' or specific IDs
  linkTo?: string; // navigation target
}

export interface PerformanceReview {
  id: string;
  userId: string;
  date: string;
  rating: number; // 1-5
  comment: string;
  reviewer: string;
}

// --- Project Management ---

export type TaskStatus = 'todo' | 'in-progress' | 'testing' | 'pending-approval' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TimeLogEntry {
  status: 'in-progress' | 'testing';
  start: number; // Timestamp
  end?: number;  // Timestamp
}

export interface TaskFeedback {
  id: string;
  date: string;
  comment: string;
}

export interface Project {
  id: string;
  clientId?: string; // Linked to Client
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold' | 'inactive' | 'stopped';
  startDate: string;
  endDate: string;
  managerId: string;
  teamMemberIds: string[];
  progress: number; // 0-100
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string[]; // Array of User IDs
  dueDate: string;
  createdAt: string;
  createdBy: string; // User ID (Admin/Manager)
  
  // Time Tracking
  timeLogs: TimeLogEntry[];
  isPaused: boolean;
  feedbackHistory?: TaskFeedback[];
}

// --- Payroll Management ---

export interface SalaryStructure {
  userId: string;
  basicSalary: number;
  hra: number;
  transportAllowance: number;
  medicalAllowance: number;
  specialAllowance: number;
  pfDeduction: number; // Provident Fund
  taxDeduction: number; // TDS
}

export interface PayrollRecord {
  id: string;
  userId: string;
  month: number; // 1-12
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processing' | 'paid';
  paymentDate?: string;
  generatedAt: string;
}

// --- Prospect Management (Telecalling/Screening) ---

export type ProspectStatus = 'new' | 'not_answered' | 'switched_off' | 'follow_up_later' | 'not_interested' | 'potential_lead' | 'invalid_number';

export interface Prospect {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  source: string; // e.g., 'JustDial', 'Facebook', 'Cold Call'
  businessType?: 'Service' | 'Products' | 'Both' | '';
  businessDetails?: string; 
  targetAudience?: string; 
  status: ProspectStatus;
  notes?: string;
  nextFollowUp?: string; // ISO date string
  assignedTo: string; // User ID (Intern / Sales)
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// --- Lead Management ---

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  source: string;
  status: LeadStatus;
  assignedTo: string; // User ID
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface MOM {
  id: string;
  leadId: string;
  meetingDate: string;
  attendees: string[]; // Names or User IDs
  discussionPoints: string;
  actionItems: string;
  recordedBy: string; // User ID
  createdAt: string;
}

export interface FollowUp {
  id: string;
  leadId: string;
  scheduledDate: string; // ISO string
  type: 'call' | 'email' | 'meeting' | 'other';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  assignedTo: string; // User ID
  createdAt: string;
}

// --- DIGITAL MARKETING ---

export interface SEOKeyword {
  id: string;
  keyword: string;
  position: number;
  previousPosition: number;
  searchVolume: number;
  difficulty: number;
  url: string;
  lastUpdated: string;
}

export interface Backlink {
  id: string;
  domain: string;
  targetUrl: string;
  authority: number; // DA/DR
  status: 'active' | 'lost';
  acquiredDate: string;
}

export interface SEOTask {
  id: string;
  task: string;
  category: 'technical' | 'on-page' | 'off-page';
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface SocialPost {
  id: string;
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook' | 'youtube';
  content: string;
  mediaUrl?: string;
  scheduledDate: string;
  status: 'draft' | 'pending_approval' | 'scheduled' | 'posted';
  engagement?: {
    likes: number;
    shares: number;
    comments: number;
    clicks: number;
  };
  createdBy: string;
}

export interface AdCampaign {
  id: string;
  name: string;
  platform: 'google' | 'meta' | 'linkedin' | 'other';
  status: 'active' | 'paused' | 'ended';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  clicks: number;
  impressions: number;
  leads: number;
  revenue: number; // For ROI
}

// --- COMMUNICATION MODULE ---

export type ChatType = 'direct' | 'group' | 'client';

export interface ChatChannel {
  id: string;
  name?: string; // For groups
  type: ChatType;
  memberIds: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'system';
  fileUrl?: string;
  fileName?: string;
  isRead: boolean;
}

export interface Email {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  timestamp: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  isRead: boolean;
  attachments?: { name: string; url: string }[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string; // e.g., "Created Project", "Sent Invoice"
  targetId?: string; // ID of the object affected
  targetType?: string; // "Project", "Invoice", "User"
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

// --- DOCUMENT MANAGEMENT ---

export type DocumentCategory = 'client' | 'project' | 'agreement' | 'nda' | 'policy' | 'other';

export interface DocumentVersion {
  id: string;
  versionNumber: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  changes?: string;
}

export interface AppDocument {
  id: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  tags: string[];
  
  // Access Control
  visibility: 'public' | 'internal' | 'restricted';
  allowedRoles?: string[];
  allowedUsers?: string[];
  
  // Relations
  clientId?: string;
  projectId?: string;
  
  // Versions
  currentVersion: number;
  versions: DocumentVersion[];
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// --- RESUME MANAGEMENT ---

export type ResumeStatus = 'new' | 'screening' | 'interviewing' | 'offered' | 'hired' | 'rejected' | 'on_hold';

export interface ResumeHistory {
  id: string;
  resumeId: string;
  action: string;
  date: string;
  performedBy: string; // User ID
  details?: string;
}

export interface ResumeMOM {
  id: string;
  resumeId: string;
  date: string;
  interviewer: string; // User ID or Name
  notes: string;
  decision: string;
}

export interface Resume {
  id: string;
  candidateName: string;
  email: string; // Must be unique
  phone: string;
  experience: number; // in years
  skills: string[];
  status: ResumeStatus;
  resumeUrl: string; // URL to the uploaded file
  appliedPosition?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  history: ResumeHistory[];
  moms: ResumeMOM[];
}
