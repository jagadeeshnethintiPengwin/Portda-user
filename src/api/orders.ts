import { api } from './client';
import type { Order } from './types';

export interface OrderFilters {
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}

export const ordersApi = {
  list: (filters: OrderFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.payment_status) params.set('payment_status', filters.payment_status);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    if (filters.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return api<Order[]>(`/orders${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) => api<Order>(`/orders/${id}`),

  cancel: (id: number | string, cancel_reason: string) =>
    api<Order>(
      `/orders/${id}/cancel`,
      { method: 'POST', body: JSON.stringify({ cancel_reason }) },
    ),

  reschedule: (id: number | string, scheduled_at: string) =>
    api<Order>(
      `/orders/${id}/reschedule`,
      { method: 'POST', body: JSON.stringify({ scheduled_at }) },
    ),
};
