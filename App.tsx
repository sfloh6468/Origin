
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
  Search,
  Database,
  Building as BuildingIcon,
  Zap,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  MapPin,
  Globe
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import CRMView from './views/CRMView';
import TicketView from './views/TicketView';
import AnalyticsView from './views/AnalyticsView';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';
import ShiftBanner from './components/ShiftBanner';
import { Engineer, Subscriber, Ticket, Comment, Building, InternetPackage } from './types';
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

  // NEW: Customer DB States
  const [buildings, setBuildings] = useState<Building[]>(() => {
    const saved = localStorage.getItem('isp_buildings');
    return saved ? JSON.parse(saved) : [
      { id: 'b-1', name: 'Horizon Residences', address: '123 Sky Way, Kuala Lumpur' },
      { id: 'b-2', name: 'Skyline Towers', address: '456 Urban Ave, Penang' }
    ];
  });

  const [plans, setPlans] = useState<InternetPackage[]>(() => {
    const saved = localStorage.getItem('isp_plans');
    return saved ? JSON.parse(saved) : [
      { id: 'p-1', name: 'Lite 100Mbps', speed: '100Mbps' },
      { id: 'p-2', name: 'Turbo 300Mbps', speed: '300Mbps' },
      { id: 'p-3', name: 'Gigabit Pro', speed: '1000Mbps' }
    ];
  });
  
  const [isCustomerDBExpanded, setIsCustomerDBExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState<'building' | 'plan' | null>(null);

  // Track active sessions for collision detection
  const [activeViewing, setActiveViewing] = useState<{ [ticketId: string]: string }>({});

  useEffect(() => {
    localStorage.setItem('isp_subscribers', JSON.stringify(subscribers));
    localStorage.setItem('isp_tickets', JSON.stringify(tickets));
    localStorage.setItem('isp_comments', JSON.stringify(comments));
    localStorage.setItem('isp_engineers', JSON.stringify(engineers));
    localStorage.setItem('isp_buildings', JSON.stringify(buildings));
    localStorage.setItem('isp_plans', JSON.stringify(plans));
  }, [subscribers, tickets, comments, engineers, buildings, plans]);

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

  const addBuilding = (name: string, address: string) => {
    if (!isManager) return alert("Privilege Required");
    setBuildings(prev => [...prev, { id: `b-${Date.now()}`, name, address }]);
  };

  const addPlan = (name: string, speed: string) => {
    if (!isManager) return alert("Privilege Required");
    setPlans(prev => [...prev, { id: `p-${Date.now()}`, name, speed }]);
  };

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
            
            {/* Customer DB Dropdown */}
            <div className="space-y-1">
              <button 
                onClick={() => setIsCustomerDBExpanded(!isCustomerDBExpanded)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                  isCustomerDBExpanded ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Database size={20} className={isCustomerDBExpanded ? 'text-blue-400' : ''} />
                  <span className="font-medium">Customer DB</span>
                </div>
                {isCustomerDBExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              {isCustomerDBExpanded && (
                <div className="ml-4 pl-4 border-l border-slate-700 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  <button 
                    onClick={() => setActiveModal('building')}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  >
                    <BuildingIcon size={16} />
                    <span>Building</span>
                  </button>
                  <button 
                    onClick={() => setActiveModal('plan')}
                    className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  >
                    <Zap size={16} />
                    <span>Plan</span>
                  </button>
                </div>
              )}
            </div>

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
              <Route 
                path="/" 
                element={
                  <DashboardView 
                    tickets={tickets} 
                    subscribers={subscribers} 
                    currentUser={currentUser} 
                    setTickets={setTickets}
                    setComments={setComments}
                  />
                } 
              />
              <Route 
                path="/crm" 
                element={
                  <CRMView 
                    subscribers={subscribers} 
                    setSubscribers={setSubscribers} 
                    isManager={isManager} 
                    tickets={tickets}
                    setTickets={setTickets}
                    buildings={buildings}
                    plans={plans}
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
              <Route path="/analytics" element={<AnalyticsView tickets={tickets} engineers={engineers} currentUser={currentUser} />} />
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

        {/* CUSTOMER DB POPUPS */}
        {activeModal === 'building' && (
          <Modal onClose={() => setActiveModal(null)} title="Manage Infrastructure">
            <BuildingManager 
              buildings={buildings} 
              onAdd={addBuilding} 
              onDelete={(id) => setBuildings(prev => prev.filter(b => b.id !== id))}
              isManager={isManager}
            />
          </Modal>
        )}

        {activeModal === 'plan' && (
          <Modal onClose={() => setActiveModal(null)} title="Manage Service Plans">
            <PlanManager 
              plans={plans} 
              onAdd={addPlan} 
              onDelete={(id) => setPlans(prev => prev.filter(p => p.id !== id))}
              isManager={isManager}
            />
          </Modal>
        )}
      </div>
    </Router>
  );
};

// --- SUBSIDIARY COMPONENTS ---

const Modal: React.FC<{ onClose: () => void, title: string, children: React.ReactNode }> = ({ onClose, title, children }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
        <h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <X size={24} />
        </button>
      </div>
      <div className="p-8 overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

const BuildingManager: React.FC<{ 
  buildings: Building[], 
  onAdd: (n: string, a: string) => void, 
  onDelete: (id: string) => void,
  isManager: boolean 
}> = ({ buildings, onAdd, onDelete, isManager }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  return (
    <div className="space-y-8">
      {isManager ? (
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
          <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Register New Condo/Apartment</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Building Name" 
              className="px-4 py-2 border rounded-xl text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Physical Address" 
              className="px-4 py-2 border rounded-xl text-sm"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { if(name && address) { onAdd(name, address); setName(''); setAddress(''); }}}
            className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Add Infrastructure</span>
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 p-4 rounded-xl text-amber-700 flex items-center space-x-3">
          <ShieldCheck size={20} />
          <p className="text-xs font-bold">Only Managers can modify infrastructure databases.</p>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Registered Buildings</p>
        <div className="grid grid-cols-1 gap-3">
          {buildings.map(b => (
            <div key={b.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="font-bold text-slate-800">{b.name}</p>
                  <p className="text-xs text-slate-500">{b.address}</p>
                </div>
              </div>
              {isManager && (
                <button onClick={() => onDelete(b.id)} className="text-slate-300 hover:text-red-500 p-2">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlanManager: React.FC<{ 
  plans: InternetPackage[], 
  onAdd: (n: string, s: string) => void, 
  onDelete: (id: string) => void,
  isManager: boolean 
}> = ({ plans, onAdd, onDelete, isManager }) => {
  const [name, setName] = useState('');
  const [speed, setSpeed] = useState('');

  return (
    <div className="space-y-8">
      {isManager ? (
        <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 space-y-4">
          <p className="text-xs font-black text-indigo-600 uppercase tracking-widest">Create Internet Package</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Plan Name (e.g. Gamer Plus)" 
              className="px-4 py-2 border rounded-xl text-sm"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Speed (e.g. 500Mbps)" 
              className="px-4 py-2 border rounded-xl text-sm"
              value={speed}
              onChange={e => setSpeed(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { if(name && speed) { onAdd(name, speed); setName(''); setSpeed(''); }}}
            className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Plan</span>
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 p-4 rounded-xl text-amber-700 flex items-center space-x-3">
          <ShieldCheck size={20} />
          <p className="text-xs font-bold">Only Managers can modify plan databases.</p>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Available Packages</p>
        <div className="grid grid-cols-1 gap-3">
          {plans.map(p => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="flex items-start space-x-3">
                <Globe size={18} className="text-slate-400 mt-1" />
                <div>
                  <p className="font-bold text-slate-800">{p.name}</p>
                  <p className="text-xs font-black text-blue-600 uppercase">{p.speed}</p>
                </div>
              </div>
              {isManager && (
                <button onClick={() => onDelete(p.id)} className="text-slate-300 hover:text-red-500 p-2">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
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
