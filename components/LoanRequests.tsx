
import React, { useState, useEffect, useCallback } from 'react';
import { LoanRequest, LoanRequestStatus, TransferRequest } from '../types';
import { LoanRequestDetail } from '../services/apiService';
import {
  PlusCircle, X, CheckCircle2, XCircle, Clock, ThumbsUp, ThumbsDown,
  ChevronDown, ChevronUp, Banknote, History, AlertTriangle, Loader2,
} from 'lucide-react';
import Pagination from './Pagination';
import * as api from '../services/apiService';

const PAGE_SIZE = 10;

const STATUS_LABEL: Record<LoanRequestStatus, string> = {
  PENDING_ADMIN: 'Chờ admin duyệt',
  PENDING_VOTES: 'Đang bỏ phiếu',
  APPROVED: 'Đã duyệt',
  REJECTED_BY_ADMIN: 'Admin từ chối',
  REJECTED_BY_VOTE: 'Không đủ phiếu',
};

const STATUS_COLOR: Record<LoanRequestStatus, string> = {
  PENDING_ADMIN: 'bg-yellow-100 text-yellow-700',
  PENDING_VOTES: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-emerald-100 text-emerald-700',
  REJECTED_BY_ADMIN: 'bg-red-100 text-red-600',
  REJECTED_BY_VOTE: 'bg-red-100 text-red-600',
};

const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';
const fmtDate = (s: string) => new Date(s).toLocaleDateString('vi-VN');

interface Props {
  orgSlug: string;
  isAdmin: boolean;
  myMemberId: number | null;
}

const LoanRequests: React.FC<Props> = ({ orgSlug, isAdmin, myMemberId }) => {
  const [tab, setTab] = useState<'requests' | 'transfers'>('requests');
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [fetching, setFetching] = useState(false);

  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [transferTotal, setTransferTotal] = useState(0);
  const [transferPage, setTransferPage] = useState(1);
  const [fetchingTransfers, setFetchingTransfers] = useState(false);

  const [detail, setDetail] = useState<LoanRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ amount: '', reason: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const [reviewForm, setReviewForm] = useState({ note: '' });
  const [reviewing, setReviewing] = useState(false);

  const [voteNote, setVoteNote] = useState('');
  const [voting, setVoting] = useState(false);

  const [completingId, setCompletingId] = useState<number | null>(null);

  const fetchRequests = useCallback(() => {
    if (!orgSlug) return;
    setFetching(true);
    api.getLoanRequests(orgSlug, { page, limit: PAGE_SIZE })
      .then(res => { setRequests(res.data); setTotal(res.total); })
      .finally(() => setFetching(false));
  }, [orgSlug, page]);

  const fetchTransfers = useCallback(() => {
    if (!orgSlug || !isAdmin) return;
    setFetchingTransfers(true);
    api.getTransferRequests(orgSlug, { page: transferPage, limit: PAGE_SIZE })
      .then(res => { setTransfers(res.data); setTransferTotal(res.total); })
      .finally(() => setFetchingTransfers(false));
  }, [orgSlug, isAdmin, transferPage]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { if (tab === 'transfers') fetchTransfers(); }, [tab, fetchTransfers]);

  const openDetail = async (id: number) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    const res = await api.getLoanRequest(orgSlug, id);
    setDetail(res);
    setDetailLoading(false);
  };

  const closeDetail = () => {
    setShowDetailModal(false);
    setDetail(null);
    setReviewForm({ note: '' });
    setVoteNote('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    const amount = Number(createForm.amount);
    if (!amount || amount <= 0) { setCreateError('Số tiền không hợp lệ'); return; }
    if (createForm.reason.trim().length < 10) { setCreateError('Lý do cần ít nhất 10 ký tự'); return; }
    setCreating(true);
    const res = await api.createLoanRequest(orgSlug, { amount, reason: createForm.reason.trim() });
    setCreating(false);
    if (res) {
      setShowCreateModal(false);
      setCreateForm({ amount: '', reason: '' });
      fetchRequests();
    } else {
      setCreateError('Không thể tạo yêu cầu. Có thể bạn đang có yêu cầu chưa xử lý.');
    }
  };

  const handleAdminReview = async (approve: boolean) => {
    if (!detail) return;
    setReviewing(true);
    const res = await api.adminReviewLoanRequest(orgSlug, detail.id, { approve, note: reviewForm.note || undefined });
    setReviewing(false);
    if (res) {
      closeDetail();
      fetchRequests();
    }
  };

  const handleVote = async (approve: boolean) => {
    if (!detail) return;
    setVoting(true);
    const res = await api.voteLoanRequest(orgSlug, detail.id, { approve, note: voteNote || undefined });
    setVoting(false);
    if (res) {
      closeDetail();
      fetchRequests();
    }
  };

  const handleCompleteTransfer = async (transferId: number) => {
    setCompletingId(transferId);
    await api.completeTransferRequest(orgSlug, transferId);
    setCompletingId(null);
    fetchTransfers();
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const transferTotalPages = Math.ceil(transferTotal / PAGE_SIZE);

  const canVote =
    detail?.status === 'PENDING_VOTES' &&
    myMemberId !== null &&
    myMemberId !== detail.memberId &&
    !detail.votes.some(v => v.memberId === myMemberId);

  const approveCount = detail?.votes.filter(v => v.approve).length ?? 0;
  const rejectCount = detail?.votes.filter(v => !v.approve).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Vay quỹ</h2>
          <p className="text-sm text-gray-400 mt-0.5">Yêu cầu vay từ quỹ tổ chức</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-emerald-200"
        >
          <PlusCircle size={16} />
          Tạo yêu cầu vay
        </button>
      </div>

      {/* Tabs (admin only sees transfers tab) */}
      {isAdmin && (
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {(['requests', 'transfers'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t === 'requests' ? 'Danh sách yêu cầu' : 'Yêu cầu chuyển tiền'}
            </button>
          ))}
        </div>
      )}

      {/* Requests list */}
      {tab === 'requests' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {fetching ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Banknote size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Chưa có yêu cầu vay nào</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Thành viên</th>
                    <th className="text-left px-5 py-3 font-semibold">Số tiền</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Lý do</th>
                    <th className="text-left px-5 py-3 font-semibold">Trạng thái</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Ngày tạo</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {requests.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{r.member?.name ?? `#${r.memberId}`}</td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-600">{fmt(Number(r.amount))}</td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell max-w-xs truncate">{r.reason}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[r.status]}`}>
                          {STATUS_LABEL[r.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">{fmtDate(r.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => openDetail(r.id)}
                          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      )}

      {/* Transfers list (admin only) */}
      {tab === 'transfers' && isAdmin && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {fetchingTransfers ? (
            <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
          ) : transfers.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CheckCircle2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Không có yêu cầu chuyển tiền nào</p>
            </div>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-semibold">Thành viên</th>
                    <th className="text-left px-5 py-3 font-semibold">Số tiền</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Lý do vay</th>
                    <th className="text-left px-5 py-3 font-semibold">Trạng thái</th>
                    <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Ngày tạo</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transfers.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{t.loanRequest?.member?.name ?? `#${t.loanRequestId}`}</td>
                      <td className="px-5 py-3.5 font-semibold text-emerald-600">{fmt(Number(t.amount))}</td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell max-w-xs truncate">{t.loanRequest?.reason}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {t.status === 'COMPLETED' ? 'Đã chuyển' : 'Chờ chuyển'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 hidden md:table-cell">{fmtDate(t.createdAt)}</td>
                      <td className="px-5 py-3.5 text-right">
                        {t.status === 'PENDING' && (
                          <button
                            onClick={() => handleCompleteTransfer(t.id)}
                            disabled={completingId === t.id}
                            className="text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60 flex items-center gap-1 ml-auto"
                          >
                            {completingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            Xác nhận đã chuyển
                          </button>
                        )}
                        {t.status === 'COMPLETED' && (
                          <span className="text-xs text-gray-400">{t.completedAt ? fmtDate(t.completedAt) : ''}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Pagination currentPage={transferPage} totalPages={transferTotalPages} onPageChange={setTransferPage} />
            </>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-lg">Tạo yêu cầu vay</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số tiền muốn vay (₫)</label>
                <input
                  type="number"
                  min={1}
                  value={createForm.amount}
                  onChange={e => setCreateForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  placeholder="Ví dụ: 500000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Lý do vay</label>
                <textarea
                  value={createForm.reason}
                  onChange={e => setCreateForm(p => ({ ...p, reason: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                  rows={4}
                  placeholder="Mô tả lý do vay (tối thiểu 10 ký tự)"
                  required
                />
              </div>
              {createError && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-xl">
                  <AlertTriangle size={14} />{createError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Hủy</button>
                <button type="submit" disabled={creating} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {creating && <Loader2 size={14} className="animate-spin" />}
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-bold text-gray-800 text-lg">Chi tiết yêu cầu vay</h3>
              <button onClick={closeDetail} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"><X size={18} /></button>
            </div>

            {detailLoading || !detail ? (
              <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-emerald-400" /></div>
            ) : (
              <div className="px-6 py-5 space-y-5">
                {/* Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Thành viên</p>
                    <p className="font-semibold text-gray-800">{detail.member?.name ?? `#${detail.memberId}`}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Số tiền</p>
                    <p className="font-semibold text-emerald-600">{fmt(Number(detail.amount))}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-400 mb-0.5">Lý do</p>
                    <p className="text-gray-700 text-sm leading-relaxed">{detail.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Trạng thái</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[detail.status]}`}>
                      {STATUS_LABEL[detail.status]}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Ngày tạo</p>
                    <p className="text-sm text-gray-600">{fmtDate(detail.createdAt)}</p>
                  </div>
                  {detail.adminNote && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400 mb-0.5">Ghi chú admin</p>
                      <p className="text-sm text-gray-600 italic">{detail.adminNote}</p>
                    </div>
                  )}
                </div>

                {/* Vote progress */}
                {(detail.status === 'PENDING_VOTES' || detail.status === 'APPROVED' || detail.status === 'REJECTED_BY_VOTE') && (
                  <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Kết quả bỏ phiếu</p>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm"><ThumbsUp size={14} />{approveCount} đồng ý</span>
                      <span className="flex items-center gap-1.5 text-red-500 font-semibold text-sm"><ThumbsDown size={14} />{rejectCount} từ chối</span>
                      <span className="text-gray-400 text-xs ml-auto">{detail.votes.length} / tổng phiếu</span>
                    </div>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-200">
                      {detail.votes.length > 0 && (
                        <>
                          <div className="bg-emerald-400 transition-all" style={{ width: `${(approveCount / detail.votes.length) * 100}%` }} />
                          <div className="bg-red-400 transition-all" style={{ width: `${(rejectCount / detail.votes.length) * 100}%` }} />
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Votes list */}
                {detail.votes.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phiếu bỏ</p>
                    <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                      {detail.votes.map(v => (
                        <div key={v.id} className="flex items-center gap-3 px-4 py-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${v.approve ? 'bg-emerald-100' : 'bg-red-100'}`}>
                            {v.approve ? <ThumbsUp size={12} className="text-emerald-600" /> : <ThumbsDown size={12} className="text-red-500" />}
                          </div>
                          <span className="text-sm font-medium text-gray-700 flex-1">{v.member?.name ?? `#${v.memberId}`}</span>
                          {v.note && <span className="text-xs text-gray-400 italic truncate max-w-[140px]">{v.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* History */}
                {detail.history.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><History size={12} />Lịch sử</p>
                    <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                      {detail.history.map(h => (
                        <div key={h.id} className="flex items-start gap-3 px-4 py-2.5">
                          <Clock size={12} className="text-gray-300 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-gray-600">{h.action.replace(/_/g, ' ')}</span>
                            {h.userName && <span className="text-xs text-gray-400"> — {h.userName}</span>}
                          </div>
                          <span className="text-xs text-gray-400 shrink-0">{fmtDate(h.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Admin review actions */}
                {isAdmin && detail.status === 'PENDING_ADMIN' && (
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Xét duyệt</p>
                    <textarea
                      value={reviewForm.note}
                      onChange={e => setReviewForm({ note: e.target.value })}
                      placeholder="Ghi chú (tuỳ chọn)"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAdminReview(false)}
                        disabled={reviewing}
                        className="flex-1 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {reviewing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleAdminReview(true)}
                        disabled={reviewing}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {reviewing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Duyệt
                      </button>
                    </div>
                  </div>
                )}

                {/* Member vote actions */}
                {canVote && (
                  <div className="border-t border-gray-100 pt-4 space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Bỏ phiếu của bạn</p>
                    <textarea
                      value={voteNote}
                      onChange={e => setVoteNote(e.target.value)}
                      placeholder="Ghi chú (tuỳ chọn)"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
                      rows={2}
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleVote(false)}
                        disabled={voting}
                        className="flex-1 py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {voting ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                        Không đồng ý
                      </button>
                      <button
                        onClick={() => handleVote(true)}
                        disabled={voting}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {voting ? <Loader2 size={14} className="animate-spin" /> : <ThumbsUp size={14} />}
                        Đồng ý
                      </button>
                    </div>
                  </div>
                )}

                {/* Already voted */}
                {detail.status === 'PENDING_VOTES' && myMemberId !== null && myMemberId !== detail.memberId &&
                  detail.votes.some(v => v.memberId === myMemberId) && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl">
                      <CheckCircle2 size={14} />
                      Bạn đã bỏ phiếu cho yêu cầu này
                    </div>
                  </div>
                )}

                {/* Requester can't vote */}
                {detail.status === 'PENDING_VOTES' && myMemberId === detail.memberId && (
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2.5 rounded-xl">
                      <Clock size={14} />
                      Đang chờ các thành viên bỏ phiếu...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanRequests;
