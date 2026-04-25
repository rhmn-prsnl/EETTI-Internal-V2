import React, { useState } from 'react';
import { Phone, PhoneCall, PhoneForwarded, UserCheck, UserX, X, Plus, Edit } from 'lucide-react';
import { Prospect, ProspectStatus, User } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

interface ProspectManagementProps {
  currentUser: User;
  prospects: Prospect[];
  users: User[];
  onAddProspect: (p: Omit<Prospect, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>) => void;
  onUpdateProspect: (id: string, updates: Partial<Prospect>) => void;
  onDeleteProspect: (id: string) => void;
  onConvertToLead: (prospect: Prospect) => void;
}

const ProspectManagement: React.FC<ProspectManagementProps> = ({ currentUser, prospects, users, onAddProspect, onUpdateProspect, onDeleteProspect, onConvertToLead }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    phone: '',
    email: '',
    firstName: '',
    lastName: '',
    companyName: '',
    source: '',
    businessType: '' as 'Service' | 'Products' | 'Both' | '',
    businessDetails: '',
    targetAudience: '',
    notes: '',
    nextFollowUp: '',
    status: 'new' as ProspectStatus,
    assignedTo: currentUser.id
  });

  const getStatusColor = (status: ProspectStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_answered': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'switched_off': return 'bg-gray-100 text-gray-800 border-gray-400';
      case 'follow_up_later': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_interested': return 'bg-red-100 text-red-800 border-red-200';
      case 'invalid_number': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'potential_lead': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusLabel = (status: ProspectStatus) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdateProspect(editingId, form);
    } else {
      onAddProspect(form);
    }
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ 
      phone: '', email: '', firstName: '', lastName: '', companyName: '',
      source: '', businessType: '', businessDetails: '', targetAudience: '',
      notes: '', nextFollowUp: '', status: 'new', assignedTo: currentUser.id 
    });
  };

  const openEditModal = (p: Prospect) => {
    setForm({
      phone: p.phone,
      email: p.email || '',
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      companyName: p.companyName || '',
      source: p.source,
      businessType: p.businessType || '',
      businessDetails: p.businessDetails || '',
      targetAudience: p.targetAudience || '',
      notes: p.notes || '',
      nextFollowUp: p.nextFollowUp || '',
      status: p.status,
      assignedTo: p.assignedTo
    });
    setEditingId(p.id);
    setIsModalOpen(true);
  };

  const handleStatusChange = (p: Prospect, newStatus: ProspectStatus) => {
    onUpdateProspect(p.id, { status: newStatus });
    if (newStatus === 'potential_lead') {
      onConvertToLead(p);
    }
  };

  // Restrict view based on user role. Super Admin / Admin see all, others see their own assigned/created.
  const visibleProspects = (currentUser.role === 'super_admin' || currentUser.role === 'admin') 
                           ? prospects 
                           : prospects.filter(p => p.assignedTo === currentUser.id || p.createdBy === currentUser.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Prospect Management</h2>
          <p className="text-slate-500">Screen numbers and identify potential leads</p>
        </div>
        <Button onClick={() => { 
          setEditingId(null); 
          setForm({ 
            phone: '', email: '', firstName: '', lastName: '', companyName: '',
            source: '', businessType: '', businessDetails: '', targetAudience: '',
            notes: '', nextFollowUp: '', status: 'new', assignedTo: currentUser.id 
          }); 
          setIsModalOpen(true); 
        }}>
          <Plus size={20} className="mr-2" /> Add Next Prospect
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone / Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {visibleProspects.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                    <Phone size={14} className="text-slate-400" />
                    {p.phone}
                  </div>
                  <div className="text-sm text-slate-500">{p.firstName} {p.lastName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.source}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {users.find(u => u.id === p.assignedTo)?.username || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    className={`text-xs font-semibold rounded-full px-2 py-1 border ${getStatusColor(p.status)} outline-none cursor-pointer`}
                    value={p.status}
                    onChange={(e) => handleStatusChange(p, e.target.value as ProspectStatus)}
                    disabled={p.status === 'potential_lead'}
                  >
                    <option value="new">New</option>
                    <option value="not_answered">Not Answered</option>
                    <option value="switched_off">Switched Off</option>
                    <option value="follow_up_later">Need to Follow Up</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="invalid_number">Invalid Number</option>
                    <option value="potential_lead">Potential Lead</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {p.status !== 'potential_lead' && (
                    <button onClick={() => openEditModal(p)} className="text-primary-600 hover:text-primary-900 mr-4">
                      <Edit size={16} />
                    </button>
                  )}
                  <button onClick={() => onDeleteProspect(p.id)} className="text-red-600 hover:text-red-900">
                    <X size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {visibleProspects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-slate-500 text-sm">
                  No prospects found for screening. Add regular numbers to start.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Prospect Details" : "Add New Prospect"}>
        <form onSubmit={handleSubmit} className="space-y-4 text-slate-900 max-h-[80vh] overflow-y-auto pr-2">
          {/* Contact Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-2 border-b border-slate-200">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number *</label>
                <input required type="text" className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input type="email" className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">First Name</label>
                <input type="text" className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Last Name</label>
                <input type="text" className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Source *</label>
              <select required className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg" value={form.source} onChange={e => setForm({...form, source: e.target.value})}>
                <option value="" disabled>Select Source</option>
                <option value="JustDial">JustDial</option>
                <option value="TradeIndia">TradeIndia</option>
                <option value="IndiaMart">IndiaMart</option>
                <option value="Facebook">Facebook Ads</option>
                <option value="Google Ads">Google Ads</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Cold Call">Cold Call</option>
                <option value="Database">Database Dump</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-2 border-b border-slate-200">Business Details</h3>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Company Name <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input type="text" className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Business Type</label>
                <select className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.businessType} onChange={e => setForm({...form, businessType: e.target.value as any})}>
                  <option value="">Select Type...</option>
                  <option value="Service">Service Based</option>
                  <option value="Products">Goods / Products</option>
                  <option value="Both">Both</option>
                </select>
              </div>
              <div>
                 <label className="block text-sm font-bold text-slate-700 mb-1">Target Audience</label>
                 <input type="text" placeholder="e.g. B2B, End Users, Retailers" className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})} />
              </div>
            </div>
            {form.businessType && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  {form.businessType === 'Service' ? 'What type of services do they offer?' : form.businessType === 'Products' ? 'What are the products?' : 'Describe their services and products'}
                </label>
                <textarea rows={2} className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.businessDetails} onChange={e => setForm({...form, businessDetails: e.target.value})} placeholder="Specify details..."></textarea>
              </div>
            )}
          </div>

          {/* Discussion & Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-2 border-b border-slate-200">Discussion & Next Steps</h3>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Notes / Call Summary</label>
              <textarea rows={3} className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="What was discussed?"></textarea>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Next Follow-Up</label>
                <input type="datetime-local" className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.nextFollowUp} onChange={e => setForm({...form, nextFollowUp: e.target.value})} />
              </div>
              {currentUser.role === 'super_admin' || currentUser.role === 'admin' ? (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Assigned To</label>
                  <select className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.assignedTo} onChange={e => setForm({...form, assignedTo: e.target.value})}>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
            
            <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
               <select className="w-full p-2 border bg-white text-slate-900 border-slate-300 rounded-lg focus:ring-primary-500 focus:border-primary-500" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                  <option value="new">New</option>
                  <option value="not_answered">Not Answered</option>
                  <option value="switched_off">Switched Off</option>
                  <option value="follow_up_later">Need to Follow Up</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="invalid_number">Invalid Number</option>
                  <option value="potential_lead">Potential Lead (Convert to Lead)</option>
               </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6 pb-4">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Prospect</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProspectManagement;
