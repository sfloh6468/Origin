
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Subscriber, TicketStatus, TicketPriority, Engineer, Comment, AuthorType } from '../types';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  Smartphone, 
  Settings2,
  User,
  AlertTriangle,
  PlusCircle,
  TrendingUp,
  FileText
} from 'lucide-react';

interface DashboardViewProps {
  tickets: Ticket[];
  subscribers: Subscriber[];
  currentUser: Engineer;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
}

const DashboardView: React.FC<DashboardViewProps> = ({ tickets, subscribers, currentUser, setTickets, setComments }) => {
  const navigate = useNavigate();
  const [showBulkModal, setShowBulkModal] = useState(false);

  const openTickets = tickets.filter(t => t.status === TicketStatus.OPEN);
  const emergencyTickets = tickets.filter(t => t.priority === TicketPriority.EMERGENCY && t.status !== TicketStatus.CLOSED);
  const pendingVisits = tickets.filter(t => t.status === TicketStatus.PENDING_SITE_VISIT);
  
  const myTickets = currentUser 
    ? tickets.filter(t => t.assignedEngineerId === currentUser.id && t.status !== TicketStatus.CLOSED && t.status !== TicketStatus.RESOLVED)
    : [];

  const activeTicketsCount = tickets.filter(t => 
    t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED
  ).length;

  const handleBulkResolve = () => {
    const timestamp = new Date().toISOString();
    const activeTickets = tickets.filter(t => 
      t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED
    );

    if (activeTickets.length === 0) {
      alert("No active tickets to resolve.");
      setShowBulkModal(false);
      return;
    }

    setTickets(prev => prev.map(t => {
      if (t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED) {
        return {
          ...t,
          status: TicketStatus.RESOLVED,
          resolvedAt: timestamp,
          assignedEngineerId: t.assignedEngineerId || currentUser.id
        };
      }
      return t;
    }));

    const bulkComments: Comment[] = activeTickets.map(t => ({
      id: `comm-bulk-${t.id}-${Date.now()}`,
      ticketId: t.id,
      authorType: AuthorType.SYSTEM,
      authorName: 'System Audit',
      message: `Ticket auto-resolved via Dashboard Bulk Action by ${currentUser.name}`,
      timestamp
    }));

    setComments(prev => [...prev, ...bulkComments]);
    setShowBulkModal(false);
  };

  const stats = [
    { label: 'Open Tickets', value: openTickets.length, icon: <AlertCircle className="text-blue-500" />, bg: 'bg-blue-50' },
    { label: 'Emergency Alerts', value: emergencyTickets.length, icon: <AlertTriangle className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Site Visits Pending', value: pendingVisits.length, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50' },
    { label: 'Active Subscribers', value: subscribers.length, icon: <Smartphone className="text-green-500" />, bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Operational Overview</h1>
          <p className="text-slate-500 font-medium">Real-time stats for the current shift.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/tickets', { state: { openNewReport: true } })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all"
          >
            <PlusCircle size={18} />
            <span>Create Incident Report</span>
          </button>
          {currentUser && (
            <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <User size={16} />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">My Workload</p>
                <p className="text-sm font-black text-slate-800 leading-none">{myTickets.length} Assigned</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 flex items-center space-x-4 transition-all hover:shadow-lg">
            <div className={`p-4 rounded-[25px] ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Critical Global Tickets</h3>
              <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                 <span className="text-[10px] font-black text-slate-400 uppercase">Live Priority</span>
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {tickets.filter(t => t.priority === TicketPriority.EMERGENCY || t.priority === TicketPriority.HIGH).slice(0, 5).map(t => (
                <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => navigate('/tickets')}>
                  <div className="flex items-center space-x-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.priority === TicketPriority.EMERGENCY ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                       <AlertTriangle size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{t.subject}</p>
                      <p className="text-[10px] text-slate-400 flex items-center space-x-2 font-bold uppercase tracking-widest mt-1">
                        <span>#{t.id}</span>
                        <span>•</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        {t.assignedEngineerId && (
                          <span className="text-blue-500">OWNED BY TEAMMATE</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                    t.status === TicketStatus.OPEN ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
               <TrendingUp size={120} />
            </div>
            <h3 className="text-xl font-black mb-8 tracking-tight relative z-10">Shift Management</h3>
            <div className="space-y-4 relative z-10">
              <button 
                onClick={() => navigate('/crm', { state: { openRegister: true } })}
                className="w-full py-5 bg-white/10 hover:bg-white/20 transition-all rounded-3xl flex items-center px-6 space-x-4 text-xs font-black uppercase tracking-widest border border-white/5"
              >
                <div className="bg-white/10 p-2 rounded-xl"><UserPlus size={20} /></div>
                <span>New Registration</span>
              </button>
              <button 
                onClick={() => setShowBulkModal(true)}
                className="w-full py-5 bg-white/10 hover:bg-white/20 transition-all rounded-3xl flex items-center px-6 space-x-4 text-xs font-black uppercase tracking-widest border border-white/5"
              >
                <div className="bg-white/10 p-2 rounded-xl"><CheckCircle2 size={20} /></div>
                <span>Bulk Resolve Queue</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
            <h3 className="font-black text-slate-800 mb-8 flex items-center space-x-3 text-sm uppercase tracking-widest">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Network Status</span>
            </h3>
            <div className="space-y-6">
              <StatusRow label="Core Switch A" status="Stable" color="green" />
              <StatusRow label="Condo GPON-01" status="Stable" color="green" />
              <StatusRow label="Condo GPON-02" status="Load Warning" color="amber" />
              <StatusRow label="Cloud Gateway" status="Stable" color="green" />
            </div>
          </div>
        </div>
      </div>

      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-md rounded-[50px] shadow-2xl p-12 text-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-amber-50 rounded-[40px] flex items-center justify-center text-amber-600 mx-auto mb-8">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Bulk Resolve?</h2>
            <p className="text-slate-500 font-medium leading-relaxed px-4">
              You are about to mark all <b className="text-slate-800">{activeTicketsCount}</b> active tickets as <b className="text-green-600 uppercase tracking-widest">Resolved</b>.
            </p>
            <div className="grid grid-cols-2 gap-5 mt-12">
              <button onClick={() => setShowBulkModal(false)} className="px-8 py-5 border-2 border-slate-100 text-slate-600 rounded-[30px] font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
              <button 
                onClick={handleBulkResolve} 
                className="px-8 py-5 bg-blue-600 text-white rounded-[30px] font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatusRow: React.FC<{ label: string, status: string, color: 'green' | 'amber' | 'red' }> = ({ label, status, color }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-slate-500 font-bold">{label}</span>
    <span className={`text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-widest ${
      color === 'green' ? 'bg-green-50 text-green-600' : 
      color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
    }`}>
      {status}
    </span>
  </div>
);

export default DashboardView;
