
import React, { useState, useEffect } from 'react';
import { Member, Transaction, AppState, User } from './types';
import { INITIAL_MEMBERS, INITIAL_TRANSACTIONS, NAVIGATION_ITEMS, API_CONFIG } from './constants';
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import TransactionManagement from './components/TransactionManagement';
import AIInsights from './components/AIInsights';
import Settings from './components/Settings';
import Reports from './components/Reports';
import { fetchRecord, updateRecord } from './services/apiService';
import { Menu, X, Wallet, LogOut, Bell, Loader2, RefreshCw, CheckCircle2, LogIn, ShieldCheck, ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [state, setState] = useState<AppState>({
    members: INITIAL_MEMBERS,
    transactions: INITIAL_TRANSACTIONS,
    currentBalance: 0
  });

  // Load session and data
  useEffect(() => {
    const savedUser = localStorage.getItem('trum_a9_session');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [membersData, transactionsData] = await Promise.all([
        fetchRecord<Member[]>(API_CONFIG.BIN_IDS.MEMBERS),
        fetchRecord<Transaction[]>(API_CONFIG.BIN_IDS.TRANSACTIONS)
      ]);

      setState(prev => ({
        ...prev,
        members: membersData || [],
        transactions: transactionsData || []
      }));
    } catch (err) {
      console.error("Failed to load group data", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const balance = state.transactions.reduce((acc, curr) => {
      return curr.type === 'INCOME' ? acc + curr.amount : acc - curr.amount;
    }, 0);
    setState(prev => ({ ...prev, currentBalance: balance }));
  }, [state.transactions]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const users = await fetchRecord<User[]>(API_CONFIG.BIN_IDS.USERS);
      const user = users?.find(u => u.user_name === loginForm.username && u.password === loginForm.password);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('trum_a9_session', JSON.stringify(user));
        setShowLoginModal(false);
        setLoginForm({ username: '', password: '' });
      } else {
        setLoginError('Tên đăng nhập hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setLoginError('Lỗi kết nối khi đăng nhập');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('trum_a9_session');
    setActiveTab('dashboard');
  };

  const isAdmin = !!currentUser;

  const filteredNavItems = NAVIGATION_ITEMS.filter(item => {
    if (item.id === 'settings' && !isAdmin) return false;
    return true;
  });

  const handleSync = async () => {
    if (!isAdmin) return;
    setIsSaving(true);
    try {
      await Promise.all([
        updateRecord<Member[]>(API_CONFIG.BIN_IDS.MEMBERS, state.members),
        updateRecord<Transaction[]>(API_CONFIG.BIN_IDS.TRANSACTIONS, state.transactions)
      ]);
      setLastSaved(new Date());
    } catch (err) {
      alert("Lỗi kết nối API khi đồng bộ thủ công.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMember = async (memberData: Omit<Member, 'id' | 'joinedAt'>) => {
    if (!isAdmin) return;
    const newMember: Member = {
      ...memberData,
      id: Math.random().toString(36).substr(2, 9),
      joinedAt: new Date().toISOString()
    };
    
    const updatedMembers = [...state.members, newMember];
    setState(prev => ({ ...prev, members: updatedMembers }));
    
    setIsSaving(true);
    const success = await updateRecord<Member[]>(API_CONFIG.BIN_IDS.MEMBERS, updatedMembers);
    if (success) setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleUpdateMember = async (updatedMember: Member) => {
    if (!isAdmin) return;
    const updatedMembers = state.members.map(m => m.id === updatedMember.id ? updatedMember : m);
    setState(prev => ({ ...prev, members: updatedMembers }));
    
    setIsSaving(true);
    const success = await updateRecord<Member[]>(API_CONFIG.BIN_IDS.MEMBERS, updatedMembers);
    if (success) setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleDeleteMember = async (id: string) => {
    if (!isAdmin) return;
    const updatedMembers = state.members.filter(m => m.id !== id);
    setState(prev => ({ ...prev, members: updatedMembers }));
    
    setIsSaving(true);
    const success = await updateRecord<Member[]>(API_CONFIG.BIN_IDS.MEMBERS, updatedMembers);
    if (success) setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleAddTransaction = async (txData: Omit<Transaction, 'id'>) => {
    if (!isAdmin) return;
    const newTx: Transaction = {
      ...txData,
      id: Math.random().toString(36).substr(2, 9)
    };
    
    const updatedTransactions = [...state.transactions, newTx];
    setState(prev => ({ ...prev, transactions: updatedTransactions }));
    
    setIsSaving(true);
    const success = await updateRecord<Transaction[]>(API_CONFIG.BIN_IDS.TRANSACTIONS, updatedTransactions);
    if (success) setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    if (!isAdmin) return;
    const updatedTransactions = state.transactions.map(t => t.id === updatedTx.id ? updatedTx : t);
    setState(prev => ({ ...prev, transactions: updatedTransactions }));
    
    setIsSaving(true);
    const success = await updateRecord<Transaction[]>(API_CONFIG.BIN_IDS.TRANSACTIONS, updatedTransactions);
    if (success) setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!isAdmin) return;
    const updatedTransactions = state.transactions.filter(t => t.id !== id);
    setState(prev => ({ ...prev, transactions: updatedTransactions }));
    
    setIsSaving(true);
    const success = await updateRecord<Transaction[]>(API_CONFIG.BIN_IDS.TRANSACTIONS, updatedTransactions);
    if (success) setLastSaved(new Date());
    setIsSaving(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium italic">Đang tải dữ liệu Trùm A9...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} />;
      case 'members':
        return (
          <MemberManagement 
            members={state.members} 
            onAddMember={handleAddMember} 
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            isAdmin={isAdmin}
          />
        );
      case 'transactions':
        return (
          <TransactionManagement 
            state={state} 
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            isAdmin={isAdmin}
          />
        );
      case 'reports':
        return <Reports state={state} />;
      case 'ai-insights':
        return <AIInsights state={state} />;
      case 'settings':
        return isAdmin ? (
          <Settings 
            binId={API_CONFIG.BIN_IDS.MEMBERS} 
            setBinId={() => {}} 
            state={state}
          />
        ) : <Dashboard state={state} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-inter">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600 p-2 rounded-lg text-white">
            <Wallet size={20} />
          </div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">Trùm A9</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center space-x-3 mb-10">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200"><Wallet size={24} /></div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">Trùm A9</span>
          </div>
          
          <nav className="flex-1 space-y-2">
            {filteredNavItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray-100 space-y-2">
            {isAdmin ? (
               <>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Admin Active</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <button onClick={handleSync} disabled={isSaving} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50 text-sm">
                  <RefreshCw size={18} className={isSaving ? 'animate-spin' : ''} />
                  <span>Đồng bộ Cloud</span>
                </button>
                <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm">
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
               </>
            ) : (
              <button onClick={() => setShowLoginModal(true)} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors text-sm">
                <LogIn size={18} />
                <span>Đăng nhập Admin</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="hidden md:flex bg-white border-b border-gray-100 h-20 items-center justify-between px-10 sticky top-0 z-30">
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-gray-800">{NAVIGATION_ITEMS.find(n => n.id === activeTab)?.label}</h2>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <span className="text-[10px] flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <ShieldCheck size={10} /> Chế độ Quản trị
                </span>
              ) : (
                <span className="text-[10px] flex items-center gap-1 text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                  <ShieldAlert size={10} /> Chế độ Xem (Read-only)
                </span>
              )}
              {lastSaved && <span className="text-[10px] text-gray-400 italic">| Đã lưu {lastSaved.toLocaleTimeString()}</span>}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{currentUser ? currentUser.user_name : 'Khách'}</p>
                <p className="text-xs text-gray-500">{isAdmin ? 'Quản trị viên' : 'Người xem'}</p>
              </div>
              <div className={`h-10 w-10 rounded-full ${isAdmin ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
                {isAdmin ? 'AD' : 'G'}
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-4 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Global Admin Login Banner for all tabs when not logged in */}
          {!isAdmin && !isLoading && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-5">
                <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm border border-blue-50">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-blue-900 leading-tight">Bạn đang ở chế độ xem</h4>
                  <p className="text-sm text-blue-600/80 mt-1 font-medium">Đăng nhập tài khoản Quản trị để mở khóa chức năng quản lý quỹ.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 group whitespace-nowrap"
              >
                <LogIn size={18} className="group-hover:translate-x-0.5 transition-transform" /> 
                Đăng nhập Admin
              </button>
            </div>
          )}
          
          {renderContent()}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center border-b border-gray-100">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Xác thực Admin</h3>
              <p className="text-gray-500 mt-2">Vui lòng đăng nhập để thực hiện thay đổi</p>
            </div>
            <form onSubmit={handleLogin} className="p-8 space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                  {loginError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tên đăng nhập</label>
                <input 
                  autoFocus
                  required
                  type="text" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mật khẩu</label>
                <input 
                  required
                  type="password" 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200 mt-4"
              >
                Đăng nhập
              </button>
              <button 
                type="button"
                onClick={() => { setShowLoginModal(false); setLoginError(''); }}
                className="w-full py-2 text-gray-500 font-medium hover:text-gray-700 mt-2"
              >
                Hủy bỏ
              </button>
            </form>
          </div>
        </div>
      )}

      {isSidebarOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default App;
