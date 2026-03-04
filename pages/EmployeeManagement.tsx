import React, { useState } from 'react';
import { User, Role, Department, Permission, SystemRole, PermissionKey, EmployeeDocument, KPI, LeaveBalance } from '../types';
import { Search, Plus, Edit2, Trash2, Mail, Shield, CheckCircle, XCircle, Building, Eye, AlertTriangle, UserPlus, Briefcase, Key, Calendar, DollarSign, Lock, Settings, FileText, BarChart2, Clock, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import AlertModal from '../components/ui/AlertModal';
import Input from '../components/ui/Input';

// --- Static Data for Corporate Structure ---

const SYSTEM_PERMISSIONS: { key: PermissionKey; label: string; description: string }[] = [
  { key: 'all_access', label: 'Super Admin Access', description: 'Full system control' },
  { key: 'view_dashboard', label: 'View Dashboard', description: 'Access main dashboard' },

  // Calendar
  { key: 'calendar_view', label: 'View Calendar', description: 'See attendance and schedules' },
  { key: 'calendar_manage', label: 'Manage Calendar', description: 'Create events and schedules' },

  // User Management
  { key: 'user_view', label: 'View Users', description: 'See employee directory' },
  { key: 'user_create', label: 'Create Users', description: 'Add new employees' },
  { key: 'user_edit', label: 'Edit Users', description: 'Modify employee profiles' },
  { key: 'user_delete', label: 'Delete Users', description: 'Remove employees' },
  { key: 'user_manage', label: 'Manage Users (Full)', description: 'Full control over users' },
  { key: 'role_manage', label: 'Manage Roles', description: 'Configure permissions' },

  // Payroll
  { key: 'payroll_view', label: 'View Payroll', description: 'See salary details' },
  { key: 'payroll_manage', label: 'Manage Payroll', description: 'Run payroll and lock attendance' },

  // Projects
  { key: 'project_view', label: 'View Projects', description: 'See project boards' },
  { key: 'project_create', label: 'Create Projects', description: 'Add new projects' },
  { key: 'project_edit', label: 'Edit Projects', description: 'Modify project details' },
  { key: 'project_delete', label: 'Delete Projects', description: 'Remove projects' },
  { key: 'project_manage', label: 'Manage Projects (Full)', description: 'Full control over projects' },
  { key: 'project_access_restricted', label: 'Restrict Project Access', description: 'Limit view to assigned projects only' },

  // Clients
  { key: 'client_view', label: 'View Clients', description: 'See client directory' },
  { key: 'client_create', label: 'Create Clients', description: 'Add new clients' },
  { key: 'client_edit', label: 'Edit Clients', description: 'Modify client details' },
  { key: 'client_delete', label: 'Delete Clients', description: 'Remove clients' },
  { key: 'client_manage', label: 'Manage Clients (Full)', description: 'Full control over clients' },

  // Leads
  { key: 'lead_view', label: 'View Leads', description: 'See sales leads' },
  { key: 'lead_create', label: 'Create Leads', description: 'Add new leads' },
  { key: 'lead_edit', label: 'Edit Leads', description: 'Modify lead details' },
  { key: 'lead_delete', label: 'Delete Leads', description: 'Remove leads' },
  { key: 'lead_manage', label: 'Manage Leads (Full)', description: 'Full control over leads' },

  // Finance
  { key: 'finance_view', label: 'View Finance', description: 'See invoices and transactions' },
  { key: 'finance_create', label: 'Create Finance Records', description: 'Add invoices/transactions' },
  { key: 'finance_edit', label: 'Edit Finance Records', description: 'Modify financial records' },
  { key: 'finance_delete', label: 'Delete Finance Records', description: 'Remove financial records' },
  { key: 'finance_manage', label: 'Manage Finance (Full)', description: 'Full control over finance' },
  { key: 'finance_view_profit', label: 'View Profit/Revenue', description: 'Access sensitive financial reports' },
  { key: 'currency_manage', label: 'Manage Currency', description: 'Configure exchange rates' },

  // Expenses
  { key: 'expense_view', label: 'View Expenses', description: 'See expense reports' },
  { key: 'expense_create', label: 'Create Expenses', description: 'Submit new expenses' },
  { key: 'expense_edit', label: 'Edit Expenses', description: 'Modify expense records' },
  { key: 'expense_delete', label: 'Delete Expenses', description: 'Remove expense records' },
  { key: 'expense_manage', label: 'Manage Expenses (Full)', description: 'Full control over expenses' },

  // Marketing
  { key: 'marketing_view', label: 'View Marketing', description: 'See campaigns' },
  { key: 'marketing_manage', label: 'Manage Marketing', description: 'Full control over campaigns' },

  // Reports & Security
  { key: 'reports_view', label: 'View Reports', description: 'Access system analytics' },
  { key: 'security_manage', label: 'Security Admin', description: 'Manage passwords and logs' },
];

const DEFAULT_USER_FORM: Partial<User> = {
  employeeCode: '',
  username: '',
  firstName: '',
  lastName: '',
  officialEmail: '',
  mobileNumber: '',
  gender: 'male',
  dateOfBirth: '',
  status: 'active',
  userType: 'employee',
  employmentStatus: 'probation',
  department: '',
  position: '',
  role: 'employee',
  workMode: 'office',
  workLocation: 'HQ',
  joinDate: new Date().toISOString().split('T')[0],
  dataVisibilityScope: 'self',
  attendanceMode: 'all',
  ipRestriction: true,
  internDetails: {
    type: 'paid',
    startDate: '',
    endDate: '',
    mentorId: '',
    conversionEligibility: false
  },
  payrollDetails: {
    salaryType: 'monthly',
    isOvertimeEligible: false
  },
  documents: [],
  kpis: [],
  leaveBalance: { sick: 10, casual: 10, earned: 0, unpaid: 0 }
};

interface EmployeeManagementProps {
  currentUser: User;
  userPermissions: PermissionKey[];
  users: User[];
  roles: Role[];
  departments: Department[];
  onAddUser: (user: User) => void;
  onEditUser: (id: string, updates: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onViewUser: (user: User) => void;
  
  onAddRole: (role: Role) => void;
  onEditRole: (roleId: string, updates: Partial<Role>) => void;
  onUpdateRole: (roleId: string, permissions: PermissionKey[]) => void;
  onDeleteRole: (roleId: string) => void;
  
  onAddDepartment: (dept: Department) => void;
  onEditDepartment: (deptId: string, updates: Partial<Department>) => void;
  onDeleteDepartment: (deptId: string) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ 
  currentUser,
  userPermissions,
  users, 
  roles, 
  departments,
  onAddUser, 
  onEditUser, 
  onDeleteUser, 
  onViewUser,
  onAddRole,
  onEditRole,
  onUpdateRole,
  onDeleteRole,
  onAddDepartment,
  onEditDepartment,
  onDeleteDepartment
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canCreateUser = isSuperAdmin || userPermissions.includes('user_create');
  const canEditUser = isSuperAdmin || userPermissions.includes('user_edit');
  const canDeleteUser = isSuperAdmin || userPermissions.includes('user_delete');
  const canManageRoles = isSuperAdmin || userPermissions.includes('role_manage');

  const [currentView, setCurrentView] = useState<'users' | 'roles' | 'depts'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isRoleFormModalOpen, setIsRoleFormModalOpen] = useState(false);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  
  // User Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<Partial<User>>(DEFAULT_USER_FORM);
  const [userFormTab, setUserFormTab] = useState<'identity' | 'contact' | 'employment' | 'documents' | 'performance' | 'leaves' | 'payroll'>('identity');

  // Role Editing State
  const [roleForm, setRoleForm] = useState<{ id?: string, name: string, displayName: string, description: string }>({ name: '', displayName: '', description: '' });
  const [editingPermissionRole, setEditingPermissionRole] = useState<Role | null>(null);
  const [tempPermissions, setTempPermissions] = useState<PermissionKey[]>([]);

  // Dept Editing State
  const [deptForm, setDeptForm] = useState<{ id?: string, name: string, description: string, headOfDepartmentId: string }>({ name: '', description: '', headOfDepartmentId: '' });

  // Popup States
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [alertState, setAlertState] = useState<{ isOpen: boolean; title: string; message: string; }>({ isOpen: false, title: '', message: '' });

  // Filter Logic
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.officialEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.employeeCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Handlers ---

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserForm({
      ...DEFAULT_USER_FORM,
      employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`, // Auto-gen
      internDetails: { ...DEFAULT_USER_FORM.internDetails } as any,
      payrollDetails: { ...DEFAULT_USER_FORM.payrollDetails } as any,
      documents: [],
      kpis: [],
      leaveBalance: { sick: 10, casual: 10, earned: 0, unpaid: 0 }
    });
    setUserFormTab('identity');
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUserId(user.id);
    setUserForm(JSON.parse(JSON.stringify(user)));
    setUserFormTab('identity');
    setIsUserModalOpen(true);
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.userType === 'intern' && !userForm.internDetails?.endDate) {
       setAlertState({ isOpen: true, title: 'Validation Error', message: 'Internship End Date is mandatory for auto-expiry.' });
       return;
    }

    const userData = {
      ...userForm,
      internDetails: userForm.userType === 'intern' ? userForm.internDetails : undefined,
      modifiedBy: currentUser.username, 
      modifiedAt: new Date().toISOString()
    } as User;

    if (editingUserId) {
      onEditUser(editingUserId, userData);
    } else {
      onAddUser({
        ...userData,
        id: Math.random().toString(36).substr(2, 9),
        createdBy: currentUser.username,
        createdAt: new Date().toISOString(),
        passwordHash: 'hashed_default_123', 
        lastLogin: 'Never'
      });
    }
    setIsUserModalOpen(false);
  };

  // --- Role Handlers ---
  
  const handleOpenAddRole = () => {
    setRoleForm({ name: '', displayName: '', description: '' });
    setIsRoleFormModalOpen(true);
  };

  const handleOpenEditRole = (role: Role) => {
    setRoleForm({ id: role.id, name: role.name as string, displayName: role.displayName, description: role.description });
    setIsRoleFormModalOpen(true);
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roleForm.id) {
      onEditRole(roleForm.id, {
        displayName: roleForm.displayName,
        description: roleForm.description,
        // Don't change internal name if it's system, but for custom roles we might allow it (keeping simple: only display changes)
      });
    } else {
      // Create New
      const internalName = roleForm.displayName.toLowerCase().replace(/\s+/g, '_');
      onAddRole({
        id: Math.random().toString(36).substr(2, 9),
        name: internalName,
        displayName: roleForm.displayName,
        description: roleForm.description,
        permissions: [] // Start with empty permissions
      });
    }
    setIsRoleFormModalOpen(false);
  };

  const handleEditPermissions = (role: Role) => {
    if (!isSuperAdmin) return;
    setEditingPermissionRole(role);
    setTempPermissions([...role.permissions]);
    setIsPermissionModalOpen(true);
  };

  const handleSavePermissions = () => {
    if (editingPermissionRole) {
      onUpdateRole(editingPermissionRole.id, tempPermissions);
      setIsPermissionModalOpen(false);
    }
  };

  const togglePermission = (key: PermissionKey) => {
    if (tempPermissions.includes(key)) {
      setTempPermissions(tempPermissions.filter(p => p !== key));
    } else {
      setTempPermissions([...tempPermissions, key]);
    }
  };

  // --- Dept Handlers ---

  const handleOpenAddDept = () => {
    setDeptForm({ name: '', description: '', headOfDepartmentId: '' });
    setIsDeptModalOpen(true);
  };

  const handleOpenEditDept = (dept: Department) => {
    setDeptForm({ id: dept.id, name: dept.name, description: dept.description || '', headOfDepartmentId: dept.headOfDepartmentId || '' });
    setIsDeptModalOpen(true);
  };

  const handleDeptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deptForm.id) {
       onEditDepartment(deptForm.id, {
         name: deptForm.name,
         description: deptForm.description,
         headOfDepartmentId: deptForm.headOfDepartmentId
       });
    } else {
       onAddDepartment({
         id: Math.random().toString(36).substr(2, 9),
         name: deptForm.name,
         description: deptForm.description,
         headOfDepartmentId: deptForm.headOfDepartmentId
       });
    }
    setIsDeptModalOpen(false);
  };


  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'hr_admin': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'payroll_admin': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'intern': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'contract': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  // --- Render Functions ---

  const renderUserForm = () => {
     // (Existing implementation unchanged, keeping it compact for response)
     // ... (Previous User Form Logic) ...
     return (
       <form onSubmit={handleUserSubmit} className="flex flex-col h-[70vh]">
          {/* ... tabs ... */}
          <div className="flex border-b border-slate-200 mb-4 overflow-x-auto">
             <button type="button" onClick={() => setUserFormTab('identity')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${userFormTab === 'identity' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500'}`}>1. Identity</button>
             <button type="button" onClick={() => setUserFormTab('contact')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${userFormTab === 'contact' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500'}`}>2. Contact</button>
             <button type="button" onClick={() => setUserFormTab('employment')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${userFormTab === 'employment' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500'}`}>3. Role</button>
             <button type="button" onClick={() => setUserFormTab('documents')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${userFormTab === 'documents' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500'}`}>4. Docs</button>
             <button type="button" onClick={() => setUserFormTab('performance')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${userFormTab === 'performance' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500'}`}>5. Performance</button>
             <button type="button" onClick={() => setUserFormTab('leaves')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${userFormTab === 'leaves' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500'}`}>6. Leaves</button>
             <button type="button" onClick={() => setUserFormTab('payroll')} className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap ${userFormTab === 'payroll' ? 'border-primary-500 text-primary-700' : 'border-transparent text-slate-500'}`}>7. Payroll</button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4">
             {/* Simplified rendering of tabs for brevity in this specific update, reusing logic from previous step */}
             {/* TAB 1: IDENTITY */}
             {userFormTab === 'identity' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">First Name *</label><input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Last Name *</label><input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee Code</label><input type="text" className="w-full p-2 bg-slate-100 border border-slate-300 rounded-lg" value={userForm.employeeCode} readOnly /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Gender *</label><select className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.gender} onChange={e => setUserForm({...userForm, gender: e.target.value as any})}><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date of Birth *</label><input required type="date" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.dateOfBirth} onChange={e => setUserForm({...userForm, dateOfBirth: e.target.value})} /></div>
                </div>
             )}
             {/* TAB 2: CONTACT */}
             {userFormTab === 'contact' && (
               <div className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Official Email</label><input required type="email" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.officialEmail} onChange={e => setUserForm({...userForm, officialEmail: e.target.value, username: e.target.value})} /></div>
                   <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mobile</label><input required type="tel" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.mobileNumber} onChange={e => setUserForm({...userForm, mobileNumber: e.target.value})} /></div>
                 </div>
               </div>
             )}
             {/* TAB 3: EMPLOYMENT */}
             {userFormTab === 'employment' && (
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">User Type</label><select className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.userType} onChange={e => setUserForm({...userForm, userType: e.target.value as any})}><option value="employee">Employee</option><option value="intern">Intern</option><option value="contract">Contractor</option><option value="consultant">Consultant</option></select></div>
                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Role</label><select className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value as any})}>{roles.map(r => <option key={r.id} value={r.name}>{r.displayName}</option>)}</select></div>
                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department</label><select className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.department} onChange={e => setUserForm({...userForm, department: e.target.value})}><option value="">Select</option>{departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}</select></div>
                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Manager</label><select className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.reportingManagerId} onChange={e => setUserForm({...userForm, reportingManagerId: e.target.value})}><option value="">Select</option>{users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}</select></div>
                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label><select className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.status} onChange={e => setUserForm({...userForm, status: e.target.value as any})}><option value="active">Active</option><option value="inactive">Inactive</option></select></div>
                  </div>
               </div>
             )}
             {/* TAB 4: DOCUMENTS */}
             {userFormTab === 'documents' && (
                <div className="space-y-4">
                   <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-bold text-slate-700 uppercase">Employee Documents</h3>
                      <Button type="button" size="sm" variant="secondary" onClick={() => {
                         const newDoc: EmployeeDocument = {
                            id: Math.random().toString(36).substr(2, 9),
                            name: 'New Document',
                            type: 'other',
                            url: '#',
                            uploadedAt: new Date().toISOString()
                         };
                         setUserForm({...userForm, documents: [...(userForm.documents || []), newDoc]});
                      }}>
                        <Upload size={14} className="mr-1" /> Upload
                      </Button>
                   </div>
                   
                   {(!userForm.documents || userForm.documents.length === 0) ? (
                      <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                         <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                         <p className="text-sm text-slate-500">No documents uploaded yet.</p>
                      </div>
                   ) : (
                      <div className="space-y-2">
                         {userForm.documents.map((doc, idx) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                               <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                     <FileText size={16} />
                                  </div>
                                  <div>
                                     <input 
                                        type="text" 
                                        className="text-sm font-medium text-slate-900 border-none p-0 focus:ring-0 w-40" 
                                        value={doc.name}
                                        onChange={(e) => {
                                           const newDocs = [...(userForm.documents || [])];
                                           newDocs[idx].name = e.target.value;
                                           setUserForm({...userForm, documents: newDocs});
                                        }}
                                     />
                                     <div className="text-xs text-slate-500 capitalize">{doc.type} • {new Date(doc.uploadedAt).toLocaleDateString()}</div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-2">
                                  <select 
                                     className="text-xs border-slate-200 rounded p-1"
                                     value={doc.type}
                                     onChange={(e) => {
                                        const newDocs = [...(userForm.documents || [])];
                                        newDocs[idx].type = e.target.value as any;
                                        setUserForm({...userForm, documents: newDocs});
                                     }}
                                  >
                                     <option value="offer_letter">Offer Letter</option>
                                     <option value="contract">Contract</option>
                                     <option value="id_proof">ID Proof</option>
                                     <option value="resume">Resume</option>
                                     <option value="other">Other</option>
                                  </select>
                                  <button type="button" onClick={() => {
                                     const newDocs = userForm.documents?.filter(d => d.id !== doc.id);
                                     setUserForm({...userForm, documents: newDocs});
                                  }} className="text-red-400 hover:text-red-600 p-1">
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             )}

             {/* TAB 5: PERFORMANCE */}
             {userFormTab === 'performance' && (
                <div className="space-y-4">
                   <div className="flex justify-between items-center mb-2">
                      <h3 className="text-sm font-bold text-slate-700 uppercase">Key Performance Indicators (KPIs)</h3>
                      <Button type="button" size="sm" variant="secondary" onClick={() => {
                         const newKPI: KPI = {
                            id: Math.random().toString(36).substr(2, 9),
                            title: 'New KPI',
                            description: '',
                            targetValue: 100,
                            currentValue: 0,
                            unit: '%',
                            weightage: 10,
                            status: 'pending',
                            period: 'quarterly'
                         };
                         setUserForm({...userForm, kpis: [...(userForm.kpis || []), newKPI]});
                      }}>
                        <Plus size={14} className="mr-1" /> Add KPI
                      </Button>
                   </div>

                   {(!userForm.kpis || userForm.kpis.length === 0) ? (
                      <div className="text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                         <BarChart2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                         <p className="text-sm text-slate-500">No KPIs defined for this employee.</p>
                      </div>
                   ) : (
                      <div className="space-y-3">
                         {userForm.kpis.map((kpi, idx) => (
                            <div key={kpi.id} className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
                               <div className="flex justify-between items-start">
                                  <input 
                                     type="text" 
                                     className="font-bold text-slate-900 border-b border-transparent focus:border-primary-500 focus:outline-none w-full mr-2"
                                     value={kpi.title}
                                     onChange={(e) => {
                                        const newKPIs = [...(userForm.kpis || [])];
                                        newKPIs[idx].title = e.target.value;
                                        setUserForm({...userForm, kpis: newKPIs});
                                     }}
                                     placeholder="KPI Title"
                                  />
                                  <button type="button" onClick={() => {
                                     const newKPIs = userForm.kpis?.filter(k => k.id !== kpi.id);
                                     setUserForm({...userForm, kpis: newKPIs});
                                  }} className="text-slate-400 hover:text-red-500">
                                     <Trash2 size={14} />
                                  </button>
                               </div>
                               
                               <div className="grid grid-cols-2 gap-4">
                                  <div>
                                     <label className="text-xs text-slate-500">Target ({kpi.unit})</label>
                                     <input 
                                        type="number" 
                                        className="w-full text-sm border border-slate-200 rounded p-1"
                                        value={kpi.targetValue}
                                        onChange={(e) => {
                                           const newKPIs = [...(userForm.kpis || [])];
                                           newKPIs[idx].targetValue = Number(e.target.value);
                                           setUserForm({...userForm, kpis: newKPIs});
                                        }}
                                     />
                                  </div>
                                  <div>
                                     <label className="text-xs text-slate-500">Weightage (%)</label>
                                     <input 
                                        type="number" 
                                        className="w-full text-sm border border-slate-200 rounded p-1"
                                        value={kpi.weightage}
                                        onChange={(e) => {
                                           const newKPIs = [...(userForm.kpis || [])];
                                           newKPIs[idx].weightage = Number(e.target.value);
                                           setUserForm({...userForm, kpis: newKPIs});
                                        }}
                                     />
                                  </div>
                               </div>
                               
                               <div>
                                  <label className="text-xs text-slate-500">Description</label>
                                  <textarea 
                                     className="w-full text-sm border border-slate-200 rounded p-1"
                                     rows={2}
                                     value={kpi.description}
                                     onChange={(e) => {
                                        const newKPIs = [...(userForm.kpis || [])];
                                        newKPIs[idx].description = e.target.value;
                                        setUserForm({...userForm, kpis: newKPIs});
                                     }}
                                  />
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             )}

             {/* TAB 6: LEAVES */}
             {userFormTab === 'leaves' && (
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-slate-700 uppercase mb-2">Leave Balance Configuration</h3>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                         <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Casual Leaves</label>
                         <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-emerald-200 rounded-lg text-emerald-900 font-bold"
                            value={userForm.leaveBalance?.casual || 0}
                            onChange={(e) => setUserForm({...userForm, leaveBalance: {...userForm.leaveBalance!, casual: Number(e.target.value)}})}
                         />
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                         <label className="block text-xs font-bold text-blue-800 uppercase mb-1">Sick Leaves</label>
                         <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-blue-200 rounded-lg text-blue-900 font-bold"
                            value={userForm.leaveBalance?.sick || 0}
                            onChange={(e) => setUserForm({...userForm, leaveBalance: {...userForm.leaveBalance!, sick: Number(e.target.value)}})}
                         />
                      </div>
                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                         <label className="block text-xs font-bold text-purple-800 uppercase mb-1">Earned Leaves</label>
                         <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-purple-200 rounded-lg text-purple-900 font-bold"
                            value={userForm.leaveBalance?.earned || 0}
                            onChange={(e) => setUserForm({...userForm, leaveBalance: {...userForm.leaveBalance!, earned: Number(e.target.value)}})}
                         />
                      </div>
                      <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                         <label className="block text-xs font-bold text-orange-800 uppercase mb-1">Unpaid Leaves Taken</label>
                         <input 
                            type="number" 
                            className="w-full p-2 bg-white border border-orange-200 rounded-lg text-orange-900 font-bold"
                            value={userForm.leaveBalance?.unpaid || 0}
                            onChange={(e) => setUserForm({...userForm, leaveBalance: {...userForm.leaveBalance!, unpaid: Number(e.target.value)}})}
                         />
                      </div>
                   </div>
                </div>
             )}

             {/* TAB 7: PAYROLL */}
             {userFormTab === 'payroll' && (
                <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Salary Type</label><select className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.payrollDetails?.salaryType} onChange={e => setUserForm({...userForm, payrollDetails: {...userForm.payrollDetails!, salaryType: e.target.value as any}})}><option value="monthly">Monthly</option><option value="hourly">Hourly</option></select></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bank Account</label><input type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.payrollDetails?.bankAccount || ''} onChange={e => setUserForm({...userForm, payrollDetails: {...userForm.payrollDetails!, bankAccount: e.target.value}})} placeholder="Account Number" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">IFSC Code</label><input type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.payrollDetails?.ifsc || ''} onChange={e => setUserForm({...userForm, payrollDetails: {...userForm.payrollDetails!, ifsc: e.target.value}})} placeholder="IFSC" /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">PAN Number</label><input type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={userForm.payrollDetails?.pan || ''} onChange={e => setUserForm({...userForm, payrollDetails: {...userForm.payrollDetails!, pan: e.target.value}})} placeholder="PAN" /></div>
                   </div>
                   <div className="flex items-center gap-2 mt-4">
                      <input 
                         type="checkbox" 
                         id="overtime"
                         checked={userForm.payrollDetails?.isOvertimeEligible || false} 
                         onChange={e => setUserForm({...userForm, payrollDetails: {...userForm.payrollDetails!, isOvertimeEligible: e.target.checked}})}
                         className="rounded text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="overtime" className="text-sm font-medium text-slate-700">Eligible for Overtime Pay</label>
                   </div>
                </div>
             )}
          </div>
          
          <div className="border-t border-slate-200 pt-4 flex justify-end gap-3 mt-auto">
             <Button type="button" variant="secondary" onClick={() => setIsUserModalOpen(false)}>Cancel</Button>
             <Button type="submit">{editingUserId ? 'Update User' : 'Create User'}</Button>
          </div>
       </form>
     );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Sub-nav */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">User Management & Access Control</h1>
           <p className="text-slate-500 mt-1">Manage corporate users, define RBAC roles, and structured permissions.</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
           <button onClick={() => setCurrentView('users')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${currentView === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Users</button>
           
           {/* RBAC: Only show Role config to those with role_manage permission */}
           {canManageRoles && (
              <button onClick={() => setCurrentView('roles')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${currentView === 'roles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Roles & Perms</button>
           )}
           
           <button onClick={() => setCurrentView('depts')} className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${currentView === 'depts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Departments</button>
        </div>
      </div>

      {/* VIEW: USERS LIST */}
      {currentView === 'users' && (
        <>
          <div className="flex justify-between items-center gap-4">
            <div className="relative flex-1 max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
               <input 
                 type="text" 
                 placeholder="Search by name, ID, or email..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm shadow-sm"
               />
            </div>
            {canCreateUser && (
              <Button onClick={handleOpenAddUser}>
                <UserPlus className="w-4 h-4 mr-2" /> Add Employee/Intern
              </Button>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-700 font-bold tracking-wider">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Role & Dept</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img 
                            className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm" 
                            src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                            alt="" 
                          />
                          <div className="ml-4">
                            <div className="font-semibold text-slate-900">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-slate-500 font-mono">{user.employeeCode}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold capitalize mb-1 border ${getRoleBadgeColor(user.role)}`}>
                           {user.role.replace('_', ' ')}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">{user.department}</div>
                      </td>
                      <td className="px-6 py-4">
                         <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          user.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          user.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                         }`}>
                           <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                           <span className="capitalize">{user.status}</span>
                         </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-sm text-slate-700 capitalize flex items-center gap-1">
                           {user.userType === 'intern' && <Briefcase size={12} className="text-orange-500" />}
                           {user.userType}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end space-x-2">
                           <button onClick={() => onViewUser(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={16} /></button>
                           {canEditUser && (
                             <button onClick={() => handleOpenEditUser(user)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                           )}
                           {canDeleteUser && (
                             <button onClick={() => setConfirmState({
                               isOpen: true, 
                                 title: 'Deactivate User?', 
                                 message: 'This will revoke all access. Data will be preserved for audit.',
                                 onConfirm: () => onDeleteUser(user.id)
                               })} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                           )}
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* VIEW: ROLES LIST */}
      {currentView === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
             <Button onClick={handleOpenAddRole}>
               <Plus size={16} className="mr-2" /> Create New Role
             </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {roles.map(role => (
               <div key={role.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow relative group">
                  <div className="flex justify-between items-start mb-4">
                     <div className={`p-2 rounded-lg ${getRoleBadgeColor(role.name as string).split(' ')[0]}`}>
                       <Shield className={`w-6 h-6 ${getRoleBadgeColor(role.name as string).split(' ')[1]}`} />
                     </div>
                     <div className="flex gap-1">
                       {/* Role Configuration Buttons */}
                       <button onClick={() => handleEditPermissions(role)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors" title="Configure Permissions">
                          <Settings size={16} />
                       </button>
                       {!role.isSystem && (
                         <>
                           <button onClick={() => handleOpenEditRole(role)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit Role Details">
                              <Edit2 size={16} />
                           </button>
                           <button onClick={() => setConfirmState({isOpen: true, title: 'Delete Role?', message: 'Users assigned to this role will lose their permissions.', onConfirm: () => onDeleteRole(role.id)})} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete Role">
                              <Trash2 size={16} />
                           </button>
                         </>
                       )}
                     </div>
                  </div>
                  {role.isSystem && role.name === 'super_admin' && (
                    <span className="absolute top-5 right-12 text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded border border-purple-200">ROOT</span>
                  )}
                  <h3 className="text-lg font-bold text-slate-900 mb-1">{role.displayName}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-1">{role.description}</p>
                  
                  <div className="border-t border-slate-100 pt-3 mt-auto">
                     <p className="text-xs font-bold text-slate-400 uppercase mb-2">Access Capabilities</p>
                     <div className="flex flex-wrap gap-1">
                       {role.permissions.includes('all_access') ? (
                         <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-bold">ALL SYSTEMS</span>
                       ) : (
                         role.permissions.length > 0 ? (
                           <>
                             {role.permissions.slice(0, 4).map((p, i) => (
                               <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded">
                                 {p.replace('_', ' ')}
                               </span>
                             ))}
                             {role.permissions.length > 4 && <span className="text-[10px] px-1.5 py-0.5 text-slate-400">+{role.permissions.length - 4} more</span>}
                           </>
                         ) : <span className="text-[10px] text-slate-400 italic">No access</span>
                       )}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* VIEW: DEPARTMENTS LIST */}
      {currentView === 'depts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <h2 className="text-lg font-bold text-slate-800">Departments</h2>
             {isSuperAdmin && (
                <Button onClick={handleOpenAddDept}>
                  <Plus size={16} className="mr-2" /> Add Department
                </Button>
             )}
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-700 font-bold tracking-wider">
                   <th className="px-6 py-4">Department Name</th>
                   <th className="px-6 py-4">Description</th>
                   <th className="px-6 py-4">Head of Dept</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {departments.map(dept => {
                    const headUser = users.find(u => u.id === dept.headOfDepartmentId);
                    return (
                      <tr key={dept.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold text-slate-900">{dept.name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{dept.description}</td>
                        <td className="px-6 py-4">
                           {headUser ? (
                              <div className="flex items-center gap-2">
                                <img src={headUser.avatar || `https://ui-avatars.com/api/?name=${headUser.username}`} className="w-6 h-6 rounded-full" />
                                <span className="text-sm font-medium text-slate-700">{headUser.firstName} {headUser.lastName}</span>
                              </div>
                           ) : <span className="text-xs text-slate-400 italic">Unassigned</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                           {isSuperAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                 <button onClick={() => handleOpenEditDept(dept)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                 <button onClick={() => setConfirmState({isOpen: true, title: 'Delete Department?', message: 'This cannot be undone.', onConfirm: () => onDeleteDepartment(dept.id)})} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                              </div>
                           ) : <span className="text-xs text-slate-400"><Lock size={12} className="inline mr-1" /> Locked</span>}
                        </td>
                      </tr>
                    );
                  })}
               </tbody>
             </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} title={editingUserId ? "Edit Corporate Profile" : "Onboard New User"}>
        {renderUserForm()}
      </Modal>

      <Modal isOpen={isPermissionModalOpen} onClose={() => setIsPermissionModalOpen(false)} title={`Configure Permissions: ${editingPermissionRole?.displayName}`}>
         <div className="space-y-4">
           <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm text-slate-600">
             Granting permissions to this role will affect all users assigned to it immediately.
           </div>
           
           <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
             <div className="space-y-1">
                {SYSTEM_PERMISSIONS.map((perm) => (
                  <label key={perm.key} className="flex items-start p-3 hover:bg-slate-50 rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-colors">
                    <input 
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                      checked={tempPermissions.includes(perm.key)}
                      onChange={() => togglePermission(perm.key)}
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-bold text-slate-900">{perm.label}</span>
                      <span className="block text-xs text-slate-500">{perm.description}</span>
                    </div>
                  </label>
                ))}
             </div>
           </div>
           
           <div className="flex justify-end pt-4 border-t border-slate-100">
             <Button type="button" variant="secondary" onClick={() => setIsPermissionModalOpen(false)} className="mr-2">Cancel</Button>
             <Button onClick={handleSavePermissions}>Save Configuration</Button>
           </div>
         </div>
      </Modal>

      {/* Modal: Create/Edit Role */}
      <Modal isOpen={isRoleFormModalOpen} onClose={() => setIsRoleFormModalOpen(false)} title={roleForm.id ? "Edit Role" : "Create New Role"}>
         <form onSubmit={handleRoleSubmit} className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role Name</label>
             <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={roleForm.displayName} onChange={e => setRoleForm({...roleForm, displayName: e.target.value})} placeholder="e.g. Senior Technician" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
             <textarea required className="w-full p-2 border border-slate-300 rounded-lg" value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})} rows={3} placeholder="Describe the responsibilities..." />
           </div>
           <div className="flex justify-end pt-2">
              <Button type="submit">{roleForm.id ? 'Update Role' : 'Create Role'}</Button>
           </div>
         </form>
      </Modal>

      {/* Modal: Create/Edit Dept */}
      <Modal isOpen={isDeptModalOpen} onClose={() => setIsDeptModalOpen(false)} title={deptForm.id ? "Edit Department" : "Add Department"}>
         <form onSubmit={handleDeptSubmit} className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Department Name</label>
             <input required type="text" className="w-full p-2 border border-slate-300 rounded-lg" value={deptForm.name} onChange={e => setDeptForm({...deptForm, name: e.target.value})} placeholder="e.g. Logistics" />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
             <textarea className="w-full p-2 border border-slate-300 rounded-lg" value={deptForm.description} onChange={e => setDeptForm({...deptForm, description: e.target.value})} rows={2} />
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Head of Department</label>
             <select className="w-full p-2 border border-slate-300 rounded-lg" value={deptForm.headOfDepartmentId} onChange={e => setDeptForm({...deptForm, headOfDepartmentId: e.target.value})}>
               <option value="">Select Manager</option>
               {users.map(u => (
                 <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
               ))}
             </select>
           </div>
           <div className="flex justify-end pt-2">
              <Button type="submit">{deptForm.id ? 'Update Department' : 'Create Department'}</Button>
           </div>
         </form>
      </Modal>

      <ConfirmationModal 
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({...confirmState, isOpen: false})}
        onConfirm={confirmState.onConfirm}
        title={confirmState.title}
        message={confirmState.message}
      />
      
      <AlertModal
        isOpen={alertState.isOpen}
        onClose={() => setAlertState({...alertState, isOpen: false})}
        title={alertState.title}
        message={alertState.message}
      />
    </div>
  );
};

export default EmployeeManagement;