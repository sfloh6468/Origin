
import React, { useState } from 'react';
import { Engineer } from '../types';
import { ShieldCheck, User, Key, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: Engineer) => void;
  engineers: Engineer[];
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, engineers }) => {
  const [selectedId, setSelectedId] = useState('');

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    const user = engineers.find(e => e.id === selectedId);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-blue-600 p-4 rounded-3xl shadow-2xl shadow-blue-500/30 mb-6">
            <ShieldCheck size={48} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">ISP SENTINEL</h1>
          <p className="text-slate-400 mt-2 font-medium">Shift Engineering Portal</p>
        </div>

        <form onSubmit={handleEnter} className="bg-white rounded-3xl shadow-2xl p-10 space-y-8">
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Identity Selection</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <select 
                required
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all appearance-none font-bold text-slate-800"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Select your profile...</option>
                {engineers.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-1">Access Token</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="password" 
                disabled
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-mono"
                defaultValue="password123"
              />
            </div>
            <p className="text-[10px] text-slate-400 italic text-center">In production, auth is handled via corporate SSO.</p>
          </div>

          <button 
            type="submit"
            disabled={!selectedId}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none flex items-center justify-center space-x-3"
          >
            <span>Start Shift</span>
            <ArrowRight size={24} />
          </button>
        </form>

        <p className="text-center mt-8 text-slate-500 text-xs font-bold uppercase tracking-widest">
          Secured by origin V4.2 - GPON OPS
        </p>
      </div>
    </div>
  );
};

export default LoginView;
