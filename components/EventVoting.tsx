
import React, { useState, useEffect, useCallback } from 'react';
import { OrgEvent } from '../types';
import {
  PlusCircle, Edit2, Trash2, AlertTriangle, X, Calendar, MapPin,
  FileText, CheckCircle2, Clock, Lock, ChevronRight, Users
} from 'lucide-react';
import Pagination from './Pagination';
import * as api from '../services/apiService';

const PAGE_SIZE = 9;

interface Props {
  orgSlug: string;
  isAdmin: boolean;
  onPendingEventsChange?: (events: OrgEvent[]) => void;
}

const emptyForm = {
  title: '',
  description: '',
  location: '',
  rules: '',
  options: ['', ''],
  endDate: '',
};

const EventVoting: React.FC<Props> = ({ orgSlug, isAdmin, onPendingEventsChange }) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'CLOSED'>('ACTIVE');
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<OrgEvent | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [voting, setVoting] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const fetchEvents = useCallback(() => {
    if (!orgSlug) return;
    setIsFetching(true);
    api.getEvents(orgSlug, { page: currentPage, limit: PAGE_SIZE, status: activeTab })
      .then(res => { setEvents(res.data); setTotal(res.total); })
      .finally(() => setIsFetching(false));
  }, [orgSlug, activeTab, currentPage]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Notify parent about pending (ACTIVE + unvoted) events
  useEffect(() => {
    if (!onPendingEventsChange) return;
    if (activeTab === 'ACTIVE') {
      onPendingEventsChange(events.filter(e => e.status === 'ACTIVE' && !e.myVote));
    }
  }, [events, activeTab, onPendingEventsChange]);

  const openCreate = () => {
    setEditingEvent(null);
    setForm(emptyForm);
    setShowFormModal(true);
  };

  const openEdit = (event: OrgEvent) => {
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description ?? '',
      location: event.location ?? '',
      rules: event.rules ?? '',
      options: [...event.options],
      endDate: event.endDate ?? '',
    });
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedOptions = form.options.map(o => o.trim()).filter(Boolean);
    if (cleanedOptions.length < 2) return;
    setSaving(true);
    const payload = { ...form, options: cleanedOptions };
    if (editingEvent) {
      const updated = await api.updateEvent(orgSlug, editingEvent.id, payload);
      if (updated) {
        setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
        if (selectedEvent?.id === updated.id) setSelectedEvent(updated);
      }
    } else {
      const created = await api.createEvent(orgSlug, payload);
      if (created) fetchEvents();
    }
    setSaving(false);
    setShowFormModal(false);
  };

  const handleCloseEvent = async (event: OrgEvent) => {
    const updated = await api.updateEvent(orgSlug, event.id, { status: 'CLOSED' });
    if (updated) {
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      if (selectedEvent?.id === updated.id) setSelectedEvent(updated);
    }
  };

  const handleDelete = async () => {
    if (!deletingEventId) return;
    await api.deleteEvent(orgSlug, deletingEventId);
    setDeletingEventId(null);
    fetchEvents();
  };

  const handleVote = async (eventId: number, option: string) => {
    setVoting(true);
    const updated = await api.submitVote(orgSlug, eventId, option);
    if (updated) {
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      setSelectedEvent(updated);
    }
    setVoting(false);
  };

  const handleCancelVote = async (eventId: number) => {
    setVoting(true);
    const updated = await api.cancelVote(orgSlug, eventId);
    if (updated) {
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
      setSelectedEvent(updated);
    }
    setVoting(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const totalVotes = (event: OrgEvent) => Object.values(event.voteCount).reduce((a, b) => a + b, 0);
  const winnerOption = (event: OrgEvent) => {
    const entries = Object.entries(event.voteCount);
    if (!entries.length) return null;
    return entries.reduce((a, b) => b[1] > a[1] ? b : a)[0];
  };

  return (
    <>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Sự kiện & Bình chọn</h3>
            <p className="text-sm text-gray-400 mt-0.5">{total} sự kiện</p>
          </div>
          {isAdmin && (
            <button
              onClick={openCreate}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-200 font-bold active:scale-95"
            >
              <PlusCircle size={17} />
              <span className="whitespace-nowrap">Tạo sự kiện</span>
            </button>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-slate-100 rounded-xl w-fit">
          {([['ACTIVE', 'Đang diễn ra'], ['CLOSED', 'Lịch sử']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => { setActiveTab(val); setCurrentPage(1); }}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === val ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Events grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isFetching && events.length === 0 && (
            <div className="col-span-3 py-20 text-center text-gray-400 text-sm">Đang tải...</div>
          )}
          {events.map(event => {
            const count = totalVotes(event);
            const winner = winnerOption(event);
            return (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md hover:border-emerald-100 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${event.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                    {event.status === 'ACTIVE' ? <Clock size={10} /> : <Lock size={10} />}
                    {event.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
                  </span>
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                      <button onClick={() => openEdit(event)} className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                      {event.status === 'ACTIVE' && (
                        <button onClick={() => handleCloseEvent(event)} className="p-1.5 text-gray-300 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Đóng sự kiện"><Lock size={14} /></button>
                      )}
                      <button onClick={() => setDeletingEventId(event.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                    </div>
                  )}
                </div>

                <h4 className="font-bold text-gray-900 text-base leading-snug group-hover:text-emerald-700 transition-colors mb-2">{event.title}</h4>

                {event.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <MapPin size={11} />
                    <span className="truncate">{event.location}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Users size={11} />
                  <span>{count} lượt bình chọn</span>
                </div>

                {event.status === 'CLOSED' && winner && (
                  <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg mb-3">
                    <CheckCircle2 size={12} />
                    <span>Kết quả: <strong>{winner}</strong> ({event.voteCount[winner]} phiếu)</span>
                  </div>
                )}

                {event.myVote && event.status === 'ACTIVE' && (
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg mb-3">
                    <CheckCircle2 size={12} />
                    <span>Đã chọn: <strong>{event.myVote}</strong></span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-300 mt-auto pt-2 border-t border-gray-50">
                  <span>{new Date(event.createdAt).toLocaleDateString('vi-VN')}</span>
                  <ChevronRight size={14} className="group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            );
          })}
          {!isFetching && events.length === 0 && (
            <div className="col-span-3 py-20 text-center text-gray-400 text-sm">
              {activeTab === 'ACTIVE' ? 'Chưa có sự kiện nào đang diễn ra.' : 'Chưa có sự kiện nào trong lịch sử.'}
            </div>
          )}
        </div>

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {/* Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="px-7 pt-7 pb-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative shrink-0">
              <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 p-2 bg-white/15 hover:bg-white/25 rounded-xl transition-all"><X size={18} /></button>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${selectedEvent.status === 'ACTIVE' ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/15 text-gray-300'}`}>
                  {selectedEvent.status === 'ACTIVE' ? <Clock size={10} /> : <Lock size={10} />}
                  {selectedEvent.status === 'ACTIVE' ? 'Đang mở' : 'Đã đóng'}
                </span>
              </div>
              <h3 className="text-xl font-bold leading-snug">{selectedEvent.title}</h3>
              {selectedEvent.location && (
                <div className="flex items-center gap-1.5 text-slate-300 text-xs mt-1.5">
                  <MapPin size={11} /><span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-7 space-y-5">
              {/* Info fields */}
              {selectedEvent.description && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-gray-400 border border-gray-100 shadow-sm shrink-0"><FileText size={14} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Mô tả</p>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                </div>
              )}

              {selectedEvent.rules && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-gray-400 border border-gray-100 shadow-sm shrink-0"><FileText size={14} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Thể lệ</p>
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.rules}</p>
                  </div>
                </div>
              )}

              {selectedEvent.endDate && (
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="p-2 bg-white rounded-lg text-gray-400 border border-gray-100 shadow-sm shrink-0"><Calendar size={14} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Hạn bình chọn</p>
                    <p className="text-gray-700 text-sm font-semibold">{new Date(selectedEvent.endDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
              )}

              {/* Vote section */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Bình chọn · {totalVotes(selectedEvent)} phiếu
                </p>

                {selectedEvent.status === 'ACTIVE' && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedEvent.options.map(option => (
                      <button
                        key={option}
                        disabled={voting}
                        onClick={() => selectedEvent.myVote === option ? handleCancelVote(selectedEvent.id) : handleVote(selectedEvent.id, option)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-60 border-2 ${
                          selectedEvent.myVote === option
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600'
                        }`}
                      >
                        {selectedEvent.myVote === option && <CheckCircle2 size={13} className="inline mr-1.5 -mt-0.5" />}
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Results bar chart */}
                <div className="space-y-2">
                  {selectedEvent.options.map(option => {
                    const count = selectedEvent.voteCount[option] ?? 0;
                    const total = totalVotes(selectedEvent);
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isWinner = selectedEvent.status === 'CLOSED' && option === winnerOption(selectedEvent);
                    return (
                      <div key={option} className={`p-3 rounded-xl border transition-all ${isWinner ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-transparent'}`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`text-sm font-semibold ${isWinner ? 'text-emerald-700' : 'text-gray-700'}`}>
                            {isWinner && <CheckCircle2 size={13} className="inline mr-1.5 -mt-0.5 text-emerald-500" />}
                            {option}
                          </span>
                          <span className={`text-xs font-bold ${isWinner ? 'text-emerald-600' : 'text-gray-400'}`}>{count} phiếu · {pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isWinner ? 'bg-emerald-500' : 'bg-slate-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedEvent.myVote && selectedEvent.status === 'ACTIVE' && (
                  <p className="text-xs text-gray-400 mt-3 text-center">Nhấn lại vào lựa chọn đã chọn để hủy bình chọn.</p>
                )}
              </div>
            </div>

            <div className="px-7 pb-7 shrink-0">
              <button
                onClick={() => setSelectedEvent(null)}
                className="w-full py-3.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in max-h-[90vh] flex flex-col">
            <div className={`px-7 pt-7 pb-6 flex items-center justify-between shrink-0 ${editingEvent ? 'bg-gradient-to-br from-indigo-900 to-blue-900' : 'bg-gradient-to-br from-slate-900 to-slate-800'}`}>
              <div>
                <h3 className="text-lg font-bold text-white">{editingEvent ? 'Sửa sự kiện' : 'Tạo sự kiện mới'}</h3>
                <p className={`text-xs mt-0.5 ${editingEvent ? 'text-indigo-300' : 'text-slate-400'}`}>Điền thông tin sự kiện bên dưới</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/60"><X size={18} /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="flex-1 min-h-0 overflow-y-auto p-7 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Tên sự kiện *</label>
                <input required type="text" placeholder="Ví dụ: Tiệc cuối năm 2025..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Địa điểm</label>
                  <input type="text" placeholder="Nhà hàng, địa chỉ..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Hạn bình chọn</label>
                  <input type="date" className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Mô tả</label>
                <textarea rows={2} placeholder="Mô tả ngắn về sự kiện..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Thể lệ / Ghi chú</label>
                <textarea rows={2} placeholder="Quy định, thể lệ tham gia..." className="w-full px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm resize-none" value={form.rules} onChange={e => setForm({ ...form, rules: e.target.value })} />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Lựa chọn bình chọn * (tối thiểu 2)</label>
                <div className="space-y-2">
                  {form.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        placeholder={`Lựa chọn ${i + 1}...`}
                        className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm"
                        value={opt}
                        onChange={e => {
                          const next = [...form.options];
                          next[i] = e.target.value;
                          setForm({ ...form, options: next });
                        }}
                      />
                      {form.options.length > 2 && (
                        <button type="button" onClick={() => setForm({ ...form, options: form.options.filter((_, j) => j !== i) })} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><X size={15} /></button>
                      )}
                    </div>
                  ))}
                  {form.options.length < 6 && (
                    <button type="button" onClick={() => setForm({ ...form, options: [...form.options, ''] })} className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:text-emerald-700 transition-colors px-1 py-1">
                      <PlusCircle size={14} /> Thêm lựa chọn
                    </button>
                  )}
                </div>
              </div>
              <div className="flex space-x-3 pt-2">
                <button type="button" onClick={() => setShowFormModal(false)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy</button>
                <button type="submit" disabled={saving} className={`flex-1 py-3 text-white font-bold rounded-xl transition-all shadow-lg text-sm active:scale-95 disabled:opacity-60 ${editingEvent ? 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 shadow-indigo-200' : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-200'}`}>
                  {saving ? 'Đang lưu...' : editingEvent ? 'Lưu thay đổi' : 'Tạo sự kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deletingEventId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-9 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-red-100">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-gray-900">Xóa sự kiện?</h3>
              <p className="text-gray-400 mt-2 text-sm leading-relaxed">Tất cả lượt bình chọn của sự kiện này cũng sẽ bị xóa. Hành động không thể hoàn tác.</p>
            </div>
            <div className="px-8 pb-8 flex gap-3">
              <button onClick={() => setDeletingEventId(null)} className="flex-1 py-3 text-gray-500 font-semibold hover:bg-slate-50 rounded-xl transition-colors border border-gray-200 text-sm">Hủy bỏ</button>
              <button onClick={handleDelete} className="flex-1 py-3 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-red-200 text-sm active:scale-95">Xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventVoting;
