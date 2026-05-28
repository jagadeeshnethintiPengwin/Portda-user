import { api } from './client';
import type { User } from './types';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OtpRequestResponse {
  sent: boolean;
  debug_code?: string;
}

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role: 'buyer';
  }) =>
    api<AuthResponse>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) },
      true,
    ),

  emailLogin: (data: { email: string; password: string }) =>
    api<AuthResponse>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
      true,
    ),

  phoneLogin: (data: { phone: string; password: string }) =>
    api<AuthResponse>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) },
      true,
    ),

  requestOtp: (identifier: string) =>
    api<OtpRequestResponse>(
      '/auth/otp/request',
      { method: 'POST', body: JSON.stringify({ identifier, purpose: 'login' }) },
      true,
    ),

  verifyOtp: (identifier: string, code: string) =>
    api<AuthResponse>(
      '/auth/otp/verify',
      { method: 'POST', body: JSON.stringify({ identifier, code, purpose: 'login' }) },
      true,
    ),

  me: () => api<User>('/auth/me'),

  logout: () => api<void>('/auth/logout', { method: 'POST' }),

  changePassword: (data: {
    current_password: string;
    password: string;
    password_confirmation: string;
  }) =>
    api<void>(
      '/auth/password',
      { method: 'POST', body: JSON.stringify(data) },
    ),
};
