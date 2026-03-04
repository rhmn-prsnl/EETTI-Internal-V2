import React, { useEffect, useState } from 'react';
import { Activity, TrendingUp, Clock, AlertCircle, PlayCircle, IndianRupee, Bell, ChevronRight } from 'lucide-react';
import { User, Task, AppNotification } from '../types';
import { api, socket } from '../services/api'; // Import real API

interface DashboardProps {
  user: User;
  // We no longer rely strictly on props passed from parent, we can fetch fresh data here
  onMarkRead: (id: string) => void;
  onNavigate: (viewId: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onMarkRead, onNavigate }) => {
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';
  const isManager = user.role === 'manager';
  
  // Real-time State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getDashboardData(user.id);
        setTasks(data.tasks || []);
        setNotifications(data.notifications || []);
        setLoading(false);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      }
    };
    fetchData();
  }, [user.id]);

  // 2. Real-time Listeners
  useEffect(() => {
    // Join user channel
    socket.emit('join_room', user.id);

    // Listen for Task Updates
    socket.on('task_update', (payload: any) => {
      if (payload.type === 'update') {
        setTasks(prev => prev.map(t => t.id === payload.task.id ? payload.task : t));
      } else if (payload.type === 'create') {
        // Only add if assigned to me
        if (payload.task.assignees?.some((u: any) => u.id === user.id)) {
           setTasks(prev => [payload.task, ...prev]);
        }
      }
    });

    // Listen for Personal Notifications
    socket.on('notification', (notif: AppNotification) => {
       setNotifications(prev => [notif, ...prev]);
       // Optional: Play sound here
    });

    return () => {
      socket.off('task_update');
      socket.off('notification');
    };
  }, [user.id]);

  const myTasks = tasks.filter(t => t.status !== 'done');
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const formatINR = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) return <div className="p-10 text-center">Loading Real-time Dashboard...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user.username} 👋</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
             <p className="text-slate-500 text-sm">System Status: Online (Real-time)</p>
          </div>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
             <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                System Health
             </button>
          )}
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30">
            {isAdmin ? 'Generate Report' : '+ New Project'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Employee Notification Area: My Tasks */}
          {!isAdmin && myTasks.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 relative overflow-hidden transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Clock size={100} className="text-blue-500" />
              </div>
              <div className="relative z-10">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-2" /> 
                  Action Required: {myTasks.length} Assigned Task{myTasks.length > 1 ? 's' : ''}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myTasks.slice(0, 3).map(task => (
                    <div key={task.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' : 
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-slate-400">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-1">{task.title}</h3>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-1">{task.description}</p>
                      <div className="flex items-center text-xs font-medium text-slate-600">
                        {task.status === 'in-progress' && <PlayCircle size={14} className="mr-1 text-blue-500" />}
                        {task.status === 'todo' && <Clock size={14} className="mr-1 text-slate-400" />}
                        <span className="capitalize">{task.status.replace('-', ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid - Customized per Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-slate-50 rounded-lg border border-slate-100"><Activity className="text-primary-500" /></div>
                 <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700">+2</span>
               </div>
               <h3 className="text-slate-500 text-sm font-bold mb-1">Active Projects</h3>
               <p className="text-2xl font-bold text-slate-900">12</p>
            </div>

            {(isAdmin || isManager) && (
               <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100"><IndianRupee className="text-emerald-500" /></div>
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">+20.1%</span>
                </div>
                <h3 className="text-slate-500 text-sm font-bold mb-1">Total Revenue</h3>
                <p className="text-2xl font-bold text-slate-900">{formatINR(3754231)}</p>
              </div>
            )}

            <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
               <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-slate-50 rounded-lg border border-slate-100"><Clock className="text-orange-500" /></div>
                 <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-700">-1.2%</span>
               </div>
               <h3 className="text-slate-500 text-sm font-bold mb-1">Avg. Response Time</h3>
               <p className="text-2xl font-bold text-slate-900">24m 12s</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800">{isAdmin ? 'System Traffic' : 'Project Analytics'}</h2>
              <select className="text-sm border-none bg-slate-50 rounded-lg px-3 py-1 text-slate-700 font-medium focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
               <div className="text-center">
                 <TrendingUp className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                 <p className="text-slate-400 font-medium">Visualization Placeholder</p>
                 <p className="text-xs text-slate-400 mt-1">
                   {isAdmin ? 'Showing global system traffic stats' : 'Showing project completion rates'}
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* Side Panel: Notifications */}
        <div className="space-y-8">
           <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 p-6">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Bell className="text-primary-500" size={20} /> Notifications
                </h2>
                {unreadCount > 0 && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
             </div>
             <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-sm italic text-center py-4">No new notifications.</p>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => onMarkRead(notif.id)}
                      className={`p-3 rounded-xl border transition-all relative group cursor-pointer ${
                        notif.isRead 
                          ? 'bg-slate-50 border-slate-100 opacity-60 hover:opacity-100' 
                          : 'bg-white border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200'
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
                          <span className="text-[10px] text-slate-400">{notif.timestamp}</span>
                       </div>
                       <h4 className={`text-sm font-bold text-slate-800 ${!notif.isRead ? 'text-blue-900' : ''}`}>{notif.title}</h4>
                       <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notif.message}</p>
                       
                       {!notif.isRead && (
                         <div className="absolute right-3 top-3 w-2 h-2 bg-blue-500 rounded-full ring-4 ring-white"></div>
                       )}
                       
                       <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                          <ChevronRight size={14} />
                       </div>
                    </div>
                  ))
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
