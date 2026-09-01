'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1';
const TOKEN_KEY = 'sarangi_access_token';

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
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  const token = getAccessToken();
  if (!token) return false;
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return false;
    const payload = JSON.parse(atob(payloadBase64));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      clearAccessToken();
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function authHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function loginStore(email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/store/auth/login`, {
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

export async function registerStore(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/store/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Registration failed');
  }
  const json = await res.json();
  const tokens = json.data as AuthTokens;
  setAccessToken(tokens.accessToken);
  return tokens;
}

export function logout() {
  clearAccessToken();
}
