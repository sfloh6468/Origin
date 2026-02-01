
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Upload, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle,
  ChevronRight,
  UserCheck,
  UserX
} from 'lucide-react';
import { Subscriber, AccountStatus, Ticket } from '../types';

interface CRMViewProps {
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  isManager: boolean;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
}

const CRMView: React.FC<CRMViewProps> = ({ subscribers, setSubscribers, isManager, tickets, setTickets }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    condoName: '',
    unitNumber: '',
    routerSerialNumber: ''
  });

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.condoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
    );
  }, [subscribers, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.phone.startsWith('+')) {
      alert("Phone number must be in international format (e.g., +60...)");
      return;
    }
    
    const newSubscriber: Subscriber = {
      id: `sub-${Date.now()}`,
      ...formData,
      status: AccountStatus.ACTIVE
    };
    
    setSubscribers(prev => [...prev, newSubscriber]);
    setIsFormOpen(false);
    setFormData({ name: '', phone: '', email: '', condoName: '', unitNumber: '', routerSerialNumber: '' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const updatedList = [...subscribers];
      const logs: string[] = [];

      // Assume CSV: Name,Phone,Email,Condo,Unit,SN
      lines.slice(1).forEach(line => {
        const [name, phone, email, condo, unit, sn] = line.split(',').map(v => v.trim());
        if (!phone) return;

        const existingIdx = updatedList.findIndex(s => s.phone === phone);
        if (existingIdx >= 0) {
          updatedList[existingIdx] = { ...updatedList[existingIdx], name, email, condoName: condo, unitNumber: unit, routerSerialNumber: sn };
          logs.push(`Updated: ${name} (${phone})`);
        } else {
          updatedList.push({
            id: `sub-csv-${Date.now()}-${Math.random()}`,
            name, phone, email, condoName: condo, unitNumber: unit, routerSerialNumber: sn,
            status: AccountStatus.ACTIVE
          });
          logs.push(`Created: ${name} (${phone})`);
        }
      });

      setSubscribers(updatedList);
      setImportLogs(logs);
      setTimeout(() => setImportLogs([]), 5000);
    };
    reader.readAsText(file);
  };

  const changeStatus = (id: string, newStatus: AccountStatus) => {
    if (!isManager && newStatus === AccountStatus.UNSUBSCRIBED) {
      alert("Only managers can unsubscribe members.");
      return;
    }
    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
  };

  const handleDelete = (id: string) => {
    if (!isManager) return;
    if (confirm("Are you sure you want to delete this subscriber? This will also archive their tickets.")) {
      setSubscribers(prev => prev.filter(s => s.id !== id));
      setTickets(prev => prev.filter(t => t.subscriberId !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Subscriber Management</h1>
          <p className="text-slate-500">Manage the CRM and import data bulk.</p>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700 shadow-sm">
            <Upload size={18} />
            <span>Import CSV</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleImport} />
          </label>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            <span>New Subscriber</span>
          </button>
        </div>
      </div>

      {importLogs.length > 0 && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-green-800 text-sm animate-bounce">
          Successfully processed {importLogs.length} records.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, condo, or unit..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Subscriber</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 uppercase">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{sub.name}</p>
                        <p className="text-xs text-slate-400">ID: {sub.id.split('-').pop()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        <span>{sub.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        <span>{sub.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{sub.condoName}, {sub.unitNumber}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Router: {sub.routerSerialNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      sub.status === AccountStatus.ACTIVE ? 'bg-green-100 text-green-700' : 
                      sub.status === AccountStatus.SUSPENDED ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isManager && (
                        <>
                          <button 
                            onClick={() => changeStatus(sub.id, sub.status === AccountStatus.ACTIVE ? AccountStatus.SUSPENDED : AccountStatus.ACTIVE)}
                            title="Toggle Active/Suspended"
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <UserCheck size={18} />
                          </button>
                          <button 
                            onClick={() => changeStatus(sub.id, AccountStatus.UNSUBSCRIBED)}
                            title="Unsubscribe"
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <UserX size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(sub.id)}
                            title="Delete Permanently"
                            className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Plus className="rotate-45" size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Entry Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Register New Subscriber</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Phone (Intl. Format)</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="+60123456789"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Email Address</label>
                  <input 
                    required 
                    type="email" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Router Serial Number</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.routerSerialNumber}
                    onChange={(e) => setFormData({...formData, routerSerialNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Condo Name</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.condoName}
                    onChange={(e) => setFormData({...formData, condoName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">Unit Number</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData({...formData, unitNumber: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                >
                  Create Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRMView;
