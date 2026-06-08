import { api } from './client';
import type { ServiceRequest } from './types';

export interface CreateRequestPayload {
  port_id: number;
  category_id: number;
  subcategory_id?: number | null;
  vessel_name?: string;
  imo_number?: string;
  title: string;
  description?: string;
  service_date?: string;
  service_time?: string;
  currency?: string;
  budget_min?: number;
  budget_max?: number;
  urgency?: 'standard' | 'urgent' | 'critical';
  expires_at?: string;
  attachments?: string[];
}

export interface RequestFilters {
  status?: string;
  port_id?: number;
  category_id?: number;
  q?: string;
  page?: number;
}

export const requestsApi = {
  list: (filters: RequestFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.port_id) params.set('port_id', String(filters.port_id));
    if (filters.category_id) params.set('category_id', String(filters.category_id));
    if (filters.q) params.set('q', filters.q);
    if (filters.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return api<ServiceRequest[]>(`/requests${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) => api<ServiceRequest>(`/requests/${id}`),

  create: (data: CreateRequestPayload) =>
    api<ServiceRequest>('/requests', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number | string, data: Partial<CreateRequestPayload>) =>
    api<ServiceRequest>(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  cancel: (id: number | string) =>
    api<ServiceRequest>(`/requests/${id}/cancel`, { method: 'POST' }),

  delete: (id: number | string) =>
    api<void>(`/requests/${id}`, { method: 'DELETE' }),
};
