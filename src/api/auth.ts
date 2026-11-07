import { apiRequest } from './client';

export type AuthUser = { id: string; email: string };
export type AuthResponse = { token: string; user: AuthUser };

export function register(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/auth/register', { method: 'POST', body: { email, password } });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } });
}

export function fetchMe() {
  return apiRequest<{ user: AuthUser }>('/api/auth/me', { auth: true });
}
