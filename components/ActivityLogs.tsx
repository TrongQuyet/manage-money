import React, { useState, useEffect, useCallback } from 'react';
import { Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import * as api from '../services/apiService';
import type { ActivityLog } from '../services/apiService';

const ACTION_LABELS: Record<string, string> = {
  LOGIN: 'Đăng nhập',
  LOGOUT: 'Đăng xuất',
  CREATE_TRANSACTION: 'Tạo giao dịch',
  UPDATE_TRANSACTION: 'Sửa giao dịch',
  DELETE_TRANSACTION: 'Xóa giao dịch',
  CREATE_MEMBER: 'Thêm thành viên',
  UPDATE_MEMBER: 'Sửa thành viên',
  DELETE_MEMBER: 'Xóa thành viên',
};

const ACTION_COLOR: Record<string, string> = {
  LOGIN: 'bg-blue-50 text-blue-600 border-blue-100',
  LOGOUT: 'bg-slate-50 text-slate-500 border-slate-200',
  CREATE_TRANSACTION: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  UPDATE_TRANSACTION: 'bg-amber-50 text-amber-600 border-amber-100',
  DELETE_TRANSACTION: 'bg-red-50 text-red-600 border-red-100',
  CREATE_MEMBER: 'bg-teal-50 text-teal-600 border-teal-100',
  UPDATE_MEMBER: 'bg-amber-50 text-amber-600 border-amber-100',
  DELETE_MEMBER: 'bg-red-50 text-red-600 border-red-100',
};

interface Props {
  orgSlug: string;
}

const PAGE_SIZE = 20;

const ActivityLogs: React.FC<Props> = ({ orgSlug }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const res = await api.getActivityLogs(orgSlug, p, PAGE_SIZE);
    setLogs(res.data);
    setTotal(res.total);
    setLoading(false);
  }, [orgSlug]);

  useEffect(() => { load(page); }, [load, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-400 mt-0.5">Lịch sử thao tác của quản trị viên</p>
        </div>
        <button
          onClick={() => load(page)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">Đang tải...</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Activity size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Chưa có hoạt động nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Thời gian</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Người dùng</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hành động</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Đối tượng</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-700">
                      {log.userName ?? `#${log.userId ?? '–'}`}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${ACTION_COLOR[log.action] ?? 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">
                      {log.entityType ? `${log.entityType}${log.entityId ? ` #${log.entityId}` : ''}` : '–'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 max-w-xs truncate">
                      {log.metadata ? JSON.stringify(log.metadata) : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
            <span className="text-xs text-gray-400">
              {total} bản ghi · Trang {page}/{totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
