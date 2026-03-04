import React, { useState, useMemo } from 'react';
import { 
  User, Invoice, Quotation, Vendor, PaymentRecord, Expense, PayrollRecord, Client,
  InvoiceItem, InvoiceStatus, Currency, PermissionKey, VendorPayment
} from '../types';
import { 
  DollarSign, FileText, Users, CreditCard, TrendingUp, TrendingDown, 
  Plus, Download, Filter, Search, MoreVertical, Calendar, CheckCircle, 
  AlertCircle, Send, Printer, Trash2, Edit2, Briefcase
} from 'lucide-react';
import Button from '../components/ui/Button';

interface FinanceManagementProps {
  currentUser: User;
  userPermissions: PermissionKey[];
  expenses: Expense[];
  payrollRecords: PayrollRecord[];
  clients: Client[];
  invoices: Invoice[];
  onAddInvoice: (invoice: Invoice) => void;
}

const FinanceManagement: React.FC<FinanceManagementProps> = ({ 
  currentUser, userPermissions, expenses, payrollRecords, clients, invoices, onAddInvoice 
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canCreateFinance = isSuperAdmin || userPermissions.includes('finance_create');
  const canEditFinance = isSuperAdmin || userPermissions.includes('finance_edit');
  
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'quotations' | 'vendors' | 'payments'>('overview');

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>([]);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [newVendor, setNewVendor] = useState<Partial<Vendor>>({ status: 'active', balance: 0 });

  // --- CALCULATIONS ---
  const totalRevenue = useMemo(() => invoices.filter(i => i.status === 'paid').reduce((acc, curr) => acc + curr.totalAmount, 0), [invoices]);
  const totalExpenses = useMemo(() => expenses.reduce((acc, curr) => acc + curr.amount, 0), [expenses]);
  const totalPayroll = useMemo(() => payrollRecords.filter(p => p.status === 'paid').reduce((acc, curr) => acc + curr.netSalary, 0), [payrollRecords]);
  const netProfit = totalRevenue - (totalExpenses + totalPayroll);

  const pendingInvoices = invoices.filter(i => i.status === 'sent' || i.status === 'overdue').length;
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((acc, curr) => acc + curr.totalAmount, 0);

  // --- MODAL STATES ---
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  
  // --- HANDLERS ---
  const handleCreateInvoice = () => {
    // Logic to open modal
    setIsInvoiceModalOpen(true);
  };

  const handleCreateQuotation = () => {
    setIsQuotationModalOpen(true);
  };

  const handleAddVendor = () => {
    if (newVendor.name && newVendor.category) {
      setVendors([...vendors, { ...newVendor, id: `ven_${Date.now()}` } as Vendor]);
      setIsAddVendorModalOpen(false);
      setNewVendor({ status: 'active', balance: 0 });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-300 dark:border-dark-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <DollarSign className="mr-3 text-primary-500" size={28} /> Finance & Accounts
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage Invoices, Quotations, Expenses, and Financial Reports.</p>
          </div>
          <div className="flex gap-3">
             {activeTab === 'invoices' && canCreateFinance && (
               <Button onClick={handleCreateInvoice} variant="primary" icon={<Plus size={18} />}>Create Invoice</Button>
             )}
             {activeTab === 'quotations' && canCreateFinance && (
               <Button onClick={handleCreateQuotation} variant="primary" icon={<Plus size={18} />}>Create Quotation</Button>
             )}
             {activeTab === 'vendors' && canCreateFinance && (
               <Button onClick={() => setIsAddVendorModalOpen(true)} variant="primary" icon={<Plus size={18} />}>Add Vendor</Button>
             )}
             {activeTab === 'overview' && (
               <Button variant="outline" icon={<Download size={18} />}>Download P&L Report</Button>
             )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-dark-700 p-1 rounded-xl border border-slate-200 dark:border-dark-600 w-fit overflow-x-auto">
          {['overview', 'invoices', 'quotations', 'vendors', 'payments'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">₹{totalRevenue.toLocaleString()}</p>
                <div className="mt-2 text-xs text-slate-400 flex items-center">
                   <TrendingUp size={12} className="mr-1" /> From paid invoices
                </div>
              </div>
              <div className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">₹{totalExpenses.toLocaleString()}</p>
                <div className="mt-2 text-xs text-slate-400 flex items-center">
                   <TrendingDown size={12} className="mr-1" /> Operational costs
                </div>
              </div>
              <div className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Payroll Cost</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">₹{totalPayroll.toLocaleString()}</p>
                <div className="mt-2 text-xs text-slate-400">Salaries & Benefits</div>
              </div>
              <div className="bg-white dark:bg-dark-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Net Profit</p>
                <p className={`text-2xl font-bold mt-2 ${netProfit >= 0 ? 'text-primary-600 dark:text-primary-400' : 'text-red-600'}`}>
                  ₹{netProfit.toLocaleString()}
                </p>
                <div className="mt-2 text-xs text-slate-400">Revenue - (Exp + Payroll)</div>
              </div>
            </div>

            {/* Charts Section (Placeholder for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 h-80 flex items-center justify-center">
                  <p className="text-slate-400">Revenue vs Expense Chart (Coming Soon)</p>
               </div>
               <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 h-80 flex items-center justify-center">
                  <p className="text-slate-400">Cash Flow Forecast (Coming Soon)</p>
               </div>
            </div>
          </div>
        )}

        {/* INVOICES TAB */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
               <div className="flex gap-4">
                  <div className="text-center px-4 border-r border-slate-200 dark:border-dark-700">
                     <p className="text-xs text-slate-500 uppercase font-bold">Pending</p>
                     <p className="text-xl font-bold text-orange-600">{pendingInvoices}</p>
                  </div>
                  <div className="text-center px-4">
                     <p className="text-xs text-slate-500 uppercase font-bold">Overdue Amount</p>
                     <p className="text-xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                     <input type="text" placeholder="Search invoices..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-600 rounded-lg text-sm" />
                  </div>
                  <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-lg"><Filter size={18} /></button>
               </div>
            </div>

            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-dark-700">
                        <th className="p-4 font-semibold">Invoice #</th>
                        <th className="p-4 font-semibold">Client</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Due Date</th>
                        <th className="p-4 font-semibold">Amount</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                     {invoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                           <td className="p-4 font-medium text-slate-900 dark:text-white">
                              {inv.invoiceNumber}
                              {inv.isRecurring && <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">Recurring</span>}
                           </td>
                           <td className="p-4 text-slate-600 dark:text-slate-300">
                              {clients.find(c => c.id === inv.clientId)?.clientName || inv.clientId}
                           </td>
                           <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{inv.issueDate}</td>
                           <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{inv.dueDate}</td>
                           <td className="p-4 font-bold text-slate-900 dark:text-white">₹{inv.totalAmount.toLocaleString()}</td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                 inv.status === 'paid' ? 'bg-green-100 text-green-800' :
                                 inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                 inv.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                 'bg-slate-100 text-slate-800'
                              }`}>
                                 {inv.status}
                              </span>
                           </td>
                           <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded" title="Send Reminder">
                                    <Send size={16} />
                                 </button>
                                 <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded" title="Download PDF">
                                    <Download size={16} />
                                 </button>
                                 <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                                    <MoreVertical size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* QUOTATIONS TAB */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
             <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-dark-700">
                        <th className="p-4 font-semibold">Quotation #</th>
                        <th className="p-4 font-semibold">Client</th>
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Valid Until</th>
                        <th className="p-4 font-semibold">Amount</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                     {quotations.map(qt => (
                        <tr key={qt.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                           <td className="p-4 font-medium text-slate-900 dark:text-white">{qt.quotationNumber}</td>
                           <td className="p-4 text-slate-600 dark:text-slate-300">
                              {clients.find(c => c.id === qt.clientId)?.clientName || qt.clientId}
                           </td>
                           <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{qt.issueDate}</td>
                           <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">{qt.validUntil}</td>
                           <td className="p-4 font-bold text-slate-900 dark:text-white">₹{qt.totalAmount.toLocaleString()}</td>
                           <td className="p-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                 qt.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                 qt.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                 'bg-slate-100 text-slate-800'
                              }`}>
                                 {qt.status}
                              </span>
                           </td>
                           <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <button className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded" title="Convert to Invoice">
                                    <CheckCircle size={16} />
                                 </button>
                                 <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                                    <Download size={16} />
                                 </button>
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
           <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {vendors.map(vendor => (
                    <div key={vendor.id} className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-slate-500">
                             <Briefcase size={24} />
                          </div>
                          <button className="text-slate-400 hover:text-slate-600"><MoreVertical size={16} /></button>
                       </div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white">{vendor.name}</h3>
                       <p className="text-sm text-slate-500 mb-4">{vendor.category}</p>
                       
                       <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-4">
                          <div className="flex justify-between">
                             <span>Balance:</span>
                             <span className="font-bold text-red-600">₹{vendor.balance.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Contact:</span>
                             <span>{vendor.contactPerson || '-'}</span>
                          </div>
                          {vendor.contractEndDate && (
                             <div className="flex justify-between">
                                <span>Contract Ends:</span>
                                <span>{vendor.contractEndDate}</span>
                             </div>
                          )}
                       </div>
                       
                       <div className="flex gap-2">
                          <button className="flex-1 px-3 py-2 bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors">
                             History
                          </button>
                          <button className="flex-1 px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                             Pay Now
                          </button>
                       </div>
                    </div>
                 ))}
                 
                 {/* Add Vendor Card */}
                 {canCreateFinance && (
                   <button onClick={() => setIsAddVendorModalOpen(true)} className="border-2 border-dashed border-slate-300 dark:border-dark-600 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-primary-500 hover:border-primary-500 hover:bg-slate-50 dark:hover:bg-dark-800/50 transition-all group">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center mb-3 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
                         <Plus size={24} />
                      </div>
                      <span className="font-medium">Add New Vendor</span>
                   </button>
                 )}
              </div>
           </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === 'payments' && (
           <div className="space-y-6">
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-dark-700">
                          <th className="p-4 font-semibold">Date</th>
                          <th className="p-4 font-semibold">Vendor/Client</th>
                          <th className="p-4 font-semibold">Type</th>
                          <th className="p-4 font-semibold">Method</th>
                          <th className="p-4 font-semibold">Amount</th>
                          <th className="p-4 font-semibold">Status</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                       <tr className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                          <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">2023-10-20</td>
                          <td className="p-4 text-slate-900 dark:text-white font-medium">AWS Services</td>
                          <td className="p-4"><span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded uppercase font-bold">Expense</span></td>
                          <td className="p-4 text-slate-600 dark:text-slate-400 text-sm capitalize">Credit Card</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">₹12,400</td>
                          <td className="p-4"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded uppercase font-bold">Completed</span></td>
                       </tr>
                       <tr className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                          <td className="p-4 text-slate-600 dark:text-slate-400 text-sm">2023-10-18</td>
                          <td className="p-4 text-slate-900 dark:text-white font-medium">TechCorp Inc.</td>
                          <td className="p-4"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded uppercase font-bold">Income</span></td>
                          <td className="p-4 text-slate-600 dark:text-slate-400 text-sm capitalize">Bank Transfer</td>
                          <td className="p-4 font-bold text-slate-900 dark:text-white">₹450,000</td>
                          <td className="p-4"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded uppercase font-bold">Completed</span></td>
                       </tr>
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </div>
      
      {/* Modals */}
      {isInvoiceModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl w-full max-w-2xl">
               <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Create New Invoice</h3>
               <p className="text-slate-500 mb-6">Mock Interface - Functionality to be implemented.</p>
               <div className="flex justify-end gap-2">
                  <button onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                  <button onClick={() => setIsInvoiceModalOpen(false)} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Create Draft</button>
               </div>
            </div>
         </div>
      )}

      {/* Add Vendor Modal */}
      {isAddVendorModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-dark-700">
               <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add New Vendor</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendor Name</label>
                     <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                        value={newVendor.name || ''}
                        onChange={e => setNewVendor({...newVendor, name: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Type (Category)</label>
                     <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                        value={newVendor.category || ''}
                        onChange={e => setNewVendor({...newVendor, category: e.target.value})}
                        placeholder="e.g. Software, Supplies, Marketing"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                        <input 
                           type="text" 
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={newVendor.contactPerson || ''}
                           onChange={e => setNewVendor({...newVendor, contactPerson: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                        <input 
                           type="text" 
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={newVendor.phone || ''}
                           onChange={e => setNewVendor({...newVendor, phone: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contract Start</label>
                        <input 
                           type="date" 
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={newVendor.contractStartDate || ''}
                           onChange={e => setNewVendor({...newVendor, contractStartDate: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contract End</label>
                        <input 
                           type="date" 
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={newVendor.contractEndDate || ''}
                           onChange={e => setNewVendor({...newVendor, contractEndDate: e.target.value})}
                        />
                     </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                     <button onClick={() => setIsAddVendorModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                     <button onClick={handleAddVendor} className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add Vendor</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

export default FinanceManagement;
