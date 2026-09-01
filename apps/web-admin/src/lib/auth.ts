'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';
const TOKEN_KEY = 'sarangi_admin_token';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=86400; SameSite=Lax`;
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

export function isLoggedIn(): boolean {
  return !!getAccessToken();
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function loginAdmin(email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/admin/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Sign in failed');
  }
  const json = await res.json();
  const tokens = json.data as AuthTokens;
  setAccessToken(tokens.accessToken);
  return tokens;
}

export function logout() {
  clearAccessToken();
}
