
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Member, Transaction, AppState, User, Organization, Category } from './types';
import { NAVIGATION_ITEMS, CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import TransactionManagement from './components/TransactionManagement';
import AIInsights from './components/AIInsights';
import Settings from './components/Settings';
import Reports from './components/Reports';
import * as api from './services/apiService';
import {
  Menu, X, Wallet, LogOut, Bell, Loader2, CheckCircle2,
  LogIn, ShieldCheck, ShieldAlert
} from 'lucide-react';

const EMPTY_STATE: AppState = {
  members: [],
  transactions: [],
  categories: [],
  currentBalance: 0,
  orgId: null,
};

const App: React.FC = () => {
  const { orgSlug } = useParams<{ orgSlug: string }>();

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

  // Org state — derived from URL slug, no switcher needed
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [orgNotFound, setOrgNotFound] = useState(false);

  const [state, setState] = useState<AppState>(EMPTY_STATE);

  // Derived categories for dropdowns
  const availableCategories = {
    INCOME: state.categories.filter(c => c.type === 'INCOME').map(c => c.name),
    EXPENSE: state.categories.filter(c => c.type === 'EXPENSE').map(c => c.name),
  };
  const cats = {
    INCOME: availableCategories.INCOME.length > 0 ? availableCategories.INCOME : CATEGORIES.INCOME,
    EXPENSE: availableCategories.EXPENSE.length > 0 ? availableCategories.EXPENSE : CATEGORIES.EXPENSE,
  };

  // Load org data by slug
  const loadOrgData = useCallback(async (slug: string) => {
    setIsLoading(true);
    try {
      const [members, transactions, categories] = await Promise.all([
        api.getMembers(slug),
        api.getTransactions(slug),
        api.getCategories(slug),
      ]);

      const finalCategories = categories.length > 0
        ? categories
        : await api.seedCategories(slug);

      const balance = transactions.reduce(
        (acc, tx) => tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount, 0
      );

      setState({
        members,
        transactions,
        categories: finalCategories,
        currentBalance: balance,
        orgId: slug,
      });
    } catch (err) {
      console.error('Failed to load org data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Init: check auth + load org from URL slug
  const initOrgSession = useCallback(async (user: User) => {
    if (!orgSlug) return;
    setOrgNotFound(false);
    const org = await api.getOrgBySlug(orgSlug);
    if (!org) {
      setOrgNotFound(true);
      setIsLoading(false);
      return;
    }
    setCurrentOrg(org);
    await loadOrgData(org.slug);
  }, [orgSlug, loadOrgData]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const user = await api.getMe();
      if (user) {
        setCurrentUser(user);
        await initOrgSession(user);
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, [orgSlug, initOrgSession]);

  // Recalculate balance when transactions change
  useEffect(() => {
    const balance = state.transactions.reduce(
      (acc, tx) => tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount, 0
    );
    setState(prev => ({ ...prev, currentBalance: balance }));
  }, [state.transactions]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const result = await api.login(loginForm.username, loginForm.password);
      if (!result) {
        setLoginError('Tên đăng nhập hoặc mật khẩu không đúng');
        return;
      }
      setCurrentUser(result.user);
      setShowLoginModal(false);
      setLoginForm({ username: '', password: '' });
      await initOrgSession(result.user);
    } catch {
      setLoginError('Lỗi kết nối khi đăng nhập');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentOrg(null);
    setState(EMPTY_STATE);
    setActiveTab('dashboard');
  };

  const isAdmin = !!currentUser;
  const orgSlugForApi = currentOrg?.slug ?? null;

  const filteredNavItems = NAVIGATION_ITEMS.filter(item => {
    if (item.id === 'settings' && !isAdmin) return false;
    return true;
  });

  // ─── Member handlers ────────────────────────────────────────────────────────

  const handleAddMember = async (memberData: Omit<Member, 'id' | 'joinedAt'>) => {
    if (!isAdmin || !orgSlugForApi) return;
    setIsSaving(true);
    const newMember = await api.createMember(orgSlugForApi, memberData);
    if (newMember) {
      setState(prev => ({ ...prev, members: [...prev.members, newMember] }));
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleUpdateMember = async (updated: Member) => {
    if (!isAdmin || !orgSlugForApi) return;
    setIsSaving(true);
    const saved = await api.updateMember(orgSlugForApi, updated.id, updated);
    if (saved) {
      setState(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === saved.id ? saved : m),
      }));
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleDeleteMember = async (id: string) => {
    if (!isAdmin || !orgSlugForApi) return;
    setIsSaving(true);
    const ok = await api.deleteMember(orgSlugForApi, id);
    if (ok) {
      setState(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  // ─── Transaction helpers ────────────────────────────────────────────────────

  const lookupCategoryId = (categoryName: string, type: string): string | undefined => {
    return state.categories.find(c => c.name === categoryName && c.type === type)?.id;
  };

  const handleAddTransaction = async (txData: Omit<Transaction, 'id'>) => {
    if (!isAdmin || !orgSlugForApi) return;
    setIsSaving(true);
    const categoryId = lookupCategoryId(txData.category, txData.type);
    const saved = await api.createTransaction(orgSlugForApi, txData, categoryId);
    if (saved) {
      setState(prev => ({ ...prev, transactions: [...prev.transactions, saved] }));
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    if (!isAdmin || !orgSlugForApi) return;
    setIsSaving(true);
    const categoryId = lookupCategoryId(updated.category, updated.type);
    const saved = await api.updateTransaction(orgSlugForApi, updated.id, updated, categoryId);
    if (saved) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === saved.id ? saved : t),
      }));
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!isAdmin || !orgSlugForApi) return;
    setIsSaving(true);
    const ok = await api.deleteTransaction(orgSlugForApi, id);
    if (ok) {
      setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 size={48} className="animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium italic">
            Đang tải dữ liệu {currentOrg?.name ?? ''}...
          </p>
        </div>
      );
    }

    if (orgNotFound) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="bg-red-50 p-6 rounded-3xl text-red-500 mb-2">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Tổ chức không tồn tại</h2>
          <p className="text-gray-500">Đường dẫn <strong>/{orgSlug}</strong> không hợp lệ.</p>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="bg-blue-50 p-6 rounded-3xl text-blue-600 mb-2">
            <ShieldAlert size={48} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Vui lòng đăng nhập</h2>
          <p className="text-gray-500">Đăng nhập để xem và quản lý dữ liệu tổ chức.</p>
          <button
            onClick={() => setShowLoginModal(true)}
            className="mt-4 flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all"
          >
            <LogIn size={18} /> Đăng nhập
          </button>
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
            availableCategories={cats}
          />
        );
      case 'reports':
        return <Reports state={state} />;
      case 'ai-insights':
        return <AIInsights state={state} />;
      case 'settings':
        return isAdmin ? (
          <Settings
            binId={currentOrg?.slug ?? ''}
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
          <div className="bg-emerald-600 p-2 rounded-lg text-white"><Wallet size={20} /></div>
          <span className="font-bold text-lg text-gray-900 tracking-tight">
            {currentOrg?.name ?? 'Quản lý quỹ'}
          </span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:shadow-none'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="hidden md:flex items-center space-x-3 mb-8">
            <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200"><Wallet size={24} /></div>
            <span className="font-extrabold text-xl tracking-tight text-gray-900">
              {currentOrg?.name ?? 'Quản lý quỹ'}
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-emerald-50 text-emerald-600 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
              >
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
                {isSaving && (
                  <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-400">
                    <Loader2 size={12} className="animate-spin" /> Đang lưu...
                  </div>
                )}
                {lastSaved && !isSaving && (
                  <div className="flex items-center gap-2 px-4 py-2 text-xs text-emerald-600">
                    <CheckCircle2 size={12} /> Đã lưu {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm"
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors text-sm"
              >
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
            <h2 className="text-xl font-bold text-gray-800">
              {NAVIGATION_ITEMS.find(n => n.id === activeTab)?.label}
            </h2>
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
              {lastSaved && (
                <span className="text-[10px] text-gray-400 italic">
                  | Đã lưu {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser ? (currentUser.display_name ?? currentUser.user_name) : 'Khách'}
                </p>
                <p className="text-xs text-gray-500">{isAdmin ? 'Quản trị viên' : 'Người xem'}</p>
              </div>
              <div className={`h-10 w-10 rounded-full ${isAdmin ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center font-bold border-2 border-white shadow-sm`}>
                {isAdmin ? 'AD' : 'G'}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
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
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mật khẩu</label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-200 mt-4">
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

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
