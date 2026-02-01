
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
  Users, 
  Ticket as TicketIcon, 
  LayoutDashboard, 
  Settings, 
  MessageSquare, 
  Clock, 
  LogOut, 
  ShieldCheck,
  BarChart3,
  Search
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import CRMView from './views/CRMView';
import TicketView from './views/TicketView';
import AnalyticsView from './views/AnalyticsView';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';
import ShiftBanner from './components/ShiftBanner';
import { Engineer, Subscriber, Ticket, Comment } from './types';
import { mockSubscribers, mockTickets, mockEngineers } from './constants';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Engineer | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>(() => {
    const saved = localStorage.getItem('isp_subscribers');
    return saved ? JSON.parse(saved) : mockSubscribers;
  });
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('isp_tickets');
    return saved ? JSON.parse(saved) : mockTickets;
  });
  const [comments, setComments] = useState<Comment[]>(() => {
    const saved = localStorage.getItem('isp_comments');
    return saved ? JSON.parse(saved) : [];
  });
  const [engineers, setEngineers] = useState<Engineer[]>(() => {
    const saved = localStorage.getItem('isp_engineers');
    return saved ? JSON.parse(saved) : mockEngineers;
  });
  
  // Track active sessions for collision detection
  const [activeViewing, setActiveViewing] = useState<{ [ticketId: string]: string }>({});

  useEffect(() => {
    localStorage.setItem('isp_subscribers', JSON.stringify(subscribers));
    localStorage.setItem('isp_tickets', JSON.stringify(tickets));
    localStorage.setItem('isp_comments', JSON.stringify(comments));
    localStorage.setItem('isp_engineers', JSON.stringify(engineers));
  }, [subscribers, tickets, comments, engineers]);

  const handleLogin = (user: Engineer) => {
    setCurrentUser(user);
    const updated = engineers.map(e => e.id === user.id ? { ...e, lastLogin: new Date().toISOString(), isOnShift: true } : e);
    setEngineers(updated);
    setCurrentUser({ ...user, isOnShift: true });
  };

  const handleLogout = () => {
    if (currentUser) {
      const updated = engineers.map(e => e.id === currentUser.id ? { ...e, lastLogout: new Date().toISOString(), isOnShift: false } : e);
      setEngineers(updated);
    }
    setCurrentUser(null);
  };

  const toggleShift = () => {
    if (!currentUser) return;
    const newShiftStatus = !currentUser.isOnShift;
    const updated = engineers.map(e => e.id === currentUser.id ? { ...e, isOnShift: newShiftStatus } : e);
    setEngineers(updated);
    setCurrentUser({ ...currentUser, isOnShift: newShiftStatus });
  };

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} engineers={engineers} />;
  }

  const isManager = currentUser.role === 'Manager';

  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20">
          <div className="p-6 flex items-center space-x-3 bg-slate-800">
            <div className="bg-blue-500 p-2 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">ISP Sentinel</span>
          </div>

          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            <NavLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavLink to="/crm" icon={<Users size={20} />} label="Subscribers" />
            <NavLink to="/tickets" icon={<TicketIcon size={20} />} label="Ticket Queue" />
            <NavLink to="/analytics" icon={<BarChart3 size={20} />} label="Reporting" />
            {isManager && <NavLink to="/admin" icon={<Settings size={20} />} label="Admin Console" />}
          </div>

          <div className="p-4 border-t border-slate-700 bg-slate-800/50 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                <p className="text-xs text-slate-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
            
            <button 
              onClick={toggleShift}
              className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium transition-colors ${
                currentUser.isOnShift 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
              }`}
            >
              <Clock size={16} />
              <span>{currentUser.isOnShift ? 'End Shift' : 'Start Shift'}</span>
            </button>

            <button 
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm font-medium bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <ShiftBanner engineer={currentUser} />
          <div className="flex-1 overflow-y-auto p-8">
            <Routes>
              <Route path="/" element={<DashboardView tickets={tickets} subscribers={subscribers} />} />
              <Route 
                path="/crm" 
                element={
                  <CRMView 
                    subscribers={subscribers} 
                    setSubscribers={setSubscribers} 
                    isManager={isManager} 
                    tickets={tickets}
                    setTickets={setTickets}
                  />
                } 
              />
              <Route 
                path="/tickets" 
                element={
                  <TicketView 
                    tickets={tickets} 
                    setTickets={setTickets} 
                    subscribers={subscribers} 
                    currentUser={currentUser}
                    comments={comments}
                    setComments={setComments}
                    isManager={isManager}
                    activeViewing={activeViewing}
                    setActiveViewing={setActiveViewing}
                  />
                } 
              />
              <Route path="/analytics" element={<AnalyticsView tickets={tickets} />} />
              {isManager && (
                <Route 
                  path="/admin" 
                  element={
                    <AdminView 
                      engineers={engineers} 
                      setEngineers={setEngineers}
                      tickets={tickets}
                      setTickets={setTickets}
                      subscribers={subscribers}
                      setSubscribers={setSubscribers}
                    />
                  } 
                />
              )}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => (
  <Link 
    to={to} 
    className="flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all group"
  >
    <span className="group-hover:scale-110 transition-transform">{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default App;
