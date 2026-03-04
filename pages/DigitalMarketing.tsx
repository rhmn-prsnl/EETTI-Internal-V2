import React, { useState } from 'react';
import { User, SEOKeyword, Backlink, SEOTask, SocialPost, AdCampaign } from '../types';
import { 
  Search, Plus, Filter, Download, ExternalLink, Trash2, Edit2, 
  CheckCircle, AlertCircle, TrendingUp, TrendingDown, 
  Globe, Share2, DollarSign, BarChart2, Calendar, Image as ImageIcon,
  MoreVertical, CheckSquare, Clock, Link, ShieldCheck, Zap
} from 'lucide-react';
import ConfirmationModal from '../components/ui/ConfirmationModal';

interface DigitalMarketingProps {
  currentUser: User;
}

const DigitalMarketing: React.FC<DigitalMarketingProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'seo' | 'social' | 'ads'>('audit');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  
  // --- AUDIT STATE ---
  const [auditUrl, setAuditUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);

  // --- SEO STATE ---
  const [keywords, setKeywords] = useState<SEOKeyword[]>([
    { id: '1', keyword: 'best crm software', position: 5, previousPosition: 8, searchVolume: 1200, difficulty: 45, url: 'https://example.com/crm', lastUpdated: '2023-10-25' },
    { id: '2', keyword: 'employee management tool', position: 12, previousPosition: 15, searchVolume: 800, difficulty: 30, url: 'https://example.com/employee', lastUpdated: '2023-10-25' },
  ]);
  const [backlinks, setBacklinks] = useState<Backlink[]>([
    { id: '1', domain: 'techcrunch.com', targetUrl: 'https://example.com', authority: 92, status: 'active', acquiredDate: '2023-09-15' },
    { id: '2', domain: 'medium.com', targetUrl: 'https://example.com/blog', authority: 88, status: 'active', acquiredDate: '2023-10-01' },
  ]);
  const [seoTasks, setSeoTasks] = useState<SEOTask[]>([
    { id: '1', task: 'Fix broken links on homepage', category: 'technical', status: 'pending', priority: 'high' },
    { id: '2', task: 'Optimize meta tags for blog', category: 'on-page', status: 'in_progress', priority: 'medium' },
  ]);

  // --- SOCIAL STATE ---
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([
    { 
      id: '1', platform: 'linkedin', content: 'Excited to announce our new feature!', 
      scheduledDate: '2023-11-01T10:00', status: 'scheduled', createdBy: 'admin',
      engagement: { likes: 0, shares: 0, comments: 0, clicks: 0 }
    },
    { 
      id: '2', platform: 'twitter', content: 'Check out our latest blog post.', 
      scheduledDate: '2023-10-28T14:00', status: 'posted', createdBy: 'admin',
      engagement: { likes: 12, shares: 5, comments: 2, clicks: 45 }
    }
  ]);

  // --- ADS STATE ---
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([
    { 
      id: '1', name: 'Q4 Lead Gen', platform: 'google', status: 'active', 
      startDate: '2023-10-01', budget: 5000, spent: 1200, 
      clicks: 450, impressions: 12000, leads: 35, revenue: 8000 
    },
    { 
      id: '2', name: 'Brand Awareness', platform: 'meta', status: 'paused', 
      startDate: '2023-09-01', endDate: '2023-09-30', budget: 2000, spent: 1950, 
      clicks: 800, impressions: 45000, leads: 12, revenue: 1500 
    }
  ]);

  // --- MODALS ---
  const [isKeywordModalOpen, setIsKeywordModalOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  
  // --- HANDLERS ---
  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditUrl) return;
    
    setIsAuditing(true);
    setAuditResult(null);
    
    try {
      const response = await fetch('http://localhost:3000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: auditUrl })
      });
      
      const data = await response.json();
      if (response.ok) {
        setAuditResult(data);
      } else {
        alert('Audit failed: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect to audit server.');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to add keyword
    setIsKeywordModalOpen(false);
  };

  const handleAddPost = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to add post
    setIsPostModalOpen(false);
  };

  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to add campaign
    setIsCampaignModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-300 dark:border-dark-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <Globe className="mr-3 text-primary-500" size={28} /> Digital Marketing
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Manage SEO, Social Media, and Paid Campaigns.</p>
          </div>
          <div className="flex gap-3 items-center">
             <select 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-dark-700 border border-slate-300 dark:border-dark-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
             >
                <option value="all">All Clients</option>
                <option value="client_1">Acme Corp</option>
                <option value="client_2">Globex Inc</option>
             </select>

             {activeTab === 'seo' && (
               <button onClick={() => setIsKeywordModalOpen(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                 <Plus className="mr-2" size={18} /> Add Keyword
               </button>
             )}
             {activeTab === 'social' && (
               <button onClick={() => setIsPostModalOpen(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                 <Plus className="mr-2" size={18} /> Create Post
               </button>
             )}
             {activeTab === 'ads' && (
               <button onClick={() => setIsCampaignModalOpen(true)} className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                 <Plus className="mr-2" size={18} /> New Campaign
               </button>
             )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-slate-100 dark:bg-dark-700 p-1 rounded-xl border border-slate-200 dark:border-dark-600 w-fit">
          <button onClick={() => setActiveTab('audit')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'audit' ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Audit & Proposal</button>
          <button onClick={() => setActiveTab('seo')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'seo' ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>SEO Management</button>
          <button onClick={() => setActiveTab('social')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'social' ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Social Media</button>
          <button onClick={() => setActiveTab('ads')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'ads' ? 'bg-white dark:bg-dark-800 text-primary-700 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>Paid Ads</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        
        {/* AUDIT TAB */}
        {activeTab === 'audit' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white dark:bg-dark-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-dark-700 text-center">
               <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Website Audit & Proposal Generator</h2>
               <p className="text-slate-500 dark:text-slate-400 mb-8">Enter a URL to automatically scan for SEO issues, social links, and generate a client report.</p>
               
               <form onSubmit={handleAudit} className="flex gap-4 max-w-xl mx-auto">
                  <input 
                    type="text" 
                    placeholder="example.com" 
                    value={auditUrl}
                    onChange={(e) => setAuditUrl(e.target.value)}
                    className="flex-1 p-4 rounded-xl border border-slate-300 dark:border-dark-600 bg-slate-50 dark:bg-dark-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    required
                  />
                  <button 
                    type="submit" 
                    disabled={isAuditing}
                    className="px-8 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isAuditing ? <span className="animate-spin mr-2">⏳</span> : <Zap className="mr-2" />}
                    {isAuditing ? 'Scanning...' : 'Run Audit'}
                  </button>
               </form>
            </div>

            {auditResult && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                 {/* Report Header */}
                 <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Audit Report: {auditResult.url}</h3>
                    <button className="flex items-center text-primary-600 hover:text-primary-700 font-medium">
                       <Download size={18} className="mr-2" /> Download PDF
                    </button>
                 </div>

                 {/* Score Cards */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                       <p className="text-xs font-bold text-slate-500 uppercase">Meta Health</p>
                       <div className="flex items-center mt-2">
                          <div className={`text-3xl font-bold ${auditResult.meta.title.status === 'good' ? 'text-green-500' : 'text-orange-500'}`}>
                             {auditResult.meta.title.status === 'good' ? 'Good' : 'Needs Work'}
                          </div>
                       </div>
                       <p className="text-sm text-slate-500 mt-2">Title & Description check</p>
                    </div>
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                       <p className="text-xs font-bold text-slate-500 uppercase">Social Presence</p>
                       <div className="flex items-center mt-2">
                          <div className="text-3xl font-bold text-blue-500">{auditResult.social.found.length}</div>
                          <span className="text-sm text-slate-400 ml-2">Profiles Found</span>
                       </div>
                       <div className="flex gap-2 mt-2">
                          {auditResult.social.found.map((s: string) => (
                             <span key={s} className="text-xs px-2 py-1 bg-slate-100 dark:bg-dark-700 rounded capitalize text-slate-600 dark:text-slate-300">{s}</span>
                          ))}
                       </div>
                    </div>
                    <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                       <p className="text-xs font-bold text-slate-500 uppercase">Security</p>
                       <div className="flex items-center mt-2">
                          <ShieldCheck className={`mr-2 ${auditResult.performance.ssl === 'Secure' ? 'text-green-500' : 'text-red-500'}`} />
                          <div className="text-xl font-bold text-slate-900 dark:text-white">{auditResult.performance.ssl}</div>
                       </div>
                    </div>
                 </div>

                 {/* Detailed Breakdown */}
                 <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 overflow-hidden">
                    <div className="p-4 bg-slate-50 dark:bg-dark-700/50 border-b border-slate-200 dark:border-dark-700">
                       <h4 className="font-bold text-slate-900 dark:text-white">Technical Details</h4>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-dark-700">
                       {Object.entries(auditResult.meta).map(([key, data]: [string, any]) => (
                          <div key={key} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                             <div className="flex-1">
                                <span className="text-xs font-bold text-slate-500 uppercase block mb-1">{key}</span>
                                <p className="text-sm text-slate-900 dark:text-white font-mono break-all">{data.value || 'Missing'}</p>
                             </div>
                             <div className="flex items-center gap-4 min-w-[200px]">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                   data.status === 'good' ? 'bg-green-100 text-green-800' : 
                                   data.status === 'error' ? 'bg-red-100 text-red-800' : 
                                   'bg-yellow-100 text-yellow-800'
                                }`}>
                                   {data.status}
                                </span>
                                <p className="text-xs text-slate-500 flex-1 text-right">{data.message}</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <div className="space-y-6">
            {/* SEO Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Avg. Position</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8.4 <span className="text-green-500 text-sm font-normal flex items-center inline-flex"><TrendingUp size={14} className="mr-1"/> +1.2</span></p>
              </div>
              <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Backlinks</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{backlinks.length}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Pending Tasks</p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{seoTasks.filter(t => t.status !== 'completed').length}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                <p className="text-xs font-bold text-slate-500 uppercase">Keywords Tracked</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{keywords.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Keywords Table */}
              <div className="lg:col-span-2 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-dark-700 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white">Keyword Rankings</h3>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View Report</button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase">
                      <th className="p-3 font-semibold">Keyword</th>
                      <th className="p-3 font-semibold">Pos</th>
                      <th className="p-3 font-semibold">Vol</th>
                      <th className="p-3 font-semibold">Diff</th>
                      <th className="p-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                    {keywords.map(kw => (
                      <tr key={kw.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                        <td className="p-3">
                          <div className="font-medium text-slate-900 dark:text-white">{kw.keyword}</div>
                          <div className="text-xs text-slate-500 truncate max-w-[150px]">{kw.url}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center">
                            <span className="font-bold text-slate-900 dark:text-white mr-2">{kw.position}</span>
                            {kw.position < kw.previousPosition ? (
                              <span className="text-green-500 text-xs flex items-center"><TrendingUp size={12} className="mr-0.5"/> {kw.previousPosition - kw.position}</span>
                            ) : kw.position > kw.previousPosition ? (
                              <span className="text-red-500 text-xs flex items-center"><TrendingDown size={12} className="mr-0.5"/> {kw.position - kw.previousPosition}</span>
                            ) : (
                              <span className="text-slate-400 text-xs">-</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-sm text-slate-600 dark:text-slate-400">{kw.searchVolume}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${kw.difficulty > 70 ? 'bg-red-100 text-red-700' : kw.difficulty > 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {kw.difficulty}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><MoreVertical size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Technical SEO Checklist */}
              <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-dark-700">
                  <h3 className="font-bold text-slate-900 dark:text-white">SEO Checklist</h3>
                </div>
                <div className="p-4 space-y-3">
                  {seoTasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-dark-700/30 rounded-lg border border-slate-100 dark:border-dark-700">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${task.status === 'completed' ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 dark:border-slate-500'}`}>
                        {task.status === 'completed' && <CheckSquare size={12} />}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{task.task}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs px-1.5 py-0.5 bg-slate-200 dark:bg-dark-600 rounded text-slate-600 dark:text-slate-300 capitalize">{task.category}</span>
                          <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${task.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{task.priority}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-dark-700 rounded-lg border border-dashed border-primary-200 dark:border-primary-900/30 transition-colors">
                    + Add Task
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            {/* Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {['facebook', 'instagram', 'twitter', 'linkedin'].map(platform => (
                  <div key={platform} className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 flex items-center justify-between shadow-sm">
                     <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                           platform === 'facebook' ? 'bg-blue-600 text-white' :
                           platform === 'instagram' ? 'bg-pink-600 text-white' :
                           platform === 'twitter' ? 'bg-sky-500 text-white' :
                           'bg-blue-700 text-white'
                        }`}>
                           <Share2 size={16} />
                        </div>
                        <span className="font-bold capitalize text-slate-900 dark:text-white">{platform}</span>
                     </div>
                     <button className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-dark-700 hover:bg-slate-200 dark:hover:bg-dark-600 rounded-lg font-medium text-slate-600 dark:text-slate-300 transition-colors">
                        Connect
                     </button>
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Calendar Preview (Mock) */}
              <div className="md:col-span-2 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-6">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center"><Calendar className="mr-2" size={20}/> Content Calendar</h3>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="aspect-square border border-slate-100 dark:border-dark-700 rounded-lg p-1 relative hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors">
                      <span className="text-xs text-slate-400 absolute top-1 left-2">{i + 1}</span>
                      {i === 3 && <div className="mt-4 mx-1 p-1 bg-blue-100 text-blue-700 text-[10px] rounded truncate">LinkedIn Post</div>}
                      {i === 5 && <div className="mt-4 mx-1 p-1 bg-sky-100 text-sky-700 text-[10px] rounded truncate">Twitter Thread</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                   <p className="text-xs font-bold text-slate-500 uppercase">Total Engagement</p>
                   <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">1,245</p>
                </div>
                <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                   <p className="text-xs font-bold text-slate-500 uppercase">Scheduled Posts</p>
                   <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">8</p>
                </div>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
               <div className="p-4 border-b border-slate-200 dark:border-dark-700">
                  <h3 className="font-bold text-slate-900 dark:text-white">Recent Posts</h3>
               </div>
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase">
                      <th className="p-4">Content</th>
                      <th className="p-4">Platform</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Engagement</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                    {socialPosts.map(post => (
                      <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                        <td className="p-4">
                          <p className="text-sm text-slate-900 dark:text-white font-medium truncate max-w-xs">{post.content}</p>
                          {post.mediaUrl && <span className="text-xs text-blue-500 flex items-center mt-1"><ImageIcon size={12} className="mr-1"/> Has Media</span>}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${
                            post.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                            post.platform === 'twitter' ? 'bg-sky-100 text-sky-800' :
                            post.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>{post.platform}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {new Date(post.scheduledDate).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            post.status === 'posted' ? 'bg-green-100 text-green-800' :
                            post.status === 'scheduled' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{post.status.replace('_', ' ')}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {post.engagement ? (
                            <div className="flex gap-3">
                              <span title="Likes">👍 {post.engagement.likes}</span>
                              <span title="Shares">🔄 {post.engagement.shares}</span>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><Edit2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
          </div>
        )}

        {/* ADS TAB */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            {/* Connectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {['google', 'meta'].map(platform => (
                  <div key={platform} className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 flex items-center justify-between shadow-sm">
                     <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                           platform === 'google' ? 'bg-red-500 text-white' :
                           'bg-blue-600 text-white'
                        }`}>
                           <DollarSign size={16} />
                        </div>
                        <span className="font-bold capitalize text-slate-900 dark:text-white">{platform} Ads</span>
                     </div>
                     <button className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-dark-700 hover:bg-slate-200 dark:hover:bg-dark-600 rounded-lg font-medium text-slate-600 dark:text-slate-300 transition-colors">
                        Connect Account
                     </button>
                  </div>
               ))}
            </div>

            {/* Ads Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                  <p className="text-xs font-bold text-slate-500 uppercase">Total Spend</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹{campaigns.reduce((acc, c) => acc + c.spent, 0).toLocaleString()}</p>
               </div>
               <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                  <p className="text-xs font-bold text-slate-500 uppercase">Total Leads</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{campaigns.reduce((acc, c) => acc + c.leads, 0)}</p>
               </div>
               <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                  <p className="text-xs font-bold text-slate-500 uppercase">Avg. CPL</p>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                    ₹{Math.round(campaigns.reduce((acc, c) => acc + c.spent, 0) / campaigns.reduce((acc, c) => acc + c.leads, 0) || 0)}
                  </p>
               </div>
               <div className="bg-white dark:bg-dark-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700">
                  <p className="text-xs font-bold text-slate-500 uppercase">Total ROI</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {Math.round(((campaigns.reduce((acc, c) => acc + c.revenue, 0) - campaigns.reduce((acc, c) => acc + c.spent, 0)) / campaigns.reduce((acc, c) => acc + c.spent, 0)) * 100)}%
                  </p>
               </div>
            </div>

            {/* Campaigns List */}
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
               <div className="p-4 border-b border-slate-200 dark:border-dark-700">
                  <h3 className="font-bold text-slate-900 dark:text-white">Active Campaigns</h3>
               </div>
               <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase">
                      <th className="p-4">Campaign</th>
                      <th className="p-4">Platform</th>
                      <th className="p-4">Budget</th>
                      <th className="p-4">Spent</th>
                      <th className="p-4">Leads</th>
                      <th className="p-4">CPL</th>
                      <th className="p-4">ROI</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                    {campaigns.map(camp => {
                      const cpl = Math.round(camp.spent / (camp.leads || 1));
                      const roi = Math.round(((camp.revenue - camp.spent) / camp.spent) * 100);
                      return (
                        <tr key={camp.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                          <td className="p-4 font-medium text-slate-900 dark:text-white">{camp.name}</td>
                          <td className="p-4 capitalize text-slate-600 dark:text-slate-400">{camp.platform}</td>
                          <td className="p-4 text-slate-900 dark:text-white">₹{camp.budget.toLocaleString()}</td>
                          <td className="p-4 text-slate-900 dark:text-white">
                            ₹{camp.spent.toLocaleString()}
                            <div className="w-20 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-blue-500" style={{ width: `${Math.min((camp.spent / camp.budget) * 100, 100)}%` }}></div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-900 dark:text-white">{camp.leads}</td>
                          <td className="p-4 text-slate-600 dark:text-slate-400">₹{cpl}</td>
                          <td className={`p-4 font-bold ${roi > 0 ? 'text-green-600' : 'text-red-600'}`}>{roi}%</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                              camp.status === 'active' ? 'bg-green-100 text-green-800' :
                              camp.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>{camp.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
               </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals would go here - simplified for brevity */}
      {isKeywordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
           <div className="bg-white dark:bg-dark-800 p-6 rounded-xl w-96">
              <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add Keyword</h3>
              <p className="text-sm text-slate-500 mb-4">Mock functionality - would add to list.</p>
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsKeywordModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                <button onClick={handleAddKeyword} className="px-4 py-2 bg-primary-600 text-white rounded-lg">Add</button>
              </div>
           </div>
        </div>
      )}
      {/* Similar modals for Post and Campaign */}
    </div>
  );
};

export default DigitalMarketing;
