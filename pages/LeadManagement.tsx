import React, { useState, useMemo } from 'react';
import { User, Lead, MOM, FollowUp, LeadStatus } from '../types';
import { 
  Plus, Search, Filter, Calendar, MessageSquare, CheckCircle, 
  X, Clock, ChevronRight, User as UserIcon, Phone, Mail, 
  Building, MoreVertical, FileText, Target
} from 'lucide-react';

interface LeadManagementProps {
  currentUser: User;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  moms: MOM[];
  setMoms: React.Dispatch<React.SetStateAction<MOM[]>>;
  followUps: FollowUp[];
  setFollowUps: React.Dispatch<React.SetStateAction<FollowUp[]>>;
  onUpdateLead: (leadId: string, updates: Partial<Lead>) => void;
}

const LeadManagement: React.FC<LeadManagementProps> = ({ 
  currentUser, 
  leads, 
  setLeads, 
  moms, 
  setMoms, 
  followUps, 
  setFollowUps,
  onUpdateLead
}) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMOMModalOpen, setIsMOMModalOpen] = useState(false);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  
  // Filter Logic
  const filteredLeads = useMemo(() => {
    let filtered = leads;
    
    // RBAC: Super Admin sees all. Others see assigned.
    if (currentUser.role !== 'super_admin' && currentUser.role !== 'manager') { 
       if (currentUser.role === 'super_admin') {
         // All access
       } else {
         filtered = filtered.filter(l => l.assignedTo === currentUser.id);
       }
    }
    
    return filtered;
  }, [leads, currentUser]);

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'qualified': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'proposal': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'negotiation': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'closed_won': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'closed_lost': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      source: formData.get('source') as string,
      status: 'new',
      assignedTo: currentUser.id, // Default to self
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: formData.get('notes') as string
    };
    setLeads([...leads, newLead]);
    setIsCreateModalOpen(false);
  };

  const handleAddMOM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const newMOM: MOM = {
      id: Math.random().toString(36).substr(2, 9),
      leadId: selectedLead.id,
      meetingDate: new Date().toISOString(),
      attendees: (formData.get('attendees') as string).split(',').map(s => s.trim()),
      discussionPoints: formData.get('discussionPoints') as string,
      actionItems: formData.get('actionItems') as string,
      recordedBy: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setMoms([...moms, newMOM]);
    setIsMOMModalOpen(false);
  };

  const handleScheduleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    const formData = new FormData(e.target as HTMLFormElement);
    const newFollowUp: FollowUp = {
      id: Math.random().toString(36).substr(2, 9),
      leadId: selectedLead.id,
      scheduledDate: formData.get('scheduledDate') as string,
      type: formData.get('type') as any,
      status: 'pending',
      notes: formData.get('notes') as string,
      assignedTo: currentUser.id,
      createdAt: new Date().toISOString()
    };
    setFollowUps([...followUps, newFollowUp]);
    setIsFollowUpModalOpen(false);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (selectedLead) {
      onUpdateLead(selectedLead.id, { status: e.target.value as any });
      // Update local selected lead state to reflect change immediately in UI
      setSelectedLead({ ...selectedLead, status: e.target.value as any });
    }
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-dark-900">
      {/* ... (rest of the layout remains same until modals) ... */}
      
      {/* Left List Panel */}
      <div className={`${selectedLead ? 'hidden md:flex md:w-1/3 lg:w-1/4' : 'w-full'} flex-col border-r border-slate-300 dark:border-dark-700 bg-white dark:bg-dark-800 transition-all`}>
        <div className="p-4 border-b border-slate-300 dark:border-dark-700">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center">
              <Target className="mr-2 text-primary-500" /> Leads
            </h1>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="p-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search leads..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 placeholder-slate-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredLeads.map(lead => (
            <div 
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              className={`p-4 border-b border-slate-200 dark:border-dark-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors ${selectedLead?.id === lead.id ? 'bg-blue-50 dark:bg-dark-700 border-l-4 border-l-primary-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white">{lead.firstName} {lead.lastName}</h3>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(lead.status)}`}>
                  {lead.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{lead.company}</p>
              <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 gap-3">
                <span className="flex items-center"><Phone size={12} className="mr-1" /> Call</span>
                <span className="flex items-center"><Mail size={12} className="mr-1" /> Email</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Detail Panel */}
      {selectedLead ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-dark-900">
          {/* Header */}
          <div className="bg-white dark:bg-dark-800 border-b border-slate-300 dark:border-dark-700 p-6 flex justify-between items-start shadow-sm z-10">
            <div>
              <button onClick={() => setSelectedLead(null)} className="md:hidden mb-2 text-slate-600 flex items-center">
                <ChevronRight className="rotate-180 mr-1" size={16} /> Back
              </button>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedLead.firstName} {selectedLead.lastName}</h2>
                <select 
                  value={selectedLead.status}
                  onChange={handleStatusChange}
                  className={`text-xs uppercase font-bold px-3 py-1 rounded-full border cursor-pointer focus:ring-2 focus:ring-offset-1 ${getStatusColor(selectedLead.status)}`}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center"><Building size={16} className="mr-2" /> {selectedLead.company}</span>
                <span className="flex items-center"><Mail size={16} className="mr-2" /> {selectedLead.email}</span>
                <span className="flex items-center"><Phone size={16} className="mr-2" /> {selectedLead.phone}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsFollowUpModalOpen(true)}
                className="flex items-center px-4 py-2 bg-white dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-dark-600 transition-colors text-slate-700 dark:text-slate-200"
              >
                <Clock size={16} className="mr-2 text-orange-500" /> Schedule Follow-up
              </button>
              <button 
                onClick={() => setIsMOMModalOpen(true)}
                className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20"
              >
                <FileText size={16} className="mr-2" /> Add MOM
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Info & MOMs */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Notes Section */}
                <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-slate-300 dark:border-dark-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Overview</h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedLead.notes || "No notes available."}
                  </p>
                </div>

                {/* MOMs Section */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                    <FileText size={16} className="mr-2" /> Minutes of Meeting
                  </h3>
                  <div className="space-y-4">
                    {moms.filter(m => m.leadId === selectedLead.id).length === 0 ? (
                      <p className="text-slate-500 italic">No meetings recorded yet.</p>
                    ) : (
                      moms.filter(m => m.leadId === selectedLead.id).map(mom => (
                        <div key={mom.id} className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-slate-300 dark:border-dark-700 relative">
                          <div className="absolute top-6 right-6 text-xs text-slate-500 font-mono">
                            {new Date(mom.meetingDate).toLocaleDateString()}
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-2">Meeting Record</h4>
                          <div className="space-y-3">
                            <div>
                              <span className="text-xs font-bold text-slate-600 uppercase">Attendees</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {mom.attendees.map((a, i) => (
                                  <span key={i} className="text-xs bg-slate-100 dark:bg-dark-700 px-2 py-1 rounded text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-transparent">{a}</span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-600 uppercase">Discussion</span>
                              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{mom.discussionPoints}</p>
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-600 uppercase text-primary-600">Action Items</span>
                              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 bg-primary-50 dark:bg-primary-900/10 p-2 rounded border-l-2 border-primary-500">
                                {mom.actionItems}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Follow-ups & Info */}
              <div className="space-y-6">
                {/* Upcoming Follow-ups */}
                <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-slate-300 dark:border-dark-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center">
                    <Clock size={16} className="mr-2" /> Next Actions
                  </h3>
                  <div className="space-y-3">
                    {followUps.filter(f => f.leadId === selectedLead.id && f.status === 'pending').length === 0 ? (
                      <p className="text-slate-500 text-sm italic">No pending follow-ups.</p>
                    ) : (
                      followUps.filter(f => f.leadId === selectedLead.id && f.status === 'pending').map(fu => (
                        <div key={fu.id} className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800/30">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">{fu.type}</span>
                            <span className="text-xs text-blue-600 dark:text-blue-400">{new Date(fu.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{fu.notes}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Lead Details Card */}
                <div className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-sm border border-slate-300 dark:border-dark-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-dark-700">
                      <span className="text-slate-600 dark:text-slate-400">Source</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLead.source}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-dark-700">
                      <span className="text-slate-600 dark:text-slate-400">Assigned To</span>
                      <span className="font-medium text-slate-900 dark:text-white">{selectedLead.assignedTo}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-200 dark:border-dark-700">
                      <span className="text-slate-600 dark:text-slate-400">Created</span>
                      <span className="font-medium text-slate-900 dark:text-white">{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50 dark:bg-dark-900 text-slate-400 flex-col">
          <Target size={64} className="mb-4 opacity-20" />
          <p>Select a lead to view details</p>
        </div>
      )}

      {/* Modals */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-dark-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add New Lead</h2>
            <form onSubmit={handleCreateLead} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <input name="firstName" required placeholder="First Name" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500" />
                 <input name="lastName" required placeholder="Last Name" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500" />
               </div>
               <input name="company" required placeholder="Company" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500" />
               <div className="grid grid-cols-2 gap-4">
                 <input name="email" type="email" required placeholder="Email" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500" />
                 <input name="phone" placeholder="Phone" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500" />
               </div>
               <select name="source" required className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500">
                 <option value="" disabled selected>Select Source</option>
                 <option value="Website">Website</option>
                 <option value="Referral">Referral</option>
                 <option value="LinkedIn">LinkedIn</option>
                 <option value="Cold Call">Cold Call</option>
                 <option value="Event">Event</option>
                 <option value="Other">Other</option>
               </select>
               <textarea name="notes" placeholder="Initial Notes" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500 h-24"></textarea>
               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Create Lead</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {isMOMModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-dark-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Add MOM</h2>
            <form onSubmit={handleAddMOM} className="space-y-4">
               <input name="attendees" required placeholder="Attendees (comma separated)" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500" />
               <textarea name="discussionPoints" required placeholder="Discussion Points" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500 h-24"></textarea>
               <textarea name="actionItems" required placeholder="Action Items" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500 h-24"></textarea>
               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={() => setIsMOMModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save MOM</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {isFollowUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-dark-700">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Schedule Follow-up</h2>
            <form onSubmit={handleScheduleFollowUp} className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <select name="type" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500">
                   <option value="call">Call</option>
                   <option value="email">Email</option>
                   <option value="meeting">Meeting</option>
                   <option value="other">Other</option>
                 </select>
                 <input name="scheduledDate" type="date" required className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500" />
               </div>
               <textarea name="notes" required placeholder="Notes / Agenda" className="w-full p-3 bg-slate-50 dark:bg-dark-700 rounded-lg border-none focus:ring-2 focus:ring-primary-500 h-24"></textarea>
               <div className="flex justify-end gap-3 mt-6">
                 <button type="button" onClick={() => setIsFollowUpModalOpen(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
                 <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Schedule</button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagement;
