
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
  X,
  AlertTriangle
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

    // 1. Update all tickets
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

    // 2. Add audit comments for each resolved ticket
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
    { label: 'Emergency Alerts', value: emergencyTickets.length, icon: <Settings2 className="text-red-500" />, bg: 'bg-red-50' },
    { label: 'Site Visits Pending', value: pendingVisits.length, icon: <Clock className="text-amber-500" />, bg: 'bg-amber-50' },
    { label: 'Active Subscribers', value: subscribers.length, icon: <Smartphone className="text-green-500" />, bg: 'bg-green-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Operational Overview</h1>
          <p className="text-slate-500 font-medium">Real-time stats for the current shift.</p>
        </div>
        {currentUser && (
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <User size={16} />
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-1">My Workload</p>
              <p className="text-sm font-black text-slate-800 leading-none">{myTickets.length} Active Tickets</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4 transition-all hover:shadow-md">
            <div className={`p-4 rounded-2xl ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-500">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* My Queue Section */}
          {myTickets.length > 0 && (
            <div className="bg-blue-600 rounded-3xl shadow-xl overflow-hidden border border-blue-500">
              <div className="px-6 py-5 flex justify-between items-center border-b border-white/10">
                <h3 className="font-bold text-white flex items-center space-x-2">
                  <User size={18} />
                  <span>My Personal Queue</span>
                </h3>
                <span className="bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase">Prioritized</span>
              </div>
              <div className="bg-white m-2 rounded-2xl overflow-hidden divide-y divide-slate-50">
                {myTickets.slice(0, 3).map(t => (
                  <div key={t.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/tickets')}>
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{t.subject}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{t.id} • {t.status}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      t.priority === TicketPriority.EMERGENCY ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {t.priority}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Critical Global Tickets</h3>
              <button 
                onClick={() => navigate('/tickets')}
                className="text-xs text-blue-600 font-bold uppercase tracking-wider hover:underline"
              >
                View Queue
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {tickets.filter(t => t.priority === TicketPriority.EMERGENCY || t.priority === TicketPriority.HIGH).slice(0, 5).map(t => (
                <div key={t.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/tickets')}>
                  <div className="flex items-center space-x-4">
                    <div className={`w-1.5 h-10 rounded-full ${t.priority === TicketPriority.EMERGENCY ? 'bg-red-500' : 'bg-orange-500'}`} />
                    <div>
                      <p className="font-bold text-slate-800">{t.subject}</p>
                      <p className="text-xs text-slate-500 flex items-center space-x-2 font-medium">
                        <span className="font-bold text-slate-400">#{t.id}</span>
                        <span>•</span>
                        <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        {t.assignedEngineerId && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 font-bold italic">Assigned</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                    t.status === TicketStatus.OPEN ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-3xl text-white shadow-xl">
            <h3 className="text-lg font-bold mb-6">Staff Quick Links</h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate('/crm', { state: { openRegister: true } })}
                className="w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl flex items-center px-5 space-x-4 text-sm font-bold border border-white/5"
              >
                <div className="bg-white/10 p-2 rounded-lg"><UserPlus size={18} /></div>
                <span>New Registration</span>
              </button>
              <button 
                onClick={() => setShowBulkModal(true)}
                className="w-full py-4 bg-white/10 hover:bg-white/20 transition-all rounded-2xl flex items-center px-5 space-x-4 text-sm font-bold border border-white/5"
              >
                <div className="bg-white/10 p-2 rounded-lg"><CheckCircle2 size={18} /></div>
                <span>Bulk Resolve Queue</span>
              </button>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Network Status</span>
            </h3>
            <div className="space-y-5">
              <StatusRow label="Core Switch A" status="Stable" color="green" />
              <StatusRow label="Condo GPON-01" status="Stable" color="green" />
              <StatusRow label="Condo GPON-02" status="Load Warning" color="amber" />
              <StatusRow label="Cloud Gateway" status="Stable" color="green" />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Resolve Confirmation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-amber-50 rounded-[30px] flex items-center justify-center text-amber-600 mx-auto mb-8">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Bulk Resolve?</h2>
            <p className="text-slate-500 font-medium leading-relaxed px-4">
              You are about to mark all <b className="text-slate-800">{activeTicketsCount}</b> active tickets as <b className="text-green-600 uppercase">Resolved</b>. This will be recorded under your audit trail.
            </p>
            <div className="grid grid-cols-2 gap-5 mt-10">
              <button onClick={() => setShowBulkModal(false)} className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
              <button 
                onClick={handleBulkResolve} 
                className="px-6 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
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
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider ${
      color === 'green' ? 'bg-green-50 text-green-600' : 
      color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
    }`}>
      {status}
    </span>
  </div>
);

export default DashboardView;
