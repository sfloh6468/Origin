
import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Upload, 
  Download,
  Filter, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  MapPin, 
  AlertTriangle,
  ChevronRight,
  UserCheck,
  UserX,
  Trash2,
  XCircle,
  Zap,
  Edit2,
  Building as BuildingIcon,
  RefreshCw
} from 'lucide-react';
import { Subscriber, AccountStatus, Ticket, Building, InternetPackage } from '../types';

interface CRMViewProps {
  subscribers: Subscriber[];
  setSubscribers: React.Dispatch<React.SetStateAction<Subscriber[]>>;
  isManager: boolean;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  buildings: Building[];
  plans: InternetPackage[];
}

const CRMView: React.FC<CRMViewProps> = ({ subscribers, setSubscribers, isManager, tickets, setTickets, buildings, plans }) => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    condoName: '',
    unitNumber: '',
    routerSerialNumber: '',
    plan: ''
  });

  // Handle navigation from Dashboard "New Registration" button
  useEffect(() => {
    if (location.state?.openRegister) {
      resetForm();
      setIsFormOpen(true);
      // Clear state so it doesn't pop up again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.condoName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm)
    );
  }, [subscribers, searchTerm]);

  const resetForm = () => {
    setFormData({ 
      name: '', 
      phone: '', 
      email: '', 
      condoName: buildings[0]?.name || '', 
      unitNumber: '', 
      routerSerialNumber: '', 
      plan: plans[0]?.name || '' 
    });
    setEditingId(null);
  };

  const handleEditClick = (sub: Subscriber) => {
    setEditingId(sub.id);
    setFormData({
      name: sub.name,
      phone: sub.phone,
      email: sub.email,
      condoName: sub.condoName,
      unitNumber: sub.unitNumber,
      routerSerialNumber: sub.routerSerialNumber,
      plan: sub.plan
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone.startsWith('+')) {
      alert("Phone number must be in international format (e.g., +60...)");
      return;
    }
    
    if (editingId) {
      setSubscribers(prev => prev.map(s => s.id === editingId ? { ...s, ...formData } : s));
    } else {
      const newSubscriber: Subscriber = {
        id: `sub-${Date.now()}`,
        ...formData,
        status: AccountStatus.ACTIVE
      };
      setSubscribers(prev => [...prev, newSubscriber]);
    }
    
    setIsFormOpen(false);
    resetForm();
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

      lines.slice(1).forEach(line => {
        const parts = line.split(',').map(v => v.trim());
        if (parts.length < 2) return;
        const [name, phone, email, condo, unit, sn, plan] = parts;
        
        const existingIdx = updatedList.findIndex(s => s.phone === phone);
        if (existingIdx >= 0) {
          updatedList[existingIdx] = { 
            ...updatedList[existingIdx], 
            name, email, condoName: condo, unitNumber: unit, routerSerialNumber: sn,
            plan: plan || plans[0]?.name || 'Standard'
          };
          logs.push(`Updated: ${name}`);
        } else {
          updatedList.push({
            id: `sub-csv-${Date.now()}-${Math.random()}`,
            name, phone, email, condoName: condo, unitNumber: unit, routerSerialNumber: sn,
            plan: plan || plans[0]?.name || 'Standard',
            status: AccountStatus.ACTIVE
          });
          logs.push(`Created: ${name}`);
        }
      });

      setSubscribers(updatedList);
      setImportLogs(logs);
      setTimeout(() => setImportLogs([]), 5000);
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const headers = ['Name', 'Phone', 'Email', 'Building', 'Unit', 'Serial Number', 'Plan', 'Status'];
    const rows = subscribers.map(s => [
      s.name,
      s.phone,
      s.email,
      s.condoName,
      s.unitNumber,
      s.routerSerialNumber,
      s.plan,
      s.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell?.replace(/"/g, '""') || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `isp_backup_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const cycleStatus = (id: string, currentStatus: AccountStatus) => {
    const statuses = [AccountStatus.ACTIVE, AccountStatus.SUSPENDED, AccountStatus.UNSUBSCRIBED];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    const nextStatus = statuses[nextIndex];

    if (!isManager && nextStatus === AccountStatus.UNSUBSCRIBED) {
      // If not manager, skip unsubscribed and go to active
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: AccountStatus.ACTIVE } : s));
      return;
    }

    setSubscribers(prev => prev.map(s => s.id === id ? { ...s, status: nextStatus } : s));
  };

  const confirmDelete = () => {
    if (!isManager || !subscriberToDelete) return;
    setSubscribers(prev => prev.filter(s => s.id !== subscriberToDelete));
    setTickets(prev => prev.filter(t => t.subscriberId !== subscriberToDelete));
    setSubscriberToDelete(null);
  };

  const targetSubscriber = useMemo(() => 
    subscribers.find(s => s.id === subscriberToDelete), 
    [subscribers, subscriberToDelete]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">CRM & Pipeline</h1>
          <p className="text-slate-500 font-medium">Global subscriber database management.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700 shadow-sm"
          >
            <Download size={18} />
            <span>Batch Download</span>
          </button>
          <label className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all text-sm font-semibold text-slate-700 shadow-sm">
            <Upload size={18} />
            <span>Batch Upload</span>
            <input type="file" className="hidden" accept=".csv" onChange={handleImport} />
          </label>
          <button 
            onClick={() => { resetForm(); setIsFormOpen(true); }}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-black uppercase tracking-widest shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            <span>Register</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center bg-slate-50/30">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name, condo, or unit..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-5">Identity</th>
                <th className="px-8 py-5">Connectivity</th>
                <th className="px-8 py-5">Infrastructure</th>
                <th className="px-8 py-5">Service Tier</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSubscribers.map(sub => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-lg">
                        {sub.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-800">{sub.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {sub.id.split('-').pop()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2 text-slate-600 font-bold text-xs">
                        <Phone size={14} className="text-slate-400" />
                        <span>{sub.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-500 text-xs italic">
                        <Mail size={14} className="text-slate-400" />
                        <span>{sub.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2 text-slate-800 font-bold text-xs">
                      <MapPin size={14} className="text-blue-500" />
                      <span>{sub.condoName}, {sub.unitNumber}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 uppercase font-black tracking-[0.1em] bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                      SN: {sub.routerSerialNumber}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 w-fit">
                      <Zap size={14} fill="currentColor" />
                      <span className="font-black text-[10px] uppercase">{sub.plan}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <button 
                      onClick={() => cycleStatus(sub.id, sub.status)}
                      className={`group/status flex items-center space-x-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${
                        sub.status === AccountStatus.ACTIVE ? 'bg-green-100 text-green-700 hover:bg-green-200' : 
                        sub.status === AccountStatus.SUSPENDED ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 
                        'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                      title="Click to toggle status"
                    >
                      <span>{sub.status}</span>
                      <RefreshCw size={10} className="opacity-0 group-hover/status:opacity-100 transition-opacity" />
                    </button>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isManager && (
                        <>
                          <button onClick={() => handleEditClick(sub)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => setSubscriberToDelete(sub.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
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

      {/* Dynamic Entry Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingId ? 'Modify Record' : 'Subscriber Intake'}
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Configure connectivity profiles</p>
              </div>
              <button onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-slate-400 hover:text-slate-600">
                <XCircle size={32} strokeWidth={1} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormInput label="Full Name" value={formData.name} onChange={v => setFormData({...formData, name: v})} placeholder="e.g. John Doe" />
                <FormInput label="Phone" value={formData.phone} onChange={v => setFormData({...formData, phone: v})} placeholder="+60..." />
                <FormInput label="Email" value={formData.email} onChange={v => setFormData({...formData, email: v})} placeholder="user@domain.com" type="email" />
                
                {/* DYNAMIC PLAN SELECTION */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internet Package</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-sm text-blue-700 outline-none appearance-none cursor-pointer focus:border-blue-500"
                    value={formData.plan}
                    onChange={(e) => setFormData({...formData, plan: e.target.value})}
                  >
                    <option value="" disabled>Select Tier...</option>
                    {plans.map(p => <option key={p.id} value={p.name}>{p.name} ({p.speed})</option>)}
                  </select>
                </div>

                {/* DYNAMIC BUILDING SELECTION */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Infrastructure</label>
                  <select 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-sm text-slate-800 outline-none appearance-none cursor-pointer focus:border-blue-500"
                    value={formData.condoName}
                    onChange={(e) => setFormData({...formData, condoName: e.target.value})}
                  >
                    <option value="" disabled>Select Building...</option>
                    {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                  </select>
                </div>

                <FormInput label="Unit / Lot Number" value={formData.unitNumber} onChange={v => setFormData({...formData, unitNumber: v})} placeholder="e.g. A-12-01" />
                <div className="md:col-span-2">
                  <FormInput label="Router Serial (SN)" value={formData.routerSerialNumber} onChange={v => setFormData({...formData, routerSerialNumber: v})} placeholder="Hardware Identification" mono />
                </div>
              </div>

              <div className="pt-6 flex justify-end space-x-4">
                <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="px-8 py-4 border-2 border-slate-100 text-slate-600 rounded-3xl font-black uppercase text-xs tracking-widest">Cancel</button>
                <button type="submit" className="px-10 py-4 bg-blue-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-200">
                  {editingId ? 'Apply Update' : 'Initialize Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {subscriberToDelete && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl p-10 text-center animate-in zoom-in-95">
             <div className="w-20 h-20 bg-red-50 rounded-[30px] flex items-center justify-center text-red-600 mx-auto mb-8">
              <Trash2 size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Purge Subscriber?</h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10">Permanently remove <b className="text-slate-800">{targetSubscriber?.name}</b> and all historical records?</p>
            <div className="grid grid-cols-2 gap-5">
              <button onClick={() => setSubscriberToDelete(null)} className="px-6 py-4 border-2 border-slate-100 text-slate-600 rounded-3xl font-black uppercase text-xs tracking-widest">Cancel</button>
              <button onClick={confirmDelete} className="px-6 py-4 bg-red-600 text-white rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl shadow-red-200">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FormInput: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder?: string, type?: string, mono?: boolean }> = ({ label, value, onChange, placeholder, type = "text", mono = false }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      required 
      type={type} 
      className={`w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold focus:ring-4 focus:ring-blue-100 outline-none transition-all ${mono ? 'font-mono uppercase' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

export default CRMView;
