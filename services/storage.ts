
import { User, UserRole, Transaction, ApiLog } from '../types';

const INITIAL_USERS: User[] = [
  {
    id: 'admin-1',
    username: 'admin',
    password: 'admin123',
    role: UserRole.ADMIN,
    balanceTND: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'player-1',
    username: 'demo_player',
    password: 'password123',
    role: UserRole.PLAYER,
    balanceTND: 1000,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export const storage = {
  getUsers: (): User[] => {
    const data = localStorage.getItem('gobet_users');
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: User[]) => {
    localStorage.setItem('gobet_users', JSON.stringify(users));
  },
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem('gobet_transactions');
    return data ? JSON.parse(data) : [];
  },
  saveTransactions: (txs: Transaction[]) => {
    localStorage.setItem('gobet_transactions', JSON.stringify(txs));
  },
  getApiLogs: (): ApiLog[] => {
    const data = localStorage.getItem('gobet_apilogs');
    return data ? JSON.parse(data) : [];
  },
  saveApiLogs: (logs: ApiLog[]) => {
    localStorage.setItem('gobet_apilogs', JSON.stringify(logs));
  },
  addApiLog: (log: Omit<ApiLog, 'id' | 'timestamp'>) => {
    const logs = storage.getApiLogs();
    const newLog: ApiLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    storage.saveApiLogs([newLog, ...logs].slice(0, 100)); // Keep last 100
  }
};
