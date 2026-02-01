
import React from 'react';
import { Engineer, Ticket, Subscriber } from '../types';
import { ShieldAlert, Users, Calendar, Trash2, UserPlus, Key } from 'lucide-react';

interface AdminViewProps {
  engineers: Engineer[];
  setEngineers: React.Dispatch<React.SetStateAction<Engineer[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
}

const AdminView: React.FC<AdminViewProps> = ({ engineers, tickets, subscribers, setEngineers }) => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
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
        {/* Staff Management */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center space-x-2">
              <Users size={18} className="text-blue-500" />
              <span>Engineering Staff</span>
            </h3>
            <button className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all uppercase">Add Member</button>
          </div>
          <div className="divide-y divide-slate-100">
            {engineers.map(eng => (
              <div key={eng.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
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
                <div className="flex items-center space-x-6">
                   <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                    <p className={`text-xs font-bold ${eng.isOnShift ? 'text-green-600' : 'text-slate-400'}`}>
                      {eng.isOnShift ? 'ACTIVE ON SHIFT' : 'OFFLINE'}
                    </p>
                  </div>
                  <button className="p-2 text-slate-300 hover:text-slate-600">
                    <Key size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Stats Panel */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Database Health</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Subscribers</span>
                <span className="font-bold text-slate-800">{subscribers.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Archived Tickets</span>
                <span className="font-bold text-slate-800">421</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">System Logs</span>
                <span className="font-bold text-slate-800">1.2k</span>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100">
                <button className="w-full py-3 border-2 border-slate-100 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all flex items-center justify-center space-x-2">
                  <Calendar size={16} />
                  <span>Export Database Audit</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-8 rounded-3xl border border-red-100 text-red-800">
            <h3 className="font-bold mb-4 flex items-center space-x-2">
              <Trash2 size={18} />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs font-medium leading-relaxed opacity-80 mb-6">
              Critical operations that affect core data integrity. Please proceed with extreme caution.
            </p>
            <div className="space-y-2">
              <button className="w-full py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200">
                Flush All Resolved Tickets
              </button>
              <button className="w-full py-2 border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-all">
                Reset System Config
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
