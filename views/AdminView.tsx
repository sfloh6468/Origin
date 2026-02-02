
import React, { useState } from 'react';
import { Engineer, Ticket, Subscriber, TicketStatus } from '../types';
import { 
  ShieldAlert, 
  Users, 
  Trash2, 
  Plus, 
  X, 
  RefreshCw, 
  AlertTriangle,
  Lock,
  ShieldCheck,
  Key,
  ChevronRight
} from 'lucide-react';

interface AdminViewProps {
  engineers: Engineer[];
  setEngineers: React.Dispatch<React.SetStateAction<Engineer[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
}

const AdminView: React.FC<AdminViewProps> = ({ engineers, tickets, subscribers, setEngineers, setTickets, setSubscribers }) => {
  const [showFlushModal, setShowFlushModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Engineer | null>(null);
  const [memberToChangePassword, setMemberToChangePassword] = useState<Engineer | null>(null);
  
  // Verification State
  const [verificationAction, setVerificationAction] = useState<(() => void) | null>(null);
  const [verificationPassword, setVerificationPassword] = useState('');
  const [verificationError, setVerificationError] = useState(false);

  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Engineer' as 'Engineer' | 'Manager',
    password: ''
  });

  const [passwordChangeValue, setPasswordChangeValue] = useState('');

  const requestVerification = (action: () => void) => {
    setVerificationAction(() => action);
    setVerificationPassword('');
    setVerificationError(false);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationPassword === 'admin123') {
      if (verificationAction) verificationAction();
      setVerificationAction(null);
    } else {
      setVerificationError(true);
      setTimeout(() => setVerificationError(false), 2000);
    }
  };

  const handleAddMember = () => {
    const id = `eng-${Date.now()}`;
    const member: Engineer = {
      id,
      name: newMember.name,
      role: newMember.role,
      password: newMember.password || 'password123',
      isOnShift: false
    };
    setEngineers(prev => [...prev, member]);
    setNewMember({ name: '', role: 'Engineer', password: '' });
    setIsAddModalOpen(false);
  };

  const handleChangePassword = () => {
    if (!memberToChangePassword || !passwordChangeValue) return;
    setEngineers(prev => prev.map(e => 
      e.id === memberToChangePassword.id ? { ...e, password: passwordChangeValue } : e
    ));
    setMemberToChangePassword(null);
    setPasswordChangeValue('');
  };

  const deleteMember = () => {
    if (!memberToDelete) return;
    setEngineers(prev => prev.filter(e => e.id !== memberToDelete.id));
    setMemberToDelete(null);
  };

  const flushTickets = () => {
    setTickets(prev => prev.filter(t => t.status !== TicketStatus.RESOLVED && t.status !== TicketStatus.CLOSED));
    setShowFlushModal(false);
  };

  const resetSystem = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex items-center space-x-4 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl">
        <div className="bg-blue-500 p-4 rounded-2xl shadow-lg shadow-blue-500/20">
          <ShieldAlert size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Admin Control Center</h1>
          <p className="text-slate-400 font-medium mt-1">Global system overrides and staff shift logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2">
              <Users size={18} className="text-blue-500" />
              <span>Engineering Staff</span>
            </h3>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all uppercase flex items-center space-x-1"
            >
              <Plus size={14} />
              <span>Add Member</span>
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {engineers.map(eng => (
              <div key={eng.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg">
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
                <div className="flex items-center space-x-2">
                  <div className="text-right mr-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <p className={`text-xs font-bold ${eng.isOnShift ? 'text-green-600' : 'text-slate-400'}`}>
                      {eng.isOnShift ? 'ACTIVE ON SHIFT' : 'OFFLINE'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setMemberToChangePassword(eng)}
                      title="Update Password"
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Key size={18} />
                    </button>
                    <button 
                      onClick={() => setMemberToDelete(eng)}
                      title="Remove Member"
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Database Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Subscribers</span>
                <span className="font-bold text-slate-800">{subscribers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Total Tickets</span>
                <span className="font-bold text-slate-800">{tickets.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-red-800">
            <h3 className="font-bold mb-4 flex items-center space-x-2 text-red-700">
              <AlertTriangle size={18} />
              <span>Danger Zone</span>
            </h3>
            <div className="space-y-3 mt-4">
              <button 
                onClick={() => setShowFlushModal(true)}
                className="w-full py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
              >
                Flush All Resolved Tickets
              </button>
              <button 
                onClick={() => setShowResetModal(true)}
                className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
              >
                Reset System Config
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Modal - Added Security Layer */}
      {verificationAction && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className={`bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden p-8 text-center transition-all ${verificationError ? 'animate-shake' : 'animate-in zoom-in-95'}`}>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Manager Access Required</h2>
            <p className="text-slate-500 text-sm mb-6">Please enter the administrative authorization code to proceed with this sensitive action.</p>
            
            <form onSubmit={handleVerify} className="space-y-4">
              <input 
                autoFocus
                type="password"
                placeholder="Enter Authorization Code"
                className={`w-full px-4 py-4 bg-slate-50 border-2 rounded-2xl text-center font-mono focus:ring-4 outline-none transition-all ${
                  verificationError ? 'border-red-500 focus:ring-red-100' : 'border-slate-100 focus:ring-blue-100'
                }`}
                value={verificationPassword}
                onChange={(e) => setVerificationPassword(e.target.value)}
              />
              <p className="text-[10px] text-slate-400 italic">Hint: 'admin123'</p>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setVerificationAction(null)} 
                  className="px-4 py-3 border border-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200"
                >
                  Verify Access
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Password Modal */}
      {memberToChangePassword && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Update Password</h2>
              <button onClick={() => setMemberToChangePassword(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500">
                  {memberToChangePassword.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{memberToChangePassword.name}</p>
                  <p className="text-xs text-slate-500">{memberToChangePassword.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">New Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    autoFocus
                    required 
                    type="password" 
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                    placeholder="Enter new password"
                    value={passwordChangeValue}
                    onChange={(e) => setPasswordChangeValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setMemberToChangePassword(null)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  disabled={!passwordChangeValue}
                  onClick={() => requestVerification(handleChangePassword)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm disabled:opacity-50"
                >
                  Save Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Add Staff Member</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                    value={newMember.name}
                    onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Initial Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      required 
                      type="password" 
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm"
                      placeholder="••••••••"
                      value={newMember.password}
                      onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Role Selection</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      type="button"
                      onClick={() => setNewMember({...newMember, role: 'Engineer'})}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        newMember.role === 'Engineer' 
                          ? 'bg-blue-50 border-blue-600 text-blue-700' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      Engineer
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewMember({...newMember, role: 'Manager'})}
                      className={`py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        newMember.role === 'Manager' 
                          ? 'bg-purple-50 border-purple-600 text-purple-700' 
                          : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      Manager
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (!newMember.name || !newMember.password) return;
                    requestVerification(handleAddMember);
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 text-sm"
                >
                  Confirm Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Remove Staff?</h2>
            <p className="text-slate-500">Are you sure you want to remove <b>{memberToDelete.name}</b> from the system? They will lose all access.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setMemberToDelete(null)} className="px-6 py-3 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
              <button onClick={() => requestVerification(deleteMember)} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-100">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* Flush Modal */}
      {showFlushModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Flush Tickets?</h2>
            <p className="text-slate-500">Purge all tickets currently set as <b>Resolved</b> or <b>Closed</b>. This action is permanent.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setShowFlushModal(false)} className="px-6 py-3 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
              <button onClick={() => requestVerification(flushTickets)} className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold">Flush DB</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
              <RefreshCw size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Total System Reset?</h2>
            <p className="text-slate-500">Wipe all local changes and revert to factory mock data. This will reload the application.</p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <button onClick={() => setShowResetModal(false)} className="px-6 py-3 border-2 border-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
              <button onClick={() => requestVerification(resetSystem)} className="px-6 py-3 bg-amber-600 text-white rounded-2xl font-bold">Wipe & Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminView;
