import React, { useState } from 'react';
import { Search, Plus, FileText, Mail, Phone, Briefcase, Star, Clock, User as UserIcon, Calendar, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Eye, History, MessageSquare, Upload, FileBadge } from 'lucide-react';
import { User, Resume, ResumeStatus, ResumeHistory, ResumeMOM } from '../types';
import Button from '../components/ui/Button';

interface ResumeManagementProps {
  currentUser: User;
  users: User[];
}

const STATUS_COLORS: Record<ResumeStatus, string> = {
  'new': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  'screening': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  'interviewing': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  'offered': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  'hired': 'bg-green-500/10 text-green-500 border-green-500/20',
  'rejected': 'bg-red-500/10 text-red-500 border-red-500/20',
  'on_hold': 'bg-slate-500/10 text-slate-500 border-slate-500/20'
};

const STATUS_LABELS: Record<ResumeStatus, string> = {
  'new': 'New',
  'screening': 'Screening',
  'interviewing': 'Interviewing',
  'offered': 'Offered',
  'hired': 'Hired',
  'rejected': 'Rejected',
  'on_hold': 'On Hold'
};

const ResumeManagement: React.FC<ResumeManagementProps> = ({ currentUser, users }) => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ResumeStatus | 'all'>('all');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMOMModalOpen, setIsMOMModalOpen] = useState(false);
  
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<Resume>>({
    candidateName: '',
    email: '',
    phone: '',
    experience: 0,
    skills: [],
    status: 'new',
    appliedPosition: '',
    source: ''
  });
  const [skillsInput, setSkillsInput] = useState('');
  
  const [momData, setMomData] = useState({
    interviewer: currentUser.id,
    notes: '',
    decision: ''
  });

  const filteredResumes = resumes.filter(r => {
    const matchesSearch = r.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddResume = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Check unique email
    const emailExists = resumes.some(r => r.email.toLowerCase() === formData.email?.toLowerCase() && r.id !== selectedResume?.id);
    if (emailExists) {
      setError(`A resume with email ${formData.email} already exists.`);
      return;
    }

    const now = new Date().toISOString();
    
    if (selectedResume) {
      // Update
      const updatedResume: Resume = {
        ...selectedResume,
        ...formData as Resume,
        skills: skillsInput.split(',').map(s => s.trim()).filter(s => s),
        updatedAt: now,
        history: [
          { id: `h_${Date.now()}`, resumeId: selectedResume.id, action: 'Resume Details Updated', date: now, performedBy: currentUser.id },
          ...selectedResume.history
        ]
      };
      setResumes(resumes.map(r => r.id === selectedResume.id ? updatedResume : r));
    } else {
      // Create
      const newResume: Resume = {
        ...formData as Resume,
        id: `res_${Date.now()}`,
        skills: skillsInput.split(',').map(s => s.trim()).filter(s => s),
        resumeUrl: '#', // Placeholder for actual file upload
        createdAt: now,
        updatedAt: now,
        history: [
          { id: `h_${Date.now()}`, resumeId: `res_${Date.now()}`, action: 'Resume Uploaded', date: now, performedBy: currentUser.id }
        ],
        moms: []
      };
      setResumes([newResume, ...resumes]);
    }
    
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleAddMOM = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResume) return;

    const now = new Date().toISOString();
    const newMOM: ResumeMOM = {
      id: `m_${Date.now()}`,
      resumeId: selectedResume.id,
      date: now,
      interviewer: momData.interviewer,
      notes: momData.notes,
      decision: momData.decision
    };

    const updatedResume: Resume = {
      ...selectedResume,
      moms: [newMOM, ...selectedResume.moms],
      updatedAt: now,
      history: [
        { id: `h_${Date.now()}`, resumeId: selectedResume.id, action: 'MOM Added', date: now, performedBy: currentUser.id },
        ...selectedResume.history
      ]
    };

    setResumes(resumes.map(r => r.id === selectedResume.id ? updatedResume : r));
    setSelectedResume(updatedResume); // Update view modal state
    setIsMOMModalOpen(false);
    setMomData({ interviewer: currentUser.id, notes: '', decision: '' });
  };

  const updateStatus = (resumeId: string, newStatus: ResumeStatus) => {
    const now = new Date().toISOString();
    setResumes(resumes.map(r => {
      if (r.id === resumeId) {
        const updated = {
          ...r,
          status: newStatus,
          updatedAt: now,
          history: [
            { id: `h_${Date.now()}`, resumeId, action: `Status changed to ${STATUS_LABELS[newStatus]}`, date: now, performedBy: currentUser.id },
            ...r.history
          ]
        };
        if (selectedResume?.id === resumeId) setSelectedResume(updated);
        return updated;
      }
      return r;
    }));
  };

  const resetForm = () => {
    setFormData({
      candidateName: '',
      email: '',
      phone: '',
      experience: 0,
      skills: [],
      status: 'new',
      appliedPosition: '',
      source: ''
    });
    setSkillsInput('');
    setSelectedResume(null);
    setError(null);
  };

  const openEditModal = (resume: Resume) => {
    setSelectedResume(resume);
    setFormData(resume);
    setSkillsInput(resume.skills.join(', '));
    setIsAddModalOpen(true);
  };

  const getUserName = (id: string) => {
    const u = users.find(u => u.id === id);
    return u ? `${u.firstName} ${u.lastName}` : id;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Management</h1>
          <p className="text-dark-400 text-sm">Track candidates, manage resumes, and record interview MoMs.</p>
        </div>
        <Button onClick={() => { resetForm(); setIsAddModalOpen(true); }} className="flex items-center space-x-2">
          <Plus size={16} />
          <span>Upload Resume</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* Resumes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResumes.map(resume => (
          <div key={resume.id} className="bg-dark-900 border border-dark-800 rounded-xl p-5 hover:border-dark-700 transition-colors flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-lg">
                  {resume.candidateName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-medium">{resume.candidateName}</h3>
                  <p className="text-dark-400 text-xs">{resume.appliedPosition || 'General Application'}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${STATUS_COLORS[resume.status]}`}>
                {STATUS_LABELS[resume.status]}
              </span>
            </div>

            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-center text-dark-400 text-sm">
                <Mail size={14} className="mr-2" />
                <span className="truncate">{resume.email}</span>
              </div>
              <div className="flex items-center text-dark-400 text-sm">
                <Phone size={14} className="mr-2" />
                <span>{resume.phone}</span>
              </div>
              <div className="flex items-center text-dark-400 text-sm">
                <Briefcase size={14} className="mr-2" />
                <span>{resume.experience} years exp.</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {resume.skills.slice(0, 3).map((skill, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-dark-800 text-dark-300 rounded text-xs">
                  {skill}
                </span>
              ))}
              {resume.skills.length > 3 && (
                <span className="px-2 py-0.5 bg-dark-800 text-dark-300 rounded text-xs">
                  +{resume.skills.length - 3} more
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dark-800 mt-auto">
              <div className="flex space-x-2">
                <button 
                  onClick={() => { setSelectedResume(resume); setIsViewModalOpen(true); }}
                  className="p-1.5 text-dark-400 hover:text-white hover:bg-dark-800 rounded transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => openEditModal(resume)}
                  className="p-1.5 text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 rounded transition-colors"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button 
                  onClick={() => { setSelectedResume(resume); setIsMOMModalOpen(true); }}
                  className="p-1.5 text-dark-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                  title="Add MoM"
                >
                  <MessageSquare size={16} />
                </button>
              </div>
              <select
                value={resume.status}
                onChange={(e) => updateStatus(resume.id, e.target.value as ResumeStatus)}
                className="text-xs bg-dark-800 border border-dark-700 rounded px-2 py-1 text-white focus:outline-none"
              >
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {filteredResumes.length === 0 && (
          <div className="col-span-full py-12 text-center text-dark-400 bg-dark-900 border border-dark-800 rounded-xl">
            <FileBadge size={48} className="mx-auto mb-4 opacity-20" />
            <p>No resumes found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-dark-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{selectedResume ? 'Edit Resume' : 'Upload New Resume'}</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-dark-400 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3 text-red-500">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <form id="resume-form" onSubmit={handleAddResume} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Candidate Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.candidateName}
                      onChange={e => setFormData({...formData, candidateName: e.target.value})}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Email Address * (Must be unique)</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Experience (Years)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.experience}
                      onChange={e => setFormData({...formData, experience: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Applied Position</label>
                    <input
                      type="text"
                      value={formData.appliedPosition}
                      onChange={e => setFormData({...formData, appliedPosition: e.target.value})}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Source (e.g., LinkedIn, Referral)</label>
                    <input
                      type="text"
                      value={formData.source}
                      onChange={e => setFormData({...formData, source: e.target.value})}
                      className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-300">Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={skillsInput}
                    onChange={e => setSkillsInput(e.target.value)}
                    placeholder="React, Node.js, Python..."
                    className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                {!selectedResume && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-dark-300">Upload Resume File (PDF, DOCX) *</label>
                    <div className="border-2 border-dashed border-dark-700 rounded-xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer bg-dark-800/50">
                      <Upload className="mx-auto h-8 w-8 text-dark-400 mb-3" />
                      <p className="text-sm text-dark-300">Click to browse or drag and drop file here</p>
                      <p className="text-xs text-dark-500 mt-1">Maximum file size: 5MB</p>
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-dark-800 flex justify-end space-x-3 bg-dark-900">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" form="resume-form">{selectedResume ? 'Save Changes' : 'Upload Resume'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {isViewModalOpen && selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-dark-800 flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-500 font-bold text-xl">
                  {selectedResume.candidateName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedResume.candidateName}</h2>
                  <p className="text-dark-400 text-sm">{selectedResume.appliedPosition}</p>
                </div>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-dark-400 hover:text-white transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col md:flex-row">
              {/* Left Column: Details */}
              <div className="p-6 md:w-1/3 border-r border-dark-800 space-y-6 bg-dark-900/50">
                <div>
                  <h4 className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-3">Contact Info</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-dark-300">
                      <Mail size={16} className="mr-3 text-dark-500" />
                      {selectedResume.email}
                    </div>
                    <div className="flex items-center text-sm text-dark-300">
                      <Phone size={16} className="mr-3 text-dark-500" />
                      {selectedResume.phone}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-3">Professional</h4>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-dark-300">
                      <Briefcase size={16} className="mr-3 text-dark-500" />
                      {selectedResume.experience} Years Experience
                    </div>
                    <div className="flex items-center text-sm text-dark-300">
                      <Star size={16} className="mr-3 text-dark-500" />
                      Source: {selectedResume.source || 'N/A'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-3">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedResume.skills.map((skill, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-dark-800 text-dark-300 rounded text-xs border border-dark-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-dark-500 uppercase tracking-wider mb-3">Resume File</h4>
                  <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                    <FileText size={16} />
                    <span>View Document</span>
                  </Button>
                </div>
              </div>

              {/* Right Column: History & MoMs */}
              <div className="p-6 md:w-2/3 space-y-8">
                {/* MoMs Section */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center">
                      <MessageSquare size={18} className="mr-2 text-primary-500" />
                      Minutes of Meeting (MoM)
                    </h3>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => { setIsViewModalOpen(false); setIsMOMModalOpen(true); }}
                    >
                      Add MoM
                    </Button>
                  </div>
                  
                  {selectedResume.moms.length > 0 ? (
                    <div className="space-y-4">
                      {selectedResume.moms.map(mom => (
                        <div key={mom.id} className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2 text-sm text-dark-300">
                              <UserIcon size={14} />
                              <span className="font-medium">{getUserName(mom.interviewer)}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-dark-500">
                              <Calendar size={12} />
                              <span>{new Date(mom.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <p className="text-sm text-dark-200 mb-3 whitespace-pre-wrap">{mom.notes}</p>
                          <div className="bg-dark-900 px-3 py-2 rounded text-xs text-dark-300 border border-dark-700">
                            <span className="font-bold text-dark-400 mr-2">Decision:</span>
                            {mom.decision}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-dark-800/50 rounded-lg border border-dark-700 border-dashed text-dark-400 text-sm">
                      No MoMs recorded yet.
                    </div>
                  )}
                </div>

                {/* History Section */}
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center mb-4">
                    <History size={18} className="mr-2 text-primary-500" />
                    Timeline & History
                  </h3>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-dark-700 before:to-transparent">
                    {selectedResume.history.map((item, idx) => (
                      <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-dark-900 bg-dark-700 text-dark-300 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                          <Clock size={14} />
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-dark-800 p-4 rounded-xl border border-dark-700 shadow">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-white text-sm">{item.action}</span>
                            <span className="text-xs text-dark-500">{new Date(item.date).toLocaleString()}</span>
                          </div>
                          <div className="text-xs text-dark-400">By {getUserName(item.performedBy)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add MoM Modal */}
      {isMOMModalOpen && selectedResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dark-900 border border-dark-800 rounded-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-dark-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Add MoM for {selectedResume.candidateName}</h2>
              <button 
                onClick={() => { setIsMOMModalOpen(false); setIsViewModalOpen(true); }} 
                className="text-dark-400 hover:text-white transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <form id="mom-form" onSubmit={handleAddMOM} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-300">Interviewer</label>
                  <select
                    value={momData.interviewer}
                    onChange={e => setMomData({...momData, interviewer: e.target.value})}
                    className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  >
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-300">Interview Notes *</label>
                  <textarea
                    required
                    rows={4}
                    value={momData.notes}
                    onChange={e => setMomData({...momData, notes: e.target.value})}
                    placeholder="Discussed technical background, project experience..."
                    className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-dark-300">Decision / Next Steps *</label>
                  <input
                    type="text"
                    required
                    value={momData.decision}
                    onChange={e => setMomData({...momData, decision: e.target.value})}
                    placeholder="e.g., Proceed to technical round, Reject"
                    className="w-full px-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
                  />
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-dark-800 flex justify-end space-x-3 bg-dark-900">
              <Button variant="outline" onClick={() => { setIsMOMModalOpen(false); setIsViewModalOpen(true); }}>Cancel</Button>
              <Button type="submit" form="mom-form">Save MoM</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeManagement;
