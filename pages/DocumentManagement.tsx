import React, { useState } from 'react';
import { AppDocument, User, DocumentCategory } from '../types';
import { FileText, Search, Plus, Filter, Download, Eye, Trash2, Upload, History, File, ShieldAlert, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface DocumentManagementProps {
  currentUser: User;
  users: User[];
  userPermissions: string[];
}

const DocumentManagement: React.FC<DocumentManagementProps> = ({ currentUser, users, userPermissions }) => {
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<AppDocument | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isNewVersionModalOpen, setIsNewVersionModalOpen] = useState(false);

  // Form states
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentCategory>('other');
  const [docVisibility, setDocVisibility] = useState<'public' | 'internal' | 'restricted'>('internal');
  const [docTags, setDocTags] = useState('');
  const [versionChanges, setVersionChanges] = useState('');

  const canManage = userPermissions.includes('document_manage') || currentUser.role === 'super_admin';

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(documents.filter(d => d.id !== id));
      if (selectedDoc?.id === id) {
        setIsViewModalOpen(false);
        setSelectedDoc(null);
      }
    }
  };

  const handleUpload = () => {
    if (!docTitle) return alert('Title is required');
    
    const tagsArray = docTags.split(',').map(t => t.trim()).filter(t => t);
    
    const newDoc: AppDocument = {
      id: `doc_${Math.random().toString(36).substr(2, 9)}`,
      title: docTitle,
      description: docDescription,
      category: docCategory,
      visibility: docVisibility,
      tags: tagsArray,
      currentVersion: 1,
      versions: [
        {
          id: `v_${Math.random().toString(36).substr(2, 9)}`,
          versionNumber: 1,
          url: '#',
          uploadedBy: currentUser.id,
          uploadedAt: new Date().toISOString(),
          changes: 'Initial upload'
        }
      ],
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setDocuments([newDoc, ...documents]);
    setIsUploadModalOpen(false);
    resetForm();
  };

  const handleUploadNewVersion = () => {
    if (!selectedDoc) return;
    if (!versionChanges) return alert('Please describe the changes in this version');

    const newVersionNum = selectedDoc.currentVersion + 1;
    const newVersion = {
      id: `v_${Math.random().toString(36).substr(2, 9)}`,
      versionNumber: newVersionNum,
      url: '#',
      uploadedBy: currentUser.id,
      uploadedAt: new Date().toISOString(),
      changes: versionChanges
    };

    const updatedDoc = {
      ...selectedDoc,
      currentVersion: newVersionNum,
      versions: [...(selectedDoc.versions || []), newVersion],
      updatedAt: new Date().toISOString()
    };

    setDocuments(documents.map(d => d.id === selectedDoc.id ? updatedDoc : d));
    setSelectedDoc(updatedDoc);
    setIsNewVersionModalOpen(false);
    setVersionChanges('');
  };

  const resetForm = () => {
    setDocTitle('');
    setDocDescription('');
    setDocCategory('other');
    setDocVisibility('internal');
    setDocTags('');
  };

  // Filter documents based on visibility/access control
  const accessibleDocuments = documents.filter(doc => {
    if (currentUser.role === 'super_admin') return true;
    if (doc.visibility === 'public') return true;
    if (doc.visibility === 'internal' && currentUser.userType !== 'client') return true;
    if (doc.visibility === 'restricted') {
      if (doc.allowedRoles?.includes(currentUser.role)) return true;
      if (doc.allowedUsers?.includes(currentUser.id)) return true;
      if (doc.createdBy === currentUser.id) return true;
      return false;
    }
    return false;
  });

  const filteredDocs = accessibleDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'client': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'project': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
      case 'agreement': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'nda': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'policy': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getUserName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.firstName} ${user.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="text-primary-500" />
            Document Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Securely store, version, and manage corporate documents.
          </p>
        </div>
        {canManage && (
          <Button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2">
            <Upload size={16} /> Upload Document
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-900 p-4 rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search documents by title or tags..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-4 h-4" />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as any)}
            className="bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white"
          >
            <option value="all">All Categories</option>
            <option value="client">Client Documents</option>
            <option value="project">Project Files</option>
            <option value="agreement">Agreements</option>
            <option value="nda">NDAs</option>
            <option value="policy">Internal Policies</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-3">
                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(doc.category)}`}>
                  {doc.category}
                </div>
                {doc.visibility === 'restricted' && (
                  <div className="text-red-500" title="Restricted Access">
                    <ShieldAlert size={16} />
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1" title={doc.title}>
                {doc.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 h-10">
                {doc.description || 'No description provided.'}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {doc.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-300 text-xs rounded">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-dark-800">
                <span>v{doc.currentVersion}.0</span>
                <span>Updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-dark-800/50 p-3 border-t border-slate-200 dark:border-dark-800 flex justify-between items-center">
              <div className="flex gap-2">
                <button 
                  onClick={() => { setSelectedDoc(doc); setIsViewModalOpen(true); }}
                  className="p-1.5 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded hover:bg-slate-200 dark:hover:bg-dark-700"
                  title="View Details & History"
                >
                  <Eye size={16} />
                </button>
                <button 
                  className="p-1.5 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors rounded hover:bg-slate-200 dark:hover:bg-dark-700"
                  title="Download Latest"
                >
                  <Download size={16} />
                </button>
              </div>
              {canManage && (
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-slate-500 hover:text-red-600 transition-colors rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-dark-900 rounded-xl border border-slate-200 dark:border-dark-800 border-dashed">
            <FileText className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No documents found</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* View/History Modal */}
      {isViewModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 dark:border-dark-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedDoc.title}</h2>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getCategoryColor(selectedDoc.category)}`}>
                    {selectedDoc.category}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedDoc.description}</p>
              </div>
              <button onClick={() => setIsViewModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-dark-800 p-3 rounded-lg">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Visibility</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white capitalize flex items-center gap-1">
                    {selectedDoc.visibility === 'restricted' ? <ShieldAlert size={14} className="text-red-500"/> : null}
                    {selectedDoc.visibility}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-dark-800 p-3 rounded-lg">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Created By</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{getUserName(selectedDoc.createdBy)}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <History size={16} className="text-primary-500" /> Version History
              </h3>
              
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-dark-700 before:to-transparent">
                {[...(selectedDoc.versions || [])].reverse().map((version, idx) => (
                  <div key={version.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-dark-900 bg-slate-100 dark:bg-dark-800 text-slate-500 dark:text-slate-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <File size={16} />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">Version {version.versionNumber}.0</span>
                        <span className="text-[10px] text-slate-400">{new Date(version.uploadedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{version.changes}</p>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-dark-700">
                        <span className="text-[10px] text-slate-400">By {getUserName(version.uploadedBy)}</span>
                        <button className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                          <Download size={12} /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {canManage && (
              <div className="p-4 border-t border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-800/50 flex justify-end">
                <Button onClick={() => setIsNewVersionModalOpen(true)} className="flex items-center gap-2">
                  <Upload size={16} /> Upload New Version
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Version Modal */}
      {isNewVersionModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Version {selectedDoc.currentVersion + 1}.0</h2>
              <button onClick={() => setIsNewVersionModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <Input 
                label="Version Changes / Notes" 
                placeholder="e.g., Updated section 3.2" 
                value={versionChanges}
                onChange={(e) => setVersionChanges(e.target.value)}
              />
              <div className="border-2 border-dashed border-slate-300 dark:border-dark-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PDF, DOCX, XLSX up to 50MB</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-800/50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsNewVersionModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUploadNewVersion}>Upload Version</Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-dark-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Upload Document</h2>
              <button onClick={() => { setIsUploadModalOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <Input 
                label="Document Title" 
                placeholder="e.g., Q3 Financial Report" 
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
              />
              <Input 
                label="Description" 
                placeholder="Brief description of the document" 
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select 
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value as DocumentCategory)}
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white"
                  >
                    <option value="client">Client Document</option>
                    <option value="project">Project File</option>
                    <option value="agreement">Agreement</option>
                    <option value="nda">NDA</option>
                    <option value="policy">Internal Policy</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visibility</label>
                  <select 
                    value={docVisibility}
                    onChange={(e) => setDocVisibility(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-dark-700 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/50 dark:text-white"
                  >
                    <option value="public">Public</option>
                    <option value="internal">Internal Only</option>
                    <option value="restricted">Restricted</option>
                  </select>
                </div>
              </div>
              <Input 
                label="Tags (comma separated)" 
                placeholder="e.g., HR, Policy, 2024" 
                value={docTags}
                onChange={(e) => setDocTags(e.target.value)}
              />
              <div className="border-2 border-dashed border-slate-300 dark:border-dark-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-dark-800 transition-colors cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-500 mt-1">PDF, DOCX, XLSX up to 50MB</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-dark-800 bg-slate-50 dark:bg-dark-800/50 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => { setIsUploadModalOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={handleUpload}>Upload</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
