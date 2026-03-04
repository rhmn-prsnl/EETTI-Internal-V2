import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  User, Project, Task, Invoice, Client, Lead, Expense, PayrollRecord, PermissionKey 
} from '../types';
import { 
  FileText, TrendingUp, Users, PieChart as PieChartIcon, DollarSign, 
  Calendar, Download, Filter, BarChart2, Clock, Target, Lock
} from 'lucide-react';
import Button from '../components/ui/Button';

interface ReportsPageProps {
  currentUser: User;
  userPermissions: PermissionKey[];
  users: User[];
  projects: Project[];
  tasks: Task[];
  invoices: Invoice[];
  clients: Client[];
  leads: Lead[];
  expenses: Expense[];
  payrollRecords: PayrollRecord[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportsPage: React.FC<ReportsPageProps> = ({
  currentUser, userPermissions, users, projects, tasks, invoices, clients, leads, expenses, payrollRecords
}) => {
  const [activeReport, setActiveReport] = useState<'revenue' | 'productivity' | 'profitability' | 'roi' | 'conversion' | 'time'>('revenue');
  const [dateRange, setDateRange] = useState('this_year');

  const canViewFinancials = currentUser.role === 'super_admin' || userPermissions.includes('finance_view_profit');

  // --- 1. Monthly Revenue Report ---
  const revenueData = useMemo(() => {
    if (!canViewFinancials) return [];
    const data: { name: string; revenue: number; expense: number; profit: number }[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach((month, index) => {
      // Mocking realistic data distribution based on month index
      // In a real app, we would filter invoices/expenses by date
      const baseRevenue = 500000 + (index * 20000) + (Math.random() * 100000);
      const baseExpense = 300000 + (index * 10000) + (Math.random() * 50000);
      
      data.push({
        name: month,
        revenue: Math.round(baseRevenue),
        expense: Math.round(baseExpense),
        profit: Math.round(baseRevenue - baseExpense)
      });
    });
    return data;
  }, []);

  // --- 2. Employee Productivity Report ---
  const productivityData = useMemo(() => {
    return users.slice(0, 8).map(user => {
      const userTasks = tasks.filter(t => t.assignedTo.includes(user.id));
      const completed = userTasks.filter(t => t.status === 'completed').length;
      const total = userTasks.length || 1; // Avoid division by zero
      const efficiency = Math.round((completed / total) * 100);
      
      return {
        name: `${user.firstName} ${user.lastName}`,
        tasksCompleted: completed,
        efficiency: efficiency,
        hoursLogged: Math.round(120 + Math.random() * 60) // Mock hours
      };
    });
  }, [users, tasks]);

  // --- 3. Client Profitability Report ---
  const clientProfitabilityData = useMemo(() => {
    return clients.slice(0, 6).map(client => {
      // Mock calculation
      const revenue = Math.round(500000 + Math.random() * 1000000);
      const cost = Math.round(revenue * (0.4 + Math.random() * 0.3));
      return {
        name: client.clientName,
        revenue: revenue,
        cost: cost,
        profit: revenue - cost,
        margin: Math.round(((revenue - cost) / revenue) * 100)
      };
    });
  }, [clients]);

  // --- 4. Campaign ROI Report ---
  const campaignROIData = useMemo(() => {
    const campaigns = [
      { name: 'Summer Sale', cost: 50000, revenue: 150000 },
      { name: 'Black Friday', cost: 80000, revenue: 320000 },
      { name: 'New Year Promo', cost: 60000, revenue: 180000 },
      { name: 'Email Drip', cost: 15000, revenue: 45000 },
      { name: 'Social Ads Q3', cost: 40000, revenue: 90000 },
    ];
    
    return campaigns.map(c => ({
      ...c,
      roi: Math.round(((c.revenue - c.cost) / c.cost) * 100)
    }));
  }, []);

  // --- 5. Lead Conversion Report ---
  const leadConversionData = useMemo(() => {
    const data = [
      { name: 'Website', leads: 120, converted: 15 },
      { name: 'LinkedIn', leads: 80, converted: 12 },
      { name: 'Referral', leads: 40, converted: 20 },
      { name: 'Cold Call', leads: 200, converted: 5 },
      { name: 'Events', leads: 60, converted: 8 },
    ];
    return data.map(d => ({
      ...d,
      rate: Math.round((d.converted / d.leads) * 100)
    }));
  }, []);

  // --- 6. Project Time Analysis Report ---
  const projectTimeData = useMemo(() => {
    return projects.slice(0, 5).map(p => ({
      name: p.name,
      estimated: Math.round(500 + Math.random() * 500),
      actual: Math.round(400 + Math.random() * 700),
    }));
  }, [projects]);

  const renderActiveReport = () => {
    // Financial Access Control
    if (['revenue', 'profitability', 'roi'].includes(activeReport) && !canViewFinancials) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-dark-700 border-dashed">
          <div className="p-4 bg-slate-100 dark:bg-dark-700 rounded-full mb-4">
            <Lock size={48} className="text-slate-400 dark:text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Access Restricted</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md">
            You do not have permission to view sensitive financial data. Please contact your administrator to request access.
          </p>
        </div>
      );
    }

    switch (activeReport) {
      case 'revenue':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                <p className="text-sm text-slate-500 uppercase font-bold">Total Revenue (YTD)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">₹{revenueData.reduce((a, b) => a + b.revenue, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                <p className="text-sm text-slate-500 uppercase font-bold">Total Expenses (YTD)</p>
                <p className="text-2xl font-bold text-red-600 mt-1">₹{revenueData.reduce((a, b) => a + b.expense, 0).toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                <p className="text-sm text-slate-500 uppercase font-bold">Net Profit (YTD)</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">₹{revenueData.reduce((a, b) => a + b.profit, 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Monthly Revenue vs Expenses</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                    <Area type="monotone" dataKey="expense" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'productivity':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Employee Efficiency (Tasks Completed vs Total)</h3>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" width={150} stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="efficiency" fill="#8884d8" name="Efficiency Score (%)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="tasksCompleted" fill="#82ca9d" name="Tasks Completed" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      case 'profitability':
        return (
          <div className="space-y-6">
             <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Client Profitability Analysis</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clientProfitabilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
                    <Bar dataKey="cost" fill="#ef4444" name="Cost" />
                    <Bar dataKey="profit" fill="#10b981" name="Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {clientProfitabilityData.map((client, idx) => (
                 <div key={idx} className="bg-white dark:bg-dark-800 p-4 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm flex justify-between items-center">
                    <div>
                       <h4 className="font-bold text-slate-800 dark:text-white">{client.name}</h4>
                       <p className="text-sm text-slate-500">Margin: <span className={client.margin > 30 ? 'text-green-500' : 'text-orange-500'}>{client.margin}%</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-bold text-primary-600">₹{client.profit.toLocaleString()}</p>
                       <p className="text-xs text-slate-400">Net Profit</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        );

      case 'roi':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Campaign ROI (%)</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={campaignROIData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Bar dataKey="roi" fill="#8b5cf6" name="ROI %" radius={[4, 4, 0, 0]}>
                      {campaignROIData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.roi > 100 ? '#10b981' : '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-slate-200 dark:border-dark-700 overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-dark-700/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-dark-700">
                        <th className="p-4 font-semibold">Campaign</th>
                        <th className="p-4 font-semibold">Cost</th>
                        <th className="p-4 font-semibold">Revenue</th>
                        <th className="p-4 font-semibold">ROI</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-700">
                     {campaignROIData.map((c, i) => (
                        <tr key={i} className="hover:bg-slate-50 dark:hover:bg-dark-700/30">
                           <td className="p-4 font-medium text-slate-900 dark:text-white">{c.name}</td>
                           <td className="p-4 text-slate-600 dark:text-slate-400">₹{c.cost.toLocaleString()}</td>
                           <td className="p-4 text-slate-600 dark:text-slate-400">₹{c.revenue.toLocaleString()}</td>
                           <td className="p-4 font-bold text-slate-900 dark:text-white">
                              <span className={`px-2 py-1 rounded-full text-xs ${c.roi > 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                 {c.roi}%
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          </div>
        );

      case 'conversion':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                 <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Lead Source Distribution</h3>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                       <Pie
                         data={leadConversionData}
                         cx="50%"
                         cy="50%"
                         labelLine={false}
                         label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                         outerRadius={80}
                         fill="#8884d8"
                         dataKey="leads"
                       >
                         {leadConversionData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                       />
                     </PieChart>
                   </ResponsiveContainer>
                 </div>
               </div>
               
               <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
                 <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Conversion Rate by Source (%)</h3>
                 <div className="h-64 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={leadConversionData} layout="vertical">
                       <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                       <XAxis type="number" stroke="#6b7280" />
                       <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                       <Tooltip 
                         contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                       />
                       <Bar dataKey="rate" fill="#f43f5e" name="Conversion Rate %" radius={[0, 4, 4, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
            </div>
          </div>
        );

      case 'time':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl border border-slate-200 dark:border-dark-700 shadow-sm">
              <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white">Project Time Analysis (Estimated vs Actual Hours)</h3>
              <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                    />
                    <Legend />
                    <Bar dataKey="estimated" fill="#94a3b8" name="Estimated Hours" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-dark-900">
      {/* Header */}
      <div className="bg-white dark:bg-dark-800 border-b border-slate-300 dark:border-dark-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
              <BarChart2 className="mr-3 text-primary-500" size={28} /> Reporting & BI
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Advanced analytics and business intelligence reports.</p>
          </div>
          <div className="flex gap-3">
             <select 
               className="bg-slate-50 dark:bg-dark-700 border border-slate-200 dark:border-dark-600 rounded-lg px-4 py-2 text-sm"
               value={dateRange}
               onChange={(e) => setDateRange(e.target.value)}
             >
               <option value="this_month">This Month</option>
               <option value="last_month">Last Month</option>
               <option value="this_quarter">This Quarter</option>
               <option value="this_year">This Year</option>
             </select>
             <Button variant="outline" icon={<Download size={18} />}>Export Report</Button>
          </div>
        </div>

        {/* Report Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { id: 'revenue', label: 'Revenue', icon: <DollarSign size={16} /> },
            { id: 'productivity', label: 'Productivity', icon: <Users size={16} /> },
            { id: 'profitability', label: 'Client Profit', icon: <TrendingUp size={16} /> },
            { id: 'roi', label: 'Campaign ROI', icon: <Target size={16} /> },
            { id: 'conversion', label: 'Lead Conv.', icon: <Filter size={16} /> },
            { id: 'time', label: 'Time Analysis', icon: <Clock size={16} /> },
          ].map(report => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id as any)}
              className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                activeReport === report.id 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-500 text-primary-700 dark:text-primary-400 font-bold shadow-sm' 
                  : 'bg-white dark:bg-dark-800 border-slate-200 dark:border-dark-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-700'
              }`}
            >
              {report.icon}
              <span className="text-sm">{report.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Report Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {renderActiveReport()}
      </div>
    </div>
  );
};

export default ReportsPage;
