
import React, { useState, useMemo } from 'react';
import { Ticket, Subscriber, Engineer, Building, TicketStatus } from '../types';
import { 
  Download, 
  Search, 
  Filter, 
  Calendar, 
  Building as BuildingIcon, 
  User, 
  Clock, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

interface AdvancedReportingViewProps {
  tickets: Ticket[];
  subscribers: Subscriber[];
  engineers: Engineer[];
  buildings: Building[];
}

const AdvancedReportingView: React.FC<AdvancedReportingViewProps> = ({ tickets, subscribers, engineers, buildings }) => {
  // Filter states
  const [buildingFilter, setBuildingFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [issueKeyword, setIssueKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [engineerFilter, setEngineerFilter] = useState('');

  const filteredData = useMemo(() => {
    return tickets.filter(ticket => {
      const sub = subscribers.find(s => s.id === ticket.subscriberId);
      
      // 1. Building Filter
      if (buildingFilter && sub?.condoName !== buildingFilter) return false;

      // 2. Unit Filter
      if (unitFilter && !sub?.unitNumber.toLowerCase().includes(unitFilter.toLowerCase())) return false;

      // 3. Date Filter
      const ticketDate = new Date(ticket.createdAt);
      if (startDate) {
        const start = new Date(startDate);
        if (ticketDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        // Set end date to end of day
        end.setHours(23, 59, 59, 999);
        if (ticketDate > end) return false;
      }

      // 4. Issue Description Filter
      if (issueKeyword && !ticket.subject.toLowerCase().includes(issueKeyword.toLowerCase()) && !ticket.description.toLowerCase().includes(issueKeyword.toLowerCase())) {
        return false;
      }

      // 5. Status Filter
      if (statusFilter && ticket.status !== statusFilter) return false;

      // 6. Engineer Filter
      if (engineerFilter && ticket.assignedEngineerId !== engineerFilter) return false;

      return true;
    });
  }, [tickets, subscribers, buildingFilter, unitFilter, startDate, endDate, issueKeyword, statusFilter, engineerFilter]);

  const handleExport = () => {
    const headers = ['Ticket ID', 'Subscriber', 'Building', 'Unit', 'Subject', 'Status', 'Priority', 'Created At', 'Resolved At', 'Engineer', 'Follow-up Note'];
    const rows = filteredData.map(ticket => {
      const sub = subscribers.find(s => s.id === ticket.subscriberId);
      const eng = engineers.find(e => e.id === ticket.assignedEngineerId);
      return [
        ticket.id,
        sub?.name || 'N/A',
        sub?.condoName || 'N/A',
        sub?.unitNumber || 'N/A',
        ticket.subject,
        ticket.status,
        ticket.priority,
        new Date(ticket.createdAt).toLocaleString(),
        ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : 'N/A',
        eng?.name || 'Unassigned',
        ticket.followUpNote || 'None'
      ];
    });

    let csvContent = "ORIGIN - ADVANCED ANALYTICS REPORT\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += headers.join(',') + "\n";
    csvContent += rows.map(row => row.map(cell => `"${cell?.toString().replace(/"/g, '""') || ''}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `origin_advanced_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Analytics Report Engine</h1>
          <p className="text-slate-500 font-medium">Extract granular operational data and shift logs based on criteria.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={filteredData.length === 0}
          className="flex items-center space-x-3 px-10 py-5 bg-slate-900 text-white rounded-[30px] hover:bg-slate-800 transition-all font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 disabled:opacity-30 disabled:cursor-not-allowed group active:scale-95"
        >
          <Download size={22} className="group-hover:bounce transition-transform" />
          <span>Export Analytics Report ({filteredData.length})</span>
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:rotate-12 transition-transform">
           <Filter size={120} />
        </div>
        <div className="flex items-center space-x-3 mb-10">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner">
            <Filter size={20} />
          </div>
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest">Global Filter Criteria</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Building Selection */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <BuildingIcon size={14} className="text-blue-500" />
              <span>Infrastructure</span>
            </label>
            <select 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
            >
              <option value="">All Buildings</option>
              {buildings.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
          </div>

          {/* Unit Number */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Search size={14} className="text-blue-500" />
              <span>Unit / Lot Search</span>
            </label>
            <input 
              type="text"
              placeholder="e.g. A-12-05"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
            />
          </div>

          {/* Date Start */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Calendar size={14} className="text-blue-500" />
              <span>Shift Start</span>
            </label>
            <input 
              type="date"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* Date End */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Calendar size={14} className="text-blue-500" />
              <span>Shift End</span>
            </label>
            <input 
              type="date"
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {/* Issue Keyword */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <FileSpreadsheet size={14} className="text-blue-500" />
              <span>Root Issue Phrases</span>
            </label>
            <input 
              type="text"
              placeholder="Keywords..."
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
              value={issueKeyword}
              onChange={(e) => setIssueKeyword(e.target.value)}
            />
          </div>

          {/* Lifecycle Status */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <Clock size={14} className="text-blue-500" />
              <span>Update Lifecycle</span>
            </label>
            <select 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {Object.values(TicketStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* On-Duty Member */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
              <User size={14} className="text-blue-500" />
              <span>On-Duty Member</span>
            </label>
            <select 
              className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
              value={engineerFilter}
              onChange={(e) => setEngineerFilter(e.target.value)}
            >
              <option value="">All Members</option>
              {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {/* Clear Button */}
          <div className="flex items-end">
            <button 
              onClick={() => {
                setBuildingFilter('');
                setUnitFilter('');
                setStartDate('');
                setEndDate('');
                setIssueKeyword('');
                setStatusFilter('');
                setEngineerFilter('');
              }}
              className="w-full py-5 bg-slate-100 hover:bg-red-50 hover:text-red-600 rounded-[25px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all active:scale-95"
            >
              Flush All Filters
            </button>
          </div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                <th className="px-10 py-8">Incident ID</th>
                <th className="px-10 py-8">Contact Profile</th>
                <th className="px-10 py-8">Facility Locality</th>
                <th className="px-10 py-8">Problem Statement</th>
                <th className="px-10 py-8">Shift State</th>
                <th className="px-10 py-8">Ownership</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-32 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <div className="p-8 bg-slate-50 rounded-full mb-6">
                        <AlertCircle size={64} className="opacity-10" />
                      </div>
                      <p className="font-black text-sm uppercase tracking-[0.3em] text-slate-400">Zero matches found in logs</p>
                      <p className="text-xs font-bold text-slate-300 mt-2">Adjust your criteria to broaden the search</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map(ticket => {
                  const sub = subscribers.find(s => s.id === ticket.subscriberId);
                  const eng = engineers.find(e => e.id === ticket.assignedEngineerId);
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors text-sm group">
                      <td className="px-10 py-8">
                        <span className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">{ticket.id}</span>
                        <p className="text-[9px] text-slate-400 mt-1 uppercase font-black tracking-widest">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-10 py-8">
                        <p className="font-black text-slate-700">{sub?.name || 'Manual Entry'}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">{sub?.phone || 'No Phone'}</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-2">
                           <BuildingIcon size={14} className="text-blue-500" />
                           <p className="font-black text-slate-800">{sub?.condoName || 'N/A'}</p>
                        </div>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mt-1">{sub?.unitNumber || 'Unit N/A'}</p>
                      </td>
                      <td className="px-10 py-8 max-w-sm">
                        <p className="font-black text-slate-800 truncate">{ticket.subject}</p>
                        <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1">"{ticket.description}"</p>
                      </td>
                      <td className="px-10 py-8">
                        <div className={`inline-flex px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                          ticket.status === TicketStatus.RESOLVED ? 'bg-green-50 text-green-700 border-green-100' :
                          ticket.status === TicketStatus.OPEN ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {ticket.status}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg shadow-slate-200">
                            {eng?.name.charAt(0) || '?'}
                          </div>
                          <div>
                            <span className="font-black text-slate-700 text-xs">{eng?.name || 'Unassigned'}</span>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{eng?.role || 'SYSTEM'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedReportingView;
