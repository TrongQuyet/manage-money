
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Member, Transaction, AppState, User, Organization, Category, OrgSettings } from './types';
import { NAVIGATION_ITEMS, CATEGORIES } from './constants';
import Dashboard from './components/Dashboard';
import MemberManagement from './components/MemberManagement';
import TransactionManagement from './components/TransactionManagement';
import Settings from './components/Settings';
import Reports from './components/Reports';
import LuckyWheel from './components/LuckyWheel';
import ActivityLogs from './components/ActivityLogs';
import AuditLogs from './components/AuditLogs';
import ProfilePage from './components/ProfilePage';
import EventVoting from './components/EventVoting';
import LoanRequests from './components/LoanRequests';
import EventBanner from './components/EventBanner';
import EventNotificationModal, { shouldShowNotification, markNotificationShown } from './components/EventNotificationModal';
import * as api from './services/apiService';
import {
  Menu, X, Wallet, LogOut, Bell, Loader2, CheckCircle2,
  LogIn, ShieldCheck, ShieldAlert, ChevronLeft, ChevronRight, UserCircle
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
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orgRole, setOrgRole] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [myMemberId, setMyMemberId] = useState<number | null>(null);
  const [txRefreshKey, setTxRefreshKey] = useState(0);
  const [memberRefreshKey, setMemberRefreshKey] = useState(0);

  // Event notification state
  const [pendingEvents, setPendingEvents] = useState<import('./types').OrgEvent[]>([]);
  const [showEventBanner, setShowEventBanner] = useState(true);
  const [showEventNotificationModal, setShowEventNotificationModal] = useState(false);

  // Org state
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [orgNotFound, setOrgNotFound] = useState(false);

  const [state, setState] = useState<AppState>(EMPTY_STATE);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [orgSettings, setOrgSettings] = useState<OrgSettings>({});

  // isAdmin dựa trên role thực tế trong org, không phải chỉ "đã đăng nhập"
  const isAdmin = orgRole != null && (orgRole.toUpperCase() === 'OWNER' || orgRole.toUpperCase() === 'ADMIN');
  console.log('[isAdmin]', { orgRole, isAdmin });

  const availableCategories = {
    INCOME: state.categories.filter(c => c.type === 'INCOME').map(c => c.name),
    EXPENSE: state.categories.filter(c => c.type === 'EXPENSE').map(c => c.name),
  };
  const cats = {
    INCOME: availableCategories.INCOME.length > 0 ? availableCategories.INCOME : CATEGORIES.INCOME,
    EXPENSE: availableCategories.EXPENSE.length > 0 ? availableCategories.EXPENSE : CATEGORIES.EXPENSE,
  };

  // Load dữ liệu org — public, không cần đăng nhập
  // isLoggedIn dùng để quyết định có seed categories không (seed cần auth)
  const loadOrgData = useCallback(async (slug: string, isLoggedIn: boolean) => {
    const [membersRes, transactionsRes, categories] = await Promise.all([
      api.getMembers(slug),
      api.getTransactions(slug),
      api.getCategories(slug),
    ]);

    let finalCategories = categories;
    if (categories.length === 0 && isLoggedIn) {
      finalCategories = await api.seedCategories(slug);
    }

    const balance = transactionsRes.data.reduce(
      (acc, tx) => tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount, 0
    );

    setState({
      members: membersRes.data,
      transactions: transactionsRes.data,
      categories: finalCategories,
      currentBalance: balance,
      orgId: slug,
    });
  }, []);

  // Khởi động org session — yêu cầu đăng nhập và phải thuộc org đó
  const initOrgSession = useCallback(async (slug: string, user: User | null) => {
    setOrgNotFound(false);

    // Chưa đăng nhập → hiện login modal, không load data
    if (!user) {
      setIsLoading(false);
      setShowLoginModal(true);
      return;
    }

    const org = await api.getOrgBySlug(slug);
    if (!org) {
      setOrgNotFound(true);
      setIsLoading(false);
      return;
    }
    setCurrentOrg(org);

    // Kiểm tra user có thuộc org này không
    const { role } = await api.getMyOrgRole(slug);
    if (!role) {
      // User không thuộc org này → redirect về org của họ
      const myOrgs = await api.getMyOrgs();
      if (myOrgs.length > 0) {
        navigate(`/${myOrgs[0].slug}/dashboard`);
      } else {
        setOrgNotFound(true);
      }
      setIsLoading(false);
      return;
    }

    setOrgRole(role);

    const tasks: Promise<unknown>[] = [
      loadOrgData(org.slug, true),
      api.getOrgSettings(slug).then(setOrgSettings),
      api.getMyMember(slug).then((m) => setMyMemberId(m?.id ?? null)),
      api.getEvents(slug, { status: 'ACTIVE', limit: 50 }).then(res => {
        const pending = res.data.filter(e => !e.myVote);
        setPendingEvents(pending);
        if (pending.length > 0 && shouldShowNotification()) {
          setShowEventNotificationModal(true);
          markNotificationShown();
        }
      }),
    ];
    try {
      await Promise.all(tasks);
    } finally {
      setIsLoading(false);
    }
  }, [loadOrgData, navigate]);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const user = await api.getMe();
        if (user) setCurrentUser(user);
        if (orgSlug) {
          await initOrgSession(orgSlug, user);
        } else {
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };
    init();
  }, [orgSlug, initOrgSession]);

  useEffect(() => {
    if (!showUserDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserDropdown]);

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

      // Lấy danh sách org của user để redirect đúng
      const myOrgs = await api.getMyOrgs();
      if (myOrgs.length > 0) {
        const targetSlug = myOrgs[0].slug;
        if (targetSlug !== orgSlug) {
          // User thuộc org khác — redirect sang org của họ
          setActiveTab('dashboard');
          navigate(`/${targetSlug}/dashboard`);
          return; // useEffect sẽ tự load data + role theo orgSlug mới
        }
      }

      // Cùng org — dùng lại initOrgSession để đảm bảo toàn bộ state được set đúng
      if (orgSlug) {
        setIsLoading(true);
        await initOrgSession(orgSlug, result.user);
      }
    } catch {
      setLoginError('Lỗi kết nối khi đăng nhập');
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setOrgRole(null);
    setMyMemberId(null);
    setState(EMPTY_STATE);
    setCurrentOrg(null);
    setActiveTab('dashboard');
    setShowLoginModal(true);
  };

  // Yêu cầu đăng nhập trước khi thực hiện hành động ghi
  const requireAdmin = (action: () => void) => {
    if (!currentUser) { setShowLoginModal(true); return false; }
    if (!isAdmin) return false;
    return true;
  };

  const orgSlugForApi = currentOrg?.slug ?? null;

  const filteredNavItems = NAVIGATION_ITEMS.filter(item => {
    if ((item as { adminOnly?: boolean }).adminOnly && !isAdmin) return false;
    return true;
  });

  // ─── Member handlers ────────────────────────────────────────────────────────

  const handleAddMember = async (memberData: Omit<Member, 'id' | 'joinedAt'>) => {
    if (!requireAdmin(() => {})) return;
    if (!orgSlugForApi) return;
    setIsSaving(true);
    const newMember = await api.createMember(orgSlugForApi, memberData);
    if (newMember) {
      setState(prev => ({ ...prev, members: [...prev.members, newMember] }));
      setMemberRefreshKey(k => k + 1);
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleUpdateMember = async (updated: Member) => {
    if (!requireAdmin(() => {})) return;
    if (!orgSlugForApi) return;
    setIsSaving(true);
    const saved = await api.updateMember(orgSlugForApi, updated.id, updated);
    if (saved) {
      setState(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === saved.id ? saved : m),
      }));
      setMemberRefreshKey(k => k + 1);
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleUpdateOwnMember = async (data: Pick<Member, 'id' | 'name' | 'email' | 'phone' | 'address'>) => {
    if (!currentUser || !orgSlugForApi) return;
    setIsSaving(true);
    const saved = await api.updateOwnMember(orgSlugForApi, data);
    if (saved) {
      setState(prev => ({
        ...prev,
        members: prev.members.map(m => m.id === saved.id ? { ...m, ...saved } : m),
      }));
      setMemberRefreshKey(k => k + 1);
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleDeleteMember = async (id: number) => {
    if (!requireAdmin(() => {})) return;
    if (!orgSlugForApi) return;
    setIsSaving(true);
    const ok = await api.deleteMember(orgSlugForApi, id);
    if (ok) {
      setState(prev => ({ ...prev, members: prev.members.filter(m => m.id !== id) }));
      setMemberRefreshKey(k => k + 1);
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  // ─── Transaction helpers ────────────────────────────────────────────────────

  const lookupCategoryId = (categoryName: string, type: string): number | undefined => {
    return state.categories.find(c => c.name === categoryName && c.type === type)?.id;
  };

  const handleAddTransaction = async (txData: Omit<Transaction, 'id'>) => {
    if (!requireAdmin(() => {})) return;
    if (!orgSlugForApi) return;
    setIsSaving(true);
    const categoryId = lookupCategoryId(txData.category, txData.type);
    const saved = await api.createTransaction(orgSlugForApi, txData, categoryId);
    if (saved) {
      setState(prev => ({ ...prev, transactions: [...prev.transactions, saved] }));
      setTxRefreshKey(k => k + 1);
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleUpdateTransaction = async (updated: Transaction) => {
    if (!requireAdmin(() => {})) return;
    if (!orgSlugForApi) return;
    setIsSaving(true);
    const categoryId = lookupCategoryId(updated.category, updated.type);
    const saved = await api.updateTransaction(orgSlugForApi, updated.id, updated, categoryId);
    if (saved) {
      setState(prev => ({
        ...prev,
        transactions: prev.transactions.map(t => t.id === saved.id ? saved : t),
      }));
      setTxRefreshKey(k => k + 1);
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!requireAdmin(() => {})) return;
    if (!orgSlugForApi) return;
    setIsSaving(true);
    const ok = await api.deleteTransaction(orgSlugForApi, id);
    if (ok) {
      setState(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
      setTxRefreshKey(k => k + 1);
      setLastSaved(new Date());
    }
    setIsSaving(false);
  };

  const handleSettingChange = (key: string, value: string) => {
    setOrgSettings(prev => ({ ...prev, [key]: value }));
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-fade-in">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 flex items-center justify-center">
              <Loader2 size={36} className="animate-spin text-emerald-500" />
            </div>
            <div className="absolute -inset-1 rounded-2xl border-2 border-emerald-200/50 animate-ping" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold">Đang tải dữ liệu...</p>
            <p className="text-gray-400 text-sm mt-1">{currentOrg?.name ?? ''}</p>
          </div>
        </div>
      );
    }

    if (orgNotFound) {
      return (
        <div className="flex flex-col items-center justify-center py-32 space-y-5 animate-fade-in">
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center text-red-400 border border-red-100">
            <ShieldAlert size={44} />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Tổ chức không tồn tại</h2>
            <p className="text-gray-400 mt-2">Đường dẫn <strong className="text-gray-600">/{orgSlug}</strong> không hợp lệ.</p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard state={state} dashboardImage={orgSettings.dashboard_image} orgSettings={orgSettings} />;
      case 'members':
        return (
          <MemberManagement
            orgSlug={currentOrg?.slug ?? ''}
            refreshKey={memberRefreshKey}
            onAddMember={handleAddMember}
            onUpdateMember={handleUpdateMember}
            onDeleteMember={handleDeleteMember}
            isAdmin={isAdmin}
            myMemberId={myMemberId}
            onUpdateOwnMember={handleUpdateOwnMember}
          />
        );
      case 'transactions':
        return (
          <TransactionManagement
            orgSlug={currentOrg?.slug ?? ''}
            members={state.members}
            refreshKey={txRefreshKey}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            isAdmin={isAdmin}
            availableCategories={cats}
          />
        );
      case 'reports':
        return <Reports state={state} />;
      case 'events':
        return (
          <EventVoting
            orgSlug={currentOrg?.slug ?? ''}
            isAdmin={isAdmin}
            onPendingEventsChange={setPendingEvents}
          />
        );
      case 'loan-requests':
        return (
          <LoanRequests
            orgSlug={currentOrg?.slug ?? ''}
            isAdmin={isAdmin}
            myMemberId={myMemberId}
          />
        );
      case 'lucky-wheel':
        return <LuckyWheel members={state.members} />;
      case 'settings':
        return isAdmin ? (
          <Settings
            binId={currentOrg?.slug ?? ''}
            setBinId={() => {}}
            state={state}
            orgSettings={orgSettings}
            onSettingChange={handleSettingChange}
          />
        ) : <Dashboard state={state} dashboardImage={orgSettings.dashboard_image} />;
      case 'activity-logs':
        return isAdmin ? <ActivityLogs orgSlug={currentOrg?.slug ?? ''} /> : null;
      case 'audit-logs':
        return isAdmin ? <AuditLogs orgSlug={currentOrg?.slug ?? ''} /> : null;
      case 'profile':
        return currentUser ? (
          <ProfilePage orgSlug={currentOrg?.slug ?? ''} currentUser={currentUser} myMemberId={myMemberId} />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-inter">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-slate-900 border-b border-white/5 p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/30">
            <Wallet size={20} />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">
            {currentOrg?.name ?? 'Quản lý quỹ'}
          </span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:bg-white/10 rounded-xl transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${isSidebarCollapsed ? 'md:w-16' : 'md:w-64'} bg-gradient-to-b from-slate-900 to-slate-800 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/40' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-3 md:p-4">
          {/* Logo */}
          {isSidebarCollapsed ? (
            <div className="hidden md:flex flex-col items-center gap-2 mb-4">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/30">
                <Wallet size={22} />
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(false)}
                title="Mở rộng"
                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center mb-6 px-1">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-500/30 shrink-0">
                <Wallet size={22} />
              </div>
              <div className="min-w-0 ml-3 flex-1">
                <span className="font-extrabold text-base tracking-tight text-white block leading-tight truncate">
                  {currentOrg?.name ?? 'Quản lý quỹ'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Fund Manager</span>
              </div>
              <button
                onClick={() => setIsSidebarCollapsed(true)}
                title="Thu gọn"
                className="p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-lg transition-all shrink-0 ml-1"
              >
                <ChevronLeft size={16} />
              </button>
            </div>
          )}

          {/* Login button for guests */}
          {!currentUser && (
            <button
              onClick={() => setShowLoginModal(true)}
              className={`w-full flex items-center justify-center px-3 py-3 mb-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400 transition-all text-sm font-semibold shadow-lg shadow-emerald-500/30 group ${isSidebarCollapsed ? 'md:px-2' : 'space-x-2.5'}`}
            >
              <LogIn size={16} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
              {!isSidebarCollapsed && <span>Đăng nhập</span>}
            </button>
          )}

          {/* Nav */}
          <nav className="flex-1 space-y-1">
            {filteredNavItems.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                title={isSidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center py-2.5 rounded-xl transition-all duration-200 group relative animate-slide-in-left stagger-${Math.min(idx + 1, 6)} ${isSidebarCollapsed ? 'md:justify-center md:px-2 px-4 space-x-3' : 'space-x-3 px-4'} ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 font-semibold sidebar-item-active'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`shrink-0 transition-colors ${activeTab === item.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-white'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm ${isSidebarCollapsed ? 'md:hidden' : ''}`}>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Bottom user section */}
          <div className="pt-4 border-t border-white/5 space-y-1">
            {currentUser ? (
              <>
                <div className={`flex items-center rounded-xl bg-white/5 mb-1 ${isSidebarCollapsed ? 'md:justify-center md:px-2 md:py-2 gap-3 px-3 py-3' : 'gap-3 px-3 py-3'}`}>
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-sm text-white ${isAdmin ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-md shadow-emerald-500/30' : 'bg-slate-600'}`}>
                    {isAdmin ? 'AD' : currentUser.display_name?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate leading-tight">{currentUser.display_name ?? currentUser.user_name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{isAdmin ? 'Quản trị viên' : 'Thành viên'}</p>
                      </div>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${isAdmin ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]' : 'bg-slate-600'}`} />
                    </>
                  )}
                </div>
                {!isSidebarCollapsed && isSaving && (
                  <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-slate-400">
                    <Loader2 size={11} className="animate-spin" /> Đang lưu...
                  </div>
                )}
                {!isSidebarCollapsed && lastSaved && !isSaving && (
                  <div className="flex items-center gap-2 px-4 py-1.5 text-xs text-emerald-500">
                    <CheckCircle2 size={11} /> Đã lưu {lastSaved.toLocaleTimeString()}
                  </div>
                )}
                <button
                  onClick={() => { setActiveTab('profile'); setIsSidebarOpen(false); }}
                  title={isSidebarCollapsed ? 'Hồ sơ cá nhân' : undefined}
                  className={`w-full flex items-center py-2.5 rounded-xl transition-all text-sm group ${isSidebarCollapsed ? 'md:justify-center md:px-2 px-4 space-x-3' : 'space-x-3 px-4'} ${activeTab === 'profile' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <UserCircle size={16} className="shrink-0" />
                  <span className={isSidebarCollapsed ? 'md:hidden' : ''}>Hồ sơ cá nhân</span>
                </button>
                <button
                  onClick={handleLogout}
                  title={isSidebarCollapsed ? 'Đăng xuất' : undefined}
                  className={`w-full flex items-center py-2.5 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm group ${isSidebarCollapsed ? 'md:justify-center md:px-2 px-4 space-x-3' : 'space-x-3 px-4'}`}
                >
                  <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform shrink-0" />
                  <span className={isSidebarCollapsed ? 'md:hidden' : ''}>Đăng xuất</span>
                </button>
              </>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex glass border-b border-gray-100/80 h-18 items-center justify-between px-8 sticky top-0 z-30 shadow-sm" style={{ height: '72px' }}>
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {activeTab === 'profile' ? 'Hồ sơ cá nhân' : NAVIGATION_ITEMS.find(n => n.id === activeTab)?.label}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {isAdmin ? (
                <span className="text-[10px] flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <ShieldCheck size={9} /> Quản trị viên
                </span>
              ) : (
                <span className="text-[10px] flex items-center gap-1 text-gray-400 font-semibold bg-gray-100 px-2 py-0.5 rounded-full">
                  <ShieldAlert size={9} /> Chỉ xem
                </span>
              )}
              {lastSaved && !isSaving && (
                <span className="text-[10px] text-gray-400 italic">· Lưu lúc {lastSaved.toLocaleTimeString()}</span>
              )}
              {isSaving && (
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Loader2 size={9} className="animate-spin" /> Đang lưu...
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="relative p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="relative pl-3 border-l border-gray-100" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(v => !v)}
                className="flex items-center space-x-3 hover:bg-gray-50 rounded-xl px-2 py-1.5 transition-all"
              >
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {currentUser ? (currentUser.display_name ?? currentUser.user_name) : 'Khách'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{isAdmin ? 'Quản trị viên' : currentUser ? 'Thành viên' : 'Người xem'}</p>
                </div>
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm ${isAdmin ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200' : 'bg-gray-100 text-gray-400'}`}>
                  {isAdmin ? 'AD' : currentUser ? currentUser.display_name?.[0]?.toUpperCase() ?? 'U' : 'G'}
                </div>
              </button>
              {showUserDropdown && currentUser && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <button
                    onClick={() => { setShowUserDropdown(false); setActiveTab('profile'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <UserCircle size={15} className="text-gray-400" />
                    Hồ sơ cá nhân
                  </button>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={() => { setShowUserDropdown(false); handleLogout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 overflow-y-auto w-full">
          {showEventBanner && pendingEvents.length > 0 && activeTab !== 'events' && (
            <EventBanner
              pendingEvents={pendingEvents}
              onNavigate={() => { setActiveTab('events'); setShowEventBanner(false); }}
              onDismiss={() => setShowEventBanner(false)}
            />
          )}
          <div key={activeTab} className="animate-fade-in-up">
            {renderContent()}
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-8 pt-10 pb-8 text-center bg-gradient-to-br from-slate-900 to-slate-800">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xl shadow-emerald-500/30">
                <LogIn size={30} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Đăng nhập</h3>
              <p className="text-slate-400 mt-2 text-sm">Vui lòng đăng nhập để tiếp tục</p>
            </div>
            <form onSubmit={handleLogin} className="p-8 space-y-4">
              {loginError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 flex items-center gap-2">
                  <ShieldAlert size={14} className="shrink-0" /> {loginError}
                </div>
              )}
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tên đăng nhập</label>
                <input
                  autoFocus
                  required
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-all text-sm"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Mật khẩu</label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent focus:bg-white outline-none transition-all text-sm"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-600 hover:to-teal-600 rounded-xl transition-all shadow-lg shadow-emerald-200 mt-2 active:scale-95">
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => { setShowLoginModal(false); setLoginError(''); if (!currentUser) navigate('/'); }}
                className="w-full py-2.5 text-gray-400 font-medium hover:text-gray-600 transition-colors text-sm"
              >
                Hủy bỏ
              </button>
            </form>
          </div>
        </div>
      )}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {showEventNotificationModal && (
        <EventNotificationModal
          pendingEvents={pendingEvents}
          onNavigate={() => { setShowEventNotificationModal(false); setActiveTab('events'); }}
          onClose={() => setShowEventNotificationModal(false)}
        />
      )}
    </div>
  );
};

export default App;
