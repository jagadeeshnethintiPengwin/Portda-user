import { api } from './client';
import type { Quotation, Order } from './types';

export interface QuotationFilters {
  status?: string;
  service_request_id?: number;
  page?: number;
}

/**
 * On the quotation read, the API nests `vendor` as the *User* with the vendor's
 * `vendor_profile` inside it (company_name/rating/verification_status live there,
 * not on the user). Flatten to a VendorProfile (with `user` attached) so screens
 * can read `vendor.company_name` / `vendor.rating` / `vendor.verification_status`
 * consistently — matching the shape they get from other endpoints.
 */
function normalizeQuotation(q: any): Quotation {
  const v = q?.vendor;
  if (v && typeof v === 'object' && v.vendor_profile) {
    return { ...q, vendor: { ...v.vendor_profile, user: v } };
  }
  return q as Quotation;
}

export const quotationsApi = {
  list: async (filters: QuotationFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.service_request_id)
      params.set('service_request_id', String(filters.service_request_id));
    if (filters.page) params.set('page', String(filters.page));
    const qs = params.toString();
    const data = await api<any[]>(`/quotations${qs ? `?${qs}` : ''}`);
    return (Array.isArray(data) ? data : []).map(normalizeQuotation);
  },

  get: async (id: number | string) => normalizeQuotation(await api<any>(`/quotations/${id}`)),

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
