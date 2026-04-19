import React, { useState } from 'react';
import { User } from '../types';
import { Shield, FileText, AlertTriangle, Lock, Search, Filter, Plus, Clock, CheckCircle2, XCircle, Download, FileSignature } from 'lucide-react';
import Button from '../components/ui/Button';

interface ComplianceLegalProps {
  user: User;
}

const ComplianceLegal: React.FC<ComplianceLegalProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'ndas' | 'contracts' | 'privacy' | 'audit'>('ndas');
  const [searchTerm, setSearchTerm] = useState('');
  const [ndas, setNdas] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const renderNDATracking = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search NDAs..." 
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="flex items-center"><Filter size={18} className="mr-2" /> Filter</Button>
        </div>
        <Button className="flex items-center"><Plus size={18} className="mr-2" /> New NDA</Button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-700">
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Party Name</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Type</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Signed Date</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Expiry Date</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {ndas.filter(nda => nda.partyName.toLowerCase().includes(searchTerm.toLowerCase())).map(nda => (
              <tr key={nda.id} className="border-b border-slate-100 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <td className="p-4 font-medium text-slate-900 dark:text-white">{nda.partyName}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{nda.type}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    nda.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                    nda.status === 'Pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {nda.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{nda.signedDate || '-'}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{nda.expiryDate || '-'}</td>
                <td className="p-4">
                  <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm flex items-center">
                    <Download size={16} className="mr-1" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <FileSignature size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Active Contracts</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">24</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Expiring in 30 Days</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">3</p>
          </div>
        </div>
        <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Expired</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">1</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search Contracts..." 
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="flex items-center"><Filter size={18} className="mr-2" /> Filter</Button>
        </div>
        <Button className="flex items-center"><Plus size={18} className="mr-2" /> Add Contract</Button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-700">
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Title</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Vendor/Party</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Expiry Date</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Value</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Auto-Renew</th>
            </tr>
          </thead>
          <tbody>
            {contracts.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.vendor.toLowerCase().includes(searchTerm.toLowerCase())).map(contract => (
              <tr key={contract.id} className="border-b border-slate-100 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors">
                <td className="p-4 font-medium text-slate-900 dark:text-white">{contract.title}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{contract.vendor}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center w-max ${
                    contract.status === 'Active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                    contract.status === 'Expiring Soon' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' : 
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {contract.status === 'Expiring Soon' && <AlertTriangle size={12} className="mr-1" />}
                    {contract.status}
                  </span>
                </td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{contract.expiryDate}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{contract.value}</td>
                <td className="p-4">
                  {contract.autoRenew ? <CheckCircle2 size={18} className="text-emerald-500" /> : <XCircle size={18} className="text-slate-300 dark:text-slate-600" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <Shield className="mr-2 text-primary-500" /> Data Retention Policies
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Configure how long different types of data are stored before automatic deletion to comply with GDPR/CCPA.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900/50 rounded-lg border border-slate-100 dark:border-dark-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Employee Records</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">After termination</p>
            </div>
            <select defaultValue="7 Years" className="px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg text-sm">
              <option>1 Year</option>
              <option>3 Years</option>
              <option>7 Years</option>
              <option>Indefinitely</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900/50 rounded-lg border border-slate-100 dark:border-dark-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Financial Transactions</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Invoices, expenses, payroll</p>
            </div>
            <select defaultValue="7 Years" className="px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg text-sm">
              <option>3 Years</option>
              <option>5 Years</option>
              <option>7 Years</option>
              <option>10 Years</option>
            </select>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-900/50 rounded-lg border border-slate-100 dark:border-dark-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">System Audit Logs</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">User activity, logins</p>
            </div>
            <select defaultValue="1 Year" className="px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg text-sm">
              <option>30 Days</option>
              <option>90 Days</option>
              <option>1 Year</option>
              <option>3 Years</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Save Policies</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center">
          <Lock className="mr-2 text-primary-500" /> Consent & Privacy Agreements
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Require Cookie Consent</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Show cookie banner to new visitors</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 dark:bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Data Processing Agreement (DPA)</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Require clients to sign DPA on onboarding</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 dark:bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search logs by user or action..." 
              className="pl-10 pr-4 py-2 border border-slate-300 dark:border-dark-600 rounded-lg bg-white dark:bg-dark-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
            <option>Last 24 Hours</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>All Time</option>
          </select>
        </div>
        <Button variant="secondary" className="flex items-center"><Download size={18} className="mr-2" /> Export CSV</Button>
      </div>

      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-dark-700">
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Timestamp</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">User</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Action</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">IP Address</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
              <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Details</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.filter(log => log.user.toLowerCase().includes(searchTerm.toLowerCase()) || log.action.toLowerCase().includes(searchTerm.toLowerCase())).map(log => (
              <tr key={log.id} className="border-b border-slate-100 dark:border-dark-700 hover:bg-slate-50 dark:hover:bg-dark-700/50 transition-colors text-sm">
                <td className="p-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">{log.timestamp}</td>
                <td className="p-4 font-medium text-slate-900 dark:text-white">{log.user}</td>
                <td className="p-4 text-slate-600 dark:text-slate-300">{log.action}</td>
                <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{log.ipAddress}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.status === 'Success' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {log.status}
                  </span>
                </td>
                <td className="p-4 text-slate-500 dark:text-slate-400 truncate max-w-xs" title={log.details}>{log.details || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compliance & Legal</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage NDAs, contracts, privacy settings, and view audit logs.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-dark-800 p-1 rounded-xl mb-6 inline-flex">
        <button
          onClick={() => { setActiveTab('ndas'); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'ndas' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          NDA Tracking
        </button>
        <button
          onClick={() => { setActiveTab('contracts'); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'contracts' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Contracts & Expiry
        </button>
        <button
          onClick={() => { setActiveTab('privacy'); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'privacy' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Data Privacy
        </button>
        <button
          onClick={() => { setActiveTab('audit'); setSearchTerm(''); }}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            activeTab === 'audit' ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {activeTab === 'ndas' && renderNDATracking()}
        {activeTab === 'contracts' && renderContracts()}
        {activeTab === 'privacy' && renderPrivacySettings()}
        {activeTab === 'audit' && renderAuditLogs()}
      </div>
    </div>
  );
};

export default ComplianceLegal;
