import React, { useState, useMemo } from 'react';
import { User, Expense, ExpenseCategory, ExpenseType, PermissionKey, ExpenseStatus } from '../types';
import { PieChart, TrendingUp, TrendingDown, Plus, Filter, Download, Search, Calendar, DollarSign, FileText, CheckCircle, AlertCircle, Trash2, Edit2, RefreshCw, Users } from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

interface ExpenseManagementProps {
  currentUser: User;
  userPermissions: PermissionKey[];
  expenses: Expense[];
  totalSalaryExpense: number; // Passed from Payroll module
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'createdBy'>) => void;
  onUpdateExpense: (id: string, updates: Partial<Expense>) => void;
  onDeleteExpense: (id: string) => void;
  onGenerateRecurring: (month: string, year: number) => void;
}

const ExpenseManagement: React.FC<ExpenseManagementProps> = ({
  currentUser,
  userPermissions,
  expenses,
  totalSalaryExpense,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onGenerateRecurring
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canCreateExpense = isSuperAdmin || userPermissions.includes('expense_create');
  const canEditExpense = isSuperAdmin || userPermissions.includes('expense_edit');
  const canDeleteExpense = isSuperAdmin || userPermissions.includes('expense_delete');

  const [activeTab, setActiveTab] = useState<'overview' | 'all' | 'recurring'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  
  // Status Update Modal State
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; expense: Expense | null }>({ isOpen: false, expense: null });
  const [newStatus, setNewStatus] = useState<ExpenseStatus>('pending');
  const [paymentDetails, setPaymentDetails] = useState({ mode: 'bank_transfer', account: '' });
  const [confirmStatusModal, setConfirmStatusModal] = useState(false);

  // ... existing code ...

  const handleStatusClick = (expense: Expense) => {
    setStatusModal({ isOpen: true, expense });
    setNewStatus(expense.status);
    setPaymentDetails({ 
      mode: expense.paymentMode || 'bank_transfer', 
      account: expense.bankAccount || '' 
    });
  };

  const handleStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmStatusModal(true);
  };

  const confirmStatusUpdate = () => {
    if (statusModal.expense) {
      const updates: Partial<Expense> = {
        status: newStatus,
        paymentMode: newStatus === 'paid' ? paymentDetails.mode as any : undefined,
        bankAccount: newStatus === 'paid' ? paymentDetails.account : undefined
      };
      onUpdateExpense(statusModal.expense.id, updates);
      setConfirmStatusModal(false);
      setStatusModal({ isOpen: false, expense: null });
    }
  };

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = exp.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || exp.category === filterCategory;
      const matchesMonth = exp.date.startsWith(selectedMonth);
      return matchesSearch && matchesCategory && matchesMonth;
    });
  }, [expenses, searchTerm, filterCategory, selectedMonth]);

  // Stats Calculation
  const stats = useMemo(() => {
    const operationalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = operationalExpenses + totalSalaryExpense;
    
    const categoryBreakdown = expenses
      .filter(e => e.date.startsWith(selectedMonth))
      .reduce((acc, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
        return acc;
      }, {} as Record<string, number>);
    
    // Add Salary to breakdown
    categoryBreakdown['salary'] = totalSalaryExpense;

    return {
      operationalExpenses,
      totalExpenses,
      categoryBreakdown
    };
  }, [filteredExpenses, totalSalaryExpense, expenses, selectedMonth]);

  const [expenseType, setExpenseType] = useState<ExpenseType>('one-time');

  // Update expenseType when editingExpense changes
  React.useEffect(() => {
    if (editingExpense) {
      setExpenseType(editingExpense.type);
    } else {
      setExpenseType('one-time');
    }
  }, [editingExpense]);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const type = formData.get('type') as ExpenseType;
    const expenseData = {
      title: formData.get('title') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as ExpenseCategory,
      type: type,
      date: formData.get('date') as string,
      status: 'approved' as const, // Auto-approve for admins
      description: formData.get('description') as string,
      recurringDay: type === 'recurring' ? parseInt(formData.get('recurringDay') as string) : undefined,
      recurringInterval: type === 'recurring' ? parseInt(formData.get('recurringInterval') as string) : undefined
    };

    if (editingExpense) {
      onUpdateExpense(editingExpense.id, expenseData);
    } else {
      onAddExpense(expenseData);
    }
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmModal({ isOpen: true, id });
  };

  const confirmDelete = () => {
    if (confirmModal.id) {
      onDeleteExpense(confirmModal.id);
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      salary: 'bg-blue-500',
      rent: 'bg-orange-500',
      utilities: 'bg-yellow-500',
      software: 'bg-purple-500',
      hardware: 'bg-gray-500',
      marketing: 'bg-pink-500',
      commission: 'bg-green-500',
      travel: 'bg-indigo-500',
      office_supplies: 'bg-teal-500',
      other: 'bg-slate-500'
    };
    return colors[cat] || 'bg-slate-500';
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-300 dark:border-dark-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <PieChart className="mr-3 text-primary-500" size={28} /> Expense Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Track company spending, recurring costs, and salary outflows.</p>
          </div>
          <div className="flex gap-3">
            {canCreateExpense && (
              <button 
                onClick={() => {
                  const [year, month] = selectedMonth.split('-');
                  onGenerateRecurring(month, parseInt(year));
                }}
                className="flex items-center px-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg hover:bg-slate-50 dark:hover:bg-dark-600 transition-colors text-slate-700 dark:text-slate-200"
              >
                <RefreshCw className="mr-2" size={18} /> Auto-Add Recurring
              </button>
            )}
            {canCreateExpense && (
              <button 
                onClick={() => { setEditingExpense(null); setIsModalOpen(true); }}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
              >
                <Plus className="mr-2" size={18} /> Add Expense
              </button>
            )}
          </div>
        </div>

        {/* Tabs & Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex space-x-1 bg-slate-100 dark:bg-dark-700 p-1 rounded-xl border border-slate-200 dark:border-dark-600">
            {['overview', 'all', 'recurring'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm border border-slate-200 dark:border-transparent' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-dark-800 border border-slate-300 dark:border-dark-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Company Outflow</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">₹{stats.totalExpenses.toLocaleString()}</h3>
                <div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center text-red-600 dark:text-red-400 mr-2"><TrendingUp size={14} className="mr-1" /> +12%</span>
                  vs last month
                </div>
              </div>

              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-10">
                  <Users size={64} />
                </div>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Salary Expenses (Auto)</p>
                <h3 className="text-3xl font-bold text-blue-700 dark:text-blue-400 mt-2">₹{totalSalaryExpense.toLocaleString()}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Derived from Payroll Module</p>
              </div>

              <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Operational Expenses</p>
                <h3 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">₹{stats.operationalExpenses.toLocaleString()}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-4">Rent, Utilities, Purchases, etc.</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-6">Expense Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(stats.categoryBreakdown).sort((a: [string, any], b: [string, any]) => (b[1] as number) - (a[1] as number)).map(([category, amount]) => {
                  const percentage = Math.round(((amount as number) / stats.totalExpenses) * 100) || 0;
                  return (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">{category.replace('_', ' ')}</span>
                        <span className="font-bold text-slate-900 dark:text-white">₹{(amount as number).toLocaleString()} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-dark-700 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${getCategoryColor(category)}`} 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'all' || activeTab === 'recurring') && (
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-300 dark:border-dark-700 overflow-hidden">
            <div className="p-4 border-b border-slate-300 dark:border-dark-700 flex justify-between items-center">
              <div className="flex gap-2">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Categories</option>
                  <option value="rent">Rent</option>
                  <option value="utilities">Utilities</option>
                  <option value="software">Software</option>
                  <option value="hardware">Hardware</option>
                  <option value="marketing">Marketing</option>
                  <option value="commission">Commission</option>
                  <option value="travel">Travel</option>
                  <option value="office_supplies">Office Supplies</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search expenses..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-sm w-64 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 placeholder-slate-500"
                />
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-dark-700/50 text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider border-b border-slate-300 dark:border-dark-700">
                  <th className="p-4 font-bold">Date</th>
                  <th className="p-4 font-bold">Title</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Type</th>
                  <th className="p-4 font-bold">Amount</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-700">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-600 dark:text-slate-400 italic">No expenses found.</td>
                  </tr>
                ) : (
                  filteredExpenses.map(expense => (
                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                      <td className="p-4 text-slate-700 dark:text-slate-300 text-sm font-medium">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="p-4 font-semibold text-slate-900 dark:text-white">
                        {expense.title}
                        {expense.description && <p className="text-xs text-slate-500 dark:text-slate-400 font-normal truncate max-w-xs">{expense.description}</p>}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-slate-200 dark:bg-dark-700 rounded text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize border border-slate-300 dark:border-transparent">
                          {expense.category.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-400 capitalize font-medium">{expense.type}</td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">₹{expense.amount.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase border ${
                          expense.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                          expense.status === 'approved' ? 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                          expense.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                          'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                        }`}>
                          {expense.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          {canEditExpense && (
                            <button
                              onClick={() => handleStatusClick(expense)}
                              className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg shadow-sm"
                              title="Update Status"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {canEditExpense && (
                            <button 
                              onClick={() => { setEditingExpense(expense); setIsModalOpen(true); }}
                              className="p-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg shadow-sm"
                            >
                              <Edit2 size={16} />
                            </button>
                          )}
                          {canDeleteExpense && (
                            <button 
                              onClick={() => handleDeleteClick(expense.id)}
                              className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg shadow-sm"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal.isOpen && statusModal.expense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-dark-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Update Expense Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Status</label>
                <select 
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ExpenseStatus)}
                  className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {newStatus === 'paid' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Payment Mode</label>
                    <select 
                      value={paymentDetails.mode}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, mode: e.target.value })}
                      required
                      className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    >
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cash">Cash</option>
                      <option value="cheque">Cheque</option>
                      <option value="upi">UPI</option>
                      <option value="credit_card">Credit Card</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Bank Account / Details</label>
                    <input 
                      value={paymentDetails.account}
                      onChange={(e) => setPaymentDetails({ ...paymentDetails, account: e.target.value })}
                      required
                      placeholder="e.g. HDFC **** 1234"
                      className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setStatusModal({ isOpen: false, expense: null })} className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-lg shadow-primary-500/20">
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation for Status Update */}
      <ConfirmationModal 
        isOpen={confirmStatusModal}
        onClose={() => setConfirmStatusModal(false)}
        onConfirm={confirmStatusUpdate}
        title="Confirm Status Update"
        message={`Are you sure you want to change the status to ${newStatus.toUpperCase()}?`}
        isDanger={false}
      />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-dark-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <form onSubmit={handleSaveExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Title</label>
                <input 
                  name="title" 
                  defaultValue={editingExpense?.title} 
                  required 
                  className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
                  placeholder="e.g. Office Rent"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Amount (₹)</label>
                  <input 
                    name="amount" 
                    type="number" 
                    defaultValue={editingExpense?.amount} 
                    required 
                    className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Date</label>
                  <input 
                    name="date" 
                    type="date" 
                    defaultValue={editingExpense?.date || new Date().toISOString().split('T')[0]} 
                    required 
                    className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Category</label>
                  <select 
                    name="category" 
                    defaultValue={editingExpense?.category || 'office_supplies'} 
                    className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="software">Software</option>
                    <option value="hardware">Hardware</option>
                    <option value="marketing">Marketing</option>
                    <option value="commission">Commission</option>
                    <option value="travel">Travel</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Type</label>
                  <select 
                    name="type" 
                    value={expenseType}
                    onChange={(e) => setExpenseType(e.target.value as ExpenseType)}
                    className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                  >
                    <option value="one-time">One-Time</option>
                    <option value="recurring">Recurring</option>
                  </select>
                </div>
              </div>

              {expenseType === 'recurring' && (
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-dark-700/50 p-3 rounded-lg border border-slate-200 dark:border-dark-600">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Recurring Day</label>
                    <input 
                      name="recurringDay" 
                      type="number" 
                      min="1" 
                      max="31" 
                      defaultValue={editingExpense?.recurringDay || 1} 
                      className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Interval</label>
                    <select 
                      name="recurringInterval" 
                      defaultValue={editingExpense?.recurringInterval || 1} 
                      className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
                    >
                      <option value="1">Monthly (Every Month)</option>
                      <option value="2">Every 2 Months</option>
                      <option value="3">Quarterly (Every 3 Months)</option>
                      <option value="4">Every 4 Months</option>
                      <option value="5">Every 5 Months</option>
                      <option value="6">Half-Yearly (Every 6 Months)</option>
                      <option value="12">Yearly (Every 12 Months)</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Description</label>
                <textarea 
                  name="description" 
                  defaultValue={editingExpense?.description} 
                  className="w-full p-3 bg-white dark:bg-dark-700 rounded-lg border border-slate-300 dark:border-dark-600 focus:ring-2 focus:ring-primary-500 h-24 text-slate-900 dark:text-white" 
                  placeholder="Additional details..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium shadow-lg shadow-primary-500/20">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense record? This action cannot be undone."
        isDanger={true}
      />
    </div>
  );
};

export default ExpenseManagement;
