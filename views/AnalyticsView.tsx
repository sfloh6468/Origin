
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Ticket, TicketStatus } from '../types';
import { TrendingUp, Clock, AlertTriangle, Home } from 'lucide-react';

interface AnalyticsViewProps {
  tickets: Ticket[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tickets }) => {
  // 1. Mean Time To Resolve (MTTR)
  const resolvedTickets = tickets.filter(t => t.status === TicketStatus.RESOLVED && t.resolvedAt);
  const totalResolutionTime = resolvedTickets.reduce((acc, t) => {
    const diff = new Date(t.resolvedAt!).getTime() - new Date(t.createdAt).getTime();
    return acc + diff;
  }, 0);
  const mttrMinutes = resolvedTickets.length > 0 ? Math.round((totalResolutionTime / resolvedTickets.length) / 60000) : 0;

  // 2. On-Site Rate
  const siteVisitTickets = tickets.filter(t => t.status === TicketStatus.PENDING_SITE_VISIT || t.hardwareReplacement);
  const onSiteRate = tickets.length > 0 ? Math.round((siteVisitTickets.length / tickets.length) * 100) : 0;

  // 3. Recurring Issues (Mock Logic)
  const recurringIssues = [
    { unit: 'A-12-05', condo: 'Horizon Res.', count: 4 },
    { unit: 'B-05-11', condo: 'Skyline Towers', count: 3 },
  ];

  // Data for Charts
  const statusData = [
    { name: 'Open', value: tickets.filter(t => t.status === TicketStatus.OPEN).length },
    { name: 'In-Progress', value: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length },
    { name: 'Resolved', value: tickets.filter(t => t.status === TicketStatus.RESOLVED).length },
    { name: 'On-Site', value: siteVisitTickets.length },
  ];

  const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Operational Analytics</h1>
        <p className="text-slate-500">Service quality metrics and performance KPIs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Avg. MTTR" 
          value={`${mttrMinutes} min`} 
          icon={<Clock className="text-blue-500" />} 
          trend="+5% vs last week" 
        />
        <MetricCard 
          label="On-Site Rate" 
          value={`${onSiteRate}%`} 
          icon={<Home className="text-purple-500" />} 
          trend="-2% improvement" 
        />
        <MetricCard 
          label="Active Load" 
          value={tickets.filter(t => t.status !== TicketStatus.CLOSED).length} 
          icon={<TrendingUp className="text-green-500" />} 
          trend="Steady" 
        />
        <MetricCard 
          label="Emergency" 
          value={tickets.filter(t => t.priority === 'Emergency').length} 
          icon={<AlertTriangle className="text-red-500" />} 
          trend="Attention needed" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Volume by Ticket Status</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Hotspot Alerts (Recurring Issues)</h3>
          <div className="space-y-4">
            {recurringIssues.map((issue, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold">
                    !
                  </div>
                  <div>
                    <p className="font-bold text-red-900">{issue.condo} - {issue.unit}</p>
                    <p className="text-xs text-red-700 font-medium">{issue.count} support tickets in last 30 days</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-red-700 bg-white px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-all uppercase tracking-wider">
                  Audit Path
                </button>
              </div>
            ))}
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 mt-4">
              <p className="text-sm text-slate-400 font-medium">Automatic escalation triggers at 5+ monthly tickets per unit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, trend: string }> = ({ label, value, icon, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{trend}</span>
    </div>
    <p className="text-sm font-bold text-slate-500 mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-800">{value}</p>
  </div>
);

export default AnalyticsView;
