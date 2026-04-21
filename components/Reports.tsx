
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, 
  PieChart as RePieChart, Pie, Legend, LineChart, Line
} from 'recharts';
import { Transaction, AppState, Member } from '../types';
import { CreditCard, TrendingUp, TrendingDown, Target, Download, Users, Briefcase } from 'lucide-react';

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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Báo cáo tài chính chi tiết</h3>
          <p className="text-gray-500">Phân tích chuyên sâu về dòng tiền và đóng góp hội nhóm</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center justify-center space-x-2 bg-white border border-gray-200 px-5 py-2.5 rounded-xl text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm group"
        >
          <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          <span className="font-semibold whitespace-nowrap">Xuất file PDF</span>
        </button>
      </div>

      {/* High-level Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp size={64} className="text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng thu quỹ</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalIncome)}</p>
          <div className="mt-3 flex items-center text-xs text-emerald-500 font-bold">
            <TrendingUp size={14} className="mr-1" /> 100% dòng vào
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingDown size={64} className="text-red-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tổng chi tiêu</p>
          <p className="text-2xl font-black text-red-600">{formatCurrency(totalExpense)}</p>
          <div className="mt-3 flex items-center text-xs text-red-500 font-bold">
            <TrendingDown size={14} className="mr-1" /> Dòng ra quỹ
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Target size={64} className="text-blue-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Tỷ lệ dư thừa</p>
          <p className="text-2xl font-black text-blue-600">
            {totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1) : 0}%
          </p>
          <div className="mt-3 flex items-center text-xs text-blue-500 font-bold">
             <Briefcase size={14} className="mr-1" /> Sức khỏe tài chính
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Users size={64} className="text-indigo-600" />
          </div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Số dư ròng</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(currentBalance)}</p>
          <div className="mt-3 flex items-center text-xs text-indigo-500 font-bold">
            <CreditCard size={14} className="mr-1" /> Khả dụng hiện tại
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h4 className="text-lg font-bold text-gray-800">Biểu đồ tăng trưởng quỹ</h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Thu
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <div className="w-3 h-3 rounded-full bg-red-500"></div> Chi
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
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-lg font-bold text-gray-800 mb-8">Đóng góp theo thành viên</h4>
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
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm lg:col-span-1">
          <h4 className="text-lg font-bold text-gray-800 mb-8">Cơ cấu chi tiêu</h4>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 overflow-hidden">
          <h4 className="text-lg font-bold text-gray-800 mb-8">Chi tiết hoạt động thành viên</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-4 px-2 whitespace-nowrap">Thành viên</th>
                  <th className="pb-4 px-2 text-right text-emerald-600 whitespace-nowrap">Tổng Đóng</th>
                  <th className="pb-4 px-2 text-right text-red-600 whitespace-nowrap">Tổng Chi</th>
                  <th className="pb-4 px-2 text-right whitespace-nowrap">Thực đóng (Net)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {memberStats.sort((a, b) => b.income - a.income).map((stat) => (
                  <tr key={stat.name} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {stat.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-slate-700">{stat.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right text-sm font-bold text-emerald-600 whitespace-nowrap">
                      {formatCurrency(stat.income)}
                    </td>
                    <td className="py-4 px-2 text-right text-sm font-semibold text-red-400 whitespace-nowrap">
                      {formatCurrency(stat.expense)}
                    </td>
                    <td className={`py-4 px-2 text-right text-sm font-black whitespace-nowrap ${stat.total >= 0 ? 'text-blue-600' : 'text-amber-600'}`}>
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
