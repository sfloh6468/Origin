
import React, { useMemo } from 'react';
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
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { Ticket, TicketStatus, Engineer } from '../types';
import { TrendingUp, Clock, AlertTriangle, Home, Users, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  tickets: Ticket[];
  engineers: Engineer[];
  currentUser: Engineer;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tickets, engineers, currentUser }) => {
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

  // 3. Workload Distribution
  const workloadData = engineers.map(eng => ({
    name: eng.name.split(' ')[0],
    tickets: tickets.filter(t => t.assignedEngineerId === eng.id && t.status !== TicketStatus.CLOSED).length
  }));

  // 4. Status Breakdown
  const statusData = [
    { name: 'Open', value: tickets.filter(t => t.status === TicketStatus.OPEN).length },
    { name: 'In-Progress', value: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length },
    { name: 'Resolved', value: tickets.filter(t => t.status === TicketStatus.RESOLVED).length },
    { name: 'On-Site', value: siteVisitTickets.length },
  ];

  // 5. Trending Data (Last 7 Days)
  const trendData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayTickets = tickets.filter(t => t.createdAt.startsWith(date));
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: dayTickets.length,
        emergency: dayTickets.filter(t => t.priority === 'Emergency').length
      };
    });
  }, [tickets]);

  const COLORS = ['#3B82F6', '#6366F1', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Service Quality KPIs</h1>
          <p className="text-slate-500 font-medium">Real-time performance metrics and workload distribution.</p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Historical Trending Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Incident Volume Trends</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Rolling 7-Day performance</p>
            </div>
            <Calendar size={20} className="text-slate-300" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                <Line type="monotone" dataKey="emergency" stroke="#EF4444" strokeWidth={2} dot={{ r: 4, fill: '#EF4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Small Status Breakdown Chart */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
           <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Queue Velocity</h3>
            <div className="bg-slate-50 px-3 py-1 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Flow</div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} width={80} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Engineering Workload Distribution</h3>
            <Users size={20} className="text-slate-300" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#94A3B8' }} />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="tickets" radius={[12, 12, 0, 0]} fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, trend: string }> = ({ label, value, icon, trend }) => (
  <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl transition-all group cursor-default">
    <div className="flex items-center justify-between mb-6">
      <div className="p-4 bg-slate-50 rounded-[25px] group-hover:bg-blue-50 transition-colors">{icon}</div>
      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">{trend}</span>
    </div>
    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-3xl font-black text-slate-800 tracking-tight">{value}</p>
  </div>
);

export default AnalyticsView;
