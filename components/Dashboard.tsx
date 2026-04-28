
import React, { useState } from 'react';
import {
  Tooltip, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie
} from 'recharts';
import { Transaction, AppState } from '../types';
import { ArrowUpCircle, ArrowDownCircle, TrendingUp, X, Calendar, FileText, User, UserCheck, CreditCard, Heart } from 'lucide-react';
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
      <div className="relative h-56 md:h-72 w-full rounded-3xl overflow-hidden shadow-2xl shadow-slate-200/60 group border-2 border-white/50 animate-fade-in">
        <img
          src={logo}
          alt="A9 Group"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-7 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/30">Official Group</span>
              <span className="bg-white/15 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-white/20">Since 2021</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter drop-shadow-lg">Trùm A9</h1>
            <p className="text-emerald-300 font-semibold text-sm flex items-center gap-1.5">
              <Heart size={14} className="fill-emerald-400 text-emerald-400" />
              Gắn kết anh em - Vững bền ngân quỹ
            </p>
          </div>
          <div className="hidden md:flex items-center gap-5 bg-white/10 backdrop-blur-xl px-5 py-4 rounded-2xl border border-white/15">
            <div className="text-center">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Thành viên</p>
              <p className="text-2xl font-black text-white">{state.members.length}</p>
            </div>
            <div className="w-px h-10 bg-white/15"></div>
            <div className="text-center">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">Giao dịch</p>
              <p className="text-2xl font-black text-white">{state.transactions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl shadow-lg shadow-emerald-200/50 text-white relative overflow-hidden card-hover animate-fade-in-up stagger-1">
          <div className="absolute -right-4 -top-4 opacity-10">
            <TrendingUp size={88} />
          </div>
          <div className="bg-white/20 p-2.5 rounded-xl w-fit mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-white/80">Số dư hiện tại</p>
          <h3 className="text-2xl font-black mt-1 tracking-tight">{state.currentBalance.toLocaleString('vi-VN')} đ</h3>
          <p className="text-[10px] text-white/50 mt-2 uppercase tracking-widest font-bold">Cập nhật real-time</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl shadow-lg shadow-blue-200/50 text-white relative overflow-hidden card-hover animate-fade-in-up stagger-2">
          <div className="absolute -right-4 -top-4 opacity-10">
            <ArrowUpCircle size={88} />
          </div>
          <div className="bg-white/20 p-2.5 rounded-xl w-fit mb-3">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-white/80">Tổng thu</p>
          <h3 className="text-2xl font-black mt-1 tracking-tight">{totalIncome.toLocaleString('vi-VN')} đ</h3>
          <p className="text-[10px] text-white/50 mt-2 uppercase tracking-widest font-bold">Tổng tiền vào quỹ</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-6 rounded-2xl shadow-lg shadow-red-200/50 text-white relative overflow-hidden card-hover animate-fade-in-up stagger-3">
          <div className="absolute -right-4 -top-4 opacity-10">
            <ArrowDownCircle size={88} />
          </div>
          <div className="bg-white/20 p-2.5 rounded-xl w-fit mb-3">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-white/80">Tổng chi</p>
          <h3 className="text-2xl font-black mt-1 tracking-tight">{totalExpense.toLocaleString('vi-VN')} đ</h3>
          <p className="text-[10px] text-white/50 mt-2 uppercase tracking-widest font-bold">Tổng tiền ra quỹ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/80 animate-fade-in-up stagger-4">
          <h4 className="text-base font-bold text-gray-800 mb-5">Phân bổ Ngân quỹ</h4>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={80}
                  paddingAngle={6}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value) => `${Number(value).toLocaleString('vi-VN')} đ`}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-8 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-500 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100/80 animate-fade-in-up stagger-5">
          <h4 className="text-base font-bold text-gray-800 mb-5">Giao dịch gần đây</h4>
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all cursor-pointer group border border-transparent hover:border-slate-100"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl flex items-center justify-center ${tx.type === 'INCOME' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    {tx.type === 'INCOME' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors leading-tight">{tx.description}</p>
                    <p className="text-[11px] text-gray-400 font-medium mt-0.5">{new Date(tx.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
                <p className={`text-sm font-black ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.type === 'INCOME' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                </p>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <CreditCard size={32} className="mb-3 opacity-30" />
                <p className="text-sm italic">Chưa có giao dịch nào.</p>
              </div>
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
