
import React, { useState, useEffect } from 'react';
import { AppState } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { BrainCircuit, Loader2, Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  state: AppState;
}

const AIInsights: React.FC<Props> = ({ state }) => {
  const [advice, setAdvice] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(state);
    setAdvice(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="px-7 pt-7 pb-6 bg-gradient-to-br from-indigo-900 to-violet-900 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/15 p-2.5 rounded-xl border border-white/20">
            <BrainCircuit size={22} className="text-indigo-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Phân tích & Tư vấn</h3>
            <p className="text-indigo-300 text-xs mt-0.5">Phân tích chuyên sâu dựa trên dữ liệu ngân quỹ</p>
          </div>
        </div>
        <button
          onClick={fetchAdvice}
          disabled={loading}
          className="flex items-center space-x-2 text-indigo-200 hover:bg-white/10 px-3.5 py-2 rounded-xl transition-all disabled:opacity-50 border border-white/10 text-sm font-medium active:scale-95"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="p-7">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 space-y-5 animate-fade-in">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-indigo-500" />
              </div>
              <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-100 animate-ping" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-semibold">Đang phân tích dữ liệu...</p>
              <p className="text-gray-400 text-sm mt-1">AI đang xử lý thông tin ngân quỹ</p>
            </div>
          </div>
        )}
        {!loading && advice && (
          <div className="animate-fade-in">
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50/30 border border-indigo-100 p-6 rounded-2xl flex items-start space-x-4">
              <div className="p-2 bg-amber-100 rounded-xl shrink-0 mt-0.5">
                <Sparkles size={18} className="text-amber-500" />
              </div>
              <div className="text-gray-700 leading-relaxed text-sm space-y-3">
                {advice.split('\n').filter(l => l.trim()).map((line) => (
                  <p key={line.slice(0, 40)}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
        {!loading && !advice && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <BrainCircuit size={40} className="mb-3 opacity-20" />
            <p className="text-sm">Không có dữ liệu phân tích.</p>
          </div>
        )}
      </div>

      <div className="bg-slate-50 px-7 py-5 border-t border-gray-100">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Lưu ý bảo mật</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          AI Phân tích sử dụng mô hình ngôn ngữ lớn để đưa ra gợi ý dựa trên dữ liệu số liệu. Kết quả chỉ mang tính chất tham khảo và không thay thế cho các quyết định tài chính chính thức của nhóm.
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
