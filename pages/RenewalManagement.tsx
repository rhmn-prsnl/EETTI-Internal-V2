import React, { useState, useMemo } from 'react';
import { 
  User, Renewal, RenewalType, RenewalStatus, Client, Currency
} from '../types';
import { 
  Calendar, AlertCircle, CheckCircle, Clock, Globe, Server, Shield, 
  RefreshCw, Plus, Search, Filter, MoreVertical, ExternalLink, Mail, Bell, Edit2, Trash2
} from 'lucide-react';
import Button from '../components/ui/Button';

interface RenewalManagementProps {
  currentUser: User;
  renewals: Renewal[];
  clients: Client[];
  onAddRenewal: (renewal: Omit<Renewal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateRenewal: (id: string, updates: Partial<Renewal>) => void;
  onDeleteRenewal: (id: string) => void;
}

const RenewalManagement: React.FC<RenewalManagementProps> = ({ 
  currentUser, renewals, clients, onAddRenewal, onUpdateRenewal, onDeleteRenewal 
}) => {
  const [filterType, setFilterType] = useState<RenewalType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // --- FILTERS ---
  const filteredRenewals = useMemo(() => {
    return renewals.filter(r => {
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.provider.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());
  }, [renewals, filterType, searchTerm]);

  // --- STATS ---
  const expiringSoonCount = renewals.filter(r => {
    const daysLeft = Math.ceil((new Date(r.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft > 0;
  }).length;

  const expiredCount = renewals.filter(r => new Date(r.expiryDate) < new Date()).length;
  const totalCost = renewals.reduce((acc, r) => acc + r.cost, 0);

  // --- ICONS ---
  const getTypeIcon = (type: RenewalType) => {
    switch (type) {
      case 'domain': return <Globe size={18} className="text-blue-500" />;
      case 'hosting': return <Server size={18} className="text-purple-500" />;
      case 'ssl': return <Shield size={18} className="text-green-500" />;
      case 'amc': return <RefreshCw size={18} className="text-orange-500" />;
      case 'marketing': return <AlertCircle size={18} className="text-pink-500" />; // Using AlertCircle as placeholder
      default: return <Calendar size={18} className="text-slate-500" />;
    }
  };

  const getStatusBadge = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">Expired</span>;
    if (diffDays <= 7) return <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-bold uppercase">Urgent ({diffDays} days)</span>;
    if (diffDays <= 30) return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-bold uppercase">Expiring Soon ({diffDays} days)</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Active ({diffDays} days)</span>;
  };

  // --- FORM STATE ---
  const [formData, setFormData] = useState<Partial<Renewal>>({
    type: 'domain',
    currency: 'INR',
    autoRenew: false,
    reminderDays: [60, 30, 15, 7]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.expiryDate && formData.cost) {
      onAddRenewal(formData as any);
      setIsAddModalOpen(false);
      setFormData({ type: 'domain', currency: 'INR', autoRenew: false, reminderDays: [60, 30, 15, 7] });
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-300 dark:border-dark-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <RefreshCw className="mr-3 text-primary-500" size={28} /> Renewal & Subscriptions
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Track domains, hosting, SSL, and AMC expiries.</p>
          </div>
          <div className="flex gap-3">
             <Button onClick={() => setIsAddModalOpen(true)} variant="primary" icon={<Plus size={18} />}>Add Renewal</Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Active</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{renewals.length}</p>
           </div>
           <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Expiring Soon (30 Days)</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{expiringSoonCount}</p>
           </div>
           <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Expired</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{expiredCount}</p>
           </div>
           <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase">Total Annual Cost</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">₹{totalCost.toLocaleString()}</p>
           </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
           <div className="flex space-x-1 bg-slate-100 dark:bg-dark-700 p-1 rounded-xl border border-slate-200 dark:border-dark-600 w-fit overflow-x-auto">
             {['all', 'domain', 'hosting', 'ssl', 'amc', 'marketing'].map(type => (
               <button
                 key={type}
                 onClick={() => setFilterType(type as any)}
                 className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                   filterType === type 
                     ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm' 
                     : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                 }`}
               >
                 {type}
               </button>
             ))}
           </div>
           
           <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search renewals..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-600 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" 
              />
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-dark-700">
                    <th className="p-4 font-semibold">Service Name</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold">Provider</th>
                    <th className="p-4 font-semibold">Client</th>
                    <th className="p-4 font-semibold">Expiry Date</th>
                    <th className="p-4 font-semibold">Cost</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                 {filteredRenewals.map(renewal => (
                    <tr key={renewal.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                       <td className="p-4">
                          <div className="font-medium text-slate-900 dark:text-white flex items-center">
                             {getTypeIcon(renewal.type)}
                             <span className="ml-2">{renewal.name}</span>
                          </div>
                          {renewal.websiteUrl && (
                             <a href={renewal.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline ml-6 flex items-center mt-0.5">
                                {renewal.websiteUrl} <ExternalLink size={10} className="ml-1" />
                             </a>
                          )}
                       </td>
                       <td className="p-4 capitalize text-slate-600 dark:text-slate-400">{renewal.type}</td>
                       <td className="p-4 text-slate-600 dark:text-slate-400">{renewal.provider}</td>
                       <td className="p-4 text-slate-600 dark:text-slate-400">
                          {clients.find(c => c.id === renewal.clientId)?.clientName || '-'}
                       </td>
                       <td className="p-4 text-slate-900 dark:text-white font-medium">{renewal.expiryDate}</td>
                       <td className="p-4 text-slate-900 dark:text-white">₹{renewal.cost.toLocaleString()}</td>
                       <td className="p-4">
                          {getStatusBadge(renewal.expiryDate)}
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded" title="Send Reminder">
                                <Bell size={16} />
                             </button>
                             <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded">
                                <Edit2 size={16} />
                             </button>
                             <button onClick={() => onDeleteRenewal(renewal.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
                 {filteredRenewals.length === 0 && (
                    <tr>
                       <td colSpan={8} className="p-8 text-center text-slate-500">
                          No renewals found matching your filters.
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-dark-700">
               <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add New Renewal</h3>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Service Name</label>
                     <input 
                        type="text" 
                        required
                        className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                        value={formData.name || ''}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g., google.com Domain"
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                        <select 
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={formData.type}
                           onChange={e => setFormData({...formData, type: e.target.value as RenewalType})}
                        >
                           <option value="domain">Domain</option>
                           <option value="hosting">Hosting</option>
                           <option value="ssl">SSL</option>
                           <option value="amc">AMC</option>
                           <option value="marketing">Marketing</option>
                           <option value="software_license">Software License</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Provider</label>
                        <input 
                           type="text" 
                           required
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={formData.provider || ''}
                           onChange={e => setFormData({...formData, provider: e.target.value})}
                           placeholder="e.g., GoDaddy"
                        />
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Expiry Date</label>
                        <input 
                           type="date" 
                           required
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={formData.expiryDate || ''}
                           onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                        <select 
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={formData.frequency || 'yearly'}
                           onChange={e => setFormData({...formData, frequency: e.target.value as any})}
                        >
                           <option value="one-time">One Time</option>
                           <option value="monthly">Monthly</option>
                           <option value="bimonthly">Every 2 Months</option>
                           <option value="quarterly">Quarterly</option>
                           <option value="half-yearly">Half Yearly</option>
                           <option value="yearly">Yearly</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cost (INR)</label>
                        <input 
                           type="number" 
                           required
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={formData.cost || ''}
                           onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Linked Client (Optional)</label>
                        <select 
                           className="w-full p-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white"
                           value={formData.clientId || ''}
                           onChange={e => setFormData({...formData, clientId: e.target.value})}
                        >
                           <option value="">-- None --</option>
                           {clients.map(c => (
                              <option key={c.id} value={c.id}>{c.clientName}</option>
                           ))}
                        </select>
                     </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-6">
                     <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                     <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Add Renewal</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
};

export default RenewalManagement;
