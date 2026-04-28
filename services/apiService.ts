
import { API_BASE_URL } from '../constants';
import { Member, Transaction, Category, Organization, User } from '../types';

let isRefreshing = false;

const apiFetch = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });

  if (res.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        isRefreshing = false;
        return apiFetch(path, options);
      }
    } catch {
      // refresh failed
    }
    isRefreshing = false;
  }

  return res;
};

const json = async <T>(res: Response): Promise<T | null> => {
  if (!res.ok) return null;
  return res.json() as Promise<T>;
};

// ─── Auth ───────────────────────────────────────────────────────────────────

export const login = async (user_name: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name, password }),
  });
  return json<{ user: User }>(res);
};

export const logout = async () => {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};

export const getMe = async (): Promise<User | null> => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, { credentials: 'include' });
  return json<User>(res);
};

// ─── Organizations ───────────────────────────────────────────────────────────

export const getMyOrgs = async (): Promise<Organization[]> => {
  const res = await apiFetch('/organizations/mine');
  return (await json<Organization[]>(res)) ?? [];
};

export const getOrgBySlug = async (slug: string): Promise<Organization | null> => {
  const res = await apiFetch(`/organizations/by-slug/${slug}`);
  return json<Organization>(res);
};

export const getMyOrgRole = async (orgSlug: string): Promise<{ role: string | null }> => {
  const res = await apiFetch(`/organizations/${orgSlug}/my-role`);
  const data = (await json<{ role: string | null }>(res)) ?? { role: null };
  console.log('[getMyOrgRole]', orgSlug, res.status, data);
  return data;
};

export const createOrg = async (name: string, slug: string, description?: string): Promise<Organization | null> => {
  const res = await apiFetch('/organizations', {
    method: 'POST',
    body: JSON.stringify({ name, slug, description }),
  });
  return json<Organization>(res);
};

// ─── Members ─────────────────────────────────────────────────────────────────

export const getMembers = async (orgSlug: string): Promise<Member[]> => {
  const res = await apiFetch(`/${orgSlug}/members`);
  return (await json<Member[]>(res)) ?? [];
};

export const createMember = async (orgSlug: string, data: Omit<Member, 'id' | 'joinedAt'>): Promise<Member | null> => {
  const res = await apiFetch(`/${orgSlug}/members`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return json<Member>(res);
};

export const updateMember = async (orgSlug: string, id: string, data: Partial<Member>): Promise<Member | null> => {
  const res = await apiFetch(`/${orgSlug}/members/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return json<Member>(res);
};

export const deleteMember = async (orgSlug: string, id: string): Promise<boolean> => {
  const res = await apiFetch(`/${orgSlug}/members/${id}`, { method: 'DELETE' });
  return res.status === 204;
};

export const getMyMember = async (orgSlug: string): Promise<Member | null> => {
  const res = await apiFetch(`/${orgSlug}/members/self`);
  return json<Member>(res);
};

export const updateOwnMember = async (
  orgSlug: string,
  data: Pick<Member, 'name' | 'email' | 'phone' | 'address'>,
): Promise<Member | null> => {
  const res = await apiFetch(`/${orgSlug}/members/self`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return json<Member>(res);
};

// ─── Transactions ────────────────────────────────────────────────────────────

interface ApiTransaction extends Omit<Transaction, 'category'> {
  category: { id: string; name: string; type: string } | null;
  categoryId: string | null;
}

const mapApiTx = (tx: ApiTransaction): Transaction => ({
  ...tx,
  amount: Number(tx.amount),
  category: tx.category?.name ?? '',
  categoryId: tx.categoryId ?? undefined,
  memberId: tx.memberId ?? '',
  recipient: tx.recipient ?? '',
});

export const getTransactions = async (orgSlug: string): Promise<Transaction[]> => {
  const res = await apiFetch(`/${orgSlug}/transactions`);
  const data = await json<ApiTransaction[]>(res);
  return (data ?? []).map(mapApiTx);
};

export const getTransactionSummary = async (orgSlug: string) => {
  const res = await apiFetch(`/${orgSlug}/transactions/summary`);
  return json<{ totalIncome: number; totalExpense: number; currentBalance: number; transactionCount: number }>(res);
};

export const createTransaction = async (
  orgSlug: string,
  data: Omit<Transaction, 'id'>,
  categoryId?: string,
): Promise<Transaction | null> => {
  const payload = {
    type: data.type,
    amount: data.amount,
    description: data.description,
    categoryId: categoryId ?? undefined,
    recipient: data.recipient,
    date: data.date,
    memberId: data.memberId || undefined,
  };
  const res = await apiFetch(`/${orgSlug}/transactions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const tx = await json<ApiTransaction>(res);
  return tx ? mapApiTx(tx) : null;
};

export const updateTransaction = async (
  orgSlug: string,
  id: string,
  data: Partial<Transaction>,
  categoryId?: string,
): Promise<Transaction | null> => {
  const payload = {
    ...(data.type && { type: data.type }),
    ...(data.amount !== undefined && { amount: data.amount }),
    ...(data.description && { description: data.description }),
    ...(categoryId !== undefined && { categoryId }),
    ...(data.recipient !== undefined && { recipient: data.recipient }),
    ...(data.date && { date: data.date }),
    ...(data.memberId !== undefined && { memberId: data.memberId || undefined }),
  };
  const res = await apiFetch(`/${orgSlug}/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const tx = await json<ApiTransaction>(res);
  return tx ? mapApiTx(tx) : null;
};

export const deleteTransaction = async (orgSlug: string, id: string): Promise<boolean> => {
  const res = await apiFetch(`/${orgSlug}/transactions/${id}`, { method: 'DELETE' });
  return res.status === 204;
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const getCategories = async (orgSlug: string): Promise<Category[]> => {
  const res = await apiFetch(`/${orgSlug}/categories`);
  return (await json<Category[]>(res)) ?? [];
};

export const seedCategories = async (orgSlug: string): Promise<Category[]> => {
  const res = await apiFetch(`/${orgSlug}/categories/seed`, { method: 'POST' });
  return (await json<Category[]>(res)) ?? [];
};

export const createCategory = async (orgSlug: string, name: string, type: 'INCOME' | 'EXPENSE'): Promise<Category | null> => {
  const res = await apiFetch(`/${orgSlug}/categories`, {
    method: 'POST',
    body: JSON.stringify({ name, type }),
  });
  return json<Category>(res);
};

export const updateCategory = async (orgSlug: string, id: string, data: Partial<Category>): Promise<Category | null> => {
  const res = await apiFetch(`/${orgSlug}/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return json<Category>(res);
};

export const deleteCategory = async (orgSlug: string, id: string): Promise<boolean> => {
  const res = await apiFetch(`/${orgSlug}/categories/${id}`, { method: 'DELETE' });
  return res.status === 204;
};
