import React, { useState } from 'react';
import { Client, User, Project } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
  Briefcase, Search, Plus, MapPin, Globe, Phone, Mail, 
  ShieldAlert, CreditCard, FileText, CheckCircle, XCircle 
} from 'lucide-react';

interface ClientManagementProps {
  currentUser: User;
  clients: Client[];
  users: User[]; // to select account manager
  projects: Project[]; // to show linked projects
  onAddClient: (client: Client) => void;
  onEditClient: (id: string, updates: Partial<Client>) => void;
  onDeleteClient: (id: string) => void;
}

const DEFAULT_CLIENT_FORM: Partial<Client> = {
  clientName: '',
  companyName: '',
  clientType: 'business',
  industry: '',
  status: 'active',
  primaryContactName: '',
  officialEmail: '',
  phone: '',
  address: '',
  paymentTerms: 'monthly',
  engagementType: 'project',
  contractStartDate: new Date().toISOString().split('T')[0],
  currency: 'USD',
  riskLevel: 'low'
};

const ClientManagement: React.FC<ClientManagementProps> = ({ 
  currentUser, clients, users, projects, onAddClient, onEditClient, onDeleteClient 
}) => {
  // RBAC Checks
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isFinance = currentUser.role === 'payroll_admin';
  const isManager = currentUser.role === 'manager';
  const canManage = isSuperAdmin || currentUser.role === 'hr_admin' || isManager;
  const canViewFinance = isSuperAdmin || isFinance;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'contact' | 'business' | 'finance'>('basic');
  const [form, setForm] = useState<Partial<Client>>(DEFAULT_CLIENT_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filter Logic
  const filteredClients = clients.filter(c => 
    c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ ...DEFAULT_CLIENT_FORM, accountOwnerId: currentUser.id });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingId(client.id);
    setForm({ ...client });
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic Validation
    if (!form.clientName || !form.officialEmail) return alert("Name and Email are required");

    if (editingId) {
      onEditClient(editingId, form);
    } else {
      onAddClient({
        ...form,
        id: Math.random().toString(36).substr(2, 9),
      } as Client);
    }
    setIsModalOpen(false);
  };

  // Render Functions
  const renderList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
           <input 
             type="text" 
             placeholder="Search clients..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
           />
        </div>
        {canManage && (
          <Button onClick={handleOpenAdd}>
            <Plus size={16} className="mr-2" /> Add Client
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => {
          const activeProjects = projects.filter(p => p.clientId === client.id && p.status === 'active').length;
          
          return (
            <div 
              key={client.id} 
              onClick={() => { setSelectedClient(client); setViewMode('detail'); }}
              className="bg-white dark:bg-dark-800 p-5 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 dark:from-dark-700 dark:to-dark-600 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 text-lg">
                    {client.clientName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{client.clientName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{client.industry}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  client.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {client.status}
                </span>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                  <MapPin size={12} className="mr-2 opacity-70" />
                  <span className="truncate">{client.address || 'No Address'}</span>
                </div>
                <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                  <Mail size={12} className="mr-2 opacity-70" />
                  <span className="truncate">{client.officialEmail}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-dark-700 flex justify-between items-center">
                 <span className="text-xs font-medium text-slate-500">{activeProjects} Active Projects</span>
                 {client.riskLevel === 'high' && (
                   <span title="High Risk Client">
                     <ShieldAlert size={14} className="text-red-500" />
                   </span>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedClient) return null;
    const clientProjects = projects.filter(p => p.clientId === selectedClient.id);
    const owner = users.find(u => u.id === selectedClient.accountOwnerId);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="secondary" onClick={() => setViewMode('list')}>&larr; Back to Directory</Button>
          {canManage && (
            <Button onClick={() => handleOpenEdit(selectedClient)}>Edit Client</Button>
          )}
        </div>

        {/* Header Card */}
        <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700">
           <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="flex gap-4">
                 <div className="w-16 h-16 rounded-xl bg-slate-200 dark:bg-dark-600 flex items-center justify-center text-2xl font-bold text-slate-500">
                    {selectedClient.clientName.charAt(0)}
                 </div>
                 <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedClient.clientName}</h1>
                    <p className="text-slate-500 dark:text-slate-400">{selectedClient.companyName} • {selectedClient.industry}</p>
                    <div className="flex items-center gap-4 mt-2">
                       <a href={`mailto:${selectedClient.officialEmail}`} className="text-xs flex items-center text-primary-600 hover:underline"><Mail size={12} className="mr-1"/> {selectedClient.officialEmail}</a>
                       {selectedClient.website && <a href={selectedClient.website} target="_blank" className="text-xs flex items-center text-primary-600 hover:underline"><Globe size={12} className="mr-1"/> Website</a>}
                    </div>
                 </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                 <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    selectedClient.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                 }`}>
                    {selectedClient.status}
                 </div>
                 <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase font-bold">Account Manager</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{owner?.username || 'Unassigned'}</span>
                       {owner && <img src={owner.avatar} className="w-6 h-6 rounded-full" />}
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left: Info */}
           <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><FileText size={18}/> Engagement Details</h3>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <p className="text-slate-500 text-xs">Engagement Type</p>
                       <p className="font-medium capitalize">{selectedClient.engagementType}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 text-xs">Payment Terms</p>
                       <p className="font-medium capitalize">{selectedClient.paymentTerms}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 text-xs">Contract Start</p>
                       <p className="font-medium">{selectedClient.contractStartDate}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 text-xs">Primary Contact</p>
                       <p className="font-medium">{selectedClient.primaryContactName}</p>
                    </div>
                 </div>
                 {canViewFinance && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-700 bg-slate-50 dark:bg-dark-900/50 p-3 rounded-lg">
                       <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-600 uppercase">
                          <CreditCard size={12} /> Financial Overview (Restricted)
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-sm">
                          <div><span className="text-slate-500">Currency:</span> {selectedClient.currency}</div>
                          <div><span className="text-slate-500">Tax ID:</span> {selectedClient.taxId || 'N/A'}</div>
                          <div><span className="text-slate-500">Risk Level:</span> <span className={`uppercase font-bold ${selectedClient.riskLevel === 'high' ? 'text-red-500' : 'text-slate-700'}`}>{selectedClient.riskLevel}</span></div>
                       </div>
                    </div>
                 )}
              </div>

              {/* Projects List */}
              <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-4">Linked Projects ({clientProjects.length})</h3>
                 <div className="space-y-3">
                    {clientProjects.length === 0 ? <p className="text-slate-500 italic text-sm">No projects linked yet.</p> : 
                       clientProjects.map(proj => (
                          <div key={proj.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-dark-600 bg-slate-50 dark:bg-dark-900/30">
                             <div>
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{proj.name}</h4>
                                <span className={`text-[10px] uppercase font-bold px-1.5 rounded ${proj.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>{proj.status}</span>
                             </div>
                             <div className="text-right">
                                <p className="text-xs text-slate-500">Progress</p>
                                <p className="font-bold text-primary-600">{proj.progress}%</p>
                             </div>
                          </div>
                       ))
                    }
                 </div>
              </div>
           </div>

           {/* Right: Timeline / Notes */}
           <div className="space-y-6">
              <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-dark-700">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-4">Internal Notes</h3>
                 <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 text-sm text-slate-700 dark:text-slate-300 min-h-[100px]">
                    {selectedClient.internalNotes || "No internal notes added."}
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  // Tabs for Modal
  const renderModalContent = () => {
    return (
      <div className="h-[60vh] flex flex-col">
         <div className="flex border-b border-slate-200 dark:border-dark-700 mb-4">
            <button type="button" onClick={() => setActiveTab('basic')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'basic' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>Basic Info</button>
            <button type="button" onClick={() => setActiveTab('contact')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'contact' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>Contact</button>
            <button type="button" onClick={() => setActiveTab('business')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'business' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>Business</button>
            {canViewFinance && <button type="button" onClick={() => setActiveTab('finance')} className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'finance' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>Financial</button>}
         </div>

         <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {activeTab === 'basic' && (
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Client Name *</label><input required className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Company Legal Name</label><input className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Industry</label><input className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Website</label><input className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.website} onChange={e => setForm({...form, website: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Type</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.clientType} onChange={e => setForm({...form, clientType: e.target.value as any})}><option value="individual">Individual</option><option value="business">Business</option><option value="enterprise">Enterprise</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Status</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}><option value="active">Active</option><option value="inactive">Inactive</option><option value="on-hold">On Hold</option></select></div>
               </div>
            )}
            {activeTab === 'contact' && (
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Primary Contact *</label><input required className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.primaryContactName} onChange={e => setForm({...form, primaryContactName: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Designation</label><input className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.designation} onChange={e => setForm({...form, designation: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Official Email *</label><input required type="email" className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.officialEmail} onChange={e => setForm({...form, officialEmail: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Phone</label><input className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 mb-1">Address</label><textarea className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
               </div>
            )}
            {activeTab === 'business' && (
               <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Account Owner</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.accountOwnerId} onChange={e => setForm({...form, accountOwnerId: e.target.value})}>{users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}</select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Engagement Type</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.engagementType} onChange={e => setForm({...form, engagementType: e.target.value as any})}><option value="project">Project</option><option value="retainer">Retainer</option><option value="amc">AMC</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Payment Terms</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.paymentTerms} onChange={e => setForm({...form, paymentTerms: e.target.value as any})}><option value="advance">Advance</option><option value="monthly">Monthly</option><option value="milestone">Milestone</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Start Date</label><input type="date" className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.contractStartDate} onChange={e => setForm({...form, contractStartDate: e.target.value})} /></div>
                  <div className="col-span-2"><label className="block text-xs font-bold text-slate-500 mb-1">Internal Notes</label><textarea className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" rows={3} value={form.internalNotes} onChange={e => setForm({...form, internalNotes: e.target.value})} /></div>
               </div>
            )}
            {activeTab === 'finance' && (
               <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-dark-900/50 p-4 rounded-xl">
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Tax ID / GST</label><input className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.taxId} onChange={e => setForm({...form, taxId: e.target.value})} /></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Currency</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}><option value="USD">USD</option><option value="EUR">EUR</option><option value="INR">INR</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Billing Category</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.billingCategory} onChange={e => setForm({...form, billingCategory: e.target.value as any})}><option value="standard">Standard</option><option value="high-value">High Value</option><option value="low-value">Low Value</option></select></div>
                  <div><label className="block text-xs font-bold text-slate-500 mb-1">Risk Level</label><select className="w-full p-2 border rounded dark:bg-dark-700 dark:border-dark-600" value={form.riskLevel} onChange={e => setForm({...form, riskLevel: e.target.value as any})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
               </div>
            )}
         </div>
         <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 dark:border-dark-700 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? 'Update Client' : 'Create Client'}</Button>
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Client Management</h1>
           <p className="text-slate-500 dark:text-slate-400 mt-1">Centralized directory for corporate client relationships.</p>
        </div>
      </div>

      {viewMode === 'list' ? renderList() : renderDetail()}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Client Profile' : 'Onboard New Client'}>
         <form onSubmit={handleSubmit}>
            {renderModalContent()}
         </form>
      </Modal>
    </div>
  );
};

export default ClientManagement;