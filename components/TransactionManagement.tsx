
import React, { useState } from 'react';
import { Transaction, TransactionType, AppState } from '../types';
import { CATEGORIES } from '../constants';
import { 
  PlusCircle, ShieldAlert, Edit2, Trash2, UserCheck, AlertTriangle, 
  Eye, X, Calendar, Tag, FileText, User, CreditCard, ArrowUpCircle, ArrowDownCircle, Search
} from 'lucide-react';

interface Props {
  state: AppState;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: number) => void;
  isAdmin: boolean;
  availableCategories?: { INCOME: string[]; EXPENSE: string[] };
}

const TransactionManagement: React.FC<Props> = ({ state, onAddTransaction, onUpdateTransaction, onDeleteTransaction, isAdmin, availableCategories }) => {
  const CATS = availableCategories ?? CATEGORIES;
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTx, setNewTx] = useState({
    type: 'INCOME' as TransactionType,
    amount: 0,
    description: '',
    category: (availableCategories ?? CATEGORIES).INCOME[0],
    recipient: '',
    date: new Date().toISOString().split('T')[0],
    memberId: state.members[0]?.id ?? 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onAddTransaction(newTx);
    setNewTx({
      ...newTx,
      amount: 0,
      description: '',
      recipient: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddModal(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !editingTx) return;
    onUpdateTransaction(editingTx);
    setEditingTx(null);
  };

  const handleTypeChange = (type: TransactionType) => {
    setNewTx({
      ...newTx,
      type,
      category: CATS[type][0]
    });
  };

  const filteredTransactions = state.transactions.filter(tx => {
    const s = searchTerm.toLowerCase();
    const member = state.members.find(m => m.id === tx.memberId);
    return (
      tx.description.toLowerCase().includes(s) ||
      tx.category.toLowerCase().includes(s) ||
      (member?.name || '').toLowerCase().includes(s) ||
      (tx.recipient || '').toLowerCase().includes(s)
    );
  });

  return (
    <>
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Lịch sử giao dịch</h3>
          <p className="text-sm text-gray-400 mt-0.5">{filteredTransactions.length} giao dịch</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm mô tả, danh mục, tên..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-60 text-sm shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 font-bold active:scale-95"
            >
              <PlusCircle size={17} />
              <span className="whitespace-nowrap">Tạo giao dịch</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
              <ShieldAlert size={15} />
              <span className="whitespace-nowrap">Chỉ xem</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[860px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Loại</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Nội dung / Ngày</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Đối tượng</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Số tiền</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...filteredTransactions].reverse().map((tx) => {
                const member = state.members.find(m => m.id === tx.memberId);
                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {tx.type === 'INCOME' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors leading-snug">{tx.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium text-gray-400">
                            {new Date(tx.date).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tx.type === 'INCOME' ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'}`}>
                            {tx.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">
                            {member?.name ? member.name.charAt(0) : '?'}
                          </div>
                          <span className="text-xs font-semibold text-gray-600">{member?.name || 'Ẩn danh'}</span>
                        </div>
                        {tx.recipient && (
                          <div className="flex items-center space-x-1.5 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg w-fit border border-indigo-100">
                            <UserCheck size={10} />
                            <span className="text-[10px] font-bold">{tx.recipient}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-3.5 font-black whitespace-nowrap text-sm ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-1">
                        <button onClick={() => setSelectedTx(tx)} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Xem chi tiết"><Eye size={16} /></button>
                        {isAdmin && (
                          <>
                            <button onClick={() => setEditingTx(tx)} className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Sửa"><Edit2 size={16} /></button>
                            <button onClick={() => setDeletingTxId(tx.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xóa"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-sm">Không tìm thấy giao dịch nào phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
          {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className={`pt-9 pb-7 px-8 ${selectedTx.type === 'INCOME' ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white text-center relative`}>
              <button
                onClick={() => setSelectedTx(null)}
                className="absolute top-4 right-4 p-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all"
              >
                <X size={18} />
              </button>
              <div className="inline-flex p-3.5 bg-white/15 backdrop-blur-md rounded-2xl mb-4 border border-white/20">
                {selectedTx.type === 'INCOME' ? <ArrowUpCircle size={36} /> : <ArrowDownCircle size={36} />}
              </div>
              <h3 className="text-3xl font-black tracking-tight">{selectedTx.type === 'INCOME' ? '+' : '-'}{selectedTx.amount.toLocaleString('vi-VN')} đ</h3>
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-white/15 px-2.5 py-0.5 rounded-full">{selectedTx.category}</span>
            </div>

            <div className="p-7 space-y-4">
              {[
                { icon: <Calendar size={16} />, label: 'Thời gian', value: new Date(selectedTx.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: <FileText size={16} />, label: 'Nội dung', value: selectedTx.description },
                { icon: <User size={16} />, label: 'Người thực hiện', value: state.members.find(m => m.id === selectedTx.memberId)?.name || 'Ẩn danh' },
                ...(selectedTx.recipient ? [{ icon: <UserCheck size={16} />, label: 'Người thụ hưởng', value: selectedTx.recipient }] : []),
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-gray-400 border border-gray-100 shadow-sm shrink-0">{item.icon}</div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                    <p className="text-gray-800 font-semibold text-sm leading-snug">{item.value}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={() => setSelectedTx(null)}
                className={`w-full py-3.5 text-white font-bold rounded-xl transition-all shadow-lg active:scale-95 mt-2 ${selectedTx.type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200' : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-200'}`}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-7 pt-7 pb-6 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Thêm giao dịch mới</h3>
                <p className="text-slate-400 text-xs mt-0.5">Nhập thông tin giao dịch bên dưới</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button type="button" onClick={() => handleTypeChange('INCOME')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${newTx.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Thu nhập (+)</button>
                <button type="button" onClick={() => handleTypeChange('EXPENSE')} className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${newTx.type === 'EXPENSE' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>Chi tiêu (-)</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Số tiền (VND)</label>
                  <input required type="number" className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none font-semibold text-sm transition-all" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ngày</label>
                  <input required type="date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Danh mục</label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" value={newTx.category} onChange={(e) => setNewTx({...newTx, category: e.target.value})}>
                  {CATS[newTx.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mô tả nội dung</label>
                <input required type="text" placeholder="Ví dụ: Đóng quỹ tháng 5..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Người nộp/chi</label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" value={newTx.memberId} onChange={(e) => setNewTx({...newTx, memberId: e.target.value})}>
                    {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Người hưởng</label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all" value={newTx.recipient} onChange={(e) => setNewTx({...newTx, recipient: e.target.value})}>
                    <option value="">-- Không chọn --</option>
                    {state.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy</button>
                <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl transition-all shadow-lg text-sm active:scale-95 ${newTx.type === 'INCOME' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200' : 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 shadow-red-200'}`}>Lưu giao dịch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-7 pt-7 pb-6 bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Sửa giao dịch</h3>
                <p className="text-indigo-300 text-xs mt-0.5">Cập nhật thông tin giao dịch</p>
              </div>
              <button onClick={() => setEditingTx(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-indigo-300"><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-7 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Số tiền (VND)</label>
                  <input required type="number" className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-semibold text-sm transition-all" value={editingTx.amount} onChange={(e) => setEditingTx({...editingTx, amount: Number(e.target.value)})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ngày</label>
                  <input required type="date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all" value={editingTx.date} onChange={(e) => setEditingTx({...editingTx, date: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Danh mục</label>
                <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all" value={editingTx.category} onChange={(e) => setEditingTx({...editingTx, category: e.target.value})}>
                  {CATS[editingTx.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mô tả</label>
                <input required type="text" className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all" value={editingTx.description} onChange={(e) => setEditingTx({...editingTx, description: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Người thực hiện</label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all" value={editingTx.memberId} onChange={(e) => setEditingTx({...editingTx, memberId: e.target.value})}>
                    {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Người hưởng</label>
                  <select className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all" value={editingTx.recipient} onChange={(e) => setEditingTx({...editingTx, recipient: e.target.value})}>
                    <option value="">-- Không chọn --</option>
                    {state.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setEditingTx(null)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 text-sm active:scale-95">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingTxId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-9 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900">Xóa giao dịch?</h3>
              <p className="text-gray-400 mt-2 text-sm leading-relaxed">Hành động này sẽ thay đổi số dư quỹ ngay lập tức và không thể hoàn tác.</p>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={() => setDeletingTxId(null)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy bỏ</button>
              <button onClick={() => { onDeleteTransaction(deletingTxId); setDeletingTxId(null); }} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 text-sm active:scale-95">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionManagement;
