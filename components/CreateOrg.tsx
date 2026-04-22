import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Building2, LogIn, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import * as api from '../services/apiService';
import { User } from '../types';

const toSlug = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const CreateOrg: React.FC = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Login form
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  // Org form
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    api.getMe().then(user => {
      setCurrentUser(user);
      setCheckingAuth(false);
    });
  }, []);

  // Auto-generate slug from name unless manually edited
  useEffect(() => {
    if (!slugManuallyEdited) {
      setOrgSlug(toSlug(orgName));
    }
  }, [orgName, slugManuallyEdited]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const result = await api.login(loginForm.username, loginForm.password);
    if (!result) {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng');
      return;
    }
    setCurrentUser(result.user);
    setShowLogin(false);
    setLoginForm({ username: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !orgSlug.trim()) return;
    setIsSubmitting(true);
    setSubmitError('');
    const org = await api.createOrg(orgName.trim(), orgSlug.trim(), description.trim() || undefined);
    if (org) {
      navigate(`/${org.slug}`);
    } else {
      setSubmitError('Không thể tạo tổ chức. Slug có thể đã tồn tại, hãy thử slug khác.');
      setIsSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-emerald-600 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-200">
          <Wallet size={24} />
        </div>
        <span className="font-extrabold text-xl tracking-tight text-gray-900">Quản lý quỹ</span>
      </div>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8 text-center border-b border-gray-100">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Tạo tổ chức mới</h2>
          <p className="text-gray-500 mt-1 text-sm">Điền thông tin để tạo quỹ của bạn</p>
        </div>

        {!currentUser ? (
          /* Not logged in */
          <div className="p-8 text-center space-y-4">
            <p className="text-gray-600">Bạn cần đăng nhập để tạo tổ chức.</p>
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all"
            >
              <LogIn size={18} /> Đăng nhập
            </button>
          </div>
        ) : (
          /* Org creation form */
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {submitError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {submitError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Tên tổ chức <span className="text-red-400">*</span>
              </label>
              <input
                autoFocus
                required
                type="text"
                placeholder="VD: Trùm A9, Quỹ lớp 12A..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Đường dẫn (slug) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500 focus-within:bg-white transition-all overflow-hidden">
                <span className="px-3 text-gray-400 text-sm select-none border-r border-gray-200 py-3">
                  localhost:3333/
                </span>
                <input
                  required
                  type="text"
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  title="Chỉ dùng chữ thường, số và dấu gạch ngang"
                  placeholder="ten-to-chuc"
                  className="flex-1 px-3 py-3 bg-transparent outline-none text-sm font-mono"
                  value={orgSlug}
                  onChange={e => {
                    setOrgSlug(e.target.value);
                    setSlugManuallyEdited(true);
                  }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1 ml-1">
                Chỉ dùng chữ thường, số và dấu gạch ngang. Không thể thay đổi sau khi tạo.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Mô tả <span className="text-gray-300">(tùy chọn)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả ngắn về tổ chức..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all resize-none text-sm"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 pt-2 p-3 bg-emerald-50 rounded-xl text-emerald-700 text-xs">
              <ShieldCheck size={14} className="shrink-0" />
              <span>Đăng nhập với tài khoản <strong>{currentUser.display_name ?? currentUser.user_name}</strong></span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !orgSlug}
              className="w-full py-3 bg-emerald-600 text-white font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-lg shadow-emerald-200"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Đang tạo...
                </span>
              ) : 'Tạo tổ chức'}
            </button>
          </form>
        )}
      </div>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="p-8 text-center border-b border-gray-100">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Đăng nhập</h3>
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
                  autoFocus required type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  value={loginForm.username}
                  onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mật khẩu</label>
                <input
                  required type="password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
                  value={loginForm.password}
                  onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold hover:bg-blue-700 rounded-xl transition-all mt-2">
                Đăng nhập
              </button>
              <button type="button" onClick={() => { setShowLogin(false); setLoginError(''); }}
                className="w-full py-2 text-gray-500 hover:text-gray-700 text-sm">
                Hủy bỏ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrg;
