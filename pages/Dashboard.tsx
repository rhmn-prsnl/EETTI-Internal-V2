import React from 'react';
import { Activity, DollarSign, TrendingUp, Clock, ShieldAlert, Users, CheckCircle, PlayCircle, AlertCircle, IndianRupee, Bell, ChevronRight } from 'lucide-react';
import { User, Task, AppNotification, Project, FollowUp } from '../types';

interface DashboardProps {
  user: User;
  tasks?: Task[];
  projects?: Project[];
  notifications?: AppNotification[];
  followUps?: FollowUp[];
  onMarkRead: (id: string) => void;
  onNavigate: (viewId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, tasks = [], projects = [], notifications = [], followUps = [], onMarkRead, onNavigate }) => {
  const isAdmin = user.role === 'super_admin';
  const isManager = user.role === 'manager';
  
  // Filter assigned active tasks
  const myTasks = tasks.filter(t => t.assignedTo.includes(user.id) && t.status !== 'done');

  // Filter pending follow-ups for today/future
  const myFollowUps = followUps.filter(f => f.assignedTo === user.id && f.status === 'pending').sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  // Real data calculations
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;
  // Estimate revenue based on active projects (Example logic: 150k per active project base + completed progress value)
  const estimatedRevenue = projects.reduce((acc, p) => acc + (150000 + (p.progress * 5000)), 0);
  
  // Calculate average completion time or response time (Mock logic based on tasks to show dynamic nature)
  const completedTasks = tasks.filter(t => t.status === 'done');
  const avgResponseMinutes = completedTasks.length > 0 ? Math.round(20 + (Math.random() * 10)) : 0; // Simulated calc

  // Formatter for INR
  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleNotificationClick = (notif: AppNotification) => {
    onMarkRead(notif.id);
    if (notif.linkTo) {
      onNavigate(notif.linkTo);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back, {user.username} 👋</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {isAdmin ? 'System Overview & Alerts' : 'Here is what\'s happening with your projects today.'}
          </p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
             <button className="px-4 py-2 bg-white dark:bg-dark-800 border border-slate-300 dark:border-dark-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 dark:hover:bg-dark-700 transition-colors shadow-sm">
                System Health
             </button>
          )}
          <button onClick={() => onNavigate('projects')} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
            {isAdmin ? 'Generate Report' : '+ New Project'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Employee Notification Area: My Tasks */}
          {!isAdmin && myTasks.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock size={100} className="text-blue-500" />
              </div>
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-600 mr-2" /> 
                  Action Required: {myTasks.length} Assigned Task{myTasks.length > 1 ? 's' : ''}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-blue-200 dark:border-dark-700 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{task.title}</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-1">{task.description}</p>
                      <div className="flex items-center text-xs font-medium text-slate-700 dark:text-slate-300">
                        {task.status === 'in-progress' && <PlayCircle size={14} className="mr-1 text-blue-600" />}
                        {task.status === 'todo' && <Clock size={14} className="mr-1 text-slate-500" />}
                        <span className="capitalize">{task.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Lead Follow-ups Widget (New) */}
          {myFollowUps.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-dark-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center">
                  <Clock className="w-5 h-5 text-orange-500 mr-2" /> Upcoming Follow-ups
                </h2>
                <button onClick={() => onNavigate('leads')} className="text-sm text-primary-600 hover:text-primary-700 font-medium">View Leads</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myFollowUps.slice(0, 3).map(fu => (
                  <div key={fu.id} className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-900/30">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold uppercase text-orange-700 dark:text-orange-400">{fu.type}</span>
                      <span className="text-xs text-orange-700 dark:text-orange-500">{new Date(fu.scheduledDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white line-clamp-2">{fu.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stats Grid - Customized per Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Everyone sees basic stats */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-dark-700 hover:-translate-y-1 transition-transform duration-300">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-slate-50 dark:bg-dark-700 rounded-lg border border-slate-200 dark:border-dark-600"><Activity className="text-primary-500" /></div>
                 <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300">Live</span>
               </div>
               <h3 className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-1">Active Projects</h3>
               <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeProjectsCount}</p>
            </div>

            {/* Managers and Admins see Revenue/Users */}
            {(isAdmin || isManager) && (
               <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-dark-700 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-50 dark:bg-dark-700 rounded-lg border border-slate-200 dark:border-dark-600"><IndianRupee className="text-emerald-500" /></div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">+5%</span>
                </div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-1">Est. Revenue</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatINR(estimatedRevenue)}</p>
              </div>
            )}

            {/* Standard User or Manager Metric */}
            <div className="bg-white dark:bg-dark-800 p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-dark-700 hover:-translate-y-1 transition-transform duration-300">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-slate-50 dark:bg-dark-700 rounded-lg border border-slate-200 dark:border-dark-600"><Clock className="text-orange-500" /></div>
                 <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-dark-700 text-slate-700 dark:text-slate-300">Avg</span>
               </div>
               <h3 className="text-slate-600 dark:text-slate-400 text-sm font-bold mb-1">Response Time</h3>
               <p className="text-2xl font-bold text-slate-900 dark:text-white">{avgResponseMinutes}m</p>
            </div>
          </div>

          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-dark-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">{isAdmin ? 'System Traffic' : 'Project Analytics'}</h2>
              <select className="text-sm border-none bg-slate-100 dark:bg-dark-700 rounded-lg px-3 py-1 text-slate-700 dark:text-slate-300 font-medium focus:ring-0 cursor-pointer hover:bg-slate-200 dark:hover:bg-dark-600 transition-colors">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-slate-50 dark:bg-dark-900/50 rounded-xl border border-dashed border-slate-300 dark:border-dark-700">
               <div className="text-center">
                 <TrendingUp className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-600 mb-2" />
                 <p className="text-slate-500 dark:text-slate-500 font-medium">Analytics Visualization</p>
                 <p className="text-xs text-slate-500 dark:text-slate-600 mt-1">
                   {isAdmin ? 'Tracking system performance...' : 'Tracking project completion rates...'}
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Notifications */}
        <div className="space-y-8">
           <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-dark-700 p-6">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Bell className="text-primary-500" size={20} /> Notifications
                </h2>
                {unreadCount > 0 && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
             </div>
             <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-slate-500 text-sm italic text-center py-4">No new notifications.</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-xl border transition-all relative group cursor-pointer ${
                        notif.isRead 
                          ? 'bg-slate-50 dark:bg-dark-700 border-slate-200 dark:border-dark-600 opacity-60 hover:opacity-100' 
                          : 'bg-white dark:bg-dark-800 border-blue-200 dark:border-blue-900/30 shadow-sm hover:shadow-md hover:border-blue-300'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-1">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            notif.type === 'alert' ? 'bg-red-100 text-red-700' :
                            notif.type === 'success' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {notif.type}
                          </span>
                          <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                       </div>
                       <h4 className={`text-sm font-bold text-slate-800 dark:text-white ${!notif.isRead ? 'text-blue-900 dark:text-blue-100' : ''}`}>{notif.title}</h4>
                       <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                       
                       {/* Unread Indicator */}
                       {!notif.isRead && (
                         <div className="absolute right-3 top-3 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-white dark:ring-dark-800"></div>
                       )}
                       
                       {/* Arrow indicator on hover */}
                       <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                          <ChevronRight size={14} />
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>

           <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-200 dark:border-dark-700 p-6">
             <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Activity</h2>
             <div className="space-y-6">
               {[
                 { text: 'System update v2.1 released', time: '2 hours ago', color: 'bg-blue-500', minRole: 'user' },
                 { text: 'New user "Sarah" registered', time: '4 hours ago', color: 'bg-green-500', minRole: 'manager' },
                 { text: 'Database backup completed', time: '1 day ago', color: 'bg-purple-500', minRole: 'admin' },
                 { text: 'Server CPU usage alert', time: '2 days ago', color: 'bg-orange-500', minRole: 'admin' },
               ].filter(item => {
                  if (isAdmin) return true;
                  if (isManager) return item.minRole !== 'admin';
                  return item.minRole === 'user';
               }).map((item, i) => (
                 <div key={i} className="flex items-start space-x-4">
                   <div className={`w-2 h-2 mt-2 rounded-full ${item.color}`}></div>
                   <div>
                     <p className="text-sm font-medium text-slate-900 dark:text-white">{item.text}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.time}</p>
                   </div>
                 </div>
               ))}
             </div>
             <button className="w-full mt-6 py-2 text-sm text-primary-600 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors">
               View All Activity
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;