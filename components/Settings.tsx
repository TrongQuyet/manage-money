
import React, { useState } from 'react';
import { AppState, Category } from '../types';
import * as api from '../services/apiService';
import { Tag, Plus, Trash2, RefreshCw, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Props {
  binId: string;       // orgId
  setBinId: (id: string) => void;
  state: AppState;
}

const Settings: React.FC<Props> = ({ binId: orgId, state }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'INCOME' | 'EXPENSE'>('INCOME');
  const [categories, setCategories] = useState<Category[]>(state.categories);

  const incomeCategories = categories.filter(c => c.type === 'INCOME');
  const expenseCategories = categories.filter(c => c.type === 'EXPENSE');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || !orgId) return;
    setIsProcessing(true);
    const created = await api.createCategory(orgId, newCatName.trim(), newCatType);
    if (created) {
      setCategories(prev => [...prev, created]);
      setNewCatName('');
    }
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (!orgId) return;
    if (!confirm('Xóa danh mục này? Các giao dịch đã liên kết sẽ không bị xóa.')) return;
    setIsProcessing(true);
    const ok = await api.deleteCategory(orgId, id);
    if (ok) setCategories(prev => prev.filter(c => c.id !== id));
    setIsProcessing(false);
  };

  const handleSeedDefaults = async () => {
    if (!orgId) return;
    setIsProcessing(true);
    const seeded = await api.seedCategories(orgId);
    if (seeded.length > 0) {
      const existing = new Set(categories.map(c => c.id));
      const newOnes = seeded.filter(c => !existing.has(c.id));
      setCategories(prev => [...prev, ...newOnes]);
    }
    setIsProcessing(false);
  };

  const CategoryList = ({ items, type }: { items: Category[]; type: 'INCOME' | 'EXPENSE' }) => (
    <div className="space-y-2">
      {items.length === 0 && (
        <p className="text-gray-400 text-sm italic px-2">Chưa có danh mục nào.</p>
      )}
      {items.map(cat => (
        <div key={cat.id} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${type === 'INCOME' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-2">
            {type === 'INCOME'
              ? <ArrowUpCircle size={14} className="text-emerald-600" />
              : <ArrowDownCircle size={14} className="text-red-600" />}
            <span className={`text-sm font-semibold ${type === 'INCOME' ? 'text-emerald-800' : 'text-red-800'}`}>
              {cat.name}
            </span>
            {cat.isDefault && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase">mặc định</span>
            )}
          </div>
          <button
            onClick={() => handleDelete(cat.id)}
            disabled={isProcessing}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Add new category */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Tag size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Quản lý danh mục</h3>
        </div>

        <form onSubmit={handleAdd} className="flex gap-3 mb-6">
          <select
            value={newCatType}
            onChange={(e) => setNewCatType(e.target.value as 'INCOME' | 'EXPENSE')}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="INCOME">Thu nhập</option>
            <option value="EXPENSE">Chi tiêu</option>
          </select>
          <input
            type="text"
            placeholder="Tên danh mục mới..."
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
          <button
            type="submit"
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm disabled:opacity-50"
          >
            <Plus size={16} /> Thêm
          </button>
        </form>

        <button
          onClick={handleSeedDefaults}
          disabled={isProcessing}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
          Khôi phục danh mục mặc định
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-emerald-700 uppercase tracking-widest mb-3">
              <ArrowUpCircle size={14} /> Thu nhập ({incomeCategories.length})
            </h4>
            <CategoryList items={incomeCategories} type="INCOME" />
          </div>
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-red-700 uppercase tracking-widest mb-3">
              <ArrowDownCircle size={14} /> Chi tiêu ({expenseCategories.length})
            </h4>
            <CategoryList items={expenseCategories} type="EXPENSE" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
