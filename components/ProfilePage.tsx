
import React, { useState, useEffect, useRef } from 'react';
import { User, Member } from '../types';
import * as api from '../services/apiService';
import { Save, KeyRound, User as UserIcon, CheckCircle2, AlertCircle, Loader2, Camera, QrCode } from 'lucide-react';

interface Props {
  orgSlug: string;
  currentUser: User;
  myMemberId: number | null;
}

const ProfilePage: React.FC<Props> = ({ orgSlug, currentUser, myMemberId }) => {
  const [member, setMember] = useState<Member | null | 'not-found'>(null);
  const [infoForm, setInfoForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoMsg, setInfoMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getMyMember(orgSlug).then(m => {
      if (m) {
        setMember(m);
        setInfoForm({ name: m.name ?? '', email: m.email ?? '', phone: m.phone ?? '', address: m.address ?? '' });
      } else {
        setMember('not-found');
      }
    });
  }, [orgSlug, myMemberId]);

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || member === 'not-found') return;
    setInfoSaving(true);
    setInfoMsg(null);
    const saved = await api.updateOwnMember(orgSlug, infoForm);
    if (saved) {
      setMember(saved);
      setInfoMsg({ type: 'success', text: 'Đã cập nhật thông tin thành công.' });
    } else {
      setInfoMsg({ type: 'error', text: 'Cập nhật thất bại. Vui lòng thử lại.' });
    }
    setInfoSaving(false);
  };

  const handleUpload = async (file: File, field: 'avatar' | 'bankQr') => {
    const setter = field === 'avatar' ? setUploadingAvatar : setUploadingQr;
    setter(true);
    const base64 = await api.fileToBase64(file);
    const apiField = field === 'avatar' ? 'avatarUrl' : 'bankQrUrl';
    const updated = await api.updateOwnMember(orgSlug, { ...infoForm, [apiField]: base64 });
    if (updated) {
      setMember(updated);
    } else {
      alert('Tải ảnh thất bại. Vui lòng thử lại.');
    }
    setter(false);
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới và xác nhận không khớp.' });
      return;
    }
    if (pwForm.next.length < 6) {
      setPwMsg({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      return;
    }
    setPwSaving(true);
    const result = await api.changePassword(pwForm.current, pwForm.next);
    if (result.ok) {
      setPwMsg({ type: 'success', text: 'Đổi mật khẩu thành công.' });
      setPwForm({ current: '', next: '', confirm: '' });
    } else {
      setPwMsg({ type: 'error', text: result.message ?? 'Đổi mật khẩu thất bại.' });
    }
    setPwSaving(false);
  };

  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all bg-white';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-4 pb-2">
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-md shadow-emerald-200">
            {member && member !== 'not-found' && member.avatarUrl ? (
              <img src={member.avatarUrl ?? ''} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                {currentUser.display_name?.[0]?.toUpperCase() ?? currentUser.user_name[0]?.toUpperCase() ?? 'U'}
              </div>
            )}
          </div>
          {member && member !== 'not-found' && (
            <button
              onClick={() => avatarRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow hover:bg-emerald-600 transition-colors"
              title="Đổi ảnh đại diện"
            >
              {uploadingAvatar ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
            </button>
          )}
          <input ref={avatarRef} type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) { handleUpload(f, 'avatar'); } e.target.value = ''; }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{currentUser.display_name ?? currentUser.user_name}</h1>
          <p className="text-sm text-gray-400">@{currentUser.user_name}</p>
        </div>
      </div>

      {/* Personal info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <UserIcon size={16} className="text-emerald-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Thông tin cá nhân</h2>
        </div>

        {member === null && (
          <div className="flex items-center justify-center py-8 text-gray-400">
            <Loader2 size={20} className="animate-spin mr-2" /> Đang tải...
          </div>
        )}
        {member === 'not-found' && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-4 py-3 rounded-xl">
            <AlertCircle size={15} />
            Tài khoản của bạn chưa được liên kết với hồ sơ thành viên trong tổ chức này.
          </div>
        )}
        {member !== null && member !== 'not-found' && (
          <form onSubmit={handleInfoSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Tên hiển thị</label>
              <input
                className={inputClass}
                value={infoForm.name}
                onChange={e => setInfoForm(p => ({ ...p, name: e.target.value }))}
                placeholder="Nhập tên hiển thị"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                className={inputClass}
                value={infoForm.email}
                onChange={e => setInfoForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Nhập email"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Số điện thoại</label>
              <input
                className={inputClass}
                value={infoForm.phone}
                onChange={e => setInfoForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Địa chỉ</label>
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                value={infoForm.address}
                onChange={e => setInfoForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Nhập địa chỉ"
              />
            </div>

            {/* QR Ngân hàng */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">QR Ngân hàng</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-slate-50 flex items-center justify-center shrink-0">
                  {member.bankQrUrl ? (
                    <img src={member.bankQrUrl ?? ''} alt="QR" className="w-full h-full object-cover" />
                  ) : (
                    <QrCode size={28} className="text-slate-300" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => qrRef.current?.click()}
                  disabled={uploadingQr}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 border border-gray-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {uploadingQr ? <Loader2 size={14} className="animate-spin" /> : <QrCode size={14} />}
                  {member.bankQrUrl ? 'Đổi ảnh QR' : 'Tải ảnh QR'}
                </button>
                <input ref={qrRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) { handleUpload(f, 'bankQr'); } e.target.value = ''; }} />
              </div>
            </div>

            {infoMsg && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${infoMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {infoMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                {infoMsg.text}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={infoSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-200 disabled:opacity-60"
              >
                {infoSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Lưu thay đổi
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-amber-50 rounded-lg">
            <KeyRound size={16} className="text-amber-600" />
          </div>
          <h2 className="font-semibold text-gray-800">Đổi mật khẩu</h2>
        </div>

        <form onSubmit={handlePwSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Mật khẩu hiện tại</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.current}
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))}
              placeholder="Nhập mật khẩu hiện tại"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Mật khẩu mới</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.next}
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))}
              placeholder="Ít nhất 6 ký tự"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className={inputClass}
              value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))}
              placeholder="Nhập lại mật khẩu mới"
              required
            />
          </div>

          {pwMsg && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${pwMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              {pwMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
              {pwMsg.text}
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={pwSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-400 hover:to-orange-400 transition-all shadow-md shadow-amber-200 disabled:opacity-60"
            >
              {pwSaving ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
              Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
