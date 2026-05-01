import React, { useState, useEffect, useCallback } from 'react';
import { ClipboardList, ChevronLeft, ChevronRight, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import * as api from '../services/apiService';
import type { AuditLog } from '../services/apiService';

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  UPDATE: 'bg-amber-50 text-amber-600 border-amber-100',
  DELETE: 'bg-red-50 text-red-600 border-red-100',
};

const ACTION_LABEL: Record<string, string> = {
  CREATE: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
};

interface Props {
  orgSlug: string;
}

const PAGE_SIZE = 20;

const DiffCell: React.FC<{ label: string; value: Record<string, unknown> | null | undefined }> = ({ label, value }) => {
  const [open, setOpen] = useState(false);
  if (!value) return <span className="text-gray-300">–</span>;
  const entries = Object.entries(value).filter(([k]) => !['member', 'category', 'organization', 'createdAt', 'updatedAt'].includes(k));
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium"
      >
        {label}
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
      {open && (
        <div className="mt-1.5 bg-gray-50 rounded-lg p-2 text-xs text-gray-600 space-y-0.5 border border-gray-100 max-w-xs">
          {entries.map(([k, v]) => (
            <div key={k} className="flex gap-1.5">
              <span className="text-gray-400 shrink-0">{k}:</span>
              <span className="truncate font-mono">{String(v ?? '–')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AuditLogs: React.FC<Props> = ({ orgSlug }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    const res = await api.getAuditLogs(orgSlug, p, PAGE_SIZE);
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
          <h2 className="text-xl font-bold text-gray-900">Audit Log</h2>
          <p className="text-sm text-gray-400 mt-0.5">Lịch sử thay đổi dữ liệu quan trọng</p>
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
            <ClipboardList size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-400 text-sm">Chưa có thay đổi nào được ghi lại</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Thời gian</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Người dùng</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Hành động</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Bảng / ID</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trước</th>
                  <th className="text-left px-5 py-3.5 text-[11px] font-bold text-gray-400 uppercase tracking-widest">Sau</th>
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
                        {ACTION_LABEL[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 font-mono text-xs">
                      {log.tableName} <span className="text-gray-400">#{log.recordId}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <DiffCell label="Xem" value={log.oldValues} />
                    </td>
                    <td className="px-5 py-3.5">
                      <DiffCell label="Xem" value={log.newValues} />
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

export default AuditLogs;
