import React, { useState } from 'react';
import { User, AttendanceRecord, PerformanceReview, LeaveRequest, Task } from '../types';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Shield, CheckCircle, XCircle, Building, Star, Clock, AlertCircle } from 'lucide-react';
import Button from '../components/ui/Button';

interface UserDetailsProps {
  user: User;
  onBack: () => void;
  onEdit: (user: User) => void;
  // Injected Data
  attendanceHistory?: AttendanceRecord[];
  leaveHistory?: LeaveRequest[];
  performanceHistory?: PerformanceReview[];
  tasks?: Task[];
}

const UserDetails: React.FC<UserDetailsProps> = ({ 
  user, 
  onBack, 
  onEdit,
  attendanceHistory = [],
  leaveHistory = [],
  performanceHistory = [],
  tasks = []
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'performance'>('overview');

  // Helper to render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={i < rating ? "currentColor" : "none"} className={i < rating ? "" : "text-slate-300"} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Nav */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Users
        </button>
        <div className="space-x-2">
           <Button variant="secondary" onClick={() => alert('Download Report')}>Export Report</Button>
           <Button onClick={() => onEdit(user)}>Edit Profile</Button>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
          <div className="absolute inset-0 bg-white/5 pattern-grid-lg"></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-12 mb-6">
            <div className="flex items-end">
              <div className="relative">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}&background=random`} 
                  alt={user.username}
                  className="w-24 h-24 rounded-2xl border-4 border-white shadow-md object-cover bg-white"
                />
                <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-white ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
              </div>
              <div className="ml-6 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                </h1>
                <div className="flex items-center text-slate-500 text-sm mt-1">
                  <span className="capitalize">{user.position || 'No Position'}</span>
                  <span className="mx-2">•</span>
                  <span className="capitalize">{user.department || 'No Department'}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end gap-2">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                user.status === 'active' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {user.status === 'active' ? <CheckCircle size={12} className="mr-1.5" /> : <XCircle size={12} className="mr-1.5" />}
                <span className="capitalize">{user.status}</span>
              </div>
              <div className="text-xs text-slate-400">
                Last Login: {user.lastLogin}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Attendance & Leaves
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'performance' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
              Performance & Tasks
            </button>
          </div>

          {/* TAB CONTENT */}
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Contact Info */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Personal Info</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Mail className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <span className="block text-xs text-slate-500">Email Address</span>
                      <span className="text-sm font-medium text-slate-700">{user.officialEmail}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Phone className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <span className="block text-xs text-slate-500">Phone Number</span>
                      <span className="text-sm font-medium text-slate-700">{user.mobileNumber || 'Not provided'}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <span className="block text-xs text-slate-500">Location</span>
                      <span className="text-sm font-medium text-slate-700">{user.workLocation || 'Remote'}</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Middle Column: Employment */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Employment Details</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <span className="block text-xs text-slate-500">Position</span>
                      <span className="text-sm font-medium text-slate-700 capitalize">{user.position || '-'}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Building className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <span className="block text-xs text-slate-500">Department</span>
                      <span className="text-sm font-medium text-slate-700 capitalize">{user.department || '-'}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <span className="block text-xs text-slate-500">Join Date</span>
                      <span className="text-sm font-medium text-slate-700">{user.joinDate || '-'}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Shield className="w-5 h-5 text-slate-400 mt-0.5 mr-3" />
                    <div>
                      <span className="block text-xs text-slate-500">System Role</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700 capitalize">
                        {user.role}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Right Column: Bio / Notes */}
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">About</h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[160px]">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {user.bio || "No biography provided for this user yet."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE TAB */}
          {activeTab === 'attendance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Leave History</h3>
                {leaveHistory.length > 0 ? (
                  <div className="space-y-3">
                    {leaveHistory.map(leave => (
                      <div key={leave.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                        <div>
                          <div className="text-sm font-bold text-slate-800 capitalize">{leave.type} Leave</div>
                          <div className="text-xs text-slate-500">{leave.startDate} to {leave.endDate}</div>
                          <div className="text-xs text-slate-500 mt-1 italic">"{leave.reason}"</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-bold capitalize ${
                          leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No leave records found.</p>
                )}
              </div>

              <div>
                 <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Recent Attendance</h3>
                 <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-200">
                       <span className="text-xs font-bold text-slate-500">Date</span>
                       <span className="text-xs font-bold text-slate-500">Status</span>
                       <span className="text-xs font-bold text-slate-500">Check In/Out</span>
                    </div>
                    {attendanceHistory.slice(0, 5).map(record => (
                      <div key={record.id} className="flex items-center justify-between py-2 text-sm">
                         <span className="text-slate-700">{record.date}</span>
                         <span className={`capitalize font-medium ${
                           record.status === 'present' ? 'text-emerald-600' : 
                           record.status === 'absent' ? 'text-red-500' : 'text-amber-500'
                         }`}>{record.status}</span>
                         <span className="text-slate-500 text-xs">
                           {record.checkIn ? `${record.checkIn} - ${record.checkOut || '...'}` : '-'}
                         </span>
                      </div>
                    ))}
                    {attendanceHistory.length === 0 && <p className="text-sm text-slate-400 italic">No attendance records.</p>}
                 </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Performance Reviews</h3>
                {performanceHistory.length > 0 ? (
                  <div className="grid gap-4">
                    {performanceHistory.map(review => (
                      <div key={review.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm text-slate-500 mb-1">{review.date}</div>
                            {renderStars(review.rating)}
                            <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
                          </div>
                          <div className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">
                            By: {review.reviewer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">No performance reviews available.</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Assigned Tasks</h3>
                   <Button variant="secondary" className="h-8 text-xs">Assign Task</Button>
                </div>
                {tasks.length > 0 ? (
                  <div className="overflow-hidden bg-white border border-slate-200 rounded-xl">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Task</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {tasks.map(task => (
                          <tr key={task.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{task.title}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 flex items-center">
                              <Clock size={14} className="mr-1.5" /> {task.dueDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-0.5 ${
                                task.status === 'done' ? 'bg-green-100 text-green-800' : 
                                task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status.replace('-', ' ')}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center">
                     <AlertCircle className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                     <p className="text-slate-500 text-sm">No active tasks assigned.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default UserDetails;