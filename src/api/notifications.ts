import { api } from './client';
import type { Notification } from './types';

export const notificationsApi = {
  list: (unread?: boolean, page?: number) => {
    const params = new URLSearchParams();
    if (unread) params.set('unread', '1');
    if (page) params.set('page', String(page));
    const qs = params.toString();
    return api<Notification[]>(`/notifications${qs ? `?${qs}` : ''}`);
  },

  unreadCount: () => api<{ count: number }>('/notifications/unread-count'),

  markRead: (id: number | string) =>
    api<void>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllRead: () => api<void>('/notifications/read-all', { method: 'POST' }),

  delete: (id: number | string) =>
    api<void>(`/notifications/${id}`, { method: 'DELETE' }),
};
