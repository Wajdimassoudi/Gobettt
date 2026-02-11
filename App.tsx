
import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, Transaction, ApiLog, Game } from './types';
import { storage } from './services/storage';
import { gambllyApi } from './services/gamblly';
import Layout from './components/Layout';
import { 
  Users, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Minus, 
  Search, 
  UserPlus, 
  Activity,
  Play,
  X,
  ShieldAlert,
  ShieldCheck,
  Gamepad2,
  RefreshCw,
  Trophy,
  History,
  TrendingUp,
  Settings,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameUrl, setGameUrl] = useState<string | null>(null);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin Modal States
  const [showAddUser, setShowAddUser] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState<{userId: string, type: 'add' | 'remove'} | null>(null);
  const [balanceAmount, setBalanceAmount] = useState('');

  // Initial Data Load
  useEffect(() => {
    setUsers(storage.getUsers());
    setTransactions(storage.getTransactions());
    setApiLogs(storage.getApiLogs());
  }, []);

  // Fetch games when player enters lobby
  useEffect(() => {
    if (currentUser?.role === UserRole.PLAYER && activeTab === 'lobby') {
      loadGames();
    }
  }, [currentUser, activeTab]);

  const loadGames = async () => {
    if (!currentUser) return;
    setIsLoadingGames(true);
    try {
      const fetchedGames = await gambllyApi.getGames(currentUser.id);
      setGames(fetchedGames);
    } catch (err) {
      console.error("Failed to load games", err);
    } finally {
      setIsLoadingGames(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username === loginData.username && u.password === loginData.password);
    if (foundUser) {
      if (foundUser.status === 'disabled') {
        setError('Your account is currently disabled. Contact administration.');
        return;
      }
      setCurrentUser(foundUser);
      setActiveTab(foundUser.role === UserRole.ADMIN ? 'dashboard' : 'lobby');
      setError(null);
    } else {
      setError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginData({ username: '', password: '' });
    setSelectedGame(null);
    setGameUrl(null);
  };

  const createAccount = (username: string, pass: string, role: UserRole) => {
    if (users.some(u => u.username === username)) {
      alert('This username is already taken.');
      return;
    }
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      password: pass,
      role,
      balanceTND: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    const updated = [...users, newUser];
    setUsers(updated);
    storage.saveUsers(updated);
    setShowAddUser(false);
  };

  const updateBalance = (userId: string, amount: number, type: 'deposit' | 'withdrawal' | 'bet' | 'win') => {
    if (amount <= 0) return;
    
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        const adjustment = (type === 'deposit' || type === 'win') ? amount : -amount;
        const newBalance = u.balanceTND + adjustment;
        if (newBalance < 0) {
          alert('Insufficient funds in player wallet.');
          return u;
        }
        return { ...u, balanceTND: newBalance };
      }
      return u;
    });

    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      userId,
      amount,
      type,
      description: `${type.toUpperCase()} - Ref: ${Math.random().toString(36).toUpperCase().substring(0, 6)}`,
      timestamp: new Date().toISOString(),
      performedBy: currentUser?.username || 'System'
    };

    const updatedTxs = [newTx, ...transactions];
    setUsers(updatedUsers);
    setTransactions(updatedTxs);
    storage.saveUsers(updatedUsers);
    storage.saveTransactions(updatedTxs);

    if (currentUser?.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, balanceTND: prev.balanceTND + ((type === 'deposit' || type === 'win') ? amount : -amount) } : null);
    }
    
    setShowBalanceModal(null);
    setBalanceAmount('');
  };

  const toggleUserStatus = (userId: string) => {
    const updated = users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' as any } : u);
    setUsers(updated);
    storage.saveUsers(updated);
  };

  const launchGameSession = async (game: Game) => {
    if (!currentUser) return;
    if (currentUser.balanceTND < 1) {
      alert("Minimum balance required to start a game is 1.00 TND");
      return;
    }
    setSelectedGame(game);
    const url = await gambllyApi.launchGame(game.id, currentUser.id, currentUser.username);
    setGameUrl(url);
  };

  // Auth Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />

        <div className="w-full max-w-md z-10">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="flex flex-col items-center mb-10">
              <div className="bg-yellow-500 p-4 rounded-3xl mb-4 shadow-2xl shadow-yellow-500/20 ring-4 ring-yellow-500/10">
                <ShieldAlert className="text-slate-950 h-8 w-8" />
              </div>
              <h1 className="text-5xl font-black text-white tracking-tighter mb-2 italic">GOBET</h1>
              <div className="h-1 w-20 bg-yellow-500 rounded-full mb-4" />
              <p className="text-slate-400 font-medium text-sm text-center uppercase tracking-widest">Global Betting Terminal</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Access ID</label>
                <div className="relative">
                   <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                   <input
                    type="text"
                    value={loginData.username}
                    onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-5 py-4 rounded-2xl outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-slate-600 font-medium"
                    placeholder="Username"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Security Key</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                   <input
                    type={showPassword ? "text" : "password"}
                    value={loginData.password}
                    onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                    className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-12 py-4 rounded-2xl outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all placeholder:text-slate-600 font-medium"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 animate-shake">
                   <div className="p-1 bg-red-500/20 rounded-lg"><ShieldAlert size={16} /></div> 
                   {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black py-5 rounded-2xl transition-all transform active:scale-[0.98] shadow-xl shadow-yellow-500/20 text-lg uppercase tracking-tight"
              >
                Sign In To Platform
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
              <p className="text-slate-500 text-[10px] leading-relaxed uppercase tracking-widest">
                This is a secure system authorized for registered users only.<br/> 
                Unauthorized access attempts are monitored and logged.
              </p>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-8 opacity-40">
             <div className="flex items-center gap-2 grayscale"><ShieldCheck size={16}/> SSL Secure</div>
             <div className="flex items-center gap-2 grayscale"><Activity size={16}/> 99.9% Uptime</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout user={currentUser} onLogout={handleLogout} activeTab={activeTab} setActiveTab={setActiveTab}>
      {/* Admin Interface */}
      {currentUser.role === UserRole.ADMIN && (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Platform Users', value: users.length, sub: `${users.filter(u => u.status === 'active').length} Active`, icon: Users, color: 'blue' },
                  { label: 'Total TND Float', value: users.reduce((acc, u) => acc + u.balanceTND, 0).toLocaleString(), sub: 'In circulation', icon: Wallet, color: 'yellow' },
                  { label: 'Volume (24h)', value: transactions.filter(tx => tx.timestamp.startsWith(new Date().toISOString().split('T')[0])).length, sub: 'Transactions today', icon: TrendingUp, color: 'green' },
                  { label: 'System Health', value: 'OPTIMAL', sub: 'Gamblly API Connected', icon: ShieldCheck, color: 'purple' },
                ].map((stat, i) => (
                  <div key={i} className="group bg-slate-900 border border-slate-800 p-8 rounded-[2rem] hover:border-yellow-500/30 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-all`}>
                        <stat.icon size={28} />
                      </div>
                    </div>
                    <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</h3>
                    <p className="text-3xl font-black text-white mt-1 tracking-tighter">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-2 font-medium">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black flex items-center gap-3">
                      <Activity size={24} className="text-yellow-500" /> TRANSACTION HISTORY
                    </h3>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transactions.slice(0, 15).reverse()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="timestamp" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                        <Tooltip 
                          cursor={{ fill: '#ffffff05' }}
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', color: '#fff' }} 
                        />
                        <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={30}>
                          {transactions.slice(0, 15).reverse().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.type === 'deposit' || entry.type === 'win' ? '#22c55e' : '#ef4444'} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black">PLAYER FLOW</h3>
                    <button onClick={() => setActiveTab('users')} className="text-xs font-bold text-yellow-500 hover:text-yellow-400 uppercase tracking-widest">View All</button>
                  </div>
                  <div className="space-y-5 overflow-y-auto flex-1 pr-2">
                    {users.filter(u => u.role === UserRole.PLAYER).sort((a,b) => b.balanceTND - a.balanceTND).slice(0, 8).map(u => (
                      <div key={u.id} className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-2xl border border-slate-800/50 hover:border-slate-700 transition-all group">
                        <div className="w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-lg font-black uppercase text-slate-300 group-hover:bg-yellow-500 group-hover:text-slate-950 transition-all">
                          {u.username[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-white truncate">{u.username}</p>
                          <p className="text-xs text-slate-500 font-mono">{u.balanceTND.toFixed(2)} TND</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${u.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]'}`} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Filter by name or ID..."
                    className="w-full bg-slate-900 border border-slate-800 text-white pl-12 pr-4 py-4 rounded-2xl outline-none focus:border-yellow-500 transition-all font-medium"
                  />
                </div>
                <button 
                  onClick={() => setShowAddUser(true)}
                  className="w-full md:w-auto bg-yellow-500 text-slate-950 font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
                >
                  <UserPlus size={20} /> NEW TERMINAL ACCOUNT
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/50 border-b border-slate-800">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Credential Profile</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Role</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">TND Balance</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Terminal Status</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Operational Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-slate-800/30 transition-all group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:text-yellow-500 transition-all">
                                  {u.username[0].toUpperCase()}
                               </div>
                               <div>
                                  <p className="text-white font-black text-lg">{u.username}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">UID: {u.id}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest ${
                              u.role === UserRole.ADMIN ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-white font-mono font-black text-lg">{u.balanceTND.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                              u.status === 'active' ? 'text-green-500' : 'text-slate-500'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-green-500' : 'bg-slate-600'}`} />
                              {u.status}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex items-center justify-end gap-2">
                               {u.role === UserRole.PLAYER && (
                                  <>
                                    <button 
                                      onClick={() => setShowBalanceModal({ userId: u.id, type: 'add' })}
                                      className="p-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-all" title="Add TND">
                                      <Plus size={18} />
                                    </button>
                                    <button 
                                      onClick={() => setShowBalanceModal({ userId: u.id, type: 'remove' })}
                                      className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all" title="Deduct TND">
                                      <Minus size={18} />
                                    </button>
                                  </>
                               )}
                               <button 
                                onClick={() => toggleUserStatus(u.id)}
                                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                  u.status === 'active' ? 'bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-500' : 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-slate-950'
                                }`}>
                                 {u.status === 'active' ? 'Disable' : 'Enable Access'}
                               </button>
                             </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/50 border-b border-slate-800">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Operation Type</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Account Destination</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Volume (TND)</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Description</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-all">
                          <td className="px-8 py-5">
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${tx.type === 'deposit' || tx.type === 'win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {tx.type === 'deposit' || tx.type === 'win' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                </div>
                                <span className="capitalize font-black text-white text-sm">{tx.type}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5 text-slate-400 text-sm font-mono">{tx.userId}</td>
                          <td className={`px-8 py-5 font-black text-lg ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-8 py-5 text-slate-500 text-xs font-medium">{tx.description}</td>
                          <td className="px-8 py-5 text-slate-500 text-xs font-mono">{new Date(tx.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/50 border-b border-slate-800">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Method</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">API Endpoint</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status Code</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Origin User</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Server Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {apiLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-800/30 font-mono text-xs">
                          <td className="px-8 py-5"><span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded font-black">{log.method}</span></td>
                          <td className="px-8 py-5 text-slate-300 font-medium">{log.endpoint}</td>
                          <td className="px-8 py-5">
                            <span className={`px-2 py-1 rounded font-black ${log.status >= 400 ? 'text-red-500 bg-red-500/10' : 'text-green-500 bg-green-500/10'}`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-slate-500">{log.userId}</td>
                          <td className="px-8 py-5 text-slate-500 text-right">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            </div>
          )}
        </div>
      )}

      {/* Player Interface */}
      {currentUser.role === UserRole.PLAYER && (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'lobby' && (
            <div className="space-y-12">
              <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-800 p-12 h-64 flex flex-col justify-center shadow-2xl shadow-yellow-500/20 group">
                  <div className="z-10 relative">
                     <div className="flex items-center gap-3 mb-4">
                        <div className="bg-slate-950 p-2 rounded-xl text-yellow-500 animate-bounce">
                           <Trophy size={24} />
                        </div>
                        <span className="text-slate-950 font-black uppercase tracking-[0.3em] text-sm">Official Platform</span>
                     </div>
                     <h2 className="text-6xl font-black text-slate-950 uppercase italic tracking-tighter leading-none mb-4">WINNING SEASON IS HERE</h2>
                     <p className="text-slate-950/80 font-black text-xl tracking-tight">Premium games powered by Gamblly Engine. Ready for play?</p>
                  </div>
                  <div className="absolute right-[-5%] top-[-10%] opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                     <ShieldCheck size={400} />
                  </div>
              </div>

              <div>
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                  <h3 className="text-3xl font-black flex items-center gap-4 italic tracking-tight">
                    <Gamepad2 className="text-yellow-500" size={32} /> FEATURED LOBBY
                  </h3>
                  <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl overflow-x-auto max-w-full">
                    {['Top Picks', 'Slots', 'Live Casino', 'Crash', 'Table Games'].map((t, i) => (
                      <button key={t} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                        i === 0 ? 'bg-yellow-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'
                      }`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingGames ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-slate-900 border border-slate-800 rounded-[2rem] animate-pulse" />
                      ))}
                   </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
                    {games.map(game => (
                      <div 
                        key={game.id} 
                        onClick={() => launchGameSession(game)}
                        className="group bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 hover:border-yellow-500 hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500 cursor-pointer relative"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden">
                          <img src={game.image} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-90 group-hover:opacity-100" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-slate-950/40 backdrop-blur-[2px]">
                             <div className="bg-yellow-500 text-slate-950 p-6 rounded-full shadow-2xl transform scale-50 group-hover:scale-100 transition-all duration-500">
                               <Play fill="currentColor" size={32} />
                             </div>
                          </div>
                          <div className="absolute top-4 right-4 bg-yellow-500 text-slate-950 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-xl">
                            {game.type}
                          </div>
                        </div>
                        <div className="p-6">
                          <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-1">{game.provider}</p>
                          <h4 className="text-base font-black text-white truncate leading-tight">{game.name}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
             <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-800/50 border-b border-slate-800">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Game Action</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount (TND)</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Internal Hash</th>
                        <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Server Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {transactions.filter(tx => tx.userId === currentUser.id).map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-800/30 transition-all">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${tx.type === 'deposit' || tx.type === 'win' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {tx.type === 'deposit' || tx.type === 'win' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                                </div>
                                <span className="capitalize font-black text-white">{tx.type}</span>
                             </div>
                          </td>
                          <td className={`px-8 py-6 font-black text-xl ${tx.type === 'deposit' || tx.type === 'win' ? 'text-green-500' : 'text-red-500'}`}>
                            {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-8 py-6 text-slate-500 text-xs font-mono">{tx.description}</td>
                          <td className="px-8 py-6 text-slate-500 text-xs font-mono">{new Date(tx.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {transactions.filter(tx => tx.userId === currentUser.id).length === 0 && (
                   <div className="p-20 text-center flex flex-col items-center gap-4">
                      <div className="bg-slate-800/50 p-6 rounded-full text-slate-600"><History size={48} /></div>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No transaction history detected</p>
                   </div>
                )}
             </div>
          )}

          {activeTab === 'profile' && (
             <div className="max-w-2xl mx-auto space-y-8">
                <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-1000" />
                   <div className="w-28 h-28 bg-yellow-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-yellow-500/20 group-hover:rotate-6 transition-all">
                      <Wallet size={56} className="text-yellow-500" />
                   </div>
                   <h3 className="text-5xl font-black text-white tracking-tighter mb-2 italic">{currentUser.balanceTND.toLocaleString(undefined, { minimumFractionDigits: 2 })} TND</h3>
                   <p className="text-slate-500 uppercase tracking-[0.3em] text-[10px] font-black mb-10">Secured Virtual Vault Balance</p>
                   
                   <div className="grid grid-cols-2 gap-6">
                      <div className="bg-slate-800/30 p-6 rounded-[2rem] border border-slate-800/50">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Platform Rank</p>
                         <p className="text-xl font-black text-yellow-500">PLATINUM</p>
                      </div>
                      <div className="bg-slate-800/30 p-6 rounded-[2rem] border border-slate-800/50">
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Safety Score</p>
                         <p className="text-xl font-black text-green-500">100/100</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-10 rounded-[2.5rem] space-y-6 shadow-sm">
                   <h4 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-3">
                      <Settings className="text-yellow-500" size={18} /> SECURITY COMPLIANCE
                   </h4>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-5 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                        <div>
                            <p className="text-sm font-black text-slate-300">Biometric Auth</p>
                            <p className="text-[10px] text-slate-500 font-medium">Secondary verification enabled</p>
                        </div>
                        <span className="bg-green-500 text-slate-950 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">ACTIVE</span>
                      </div>
                      <div className="flex justify-between items-center p-5 bg-slate-800/30 rounded-2xl border border-slate-800/50">
                        <div>
                            <p className="text-sm font-black text-slate-300">TND Float Lock</p>
                            <p className="text-[10px] text-slate-500 font-medium">Administrator approval required</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">PROTECTED</span>
                      </div>
                   </div>
                </div>
             </div>
          )}
        </div>
      )}

      {/* Game Modal / Full Screen Session */}
      {selectedGame && (
        <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col animate-in fade-in zoom-in-95 duration-300">
           <div className="h-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-yellow-500 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-yellow-500/20">
                    <Play size={20} fill="currentColor" />
                 </div>
                 <div>
                    <h2 className="text-white font-black text-lg tracking-tight leading-none mb-1">{selectedGame.name}</h2>
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">{selectedGame.provider} Engine</p>
                 </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="bg-slate-950 px-5 py-2 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Wallet</span>
                    <span className="text-yellow-500 font-mono font-black text-lg">{currentUser.balanceTND.toFixed(2)} <span className="text-xs">TND</span></span>
                 </div>
                 <button 
                  onClick={() => { setSelectedGame(null); setGameUrl(null); }}
                  className="p-3 hover:bg-red-500 hover:text-white rounded-2xl transition-all text-slate-500 group">
                  <X size={28} className="group-hover:rotate-90 transition-all duration-300" />
                 </button>
              </div>
           </div>
           <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
              {gameUrl ? (
                <iframe 
                  className="w-full h-full border-none z-10" 
                  title="Game Session"
                  src={gameUrl}
                />
              ) : (
                <div className="text-center space-y-8 max-w-lg p-12 z-20 relative">
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-[60px] animate-pulse" />
                    <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl relative">
                        <RefreshCw size={64} className="text-yellow-500 animate-spin" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-white italic mb-2">INITIALIZING SECURE TUNNEL</h2>
                    <p className="text-slate-500 font-medium uppercase tracking-[0.2em] text-xs">Connecting to Gamblly Provider Node...</p>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 w-1/2 animate-[loading_1.5s_ease-in-out_infinite] rounded-full" />
                  </div>
                  
                  <div className="bg-yellow-500/5 border border-yellow-500/10 p-6 rounded-3xl">
                     <p className="text-yellow-500 text-xs font-black uppercase tracking-widest mb-4">Simulation Control (Demo Only)</p>
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => updateBalance(currentUser.id, 10, 'bet')}
                          className="bg-red-500/20 text-red-500 border border-red-500/30 font-black py-4 rounded-2xl text-xs hover:bg-red-500 hover:text-white transition-all">
                          SIMULATE BET (-10)
                        </button>
                        <button 
                          onClick={() => updateBalance(currentUser.id, 25, 'win')}
                          className="bg-green-500/20 text-green-500 border border-green-500/30 font-black py-4 rounded-2xl text-xs hover:bg-green-500 hover:text-white transition-all">
                          SIMULATE WIN (+25)
                        </button>
                     </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* Global Modals */}
      {showAddUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[3rem] p-10 shadow-2xl shadow-black/50">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black uppercase tracking-tight italic">NEW TERMINAL</h3>
                 <button onClick={() => setShowAddUser(false)} className="p-2 text-slate-500 hover:text-white transition-all"><X size={28} /></button>
              </div>
              <form onSubmit={(e) => {
                 e.preventDefault();
                 const fd = new FormData(e.currentTarget);
                 createAccount(fd.get('username') as string, fd.get('password') as string, fd.get('role') as UserRole);
              }} className="space-y-6">
                 <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Access Identity</label>
                    <input name="username" required className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-yellow-500 transition-all" placeholder="username_p" />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Security Key</label>
                    <input name="password" type="password" required className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-yellow-500 transition-all" placeholder="••••••••" />
                 </div>
                 <div>
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3 px-1">Operation Role</label>
                    <select name="role" className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:border-yellow-500 transition-all appearance-none cursor-pointer">
                       <option value={UserRole.PLAYER}>PLAYER (Standard)</option>
                       <option value={UserRole.ADMIN}>ADMIN (Operational Control)</option>
                       <option value={UserRole.MERCHANT}>MERCHANT (Agent)</option>
                    </select>
                 </div>
                 <button type="submit" className="w-full bg-yellow-500 text-slate-950 font-black py-5 rounded-2xl mt-4 shadow-xl shadow-yellow-500/10 text-lg uppercase">INITIALIZE ACCOUNT</button>
              </form>
           </div>
        </div>
      )}

      {showBalanceModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-[3rem] p-12 shadow-2xl text-center relative overflow-hidden">
              <div className="mb-8">
                 <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl ${showBalanceModal.type === 'add' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {showBalanceModal.type === 'add' ? <Plus size={40} /> : <Minus size={40} />}
                 </div>
                 <h3 className="text-2xl font-black uppercase tracking-tight italic">{showBalanceModal.type === 'add' ? 'DEPOSIT TND' : 'WITHDRAW TND'}</h3>
                 <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Target Terminal: {showBalanceModal.userId}</p>
              </div>
              <div className="space-y-6">
                 <div className="relative">
                    <input 
                      type="number" 
                      value={balanceAmount}
                      onChange={e => setBalanceAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl px-6 py-5 text-white text-3xl font-black text-center outline-none focus:border-yellow-500 transition-all"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 font-black text-xs">TND</div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setShowBalanceModal(null)} className="py-4 px-6 rounded-2xl bg-slate-800 text-slate-400 font-black uppercase tracking-widest text-xs hover:bg-slate-700 transition-all">Cancel</button>
                    <button 
                      onClick={() => updateBalance(showBalanceModal.userId, Number(balanceAmount), showBalanceModal.type === 'add' ? 'deposit' : 'withdrawal')}
                      className={`py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all ${showBalanceModal.type === 'add' ? 'bg-green-500 text-slate-950 shadow-green-500/10' : 'bg-red-500 text-white shadow-red-500/10'}`}>
                      Confirm Tx
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </Layout>
  );
};

export default App;
