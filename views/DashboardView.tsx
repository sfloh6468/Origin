
import React from 'react';
import { Ticket, Subscriber, TicketStatus, TicketPriority } from '../types';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Smartphone, 
  Settings2 
} from 'lucide-react';

interface DashboardViewProps {
  tickets: Ticket[];
  subscribers: Subscriber[];
}

const DashboardView: React.FC<DashboardViewProps> = ({ tickets, subscribers }) => {
  const openTickets = tickets.filter(t => t.status === TicketStatus.OPEN);
  const emergencyTickets = tickets.filter(t => t.priority === TicketPriority.EMERGENCY && t.status !== TicketStatus.CLOSED);
  const pendingVisits = tickets.filter(t => t.status === TicketStatus.PENDING_SITE_VISIT);
  
  const stats = [
    { label: 'Open Tickets', value: openTickets.length, icon: <AlertCircle className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Emergency Alerts', value: emergencyTickets.length, icon: <Settings2 className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Site Visits Pending', value: pendingVisits.length, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50' },
    { label: 'Active Subscribers', value: subscribers.length, icon: <Smartphone className="text-green-500" />, bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Operational Overview</h1>
        <p className="text-slate-500">Real-time stats for the current shift.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4 transition-all hover:shadow-md">
            <div className={`p-4 rounded-xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800">Recent Critical Tickets</h3>
            <button className="text-sm text-blue-600 font-medium hover:underline">View All</button>
          </div>
          <div className="divide-y divide-slate-100">
            {tickets.filter(t => t.priority === TicketPriority.EMERGENCY || t.priority === TicketPriority.HIGH).slice(0, 5).map(t => (
              <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className={`w-2 h-12 rounded-full ${t.priority === TicketPriority.EMERGENCY ? 'bg-red-500' : 'bg-orange-500'}`} />
                  <div>
                    <p className="font-bold text-slate-800">{t.subject}</p>
                    <p className="text-xs text-slate-500 flex items-center space-x-2">
                      <span>{t.id}</span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleString()}</span>
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  t.status === TicketStatus.OPEN ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {t.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl flex items-center px-4 space-x-3 text-sm font-medium">
                <UserPlus size={18} />
                <span>Register New Subscriber</span>
              </button>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl flex items-center px-4 space-x-3 text-sm font-medium">
                <CheckCircle2 size={18} />
                <span>Bulk Resolve Tickets</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Network Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Core Switch A</span>
                <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded uppercase">Stable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Condo GPON-01</span>
                <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded uppercase">Stable</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Condo GPON-02</span>
                <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-1 rounded uppercase">Load Warning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
