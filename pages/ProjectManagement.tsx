import React, { useState, useEffect } from 'react';
import { Project, Task, User, TaskStatus, TaskPriority, TimeLogEntry, TaskFeedback, Client, PermissionKey } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import AlertModal from '../components/ui/AlertModal';
import { 
  Plus, Calendar, Clock, MoreVertical, 
  CheckCircle, AlertCircle, Trash2, ArrowRight,
  Layout, List, Users, Briefcase, ChevronRight,
  Play, Pause, StopCircle, MessageSquare, XCircle,
  ShieldCheck
} from 'lucide-react';

// --- Helper Functions (Moved outside component to be pure) ---

const calculateTaskDuration = (task: Task, now: number = Date.now()) => {
  let totalMs = 0;
  const logs = task.timeLogs || [];
  
  logs.forEach(log => {
    if (log.end) {
      // Completed session
      totalMs += (log.end - log.start);
    } else if (!task.isPaused && (task.status === 'in-progress' || task.status === 'testing')) {
      // Active session (Live)
      totalMs += (now - log.start);
    }
  });
  return totalMs;
};

const formatDuration = (ms: number) => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
};

const getPriorityWeight = (p: TaskPriority) => {
  switch(p) {
    case 'urgent': return 4;
    case 'high': return 3;
    case 'medium': return 2;
    case 'low': return 1;
    default: return 0;
  }
};

const getPriorityColor = (p: TaskPriority) => {
  switch(p) {
    case 'urgent': return 'bg-red-50 text-red-700 border-red-200';
    case 'high': return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'medium': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'low': return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

// --- Live Timer Components ---

const LiveTaskTimer: React.FC<{ task: Task }> = ({ task }) => {
  const [timeStr, setTimeStr] = useState(() => formatDuration(calculateTaskDuration(task)));

  useEffect(() => {
    // Update immediately on mount/prop change
    setTimeStr(formatDuration(calculateTaskDuration(task)));

    const isActive = !task.isPaused && (task.status === 'in-progress' || task.status === 'testing');
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeStr(formatDuration(calculateTaskDuration(task)));
    }, 1000);

    return () => clearInterval(interval);
  }, [task]); // Re-subscribe if task state changes (e.g. pause/resume)

  return <span>{timeStr}</span>;
};

const LiveProjectTimer: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const calculateTotal = () => {
      const now = Date.now();
      const totalMs = tasks.reduce((acc, t) => acc + calculateTaskDuration(t, now), 0);
      return formatDuration(totalMs);
    };

    setTimeStr(calculateTotal());

    // Check if ANY task is active
    const hasActive = tasks.some(t => !t.isPaused && (t.status === 'in-progress' || t.status === 'testing'));
    if (!hasActive) return;

    const interval = setInterval(() => {
      setTimeStr(calculateTotal());
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  return <strong className="text-slate-900 dark:text-white">{timeStr}</strong>;
};

// --- Main Component ---

interface ProjectManagementProps {
  currentUser: User;
  userPermissions: PermissionKey[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  clients?: Client[]; // NEW: Clients for selection
  onAddProject: (project: Omit<Project, 'id' | 'progress'>) => void;
  onUpdateProject: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject: (id: string) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'createdBy' | 'timeLogs' | 'isPaused'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({
  currentUser,
  userPermissions,
  users,
  projects,
  tasks,
  clients = [],
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const isSuperAdmin = currentUser.role === 'super_admin';
  const canManageProjects = isSuperAdmin || userPermissions.includes('project_manage');
  const isRestrictedView = userPermissions.includes('project_access_restricted');
  
  // States
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, action: () => void, message: string}>({isOpen: false, action: () => {}, message: ''});
  const [alertModal, setAlertModal] = useState<{isOpen: boolean, title: string, message: string}>({isOpen: false, title: '', message: ''});
  
  // Rejection Modal State
  const [rejectModal, setRejectModal] = useState<{isOpen: boolean, task: Task | null}>({isOpen: false, task: null});
  const [rejectionReason, setRejectionReason] = useState('');

  // Forms
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    clientId: '',
    teamMemberIds: [] as string[]
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as TaskPriority,
    assignedTo: [] as string[],
    dueDate: ''
  });

  // --- Filtering ---
  
  // Visibility Logic based on Permissions
  const visibleProjects = (isSuperAdmin || !isRestrictedView)
    ? projects 
    : projects.filter(p => p.teamMemberIds.includes(currentUser.id) || p.managerId === currentUser.id);

  const activeProject = projects.find(p => p.id === activeProjectId);

  // --- Helpers ---

  // Check if a specific user has an active task (In Progress OR Testing, and NOT paused)
  const getActiveTaskForUser = (userId: string) => {
    return tasks.find(t => 
      t.assignedTo.includes(userId) && 
      (t.status === 'in-progress' || t.status === 'testing') && 
      !t.isPaused
    );
  };

  // Check if a specific user already has a task in the Testing phase (Status: testing)
  const getTestingTaskForUser = (userId: string) => {
    return tasks.find(t => 
      t.assignedTo.includes(userId) && 
      t.status === 'testing'
    );
  };

  // --- Handlers ---

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    onAddProject({
      ...projectForm,
      status: 'active',
      managerId: currentUser.id,
    });
    setIsProjectModalOpen(false);
    setProjectForm({ name: '', description: '', startDate: '', endDate: '', clientId: '', teamMemberIds: [] });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProjectId) return;

    // Strict Validation
    if (!taskForm.title.trim()) {
       setAlertModal({ isOpen: true, title: 'Validation Error', message: 'Task Title is required.' });
       return;
    }
    if (!taskForm.description.trim()) {
       setAlertModal({ isOpen: true, title: 'Validation Error', message: 'Task Description is required.' });
       return;
    }
    if (!taskForm.dueDate) {
       setAlertModal({ isOpen: true, title: 'Validation Error', message: 'Due Date & Time is required.' });
       return;
    }
    if (taskForm.assignedTo.length === 0) {
       setAlertModal({ isOpen: true, title: 'Validation Error', message: 'You must assign this task to at least one employee.' });
       return;
    }
    
    onAddTask({
      ...taskForm,
      projectId: activeProjectId,
      status: 'todo',
    });
    setIsTaskModalOpen(false);
    setTaskForm({ title: '', description: '', priority: 'medium', assignedTo: [], dueDate: '' });
  };

  // Time Tracking Actions
  const handleStartTask = (task: Task) => {
    const parentProject = projects.find(p => p.id === task.projectId);
    if (parentProject && (parentProject.status === 'on-hold' || parentProject.status === 'stopped' || parentProject.status === 'inactive')) {
      setAlertModal({ 
        isOpen: true, 
        title: 'Project Paused', 
        message: `This project is currently marked as "${parentProject.status.toUpperCase()}". You cannot start tasks until it is Reactivated by an Admin.` 
      });
      return;
    }

    for (const userId of task.assignedTo) {
      // 1. BLOCK: Check if user has ANY task in 'testing'. 
      const testingTask = getTestingTaskForUser(userId);
      if (testingTask) {
        const busyUser = users.find(u => u.id === userId);
        setAlertModal({
          isOpen: true,
          title: 'Testing Queue Not Empty',
          message: `${busyUser?.username || 'User'} still has a task in Testing ("${testingTask.title}"). They must test and submit it for approval before starting a new task.`
        });
        return;
      }

      // 2. BLOCK: Check if user has another ACTIVE (running) task.
      const activeTask = getActiveTaskForUser(userId);
      if (activeTask && activeTask.id !== task.id) {
        const busyUser = users.find(u => u.id === userId);
        setAlertModal({
          isOpen: true,
          title: 'Resource Busy',
          message: `${busyUser?.username || 'User'} is currently working on "${activeTask.title}". They must place that task on HOLD before starting a new one.`
        });
        return;
      }
    }

    // Move to in-progress and start logging
    const newLog: TimeLogEntry = { status: 'in-progress', start: Date.now() };
    onUpdateTask(task.id, { 
      status: 'in-progress', 
      isPaused: false,
      timeLogs: [...(task.timeLogs || []), newLog] 
    });
  };

  const handlePauseTask = (task: Task) => {
    // Close current log entry
    const logs = [...(task.timeLogs || [])];
    const lastLog = logs[logs.length - 1];
    if (lastLog && !lastLog.end) {
      lastLog.end = Date.now();
    }
    onUpdateTask(task.id, { isPaused: true, timeLogs: logs });
  };

  const handleResumeTask = (task: Task) => {
    const parentProject = projects.find(p => p.id === task.projectId);
    if (parentProject && (parentProject.status === 'on-hold' || parentProject.status === 'stopped' || parentProject.status === 'inactive')) {
      setAlertModal({ 
        isOpen: true, 
        title: 'Project Paused', 
        message: `This project is currently marked as "${parentProject.status.toUpperCase()}". You cannot resume tasks until it is Reactivated by an Admin.` 
      });
      return;
    }

    for (const userId of task.assignedTo) {
       // 1. BLOCK: Check if user has ANY task in 'testing'. 
       const testingTask = getTestingTaskForUser(userId);
       
       if (testingTask && testingTask.id !== task.id) {
            const busyUser = users.find(u => u.id === userId);
            setAlertModal({
              isOpen: true,
              title: 'Testing Queue Not Empty',
              message: `${busyUser?.username || 'User'} has a task in Testing ("${testingTask.title}"). They must complete that first.`
            });
            return;
       }

      // 2. BLOCK: Check if user has another ACTIVE (running) task.
      const activeTask = getActiveTaskForUser(userId);
      if (activeTask && activeTask.id !== task.id) {
        const busyUser = users.find(u => u.id === userId);
        setAlertModal({
          isOpen: true,
          title: 'Resource Busy',
          message: `${busyUser?.username || 'User'} is currently working on "${activeTask.title}". They must place that task on HOLD before resuming this one.`
        });
        return;
      }
    }

    // Open new log entry
    const newLog: TimeLogEntry = { 
      status: task.status as 'in-progress' | 'testing', 
      start: Date.now() 
    };
    onUpdateTask(task.id, { isPaused: false, timeLogs: [...(task.timeLogs || []), newLog] });
  };

  const handleMoveToTest = (task: Task) => {
    // 1. Validation: Check if any assignee already has a task in 'testing'
    for (const userId of task.assignedTo) {
      const testingTask = getTestingTaskForUser(userId);
      // If found and it's not the current task
      if (testingTask && testingTask.id !== task.id) {
        const busyUser = users.find(u => u.id === userId);
        setAlertModal({
          isOpen: true,
          title: 'Testing Queue Limit',
          message: `${busyUser?.username || 'User'} already has a task in Testing ("${testingTask.title}"). They must submit it for approval before moving another task to Testing.`
        });
        return;
      }
    }

    // Continuous Timing Logic:
    const logs = [...(task.timeLogs || [])];
    const lastLog = logs[logs.length - 1];
    if (lastLog && !lastLog.end) lastLog.end = Date.now();
    
    // Start testing log
    logs.push({ status: 'testing', start: Date.now() });
    
    onUpdateTask(task.id, { status: 'testing', isPaused: false, timeLogs: logs });
  };

  const handleSubmitForApproval = (task: Task) => {
    // Close testing log - Work is done for the employee. Time HOLDS here.
    const logs = [...(task.timeLogs || [])];
    const lastLog = logs[logs.length - 1];
    if (lastLog && !lastLog.end) lastLog.end = Date.now();
    
    onUpdateTask(task.id, { status: 'pending-approval', isPaused: false, timeLogs: logs });
  };

  const handleAdminAction = (task: Task, action: 'approve' | 'reject') => {
    // DOUBLE CHECK: Only Admins or Project Managers can approve
    if (!canManageProjects) {
      setAlertModal({ isOpen: true, title: 'Restricted Action', message: 'Only Project Managers or Admins can perform final approvals.' });
      return;
    }

    if (action === 'approve') {
       onUpdateTask(task.id, { status: 'done' });
    } else {
       // Open Reject Modal
       setRejectionReason('');
       setRejectModal({ isOpen: true, task });
    }
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModal.task) return;

    if (!rejectionReason.trim()) {
      setAlertModal({ isOpen: true, title: 'Required', message: 'Please provide a reason for rejection.' });
      return;
    }

    // Add rejection to history
    const newFeedback: TaskFeedback = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      comment: rejectionReason
    };

    // Reject back to in-progress. 
    onUpdateTask(rejectModal.task.id, { 
      status: 'in-progress', 
      isPaused: true, 
      feedbackHistory: [newFeedback, ...(rejectModal.task.feedbackHistory || [])]
    });
    
    setRejectModal({ isOpen: false, task: null });
  };


  // --- Components ---

  const ProjectCard: React.FC<{ project: Project }> = ({ project }) => {
    const projTasks = tasks.filter(t => t.projectId === project.id);
    const clientName = clients?.find(c => c.id === project.clientId)?.clientName || 'Internal';
    
    return (
      <div className={`bg-white dark:bg-dark-800 rounded-xl border p-5 hover:shadow-md transition-shadow relative group ${
        project.status === 'stopped' || project.status === 'inactive' ? 'border-red-200 dark:border-red-900 opacity-75' : 
        project.status === 'on-hold' ? 'border-amber-200 dark:border-amber-900' :
        'border-slate-200 dark:border-dark-700'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 mr-2">
            <div className="flex items-center gap-2 mb-1">
               <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">{clientName}</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{project.name}</h3>
            
            {/* Status Dropdown for Admins, Badge for Others */}
            <div className="mt-2">
              {canManageProjects ? (
                <select 
                  className={`text-xs font-bold uppercase rounded py-1 px-2 border focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    project.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200 focus:ring-emerald-500' :
                    project.status === 'on-hold' ? 'bg-amber-50 text-amber-800 border-amber-200 focus:ring-amber-500' :
                    project.status === 'completed' ? 'bg-blue-50 text-blue-800 border-blue-200 focus:ring-blue-500' :
                    'bg-red-50 text-red-800 border-red-200 focus:ring-red-500'
                  }`}
                  value={project.status}
                  onChange={(e) => onUpdateProject(project.id, { status: e.target.value as any })}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="stopped">Stopped</option>
                  <option value="inactive">Inactive</option>
                </select>
              ) : (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                  project.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 
                  project.status === 'on-hold' ? 'bg-amber-100 text-amber-800' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {project.status.replace('-', ' ')}
                </span>
              )}
            </div>
          </div>
          {canManageProjects && (
            <button 
              onClick={(e) => { e.stopPropagation(); setConfirmModal({isOpen: true, message: `Delete project ${project.name}?`, action: () => onDeleteProject(project.id)}); }}
              className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2 min-h-[40px]">{project.description}</p>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 font-medium">Progress</span>
              <span className="text-slate-700 dark:text-slate-300 font-bold">{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-dark-600 rounded-full h-2">
              <div className="bg-primary-600 h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }}></div>
            </div>
          </div>

          {canManageProjects && (
             <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-dark-700 p-2 rounded">
                <Clock size={12} className="text-primary-500" />
                <span>Total Project Time: <LiveProjectTimer tasks={projTasks} /></span>
             </div>
          )}
          
          <div className="flex justify-between items-center">
            <div className="flex -space-x-2 overflow-hidden">
              {project.teamMemberIds.map(uid => {
                const u = users.find(user => user.id === uid);
                if (!u) return null;
                return (
                  <img 
                    key={uid}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-white"
                    src={u.avatar || `https://ui-avatars.com/api/?name=${u.username}`}
                    alt={u.username}
                    title={u.username}
                  />
                )
              })}
            </div>
            <Button 
              variant="secondary" 
              className="text-xs h-8"
              onClick={() => { setActiveProjectId(project.id); setViewMode('board'); }}
            >
              View Board <ArrowRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    // ... (No changes to TaskCard logic, just ensuring styles are dark-mode compatible)
    const isAssigned = task.assignedTo.includes(currentUser.id);
    const canMove = canManageProjects || isAssigned;
    const isActive = !task.isPaused && (task.status === 'in-progress' || task.status === 'testing');
    const hasRejections = task.feedbackHistory && task.feedbackHistory.length > 0;
    const isCurrentlyRejected = task.status === 'in-progress' && hasRejections && !isActive && task.feedbackHistory?.[0].comment;

    // ... (renderActions same as before) ...
    const renderActions = () => {
      if (!canMove) return null;
      if (task.status === 'todo') {
        return (
          <button onClick={() => handleStartTask(task)} className="mt-3 w-full py-1.5 flex items-center justify-center text-xs font-bold bg-primary-50 text-primary-700 hover:bg-primary-100 rounded transition-colors">
            <Play size={12} className="mr-1" /> Start Task
          </button>
        );
      }
      if (task.status === 'in-progress') {
         return (
           <div className="mt-3 grid grid-cols-2 gap-2">
             {task.isPaused ? (
               <button onClick={() => handleResumeTask(task)} className="py-1.5 flex items-center justify-center text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded transition-colors">
                 <Play size={12} className="mr-1" /> Resume
               </button>
             ) : (
               <button onClick={() => handlePauseTask(task)} className="py-1.5 flex items-center justify-center text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors">
                 <Pause size={12} className="mr-1" /> Hold
               </button>
             )}
             <button onClick={() => handleMoveToTest(task)} disabled={task.isPaused} className={`py-1.5 flex items-center justify-center text-xs font-bold rounded transition-colors ${task.isPaused ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}>
               Test &rarr;
             </button>
           </div>
         );
      }
      if (task.status === 'testing') {
         return (
           <button onClick={() => handleSubmitForApproval(task)} className="mt-3 w-full py-1.5 flex items-center justify-center text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 rounded transition-colors">
             Submit for Approval &rarr;
           </button>
         );
      }
      if (task.status === 'pending-approval') {
         if (!canManageProjects) {
            return (
              <div className="mt-3 bg-slate-100 rounded p-2 text-center border border-slate-200">
                 <ShieldCheck className="mx-auto text-slate-400 mb-1" size={16} />
                 <p className="text-[10px] text-slate-500 font-bold">Waiting for Final Review</p>
                 <p className="text-[9px] text-slate-400">(Project Manager / Admin)</p>
              </div>
            );
         }
         return (
           <div className="mt-3 grid grid-cols-2 gap-2">
             <button onClick={() => handleAdminAction(task, 'reject')} className="py-1.5 text-xs font-bold bg-red-50 text-red-700 hover:bg-red-100 rounded transition-colors">Reject</button>
             <button onClick={() => handleAdminAction(task, 'approve')} className="py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded transition-colors">Approve</button>
           </div>
         );
      }
      return null;
    };

    return (
      <div className={`bg-white dark:bg-dark-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-dark-700 hover:shadow-md transition-shadow group relative ${task.isPaused ? 'opacity-75 bg-slate-50 dark:bg-dark-900' : ''} ${isActive ? 'ring-1 ring-primary-500 shadow-primary-500/10' : ''} ${isCurrentlyRejected ? 'border-red-200 bg-red-50/50' : ''}`}>
        {task.isPaused && task.status !== 'todo' && task.status !== 'done' && (
           <div className="absolute top-2 right-2 z-10">
             <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">ON HOLD</span>
           </div>
        )}
        {isActive && (
           <div className="absolute top-2 right-2 z-10 animate-pulse">
             <span className="text-[10px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> LIVE
             </span>
           </div>
        )}

        <div className="flex justify-between items-start mb-2">
           <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getPriorityColor(task.priority)}`}>
             {task.priority}
           </span>
        </div>
        <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{task.title}</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{task.description}</p>
        
        {/* Rejection History Display */}
        {hasRejections && (
           <div className="mb-3 space-y-2">
              <div className="text-[10px] font-bold text-red-700 flex items-center gap-1 border-b border-red-100 pb-1">
                 <MessageSquare size={10} /> Admin Feedback ({task.feedbackHistory!.length}):
              </div>
              <div className="max-h-20 overflow-y-auto space-y-1 custom-scrollbar">
                {task.feedbackHistory!.map((feedback, idx) => (
                  <div key={feedback.id || idx} className="bg-red-50 border border-red-100 rounded p-1.5">
                    <p className="text-xs text-red-800 italic">"{feedback.comment}"</p>
                    <p className="text-[9px] text-red-400 mt-0.5 text-right">{feedback.date}</p>
                  </div>
                ))}
              </div>
           </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-50 dark:border-dark-700 pt-2">
           <div className="flex -space-x-1">
             {task.assignedTo.map(uid => {
                const u = users.find(usr => usr.id === uid);
                return u ? (
                  <img key={uid} src={u.avatar} className="w-5 h-5 rounded-full ring-1 ring-white" title={u.username} />
                ) : null;
             })}
           </div>
           
           {/* Timer Visibility */}
           {(isAssigned || canManageProjects) && (
              <div className={`flex items-center text-[10px] px-1.5 py-0.5 rounded font-mono ${isActive ? 'bg-primary-50 text-primary-700 font-bold' : 'bg-slate-50 dark:bg-dark-700 text-slate-500 dark:text-slate-400'}`}>
                <Clock size={10} className="mr-1" />
                <LiveTaskTimer task={task} />
              </div>
           )}
        </div>
        
        {renderActions()}
      </div>
    );
  };

  const renderKanbanBoard = () => {
    if (!activeProject) return <div>Project not found</div>;
    
    const projectTasks = tasks.filter(t => t.projectId === activeProjectId);

    const columns: { id: TaskStatus; label: string; color: string }[] = [
      { id: 'todo', label: 'To Do', color: 'bg-slate-100 dark:bg-dark-700' },
      { id: 'in-progress', label: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
      { id: 'testing', label: 'Testing', color: 'bg-indigo-50 dark:bg-indigo-900/20' },
      { id: 'pending-approval', label: 'Approval', color: 'bg-amber-50 dark:bg-amber-900/20' },
      { id: 'done', label: 'Done', color: 'bg-emerald-50 dark:bg-emerald-900/20' },
    ];

    return (
      <div className="h-full flex flex-col">
        {/* Board Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-dark-700">
           <div>
             <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
               <button onClick={() => { setActiveProjectId(null); setViewMode('list'); }} className="hover:text-primary-600 hover:underline">Projects</button>
               <ChevronRight size={14} />
               <span>Board</span>
             </div>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
               {activeProject.name}
               <span className={`text-xs px-2 py-1 rounded font-medium uppercase border ${
                 activeProject.status === 'active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                 activeProject.status === 'on-hold' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                 'bg-slate-50 text-slate-700 border-slate-200'
               }`}>
                 {activeProject.status.replace('-', ' ')}
               </span>
             </h2>
           </div>
           <div className="flex gap-2">
             <div className="flex -space-x-2 mr-4">
                {activeProject.teamMemberIds.map(uid => {
                  const u = users.find(usr => usr.id === uid);
                  return u ? <img key={uid} src={u.avatar} className="w-8 h-8 rounded-full border-2 border-white" title={u.username} /> : null;
                })}
             </div>
             {canManageProjects && activeProject.status === 'active' && (
               <Button onClick={() => setIsTaskModalOpen(true)}>
                 <Plus size={16} className="mr-2" /> Add Task
               </Button>
             )}
           </div>
        </div>

        {/* Board Columns */}
        <div className="flex-1 overflow-x-auto">
           <div className="flex gap-6 min-w-[1200px] h-full pb-2">
             {columns.map(col => {
               let colTasks = projectTasks.filter(t => t.status === col.id);
               
               // Sort 'To Do' by Priority
               if (col.id === 'todo') {
                 colTasks.sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority));
               }

               return (
                 <div key={col.id} className="flex-1 flex flex-col min-w-[280px] max-w-[320px] h-full">
                   <div className={`flex items-center justify-between p-3 rounded-t-lg border-b-2 border-white dark:border-dark-600 ${col.color}`}>
                      <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">{col.label}</h3>
                      <span className="bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded text-xs font-bold text-slate-600 dark:text-slate-400">{colTasks.length}</span>
                   </div>
                   
                   {/* Scrollable Column Content */}
                   <div className={`flex-1 ${col.color} bg-opacity-30 dark:bg-opacity-10 p-3 space-y-3 rounded-b-lg overflow-y-auto min-h-0 custom-scrollbar`}>
                      {colTasks.length === 0 && (
                        <div className="h-24 border-2 border-dashed border-slate-300/50 rounded-lg flex items-center justify-center text-slate-400 text-xs italic">
                          No tasks
                        </div>
                      )}
                      {colTasks.map(task => (
                        <TaskCard key={task.id} task={task} />
                      ))}
                   </div>
                 </div>
               );
             })}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      
      {/* Main Header (Only visible in List Mode) */}
      {!activeProjectId && (
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Project Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage tasks, timelines, and team approvals.</p>
          </div>
          <div className="flex bg-white dark:bg-dark-800 p-1 rounded-lg border border-slate-200 dark:border-dark-700">
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-slate-100 dark:bg-dark-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Layout size={20} />
            </button>
            {activeProjectId && (
              <button 
                onClick={() => setViewMode('board')} 
                className={`p-2 rounded ${viewMode === 'board' ? 'bg-slate-100 dark:bg-dark-700 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <Briefcase size={20} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {!activeProjectId ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto max-h-full pb-10">
            {canManageProjects && (
              <button 
                onClick={() => setIsProjectModalOpen(true)}
                className="flex flex-col items-center justify-center h-[280px] rounded-xl border-2 border-dashed border-slate-300 dark:border-dark-600 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-dark-700 group-hover:bg-white dark:group-hover:bg-dark-600 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500" />
                </div>
                <span className="font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary-600">Create New Project</span>
              </button>
            )}
            {visibleProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : renderKanbanBoard()}
      </div>

      {/* --- Modals with High Contrast Inputs --- */}

      <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Project Name</label>
            <input required type="text" className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={projectForm.name} onChange={e => setProjectForm({...projectForm, name: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Client</label>
             <select className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={projectForm.clientId} onChange={e => setProjectForm({...projectForm, clientId: e.target.value})}>
                <option value="">-- Internal Project --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.clientName}</option>)}
             </select>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
             <textarea required rows={2} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={projectForm.description} onChange={e => setProjectForm({...projectForm, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Start Date</label>
                <input required type="date" className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={projectForm.startDate} onChange={e => setProjectForm({...projectForm, startDate: e.target.value})} />
             </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">End Date</label>
                <input required type="date" className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={projectForm.endDate} onChange={e => setProjectForm({...projectForm, endDate: e.target.value})} />
             </div>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Assign Team (Includes Admins)</label>
             <div className="max-h-32 overflow-y-auto border border-slate-300 bg-white rounded-lg p-2 space-y-1">
               {users.map(u => (
                 <label key={u.id} className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                   <input 
                     type="checkbox" 
                     className="text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                     checked={projectForm.teamMemberIds.includes(u.id)}
                     onChange={(e) => {
                       if(e.target.checked) setProjectForm({...projectForm, teamMemberIds: [...projectForm.teamMemberIds, u.id]});
                       else setProjectForm({...projectForm, teamMemberIds: projectForm.teamMemberIds.filter(id => id !== u.id)});
                     }}
                   />
                   <span className="text-sm text-slate-900">
                     {u.username} <span className="text-xs text-slate-500">({u.role})</span>
                   </span>
                 </label>
               ))}
             </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
             <Button type="button" variant="secondary" onClick={() => setIsProjectModalOpen(false)}>Cancel</Button>
             <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Task Title <span className="text-red-500">*</span></label>
            <input required type="text" className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} />
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Description <span className="text-red-500">*</span></label>
             <textarea required rows={2} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Priority <span className="text-red-500">*</span></label>
                <select className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg capitalize" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value as TaskPriority})}>
                   <option value="low">Low</option>
                   <option value="medium">Medium</option>
                   <option value="high">High</option>
                   <option value="urgent">Urgent</option>
                </select>
             </div>
             <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Due Date & Time <span className="text-red-500">*</span></label>
                <input required type="datetime-local" className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
             </div>
          </div>
          <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Assign To <span className="text-red-500">*</span></label>
             <div className="border border-slate-300 bg-white rounded-lg p-2 max-h-32 overflow-y-auto">
               {activeProject && users
                 // Include Project Team Members AND the Project Manager (Admin)
                 .filter(u => activeProject.teamMemberIds.includes(u.id) || u.id === activeProject.managerId)
                 .map(u => (
                 <label key={u.id} className="flex items-center space-x-2 p-1 hover:bg-slate-50 rounded cursor-pointer">
                    <input 
                       type="checkbox"
                       className="text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                       checked={taskForm.assignedTo.includes(u.id)}
                       onChange={(e) => {
                          if(e.target.checked) setTaskForm({...taskForm, assignedTo: [...taskForm.assignedTo, u.id]});
                          else setTaskForm({...taskForm, assignedTo: taskForm.assignedTo.filter(id => id !== u.id)});
                       }}
                    />
                    <div className="flex items-center gap-2">
                       <img src={u.avatar} className="w-5 h-5 rounded-full" />
                       <span className="text-sm text-slate-900">{u.username} <span className="text-xs text-slate-500">({u.role})</span></span>
                    </div>
                 </label>
               ))}
             </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
             <Button type="button" variant="secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</Button>
             <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>

      {/* Rejection Reason Modal */}
      <Modal isOpen={rejectModal.isOpen} onClose={() => setRejectModal({...rejectModal, isOpen: false})} title="Reject Task">
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800 flex items-start gap-2">
             <AlertCircle size={16} className="mt-0.5" />
             <p>You are about to reject this task. It will be returned to the "In Progress" status for the employee to review.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Reason for Rejection <span className="text-red-500">*</span></label>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Explain why the task was rejected..."
            />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="secondary" onClick={() => setRejectModal({...rejectModal, isOpen: false})}>Cancel</Button>
            <Button type="submit" variant="danger">Confirm Rejection</Button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({...confirmModal, isOpen: false})}
        onConfirm={confirmModal.action}
        title="Confirm Deletion"
        message={confirmModal.message}
      />

      <AlertModal 
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({...alertModal, isOpen: false})}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
};

export default ProjectManagement;