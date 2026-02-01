
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
  // Fix: Import Ticket from lucide-react and alias it to TicketIcon to avoid conflict with the Ticket type
  Ticket as TicketIcon
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
  const [hardwareDetails, setHardwareDetails] = useState('');
  
  const selectedTicket = useMemo(() => tickets.find(t => t.id === selectedTicketId), [tickets, selectedTicketId]);
  const subscriber = useMemo(() => selectedTicket ? subscribers.find(s => s.id === selectedTicket.subscriberId) : null, [selectedTicket, subscribers]);
  const ticketComments = useMemo(() => comments.filter(c => c.ticketId === selectedTicketId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()), [comments, selectedTicketId]);

  // Handle collision detection simulation
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

    if (newStatus === TicketStatus.PENDING_SITE_VISIT) {
      setShowHardwareForm(true);
      return;
    }

    setTickets(prev => prev.map(t => t.id === selectedTicketId ? { ...t, status: newStatus, resolvedAt: newStatus === TicketStatus.RESOLVED ? new Date().toISOString() : t.resolvedAt } : t));
    
    // Add system log
    addComment(`Status changed to ${newStatus}`, AuthorType.SYSTEM);
  };

  const handleHardwareSubmit = () => {
    setTickets(prev => prev.map(t => t.id === selectedTicketId ? { 
      ...t, 
      status: TicketStatus.PENDING_SITE_VISIT, 
      hardwareReplacement: hardwareDetails 
    } : t));
    addComment(`Triggered Field Service: Hardware to replace - ${hardwareDetails}`, AuthorType.SYSTEM);
    setShowHardwareForm(false);
    setHardwareDetails('');
  };

  const addComment = (msg: string, type: AuthorType = AuthorType.ENGINEER) => {
    if (!selectedTicketId || !msg.trim()) return;
    const newComment: Comment = {
      id: `comm-${Date.now()}`,
      ticketId: selectedTicketId,
      authorType: type,
      authorName: type === AuthorType.SYSTEM ? 'System Bot' : currentUser.name,
      message: msg,
      timestamp: new Date().toISOString()
    };
    setComments(prev => [...prev, newComment]);
    if (type === AuthorType.ENGINEER) setCommentText('');
  };

  const deleteTicket = (id: string) => {
    if (!isManager) return;
    if (confirm("Delete this ticket permanently?")) {
      setTickets(prev => prev.filter(t => t.id !== id));
      setSelectedTicketId(null);
    }
  };

  // WhatsApp Simulation Logic
  const simulateWhatsApp = (phone: string, message: string) => {
    const sub = subscribers.find(s => s.phone === phone);
    const newTicket: Ticket = {
      id: `TKT-WA-${Date.now().toString().slice(-4)}`,
      subscriberId: sub ? sub.id : 'guest',
      subject: `WhatsApp Inquiry: ${message.slice(0, 30)}...`,
      description: message,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      channel: 'WhatsApp',
      createdAt: new Date().toISOString()
    };
    
    setTickets(prev => [newTicket, ...prev]);
    alert(`Incoming WhatsApp hook triggered! Ticket ${newTicket.id} created for ${sub ? sub.name : 'Guest Account'}`);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Support Queue</h1>
          <p className="text-slate-500">Manage incoming and active troubleshoot requests.</p>
        </div>
        <div className="flex space-x-3">
           <button 
            onClick={() => simulateWhatsApp('+60123456789', 'My internet is down, please help ASAP')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-xl hover:bg-green-100 transition-all text-xs font-bold"
          >
            <Smartphone size={16} />
            <span>Simulate WhatsApp Hook</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex space-x-8 overflow-hidden">
        {/* Ticket List */}
        <div className="w-1/3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Tickets ({tickets.length})</h3>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">ALL DEPARTMENTS</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {tickets.map(ticket => {
              const sub = subscribers.find(s => s.id === ticket.subscriberId);
              const isSelected = selectedTicketId === ticket.id;
              const isBeingViewed = activeViewing[ticket.id] && activeViewing[ticket.id] !== currentUser.name;

              return (
                <div 
                  key={ticket.id} 
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-5 cursor-pointer transition-all border-l-4 ${
                    isSelected ? 'bg-blue-50 border-blue-600' : 'hover:bg-slate-50 border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider flex items-center space-x-1">
                      <Hash size={10} />
                      <span>{ticket.id}</span>
                      <span className="mx-1">•</span>
                      <span>{ticket.channel}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      ticket.priority === TicketPriority.EMERGENCY ? 'bg-red-100 text-red-600' :
                      ticket.priority === TicketPriority.HIGH ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h4 className={`font-bold text-sm mb-1 truncate ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                    {ticket.subject}
                  </h4>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {sub?.name.charAt(0) || 'G'}
                      </div>
                      <span className="text-xs text-slate-600 font-medium">{sub?.name || 'Guest'}</span>
                    </div>
                    {isBeingViewed && (
                      <div className="flex items-center space-x-1 animate-pulse">
                        <Eye size={12} className="text-amber-500" />
                        <span className="text-[10px] text-amber-600 font-bold">{activeViewing[ticket.id]} is viewing</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-lg overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-2xl ${
                    selectedTicket.priority === TicketPriority.EMERGENCY ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedTicket.subject}</h2>
                    <div className="flex items-center space-x-3 text-sm text-slate-500 mt-1 font-medium">
                      <span className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{subscriber?.name || 'Guest'}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative group">
                    <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs text-slate-700 flex items-center space-x-2 hover:bg-slate-50 transition-all shadow-sm">
                      <span>Status: {selectedTicket.status}</span>
                      <ChevronRight size={14} className="rotate-90" />
                    </button>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-2 hidden group-hover:block z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                      {Object.values(TicketStatus).map(status => (
                        <button 
                          key={status}
                          onClick={() => updateStatus(status)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
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
                      onClick={() => deleteTicket(selectedTicket.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <XCircle size={20} />
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 flex overflow-hidden">
                {/* Conversation & Info */}
                <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                  <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {selectedTicket.description}
                    </p>
                    {selectedTicket.hardwareReplacement && (
                      <div className="mt-4 pt-4 border-t border-slate-200 flex items-center space-x-3 text-blue-700 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <Wrench size={16} />
                        <span className="text-sm font-bold">Planned Replacement: {selectedTicket.hardwareReplacement}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-6 flex-1">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                      <span>Communication History</span>
                      <div className="h-px flex-1 bg-slate-100" />
                    </h4>
                    
                    {ticketComments.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-slate-300">
                        <MessageSquare size={48} className="mb-4 opacity-20" />
                        <p className="font-medium text-sm">No internal notes yet.</p>
                      </div>
                    ) : (
                      ticketComments.map(comment => (
                        <div key={comment.id} className={`flex ${comment.authorType === AuthorType.ENGINEER ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-4 rounded-2xl ${
                            comment.authorType === AuthorType.SYSTEM ? 'bg-amber-50 text-amber-800 border border-amber-100 italic' :
                            comment.authorType === AuthorType.ENGINEER ? 'bg-blue-600 text-white rounded-tr-none' :
                            'bg-slate-100 text-slate-800 rounded-tl-none'
                          }`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                                {comment.authorName}
                              </span>
                              <span className="text-[10px] opacity-60 ml-4">
                                {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{comment.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Sidebar Info */}
                <div className="w-80 border-l border-slate-100 bg-slate-50/30 p-8 space-y-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Subscriber Info</h4>
                    {subscriber ? (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Unit Address</p>
                          <p className="font-bold text-slate-800 mt-1">{subscriber.condoName}</p>
                          <p className="text-sm text-slate-600">{subscriber.unitNumber}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Router Serial</p>
                          <code className="block mt-1 text-xs bg-slate-50 p-2 rounded border border-slate-100 font-mono text-blue-700">
                            {subscriber.routerSerialNumber}
                          </code>
                        </div>
                        <div className={`p-4 rounded-2xl border shadow-sm ${
                          subscriber.status === 'Active' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                        }`}>
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Account Status</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <div className={`w-2 h-2 rounded-full ${subscriber.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`} />
                            <p className={`font-bold text-sm ${subscriber.status === 'Active' ? 'text-green-700' : 'text-red-700'}`}>
                              {subscriber.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex items-start space-x-3">
                        <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                        <div>
                          <p className="text-xs font-bold text-amber-800">Unregistered Contact</p>
                          <p className="text-[10px] text-amber-700 mt-1">Manual enrichment required to link this ticket to a profile.</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Technician</h4>
                    <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-600">
                        {currentUser.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
                        <p className="text-xs text-slate-400">On Duty (Primary)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Input */}
              <div className="p-6 border-t border-slate-100 bg-white">
                <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                  <input 
                    type="text" 
                    placeholder="Type an internal note or update message..."
                    className="flex-1 bg-transparent px-4 py-2 outline-none text-sm font-medium"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addComment(commentText)}
                  />
                  <button 
                    onClick={() => addComment(commentText)}
                    className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
              <div className="p-12 bg-slate-50 rounded-full mb-6">
                <TicketIcon size={64} className="opacity-20" />
              </div>
              <p className="text-xl font-bold text-slate-400">Select a ticket to begin</p>
              <p className="text-sm mt-2 font-medium">Internal coordination and subscriber support hub.</p>
            </div>
          )}
        </div>
      </div>

      {/* Field Service Form Modal */}
      {showHardwareForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <div className="px-8 py-6 border-b border-slate-100 bg-blue-600 text-white flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl">
                <Wrench size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Field Service Dispatch</h2>
                <p className="text-xs text-blue-100 mt-0.5">Transitioning to On-Site Hardware Replacement</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start space-x-3">
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <p className="text-xs font-medium text-amber-800 leading-relaxed">
                  Moving to Site Visit requires logging the hardware intended for replacement. This generates a job sheet for the field technician.
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-600">Hardware to be replaced</label>
                <textarea 
                  required
                  placeholder="Example: Huawei HG8145V5 Router (S/N: 12345), 3m SC/APC Patch Cord..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
                  value={hardwareDetails}
                  onChange={(e) => setHardwareDetails(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  onClick={() => setShowHardwareForm(false)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleHardwareSubmit}
                  disabled={!hardwareDetails.trim()}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Confirm & Dispatch
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
