
import React, { useState } from 'react';
import { Member, MemberRole } from '../types';
import {
  Trash2, Edit2, Search, UserPlus, ShieldAlert,
  AlertTriangle, Phone, MapPin, Mail, Calendar, StickyNote, Eye, X
} from 'lucide-react';

interface Props {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id' | 'joinedAt'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  isAdmin: boolean;
  myMemberId?: string | null;
  onUpdateOwnMember?: (data: Pick<Member, 'id' | 'name' | 'email' | 'phone' | 'address'>) => void;
}

const MemberManagement: React.FC<Props> = ({ members, onAddMember, onUpdateMember, onDeleteMember, isAdmin, myMemberId, onUpdateOwnMember }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: MemberRole.MEMBER,
    note: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onAddMember(newMember);
    setNewMember({ name: '', email: '', phone: '', address: '', role: MemberRole.MEMBER, note: '' });
    setShowAddModal(false);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    const isSelf = editingMember.id === myMemberId;
    if (isSelf && onUpdateOwnMember) {
      onUpdateOwnMember({ id: editingMember.id, name: editingMember.name, email: editingMember.email, phone: editingMember.phone, address: editingMember.address });
    } else if (isAdmin) {
      onUpdateMember(editingMember);
    }
    setEditingMember(null);
  };

  const confirmDelete = () => {
    if (deletingMemberId) {
      onDeleteMember(deletingMemberId);
      setDeletingMemberId(null);
    }
  };

  const filteredMembers = members.filter(m => {
    const s = searchTerm.toLowerCase();
    return (
      (m.name?.toLowerCase() || '').includes(s) || 
      (m.email?.toLowerCase() || '').includes(s) || 
      (m.phone || '').includes(searchTerm)
    );
  });

  const inputCls = "w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm transition-all";
  const inputClsBlue = "w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-all";

  const roleBadgeCls = (role: MemberRole) => {
    if (role === MemberRole.ADMIN) return 'bg-purple-50 text-purple-600 border border-purple-200';
    if (role === MemberRole.TREASURER) return 'bg-amber-50 text-amber-600 border border-amber-200';
    return 'bg-emerald-50 text-emerald-600 border border-emerald-200';
  };
  const roleModalBadgeCls = (role: MemberRole) => {
    if (role === MemberRole.ADMIN) return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    if (role === MemberRole.TREASURER) return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Danh sách thành viên</h3>
          <p className="text-sm text-gray-400 mt-0.5">{filteredMembers.length} thành viên</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm tên, email, sđt..."
              className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent w-full md:w-56 text-sm shadow-sm transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 font-bold active:scale-95"
            >
              <UserPlus size={17} />
              <span className="whitespace-nowrap">Thêm thành viên</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-amber-600 text-sm font-semibold bg-amber-50 px-4 py-2.5 rounded-xl border border-amber-100">
              <ShieldAlert size={15} /> Chỉ xem
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[860px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Thông tin</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Liên lạc</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Địa chỉ</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Vai trò</th>
                <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                  onClick={() => setSelectedMember(member)}
                >
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                        {member.name ? member.name.charAt(0) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors leading-tight">{member.name}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                      <Phone size={12} className="text-gray-300"/> {member.phone || <span className="text-gray-300 italic text-xs">Chưa có</span>}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <p className="text-sm text-gray-500 line-clamp-1 max-w-[200px]">{member.address || <span className="text-gray-300">—</span>}</p>
                  </td>
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${roleBadgeCls(member.role)}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-1">
                      <button onClick={() => setSelectedMember(member)} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Xem chi tiết"><Eye size={16} /></button>
                      {(isAdmin || member.id === myMemberId) && (
                        <button onClick={() => setEditingMember(member)} className="p-2 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Sửa"><Edit2 size={16} /></button>
                      )}
                      {isAdmin && (
                        <button onClick={() => setDeletingMemberId(member.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Xóa"><Trash2 size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-400 text-sm">Không tìm thấy thành viên nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="relative px-8 pt-8 pb-7 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl font-black shadow-lg shadow-emerald-500/30">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                  <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold uppercase tracking-wider ${roleModalBadgeCls(selectedMember.role)}`}>{selectedMember.role}</span>
                </div>
              </div>
            </div>

            <div className="p-7 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: <Mail size={14} />, label: 'Email', value: selectedMember.email },
                  { icon: <Phone size={14} />, label: 'Điện thoại', value: selectedMember.phone || 'Chưa cập nhật' },
                  { icon: <Calendar size={14} />, label: 'Ngày gia nhập', value: new Date(selectedMember.joinedAt).toLocaleDateString('vi-VN') },
                ].map(item => (
                  <div key={item.label} className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">{item.icon}{item.label}</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{item.value}</p>
                  </div>
                ))}
                <div className="p-3 bg-slate-50 rounded-xl col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-1"><MapPin size={14} />Địa chỉ</p>
                  <p className="text-sm font-semibold text-gray-700">{selectedMember.address || 'Chưa cập nhật'}</p>
                </div>
              </div>
              {selectedMember.note && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><StickyNote size={14} />Ghi chú</p>
                  <p className="text-sm text-amber-800 italic">"{selectedMember.note}"</p>
                </div>
              )}
              <button
                onClick={() => setSelectedMember(null)}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 active:scale-95"
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
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-7 pt-7 pb-6 bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Thêm thành viên</h3>
                <p className="text-slate-400 text-xs mt-0.5">Điền đầy đủ thông tin thành viên mới</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl text-slate-400"><X size={18}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="add-name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Họ tên *</label>
                <input id="add-name" required type="text" className={inputCls} value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})}/>
              </div>
              <div>
                <label htmlFor="add-email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email *</label>
                <input id="add-email" required type="email" className={inputCls} value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})}/>
              </div>
              <div>
                <label htmlFor="add-phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Số điện thoại</label>
                <input id="add-phone" type="tel" className={inputCls} value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})}/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="add-address" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Địa chỉ</label>
                <input id="add-address" type="text" className={inputCls} value={newMember.address} onChange={(e) => setNewMember({...newMember, address: e.target.value})}/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="add-role" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vai trò</label>
                <select id="add-role" className={inputCls} value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value as MemberRole})}>
                  {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="add-note" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Ghi chú</label>
                <textarea id="add-note" className={inputCls} rows={2} value={newMember.note} onChange={(e) => setNewMember({...newMember, note: e.target.value})}></textarea>
              </div>
              <div className="md:col-span-2 flex space-x-3 pt-1">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-200 text-sm active:scale-95">Xác nhận thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-7 pt-7 pb-6 bg-gradient-to-br from-indigo-900 to-blue-900 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Chỉnh sửa thành viên</h3>
                <p className="text-indigo-300 text-xs mt-0.5">Cập nhật thông tin thành viên</p>
              </div>
              <button onClick={() => setEditingMember(null)} className="p-2 hover:bg-white/10 rounded-xl text-indigo-300"><X size={18}/></button>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-7 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="edit-name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Họ tên *</label>
                <input id="edit-name" required type="text" className={inputClsBlue} value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}/>
              </div>
              <div>
                <label htmlFor="edit-email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email *</label>
                <input id="edit-email" required type="email" className={inputClsBlue} value={editingMember.email} onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}/>
              </div>
              <div>
                <label htmlFor="edit-phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Số điện thoại</label>
                <input id="edit-phone" type="tel" className={inputClsBlue} value={editingMember.phone} onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}/>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="edit-address" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Địa chỉ</label>
                <input id="edit-address" type="text" className={inputClsBlue} value={editingMember.address} onChange={(e) => setEditingMember({...editingMember, address: e.target.value})}/>
              </div>
              {isAdmin && (
                <div>
                  <label htmlFor="edit-role" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Vai trò</label>
                  <select id="edit-role" className={inputClsBlue} value={editingMember.role} onChange={(e) => setEditingMember({...editingMember, role: e.target.value as MemberRole})}>
                    {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
              )}
              <div className="md:col-span-2 flex space-x-3 pt-1">
                <button type="button" onClick={() => setEditingMember(null)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy</button>
                <button type="submit" className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 text-sm active:scale-95">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingMemberId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-9 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                <AlertTriangle size={30} />
              </div>
              <h3 className="text-xl font-black text-gray-900">Xác nhận xóa?</h3>
              <p className="text-gray-400 text-sm mt-2 leading-relaxed">Xóa thành viên không ảnh hưởng lịch sử giao dịch nhưng bạn sẽ không thể chọn họ trong tương lai.</p>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={() => setDeletingMemberId(null)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy bỏ</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 text-sm active:scale-95">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
