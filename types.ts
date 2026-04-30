
export enum MemberRole {
  ADMIN = 'Admin',
  TREASURER = 'Thủ quỹ',
  MEMBER = 'Thành viên',
  OBSERVER = 'Quan sát viên'
}

export interface Member {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: MemberRole;
  note: string;
  joinedAt: string;
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  isDefault: boolean;
}

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  categoryId?: number;
  recipient: string;
  date: string;
  memberId: number;
}

export interface User {
  id: number;
  user_name: string;
  display_name?: string;
}

export interface Organization {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface AppState {
  members: Member[];
  transactions: Transaction[];
  categories: Category[];
  currentBalance: number;
  orgId: string | null;
}

export type OrgSettings = Record<string, string>;
