
import React, { useState, useMemo } from 'react';
import { AttendanceRecord, Engineer } from '../types';
import { 
  Calendar, 
  User, 
  Clock, 
  Download, 
  Search, 
  Filter, 
  ArrowRight,
  Zap,
  Coffee,
  Sun
} from 'lucide-react';

interface AttendanceViewProps {
  attendance: AttendanceRecord[];
  engineers: Engineer[];
}

const AttendanceView: React.FC<AttendanceViewProps> = ({ attendance, engineers }) => {
  const [dateFilter, setDateFilter] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [overtimeFilter, setOvertimeFilter] = useState('all'); // 'all', 'yes', 'no'

  const filteredAttendance = useMemo(() => {
    return [...attendance].reverse().filter(record => {
      const matchDate = dateFilter ? record.date === dateFilter : true;
      const matchMember = memberFilter ? record.engineerId === memberFilter : true;
      
      const hasOvertime = record.overtimeMinutes !== undefined && record.overtimeMinutes > 0;
      const matchOvertime = overtimeFilter === 'all' 
        ? true 
        : overtimeFilter === 'yes' 
          ? hasOvertime 
          : !hasOvertime;

      return matchDate && matchMember && matchOvertime;
    });
  }, [attendance, dateFilter, memberFilter, overtimeFilter]);

  const handleExport = () => {
    const headers = ['Member', 'Date', 'Login Time', 'Logout Time', 'Total Duration (Min)', 'Overtime (Min)', 'Shift Status'];
    const rows = filteredAttendance.map(record => [
      record.engineerName,
      record.date,
      new Date(record.loginTime).toLocaleTimeString(),
      record.logoutTime ? new Date(record.logoutTime).toLocaleTimeString() : 'Active',
      record.totalMinutes || 'N/A',
      record.overtimeMinutes || 0,
      record.logoutTime ? 'Shift Ended' : 'Currently On-Duty'
    ]);

    let csvContent = "ORIGIN - ATTENDANCE & SHIFT LOG\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += headers.join(',') + "\n";
    csvContent += rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `origin_attendance_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (mins?: number) => {
    if (mins === undefined) return 'Calculating...';
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Shift Attendance Logs</h1>
          <p className="text-slate-500 font-medium">Trace on-duty cycles, session history, and overtime metrics.</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center space-x-3 px-10 py-5 bg-slate-900 text-white rounded-[30px] hover:bg-slate-800 transition-all font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-300 active:scale-95"
        >
          <Download size={22} />
          <span>Export Shift Logs</span>
        </button>
      </div>

      <div className="bg-white p-10 rounded-[50px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
            <Calendar size={14} className="text-blue-500" />
            <span>Target Date</span>
          </label>
          <input 
            type="date"
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
            <User size={14} className="text-blue-500" />
            <span>Engineering Member</span>
          </label>
          <select 
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
          >
            <option value="">All Active Members</option>
            {engineers.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center space-x-2">
            <Zap size={14} className="text-amber-500" />
            <span>Work Overtime</span>
          </label>
          <select 
            className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-50 rounded-[25px] font-bold text-sm outline-none focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
            value={overtimeFilter}
            onChange={(e) => setOvertimeFilter(e.target.value)}
          >
            <option value="all">All Sessions</option>
            <option value="yes">With Overtime</option>
            <option value="no">Standard Shift Only</option>
          </select>
        </div>

        <div className="flex items-end">
          <button 
            onClick={() => { setDateFilter(''); setMemberFilter(''); setOvertimeFilter('all'); }}
            className="w-full py-5 bg-slate-100 hover:bg-slate-200 rounded-[25px] text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 transition-all"
          >
            Flush Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[50px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-8">Engineer Identity</th>
                <th className="px-10 py-8 text-center">Duty Date</th>
                <th className="px-10 py-8 text-center">Shift Start</th>
                <th className="px-10 py-8 text-center">Shift End</th>
                <th className="px-10 py-8 text-center">Active Work</th>
                <th className="px-10 py-8 text-center">Work Overtime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-300">
                      <Clock size={64} className="opacity-10 mb-4" />
                      <p className="font-black text-xs uppercase tracking-widest">No Attendance Logs Recorded</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center font-black">
                          {record.engineerName.charAt(0)}
                        </div>
                        <span className="font-black text-slate-800">{record.engineerName}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{record.date}</span>
                    </td>
                    <td className="px-10 py-8 text-center font-bold text-sm text-blue-600">
                      {new Date(record.loginTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-10 py-8 text-center">
                      {record.logoutTime ? (
                        <span className="font-bold text-sm text-slate-600">
                          {new Date(record.logoutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[9px] font-black uppercase animate-pulse">On-Duty</span>
                      )}
                    </td>
                    <td className="px-10 py-8 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <Coffee size={14} className="text-slate-300" />
                        <span className="font-black text-slate-700">{formatDuration(record.totalMinutes)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-center">
                      {record.overtimeMinutes && record.overtimeMinutes > 0 ? (
                        <div className="flex flex-col items-center">
                          <div className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-2xl flex items-center space-x-2 w-fit">
                            <Zap size={14} fill="currentColor" />
                            <span className="font-black text-xs">{formatDuration(record.overtimeMinutes)}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {new Date(record.loginTime).getHours() < 9 ? 'Early Start' : 'Stayed Late'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
