
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
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
            <BrainCircuit size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Phân tích & Tư vấn</h3>
            <p className="text-sm text-gray-500">Phân tích chuyên sâu dựa trên dữ liệu ngân quỹ của bạn</p>
          </div>
        </div>
        <button 
          onClick={fetchAdvice}
          disabled={loading}
          className="flex items-center space-x-2 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới</span>
        </button>
      </div>

      <div className="p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 space-y-4">
            <Loader2 size={48} className="animate-spin text-indigo-500" />
            <p className="text-lg font-medium">Đang phân tích dữ liệu...</p>
          </div>
        ) : advice ? (
          <div className="prose prose-indigo max-w-none">
            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 p-6 rounded-2xl shadow-inner mb-6 flex items-start space-x-4">
              <Sparkles className="text-amber-400 mt-1 shrink-0" />
              <div className="text-gray-800 leading-relaxed text-lg italic">
                {advice.split('\n').map((line, i) => (
                  <p key={i} className="mb-4">{line}</p>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Không có dữ liệu phân tích.</p>
        )}
      </div>

      <div className="bg-gray-50 p-6 border-t border-gray-100">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Lưu ý bảo mật</h4>
        <p className="text-xs text-gray-500 leading-relaxed">
          AI Phân tích sử dụng mô hình ngôn ngữ lớn để đưa ra gợi ý dựa trên dữ liệu số liệu. Kết quả chỉ mang tính chất tham khảo và không thay thế cho các quyết định tài chính chính thức của nhóm. Toàn bộ dữ liệu được bảo mật và chỉ dùng để tạo phản hồi cho bạn.
        </p>
      </div>
    </div>
  );
};

export default AIInsights;
