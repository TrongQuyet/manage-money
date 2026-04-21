
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart as RePieChart, Pie
} from 'recharts';
import { Transaction, AppState } from '../types';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, X, Calendar, FileText, User, UserCheck, CreditCard, Users, Heart } from 'lucide-react';
import logo from "../Assets/a9pro.jpg";

interface Props {
  state: AppState;
}

const Dashboard: React.FC<Props> = ({ state }) => {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const totalIncome = state.transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const totalExpense = state.transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const pieData = [
    { name: 'Thu nhập', value: totalIncome, color: '#10b981' },
    { name: 'Chi tiêu', value: totalExpense, color: '#ef4444' }
  ];

  const recentTransactions = [...state.transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <>
    <div className="space-y-6">
      {/* Group Banner Section */}
      <div className="relative h-64 md:h-80 w-full rounded-[32px] overflow-hidden shadow-2xl shadow-emerald-100/50 group border-4 border-white">
        <img 
          src={logo}
          alt="A9 Group" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-8 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Official Group</span>
              <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">Since 2021</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter drop-shadow-lg">
              Trùm A9
            </h1>
            <p className="text-emerald-300 font-bold text-sm md:text-base flex items-center gap-2">
              <Heart size={16} className="fill-emerald-500 text-emerald-500" /> 
              Gắn kết anh em - Vững bền ngân quỹ
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20">
             <div className="text-right">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Thành viên</p>
                <p className="text-xl font-black text-white">{state.members.length}</p>
             </div>
             <div className="w-px h-8 bg-white/20"></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Hoạt động</p>
                <p className="text-xl font-black text-white">{state.transactions.length}</p>
             </div>
          </div>
        </div>
      </div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-50 p-3 rounded-xl">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Số dư hiện tại</p>
            <h3 className="text-2xl font-bold text-gray-900">{state.currentBalance.toLocaleString('vi-VN')} đ</h3>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-emerald-50 p-3 rounded-xl">
            <ArrowUpCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng thu</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalIncome.toLocaleString('vi-VN')} đ</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-red-50 p-3 rounded-xl">
            <ArrowDownCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Tổng chi</p>
            <h3 className="text-2xl font-bold text-gray-900">{totalExpense.toLocaleString('vi-VN')} đ</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold mb-6">Phân bổ Ngân quỹ</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-8 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity with Detail View Capability */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-lg font-semibold mb-6">Giao dịch gần đây</h4>
          <div className="space-y-4">
            {recentTransactions.map((tx) => (
              <div 
                key={tx.id} 
                onClick={() => setSelectedTx(tx)}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-gray-100"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'INCOME' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{tx.description}</p>
                    <p className="text-xs text-gray-400 font-medium">{new Date(tx.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <p className={`text-base font-bold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                </p>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <p className="text-center text-gray-500 py-12 italic">Chưa có giao dịch nào.</p>
            )}
          </div>
        </div>
      </div>
    </div>

          {/* Transaction Detail Modal for Dashboard - Optimized Layout */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
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
            
            <div className="p-8 space-y-6">
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
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
