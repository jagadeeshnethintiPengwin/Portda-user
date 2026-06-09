import { api } from './client';
import type { VendorProfile } from './types';

/**
 * Whether a vendor is verified. The API exposes `verification_status` ("verified"),
 * not a boolean `is_verified` — older payloads may carry either, so honour both.
 */
export function vendorVerified(v?: Partial<VendorProfile> | null): boolean {
  if (!v) return false;
  return v.is_verified === true || v.verification_status === 'verified';
}

/** Vendor blurb — the API field is `bio`; fall back to `description`. */
export function vendorBio(v?: Partial<VendorProfile> | null): string | null {
  return v?.bio ?? v?.description ?? null;
}

export interface VendorFilters {
  port_id?: number;
  category_id?: number;
  subcategory_id?: number;
  q?: string;
  min_rating?: number;
  premium_only?: boolean;
  page?: number;
}

export const vendorsApi = {
  list: (filters: VendorFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.port_id) params.set('port_id', String(filters.port_id));
    if (filters.category_id) params.set('category_id', String(filters.category_id));
    if (filters.subcategory_id) params.set('subcategory_id', String(filters.subcategory_id));
    if (filters.q) params.set('q', filters.q);
    if (filters.min_rating) params.set('min_rating', String(filters.min_rating));
    if (filters.premium_only) params.set('premium_only', '1');
    if (filters.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return api<VendorProfile[]>(`/vendors${qs ? `?${qs}` : ''}`);
  },

  // GET /vendors/{id} returns { vendor, reviews }; the list endpoint is flat.
  // Unwrap so callers always receive a flat VendorProfile.
  get: async (vendorProfileId: number | string): Promise<VendorProfile> => {
    const data = await api<any>(`/vendors/${vendorProfileId}`);
    return (data?.vendor ?? data) as VendorProfile;
  },
};
