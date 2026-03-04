import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, AttendanceRecord, Holiday, CalendarEvent, Department, AppNotification, EventAttendee, Renewal } from '../types';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { 
  Calendar as CalendarIcon, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, 
  Plus, ShieldAlert, MessageSquare, MapPin, Briefcase, Lock, Fingerprint, FileText,
  Users, Building, Globe, Zap, Trash2, Edit2, AlertTriangle, ArrowRight, UserCheck, RefreshCw
} from 'lucide-react';

interface AttendancePageProps {
  currentUser: User;
  users: User[];
  departments: Department[]; 
  leaveRequests: LeaveRequest[];
  attendanceRecords: AttendanceRecord[];
  renewals?: Renewal[]; // Optional prop for renewals
  onAddLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => void;
  onUpdateLeaveStatus: (id: string, status: 'approved' | 'rejected', comment?: string) => void;
  onDeleteLeaveRequest: (id: string) => void;
  onUpdateAttendance: (record: AttendanceRecord) => void;
  canManageCalendar: boolean; 
  onAddNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
}

const AttendancePage: React.FC<AttendancePageProps> = ({
  currentUser,
  users,
  departments,
  leaveRequests,
  attendanceRecords,
  renewals = [], // Default to empty array
  onAddLeaveRequest,
  onUpdateLeaveStatus,
  onDeleteLeaveRequest,
  onUpdateAttendance,
  canManageCalendar,
  onAddNotification
}) => {
  const isSystemAdmin = currentUser.role === 'super_admin' || currentUser.role === 'hr_admin';
  const isAdmin = isSystemAdmin || currentUser.role === 'manager';
  
  const [activeTab, setActiveTab] = useState<'calendar' | 'my_stats' | 'requests' | 'admin_overview'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');

  // --- Clock & Timer ---
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- Mock Holidays & Events (Expanded) ---
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([
    { 
      id: 'e1', date: '2023-11-24', title: 'Thanksgiving', type: 'holiday', 
      priority: 'high', status: 'scheduled',
      createdBy: 'system', targetScope: 'all' 
    },
    { 
      id: 'e2', date: '2023-12-25', title: 'Christmas', type: 'holiday', 
      priority: 'high', status: 'scheduled',
      createdBy: 'system', targetScope: 'all' 
    },
    { 
      id: 'e3', date: '2023-12-15', title: 'IT Maintenance', type: 'maintenance', 
      startTime: '02:00', endTime: '04:00', duration: 120,
      description: 'Server downtime 2am-4am',
      priority: 'medium', status: 'scheduled',
      createdBy: 'admin', targetScope: 'department', targetDepartmentIds: ['1'] 
    }
  ]);

  // --- Modals ---
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false); 
  
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, action: () => void, message: string, title?: string}>({isOpen: false, action: () => {}, message: '', title: ''});
  
  // Forms
  const [leaveForm, setLeaveForm] = useState({ startDate: '', endDate: '', type: 'sick', reason: '' });
  const [correctionForm, setCorrectionForm] = useState({ date: '', checkIn: '', checkOut: '', reason: '' });
  
  // Event Form State
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isPastEvent, setIsPastEvent] = useState(false); // New flag for past events

  const [eventForm, setEventForm] = useState<{
    date: string;
    startTime: string;
    endTime: string;
    duration: number; // in minutes
    title: string;
    description: string;
    type: 'maintenance' | 'holiday' | 'meeting' | 'reminder';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'scheduled' | 'completed' | 'cancelled';
    mom: string;
    feedback: string;
    targetScope: 'all' | 'department' | 'user';
    targetDepartmentIds: string[];
    targetUserIds: string[];
    attendees: EventAttendee[];
  }>({
    date: '',
    startTime: '',
    endTime: '',
    duration: 0,
    title: '',
    description: '',
    type: 'reminder',
    priority: 'medium',
    status: 'scheduled',
    mom: '',
    feedback: '',
    targetScope: 'all',
    targetDepartmentIds: [],
    targetUserIds: [],
    attendees: []
  });

  // Admin Modals
  const [rejectModal, setRejectModal] = useState<{isOpen: boolean, req: LeaveRequest | null}>({isOpen: false, req: null});
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminManualEntryModal, setAdminManualEntryModal] = useState({ isOpen: false, userId: '', date: '', checkIn: '', checkOut: '', status: 'present' });

  // --- Helper: Date & Time ---
  const isDateInPast = (dateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const checkDate = new Date(dateStr);
    return checkDate < today;
  };

  // Helper to add minutes to time string HH:MM
  const addMinutes = (time: string, mins: number) => {
    if (!time) return '';
    const [h, m] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + mins);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  // Helper to diff time strings in minutes
  const timeDiff = (start: string, end: string) => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  // --- Event Handlers ---

  const handleDateClick = (day: number) => {
    if (!isSystemAdmin) return;
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Constraint: Cannot create events in the past
    if (isDateInPast(dateStr)) {
      alert("Cannot create events in the past.");
      return;
    }

    setEditingEventId(null);
    setIsPastEvent(false);
    setEventForm({
      date: dateStr,
      startTime: '',
      endTime: '',
      duration: 60, // Default 1 hour
      title: '',
      description: '',
      type: 'reminder',
      priority: 'medium',
      status: 'scheduled',
      mom: '',
      feedback: '',
      targetScope: 'all',
      targetDepartmentIds: [],
      targetUserIds: [],
      attendees: []
    });
    setIsEventModalOpen(true);
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation(); 
    if (!isSystemAdmin) return; 

    setEditingEventId(event.id);
    const past = isDateInPast(event.date);
    setIsPastEvent(past);

    setEventForm({
      date: event.date,
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      duration: event.duration || (event.startTime && event.endTime ? timeDiff(event.startTime, event.endTime) : 0),
      title: event.title,
      description: event.description || '',
      type: event.type,
      priority: event.priority || 'medium',
      status: event.status || 'scheduled',
      mom: event.mom || '',
      feedback: event.feedback || '',
      targetScope: event.targetScope,
      targetDepartmentIds: event.targetDepartmentIds || [],
      targetUserIds: event.targetUserIds || [],
      attendees: event.attendees || []
    });
    setIsEventModalOpen(true);
  };

  const handleStartTimeChange = (val: string) => {
    // If start time changes, update End Time based on existing Duration
    const newEnd = addMinutes(val, eventForm.duration);
    setEventForm({ ...eventForm, startTime: val, endTime: newEnd });
  };

  const handleEndTimeChange = (val: string) => {
    // If end time changes, recalculate Duration
    const dur = timeDiff(eventForm.startTime, val);
    setEventForm({ ...eventForm, endTime: val, duration: dur > 0 ? dur : 0 });
  };

  const handleDurationChange = (val: number) => {
    // If duration changes, update End Time based on Start Time
    const newEnd = addMinutes(eventForm.startTime, val);
    setEventForm({ ...eventForm, duration: val, endTime: newEnd });
  };

  const toggleAttendeeSelection = (userId: string) => {
    // Logic: Toggle user in BOTH targetUserIds (for visibility) AND attendees (for status tracking)
    // If meeting type, we prioritize keeping them in sync for simplicity here
    
    const isSelected = eventForm.targetUserIds.includes(userId);
    let newTargetIds = [...eventForm.targetUserIds];
    let newAttendees = [...eventForm.attendees];

    if (isSelected) {
      newTargetIds = newTargetIds.filter(id => id !== userId);
      newAttendees = newAttendees.filter(a => a.userId !== userId);
    } else {
      newTargetIds.push(userId);
      newAttendees.push({ userId, status: 'pending' });
    }

    setEventForm({ ...eventForm, targetUserIds: newTargetIds, attendees: newAttendees });
  };

  const updateAttendeeStatus = (userId: string, status: any, notes?: string) => {
    const newAttendees = eventForm.attendees.map(a => {
      if (a.userId === userId) {
        return { ...a, status, notes: notes !== undefined ? notes : a.notes };
      }
      return a;
    });
    setEventForm({ ...eventForm, attendees: newAttendees });
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine Target User IDs for Notification
    let targetIds: string[] = [];
    if (eventForm.targetScope === 'all') {
      targetIds = ['all'];
    } else if (eventForm.targetScope === 'user') {
      targetIds = eventForm.targetUserIds;
    } else if (eventForm.targetScope === 'department') {
      // Find all users in the selected departments
      // Note: In real app, IDs should match exactly. Here we simulate matching department name/id mapping.
      const deptNames = departments.filter(d => eventForm.targetDepartmentIds.includes(d.id)).map(d => d.name);
      targetIds = users.filter(u => deptNames.includes(u.department)).map(u => u.id);
    }

    // Notification Message Construction
    let notifTitle = '';
    let notifMsg = '';

    if (editingEventId) {
      // Update existing
      setCalendarEvents(prev => prev.map(ev => 
        ev.id === editingEventId 
          ? { ...ev, ...eventForm, createdBy: ev.createdBy } 
          : ev
      ));
      notifTitle = 'Event Updated';
      notifMsg = `The event "${eventForm.title}" on ${eventForm.date} has been modified. Check calendar for details.`;
    } else {
      // Create new
      const newEvent: CalendarEvent = {
        id: Math.random().toString(36).substr(2, 9),
        ...eventForm,
        createdBy: currentUser.id
      };
      setCalendarEvents([...calendarEvents, newEvent]);
      notifTitle = 'New Event Scheduled';
      notifMsg = `A new ${eventForm.priority} priority event "${eventForm.title}" is set for ${eventForm.date}.`;
    }
    
    // Trigger Dashboard Notification
    if (targetIds.length > 0) {
      onAddNotification({
        title: notifTitle,
        message: notifMsg,
        type: eventForm.priority === 'urgent' ? 'alert' : 'info',
        targetUserIds: targetIds,
        linkTo: 'attendance' // Clicking notification navigates to attendance page
      });
    }

    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = () => {
    if (!editingEventId) return;
    
    // We need to retrieve the event to know who to notify about deletion
    const eventToDelete = calendarEvents.find(e => e.id === editingEventId);
    
    setConfirmModal({
      isOpen: true,
      title: 'Delete Event?',
      message: 'This will remove the event from all targeted calendars.',
      action: () => {
        setCalendarEvents(prev => prev.filter(ev => ev.id !== editingEventId));
        
        if (eventToDelete) {
           let targetIds: string[] = [];
           if (eventToDelete.targetScope === 'all') targetIds = ['all'];
           else if (eventToDelete.targetScope === 'user') targetIds = eventToDelete.targetUserIds || [];
           else if (eventToDelete.targetScope === 'department') {
              const deptNames = departments.filter(d => eventToDelete.targetDepartmentIds?.includes(d.id)).map(d => d.name);
              targetIds = users.filter(u => deptNames.includes(u.department)).map(u => u.id);
           }

           if (targetIds.length > 0) {
             onAddNotification({
               title: 'Event Cancelled',
               message: `The event "${eventToDelete.title}" scheduled for ${eventToDelete.date} has been removed.`,
               type: 'warning',
               targetUserIds: targetIds,
               linkTo: 'attendance'
             });
           }
        }

        setIsEventModalOpen(false);
      }
    });
  };

  // --- Attendance Logic ---
  
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }); // YYYY-MM-DD
  const myTodayRecord = attendanceRecords.find(r => r.userId === currentUser.id && r.date === todayStr);

  useEffect(() => {
    if (myTodayRecord?.checkIn && !myTodayRecord.checkOut) {
      const interval = setInterval(() => {
        const [h, m] = myTodayRecord.checkIn.split(':').map(Number);
        const start = new Date();
        start.setHours(h, m, 0, 0);
        const now = new Date();
        const diff = now.getTime() - start.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setElapsedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);
      return () => clearInterval(interval);
    } else {
        setElapsedTime('00:00:00');
    }
  }, [myTodayRecord]);

  const handleCheckIn = () => {
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
    let status: any = 'present';
    const [h, m] = timeStr.split(':').map(Number);
    if (h > 9 || (h === 9 && m > 15)) status = 'late';

    const newRecord: AttendanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      date: todayStr,
      status: status,
      checkIn: timeStr,
      location: 'Office HQ (IP: 192.168.1.55)', // Simulated
      totalHours: 0
    };
    onUpdateAttendance(newRecord);
  };

  const handleCheckOut = () => {
    if (!myTodayRecord || !myTodayRecord.checkIn) return;
    const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit' });
    const [inH, inM] = myTodayRecord.checkIn.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);
    const start = new Date(0, 0, 0, inH, inM, 0);
    const end = new Date(0, 0, 0, outH, outM, 0);
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    let status = myTodayRecord.status;
    let overtime = 0;
    if (diffHrs < 4.5) status = 'half-day';
    if (diffHrs > 9) overtime = diffHrs - 9;

    onUpdateAttendance({
      ...myTodayRecord,
      checkOut: timeStr,
      totalHours: parseFloat(diffHrs.toFixed(2)),
      overtimeHours: parseFloat(overtime.toFixed(2)),
      status: status
    });
  };

  const handleCorrectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Correction request submitted to Admin for approval.');
    setIsCorrectionModalOpen(false);
  };

  const handleAdminManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { userId, date, checkIn, checkOut, status } = adminManualEntryModal;
    let total = 0;
    if (checkIn && checkOut) {
       const [h1, m1] = checkIn.split(':').map(Number);
       const [h2, m2] = checkOut.split(':').map(Number);
       total = (h2 + m2/60) - (h1 + m1/60);
    }
    onUpdateAttendance({
      id: Math.random().toString(36).substr(2, 9),
      userId,
      date,
      status: status as any,
      checkIn,
      checkOut,
      totalHours: parseFloat(total.toFixed(2)),
      isLocked: true 
    });
    setAdminManualEntryModal({ ...adminManualEntryModal, isOpen: false });
  };

  const handleLockPayroll = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Lock Attendance',
      message: `Are you sure you want to LOCK attendance for ${currentDate.toLocaleString('default', { month: 'long' })}? No further edits will be allowed.`,
      action: () => {
         alert('Payroll Locked Successfully. Reports generated.');
         setConfirmModal(prev => ({...prev, isOpen: false}));
      }
    });
  };

  // --- Render Helpers ---

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  // --- WEEKLY EVENTS HELPER ---
  const renderWeeklyEvents = () => {
    const today = new Date();
    // Calculate Monday of current week
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0,0,0,0);

    const weekEvents: {date: Date, events: CalendarEvent[]}[] = [];
    
    // Merge renewals into calendar events if admin
    const allEvents = [...calendarEvents];
    if (isSystemAdmin && renewals.length > 0) {
       renewals.forEach(r => {
          allEvents.push({
             id: `ren_evt_${r.id}`,
             date: r.expiryDate,
             title: `Renew: ${r.name}`,
             type: 'reminder',
             priority: 'high',
             status: 'scheduled',
             createdBy: 'system',
             targetScope: 'all'
          });
       });
    }
    
    for(let i=0; i<7; i++) {
       const d = new Date(monday);
       d.setDate(monday.getDate() + i);
       const dStr = d.toLocaleDateString('en-CA');
       
       // Filter events for this day
       const evs = allEvents.filter(e => {
          if (e.date !== dStr) return false;
          // Visibility Scope
          if (e.targetScope === 'all') return true;
          if (e.targetScope === 'department') return e.targetDepartmentIds?.includes(departments.find(dp => dp.name === currentUser.department)?.id || '999');
          if (e.targetScope === 'user') return e.targetUserIds?.includes(currentUser.id);
          return false;
       });
       
       if (evs.length > 0) weekEvents.push({ date: d, events: evs });
    }

    return (
      <div className="bg-dark-800 rounded-xl border border-dark-700 p-4 mb-6">
         <h3 className="text-white font-bold mb-3 flex items-center">
           <CalendarIcon className="mr-2 text-primary-500" size={18} /> 
           This Week's Agenda
         </h3>
         <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
            {weekEvents.length === 0 ? (
               <div className="text-slate-500 text-sm italic">No upcoming events scheduled for this week.</div>
            ) : (
               weekEvents.map((dayItem, idx) => (
                 <div key={idx} className="min-w-[200px] bg-dark-900 border border-dark-700 rounded-lg p-3">
                    <div className="text-xs font-bold text-slate-400 mb-2 uppercase border-b border-dark-700 pb-1">
                       {dayItem.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div className="space-y-2">
                       {dayItem.events.map(ev => (
                         <div key={ev.id} className="relative pl-3">
                            <div className={`absolute left-0 top-1 w-1 h-8 rounded-full ${
                               ev.priority === 'urgent' ? 'bg-red-500' :
                               ev.priority === 'high' ? 'bg-orange-500' :
                               ev.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="text-sm text-white font-bold truncate">{ev.title}</div>
                            {ev.startTime && <div className="text-[10px] text-slate-400">{ev.startTime} - {ev.endTime}</div>}
                            <div className={`text-[9px] inline-block px-1 rounded mt-1 ${ev.status === 'completed' ? 'bg-emerald-900 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                               {ev.status}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))
            )}
         </div>
      </div>
    );
  };

  // --- Render Calendar ---

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-dark-900/50 border border-dark-800"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      
      const isToday = dateStr === now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

      // Data Filters
      const attendance = attendanceRecords.find(r => r.userId === currentUser.id && r.date === dateStr);
      const leave = leaveRequests.find(r => r.userId === currentUser.id && r.startDate <= dateStr && r.endDate >= dateStr && r.status === 'approved');
      
      // Filter Events based on Target Scope
      // Merge renewals into calendar events if admin
      const allEvents = [...calendarEvents];
      if (isSystemAdmin && renewals.length > 0) {
         renewals.forEach(r => {
            allEvents.push({
               id: `ren_evt_${r.id}`,
               date: r.expiryDate,
               title: `Renew: ${r.name}`,
               type: 'reminder',
               priority: 'high',
               status: 'scheduled',
               createdBy: 'system',
               targetScope: 'all'
            });
         });
      }

      const eventsForDay = allEvents.filter(e => {
        if (e.date !== dateStr) return false;
        if (e.targetScope === 'all') return true;
        if (e.targetScope === 'department') {
           const myDept = departments.find(dept => dept.name === currentUser.department);
           return e.targetDepartmentIds?.includes(myDept?.id || '999'); 
        }
        if (e.targetScope === 'user') {
          return e.targetUserIds?.includes(currentUser.id);
        }
        return false;
      });

      // Default Styles
      let bgClass = 'bg-dark-800 hover:bg-dark-700';
      let borderClass = 'border-dark-700';
      
      // Visual Priority
      if (eventsForDay.some(e => e.type === 'holiday')) {
        bgClass = 'bg-purple-900/20 hover:bg-purple-900/30';
        borderClass = 'border-purple-800';
      } else if (eventsForDay.some(e => e.type === 'maintenance')) {
        bgClass = 'bg-blue-900/20 hover:bg-blue-900/30';
        borderClass = 'border-blue-800';
      } else if (leave) {
        bgClass = 'bg-amber-900/20 hover:bg-amber-900/30';
        borderClass = 'border-amber-800';
      } else if (attendance) {
         if (attendance.status === 'present') { bgClass = 'bg-emerald-900/20'; borderClass = 'border-emerald-800'; }
         if (attendance.status === 'late') { bgClass = 'bg-orange-900/20'; borderClass = 'border-orange-800'; }
         if (attendance.status === 'absent') { bgClass = 'bg-red-900/20'; borderClass = 'border-red-800'; }
      }

      // Today highlight override
      if (isToday) {
        borderClass = 'border-primary-500 ring-1 ring-primary-500';
        bgClass = bgClass + ' bg-primary-500/10';
      }

      days.push(
        <div 
          key={d} 
          onClick={() => handleDateClick(d)}
          className={`h-32 border ${borderClass} p-2 relative transition-all group ${bgClass} ${isSystemAdmin ? 'cursor-pointer hover:ring-2 hover:ring-primary-500/50' : ''}`}
        >
          <span className={`text-sm font-bold ${isToday ? 'text-primary-400' : 'text-slate-300'} group-hover:text-white`}>{d}</span>
          {isToday && <span className="absolute top-2 right-2 text-[10px] font-bold text-primary-500 uppercase">Today</span>}
          
          <div className="mt-1 space-y-1">
             {/* Render Events */}
             {eventsForDay.map(ev => (
               <div 
                 key={ev.id} 
                 onClick={(e) => handleEventClick(e, ev)}
                 className={`text-[10px] font-bold px-1.5 py-0.5 rounded truncate transition-transform hover:scale-105 cursor-pointer flex items-center gap-1 ${
                   ev.type === 'holiday' ? 'bg-purple-500 text-white' :
                   ev.type === 'maintenance' ? 'bg-blue-500 text-white' :
                   ev.priority === 'urgent' ? 'bg-red-500 text-white' :
                   ev.priority === 'high' ? 'bg-orange-500 text-white' :
                   'bg-slate-600 text-white'
                 }`}
                 title={ev.description}
               >
                 {ev.priority === 'urgent' && <AlertTriangle size={8} />}
                 <span className="truncate flex-1">{ev.title}</span>
                 {ev.startTime && <span className="text-[9px] opacity-90">{ev.startTime}</span>}
               </div>
             ))}

             {/* Render Leave */}
             {leave && (
               <div className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-900/50 text-amber-400">
                 On Leave
               </div>
             )}

             {/* Render Attendance */}
             {attendance && (
               <div className="text-[10px] text-slate-400 mt-1">
                 {attendance.status === 'present' && <span className="text-emerald-400 font-bold">P </span>}
                 {attendance.status === 'late' && <span className="text-orange-400 font-bold">L </span>}
                 {attendance.status === 'absent' && <span className="text-red-400 font-bold">A </span>}
                 {attendance.checkIn && <span>{attendance.checkIn}</span>}
               </div>
             )}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-dark-900 rounded-2xl shadow-xl border border-slate-200 dark:border-dark-700 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-dark-700 bg-slate-50 dark:bg-dark-800/50">
           <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
             <CalendarIcon className="text-primary-500" />
             {monthName}
           </h2>
           <div className="flex gap-2">
             <Button variant="secondary" onClick={prevMonth} className="p-2 border-slate-300 dark:border-dark-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"><ChevronLeft size={16} /></Button>
             <Button variant="secondary" onClick={nextMonth} className="p-2 border-slate-300 dark:border-dark-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"><ChevronRight size={16} /></Button>
           </div>
        </div>
        <div className="grid grid-cols-7 text-center bg-slate-100 dark:bg-dark-800 border-b border-slate-200 dark:border-dark-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-white dark:bg-dark-900">
          {days}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    // Calculate Stats for current month
    const userRecords = attendanceRecords.filter(r => r.userId === currentUser.id && r.date.startsWith(`${currentDate.getFullYear()}-${String(currentDate.getMonth()+1).padStart(2,'0')}`));
    const daysPresent = userRecords.filter(r => ['present', 'late', 'half-day'].includes(r.status)).length;
    const totalHours = userRecords.reduce((acc, curr) => acc + (curr.totalHours || 0), 0);
    const totalOT = userRecords.reduce((acc, curr) => acc + (curr.overtimeHours || 0), 0);
    const lateDays = userRecords.filter(r => r.status === 'late').length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
         <div className="p-4 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Days Present</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{daysPresent} <span className="text-sm text-slate-500 font-normal">/ {getDaysInMonth(currentDate)}</span></p>
         </div>
         <div className="p-4 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Total Hours</p>
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">{totalHours.toFixed(1)} <span className="text-sm text-slate-500 font-normal">hrs</span></p>
         </div>
         <div className="p-4 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Overtime</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalOT.toFixed(1)} <span className="text-sm text-slate-500 font-normal">hrs</span></p>
         </div>
         <div className="p-4 rounded-xl bg-white dark:bg-dark-800 border border-slate-200 dark:border-dark-700 shadow-sm">
            <p className="text-xs font-bold text-slate-500 uppercase">Late Arrivals</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">{lateDays}</p>
         </div>
      </div>
    );
  };

  const renderAdminOverview = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const dateHeaders = [];
    for(let i=1; i<=daysInMonth; i++) dateHeaders.push(i);

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4">
           <div>
             <h2 className="text-lg font-bold text-white">Attendance Master Sheet</h2>
             <p className="text-sm text-slate-400">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
           </div>
           {canManageCalendar && (
             <div className="flex gap-3">
               <Button variant="secondary" onClick={() => setAdminManualEntryModal({...adminManualEntryModal, isOpen: true})}>
                 <Plus size={16} className="mr-2" /> Manual Entry
               </Button>
               <Button variant="primary" className="bg-red-600 hover:bg-red-700 border-none text-white" onClick={handleLockPayroll}>
                 <Lock size={16} className="mr-2" /> Lock Month (Payroll)
               </Button>
             </div>
           )}
        </div>
        <div className="bg-dark-800 rounded-xl shadow-lg border border-dark-700 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900/50">
                <th className="p-3 sticky left-0 bg-dark-900 z-10 border-r border-dark-700 min-w-[200px] text-xs font-bold text-slate-400 uppercase">Employee</th>
                {dateHeaders.map(d => <th key={d} className="p-2 min-w-[40px] text-center text-xs font-bold text-slate-500 border-r border-dark-700/50">{d}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 sticky left-0 bg-dark-800 border-r border-dark-700 flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-dark-700 overflow-hidden border border-dark-600"><img src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`} alt="" className="w-full h-full object-cover" /></div>
                     <div><div className="text-sm font-bold text-slate-200">{user.username}</div><div className="text-[10px] text-slate-500 uppercase">{user.role}</div></div>
                  </td>
                  {dateHeaders.map(d => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const record = attendanceRecords.find(r => r.userId === user.id && r.date === dateStr);
                    const leave = leaveRequests.find(r => r.userId === user.id && r.startDate <= dateStr && r.endDate >= dateStr && r.status === 'approved');
                    const event = calendarEvents.find(e => e.date === dateStr && (e.targetScope === 'all' || e.targetUserIds?.includes(user.id))); 
                    
                    let content = <span className="text-dark-700">·</span>;
                    let bgColor = '';
                    if (event && event.type === 'holiday') { content = <span className="text-purple-500 font-bold text-xs">H</span>; bgColor = 'bg-purple-900/10'; }
                    else if (leave) { content = <span className="text-amber-500 font-bold text-xs">L</span>; bgColor = 'bg-amber-900/10'; }
                    else if (record) {
                      if (record.status === 'present') { content = <span className="text-emerald-500 font-bold text-xs">P</span>; bgColor = 'bg-emerald-900/10'; }
                      else { content = <span className="text-red-500 font-bold text-xs">A</span>; bgColor = 'bg-red-900/10'; }
                    }
                    return <td key={d} className={`text-center border-r border-dark-700/50 p-1 ${bgColor}`}>{content}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Top Bar: Live Clock & Actions */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm border border-slate-200 dark:border-dark-700">
         <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">EETTI <span className="text-primary-500">Attendance</span></h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <MapPin size={14} /> Corporate Office HQ • {now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
         </div>

         {/* Punch Clock Widget */}
         <div className="flex items-center gap-6 bg-slate-100 dark:bg-dark-900/50 p-4 rounded-xl border border-slate-200 dark:border-dark-700">
            <div className="text-right">
               <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white tabular-nums tracking-wider">
                 {now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}
               </div>
               <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">IST (Asia/Kolkata)</div>
            </div>
            <div className="h-10 w-px bg-slate-300 dark:bg-dark-700"></div>
            <div>
              {myTodayRecord?.checkIn && !myTodayRecord.checkOut ? (
                 <div className="flex items-center gap-4">
                   <div className="text-xl font-mono font-bold text-primary-400 animate-pulse">
                       {elapsedTime}
                   </div>
                   <Button onClick={handleCheckOut} className="bg-red-600 hover:bg-red-500 text-white border-none shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                       <Briefcase className="mr-2" size={18} /> Check Out
                   </Button>
                 </div>
              ) : myTodayRecord?.checkOut ? (
                 <div className="px-4 py-2 bg-emerald-900/30 border border-emerald-800 text-emerald-400 rounded-lg flex items-center">
                    <CheckCircle className="mr-2" size={18} /> Day Complete
                 </div>
              ) : (
                 <Button onClick={handleCheckIn} className="bg-primary-500 hover:bg-primary-400 text-black font-bold border-none shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                   <Fingerprint className="mr-2" size={18} /> Check In
                 </Button>
              )}
            </div>
         </div>
      </div>

      {/* Main Tabs */}
      <div className="border-b border-slate-200 dark:border-dark-700">
         <nav className="flex space-x-1">
           <button onClick={() => setActiveTab('calendar')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'calendar' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             Calendar View
           </button>
           <button onClick={() => setActiveTab('requests')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
             Requests & Approvals
           </button>
           {isAdmin && (
             <button onClick={() => setActiveTab('admin_overview')} className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'admin_overview' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
               Master Sheet (Admin)
             </button>
           )}
         </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'calendar' && (
          <div className="space-y-6">
             {renderStats()}
             {renderWeeklyEvents()} {/* New Weekly List */}
             
             <div className="flex justify-end mb-2">
               {isSystemAdmin && (
                 <span className="text-xs text-slate-400 italic mr-4 self-center">
                   * Click on a date to add Company Event/Holiday. Click on an event to Edit/Delete.
                 </span>
               )}
               <Button variant="secondary" onClick={() => setIsCorrectionModalOpen(true)} className="text-xs">
                 Request Correction
               </Button>
             </div>
             {renderCalendar()}
          </div>
        )}
        {activeTab === 'requests' && (
           /* ... Existing Request Tab Content ... */
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Request Leave Section */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">My Leave Requests</h3>
                    <Button onClick={() => setIsLeaveModalOpen(true)} className="text-xs">
                      <Plus size={14} className="mr-1" /> New Request
                    </Button>
                 </div>
                 <div className="space-y-3">
                    {leaveRequests.filter(r => r.userId === currentUser.id).map(req => (
                      <div key={req.id} className="p-4 bg-dark-900 rounded-lg border border-dark-700 flex justify-between items-center">
                         <div>
                            <div className="font-bold text-slate-200 capitalize">{req.type} Leave</div>
                            <div className="text-xs text-slate-500">{req.startDate} to {req.endDate}</div>
                         </div>
                         <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${
                           req.status === 'approved' ? 'bg-emerald-900/30 text-emerald-400' :
                           req.status === 'rejected' ? 'bg-red-900/30 text-red-400' :
                           'bg-amber-900/30 text-amber-400'
                         }`}>
                           {req.status}
                         </span>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Admin Approvals */}
              {isAdmin && (
                <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                   <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                     <ShieldAlert className="text-primary-500" /> Pending Approvals
                   </h3>
                   <div className="space-y-4">
                     {leaveRequests.filter(r => r.status === 'pending').length === 0 ? (
                       <p className="text-slate-500 italic">No pending requests.</p>
                     ) : (
                       leaveRequests.filter(r => r.status === 'pending').map(req => {
                         const u = users.find(user => user.id === req.userId);
                         return (
                           <div key={req.id} className="p-4 bg-dark-900 rounded-lg border border-dark-600">
                              <div className="flex justify-between mb-2">
                                 <span className="font-bold text-white">{u?.username}</span>
                                 <span className="text-xs text-primary-400 font-bold uppercase">{req.type} Leave</span>
                              </div>
                              <p className="text-sm text-slate-400 italic mb-3">"{req.reason}"</p>
                              <div className="flex gap-2">
                                <Button variant="secondary" className="flex-1 text-xs h-8 border-red-900 text-red-400 hover:bg-red-900/20" onClick={() => { setRejectModal({isOpen: true, req}); }}>Deny</Button>
                                <Button className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-500 border-none text-white" onClick={() => onUpdateLeaveStatus(req.id, 'approved', 'Approved')}>Approve</Button>
                              </div>
                           </div>
                         )
                       })
                     )}
                   </div>
                </div>
              )}
           </div>
        )}
        {activeTab === 'admin_overview' && isAdmin && renderAdminOverview()}
      </div>

      {/* --- EVENT MODAL (Super Admin / HR) --- */}
      <Modal isOpen={isEventModalOpen} onClose={() => setIsEventModalOpen(false)} title={editingEventId ? "View / Edit Event" : "Add Calendar Event"}>
         <form onSubmit={handleSaveEvent} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {isPastEvent ? (
               <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800 flex gap-2">
                  <Lock size={14} className="mt-0.5" />
                  <div>
                     <strong>Past Event Locked:</strong> Core details (Date, Time, Title) cannot be modified. <br/>
                     Admin can only update Status, Meeting Minutes, Feedback, and Attendance records.
                  </div>
               </div>
            ) : (
               <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800">
                 Create or update an event. Set duration and attendees for meetings to track detailed history.
               </div>
            )}
            
            {/* Date & Type */}
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
                 <input type="date" required disabled={isPastEvent} className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                 <select disabled={isPastEvent} className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 capitalize ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.type} onChange={e => setEventForm({...eventForm, type: e.target.value as any})}>
                    <option value="reminder">Reminder / Message</option>
                    <option value="meeting">Schedule / Meeting</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="holiday">Holiday</option>
                 </select>
               </div>
            </div>

            {/* Timings & Duration */}
            <div className="grid grid-cols-3 gap-3">
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                 <input type="time" disabled={isPastEvent} className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.startTime} onChange={e => handleStartTimeChange(e.target.value)} />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Duration (Min)</label>
                 <input type="number" min="0" disabled={isPastEvent} className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.duration} onChange={e => handleDurationChange(Number(e.target.value))} />
               </div>
               <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                 <input type="time" disabled={isPastEvent} className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.endTime} onChange={e => handleEndTimeChange(e.target.value)} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                  <input type="text" required disabled={isPastEvent} placeholder="e.g. Server Maintenance" className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Priority</label>
                  <select disabled={isPastEvent} className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 capitalize ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.priority} onChange={e => setEventForm({...eventForm, priority: e.target.value as any})}>
                     <option value="low">Low</option>
                     <option value="medium">Medium</option>
                     <option value="high">High</option>
                     <option value="urgent">Urgent</option>
                  </select>
               </div>
            </div>

            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description / Message</label>
               <textarea rows={2} disabled={isPastEvent} className={`w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900 ${isPastEvent ? 'opacity-50 cursor-not-allowed' : ''}`} value={eventForm.description} onChange={e => setEventForm({...eventForm, description: e.target.value})} />
            </div>

            {/* Targeting Logic */}
            <div className="border-t border-slate-200 pt-4 mt-2">
               <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Audience / Attendees</label>
               
               <div className="flex gap-4 mb-3">
                 <label className={`flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-primary-500 ${isPastEvent ? 'opacity-50 pointer-events-none' : ''}`}>
                   <input type="radio" name="scope" value="all" checked={eventForm.targetScope === 'all'} onChange={() => setEventForm({...eventForm, targetScope: 'all'})} className="text-primary-600 focus:ring-primary-500" />
                   <span className="text-sm font-bold text-slate-700 flex items-center gap-1"><Globe size={14}/> Everyone</span>
                 </label>
                 <label className={`flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-primary-500 ${isPastEvent ? 'opacity-50 pointer-events-none' : ''}`}>
                   <input type="radio" name="scope" value="department" checked={eventForm.targetScope === 'department'} onChange={() => setEventForm({...eventForm, targetScope: 'department'})} className="text-primary-600 focus:ring-primary-500" />
                   <span className="text-sm font-bold text-slate-700 flex items-center gap-1"><Building size={14}/> Departments</span>
                 </label>
                 <label className={`flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-primary-500 ${isPastEvent ? 'opacity-50 pointer-events-none' : ''}`}>
                   <input type="radio" name="scope" value="user" checked={eventForm.targetScope === 'user'} onChange={() => setEventForm({...eventForm, targetScope: 'user'})} className="text-primary-600 focus:ring-primary-500" />
                   <span className="text-sm font-bold text-slate-700 flex items-center gap-1"><Users size={14}/> Specific Users</span>
                 </label>
               </div>

               {/* Multi-Select: Departments */}
               {eventForm.targetScope === 'department' && (
                 <div className={`max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2 grid grid-cols-2 gap-2 ${isPastEvent ? 'opacity-50 pointer-events-none' : ''}`}>
                    {departments.map(dept => (
                       <label key={dept.id} className="flex items-center gap-2 text-sm p-1 hover:bg-white rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={eventForm.targetDepartmentIds.includes(dept.id)}
                            onChange={(e) => {
                               const newIds = e.target.checked 
                                 ? [...eventForm.targetDepartmentIds, dept.id]
                                 : eventForm.targetDepartmentIds.filter(id => id !== dept.id);
                               setEventForm({...eventForm, targetDepartmentIds: newIds});
                            }}
                            className="text-primary-600 rounded"
                          />
                          <span className="text-slate-700">{dept.name}</span>
                       </label>
                    ))}
                 </div>
               )}

               {/* Multi-Select: Users (Also populates Attendees list for meetings) */}
               {eventForm.targetScope === 'user' && (
                 <div className={`max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-lg p-2 grid grid-cols-2 gap-2 ${isPastEvent ? 'opacity-50 pointer-events-none' : ''}`}>
                    {users.map(u => (
                       <label key={u.id} className="flex items-center gap-2 text-sm p-1 hover:bg-white rounded cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={eventForm.targetUserIds.includes(u.id)}
                            onChange={() => toggleAttendeeSelection(u.id)}
                            className="text-primary-600 rounded"
                          />
                          <span className="text-slate-700">{u.username}</span>
                       </label>
                    ))}
                 </div>
               )}
            </div>

            {/* --- MEETING ATTENDANCE MANAGEMENT (Visible if Meeting + Users Selected) --- */}
            {eventForm.type === 'meeting' && eventForm.attendees.length > 0 && (
               <div className="border-t border-slate-200 pt-4 mt-2">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                     <UserCheck size={14} /> Meeting Attendance & History
                  </div>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                              <tr>
                                 <th className="px-3 py-2">Attendee</th>
                                 <th className="px-3 py-2">Status</th>
                                 <th className="px-3 py-2">Notes / Permission</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-200">
                              {eventForm.attendees.map(att => {
                                 const u = users.find(user => user.id === att.userId);
                                 return (
                                    <tr key={att.userId}>
                                       <td className="px-3 py-2 font-medium text-slate-700">{u?.username || 'Unknown'}</td>
                                       <td className="px-3 py-2">
                                          <select 
                                             className={`text-xs p-1 rounded border ${
                                                att.status === 'present' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                                                att.status === 'absent' ? 'bg-red-50 border-red-200 text-red-700' :
                                                att.status === 'excused' ? 'bg-amber-50 border-amber-200 text-amber-700' :
                                                'bg-white border-slate-300'
                                             }`}
                                             value={att.status}
                                             onChange={(e) => updateAttendeeStatus(att.userId, e.target.value)}
                                          >
                                             <option value="pending">Pending</option>
                                             <option value="accepted">Accepted</option>
                                             <option value="declined">Declined</option>
                                             <option value="present">Present</option>
                                             <option value="absent">Absent</option>
                                             <option value="excused">Excused (Perm.)</option>
                                          </select>
                                       </td>
                                       <td className="px-3 py-2">
                                          <input 
                                             type="text" 
                                             className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-xs focus:ring-1 focus:ring-primary-500" 
                                             placeholder="Details..." 
                                             value={att.notes || ''}
                                             onChange={(e) => updateAttendeeStatus(att.userId, att.status, e.target.value)}
                                          />
                                       </td>
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {/* --- ADMIN OUTCOME SECTION (Editable even in past) --- */}
            {(editingEventId && isSystemAdmin) && (
               <div className="border-t border-slate-200 pt-4 mt-4 bg-slate-50 p-3 rounded-lg">
                  <div className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                     <FileText size={14} /> Meeting Outcome & Feedback
                  </div>
                  
                  <div className="space-y-3">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Event Status</label>
                        <select className="w-full bg-white border-slate-200 rounded-lg p-2 text-slate-900 capitalize" value={eventForm.status} onChange={e => setEventForm({...eventForm, status: e.target.value as any})}>
                           <option value="scheduled">Scheduled</option>
                           <option value="completed">Completed</option>
                           <option value="cancelled">Cancelled</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Minutes of Meeting (MoM)</label>
                        <textarea rows={3} placeholder="Key discussion points..." className="w-full bg-white border-slate-200 rounded-lg p-2 text-slate-900" value={eventForm.mom} onChange={e => setEventForm({...eventForm, mom: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Admin Feedback</label>
                        <textarea rows={2} placeholder="Internal feedback or notes..." className="w-full bg-white border-slate-200 rounded-lg p-2 text-slate-900" value={eventForm.feedback} onChange={e => setEventForm({...eventForm, feedback: e.target.value})} />
                     </div>
                  </div>
               </div>
            )}

            <div className="flex justify-between pt-2">
               {(editingEventId && !isPastEvent) ? (
                 <Button type="button" variant="danger" onClick={handleDeleteEvent}>
                   <Trash2 size={16} className="mr-2" /> Delete Event
                 </Button>
               ) : <div></div>}
               
               <Button type="submit">
                 {editingEventId ? 'Update Event' : 'Create Event'}
               </Button>
            </div>
         </form>
      </Modal>

      {/* ... Existing Modals (Leave, Correction, Manual) ... */}
      <Modal isOpen={isLeaveModalOpen} onClose={() => setIsLeaveModalOpen(false)} title="Apply for Leave">
         <form onSubmit={(e) => { e.preventDefault(); onAddLeaveRequest({...leaveForm, type: leaveForm.type as any, userId: currentUser.id}); setIsLeaveModalOpen(false); }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From</label>
                  <input type="date" required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                  <input type="date" required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} />
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
               <select className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value})}>
                 <option value="sick">Sick Leave</option>
                 <option value="vacation">Vacation</option>
                 <option value="personal">Personal</option>
               </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason</label>
               <textarea required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}></textarea>
            </div>
            <div className="flex justify-end pt-2">
               <Button type="submit">Submit Application</Button>
            </div>
         </form>
      </Modal>

      <Modal isOpen={isCorrectionModalOpen} onClose={() => setIsCorrectionModalOpen(false)} title="Attendance Correction">
         <form onSubmit={handleCorrectionSubmit} className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Date</label>
               <input type="date" required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={correctionForm.date} onChange={e => setCorrectionForm({...correctionForm, date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check In</label>
                  <input type="time" className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={correctionForm.checkIn} onChange={e => setCorrectionForm({...correctionForm, checkIn: e.target.value})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check Out</label>
                  <input type="time" className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={correctionForm.checkOut} onChange={e => setCorrectionForm({...correctionForm, checkOut: e.target.value})} />
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Reason for Adjustment</label>
               <textarea required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" rows={2} value={correctionForm.reason} onChange={e => setCorrectionForm({...correctionForm, reason: e.target.value})} placeholder="e.g. Forgot ID card, Biometric failure"></textarea>
            </div>
            <div className="flex justify-end pt-2">
               <Button type="submit">Request Adjustment</Button>
            </div>
         </form>
      </Modal>

      {/* Manual Admin Entry Modal */}
      <Modal isOpen={adminManualEntryModal.isOpen} onClose={() => setAdminManualEntryModal({...adminManualEntryModal, isOpen: false})} title="Admin: Manual Attendance">
         <form onSubmit={handleAdminManualSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Employee</label>
              <select className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={adminManualEntryModal.userId} onChange={e => setAdminManualEntryModal({...adminManualEntryModal, userId: e.target.value})} required>
                 <option value="">Select Employee</option>
                 {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
               <input type="date" required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={adminManualEntryModal.date} onChange={e => setAdminManualEntryModal({...adminManualEntryModal, date: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check In</label>
                  <input type="time" required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={adminManualEntryModal.checkIn} onChange={e => setAdminManualEntryModal({...adminManualEntryModal, checkIn: e.target.value})} />
               </div>
               <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Check Out</label>
                  <input type="time" required className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={adminManualEntryModal.checkOut} onChange={e => setAdminManualEntryModal({...adminManualEntryModal, checkOut: e.target.value})} />
               </div>
            </div>
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Status</label>
               <select className="w-full bg-slate-100 border-slate-200 rounded-lg p-2 text-slate-900" value={adminManualEntryModal.status} onChange={e => setAdminManualEntryModal({...adminManualEntryModal, status: e.target.value})}>
                 <option value="present">Present</option>
                 <option value="late">Late</option>
                 <option value="half-day">Half Day</option>
                 <option value="absent">Absent</option>
               </select>
            </div>
            <div className="flex justify-end pt-2">
               <Button type="submit">Add Record</Button>
            </div>
         </form>
      </Modal>
      
      <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({...confirmModal, isOpen: false})} onConfirm={confirmModal.action} title={confirmModal.title || "Confirm Action"} message={confirmModal.message} isDanger={true} confirmLabel="Confirm" />
    </div>
  );
};

export default AttendancePage;