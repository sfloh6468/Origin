
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
import { Ticket, TicketStatus, Engineer } from '../types';
import { TrendingUp, Clock, AlertTriangle, Home, Users } from 'lucide-react';

interface AnalyticsViewProps {
  tickets: Ticket[];
  engineers: Engineer[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tickets, engineers }) => {
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

  // Workload Distribution
  const workloadData = engineers.map(eng => ({
    name: eng.name.split(' ')[0],
    tickets: tickets.filter(t => t.assignedEngineerId === eng.id && t.status !== TicketStatus.CLOSED).length
  }));

  // Data for Status Chart
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
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Service Quality KPIs</h1>
        <p className="text-slate-500 font-medium">Real-time performance metrics and workload distribution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Resolution (MTTR)" 
          value={`${mttrMinutes} min`} 
          icon={<Clock className="text-blue-500" />} 
          trend="+5% vs shift avg" 
        />
        <MetricCard 
          label="Field Ops Rate" 
          value={`${onSiteRate}%`} 
          icon={<Home className="text-purple-500" />} 
          trend="Target: <15%" 
        />
        <MetricCard 
          label="Active Load" 
          value={tickets.filter(t => t.status !== TicketStatus.CLOSED).length} 
          icon={<TrendingUp className="text-green-500" />} 
          trend="Global Volume" 
        />
        <MetricCard 
          label="Critical Failures" 
          value={tickets.filter(t => t.priority === 'Emergency').length} 
          icon={<AlertTriangle className="text-red-500" />} 
          trend="Immediate Action" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Workload Distribution</h3>
            <Users size={20} className="text-slate-300" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="tickets" radius={[12, 12, 0, 0]} fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Global Queue Status</h3>
            <div className="bg-slate-50 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Flow</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, trend: string }> = ({ label, value, icon, trend }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
    <div className="flex items-center justify-between mb-6">
      <div className="p-4 bg-slate-50 rounded-[25px] group-hover:bg-blue-50 transition-colors">{icon}</div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{trend}</span>
    </div>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
  </div>
);

export default AnalyticsView;
