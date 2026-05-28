import { api } from './client';
import type { Quotation, Order } from './types';

export interface QuotationFilters {
  status?: string;
  service_request_id?: number;
  page?: number;
}

export const quotationsApi = {
  list: (filters: QuotationFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.service_request_id)
      params.set('service_request_id', String(filters.service_request_id));
    if (filters.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return api<Quotation[]>(`/quotations${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) => api<Quotation>(`/quotations/${id}`),

  accept: (id: number | string) =>
    api<Order>(`/quotations/${id}/accept`, { method: 'POST' }),

  reject: (id: number | string) =>
    api<Quotation>(`/quotations/${id}/reject`, { method: 'POST' }),

  counterOffer: (id: number | string, amount: number, notes?: string) =>
    api<any>(
      `/quotations/${id}/revisions`,
      { method: 'POST', body: JSON.stringify({ amount, notes }) },
    ),
};
