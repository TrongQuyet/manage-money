
import React from 'react';
import { 
  Users, 
  CreditCard, 
  PieChart, 
  LayoutDashboard, 
  Settings,
  BrainCircuit
} from 'lucide-react';
import { Member, Transaction } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'members', label: 'Thành viên', icon: <Users className="w-5 h-5" /> },
  { id: 'transactions', label: 'Giao dịch', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'reports', label: 'Báo cáo', icon: <PieChart className="w-5 h-5" /> },
  { id: 'ai-insights', label: 'AI Phân tích', icon: <BrainCircuit className="w-5 h-5" /> },
  { id: 'settings', label: 'Trạng thái API', icon: <Settings className="w-5 h-5" /> },
];

export const CATEGORIES = {
  INCOME: ['Đóng quỹ định kỳ', 'Đóng góp tự nguyện', 'Tiền lãi', 'Khác'],
  EXPENSE: ['Ăn uống', 'Dịch vụ', 'Sự kiện', 'Cơ sở vật chất', 'Từ thiện', 'Khác']
};

export const API_CONFIG = {
  MASTER_KEY: '$2a$10$.3/lYZ4z2aIuYmnsIy0v2OpD/NHbkR2WVOKDGiKCqMdt.ugJWR7oq',
  BASE_URL: 'https://api.jsonbin.io/v3/b',
  BIN_IDS: {
    MEMBERS: '6971f111d0ea881f407cb8fd',
    TRANSACTIONS: '6971f0e743b1c97be9414de0',
    USERS: '6971fcf6ae596e708fed410a'
  }
};

export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
