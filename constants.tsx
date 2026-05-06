
import React from 'react';
import {
  Users,
  CreditCard,
  PieChart,
  LayoutDashboard,
  Settings,
  Disc3,
  Activity,
  ClipboardList,
  CalendarCheck,
  Banknote,
} from 'lucide-react';
import { Member, Transaction } from './types';

export const NAVIGATION_ITEMS = [
  { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'members', label: 'Thành viên', icon: <Users className="w-5 h-5" /> },
  { id: 'transactions', label: 'Giao dịch', icon: <CreditCard className="w-5 h-5" /> },
  { id: 'reports', label: 'Báo cáo', icon: <PieChart className="w-5 h-5" /> },
  { id: 'events', label: 'Sự kiện', icon: <CalendarCheck className="w-5 h-5" /> },
  { id: 'loan-requests', label: 'Vay quỹ', icon: <Banknote className="w-5 h-5" /> },
  { id: 'lucky-wheel', label: 'Vòng quay', icon: <Disc3 className="w-5 h-5" /> },
  { id: 'settings', label: 'Danh mục', icon: <Settings className="w-5 h-5" />, adminOnly: true },
  { id: 'activity-logs', label: 'Activity Log', icon: <Activity className="w-5 h-5" />, adminOnly: true },
  { id: 'audit-logs', label: 'Audit Log', icon: <ClipboardList className="w-5 h-5" />, adminOnly: true },
];

// Fallback categories (used until API categories are loaded)
export const CATEGORIES = {
  INCOME: ['Đóng quỹ định kỳ', 'Đóng góp tự nguyện', 'Tiền lãi', 'Khác'],
  EXPENSE: ['Ăn uống', 'Dịch vụ', 'Sự kiện', 'Cơ sở vật chất', 'Từ thiện', 'Khác']
};

// Dev: http://localhost:3334/api | Docker: /api (nginx proxy)
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3334/api';

export const INITIAL_MEMBERS: Member[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
