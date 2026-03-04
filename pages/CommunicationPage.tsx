import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Mail, Bell, Activity, Search, Plus, Send, 
  Paperclip, MoreVertical, Phone, Video, X, Trash2, Archive,
  Star, FileText, Check, Clock, User as UserIcon, Shield
} from 'lucide-react';
import { User, ChatChannel, ChatMessage, Email, ActivityLog, AppNotification } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

interface CommunicationPageProps {
  currentUser: User;
  users: User[];
  notifications: AppNotification[];
  onMarkNotificationRead: (id: string) => void;
}

const CommunicationPage: React.FC<CommunicationPageProps> = ({ 
  currentUser, users, notifications, onMarkNotificationRead 
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'email' | 'notifications' | 'activity'>('chat');
  
  // --- CHAT STATE ---
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // --- EMAIL STATE ---
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [emailFolder, setEmailFolder] = useState<'inbox' | 'sent' | 'drafts'>('inbox');
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  // --- SCROLL TO BOTTOM ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannelId]);

  // --- HANDLERS ---

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChannelId) return;

    const msg: ChatMessage = {
      id: Date.now().toString(),
      channelId: activeChannelId,
      senderId: currentUser.id,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isRead: false
    };

    setMessages([...messages, msg]);
    setNewMessage('');
    
    // Update channel last message
    setChannels(channels.map(c => 
      c.id === activeChannelId 
        ? { ...c, lastMessage: newMessage, lastMessageTime: 'Just now' } 
        : c
    ));
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to backend
    alert('Email sent successfully!');
    setIsComposeOpen(false);
  };

  // --- RENDERERS ---

  const renderChat = () => {
    const activeChannel = channels.find(c => c.id === activeChannelId);
    const channelMessages = messages.filter(m => m.channelId === activeChannelId);

    return (
      <div className="flex h-full bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-80 border-r border-slate-200 dark:border-dark-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-dark-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search conversations..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-dark-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 py-2 text-xs font-bold text-slate-500 uppercase">Channels</div>
            {channels.filter(c => c.type === 'group').map(channel => (
              <div 
                key={channel.id}
                onClick={() => setActiveChannelId(channel.id)}
                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700 flex justify-between items-center ${activeChannelId === channel.id ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''}`}
              >
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white"># {channel.name}</h4>
                  <p className="text-xs text-slate-500 truncate max-w-[180px]">{channel.lastMessage}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">{channel.lastMessageTime}</p>
                  {channel.unreadCount ? (
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-500 text-white text-[10px] font-bold rounded-full mt-1">
                      {channel.unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>
            ))}

            <div className="px-4 py-2 mt-4 text-xs font-bold text-slate-500 uppercase">Direct Messages</div>
            {users.slice(0, 5).map(u => (
              <div 
                key={u.id}
                onClick={() => {
                  // Mock creating/switching to DM
                  const existing = channels.find(c => c.type === 'direct' && c.memberIds.includes(u.id));
                  if (existing) setActiveChannelId(existing.id);
                  else {
                    // Create mock DM
                    const newId = `dm_${u.id}`;
                    if (!channels.find(c => c.id === newId)) {
                      setChannels([...channels, { id: newId, type: 'direct', name: u.username, memberIds: [u.id], lastMessage: '', lastMessageTime: '' }]);
                    }
                    setActiveChannelId(newId);
                  }
                }}
                className={`px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700 flex items-center gap-3 ${activeChannelId === `dm_${u.id}` ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500' : ''}`}
              >
                <div className="relative">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`} className="w-8 h-8 rounded-full" alt={u.username} />
                  <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-dark-800 ${u.status === 'active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white text-sm">{u.firstName} {u.lastName}</h4>
                  <p className="text-xs text-slate-500">{u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeChannel ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-dark-700 flex justify-between items-center bg-white dark:bg-dark-800">
                <div className="flex items-center gap-3">
                  {activeChannel.type === 'group' ? (
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-dark-700 flex items-center justify-center text-slate-500">
                      <MessageSquare size={20} />
                    </div>
                  ) : (
                    <img src={`https://ui-avatars.com/api/?name=${activeChannel.name}`} className="w-10 h-10 rounded-full" alt={activeChannel.name} />
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      {activeChannel.type === 'group' ? `# ${activeChannel.name}` : activeChannel.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {activeChannel.type === 'group' ? `${users.length} members` : 'Active now'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 text-slate-400">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-full"><Phone size={20} /></button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-full"><Video size={20} /></button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-dark-700 rounded-full"><MoreVertical size={20} /></button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-dark-900">
                {channelMessages.map(msg => {
                  const isMe = msg.senderId === currentUser.id;
                  const sender = users.find(u => u.id === msg.senderId) || currentUser;
                  
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      {!isMe && (
                        <img src={sender.avatar || `https://ui-avatars.com/api/?name=${sender.username}`} className="w-8 h-8 rounded-full mt-1" alt={sender.username} />
                      )}
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <div className={`px-4 py-2 rounded-2xl text-sm ${
                          isMe 
                            ? 'bg-primary-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-dark-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-dark-700 rounded-tl-none shadow-sm'
                        }`}>
                          {msg.content}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white dark:bg-dark-800 border-t border-slate-200 dark:border-dark-700">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <Paperclip size={20} />
                  </button>
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..." 
                    className="flex-1 bg-slate-100 dark:bg-dark-700 border-0 rounded-full px-4 focus:ring-2 focus:ring-primary-500"
                  />
                  <button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderEmail = () => {
    return (
      <div className="flex h-full bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 overflow-hidden shadow-sm">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-200 dark:border-dark-700 p-4 flex flex-col gap-2">
          <Button onClick={() => setIsComposeOpen(true)} className="w-full justify-center mb-4">
            <Plus size={18} className="mr-2" /> Compose
          </Button>
          
          <button 
            onClick={() => setEmailFolder('inbox')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${emailFolder === 'inbox' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Mail size={18} /> Inbox
            <span className="ml-auto bg-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-full">
              {emails.filter(e => e.folder === 'inbox' && !e.isRead).length}
            </span>
          </button>
          <button 
            onClick={() => setEmailFolder('sent')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${emailFolder === 'sent' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Send size={18} /> Sent
          </button>
          <button 
            onClick={() => setEmailFolder('drafts')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${emailFolder === 'drafts' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={18} /> Drafts
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Trash2 size={18} /> Trash
          </button>
        </div>

        {/* List / Detail */}
        <div className="flex-1 flex min-w-0">
          {/* Email List */}
          <div className={`${selectedEmail ? 'hidden md:block w-80 border-r' : 'w-full'} border-slate-200 dark:border-dark-700 overflow-y-auto`}>
             {emails.filter(e => e.folder === emailFolder).map(email => (
               <div 
                 key={email.id}
                 onClick={() => setSelectedEmail(email)}
                 className={`p-4 border-b border-slate-100 dark:border-dark-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-dark-700 ${selectedEmail?.id === email.id ? 'bg-primary-50 dark:bg-primary-900/10' : ''} ${!email.isRead ? 'bg-slate-50 dark:bg-dark-700/50' : ''}`}
               >
                 <div className="flex justify-between mb-1">
                   <span className={`text-sm font-bold truncate ${!email.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                     {email.from}
                   </span>
                   <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{email.timestamp}</span>
                 </div>
                 <h4 className={`text-sm mb-1 truncate ${!email.isRead ? 'font-bold text-slate-800' : 'text-slate-600'}`}>{email.subject}</h4>
                 <p className="text-xs text-slate-500 truncate">{email.body}</p>
               </div>
             ))}
          </div>

          {/* Email Detail */}
          {selectedEmail ? (
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-dark-800">
              <div className="p-6 border-b border-slate-200 dark:border-dark-700 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{selectedEmail.subject}</h2>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      {selectedEmail.from[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedEmail.from}</p>
                      <p className="text-xs text-slate-500">to {selectedEmail.to.join(', ')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded text-slate-500"><Archive size={18} /></button>
                  <button className="p-2 hover:bg-slate-100 rounded text-slate-500"><Trash2 size={18} /></button>
                </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedEmail.body}
              </div>
              <div className="p-4 border-t border-slate-200 dark:border-dark-700">
                <Button variant="outline" className="mr-2">Reply</Button>
                <Button variant="outline">Forward</Button>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 flex-col">
              <Mail size={48} className="mb-4 opacity-20" />
              <p>Select an email to read</p>
            </div>
          )}
        </div>

        {/* Compose Modal */}
        {isComposeOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-900">
                <h3 className="font-bold text-slate-800 dark:text-white">New Message</h3>
                <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <form onSubmit={handleSendEmail} className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
                <Input label="To" placeholder="recipient@example.com" />
                <Input label="Subject" placeholder="Enter subject" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
                  <textarea className="w-full h-64 p-3 rounded-lg border border-slate-300 dark:border-dark-600 bg-white dark:bg-dark-700 focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                </div>
              </form>
              <div className="p-4 border-t border-slate-200 dark:border-dark-700 flex justify-end gap-3 bg-slate-50 dark:bg-dark-900">
                <Button variant="ghost" onClick={() => setIsComposeOpen(false)}>Discard</Button>
                <Button onClick={handleSendEmail} icon={<Send size={16} />}>Send Email</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNotifications = () => {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
          <Button variant="outline" size="sm">Mark all as read</Button>
        </div>
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center p-10 text-slate-500">No notifications</div>
          ) : (
            notifications.map(notif => (
              <div key={notif.id} className={`bg-white dark:bg-dark-800 p-4 rounded-xl border ${notif.isRead ? 'border-slate-200 dark:border-dark-700' : 'border-primary-200 dark:border-primary-900 bg-primary-50/50'} shadow-sm flex gap-4`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  notif.type === 'alert' ? 'bg-red-100 text-red-600' :
                  notif.type === 'success' ? 'bg-green-100 text-green-600' :
                  notif.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{notif.title}</h4>
                    <span className="text-xs text-slate-400">{notif.timestamp}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notif.message}</p>
                  {!notif.isRead && (
                    <button 
                      onClick={() => onMarkNotificationRead(notif.id)}
                      className="text-xs text-primary-600 font-medium mt-2 hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderActivityLog = () => {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-dark-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Activity Log</h2>
          <p className="text-sm text-slate-500">Recent actions performed by users across the system.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-3 font-semibold">User</th>
                <th className="px-6 py-3 font-semibold">Action</th>
                <th className="px-6 py-3 font-semibold">Target</th>
                <th className="px-6 py-3 font-semibold">Details</th>
                <th className="px-6 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
              {activityLogs.map(log => {
                const user = users.find(u => u.id === log.userId) || { username: 'Unknown', avatar: null };
                return (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-dark-700/50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                        {user.avatar ? <img src={user.avatar} className="w-full h-full" /> : <UserIcon size={16} className="text-slate-500" />}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white">{user.username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-dark-700 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {log.targetType}: <span className="font-medium text-slate-900 dark:text-white">{log.targetId}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {log.details}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {log.timestamp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900">
      {/* Module Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-200 dark:border-dark-700 px-6 py-4 flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="text-primary-500" /> Communication Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage chats, emails, and system notifications.</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-slate-100 dark:bg-dark-700 p-1 rounded-lg">
          {[
            { id: 'chat', label: 'Chat', icon: <MessageSquare size={16} /> },
            { id: 'email', label: 'Email', icon: <Mail size={16} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
            { id: 'activity', label: 'Activity Log', icon: <Activity size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-white dark:bg-dark-800 text-primary-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden p-6">
        {activeTab === 'chat' && renderChat()}
        {activeTab === 'email' && renderEmail()}
        {activeTab === 'notifications' && renderNotifications()}
        {activeTab === 'activity' && renderActivityLog()}
      </div>
    </div>
  );
};

export default CommunicationPage;
