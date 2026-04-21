
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
  onDeleteTransaction: (id: string) => void;
  isAdmin: boolean;
}

const TransactionManagement: React.FC<Props> = ({ state, onAddTransaction, onUpdateTransaction, onDeleteTransaction, isAdmin }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newTx, setNewTx] = useState({
    type: 'INCOME' as TransactionType,
    amount: 0,
    description: '',
    category: CATEGORIES.INCOME[0],
    recipient: '',
    date: new Date().toISOString().split('T')[0],
    memberId: state.members[0]?.id || ''
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
      category: CATEGORIES[type][0]
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900">Lịch sử giao dịch Trùm A9</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm mô tả, danh mục, tên..."
              className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-64 text-sm shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin ? (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-5 py-2.5 rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 font-bold"
            >
              <PlusCircle size={18} />
              <span className="whitespace-nowrap">Tạo giao dịch</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 text-sm font-bold bg-amber-50 px-4 py-2.5 rounded-2xl border border-amber-100">
              <ShieldAlert size={16} />
              <span className="whitespace-nowrap">Chỉ xem</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Phân loại</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Nội dung / Ngày</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Đối tượng</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Số tiền</th>
                <th className="px-6 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...filteredTransactions].reverse().map((tx) => {
                const member = state.members.find(m => m.id === tx.memberId);
                return (
                  <tr 
                    key={tx.id} 
                    className="hover:bg-slate-50 transition-all cursor-pointer group"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {tx.type === 'INCOME' ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors leading-snug">{tx.description}</p>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                            {new Date(tx.date).toLocaleDateString('vi-VN')}
                          </span>
                          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                          <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {tx.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0 border border-slate-200">
                            {member?.name ? member.name.charAt(0) : '?'}
                          </div>
                          <span className="text-xs font-bold text-gray-700">{member?.name || 'Ẩn danh'}</span>
                        </div>
                        {tx.recipient && (
                          <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg w-fit border border-blue-100">
                            <UserCheck size={11} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{tx.recipient}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={`px-6 py-4 font-black whitespace-nowrap text-base ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end space-x-1">
                        <button onClick={() => setSelectedTx(tx)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Xem chi tiết"><Eye size={18} /></button>
                        {isAdmin && (
                          <>
                            <button onClick={() => setEditingTx(tx)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Sửa"><Edit2 size={18} /></button>
                            <button onClick={() => setDeletingTxId(tx.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Xóa"><Trash2 size={18} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredTransactions.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-24 text-center text-gray-400 italic font-medium">Không tìm thấy giao dịch nào phù hợp.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
          {/* Transaction Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header section - Optimized to be sleek without extra gaps */}
            <div className={`pt-10 pb-8 px-8 ${selectedTx.type === 'INCOME' ? 'bg-emerald-600' : 'bg-red-600'} text-white text-center relative`}>
              <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90"
              >
                <X size={20} />
              </button>
              <div className="inline-flex p-4 bg-white/15 backdrop-blur-md rounded-3xl mb-4 border border-white/20 shadow-xl">
                {selectedTx.type === 'INCOME' ? <ArrowUpCircle size={40} /> : <ArrowDownCircle size={40} />}
              </div>
              <h3 className="text-4xl font-black tracking-tight">{selectedTx.type === 'INCOME' ? '+' : '-'}{selectedTx.amount.toLocaleString('vi-VN')} đ</h3>
              <p className="text-white/80 font-bold uppercase tracking-widest text-xs mt-2">{selectedTx.category}</p>
            </div>
            
            <div className="p-8 space-y-6 bg-white">
              <div className="grid grid-cols-1 gap-5">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100"><Calendar size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Thời gian</p>
                    <p className="text-gray-900 font-bold">{new Date(selectedTx.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100"><FileText size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Nội dung</p>
                    <p className="text-gray-900 font-semibold leading-relaxed">{selectedTx.description}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100"><User size={18} /></div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Người thực hiện</p>
                    <p className="text-gray-900 font-semibold">
                      {state.members.find(m => m.id === selectedTx.memberId)?.name || 'Ẩn danh'}
                    </p>
                  </div>
                </div>

                {selectedTx.recipient && (
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 bg-gray-50 rounded-xl text-gray-400 border border-gray-100"><UserCheck size={18} /></div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Người thụ hưởng</p>
                      <p className="text-emerald-600 font-bold">{selectedTx.recipient}</p>
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setSelectedTx(null)}
                className={`w-full py-4 text-white font-black rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 ${selectedTx.type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}
              >
                Hoàn tất xem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 bg-emerald-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-emerald-900 uppercase tracking-tight">Thêm giao dịch mới</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-emerald-100 rounded-full transition-colors text-emerald-600"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
              <div className="flex p-1 bg-gray-100 rounded-2xl">
                <button type="button" onClick={() => handleTypeChange('INCOME')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${newTx.type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400'}`}>THU NHẬP (+)</button>
                <button type="button" onClick={() => handleTypeChange('EXPENSE')} className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${newTx.type === 'EXPENSE' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}>CHI TIÊU (-)</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Số tiền (VND)</label>
                  <input required type="number" className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-bold" value={newTx.amount} onChange={(e) => setNewTx({...newTx, amount: Number(e.target.value)})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Ngày</label>
                  <input required type="date" className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" value={newTx.date} onChange={(e) => setNewTx({...newTx, date: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Danh mục</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none appearance-none font-medium" value={newTx.category} onChange={(e) => setNewTx({...newTx, category: e.target.value})}>
                  {CATEGORIES[newTx.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Mô tả nội dung</label>
                <input required type="text" placeholder="Ví dụ: Đóng quỹ tháng 5..." className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none" value={newTx.description} onChange={(e) => setNewTx({...newTx, description: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Người nộp/chi</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none appearance-none" value={newTx.memberId} onChange={(e) => setNewTx({...newTx, memberId: e.target.value})}>
                    {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Người hưởng</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none appearance-none" value={newTx.recipient} onChange={(e) => setNewTx({...newTx, recipient: e.target.value})}>
                    <option value="">-- Không chọn --</option>
                    {state.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors border border-transparent">Hủy</button>
                <button type="submit" className={`flex-1 py-3.5 text-white font-black rounded-2xl transition-all shadow-lg ${newTx.type === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'}`}>LƯU GIAO DỊCH</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 border-b border-gray-100 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-900">Sửa giao dịch</h3>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Số tiền (VND)</label>
                  <input required type="number" className="w-full px-4 py-3 border border-gray-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold" value={editingTx.amount} onChange={(e) => setEditingTx({...editingTx, amount: Number(e.target.value)})}/>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ngày</label>
                  <input required type="date" className="w-full px-4 py-3 border border-gray-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingTx.date} onChange={(e) => setEditingTx({...editingTx, date: e.target.value})}/>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Danh mục</label>
                <select className="w-full px-4 py-3 border border-gray-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingTx.category} onChange={(e) => setEditingTx({...editingTx, category: e.target.value})}>
                  {CATEGORIES[editingTx.type].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mô tả</label>
                <input required type="text" className="w-full px-4 py-3 border border-gray-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingTx.description} onChange={(e) => setEditingTx({...editingTx, description: e.target.value})}/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Người thực hiện</label>
                  <select className="w-full px-4 py-3 border border-gray-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={editingTx.memberId} onChange={(e) => setEditingTx({...editingTx, memberId: e.target.value})}>
                    {state.members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Người hưởng</label>
                  <select className="w-full px-4 py-3 border border-gray-100 bg-slate-50 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none" value={editingTx.recipient} onChange={(e) => setEditingTx({...editingTx, recipient: e.target.value})}>
                    <option value="">-- Không chọn --</option>
                    {state.members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex space-x-3 pt-6">
                <button type="button" onClick={() => setEditingTx(null)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-blue-100">LƯU THAY ĐỔI</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingTxId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={40} /></div>
              <h3 className="text-2xl font-black text-gray-900 uppercase">Xóa giao dịch?</h3>
              <p className="text-gray-500 mt-3 font-medium">Hành động này sẽ thay đổi số dư quỹ ngay lập tức. Bạn có chắc chắn muốn xóa?</p>
            </div>
            <div className="p-8 bg-gray-50/50 flex gap-4">
              <button onClick={() => setDeletingTxId(null)} className="flex-1 py-3.5 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors">Hủy</button>
              <button onClick={() => { onDeleteTransaction(deletingTxId); setDeletingTxId(null); }} className="flex-1 py-3.5 bg-red-600 text-white font-black rounded-2xl transition-all shadow-lg shadow-red-100">XÓA NGAY</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionManagement;
