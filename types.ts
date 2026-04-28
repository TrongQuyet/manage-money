
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

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;       // display name
  categoryId?: string;    // UUID for API
  recipient: string;
  date: string;
  memberId: string;
}

export interface User {
  id: string;
  user_name: string;
  display_name?: string;
}

export interface Organization {
  id: string;
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
