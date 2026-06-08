import { api } from './client';
import type { User } from './types';

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OtpRequestResponse {
  sent: boolean;
  channel?: string;
  debug_code?: string;
}

/** Purposes accepted by `/auth/otp/*` — see api-user.md §2. */
export type OtpPurpose = 'login' | 'register' | 'reset' | 'verify';

export const authApi = {
  /**
   * OTP-first registration (api-user.md §2). `identifier` is an email or phone
   * (the server detects by shape) and `otp_code` is the code from a prior
   * `requestOtp(identifier, 'register')`. Returns `{ user, token }` on success.
   */
  register: (data: {
    name: string;
    identifier: string;
    otp_code: string;
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

  requestOtp: (identifier: string, purpose: OtpPurpose = 'login') =>
    api<OtpRequestResponse>(
      '/auth/otp/request',
      { method: 'POST', body: JSON.stringify({ identifier, purpose }) },
      true,
    ),

  verifyOtp: (identifier: string, code: string, purpose: OtpPurpose = 'login') =>
    api<AuthResponse>(
      '/auth/otp/verify',
      { method: 'POST', body: JSON.stringify({ identifier, code, purpose }) },
      true,
    ),

  // Reset a forgotten password (public). Precede with requestOtp(identifier, 'reset').
  resetPassword: (data: {
    identifier: string;
    code: string;
    password: string;
    password_confirmation: string;
  }) =>
    api<void>(
      '/auth/password/reset',
      { method: 'POST', body: JSON.stringify(data) },
      true,
    ),

  me: () => api<User>('/auth/me'),

  logout: () => api<void>('/auth/logout', { method: 'POST' }),

  // Soft-deletes the account (revokes tokens + devices). Requires current password.
  deleteAccount: (password: string) =>
    api<void>('/auth/account', { method: 'DELETE', body: JSON.stringify({ password }) }),

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
