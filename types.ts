
export enum UserRole {
  ADMIN = 'ADMIN',
  MERCHANT = 'MERCHANT',
  PLAYER = 'PLAYER'
}

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  balanceTND: number;
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'transfer';
  description: string;
  timestamp: string;
  performedBy: string;
}

export interface Game {
  id: string;
  name: string;
  provider: string;
  image: string;
  type: string;
}

export interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status: number;
  timestamp: string;
  userId: string;
}
