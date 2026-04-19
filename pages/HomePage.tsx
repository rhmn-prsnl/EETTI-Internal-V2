import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Dashboard from './Dashboard';
import EmployeeManagement from './EmployeeManagement';
import UserDetails from './UserDetails';
import SettingsPage from './SettingsPage';
import AttendancePage from './AttendancePage';
import ProjectManagement from './ProjectManagement';
import ClientManagement from './ClientManagement'; // New Import
import LeadManagement from './LeadManagement'; // New Import
import PayrollManagement from './PayrollManagement'; // New Import
import ExpenseManagement from './ExpenseManagement'; // New Import
import CurrencyConverter from './CurrencyConverter'; // New Import
import DigitalMarketing from './DigitalMarketing'; // New Import
import FinanceManagement from './FinanceManagement'; // New Import
import RenewalManagement from './RenewalManagement'; // New Import
import ReportsPage from './ReportsPage'; // New Import
import CommunicationPage from './CommunicationPage'; // New Import
import DocumentManagement from './DocumentManagement'; // New Import
import ComplianceLegal from './ComplianceLegal'; // New Import
import ResumeManagement from './ResumeManagement';
import { User, Role, Department, LeaveRequest, AttendanceRecord, PerformanceReview, Task, Project, PermissionKey, AppNotification, Client, Lead, MOM, FollowUp, PayrollRecord, SalaryStructure, Expense, Renewal, Invoice } from '../types';
import { Bell, Search, LogOut, ChevronDown, Lock, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import Button from '../components/ui/Button';

interface HomePageProps {
  user: User;
  onLogout: () => void;
  onUpdateUser: (updates: Partial<User>) => void;
}

// --- DEFAULT PERMISSIONS SETUP ---
const DEFAULT_ROLES: Role[] = [
  { 
    id: 'r1', name: 'super_admin', displayName: 'Super Admin', 
    description: 'System Owner. Has access to EVERYTHING.', 
    permissions: ['all_access'], 
    isSystem: true 
  },
  { 
    id: 'r2', name: 'admin', displayName: 'Admin', 
    description: 'General Administrator.', 
    permissions: ['view_dashboard', 'user_manage', 'calendar_manage', 'reports_view', 'client_manage', 'finance_view', 'project_manage', 'expense_manage', 'lead_manage', 'communication_view', 'communication_manage', 'document_view', 'document_manage', 'compliance_view', 'compliance_manage', 'resume_view', 'resume_manage'], 
    isSystem: true 
  },
  { 
    id: 'r3', name: 'hr', displayName: 'HR Manager', 
    description: 'Manages employees, attendance, and recruitment.', 
    permissions: ['view_dashboard', 'user_manage', 'calendar_manage', 'payroll_view', 'reports_view', 'communication_view', 'document_view', 'document_manage', 'compliance_view', 'compliance_manage', 'resume_view', 'resume_manage'], 
    isSystem: true 
  },
  { 
    id: 'r4', name: 'sales', displayName: 'Sales Executive', 
    description: 'Manages clients and leads.', 
    permissions: ['view_dashboard', 'client_manage', 'lead_manage', 'calendar_view', 'reports_view', 'communication_view', 'document_view'], 
    isSystem: true 
  },
  { 
    id: 'r5', name: 'project_manager', displayName: 'Project Manager', 
    description: 'Manages projects and teams.', 
    permissions: ['view_dashboard', 'project_manage', 'user_view', 'calendar_view', 'reports_view', 'client_view', 'communication_view', 'document_view', 'document_manage'], 
    isSystem: true 
  },
  { 
    id: 'r6', name: 'developer', displayName: 'Developer', 
    description: 'Works on assigned projects.', 
    permissions: ['view_dashboard', 'project_view', 'calendar_view', 'project_access_restricted', 'communication_view', 'document_view'], 
    isSystem: true 
  },
  { 
    id: 'r7', name: 'digital_marketer', displayName: 'Digital Marketer', 
    description: 'Manages marketing campaigns.', 
    permissions: ['view_dashboard', 'marketing_manage', 'lead_view', 'calendar_view', 'communication_view'], 
    isSystem: true 
  },
  { 
    id: 'r8', name: 'accountant', displayName: 'Accountant', 
    description: 'Manages finances and payroll.', 
    permissions: ['view_dashboard', 'finance_manage', 'payroll_manage', 'expense_manage', 'reports_view', 'finance_view_profit', 'currency_manage', 'communication_view'], 
    isSystem: true 
  },
  { 
    id: 'r9', name: 'client', displayName: 'Client', 
    description: 'Limited access to view their projects.', 
    permissions: ['view_dashboard', 'project_view', 'project_access_restricted', 'communication_view'], 
    isSystem: true 
  },
  { 
    id: 'r10', name: 'it_support', displayName: 'IT Support', 
    description: 'Technical support and security.', 
    permissions: ['view_dashboard', 'user_view', 'security_manage', 'communication_view'], 
    isSystem: true 
  },
  { 
    id: 'r11', name: 'intern', displayName: 'Intern', 
    description: 'Limited access for interns.', 
    permissions: ['view_dashboard', 'calendar_view', 'communication_view'], 
    isSystem: true 
  },
];

// Access Denied Component
const AccessDenied = ({ role, onBack }: { role: string, onBack: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full py-20 text-center">
    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
      <Lock size={32} />
    </div>
    <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
    <p className="text-slate-500 max-w-md">
      Your role ({role}) does not have permission to view this page. 
      Only Super Admin can grant access.
    </p>
    <Button variant="secondary" className="mt-6" onClick={onBack}>
      Return to Dashboard
    </Button>
  </div>
);

const HomePage: React.FC<HomePageProps> = ({ user, onLogout, onUpdateUser }) => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // --- Data State ---

  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  
  // Lead Management State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [moms, setMoms] = useState<MOM[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);

  // --- Payroll State ---
  const [salaryStructures, setSalaryStructures] = useState<SalaryStructure[]>([]);

  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);

  // --- Invoices State ---
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const handleAddInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
  };

  // --- Expense State ---
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Calculate Total Salary Expense for current month (or all time, depending on requirement. Let's do current month based on context usually, but module asks for overall sum. Let's provide total for now)
  const totalSalaryExpense = payrollRecords.reduce((sum, record) => sum + record.netSalary, 0);

  const handleAddExpense = (newExpense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => {
    const expense: Expense = {
      ...newExpense,
      id: `exp_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      createdBy: user.id
    };
    setExpenses(prev => [expense, ...prev]);
    handleAddNotification({
      title: 'Expense Added',
      message: `${expense.title} of ₹${expense.amount} added successfully.`,
      type: 'success',
      targetUserIds: [user.id]
    });
  };

  const handleUpdateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleGenerateRecurringExpenses = (month: string, year: number) => {
    // 1. Identify Recurring Templates
    const recurringTemplates = expenses.filter(e => e.type === 'recurring');
    
    const targetDate = new Date(year, parseInt(month) - 1, 1);
    const targetMonthStr = `${year}-${String(month).padStart(2, '0')}`;

    const newExpenses: Expense[] = [];

    recurringTemplates.forEach(template => {
      // 2. Interval Logic
      const startDate = new Date(template.date);
      
      // Calculate month difference
      const diffMonths = (targetDate.getFullYear() - startDate.getFullYear()) * 12 + (targetDate.getMonth() - startDate.getMonth());
      const interval = template.recurringInterval || 1;

      // Only generate if:
      // a) It's a future month relative to the template (diffMonths > 0)
      // b) The difference matches the interval
      if (diffMonths > 0 && diffMonths % interval === 0) {
        
        const newTitle = `${template.title} (Auto)`;
        const newDate = `${targetMonthStr}-${String(template.recurringDay || 1).padStart(2, '0')}`;

        // 3. Duplicate Check
        // Check if an expense with this title already exists in the target month
        const alreadyExists = expenses.some(e => 
          e.title === newTitle && 
          e.date.startsWith(targetMonthStr)
        );

        if (!alreadyExists) {
          newExpenses.push({
            ...template,
            id: `exp_${Math.random().toString(36).substr(2, 9)}`,
            date: newDate,
            status: 'pending',
            createdAt: new Date().toISOString(),
            createdBy: user.id,
            title: newTitle,
            isAutoGenerated: true
          });
        }
      }
    });

    if (newExpenses.length > 0) {
      setExpenses(prev => [...newExpenses, ...prev]);
      handleAddNotification({
        title: 'Recurring Expenses Generated',
        message: `${newExpenses.length} recurring expenses added for ${month}/${year}.`,
        type: 'success',
        targetUserIds: [user.id]
      });
    } else {
      handleAddNotification({
        title: 'No New Expenses',
        message: 'No due recurring expenses found for this month.',
        type: 'info',
        targetUserIds: [user.id]
      });
    }
  };

  const handleGeneratePayroll = (month: string, year: number) => {
    const monthInt = parseInt(month);
    
    // Check for existing records to prevent duplicates
    const existingRecords = payrollRecords.filter(r => r.month === monthInt && r.year === year);
    if (existingRecords.length > 0) {
      handleAddNotification({
        title: 'Payroll Generation Failed',
        message: `Payroll for ${month}/${year} already exists. Please delete existing records or edit them.`,
        type: 'alert',
        targetUserIds: [user.id]
      });
      return;
    }

    // Generate new records
    const newRecords: PayrollRecord[] = users.filter(u => u.status === 'active').map(u => {
      const structure = salaryStructures.find(s => s.userId === u.id);
      // Basic salary is derived from structure (monthly = annual / 12 for simplicity, or just assume structure is monthly)
      // Let's assume structure is Monthly
      const basicSalary = structure ? structure.basicSalary : 0; 
      
      return {
        id: `pr_${Math.random().toString(36).substr(2, 9)}`,
        userId: u.id,
        month: monthInt,
        year: year,
        basicSalary: basicSalary, 
        allowances: 0, // Manual entry required
        deductions: 0, // Manual entry required
        netSalary: basicSalary, // Initial net
        status: 'pending',
        generatedAt: new Date().toISOString()
      };
    });

    setPayrollRecords([...payrollRecords, ...newRecords]);
    handleAddNotification({
      title: 'Payroll Generated',
      message: `Payroll for ${month}/${year} has been generated successfully. Please update allowances and deductions.`,
      type: 'success',
      targetUserIds: [user.id]
    });
  };

  const handleUpdatePayrollStatus = (recordId: string, status: 'paid' | 'pending' | 'processing') => {
    setPayrollRecords(prev => prev.map(r => r.id === recordId ? { ...r, status } : r));
  };

  const handleUpdatePayrollRecord = (recordId: string, updates: Partial<PayrollRecord>) => {
    setPayrollRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...updates } : r));
  };

  const handleDeletePayroll = (recordId: string) => {
    setPayrollRecords(prev => prev.filter(r => r.id !== recordId));
  };

  const handleUpdateSalaryStructure = (userId: string, structure: SalaryStructure) => {
    // In a real app, update backend
    setSalaryStructures(prev => {
      const existing = prev.findIndex(s => s.userId === userId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = structure;
        return updated;
      }
      return [...prev, structure];
    });
  };

  const handleUpdateLead = (leadId: string, updates: Partial<Lead>) => {
    setLeads(prevLeads => prevLeads.map(lead => {
      if (lead.id === leadId) {
        const updatedLead = { ...lead, ...updates };
        
        // Auto-create project if status changes to closed_won
        if (updates.status === 'closed_won' && lead.status !== 'closed_won') {
          const newProject: Project = {
            id: `proj_${Math.random().toString(36).substr(2, 9)}`,
            name: `${lead.company} Project`,
            description: `Project generated from lead: ${lead.firstName} ${lead.lastName}`,
            status: 'active',
            progress: 0,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
            managerId: lead.assignedTo,
            teamMemberIds: [lead.assignedTo]
          };
          setProjects(prev => [...prev, newProject]);
          
          // Add notification
          const newNotification: AppNotification = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'New Project Created',
            message: `Project "${newProject.name}" has been automatically created from won lead.`,
            type: 'success',
            timestamp: 'Just now',
            isRead: false,
            targetUserIds: ['all'] // Notify everyone or just admins/manager
          };
          setNotifications(prev => [newNotification, ...prev]);
        }
        
        return updatedLead;
      }
      return lead;
    }));
  };
  
  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: 'Just now',
      isRead: false,
      ...notification
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (notif: AppNotification) => {
    handleMarkNotificationRead(notif.id);
    if (notif.linkTo) {
      setCurrentView(notif.linkTo);
    }
    setIsNotificationsOpen(false);
  };

  const handleRemoveNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter notifications for current user
  const myNotifications = notifications.filter(n => {
    return n.targetUserIds.includes('all') || n.targetUserIds.includes(user.id);
  });

  const unreadCount = myNotifications.filter(n => !n.isRead).length;

  // Departments
  const [departments, setDepartments] = useState<Department[]>([]);

  // Clients
  const [clients, setClients] = useState<Client[]>([]);

  const [renewals, setRenewals] = useState<Renewal[]>([]);

  // Users
  const [users, setUsers] = useState<User[]>([]);

  // --- Project & Task Data ---

  const [projects, setProjects] = useState<Project[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);

  // --- Attendance System ---

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchJson = async (url: string) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
          const text = await res.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            console.error(`Failed to parse JSON from ${url}:`, text.substring(0, 100));
            return [];
          }
        };

        const [
          usersRes, clientsRes, projectsRes, tasksRes, 
          invoicesRes, expensesRes, payrollRes, attendanceRes, leaveRes
        ] = await Promise.all([
          fetchJson('/api/users'),
          fetchJson('/api/clients'),
          fetchJson('/api/projects'),
          fetchJson('/api/tasks'),
          fetchJson('/api/invoices'),
          fetchJson('/api/expenses'),
          fetchJson('/api/payroll'),
          fetchJson('/api/attendance'),
          fetchJson('/api/leave_requests'),
        ]);

        if (Array.isArray(usersRes)) setUsers(usersRes);
        if (Array.isArray(clientsRes)) setClients(clientsRes);
        if (Array.isArray(projectsRes)) {
          setProjects(projectsRes.map(p => ({ ...p, teamMemberIds: p.teamMemberIds || [] })));
        }
        if (Array.isArray(tasksRes)) setTasks(tasksRes);
        if (Array.isArray(invoicesRes)) setInvoices(invoicesRes);
        if (Array.isArray(expensesRes)) setExpenses(expensesRes);
        if (Array.isArray(payrollRes)) setPayrollRecords(payrollRes);
        if (Array.isArray(attendanceRes)) setAttendanceRecords(attendanceRes);
        if (Array.isArray(leaveRes)) setLeaveRequests(leaveRes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);


  // --- Helper: Permission Check ---
  // Get current user's role definition
  const currentUserRoleDef = roles.find(r => r.name === user.role);
  const currentUserPermissions = currentUserRoleDef?.permissions || [];
  
  const hasPermission = (key: PermissionKey) => {
    if (user.role === 'super_admin') return true;
    if (currentUserPermissions.includes('all_access')) return true;
    return currentUserPermissions.includes(key);
  };


  // --- Handlers ---

  const handleUpdateUserWrapper = (updates: Partial<User>) => {
    // Update the master list if the user updates themselves or if they are admin updating others
    setUsers(users.map(u => u.id === user.id ? { ...u, ...updates } : u));
    // Propagate update to App.tsx to update auth state
    onUpdateUser(updates);
  };

  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const handleEditUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    if (selectedUser && selectedUser.id === id) {
      setSelectedUser({ ...selectedUser, ...updates } as User);
    }
    // If user edits themselves in UserManagement
    if (id === user.id) {
      onUpdateUser(updates);
    }
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    if (selectedUser && selectedUser.id === id) {
      setCurrentView('users');
      setSelectedUser(null);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setCurrentView('user-details');
  };

  // --- Role Handlers ---
  const handleAddRole = (role: Role) => setRoles([...roles, role]);
  
  const handleEditRole = (roleId: string, updates: Partial<Role>) => {
    setRoles(roles.map(r => r.id === roleId ? { ...r, ...updates } : r));
  };

  const handleUpdateRolePermissions = (roleId: string, newPermissions: PermissionKey[]) => {
    setRoles(roles.map(r => r.id === roleId ? { ...r, permissions: newPermissions } : r));
  };

  const handleDeleteRole = (id: string) => setRoles(roles.filter(r => r.id !== id));
  
  // --- Dept Handlers ---
  const handleAddDepartment = (dept: Department) => setDepartments([...departments, dept]);
  
  const handleEditDepartment = (deptId: string, updates: Partial<Department>) => {
    setDepartments(departments.map(d => d.id === deptId ? { ...d, ...updates } : d));
  };

  const handleDeleteDepartment = (id: string) => setDepartments(departments.filter(d => d.id !== id));

  // --- Client Handlers ---
  const handleAddClient = (client: Client) => setClients([...clients, client]);
  const handleEditClient = (id: string, updates: Partial<Client>) => setClients(clients.map(c => c.id === id ? {...c, ...updates} : c));
  const handleDeleteClient = (id: string) => setClients(clients.filter(c => c.id !== id));

  // --- Attendance Handlers ---
  const handleAddLeaveRequest = (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const newRequest: LeaveRequest = {
      ...request,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0]
    };
    setLeaveRequests([...leaveRequests, newRequest]);
  };

  const handleUpdateLeaveStatus = (id: string, status: 'approved' | 'rejected', comment?: string) => {
    setLeaveRequests(leaveRequests.map(req => req.id === id ? { ...req, status, adminComment: comment } : req));
  };

  const handleDeleteLeaveRequest = (id: string) => {
    setLeaveRequests(leaveRequests.filter(req => req.id !== id));
  };

  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords(prev => {
      const existing = prev.findIndex(r => r.id === record.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = record;
        return updated;
      }
      return [...prev, record];
    });
  };

  // --- Project Handlers ---

  const handleAddProject = (newProject: Omit<Project, 'id' | 'progress'>) => {
    const project: Project = {
      ...newProject,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0
    };
    setProjects([...projects, project]);
  };

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    // 1. Update Project Status
    setProjects(prevProjects => prevProjects.map(p => p.id === projectId ? { ...p, ...updates } : p));

    // 2. Automation: If Project is placed on Hold/Stopped, pause all tasks and notify team
    if (updates.status === 'on-hold' || updates.status === 'stopped' || updates.status === 'inactive') {
      const project = projects.find(p => p.id === projectId);
      
      // Update Tasks: Pause any in-progress tasks
      setTasks(prevTasks => prevTasks.map(t => {
        if (t.projectId === projectId && (t.status === 'in-progress' || t.status === 'testing') && !t.isPaused) {
          // Close active time log if exists
          const logs = [...(t.timeLogs || [])];
          const lastLog = logs[logs.length - 1];
          if (lastLog && !lastLog.end) {
            lastLog.end = Date.now();
          }
          return { ...t, isPaused: true, timeLogs: logs };
        }
        return t;
      }));

      // Notify Team Members
      if (project) {
        const statusLabel = updates.status === 'on-hold' ? 'On Hold' : updates.status === 'stopped' ? 'Stopped' : 'Inactive';
        
        // Notify Team Members
        if ((project.teamMemberIds || []).length > 0) {
          handleAddNotification({
            title: `Project ${statusLabel}: ${project.name}`,
            message: `The project has been marked as ${statusLabel} by Admin. All active tasks have been paused. You may proceed to your next assignment.`,
            type: 'warning',
            targetUserIds: project.teamMemberIds || [],
            linkTo: 'projects'
          });
        }
        
        // Notify Project Manager if not the one performing action (simplified check here)
        if (project.managerId && user.id !== project.managerId) {
           handleAddNotification({
            title: `Project Status Change: ${project.name}`,
            message: `Project status updated to ${statusLabel}.`,
            type: 'info',
            targetUserIds: [project.managerId],
            linkTo: 'projects'
          });
        }
      }
    }
  };

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setTasks(tasks.filter(t => t.projectId !== projectId));
  };

  const handleAddTask = (newTask: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'timeLogs' | 'isPaused'>) => {
    const task: Task = {
      ...newTask,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: user.id,
      timeLogs: [],
      isPaused: false
    };
    setTasks([...tasks, task]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks => {
      const newTasks = prevTasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
      
      // Auto update project progress if status changed
      if (updates.status) {
        const task = prevTasks.find(t => t.id === taskId);
        if(task) {
          const projectTasks = newTasks.filter(t => t.projectId === task.projectId);
          const doneCount = projectTasks.filter(t => t.status === 'done').length;
          const progress = projectTasks.length > 0 ? Math.round((doneCount / projectTasks.length) * 100) : 0;
          
          setProjects(prevProjects => prevProjects.map(p => p.id === task.projectId ? { ...p, progress } : p));
        }
      }
      return newTasks;
    });
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // --- Render ---

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            user={user} 
            tasks={tasks}
            projects={projects}
            notifications={myNotifications} 
            followUps={followUps}
            onMarkRead={handleMarkNotificationRead}
            onNavigate={(view) => setCurrentView(view)}
          />
        );
      
      case 'attendance':
        return (
          <AttendancePage 
            currentUser={user}
            users={users}
            departments={departments}
            leaveRequests={leaveRequests}
            attendanceRecords={attendanceRecords}
            onAddLeaveRequest={handleAddLeaveRequest}
            onUpdateLeaveStatus={handleUpdateLeaveStatus}
            onDeleteLeaveRequest={handleDeleteLeaveRequest}
            onUpdateAttendance={handleUpdateAttendance}
            canManageCalendar={hasPermission('calendar_manage')}
            onAddNotification={handleAddNotification}
          />
        );
      
      case 'clients':
        if (!hasPermission('client_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <ClientManagement 
            currentUser={user}
            clients={clients}
            users={users}
            projects={projects}
            onAddClient={handleAddClient}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
          />
        );

      case 'leads':
        if (!hasPermission('lead_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <LeadManagement 
            currentUser={user}
            leads={leads}
            setLeads={setLeads}
            moms={moms}
            setMoms={setMoms}
            followUps={followUps}
            setFollowUps={setFollowUps}
            onUpdateLead={handleUpdateLead}
          />
        );

      case 'payroll':
        if (!hasPermission('payroll_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <PayrollManagement 
            currentUser={user}
            users={users}
            payrollRecords={payrollRecords}
            salaryStructures={salaryStructures}
            onGeneratePayroll={handleGeneratePayroll}
            onUpdatePayrollStatus={handleUpdatePayrollStatus}
            onUpdateSalaryStructure={handleUpdateSalaryStructure}
            onUpdatePayrollRecord={handleUpdatePayrollRecord}
            onDeletePayroll={handleDeletePayroll}
          />
        );

      case 'expenses':
        if (!hasPermission('expense_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <ExpenseManagement 
            currentUser={user}
            userPermissions={currentUserPermissions}
            expenses={expenses}
            totalSalaryExpense={totalSalaryExpense}
            onAddExpense={handleAddExpense}
            onUpdateExpense={handleUpdateExpense}
            onDeleteExpense={handleDeleteExpense}
            onGenerateRecurring={handleGenerateRecurringExpenses}
          />
        );

      case 'currency':
        if (!hasPermission('currency_manage')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return <CurrencyConverter />;

      case 'marketing':
        if (!hasPermission('marketing_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return <DigitalMarketing currentUser={user} />;

      case 'finance':
        if (!hasPermission('finance_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <FinanceManagement 
            currentUser={user}
            userPermissions={currentUserPermissions}
            expenses={expenses}
            payrollRecords={payrollRecords}
            clients={clients}
            invoices={invoices}
            onAddInvoice={handleAddInvoice}
          />
        );

      case 'communication':
        if (!hasPermission('communication_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <CommunicationPage 
            currentUser={user}
            users={users}
            notifications={notifications}
            onMarkNotificationRead={handleMarkNotificationRead}
          />
        );

      case 'documents':
        if (!hasPermission('document_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <DocumentManagement 
            currentUser={user}
            users={users}
            userPermissions={currentUserPermissions}
          />
        );

      case 'compliance':
        if (!hasPermission('compliance_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <ComplianceLegal user={user} />
        );

      case 'resumes':
        if (!hasPermission('resume_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <ResumeManagement currentUser={user} users={users} />
        );

      case 'reports':
        if (!hasPermission('reports_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <ReportsPage 
            currentUser={user}
            userPermissions={currentUserPermissions}
            users={users}
            projects={projects}
            tasks={tasks}
            invoices={invoices}
            clients={clients}
            leads={leads}
            expenses={expenses}
            payrollRecords={payrollRecords}
          />
        );

      case 'renewals':
        if (!hasPermission('finance_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <RenewalManagement 
            currentUser={user}
            renewals={renewals}
            clients={clients}
            onAddRenewal={(r) => setRenewals([...renewals, { ...r, id: `ren_${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }])}
            onUpdateRenewal={(id, updates) => setRenewals(renewals.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r))}
            onDeleteRenewal={(id) => setRenewals(renewals.filter(r => r.id !== id))}
          />
        );

      case 'projects':
        if (!hasPermission('project_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        return (
          <ProjectManagement 
            currentUser={user}
            userPermissions={currentUserPermissions}
            users={users}
            projects={projects}
            tasks={tasks}
            clients={clients} // Passed for Project Creation
            onAddProject={handleAddProject}
            onUpdateProject={handleUpdateProject} // Passed new handler
            onDeleteProject={handleDeleteProject}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        );

      case 'users':
        // Only those with user_view can see this page
        if (!hasPermission('user_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        
        return (
          <EmployeeManagement 
            currentUser={user}
            users={users}
            roles={roles}
            departments={departments} 
            onAddUser={handleAddUser}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onViewUser={handleViewUser}
            
            onAddRole={handleAddRole}
            onEditRole={handleEditRole}
            onUpdateRole={handleUpdateRolePermissions}
            onDeleteRole={handleDeleteRole}
            
            onAddDepartment={handleAddDepartment}
            onEditDepartment={handleEditDepartment}
            onDeleteDepartment={handleDeleteDepartment}
          />
        );
      
      case 'user-details':
        if (!selectedUser) return <div className="text-center p-10">User not found</div>;
        if (selectedUser.id !== user.id && !hasPermission('user_view')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        
        return (
          <UserDetails 
            user={selectedUser} 
            onBack={() => setCurrentView('users')}
            onEdit={(u) => {
              if (hasPermission('user_manage')) setCurrentView('users');
            }}
            attendanceHistory={attendanceRecords.filter(r => r.userId === selectedUser.id)}
            leaveHistory={leaveRequests.filter(r => r.userId === selectedUser.id)}
            performanceHistory={performanceReviews.filter(r => r.userId === selectedUser.id)}
            tasks={tasks.filter(t => t.assignedTo.includes(selectedUser.id))}
          />
        );
      
      case 'settings':
        return <SettingsPage user={user} onUpdateUser={handleUpdateUserWrapper} />;
      
      default:
        // Handle views that are not allowed
        if (currentView === 'security' && !hasPermission('security_manage')) return <AccessDenied role={user.role} onBack={() => setCurrentView('dashboard')} />;
        
        return (
          <div className="flex items-center justify-center h-96 text-slate-400">
            <p>Module "{currentView}" is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-dark-950 flex overflow-hidden">
      <Sidebar 
        currentView={currentView === 'user-details' ? 'users' : currentView} 
        onChangeView={setCurrentView}
        userPermissions={currentUserPermissions}
        userRole={user.role}
      />

      <main className="flex-1 md:ml-64 transition-all h-full overflow-y-auto">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-dark-800 px-6 py-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="hidden sm:flex items-center bg-slate-100/50 dark:bg-dark-800/50 rounded-full px-4 py-2 w-64 border border-transparent focus-within:border-primary-300 focus-within:bg-white dark:focus-within:bg-dark-800 focus-within:ring-2 focus-within:ring-primary-100 transition-all">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Global Search..." 
                className="bg-transparent border-none outline-none text-sm w-full placeholder-slate-400 text-slate-700 dark:text-slate-200"
              />
            </div>
            
            <div className="flex sm:hidden font-bold text-slate-800 dark:text-white">ET-TOOL-V2</div>

            <div className="flex items-center space-x-4">
              
              {/* Notification Bell with Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} 
                  className={`relative p-2 rounded-full transition-colors ${isNotificationsOpen ? 'bg-primary-50 text-primary-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dark-800'}`}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-dark-900 rounded-xl shadow-2xl border border-slate-100 dark:border-dark-700 py-0 z-50 overflow-hidden ring-1 ring-black ring-opacity-5 animate-in fade-in slide-in-from-top-2 duration-200">
                     <div className="px-4 py-3 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center bg-slate-50/50 dark:bg-dark-800/50">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-sm">
                          <Bell size={16} className="text-primary-500" /> Notifications
                        </h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={handleMarkAllRead} 
                            className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                     </div>
                     
                     <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                        {myNotifications.length === 0 ? (
                           <div className="px-4 py-8 text-center flex flex-col items-center">
                              <div className="w-12 h-12 bg-slate-50 dark:bg-dark-800 rounded-full flex items-center justify-center mb-3">
                                <Bell size={20} className="text-slate-300 dark:text-slate-600" />
                              </div>
                              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No notifications yet</p>
                              <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">We'll let you know when something arrives.</p>
                           </div>
                        ) : (
                           <div className="divide-y divide-slate-50 dark:divide-dark-800">
                              {myNotifications.map(notif => (
                                 <div 
                                   key={notif.id} 
                                   onClick={() => handleNotificationClick(notif)} 
                                   className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors cursor-pointer group relative ${!notif.isRead ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
                                 >
                                    <div className="flex items-start gap-3">
                                       <div className={`mt-1 p-1.5 rounded-full flex-shrink-0 ${
                                          notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                                          notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                          notif.type === 'warning' ? 'bg-orange-100 text-orange-600' :
                                          'bg-blue-100 text-blue-600'
                                       }`}>
                                          {notif.type === 'alert' ? <AlertTriangle size={14} /> : 
                                           notif.type === 'success' ? <CheckCircle size={14} /> : 
                                           <Info size={14} />}
                                       </div>
                                       <div className="flex-1 min-w-0">
                                          <div className="flex justify-between items-start mb-0.5">
                                             <p className={`text-sm font-bold truncate pr-4 ${!notif.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {notif.title}
                                             </p>
                                             <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.timestamp}</span>
                                          </div>
                                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{notif.message}</p>
                                       </div>
                                    </div>
                                    
                                    {/* Delete action on hover */}
                                    <button 
                                      onClick={(e) => handleRemoveNotification(e, notif.id)}
                                      className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                      title="Remove"
                                    >
                                      <X size={12} />
                                    </button>

                                    {!notif.isRead && (
                                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500"></div>
                                    )}
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                     <div className="bg-slate-50 dark:bg-dark-800 p-2 text-center border-t border-slate-100 dark:border-dark-700">
                        <button onClick={() => { setCurrentView('dashboard'); setIsNotificationsOpen(false); }} className="text-xs text-slate-500 hover:text-primary-600 font-medium transition-colors">
                           View Dashboard
                        </button>
                     </div>
                  </div>
                )}
              </div>
              
              <div className="h-8 w-px bg-slate-200 dark:bg-dark-700 mx-2"></div>

              <div className="relative group cursor-pointer flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.username}</p>
                  <div className="flex items-center gap-1 justify-end">
                     <span className={`w-2 h-2 rounded-full ${user.role === 'super_admin' ? 'bg-purple-500' : 'bg-primary-500'}`}></span>
                     <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white dark:border-dark-700 shadow-sm overflow-hidden">
                   <img src={user.avatar || "https://picsum.photos/200"} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <ChevronDown size={16} className="text-slate-400" />

                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-dark-900 rounded-xl shadow-lg border border-slate-100 dark:border-dark-700 py-1 hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-dark-800 sm:hidden">
                     <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.username}</p>
                  </div>
                  <button 
                    onClick={() => setCurrentView('settings')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-primary-600"
                  >
                    Profile
                  </button>
                  <button 
                    onClick={() => setCurrentView('settings')}
                    className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800 hover:text-primary-600"
                  >
                    Settings
                  </button>
                  <div className="border-t border-slate-100 dark:border-dark-800 my-1"></div>
                  <button 
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default HomePage;