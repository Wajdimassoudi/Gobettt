
import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, Users, History, Gamepad2, LogOut, ShieldCheck, Wallet, ShieldAlert } from 'lucide-react';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const isAdmin = user.role === UserRole.ADMIN;

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'Terminals', icon: Users },
    { id: 'transactions', label: 'History', icon: History },
    { id: 'logs', label: 'API Logs', icon: ShieldCheck },
  ];

  const playerMenu = [
    { id: 'lobby', label: 'Games Lobby', icon: Gamepad2 },
    { id: 'history', label: 'My History', icon: History },
    { id: 'profile', label: 'My Wallet', icon: Wallet },
  ];

  const menuItems = isAdmin ? adminMenu : playerMenu;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden text-slate-200">
      {/* Premium Sidebar */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col hidden lg:flex">
        <div className="p-10 flex items-center gap-4">
          <div className="bg-yellow-500 p-2.5 rounded-2xl shadow-lg shadow-yellow-500/20">
            <ShieldAlert className="text-slate-950 h-7 w-7" />
          </div>
          <div>
            <span className="text-3xl font-black text-white tracking-tighter italic block leading-none">GOBET</span>
            <span className="text-[9px] text-yellow-500 font-black uppercase tracking-[0.3em] mt-1 block">Operational Hub</span>
          </div>
        </div>
        
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto py-4">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 px-4">Navigation Menu</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 group ${
                activeTab === item.id 
                ? 'bg-yellow-500 text-slate-950 font-black shadow-xl shadow-yellow-500/10 translate-x-1' 
                : 'text-slate-500 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
              <span className="text-sm uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 space-y-4">
          <div className="flex items-center gap-4 p-5 bg-slate-900 border border-slate-800 rounded-[1.5rem] shadow-sm">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-lg font-black text-yellow-500 shadow-inner">
              {user.username[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white truncate uppercase tracking-tight">{user.username}</p>
              <p className="text-[10px] text-slate-500 truncate uppercase font-bold tracking-widest">{user.role}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 text-red-500 hover:bg-red-500 hover:text-white rounded-[1.25rem] transition-all duration-300 font-black text-xs uppercase tracking-widest border border-red-500/10"
          >
            <LogOut size={18} />
            Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Modern Header */}
        <header className="h-24 bg-slate-950/50 backdrop-blur-md border-b border-slate-900 px-10 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
             <div className="lg:hidden flex items-center gap-3">
                <div className="bg-yellow-500 p-2 rounded-xl">
                    <ShieldAlert className="text-slate-950" size={20} />
                </div>
                <span className="font-black text-2xl text-white tracking-tighter italic">GOBET</span>
             </div>
             <div className="hidden lg:flex items-center gap-4">
                <div className="w-1 h-8 bg-slate-800 rounded-full" />
                <h2 className="text-slate-500 font-black text-xs uppercase tracking-[0.3em]">
                   System / <span className="text-white">{menuItems.find(i => i.id === activeTab)?.label}</span>
                </h2>
             </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="bg-slate-900/80 px-6 py-3 rounded-2xl flex items-center gap-4 border border-slate-800 group hover:border-yellow-500/30 transition-all cursor-default shadow-sm">
              <div className="bg-yellow-500/10 p-2 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-all">
                <Wallet size={18} />
              </div>
              <div>
                 <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-black leading-none mb-1">Vault Status</span>
                 <span className="text-xl font-black text-yellow-500 tracking-tighter font-mono">
                    {user.balanceTND.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-[10px] uppercase ml-1">TND</span>
                 </span>
              </div>
            </div>
            
            {isAdmin && (
              <div className="hidden md:flex flex-col items-end">
                <span className="bg-red-500 text-white text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-[0.2em] shadow-lg shadow-red-500/20">ROOT ACCESS</span>
                <span className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Administrator</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Viewport */}
        <div className="flex-1 overflow-y-auto px-6 py-10 md:px-10 lg:px-16 scroll-smooth">
          {children}
          {/* Footer spacer */}
          <div className="h-20 lg:hidden" />
        </div>

        {/* Mobile App Bar */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 grid grid-cols-4 p-3 z-50">
            {menuItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center py-2 rounded-2xl transition-all ${
                        activeTab === item.id ? 'bg-yellow-500 text-slate-950 shadow-xl' : 'text-slate-500'
                    }`}
                >
                    <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                    <span className="text-[8px] mt-1 font-black uppercase tracking-widest">{item.label}</span>
                </button>
            ))}
            <button
                onClick={onLogout}
                className="flex flex-col items-center justify-center py-2 text-red-500 hover:bg-red-500/10 rounded-2xl"
            >
                <LogOut size={20} />
                <span className="text-[8px] mt-1 font-black uppercase tracking-widest">Logout</span>
            </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
