import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { User as UserIcon, Bell, Moon, Sun, Lock, Shield, Layout, Save, Check, Building, FileText, Settings, Palette, Globe, Type, ToggleLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface SettingsPageProps {
  user: User;
  onUpdateUser: (updates: Partial<User>) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ user, onUpdateUser }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'customization' | 'invoice' | 'modules' | 'security'>('profile');
  
  // Profile State
  const [profileData, setProfileData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: user.bio || ''
  });

  // Company State
  const [companyData, setCompanyData] = useState({
    name: 'TechGlobal Solutions',
    address: '123 Tech Park, Silicon Valley, CA 94025',
    email: 'contact@techglobal.com',
    phone: '+1 (555) 123-4567',
    website: 'www.techglobal.com',
    gstin: '29ABCDE1234F1Z5',
    taxRate: 18
  });

  // Customization State
  const [theme, setTheme] = useState<'light' | 'dark'>(user.preferences?.theme || 'dark');
  const [colorTheme, setColorTheme] = useState<'blue' | 'green' | 'purple' | 'orange'>('blue');
  const [fontFamily, setFontFamily] = useState<'inter' | 'roboto' | 'poppins'>('inter');
  const [language, setLanguage] = useState<'english' | 'tamil'>('english');
  const [notifications, setNotifications] = useState(user.preferences?.notifications ?? true);

  // Invoice Design State
  const [invoiceDesign, setInvoiceDesign] = useState<'modern' | 'classic' | 'minimal'>('modern');

  // Modules State
  const [modules, setModules] = useState({
    finance: true,
    hr: true,
    projects: true,
    crm: true,
    digitalMarketing: true,
    documents: true,
    communication: true
  });

  // Security State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Sync state if user prop changes
  useEffect(() => {
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || ''
    });
    setTheme(user.preferences?.theme || 'dark');
    setNotifications(user.preferences?.notifications ?? true);
  }, [user]);

  const handleSaveProfile = () => {
    onUpdateUser({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      bio: profileData.bio
    });
    showMessage('success', 'Profile updated successfully!');
  };

  const handleSaveCompany = () => {
    showMessage('success', 'Company profile and GST settings saved!');
  };

  const handleSaveCustomization = () => {
    onUpdateUser({
      preferences: {
        theme,
        notifications
      }
    });
    // In a real app, apply theme, font, and language here
    showMessage('success', 'Customization settings saved!');
  };

  const handleSaveInvoiceDesign = () => {
    showMessage('success', 'Invoice design preferences saved!');
  };

  const handleSaveModules = () => {
    showMessage('success', 'Module preferences updated! Refresh to see changes.');
  };

  const handleUpdatePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showMessage('error', 'All password fields are required.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showMessage('error', 'New passwords do not match.');
      return;
    }
    // Simulate API call
    setTimeout(() => {
      setPasswords({ current: '', new: '', confirm: '' });
      showMessage('success', 'Password updated securely.');
    }, 500);
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings & Customization</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account, company profile, and application preferences.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-4 flex items-center ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
          {message.type === 'success' ? <Check size={18} className="mr-2" /> : <Shield size={18} className="mr-2" />}
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Settings Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'profile' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <UserIcon size={18} />
              <span>User Profile</span>
            </button>
            <button
              onClick={() => setActiveTab('company')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'company' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <Building size={18} />
              <span>Company & GST</span>
            </button>
            <button
              onClick={() => setActiveTab('customization')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'customization' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <Palette size={18} />
              <span>Customization</span>
            </button>
            <button
              onClick={() => setActiveTab('invoice')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'invoice' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <FileText size={18} />
              <span>Invoice Design</span>
            </button>
            <button
              onClick={() => setActiveTab('modules')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'modules' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <ToggleLeft size={18} />
              <span>Modules</span>
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                activeTab === 'security' ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-dark-800'
              }`}
            >
              <Shield size={18} />
              <span>Security</span>
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-dark-900 rounded-2xl shadow-sm border border-slate-100 dark:border-dark-800 overflow-hidden min-h-[500px]">
          
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">User Profile</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">This information will be displayed to other users.</p>
              </div>

              <div className="flex items-center space-x-6 pb-6 border-b border-slate-100 dark:border-dark-800">
                <img 
                   src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                   alt={user.username}
                   className="w-20 h-20 rounded-full border-4 border-slate-50 dark:border-dark-800"
                />
                <div>
                  <Button variant="secondary" className="mr-2">Change Avatar</Button>
                  <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                  <input 
                    type="text" 
                    value={profileData.firstName} 
                    onChange={e => setProfileData({...profileData, firstName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    value={profileData.lastName}
                    onChange={e => setProfileData({...profileData, lastName: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bio</label>
                  <textarea 
                    rows={3} 
                    value={profileData.bio}
                    onChange={e => setProfileData({...profileData, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                 <Button onClick={handleSaveProfile}>Save Profile</Button>
              </div>
            </div>
          )}

          {/* Company & GST Settings */}
          {activeTab === 'company' && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Company Profile & GST</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your organization's details and tax configurations.</p>
              </div>

              <div className="space-y-6">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-dark-700 pb-2">Company Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                    <input 
                      type="text" 
                      value={companyData.name} 
                      onChange={e => setCompanyData({...companyData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={companyData.email}
                      onChange={e => setCompanyData({...companyData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                    <input 
                      type="text" 
                      value={companyData.phone}
                      onChange={e => setCompanyData({...companyData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                    <input 
                      type="text" 
                      value={companyData.website}
                      onChange={e => setCompanyData({...companyData, website: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registered Address</label>
                    <textarea 
                      rows={2} 
                      value={companyData.address}
                      onChange={e => setCompanyData({...companyData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>

                <h3 className="font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-dark-700 pb-2 mt-8">GST Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GSTIN Number</label>
                    <input 
                      type="text" 
                      value={companyData.gstin} 
                      onChange={e => setCompanyData({...companyData, gstin: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white uppercase" 
                      placeholder="e.g. 29ABCDE1234F1Z5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Default Tax Rate (%)</label>
                    <input 
                      type="number" 
                      value={companyData.taxRate}
                      onChange={e => setCompanyData({...companyData, taxRate: Number(e.target.value)})}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                 <Button onClick={handleSaveCompany}>Save Company Details</Button>
              </div>
            </div>
          )}

          {/* Customization */}
          {activeTab === 'customization' && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">App Customization</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Personalize your application's appearance and language.</p>
              </div>

              <div className="space-y-6">
                {/* Dark Mode */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-700 rounded-lg shadow-sm">
                      {theme === 'light' ? <Sun size={20} className="text-orange-500" /> : <Moon size={20} className="text-indigo-500" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark interface</p>
                    </div>
                  </div>
                  <div className="flex bg-white dark:bg-dark-700 rounded-lg p-1 border border-slate-200 dark:border-dark-600">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${theme === 'light' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      Light
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${theme === 'dark' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      Dark
                    </button>
                  </div>
                </div>

                {/* Theme Selection */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-700 rounded-lg shadow-sm">
                      <Palette size={20} className="text-pink-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Color Theme</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Choose your primary brand color</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['blue', 'green', 'purple', 'orange'].map(color => (
                      <button
                        key={color}
                        onClick={() => setColorTheme(color as any)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${colorTheme === color ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500' : ''}`}
                        style={{ 
                          backgroundColor: color === 'blue' ? '#3b82f6' : color === 'green' ? '#10b981' : color === 'purple' ? '#8b5cf6' : '#f97316'
                        }}
                      >
                        {colorTheme === color && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Selection */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-700 rounded-lg shadow-sm">
                      <Type size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Typography</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Select the primary font family</p>
                    </div>
                  </div>
                  <select 
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as any)}
                    className="px-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white"
                  >
                    <option value="inter">Inter (Default)</option>
                    <option value="roboto">Roboto</option>
                    <option value="poppins">Poppins</option>
                  </select>
                </div>

                {/* Language Management */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-700">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-dark-700 rounded-lg shadow-sm">
                      <Globe size={20} className="text-teal-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">Language</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Select application language</p>
                    </div>
                  </div>
                  <div className="flex bg-white dark:bg-dark-700 rounded-lg p-1 border border-slate-200 dark:border-dark-600">
                    <button 
                      onClick={() => setLanguage('english')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${language === 'english' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      English
                    </button>
                    <button 
                      onClick={() => setLanguage('tamil')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${language === 'tamil' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>

              </div>

              <div className="pt-4 flex justify-end">
                 <Button onClick={handleSaveCustomization}>Save Customization</Button>
              </div>
            </div>
          )}

          {/* Invoice Design */}
          {activeTab === 'invoice' && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Invoice Design Selection</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Choose how your invoices will look when generated or printed.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Modern Template */}
                <div 
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${invoiceDesign === 'modern' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-dark-700 hover:border-primary-300'}`}
                  onClick={() => setInvoiceDesign('modern')}
                >
                  <div className="aspect-[1/1.4] bg-white border border-slate-200 shadow-sm mb-4 relative overflow-hidden">
                    {/* Mock Modern Invoice */}
                    <div className="absolute top-0 left-0 w-full h-8 bg-slate-800"></div>
                    <div className="p-3 pt-10">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-4 bg-slate-200 rounded"></div>
                        <div className="text-right">
                          <div className="w-16 h-3 bg-slate-800 rounded mb-1"></div>
                          <div className="w-10 h-2 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-1 mb-4">
                        <div className="w-full h-2 bg-slate-100 rounded"></div>
                        <div className="w-full h-2 bg-slate-100 rounded"></div>
                        <div className="w-3/4 h-2 bg-slate-100 rounded"></div>
                      </div>
                      <div className="mt-auto absolute bottom-4 right-4 w-16 h-4 bg-primary-500 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">Modern</span>
                    {invoiceDesign === 'modern' && <Check size={16} className="text-primary-600" />}
                  </div>
                </div>

                {/* Classic Template */}
                <div 
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${invoiceDesign === 'classic' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-dark-700 hover:border-primary-300'}`}
                  onClick={() => setInvoiceDesign('classic')}
                >
                  <div className="aspect-[1/1.4] bg-white border border-slate-200 shadow-sm mb-4 relative overflow-hidden">
                    {/* Mock Classic Invoice */}
                    <div className="p-3">
                      <div className="text-center mb-4 border-b pb-2">
                        <div className="w-20 h-4 bg-slate-800 rounded mx-auto mb-1"></div>
                        <div className="w-32 h-2 bg-slate-200 rounded mx-auto"></div>
                      </div>
                      <div className="flex justify-between mb-4">
                        <div className="w-16 h-8 bg-slate-100 rounded"></div>
                        <div className="w-16 h-8 bg-slate-100 rounded"></div>
                      </div>
                      <div className="space-y-1 mb-4 border border-slate-200 p-1">
                        <div className="w-full h-2 bg-slate-200 rounded"></div>
                        <div className="w-full h-2 bg-slate-100 rounded"></div>
                        <div className="w-full h-2 bg-slate-100 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">Classic</span>
                    {invoiceDesign === 'classic' && <Check size={16} className="text-primary-600" />}
                  </div>
                </div>

                {/* Minimal Template */}
                <div 
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${invoiceDesign === 'minimal' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-dark-700 hover:border-primary-300'}`}
                  onClick={() => setInvoiceDesign('minimal')}
                >
                  <div className="aspect-[1/1.4] bg-white border border-slate-200 shadow-sm mb-4 relative overflow-hidden">
                    {/* Mock Minimal Invoice */}
                    <div className="p-4">
                      <div className="text-left mb-6">
                        <div className="w-16 h-3 bg-slate-400 rounded mb-2"></div>
                        <div className="w-24 h-5 bg-slate-900 rounded"></div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <div className="w-1/2 h-2 bg-slate-100 rounded"></div>
                          <div className="w-1/4 h-2 bg-slate-200 rounded"></div>
                        </div>
                        <div className="flex justify-between">
                          <div className="w-1/2 h-2 bg-slate-100 rounded"></div>
                          <div className="w-1/4 h-2 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <div className="w-10 h-2 bg-slate-100 rounded"></div>
                        <div className="w-12 h-3 bg-slate-800 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900 dark:text-white">Minimal</span>
                    {invoiceDesign === 'minimal' && <Check size={16} className="text-primary-600" />}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                 <Button onClick={handleSaveInvoiceDesign}>Save Invoice Design</Button>
              </div>
            </div>
          )}

          {/* Modules Enable/Disable */}
          {activeTab === 'modules' && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Module Management</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enable or disable specific modules for your organization.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(modules).map(([key, isEnabled]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-100 dark:border-dark-700">
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()} Module
                      </h3>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isEnabled} 
                        onChange={(e) => setModules({...modules, [key]: e.target.checked})} 
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-dark-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-end">
                 <Button onClick={handleSaveModules}>Save Module Settings</Button>
              </div>
            </div>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Security Settings</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage your password and security preferences.</p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="password" 
                        value={passwords.current}
                        onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                          type="password" 
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                          type="password" 
                          value={passwords.confirm}
                          onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                          className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-800 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-dark-700">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">Two-Factor Authentication</h3>
                  <div className="flex items-center justify-between">
                     <p className="text-sm text-slate-500 dark:text-slate-400">Add an extra layer of security to your account.</p>
                     <Button variant="secondary" className="text-xs h-8 px-3">Enable 2FA</Button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                 <Button onClick={handleUpdatePassword}>Update Password</Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;