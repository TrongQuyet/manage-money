
import React, { useState } from 'react';
import { Member, MemberRole } from '../types';
import { 
  PlusCircle, Trash2, Edit2, Search, UserPlus, ShieldAlert, 
  AlertTriangle, Phone, MapPin, Mail, Calendar, StickyNote, User, Eye, X
} from 'lucide-react';

interface Props {
  members: Member[];
  onAddMember: (member: Omit<Member, 'id' | 'joinedAt'>) => void;
  onUpdateMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  isAdmin: boolean;
}

const MemberManagement: React.FC<Props> = ({ members, onAddMember, onUpdateMember, onDeleteMember, isAdmin }) => {
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
    if (!isAdmin || !editingMember) return;
    onUpdateMember(editingMember);
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-gray-900">Danh sách thành viên Trùm A9</h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Tìm tên, email, sđt..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <UserPlus size={18} />
              <span className="whitespace-nowrap">Thêm thành viên</span>
            </button>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="px-6 py-2 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-amber-700 text-xs font-medium">
          <ShieldAlert size={14} />
          Chế độ xem: Chỉ Admin mới có quyền quản lý thành viên.
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Thông tin</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Liên lạc</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Địa chỉ</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Vai trò</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMembers.map((member) => (
              <tr 
                key={member.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">
                      {member.name ? member.name.charAt(0) : '?'}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                   <div className="flex flex-col text-sm text-gray-600">
                     <span className="flex items-center gap-1.5 font-medium"><Phone size={12} className="text-gray-400"/> {member.phone || 'Chưa có'}</span>
                   </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-600 line-clamp-1 max-w-[200px]" title={member.address}>
                    {member.address || '-'}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    member.role === MemberRole.ADMIN ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    member.role === MemberRole.TREASURER ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end space-x-1">
                    <button onClick={() => setSelectedMember(member)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Xem chi tiết"><Eye size={18} /></button>
                    {isAdmin && (
                      <>
                        <button onClick={() => setEditingMember(member)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Sửa"><Edit2 size={18} /></button>
                        <button onClick={() => setDeletingMemberId(member.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Xóa"><Trash2 size={18} /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">Không tìm thấy thành viên nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Member Detail Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative p-8 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
              <button 
                onClick={() => setSelectedMember(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/30">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                  <p className="text-emerald-100 font-medium flex items-center gap-1.5 mt-1">
                    <ShieldAlert size={14} /> {selectedMember.role}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail size={12} /> Email
                  </p>
                  <p className="text-gray-900 font-semibold">{selectedMember.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone size={12} /> Số điện thoại
                  </p>
                  <p className="text-gray-900 font-semibold">{selectedMember.phone || 'Chưa cập nhật'}</p>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} /> Địa chỉ
                  </p>
                  <p className="text-gray-900 font-semibold">{selectedMember.address || 'Chưa cập nhật'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> Ngày gia nhập
                  </p>
                  <p className="text-gray-900 font-semibold">
                    {new Date(selectedMember.joinedAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {selectedMember.note && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <StickyNote size={12} /> Ghi chú
                  </p>
                  <p className="text-sm text-gray-600 italic">"{selectedMember.note}"</p>
                </div>
              )}

              <button 
                onClick={() => setSelectedMember(null)}
                className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-emerald-50">
              <h3 className="text-xl font-bold text-emerald-900">Thêm thành viên Trùm A9</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Họ tên *</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email *</label>
                <input required type="email" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Số điện thoại</label>
                <input type="tel" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={newMember.phone} onChange={(e) => setNewMember({...newMember, phone: e.target.value})}/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Địa chỉ</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={newMember.address} onChange={(e) => setNewMember({...newMember, address: e.target.value})}/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vai trò</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value as MemberRole})}>
                  {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Ghi chú</label>
                <textarea className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none" rows={2} value={newMember.note} onChange={(e) => setNewMember({...newMember, note: e.target.value})}></textarea>
              </div>
              <div className="md:col-span-2 flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-emerald-600 text-white font-bold hover:bg-emerald-700 rounded-xl transition-colors">Xác nhận</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-blue-50">
              <h3 className="text-xl font-bold text-blue-900">Chỉnh sửa thành viên</h3>
            </div>
            <form onSubmit={handleUpdateSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Họ tên *</label>
                <input required type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingMember.name} onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email *</label>
                <input required type="email" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingMember.email} onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Số điện thoại</label>
                <input type="tel" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingMember.phone} onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Địa chỉ</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingMember.address} onChange={(e) => setEditingMember({...editingMember, address: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Vai trò</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={editingMember.role} onChange={(e) => setEditingMember({...editingMember, role: e.target.value as MemberRole})}>
                  {Object.values(MemberRole).map(role => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 flex space-x-3 pt-4">
                <button type="button" onClick={() => setEditingMember(null)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-colors">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingMemberId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
              <h3 className="text-xl font-bold text-gray-900">Xác nhận xóa</h3>
              <p className="text-gray-500 mt-2">Xóa thành viên này sẽ không ảnh hưởng đến lịch sử giao dịch nhưng bạn sẽ không thể chọn họ trong tương lai.</p>
            </div>
            <div className="p-6 bg-gray-50 flex gap-3">
              <button onClick={() => setDeletingMemberId(null)} className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors">Hủy</button>
              <button onClick={confirmDelete} className="flex-1 py-2 bg-red-600 text-white font-bold hover:bg-red-700 rounded-xl transition-colors shadow-lg">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;
