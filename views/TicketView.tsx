
import React, { useState, useMemo, useEffect } from 'react';
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
  MoreVertical,
  ChevronRight,
  Send,
  Wrench,
  Smartphone,
  Eye,
  CheckCircle,
  XCircle,
  Hash,
  Trash2,
  Ticket as TicketIcon,
  UserCheck
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
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showHardwareForm, setShowHardwareForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hardwareDetails, setHardwareDetails] = useState('');
  
  const selectedTicket = useMemo(() => tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]);
  const subscriber = useMemo(() => selectedTicket ? subscribers.find(s => s.id === selectedTicket.subscriberId) : null, [selectedTicket, subscribers]);
  const ticketComments = useMemo(() => comments.filter(c => c.ticketId === selectedTicketId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [comments, selectedTicketId]);

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

  const updateStatus = (newStatus: TicketStatus) => {
    if (!selectedTicketId) return;
    
    // Auto-assign to current engineer if not already assigned
    setTickets(prev => prev.map(t => t.id === selectedTicketId ? { 
      ...t, 
      status: newStatus, 
      assignedEngineerId: t.assignedEngineerId || currentUser.id, // Record the engineer handling this
      resolvedAt: newStatus === TicketStatus.RESOLVED ? new Date().toISOString() : t.resolvedAt 
    } : t));

    // Log the specific engineer in the permanent record
    const auditMsg = `Status changed to ${newStatus} by ${currentUser.name}`;
    addComment(auditMsg, AuthorType.SYSTEM);

    if (newStatus === TicketStatus.PENDING_SITE_VISIT) {
      setShowHardwareForm(true);
    }
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

  const confirmDeleteTicket = () => {
    if (!isManager || !selectedTicketId) return;
    setTickets(prev => prev.filter(t => t.id !== selectedTicketId));
    setSelectedTicketId(null);
    setShowDeleteModal(false);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Shift Operations Queue</h1>
          <p className="text-slate-500 font-medium">Handle incoming tickets and maintain service logs.</p>
        </div>
      </div>

      <div className="flex-1 flex space-x-8 overflow-hidden">
        <div className="w-1/3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Active Queue ({tickets.length})</h3>
            <span className="text-[10px] font-black text-slate-400 bg-white px-3 py-1 rounded-lg border border-slate-100 uppercase tracking-widest">Global</span>
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
                  className={`p-6 cursor-pointer transition-all border-l-4 ${
                    isSelected ? 'bg-blue-50/80 border-blue-600' : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-slate-400 tracking-widest flex items-center space-x-1 uppercase">
                      <Hash size={10} />
                      <span>{ticket.id}</span>
                      <span className="mx-1 opacity-30">•</span>
                      <span>{ticket.channel}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                       {isMyTicket && (
                        <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">Owner</span>
                      )}
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                        ticket.priority === TicketPriority.EMERGENCY ? 'bg-red-100 text-red-600' :
                        ticket.priority === TicketPriority.HIGH ? 'bg-orange-100 text-orange-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {ticket.priority}
                      </span>
                    </div>
                  </div>
                  <h4 className={`font-bold text-sm mb-2 truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {ticket.subject}
                  </h4>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-2xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                        {sub?.name.charAt(0) || 'G'}
                      </div>
                      <span className="text-xs text-slate-700 font-bold">{sub?.name || 'Guest'}</span>
                    </div>
                    {isBeingViewed && (
                      <div className="flex items-center space-x-1 animate-pulse">
                        <span className="text-[9px] text-amber-600 font-black uppercase">{activeViewing[ticket.id]} Viewing</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-5">
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    selectedTicket.priority === TicketPriority.EMERGENCY ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">{selectedTicket.subject}</h2>
                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 font-bold uppercase tracking-wider">
                      <span className="flex items-center space-x-1.5">
                        <User size={14} className="text-slate-400" />
                        <span>{subscriber?.name || 'Guest User'}</span>
                      </span>
                      <span className="opacity-30">|</span>
                      <span className="flex items-center space-x-1.5 text-blue-600">
                        <UserCheck size={14} />
                        <span>{selectedTicket.assignedEngineerId === currentUser.id ? 'You are handling this' : 
                          selectedTicket.assignedEngineerId ? 'Assigned to teammate' : 'Unclaimed'}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {!selectedTicket.assignedEngineerId && (
                    <button 
                      onClick={claimTicket}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                      Claim Ticket
                    </button>
                  )}
                  <div className="relative group">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-black text-[10px] text-slate-700 flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest">
                      <span>{selectedTicket.status}</span>
                      <ChevronRight size={14} className="rotate-90 text-slate-400" />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 hidden group-hover:block z-10 animate-in slide-in-from-top-2">
                      <p className="px-4 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Update Lifecycle</p>
                      {Object.values(TicketStatus).map(status => (
                        <button 
                          key={status}
                          onClick={() => updateStatus(status)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            selectedTicket.status === status ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                  {isManager && (
                    <button 
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                  <div className="bg-slate-50/80 rounded-3xl p-8 mb-8 border border-slate-100 relative">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-white border border-slate-100 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">Complaint Entry</div>
                    <p className="text-slate-800 leading-relaxed font-semibold text-lg italic">"{selectedTicket.description}"</p>
                    {selectedTicket.hardwareReplacement && (
                      <div className="mt-6 pt-6 border-t border-slate-200 flex items-center space-x-4 text-blue-700 bg-blue-50/50 p-4 rounded-2xl">
                        <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg"><Wrench size={18} /></div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Provisioning Order</p>
                          <p className="text-sm font-black">{selectedTicket.hardwareReplacement}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-6 flex-1">
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center space-x-3">
                      <span>Audit & Communication History</span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </h4>
                    {ticketComments.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-200">
                        <MessageSquare size={64} className="mb-4 opacity-10" />
                        <p className="font-black text-xs uppercase tracking-widest">Waiting for engineer input...</p>
                      </div>
                    ) : (
                      ticketComments.map(comment => (
                        <div key={comment.id} className={`flex ${comment.authorType === AuthorType.ENGINEER ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${
                            comment.authorType === AuthorType.SYSTEM ? 'bg-amber-50/80 text-amber-800 border border-amber-100/50' :
                            comment.authorType === AuthorType.ENGINEER ? 'bg-slate-900 text-white rounded-tr-none' :
                            'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                          }`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest ${comment.authorType === AuthorType.ENGINEER ? 'text-blue-400' : 'opacity-60'}`}>
                                {comment.authorName}
                              </span>
                              <span className="text-[9px] opacity-40 ml-6 font-bold">{new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-sm font-bold leading-relaxed">{comment.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="w-80 border-l border-slate-100 bg-slate-50/30 p-8 space-y-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Profile</h4>
                    {subscriber ? (
                      <div className="space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Service Location</p>
                          <p className="font-black text-slate-800 text-sm">{subscriber.condoName}</p>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">Unit {subscriber.unitNumber}</p>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Infrastructure</p>
                          <code className="block text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-blue-700 font-bold break-all">
                            {subscriber.routerSerialNumber}
                          </code>
                        </div>
                        <div className={`p-5 rounded-2xl border shadow-sm ${subscriber.status === 'Active' ? 'bg-green-50 border-green-100/50' : 'bg-red-50 border-red-100/50'}`}>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Billing Status</p>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${subscriber.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <p className={`font-black text-xs ${subscriber.status === 'Active' ? 'text-green-700' : 'text-red-700'}`}>{subscriber.status}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 flex items-start space-x-3">
                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Unregistered Contact Record</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-white">
                <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                  <input 
                    type="text" 
                    placeholder="Document action or internal note..."
                    className="flex-1 bg-transparent px-4 py-3 outline-none text-sm font-bold placeholder:text-slate-300"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(commentText)}
                  />
                  <button 
                    onClick={() => addComment(commentText)} 
                    disabled={!commentText.trim()}
                    className="p-3 bg-slate-900 text-white rounded-xl shadow-xl hover:bg-slate-800 transition-all disabled:opacity-30 disabled:shadow-none"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="p-10 bg-slate-50 rounded-[40px] border border-slate-100 mb-8">
                <TicketIcon size={80} className="opacity-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Awaiting Selection</h2>
              <p className="text-slate-400 font-bold mt-2">Pick a ticket from the queue to start troubleshooting.</p>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center text-red-600 mx-auto mb-8">
              <Trash2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Purge Ticket?</h2>
            <p className="text-slate-500 font-medium leading-relaxed px-4">You are about to permanently delete <b className="text-slate-800">{selectedTicket?.id}</b> and its associated audit trail.</p>
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
