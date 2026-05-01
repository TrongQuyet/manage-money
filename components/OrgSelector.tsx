
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/apiService';
import { Organization } from '../types';

export default function OrgSelector() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const loadOrgs = async () => {
    setLoading(true);
    const data = await api.getMyOrgs();
    setOrgs(data);
    setLoading(false);
  };

  useEffect(() => {
    api.getMe().then((user) => {
      if (user) {
        setLoggedIn(true);
        loadOrgs();
      } else {
        setLoading(false);
      }
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const result = await api.login(loginForm.username, loginForm.password);
    if (!result) {
      setLoginError('Tên đăng nhập hoặc mật khẩu không đúng');
      return;
    }
    setLoggedIn(true);
    setLoginForm({ username: '', password: '' });
    loadOrgs();
  };

  if (!loggedIn) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.iconBox}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
            </div>
            <h3 style={styles.cardTitle}>Đăng nhập</h3>
            <p style={styles.cardSubtitle}>Vui lòng đăng nhập để tiếp tục</p>
          </div>
          <form onSubmit={handleLogin} style={styles.form}>
            {loginError && (
              <div style={styles.errorBox}>{loginError}</div>
            )}
            <div style={styles.field}>
              <label style={styles.label}>TÊN ĐĂNG NHẬP</label>
              <input
                autoFocus
                required
                type="text"
                style={styles.input}
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>MẬT KHẨU</label>
              <input
                required
                type="password"
                style={styles.input}
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              />
            </div>
            <button type="submit" style={styles.submitBtn}>Đăng nhập</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <p style={{ color: '#666' }}>Đang tải...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await api.logout();
    setLoggedIn(false);
    setOrgs([]);
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.titleRow}>
        <h2 style={styles.title}>Chọn tổ chức</h2>
        <button style={styles.logoutBtn} onClick={handleLogout}>Đăng xuất</button>
      </div>
      {orgs.length === 0 ? (
        <div style={styles.empty}>
          <p>Bạn chưa thuộc tổ chức nào.</p>
          <button style={styles.createBtn} onClick={() => navigate('/create-org')}>
            Tạo tổ chức mới
          </button>
        </div>
      ) : (
        <>
          <ul style={styles.list}>
            {orgs.map((org) => (
              <li
                key={org.id}
                style={styles.item}
                onClick={() => navigate(`/${org.slug}`)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f9ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
              >
                <span style={styles.orgName}>{org.name}</span>
                {org.description && <span style={styles.orgDesc}>{org.description}</span>}
                <span style={styles.orgSlug}>/{org.slug}</span>
              </li>
            ))}
          </ul>
          <button style={styles.createBtn} onClick={() => navigate('/create-org')}>
            + Tạo tổ chức mới
          </button>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    padding: 40,
    fontFamily: 'sans-serif',
    maxWidth: 480,
    margin: '80px auto',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    color: '#1a1a1a',
  },
  logoutBtn: {
    padding: '7px 14px',
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid #fca5a5',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 20px 0',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  item: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '14px 18px',
    border: '1px solid #e0e0e0',
    borderRadius: 8,
    cursor: 'pointer',
    background: '#fff',
  },
  orgName: {
    fontWeight: 600,
    fontSize: 16,
    color: '#1a1a1a',
  },
  orgDesc: {
    fontSize: 13,
    color: '#666',
  },
  orgSlug: {
    fontSize: 12,
    color: '#999',
  },
  createBtn: {
    marginTop: 4,
    padding: '10px 18px',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    color: '#444',
  },
  // Login card styles
  card: {
    background: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    boxShadow: '0 25px 50px rgba(0,0,0,0.12)',
  },
  cardHeader: {
    padding: '40px 32px 32px',
    background: 'linear-gradient(135deg, #0f172a, #1e293b)',
    textAlign: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    background: 'linear-gradient(135deg, #10b981, #14b8a6)',
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#fff',
    margin: '0 0 8px',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    margin: 0,
  },
  form: {
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  errorBox: {
    padding: '12px 14px',
    background: '#fef2f2',
    color: '#dc2626',
    fontSize: 13,
    borderRadius: 12,
    border: '1px solid #fecaca',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: 700,
    color: '#9ca3af',
    letterSpacing: '0.1em',
  },
  input: {
    padding: '12px 16px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    fontSize: 14,
    outline: 'none',
  },
  submitBtn: {
    padding: '14px',
    background: 'linear-gradient(135deg, #10b981, #14b8a6)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 4,
  },
};
