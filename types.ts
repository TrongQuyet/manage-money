
export enum MemberRole {
  ADMIN = 'Admin',
  TREASURER = 'Thủ quỹ',
  MEMBER = 'Thành viên',
  OBSERVER = 'Quan sát viên'
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: MemberRole;
  note: string;
  joinedAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  recipient: string;
  date: string;
  memberId: string;
}

export interface User {
  id: string;
  user_name: string;
  password?: string;
}

export interface AppState {
  members: Member[];
  transactions: Transaction[];
  currentBalance: number;
}
