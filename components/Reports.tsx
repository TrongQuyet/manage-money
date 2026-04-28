
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart as RePieChart, Pie
} from 'recharts';
import { AppState } from '../types';
import { CreditCard, TrendingUp, TrendingDown, Target, Download } from 'lucide-react';

interface Props {
  state: AppState;
}

const Reports: React.FC<Props> = ({ state }) => {
  const { transactions, members, currentBalance } = state;

  // 1. Group by category (Expenses)
  const expenseByCategory = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const categoryData = Object.keys(expenseByCategory).map(key => ({
    name: key,
    value: expenseByCategory[key]
  }));

  // 2. Group by month (Income vs Expense)
  const monthlyDataMap = transactions.reduce((acc, curr) => {
    // Standardize month key: MM/YYYY
    const d = new Date(curr.date);
    const month = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    
    if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
    if (curr.type === 'INCOME') acc[month].income += curr.amount;
    else acc[month].expense += curr.amount;
    return acc;
  }, {} as Record<string, { month: string; income: number; expense: number }>);

  // Fix: Explicitly type sort parameters to avoid 'unknown' type error on month property access
  const monthlyData = Object.values(monthlyDataMap).sort((a: { month: string }, b: { month: string }) => {
    const [m1, y1] = a.month.split('/').map(Number);
    const [m2, y2] = b.month.split('/').map(Number);
    return y1 === y2 ? m1 - m2 : y1 - y2;
  });

  // 3. Spending & Income by Member
  const memberStats = members.map(m => {
    const memberTxs = transactions.filter(t => t.memberId === m.id);
    const income = memberTxs.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0);
    const expense = memberTxs.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0);
    return {
      name: m.name,
      income,
      expense,
      total: income - expense
    };
  }).filter(m => m.income > 0 || m.expense > 0);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#2dd4bf'];

  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number) => `${val.toLocaleString('vi-VN')} đ`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Báo cáo tài chính chi tiết</h3>
          <p className="text-sm text-gray-400 mt-0.5">Phân tích chuyên sâu về dòng tiền và đóng góp hội nhóm</p>
        </div>
        <button
          onClick={() => globalThis.print()}
          className="flex items-center justify-center space-x-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-600 hover:bg-slate-50 hover:border-gray-300 transition-all shadow-sm group active:scale-95"
        >
          <Download size={16} className="group-hover:translate-y-0.5 transition-transform" />
          <span className="font-semibold whitespace-nowrap text-sm">Xuất PDF</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5 rounded-2xl shadow-lg shadow-emerald-200/50 text-white relative overflow-hidden card-hover animate-fade-in-up stagger-1">
          <div className="absolute -right-3 -top-3 opacity-10"><TrendingUp size={72} /></div>
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3"><TrendingUp size={18} /></div>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1">Tổng thu quỹ</p>
          <p className="text-xl font-black leading-tight">{formatCurrency(totalIncome)}</p>
          <p className="text-[10px] text-white/50 mt-2 font-medium">100% dòng tiền vào</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-rose-600 p-5 rounded-2xl shadow-lg shadow-red-200/50 text-white relative overflow-hidden card-hover animate-fade-in-up stagger-2">
          <div className="absolute -right-3 -top-3 opacity-10"><TrendingDown size={72} /></div>
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3"><TrendingDown size={18} /></div>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1">Tổng chi tiêu</p>
          <p className="text-xl font-black leading-tight">{formatCurrency(totalExpense)}</p>
          <p className="text-[10px] text-white/50 mt-2 font-medium">Dòng tiền ra quỹ</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-5 rounded-2xl shadow-lg shadow-blue-200/50 text-white relative overflow-hidden card-hover animate-fade-in-up stagger-3">
          <div className="absolute -right-3 -top-3 opacity-10"><Target size={72} /></div>
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3"><Target size={18} /></div>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1">Tỷ lệ dư thừa</p>
          <p className="text-xl font-black leading-tight">{totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%</p>
          <p className="text-[10px] text-white/50 mt-2 font-medium">Sức khỏe tài chính</p>
        </div>

        <div className="bg-gradient-to-br from-violet-500 to-purple-600 p-5 rounded-2xl shadow-lg shadow-violet-200/50 text-white relative overflow-hidden card-hover animate-fade-in-up stagger-4">
          <div className="absolute -right-3 -top-3 opacity-10"><CreditCard size={72} /></div>
          <div className="bg-white/20 p-2 rounded-xl w-fit mb-3"><CreditCard size={18} /></div>
          <p className="text-[11px] font-bold text-white/70 uppercase tracking-widest mb-1">Số dư ròng</p>
          <p className="text-xl font-black leading-tight">{formatCurrency(currentBalance)}</p>
          <p className="text-[10px] text-white/50 mt-2 font-medium">Khả dụng hiện tại</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-base font-bold text-gray-800">Biểu đồ tăng trưởng quỹ</h4>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Thu
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Chi
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar name="Thu nhập" dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar name="Chi tiêu" dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Contribution Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-base font-bold text-gray-800 mb-6">Đóng góp theo thành viên</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberStats} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Bar name="Tổng đóng góp" dataKey="income" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-4 text-xs text-center text-gray-400 italic">Thống kê dựa trên tổng số tiền nạp quỹ của từng cá nhân</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (Pie) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <h4 className="text-base font-bold text-gray-800 mb-6">Cơ cấu chi tiêu</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 space-y-4">
            {categoryData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between text-sm group">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors whitespace-nowrap">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-xs whitespace-nowrap">{formatCurrency(item.value)}</span>
                  <span className="font-bold text-gray-900 w-12 text-right">
                    {((item.value / totalExpense) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Member Leaderboard / Table */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden">
          <h4 className="text-base font-bold text-gray-800 mb-5">Chi tiết hoạt động thành viên</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="bg-slate-50/80 rounded-xl">
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap rounded-l-xl">Thành viên</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-emerald-500 uppercase tracking-widest text-right whitespace-nowrap">Tổng đóng</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-red-400 uppercase tracking-widest text-right whitespace-nowrap">Tổng chi</th>
                  <th className="py-3 px-3 text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right whitespace-nowrap rounded-r-xl">Net</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {memberStats.sort((a, b) => b.income - a.income).map((stat) => (
                  <tr key={stat.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {stat.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{stat.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-right text-sm font-bold text-emerald-600 whitespace-nowrap">{formatCurrency(stat.income)}</td>
                    <td className="py-3.5 px-3 text-right text-sm font-semibold text-red-400 whitespace-nowrap">{formatCurrency(stat.expense)}</td>
                    <td className={`py-3.5 px-3 text-right text-sm font-black whitespace-nowrap ${stat.total >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
                      {formatCurrency(stat.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
