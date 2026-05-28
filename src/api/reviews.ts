import { api } from './client';
import type { Review } from './types';

export const reviewsApi = {
  list: (vendor_id?: number) => {
    const qs = vendor_id ? `?vendor_id=${vendor_id}` : '';
    return api<Review[]>(`/reviews${qs}`);
  },

  create: (data: {
    order_id: number;
    rating: number;
    title?: string;
    body?: string;
    tags?: string[];
  }) =>
    api<Review>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
};
