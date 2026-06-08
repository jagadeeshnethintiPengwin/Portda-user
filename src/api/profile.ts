import { api } from './client';
import type { User, KycDocument } from './types';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  email?: string;
  locale?: string;
  company_name?: string;
  imo_number?: string;
  gst_number?: string;
  billing_address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  default_port_id?: number;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  alerts: boolean;
}

export const profileApi = {
  get: () => api<User>('/profile'),

  update: (data: UpdateProfilePayload) =>
    api<User>('/profile', { method: 'PUT', body: JSON.stringify(data) }),

  // POST /profile/avatar returns { avatar, url } — NOT a full User (api-user.md §4).
  uploadAvatar: (uri: string, name: string, type = 'image/jpeg') => {
    const formData = new FormData();
    formData.append('avatar', { uri, name, type } as any);
    return api<{ avatar: string; url: string }>('/profile/avatar', { method: 'POST', body: formData });
  },

  getNotificationPrefs: () =>
    api<NotificationPrefs>('/profile/notification-preferences'),

  updateNotificationPrefs: (prefs: Partial<NotificationPrefs>) =>
    api<NotificationPrefs>('/profile/notification-preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    }),

  kycList: () => api<KycDocument[]>('/kyc'),

  kycStatus: () =>
    api<{ counts: { pending: number; approved: number } }>('/kyc/status'),

  kycUpload: (data: {
    doc_type: string;
    doc_number?: string;
    file: { uri: string; name: string; type: string };
  }) => {
    const formData = new FormData();
    formData.append('doc_type', data.doc_type);
    if (data.doc_number) formData.append('doc_number', data.doc_number);
    formData.append('file', data.file as any);
    return api<KycDocument>('/kyc', { method: 'POST', body: formData });
  },

  kycDelete: (id: number | string) =>
    api<void>(`/kyc/${id}`, { method: 'DELETE' }),
};
