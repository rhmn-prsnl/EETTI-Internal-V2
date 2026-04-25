import React, { useState } from 'react';
import { LayoutDashboard, Settings, FileText, Users, BarChart3, Database, ShieldCheck, HelpCircle, CalendarCheck, Zap, Briefcase, Target, DollarSign, Globe, PieChart, TrendingUp, RefreshCw, MessageSquare, Scale, FileBadge, Phone, ChevronDown, ChevronRight } from 'lucide-react';
import { NavItem, PermissionKey } from '../../types';

interface SidebarProps {
  currentView: string;
  onChangeView: (viewId: string) => void;
  userRole: string;
  userPermissions: PermissionKey[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, userRole, userPermissions }) => {
  const isSuperAdmin = userRole === 'super_admin';
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Main Menu': true,
    'Sales & Projects': true,
    'HR & Operations': false,
    'Finance & Legal': false,
    'Tools & Marketing': false,
  });

  const toggleCategory = (title: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Helper to check if item should show
  const hasAccess = (requiredPerm?: PermissionKey) => {
    if (isSuperAdmin) return true;
    if (!requiredPerm) return true; // No requirement, everyone sees it
    if (userPermissions.includes('all_access')) return true;
    return userPermissions.includes(requiredPerm);
  };

  const menuCategories = [
    {
      title: 'Main Menu',
      items: [
        { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard', requiredPermission: 'view_dashboard' },
        { id: 'communication', icon: <MessageSquare size={20} />, label: 'Communication', requiredPermission: 'communication_view' },
        { id: 'reports', icon: <BarChart3 size={20} />, label: 'Reports & BI', requiredPermission: 'reports_view', isImportant: true },
      ]
    },
    {
      title: 'Sales & Projects',
      items: [
        { id: 'prospects', icon: <Phone size={20} />, label: 'Prospect Management', requiredPermission: 'lead_view' },
        { id: 'leads', icon: <Target size={20} />, label: 'Lead Management', requiredPermission: 'lead_view' },
        { id: 'clients', icon: <Briefcase size={20} />, label: 'Client Management', requiredPermission: 'client_view' },
        { id: 'projects', icon: <Database size={20} />, label: 'Projects', requiredPermission: 'project_view' },
      ]
    },
    {
      title: 'HR & Operations',
      items: [
        { id: 'users', icon: <Users size={20} />, label: 'Employee Management', requiredPermission: 'user_view' },
        { id: 'attendance', icon: <CalendarCheck size={20} />, label: 'Attendance & Calendar', requiredPermission: 'calendar_view' },
        { id: 'payroll', icon: <DollarSign size={20} />, label: 'Payroll', requiredPermission: 'payroll_view' },
        { id: 'expenses', icon: <PieChart size={20} />, label: 'Expenses', requiredPermission: 'expense_view' },
        { id: 'resumes', icon: <FileBadge size={20} />, label: 'Resume Management', requiredPermission: 'resume_view' },
      ]
    },
    {
      title: 'Finance & Legal',
      items: [
        { id: 'finance', icon: <TrendingUp size={20} />, label: 'Finance & Accounts', requiredPermission: 'finance_view' },
        { id: 'renewals', icon: <RefreshCw size={20} />, label: 'Renewals', requiredPermission: 'finance_view' },
        { id: 'compliance', icon: <Scale size={20} />, label: 'Compliance & Legal', requiredPermission: 'compliance_view' },
        { id: 'documents', icon: <FileText size={20} />, label: 'Document Management', requiredPermission: 'document_view' },
      ]
    },
    {
      title: 'Tools & Marketing',
      items: [
        { id: 'marketing', icon: <Globe size={20} />, label: 'Digital Marketing', requiredPermission: 'marketing_view' },
        { id: 'currency', icon: <DollarSign size={20} />, label: 'Currency Converter', requiredPermission: 'currency_manage' },
      ]
    }
  ];

  const bottomItems: NavItem[] = [
    { id: 'security', icon: <ShieldCheck size={20} />, label: 'Security', requiredPermission: 'security_manage' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings & Customization' },
    { id: 'support', icon: <HelpCircle size={20} />, label: 'Support' },
  ];

  const filteredCategories = menuCategories.map(category => ({
    ...category,
    items: category.items.filter(item => hasAccess(item.requiredPermission as PermissionKey))
  })).filter(category => category.items.length > 0);

  const filteredBottomItems = bottomItems.filter(item => hasAccess(item.requiredPermission));

  return (
    <aside className="hidden md:flex flex-col w-64 bg-dark-950 border-r border-dark-800 h-screen fixed left-0 top-0 z-20 transition-all shadow-2xl">
      <div className="p-6 flex items-center justify-center border-b border-dark-800 relative overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-600 to-primary-400"></div>
        
        <div className="flex items-center space-x-2 cursor-pointer z-10" onClick={() => onChangeView('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.4)] text-black">
            <Zap size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white tracking-tight leading-none">
              EETTI
            </span>
            <span className="text-xs font-bold text-primary-500 tracking-widest uppercase">
              TECH
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {filteredCategories.map((category, idx) => {
          const isExpanded = expandedCategories[category.title] ?? false;
          // Also automatically expand if currentView is inside this category
          const hasActiveChild = category.items.some(item => item.id === currentView);
          const showItems = isExpanded || hasActiveChild;

          return (
          <div key={idx} className="space-y-1">
            <button 
              onClick={() => toggleCategory(category.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-dark-400 hover:text-white group transition-colors"
            >
              <span className="text-[11px] font-bold uppercase tracking-widest">{category.title}</span>
              {showItems ? <ChevronDown size={14} className="opacity-70 group-hover:opacity-100" /> : <ChevronRight size={14} className="opacity-70 group-hover:opacity-100" />}
            </button>
            
            {showItems && (
              <div className="space-y-1 pl-2 border-l border-dark-800 ml-2">
                {category.items.map((item) => {
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onChangeView(item.id)}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group relative overflow-hidden mt-1
                        ${isActive 
                          ? 'bg-primary-500/10 text-primary-400' 
                          : 'text-dark-400 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-l"></div>}
                      <span className={`${isActive ? 'text-primary-400' : 'text-dark-500 group-hover:text-primary-400 transition-colors'}`}>
                        {item.icon}
                      </span>
                      <span className="font-bold text-sm tracking-wide flex-1 text-left">{item.label}</span>
                      {item.isImportant && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary-500 text-white rounded shadow-sm animate-pulse">
                          NEW
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )})}
      </div>

      <div className="p-3 border-t border-dark-800 bg-dark-900/50">
        {filteredBottomItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${isActive 
                  ? 'text-white' 
                  : 'text-dark-400 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <span className="text-dark-500 group-hover:text-white transition-colors">
                {item.icon}
              </span>
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;