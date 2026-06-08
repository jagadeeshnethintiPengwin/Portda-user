import { api } from './client';
import type { Payment, PaymentInitiateResponse } from './types';

export interface PaymentFilters {
  status?: string;
  method?: string;
  page?: number;
}

export const paymentsApi = {
  list: (filters: PaymentFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.method) params.set('method', filters.method);
    if (filters.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return api<Payment[]>(`/payments${qs ? `?${qs}` : ''}`);
  },

  get: (id: number | string) => api<Payment>(`/payments/${id}`),

  // Platform bank coordinates + steps for the NEFT/RTGS offline screen.
  offlineInstructions: () =>
    api<{
      bank_name?: string;
      account_name?: string;
      account_no?: string;
      ifsc?: string;
      branch?: string;
      steps?: string[];
      [k: string]: any;
    }>('/payments/offline-instructions'),

  initiate: (order_id: number | string, amount: number, method: string) =>
    api<PaymentInitiateResponse>(
      '/payments/initiate',
      { method: 'POST', body: JSON.stringify({ order_id, amount, method }) },
    ),

  confirm: (id: number | string, gateway_txn_id?: string) =>
    api<Payment>(
      `/payments/${id}/confirm`,
      gateway_txn_id
        ? { method: 'POST', body: JSON.stringify({ gateway_txn_id }) }
        : { method: 'POST' },
    ),

  offline: (
    order_id: number | string,
    amount: number,
    method: 'neft' | 'rtgs',
    utr_number: string,
    proof?: { uri: string; name: string; type: string },
  ) => {
    const formData = new FormData();
    formData.append('order_id', String(order_id));
    formData.append('amount', String(amount));
    formData.append('method', method);
    formData.append('utr_number', utr_number);
    if (proof) {
      formData.append('proof', { uri: proof.uri, name: proof.name, type: proof.type } as any);
    }
    return api<Payment>('/payments/offline', { method: 'POST', body: formData });
  },
};
