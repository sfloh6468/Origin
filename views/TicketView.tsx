
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  TicketStatus, 
  TicketPriority, 
  Ticket, 
  Subscriber, 
  Engineer, 
  Comment, 
  AuthorType 
} from '../types';
import { 
  MessageSquare, 
  Clock, 
  User, 
  AlertTriangle, 
  ChevronRight,
  Send,
  Wrench,
  Hash,
  Trash2,
  Ticket as TicketIcon,
  UserCheck,
  PlusCircle,
  Search,
  X,
  ClipboardList,
  AlertCircle
} from 'lucide-react';

interface TicketViewProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  subscribers: Subscriber[];
  currentUser: Engineer;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  isManager: boolean;
  activeViewing: { [ticketId: string]: string };
  setActiveViewing: React.Dispatch<React.SetStateAction<{ [ticketId: string]: string }>>;
}

const TicketView: React.FC<TicketViewProps> = ({ 
  tickets, 
  setTickets, 
  subscribers, 
  currentUser, 
  comments, 
  setComments,
  isManager,
  activeViewing,
  setActiveViewing
}) => {
  const location = useLocation();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showHardwareForm, setShowHardwareForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [hardwareDetails, setHardwareDetails] = useState('');

  // Manual Report Form State
  const [reportSubId, setReportSubId] = useState('');
  const [reportSubject, setReportSubject] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [reportPriority, setReportPriority] = useState(TicketPriority.MEDIUM);
  const [subSearch, setSubSearch] = useState('');

  // Lifecycle Follow-up Note state
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  
  const selectedTicket = useMemo(() => tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]);
  const subscriber = useMemo(() => selectedTicket ? subscribers.find(s => s.id === selectedTicket.subscriberId) : null, [selectedTicket, subscribers]);
  const ticketComments = useMemo(() => comments.filter(c => c.ticketId === selectedTicketId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [comments, selectedTicketId]);

  useEffect(() => {
    if (location.state?.openNewReport) {
      setShowNewReportModal(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    if (selectedTicketId) {
      setActiveViewing(prev => ({ ...prev, [selectedTicketId]: currentUser.name }));
      return () => {
        setActiveViewing(prev => {
          const newState = { ...prev };
          delete newState[selectedTicketId];
          return newState;
        });
      };
    }
  }, [selectedTicketId, currentUser.name, setActiveViewing]);

  const initiateStatusChange = (status: TicketStatus) => {
    setPendingStatus(status);
    setFollowUpNote(selectedTicket?.followUpNote || '');
    setShowLifecycleModal(true);
  };

  const applyStatusChange = () => {
    if (!selectedTicketId || !pendingStatus) return;
    
    setTickets(prev => prev.map(t => t.id === selectedTicketId ? { 
      ...t, 
      status: pendingStatus, 
      assignedEngineerId: t.assignedEngineerId || currentUser.id,
      followUpNote: followUpNote,
      resolvedAt: pendingStatus === TicketStatus.RESOLVED ? new Date().toISOString() : t.resolvedAt 
    } : t));

    const auditMsg = `Lifecycle Update: ${pendingStatus}. Condition for next member: ${followUpNote || 'None'}`;
    addComment(auditMsg, AuthorType.SYSTEM);

    if (pendingStatus === TicketStatus.PENDING_SITE_VISIT) {
      setShowHardwareForm(true);
    }
    
    setShowLifecycleModal(false);
    setPendingStatus(null);
  };

  const claimTicket = () => {
    if (!selectedTicketId) return;
    setTickets(prev => prev.map(t => t.id === selectedTicketId ? { ...t, assignedEngineerId: currentUser.id } : t));
    addComment(`${currentUser.name} has claimed this ticket.`, AuthorType.SYSTEM);
  };

  const handleHardwareSubmit = () => {
    setTickets(prev => prev.map(t => t.id === selectedTicketId ? { 
      ...t, 
      status: TicketStatus.PENDING_SITE_VISIT, 
      hardwareReplacement: hardwareDetails,
      assignedEngineerId: t.assignedEngineerId || currentUser.id
    } : t));
    addComment(`Hardware replacement dispatched by ${currentUser.name}: ${hardwareDetails}`, AuthorType.SYSTEM);
    setShowHardwareForm(false);
    setHardwareDetails('');
  };

  const addComment = (msg: string, type: AuthorType = AuthorType.ENGINEER) => {
    if (!selectedTicketId || !msg.trim()) return;
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      ticketId: selectedTicketId,
      authorType: type,
      authorName: type === AuthorType.SYSTEM ? 'System Audit' : currentUser.name,
      message: msg,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
    if (type === AuthorType.ENGINEER) setCommentText('');
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportSubId || !reportSubject) return;

    const ticketId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: Ticket = {
      id: ticketId,
      subscriberId: reportSubId,
      subject: reportSubject,
      description: reportDesc,
      priority: reportPriority,
      status: TicketStatus.OPEN,
      channel: 'Manual',
      createdAt: new Date().toISOString()
    };

    setTickets(prev => [newTicket, ...prev]);
    addCommentToTicket(ticketId, `Manual report filed by ${currentUser.name}.`, AuthorType.SYSTEM);
    
    setShowNewReportModal(false);
    setReportSubId('');
    setReportSubject('');
    setReportDesc('');
    setSelectedTicketId(ticketId);
  };

  const addCommentToTicket = (tId: string, msg: string, type: AuthorType) => {
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      ticketId: tId,
      authorType: type,
      authorName: type === AuthorType.SYSTEM ? 'System Audit' : currentUser.name,
      message: msg,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
  };

  const confirmDeleteTicket = () => {
    if (!isManager || !selectedTicketId) return;
    setTickets(prev => prev.filter(t => t.id !== selectedTicketId));
    setSelectedTicketId(null);
    setShowDeleteModal(false);
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.name.toLowerCase().includes(subSearch.toLowerCase()) || 
    s.phone.includes(subSearch) ||
    s.unitNumber.includes(subSearch)
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Shift Operations Queue</h1>
          <p className="text-slate-500 font-medium">Manually file complaints and maintain operational lifecycle.</p>
        </div>
        <button 
          onClick={() => setShowNewReportModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center space-x-2 text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 transition-all"
        >
          <PlusCircle size={18} />
          <span>New Incident Report</span>
        </button>
      </div>

      <div className="flex-1 flex space-x-8 overflow-hidden">
        {/* LEFT QUEUE PANEL */}
        <div className="w-1/3 bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 text-[10px] uppercase tracking-widest">Active Queue ({tickets.length})</h3>
            <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 uppercase tracking-widest">Manual Logs</span>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {tickets.map(ticket => {
              const sub = subscribers.find(s => s.id === ticket.subscriberId);
              const isSelected = selectedTicketId === ticket.id;
              const isBeingViewed = activeViewing[ticket.id] && activeViewing[ticket.id] !== currentUser.name;
              const isMyTicket = ticket.assignedEngineerId === currentUser.id;
              
              return (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-8 cursor-pointer transition-all border-l-4 ${
                    isSelected ? 'bg-blue-50/80 border-blue-600' : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-black text-slate-400 tracking-[0.2em] flex items-center space-x-1 uppercase">
                      <Hash size={10} />
                      <span>{ticket.id}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                       {ticket.followUpNote && (
                        <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded uppercase flex items-center space-x-1">
                          <ClipboardList size={10} />
                          <span>Follow-up</span>
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        ticket.priority === TicketPriority.EMERGENCY ? 'bg-red-100 text-red-600' :
                        ticket.priority === TicketPriority.HIGH ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <h4 className={`font-black text-sm mb-2 truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {ticket.subject}
                  </h4>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                        {sub?.name.charAt(0) || 'G'}
                      </div>
                      <span className="text-[11px] text-slate-700 font-bold">{sub?.name || 'Guest'}</span>
                    </div>
                    {isBeingViewed && (
                      <span className="text-[9px] text-amber-600 font-black uppercase animate-pulse">{activeViewing[ticket.id]} Viewing</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="flex-1 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <div className="flex items-center space-x-6">
                  <div className={`p-5 rounded-3xl shadow-sm ${
                    selectedTicket.priority === TicketPriority.EMERGENCY ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <AlertCircle size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedTicket.subject}</h2>
                    <div className="flex items-center space-x-4 text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest">
                      <span className="flex items-center space-x-2">
                        <User size={14} className="text-slate-400" />
                        <span>{subscriber?.name || 'Guest User'}</span>
                      </span>
                      <span className="flex items-center space-x-2 text-blue-600">
                        <UserCheck size={14} />
                        <span>{selectedTicket.assignedEngineerId === currentUser.id ? 'YOU ARE ON DUTY' : 
                          selectedTicket.assignedEngineerId ? 'TEAMMATE ASSIGNED' : 'UNCLAIMED'}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!selectedTicket.assignedEngineerId && (
                    <button 
                      onClick={claimTicket}
                      className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                    >
                      Claim Ticket
                    </button>
                  )}
                  <div className="relative group">
                    <button className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] text-slate-700 flex items-center space-x-3 hover:bg-slate-50 transition-all uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{selectedTicket.status}</span>
                      <ChevronRight size={14} className="rotate-90 text-slate-400" />
                    </button>
                    <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-slate-100 p-3 hidden group-hover:block z-10 animate-in slide-in-from-top-4">
                      <p className="px-5 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-2">Update Lifecycle</p>
                      {Object.values(TicketStatus).map(status => (
                        <button 
                          key={status}
                          onClick={() => initiateStatusChange(status)}
                          className={`w-full text-left px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${
                            selectedTicket.status === status ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  {isManager && (
                    <button onClick={() => setShowDeleteModal(true)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                      <Trash2 size={24} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col p-10 overflow-y-auto bg-white">
                  {selectedTicket.followUpNote && (
                    <div className="mb-10 p-6 bg-amber-50 border border-amber-100 rounded-[30px] flex items-start space-x-4">
                       <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg"><ClipboardList size={20} /></div>
                       <div>
                         <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-1">On-Duty Follow-up Conditions</p>
                         <p className="text-sm font-black text-amber-900 leading-relaxed italic">"{selectedTicket.followUpNote}"</p>
                       </div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-[40px] p-10 mb-10 border border-slate-100 relative group">
                    <div className="absolute -top-3 left-10 px-4 py-1.5 bg-white border border-slate-100 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Incident Root Details</div>
                    <p className="text-slate-800 leading-relaxed font-bold text-xl italic">"{selectedTicket.description}"</p>
                    {selectedTicket.hardwareReplacement && (
                      <div className="mt-8 pt-8 border-t border-slate-200 flex items-center space-x-6 text-blue-800 bg-white/50 p-6 rounded-[30px]">
                        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-xl shadow-blue-100"><Wrench size={24} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Provisioning Deployment</p>
                          <p className="text-base font-black tracking-tight">{selectedTicket.hardwareReplacement}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-8 flex-1">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] flex items-center space-x-4">
                      <span>SHIFT AUDIT TRAIL</span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </h4>
                    {ticketComments.length === 0 ? (
                      <div className="py-24 flex flex-col items-center justify-center text-slate-200">
                        <MessageSquare size={80} className="mb-6 opacity-5" />
                        <p className="font-black text-xs uppercase tracking-widest">No member logs yet</p>
                      </div>
                    ) : (
                      ticketComments.map(comment => (
                        <div key={comment.id} className={`flex ${comment.authorType === AuthorType.ENGINEER ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-6 rounded-[32px] shadow-sm ${
                            comment.authorType === AuthorType.SYSTEM ? 'bg-slate-50 text-slate-500 border border-slate-100' :
                            comment.authorType === AuthorType.ENGINEER ? 'bg-slate-900 text-white rounded-tr-none' :
                            'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                          }`}>
                            <div className="flex items-center justify-between mb-3">
                              <span className={`text-[10px] font-black uppercase tracking-widest ${comment.authorType === AuthorType.ENGINEER ? 'text-blue-400' : 'opacity-60'}`}>
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] opacity-40 ml-10 font-bold">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-sm font-black leading-relaxed">{comment.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="w-96 border-l border-slate-100 bg-slate-50/20 p-10 space-y-10">
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Connectivity Profile</h4>
                    {subscriber ? (
                      <div className="space-y-6">
                        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Service Location</p>
                          <p className="font-black text-slate-800 text-base">{subscriber.condoName}</p>
                          <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-wider">Unit {subscriber.unitNumber}</p>
                        </div>
                        <div className="bg-white p-6 rounded-[30px] border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Hardware Serial</p>
                          <code className="block text-[12px] bg-slate-50 p-4 rounded-2xl border border-slate-100 font-mono text-blue-700 font-black break-all">
                            {subscriber.routerSerialNumber}
                          </code>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-6 rounded-[30px] border border-amber-100 flex items-start space-x-4">
                        <AlertTriangle className="text-amber-500 shrink-0" size={24} />
                        <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest leading-relaxed">UNREGISTERED CONTACT PROFILE</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-slate-100 bg-white">
                <div className="flex items-center space-x-5 bg-slate-50 p-3 rounded-[32px] border-2 border-slate-100 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
                  <input 
                    type="text" 
                    placeholder="Document action or follow-up note..."
                    className="flex-1 bg-transparent px-6 py-4 outline-none text-sm font-black placeholder:text-slate-300"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(commentText)}
                  />
                  <button 
                    onClick={() => addComment(commentText)} 
                    disabled={!commentText.trim()}
                    className="p-4 bg-slate-900 text-white rounded-[24px] shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-20"
                  >
                    <Send size={24} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="p-16 bg-slate-50 rounded-[60px] border border-slate-100 mb-10 group hover:scale-110 transition-transform cursor-pointer">
                <TicketIcon size={120} className="opacity-10 group-hover:opacity-20 transition-opacity" />
              </div>
              <h2 className="text-3xl font-black text-slate-300 uppercase tracking-[0.2em]">Queue Idle</h2>
              <p className="text-slate-400 font-bold mt-4 uppercase tracking-widest text-[11px]">Select a shift report to begin</p>
            </div>
          )}
        </div>
      </div>

      {/* NEW MANUAL REPORT MODAL */}
      {showNewReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-12 py-10 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Incident Report</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Manual entry for daily complaints</p>
              </div>
              <button onClick={() => setShowNewReportModal(false)} className="bg-white/10 p-3 rounded-2xl hover:bg-white/20 transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateReport} className="p-12 space-y-10">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Subscriber</label>
                <div className="relative">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input 
                    type="text"
                    placeholder="Search by name, unit, or phone..."
                    className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[30px] font-bold text-sm outline-none focus:border-blue-500 transition-all"
                    value={subSearch}
                    onChange={(e) => setSubSearch(e.target.value)}
                  />
                </div>
                {subSearch && (
                  <div className="max-h-48 overflow-y-auto border-2 border-slate-50 rounded-[30px] divide-y divide-slate-50">
                    {filteredSubscribers.map(s => (
                      <button 
                        key={s.id}
                        type="button"
                        onClick={() => { setReportSubId(s.id); setSubSearch(''); }}
                        className={`w-full text-left p-5 text-sm font-black transition-all ${reportSubId === s.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}
                      >
                        {s.name} - {s.condoName} ({s.unitNumber})
                      </button>
                    ))}
                  </div>
                )}
                {reportSubId && (
                  <div className="flex items-center space-x-3 bg-blue-50 p-4 rounded-2xl text-blue-700">
                    <UserCheck size={20} />
                    <span className="font-black text-xs uppercase tracking-widest">
                      Report for: {subscribers.find(s => s.id === reportSubId)?.name}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Incident Subject</label>
                  <input 
                    required
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[30px] font-bold text-sm outline-none"
                    value={reportSubject}
                    onChange={(e) => setReportSubject(e.target.value)}
                    placeholder="Short summary (e.g. Total Outage)"
                  />
                </div>
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Priority</label>
                   <select 
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[30px] font-black text-xs uppercase outline-none cursor-pointer"
                    value={reportPriority}
                    onChange={(e) => setReportPriority(e.target.value as TicketPriority)}
                   >
                     {Object.values(TicketPriority).map(p => <option key={p} value={p}>{p}</option>)}
                   </select>
                </div>
                <div className="col-span-2 space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Description</label>
                  <textarea 
                    rows={4}
                    className="w-full px-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-[30px] font-bold text-sm outline-none resize-none"
                    value={reportDesc}
                    onChange={(e) => setReportDesc(e.target.value)}
                    placeholder="Detailed condition reported by subscriber..."
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={!reportSubId || !reportSubject}
                className="w-full py-6 bg-blue-600 text-white rounded-[30px] font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-blue-100 transition-all hover:bg-blue-700 disabled:opacity-20"
              >
                File Shift Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* LIFECYCLE & FOLLOW-UP MODAL */}
      {showLifecycleModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[50px] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Update Lifecycle</h2>
               <button onClick={() => setShowLifecycleModal(false)} className="text-slate-400"><X size={24} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-blue-600 p-6 rounded-[30px] text-white">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Target State</p>
                <p className="text-2xl font-black tracking-tight uppercase">{pendingStatus}</p>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Follow-up Condition (Optional)</label>
                <textarea 
                  className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[30px] font-bold text-sm outline-none focus:border-blue-600 transition-all resize-none"
                  rows={4}
                  placeholder="Instructions for the next member on shift..."
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                />
              </div>

              <button 
                onClick={applyStatusChange}
                className="w-full py-5 bg-slate-900 text-white rounded-[30px] font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200"
              >
                Apply Lifecycle Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center text-red-600 mx-auto mb-8">
              <Trash2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Purge Ticket?</h2>
            <p className="text-slate-500 font-medium leading-relaxed px-4">You are about to permanently delete <b className="text-slate-800">{selectedTicket?.id}</b>.</p>
            <div className="grid grid-cols-2 gap-5 mt-10">
              <button onClick={() => setShowDeleteModal(false)} className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-slate-50 transition-all">Cancel</button>
              <button onClick={confirmDeleteTicket} className="px-6 py-4 bg-red-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-200 hover:bg-red-700 transition-all">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {showHardwareForm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="px-10 py-8 border-b border-slate-100 bg-blue-600 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Field Logistics</h2>
                  <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-1">Specify Deployment Details</p>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl shadow-inner"><Wrench size={24} /></div>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hardware / Assets to Dispatch</label>
                <textarea 
                  autoFocus
                  required
                  placeholder="e.g. WiFi 6 Router Replacement, 2m Patch Cord..."
                  rows={4}
                  className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-[30px] text-sm font-bold focus:ring-4 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                  value={hardwareDetails}
                  onChange={(e) => setHardwareDetails(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button onClick={() => setShowHardwareForm(false)} className="px-8 py-4 border-2 border-slate-100 rounded-3xl font-black uppercase text-xs tracking-widest text-slate-500 hover:bg-slate-50">Cancel</button>
                <button 
                  onClick={handleHardwareSubmit} 
                  disabled={!hardwareDetails.trim()}
                  className="px-10 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-30"
                >
                  Deploy Assets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketView;
