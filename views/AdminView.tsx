
import React, { useState } from 'react';
import { Engineer, Ticket, Subscriber, TicketStatus } from '../types';
import { ShieldAlert, Users, Calendar, Trash2, UserPlus, Key, X, Plus, RotateCcw, Trash, CheckCircle2 } from 'lucide-react';

interface AdminViewProps {
  engineers: Engineer[];
  setEngineers: React.Dispatch<React.SetStateAction<Engineer[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  currentUser: Engineer;
}

const AdminView: React.FC<AdminViewProps> = ({ 
  engineers, 
  tickets, 
  subscribers, 
  setEngineers, 
  setTickets, 
  setSubscribers,
  currentUser 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: 'Engineer' as 'Engineer' | 'Manager'
  });

  const showToast = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newEngineer: Engineer = {
      id: `eng-${Date.now()}`,
      name: formData.name,
      role: formData.role,
      isOnShift: false,
    };

    setEngineers(prev => [...prev, newEngineer]);
    setIsFormOpen(false);
    setFormData({ name: '', role: 'Engineer' });
    showToast(`Staff member ${formData.name} authorized.`);
  };

  const handleDeleteMember = (id: string) => {
    // Safety check: Cannot delete yourself
    if (id === currentUser.id) {
      window.alert("System Safety: You cannot delete your own active administrative account.");
      return;
    }

    const member = engineers.find(e => e.id === id);
    if (!member) return;

    if (window.confirm(`Permanently remove ${member.name} from the system? This will revoke all access immediately.`)) {
      setEngineers(prev => prev.filter(e => e.id !== id));
      showToast("Staff member removed.");
    }
  };

  const handleFlushResolvedTickets = () => {
    const resolvedTickets = tickets.filter(t => t.status === TicketStatus.RESOLVED);
    if (resolvedTickets.length === 0) {
      window.alert("No resolved tickets found in the current database. Please resolve some tickets first before flushing.");
      return;
    }
    
    if (window.confirm(`DANGER: Are you sure you want to permanently delete ${resolvedTickets.length} resolved tickets? This action cannot be undone.`)) {
      setTickets(prev => prev.filter(t => t.status !== TicketStatus.RESOLVED));
      showToast(`Database purged: ${resolvedTickets.length} tickets removed.`);
    }
  };

  const handleResetSystem = () => {
    if (window.confirm("CRITICAL WARNING: This will wipe all current subscribers, tickets, and staff accounts, restoring the system to factory defaults. Continue?")) {
      localStorage.removeItem('isp_subscribers');
      localStorage.removeItem('isp_tickets');
      localStorage.removeItem('isp_comments');
      localStorage.removeItem('isp_engineers');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500 pb-20">
      {/* Success Toast */}
      {successMsg && (
        <div className="fixed top-24 right-8 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 animate-in slide-in-from-right-8 z-50">
          <CheckCircle2 className="text-green-400" size={20} />
          <span className="font-bold text-sm">{successMsg}</span>
        </div>
      )}

      <div className="flex items-center space-x-4 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl">
        <div className="bg-blue-500 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Control Center</h1>
          <p className="text-slate-400 font-medium mt-1">Global system overrides and staff management.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Staff Management */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2">
              <Users size={18} className="text-blue-500" />
              <span>Engineering Staff</span>
            </h3>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all uppercase flex items-center space-x-1"
            >
              <UserPlus size={14} />
              <span>Add Member</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {engineers.map(eng => (
              <div key={eng.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg uppercase">
                    {eng.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{eng.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                      <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wide text-[9px] ${
                        eng.role === 'Manager' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {eng.role}
                      </span>
                      <span>•</span>
                      <span>Last Activity: {eng.lastLogin ? new Date(eng.lastLogin).toLocaleTimeString() : 'Never'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                   <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <p className={`text-xs font-bold ${eng.isOnShift ? 'text-green-600' : 'text-slate-400'}`}>
                      {eng.isOnShift ? 'ACTIVE ON SHIFT' : 'OFFLINE'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors" title="Change Permissions">
                      <Key size={18} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMember(eng.id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" 
                      title="Delete Permanently"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Stats & Danger Zone */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Database Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium text-sm">Total Subscribers</span>
                <span className="font-bold text-slate-800">{subscribers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium text-sm">Active Tickets</span>
                <span className="font-bold text-slate-800">{tickets.filter(t => t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED).length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium text-sm">Resolved (Ready to Flush)</span>
                <span className={`font-bold ${tickets.some(t => t.status === TicketStatus.RESOLVED) ? 'text-blue-600' : 'text-slate-800'}`}>
                  {tickets.filter(t => t.status === TicketStatus.RESOLVED).length}
                </span>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button className="w-full py-3 border-2 border-slate-100 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center space-x-2">
                  <Calendar size={16} />
                  <span>Export System Log</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-red-800 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center space-x-2 text-red-900">
              <Trash size={18} />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs font-medium leading-relaxed opacity-80 mb-6">
              Critical operations that affect core data integrity. Proceed with caution.
            </p>
            <div className="space-y-3">
              <button 
                onClick={handleFlushResolvedTickets}
                className="w-full py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 active:scale-95"
              >
                Flush All Resolved Tickets
              </button>
              <button 
                onClick={handleResetSystem}
                className="w-full py-3 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <RotateCcw size={16} />
                <span>Reset System Config</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center space-x-2">
                <UserPlus className="text-blue-500" size={20} />
                <span>Add Staff Member</span>
              </h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                <input 
                  required 
                  type="text" 
                  autoFocus
                  placeholder="e.g. David Tennant"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Access Role</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none font-medium"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'Engineer' | 'Manager'})}
                >
                  <option value="Engineer">Field Engineer</option>
                  <option value="Manager">Operations Manager</option>
                </select>
              </div>

              <div className="pt-4 flex flex-col space-y-3">
                <button 
                  type="submit"
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2"
                >
                  <span>Authorize Access</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-full py-4 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
