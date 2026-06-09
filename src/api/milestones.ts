import { api } from './client';
import type { Order } from './types';

/**
 * Per-milestone escrow actions for the buyer (APP_WORKFLOWS.md A.1 / B7).
 *
 * These endpoints are part of Appendix A and may not exist on the backend yet —
 * callers must catch `ApiError` (a 404/405 means "not shipped"; a 422 carries a
 * business-rule message such as "Finish and approve the previous milestone…").
 * Every call returns the updated `order` (with `milestones` + `escrow_hold`) so
 * the detail screen can re-render the whole loop.
 */
export const milestonesApi = {
  /** Pay (fund escrow for) a milestone — only the first not-yet-released one is payable. */
  fund: (id: number | string) =>
    api<Order>(`/milestones/${id}/fund`, { method: 'POST' }),

  /** Approve a vendor-submitted milestone — releases funds and unlocks the next. */
  approve: (id: number | string, feedback?: string) =>
    api<Order>(`/milestones/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify(feedback ? { feedback } : {}),
    }),

  /** Dispute a submitted milestone — sends it to admin; reason is required. */
  dispute: (id: number | string, reason: string) =>
    api<Order>(`/milestones/${id}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),
};
