
import React, { useState } from 'react';
import { API_CONFIG } from '../constants';
import { createBin, deleteBin } from '../services/apiService';
import { AppState } from '../types';
import { Database, Plus, Trash2, Key, Link } from 'lucide-react';

interface Props {
  binId: string;
  setBinId: (id: string) => void;
  state: AppState;
}

const Settings: React.FC<Props> = ({ binId, setBinId, state }) => {
  const [localBinId, setLocalBinId] = useState(binId);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpdateId = () => {
    setBinId(localBinId);
    alert('Đã cập nhật Bin ID!');
  };

  const handleCreateRemote = async () => {
    if (confirm('Bạn muốn tạo một Bin mới trên Cloud với dữ liệu hiện tại?')) {
      setIsProcessing(true);
      const newId = await createBin({
        members: state.members,
        transactions: state.transactions
      });
      if (newId) {
        setBinId(newId);
        setLocalBinId(newId);
        alert(`Đã tạo thành công Bin mới! ID: ${newId}`);
      } else {
        alert('Lỗi khi tạo Bin. Kiểm tra Master Key trong code.');
      }
      setIsProcessing(false);
    }
  };

  const handleDeleteRemote = async () => {
    if (!binId) return;
    if (confirm('CẢNH BÁO: Hành động này sẽ xóa vĩnh viễn dữ liệu trên Cloud. Bạn có chắc chắn?')) {
      setIsProcessing(true);
      const success = await deleteBin(binId);
      if (success) {
        setBinId('');
        setLocalBinId('');
        alert('Đã xóa Bin thành công!');
      } else {
        alert('Lỗi khi xóa Bin.');
      }
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <Database size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Kết nối Jsonbin.io</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Link size={14} /> Bin ID hiện tại
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                placeholder="Ví dụ: 64f123..."
                value={localBinId}
                onChange={(e) => setLocalBinId(e.target.value)}
              />
              <button 
                onClick={handleUpdateId}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors"
              >
                Cập nhật
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Dùng Bin ID có sẵn nếu bạn đã tạo trước đó.</p>
          </div>

          <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              disabled={isProcessing}
              onClick={handleCreateRemote}
              className="flex items-center justify-center space-x-2 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 hover:bg-emerald-100 transition-all font-semibold"
            >
              <Plus size={20} />
              <span>Tạo Bin Mới (POST)</span>
            </button>

            <button 
              disabled={isProcessing || !binId}
              onClick={handleDeleteRemote}
              className="flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 hover:bg-red-100 transition-all font-semibold disabled:opacity-50"
            >
              <Trash2 size={20} />
              <span>Xóa Bin (DELETE)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
        <h4 className="flex items-center gap-2 text-amber-800 font-bold mb-2">
          <Key size={18} /> Lưu ý cấu hình
        </h4>
        <ul className="text-sm text-amber-700 space-y-2 list-disc pl-5">
          <li>Đảm bảo <strong>API_CONFIG.MASTER_KEY</strong> trong file <code>constants.tsx</code> đã chính xác.</li>
          <li>Jsonbin.io yêu cầu Master Key để thực hiện các thao tác ghi (POST/PUT/DELETE).</li>
          <li>Mỗi lần "Tạo Bin Mới", server sẽ cấp một ID duy nhất. Hãy lưu lại ID này.</li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
