import React, { useState, useMemo } from 'react';
import { User, PayrollRecord, SalaryStructure, PermissionKey } from '../types';
import { DollarSign, Calendar, Download, Filter, Search, Plus, FileText, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, User as UserIcon, Briefcase } from 'lucide-react';

interface PayrollManagementProps {
  currentUser: User;
  users: User[];
  payrollRecords: PayrollRecord[];
  onGeneratePayroll: (month: string, year: number) => void;
  onUpdatePayrollStatus: (recordId: string, status: 'paid' | 'pending' | 'processing') => void;
  onUpdateSalaryStructure: (userId: string, structure: SalaryStructure) => void;
}

const PayrollManagement: React.FC<PayrollManagementProps> = ({
  currentUser,
  users,
  payrollRecords,
  onGeneratePayroll,
  onUpdatePayrollStatus,
  onUpdateSalaryStructure
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'process' | 'salary-structures' | 'history'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return payrollRecords.filter(record => {
      const matchesSearch = users.find(u => u.id === record.userId)?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            users.find(u => u.id === record.userId)?.lastName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMonth = `${record.year}-${String(record.month).padStart(2, '0')}` === selectedMonth;
      return matchesSearch && matchesMonth;
    });
  }, [payrollRecords, searchTerm, selectedMonth, users]);

  // Statistics
  const stats = useMemo(() => {
    const totalPayroll = filteredRecords.reduce((sum, r) => sum + r.netSalary, 0);
    const pendingCount = filteredRecords.filter(r => r.status === 'pending').length;
    const paidCount = filteredRecords.filter(r => r.status === 'paid').length;
    return { totalPayroll, pendingCount, paidCount };
  }, [filteredRecords]);

  const handleProcessPayroll = () => {
    const [year, month] = selectedMonth.split('-');
    onGeneratePayroll(month, parseInt(year));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-300 dark:border-dark-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <DollarSign className="mr-3 text-primary-500" size={28} /> Payroll Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage salaries, payslips, and compensation structures.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleProcessPayroll}
              className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
            >
              <Calendar className="mr-2" size={18} /> Generate Payroll
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-dark-700 p-1 rounded-xl w-fit border border-slate-200 dark:border-dark-600">
          {['overview', 'process', 'salary-structures', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab 
                  ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-transparent' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Payroll Cost</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">₹{stats.totalPayroll.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                    <DollarSign size={24} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">For {selectedMonth}</p>
              </div>
              
              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Pending Payments</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.pendingCount}</h3>
                  </div>
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600">
                    <AlertCircle size={24} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Employees waiting</p>
              </div>

              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Processed Successfully</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats.paidCount}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                    <CheckCircle size={24} />
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Payslips generated</p>
              </div>
            </div>

            {/* Recent Activity / List */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700 overflow-hidden">
              <div className="p-6 border-b border-slate-300 dark:border-dark-700 flex justify-between items-center">
                <h3 className="font-bold text-slate-900 dark:text-white">Payroll Records</h3>
                <div className="flex gap-3">
                  <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search employee..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-sm w-64 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
              
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-dark-700/50 text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider border-b border-slate-300 dark:border-dark-700">
                    <th className="p-4 font-bold">Employee</th>
                    <th className="p-4 font-bold">Basic Salary</th>
                    <th className="p-4 font-bold">Allowances</th>
                    <th className="p-4 font-bold">Deductions</th>
                    <th className="p-4 font-bold">Net Salary</th>
                    <th className="p-4 font-bold">Status</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-700">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-600 dark:text-slate-400 italic">No payroll records found for this period.</td>
                    </tr>
                  ) : (
                    filteredRecords.map(record => {
                      const user = users.find(u => u.id === record.userId);
                      return (
                        <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs border border-primary-200 dark:border-primary-800">
                                {user?.firstName.charAt(0)}{user?.lastName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{user?.position}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">₹{record.basicSalary.toLocaleString()}</td>
                          <td className="p-4 text-green-700 dark:text-green-400 font-medium">+₹{record.allowances.toLocaleString()}</td>
                          <td className="p-4 text-red-600 dark:text-red-400 font-medium">-₹{record.deductions.toLocaleString()}</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">₹{record.netSalary.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            {record.status !== 'paid' && (
                              <button 
                                onClick={() => onUpdatePayrollStatus(record.id, 'paid')}
                                className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors mr-2 shadow-sm"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button className="text-slate-500 hover:text-primary-600 transition-colors">
                              <Download size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Salary Structures Tab */}
        {activeTab === 'salary-structures' && (
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700 overflow-hidden">
             <div className="p-6 border-b border-slate-300 dark:border-dark-700">
               <h3 className="font-bold text-slate-900 dark:text-white mb-4">Employee Salary Structures</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {users.filter(u => u.role !== 'super_admin').map(user => (
                   <div key={user.id} className="p-4 border border-slate-300 dark:border-dark-700 rounded-lg hover:border-primary-500 transition-colors cursor-pointer bg-slate-50 dark:bg-dark-700/30" onClick={() => { setSelectedUser(user); setIsSalaryModalOpen(true); }}>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-dark-700 flex items-center justify-center border border-slate-200 dark:border-dark-600">
                          <UserIcon size={20} className="text-slate-500" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{user.firstName} {user.lastName}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{user.position}</p>
                        </div>
                     </div>
                     <div className="flex justify-between items-center text-sm">
                       <span className="text-slate-600 dark:text-slate-400 font-medium">Base Salary</span>
                       <span className="font-bold text-slate-900 dark:text-white">₹ --</span> 
                       {/* In a real app, we'd fetch the actual structure here */}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

      </div>

      {/* Salary Structure Modal */}
      {isSalaryModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-300 dark:border-dark-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Salary Structure</h2>
              <button onClick={() => setIsSalaryModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="mb-6 p-4 bg-slate-50 dark:bg-dark-700 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-dark-600">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-dark-600 flex items-center justify-center text-primary-600 font-bold border border-slate-200 dark:border-dark-500">
                {selectedUser.firstName.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{selectedUser.firstName} {selectedUser.lastName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{selectedUser.position} • {selectedUser.department}</p>
              </div>
            </div>

            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              // Handle save logic
              setIsSalaryModalOpen(false);
            }}>
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Basic Salary (Annual)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                  <input type="number" className="w-full pl-8 pr-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">HRA</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input type="number" className="w-full pl-8 pr-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Transport</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">₹</span>
                    <input type="number" className="w-full pl-8 pr-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">Bank Account Number</label>
                <input type="text" className="w-full px-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500" placeholder="XXXX-XXXX-XXXX" />
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-dark-700">
                <button type="button" onClick={() => setIsSalaryModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20">Save Structure</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PayrollManagement;
