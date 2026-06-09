export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'buyer' | 'vendor';
  avatar: string | null;
  /** Absolute, ready-to-render avatar URL (api-user.md §4) — prefer over building it. */
  avatar_url?: string | null;
  buyer_profile?: BuyerProfile;
  active_subscription?: Subscription | null;
}

export interface BuyerProfile {
  id: number;
  company_name: string | null;
  imo_number: string | null;
  gst_number: string | null;
  billing_address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  default_port_id: number | null;
}

export interface Subscription {
  id: number;
  plan: string;
  status: string;
  expires_at: string;
}

export interface Port {
  id: number;
  name: string;
  code: string;
  /** Geographic region, e.g. "South" (returned by `/catalog/ports`). */
  region: string | null;
  /** City is not returned by every backend build — keep optional. */
  city?: string | null;
  country: string;
}

export interface HeroSlide {
  id: number;
  title: string;
  subtitle: string | null;
  image_path: string | null;
  cta_text: string | null;
  cta_url: string | null;
  display_order: number;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  name: string;
  slug: string;
  category_id: number;
}

export interface VendorProfile {
  id: number;
  user_id: number;
  company_name: string;
  // The API returns rating as a STRING ("4.90"). Coerce with Number() before formatting.
  rating: number | string | null;
  rating_count?: number;
  jobs_completed: number;
  is_premium: boolean;
  // The API exposes `verification_status` ("verified"|…), not a boolean `is_verified`.
  verification_status?: string | null;
  is_verified?: boolean;
  // The API field is `bio`; `description` is kept for older payloads. Use vendorBio().
  bio?: string | null;
  description?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  avatar?: string | null;
  user?: User;
}

export interface ServiceRequest {
  id: number;
  reference: string;
  buyer_id: number;
  port_id: number;
  category_id: number;
  subcategory_id: number | null;
  vessel_name: string | null;
  imo_number: string | null;
  title: string;
  description: string | null;
  service_date: string | null;
  service_time: string | null;
  budget_min: number | null;
  budget_max: number | null;
  urgency: 'standard' | 'urgent' | 'critical';
  status: 'open' | 'quoted' | 'awarded' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  port?: Port;
  category?: Category;
  quotations_count?: number;
  quotations?: Quotation[];
}

export interface QuotationDocument {
  name?: string | null;
  url?: string | null;
  path?: string | null;
  size?: string | number | null;
  pages?: number | null;
  created_at?: string | null;
}

export interface Quotation {
  id: number;
  service_request_id: number;
  vendor_profile_id: number;
  amount: number;
  currency?: string | null;
  notes: string | null;
  line_items?: { label: string; amount: number | string }[] | null;
  valid_until: string | null;
  status: 'submitted' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  submitted_at: string;
  accepted_at: string | null;
  vendor?: VendorProfile;
  service_request?: ServiceRequest;
  // Quotation document — the live API exposes a relative `document_path` (+ name/size)
  // for the vendor's file, and `admin_document_path` for an official PORTDA-issued doc.
  document_path?: string | null;
  document_name?: string | null;
  document_size?: string | number | null;
  document_uploaded_at?: string | null;
  admin_document_path?: string | null;
  admin_document_name?: string | null;
  admin_document_size?: string | number | null;
  admin_document_uploaded_at?: string | null;
  // Older/alternate shapes — still resolved defensively in the UI.
  documents?: QuotationDocument[] | null;
  document_url?: string | null;
  attachment_url?: string | null;
  attachment_path?: string | null;
}

/** A staged payment within an order (APP_WORKFLOWS.md A.0 / B7). */
export type MilestoneStatus =
  | 'pending' | 'funded' | 'in_progress' | 'submitted' | 'approved' | 'released' | 'disputed' | 'refunded';

export interface Milestone {
  id: number;
  sequence: number;
  title: string;
  description: string | null;
  amount: number | string;
  currency: string | null;
  status: MilestoneStatus;
  vendor_notes: string | null;
  buyer_feedback: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  released_at: string | null;
}

/** Escrow hold backing an order (APP_WORKFLOWS.md A.0). */
export type EscrowStatus = 'awaiting_funding' | 'partial' | 'held' | 'released' | 'refunded';

export interface EscrowHold {
  id: number;
  reference: string;
  status: EscrowStatus;
  /** `upfront` = whole order funded at once; `per_milestone` = staged. */
  funding_mode: 'upfront' | 'per_milestone';
  amount_held: number | string;
  amount_released: number | string;
  amount_refunded: number | string;
  currency: string | null;
}

/** Vendor-initiated abort lifecycle (APP_WORKFLOWS.md A.2 / B7). */
export type AbortStatus = null | 'requested' | 'escalated' | 'aborted' | 'rejected';

export interface Order {
  id: number;
  reference: string;
  buyer_id: number;
  vendor_profile_id: number;
  service_request_id: number;
  quotation_id: number;
  subtotal: number;
  commission: number;
  total: number;
  status: 'placed' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  payment_status: 'pending' | 'paid' | 'partially_paid' | 'refunded' | 'failed';
  cancel_reason: string | null;
  scheduled_at: string | null;
  created_at: string;
  service_request?: ServiceRequest;
  quotation?: Quotation;
  buyer?: User;
  vendor?: VendorProfile;
  payments?: Payment[];
  invoice?: Invoice | null;
  review?: Review | null;
  events?: OrderEvent[];
  // Milestone / escrow (A.0) — present once the backend ships Appendix A; UI degrades when absent.
  milestones?: Milestone[] | null;
  escrow_hold?: EscrowHold | null;
  // Abort lifecycle (A.2).
  abort_status?: AbortStatus;
  abort_reason?: string | null;
  abort_requested_at?: string | null;
}

export interface Payment {
  id: number;
  order_id: number;
  reference: string;
  amount: number;
  method: string;
  status: 'initiated' | 'pending' | 'success' | 'failed' | 'refunded';
  gateway_txn_id: string | null;
  utr_number: string | null;
  created_at: string;
}

export interface GatewayInfo {
  order_id: string;
  checkout_url?: string;
  key?: string;
}

export interface PaymentInitiateResponse {
  payment: Payment;
  gateway: GatewayInfo;
}

export interface Invoice {
  id: number;
  order_id: number;
  number: string;
  url: string | null;
  issued_at: string;
}

export interface OrderEvent {
  id: number;
  type: string;
  description: string;
  created_at: string;
}

export interface ChatRoom {
  id: number;
  buyer_id: number;
  vendor_user_id: number;
  service_request_id: number | null;
  order_id: number | null;
  last_message?: ChatMessage;
  unread_count?: number;
  counterparty?: User;
}

export interface ChatMessage {
  id: number;
  // The send response uses `chat_room_id`; list/room responses may use `room_id`.
  room_id?: number;
  chat_room_id?: number;
  sender_id: number;
  type: 'text' | 'image' | 'file';
  body: string | null;
  // Attachments come back as a full `attachment_url` or a storage `attachment_path`.
  attachment_url?: string | null;
  attachment_path?: string | null;
  created_at: string;
  read_at: string | null;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, any> | null;
  read_at: string | null;
  created_at: string;
}

export interface Dashboard {
  open_requests: number;
  awaiting_quotes: number;
  pending_orders: number;
  completed_orders: number;
  total_spent: number;
  recent_requests: ServiceRequest[];
  recent_orders: Order[];
  unread_notifications: number;
}

export interface Review {
  id: number;
  order_id: number;
  // The API field is `vendor_id` (the vendor profile id); keep the old name optional.
  vendor_id?: number;
  vendor_profile_id?: number;
  buyer_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  tags: string[];
  status?: string;
  // Vendor's public reply to the review.
  vendor_reply?: string | null;
  replied_at?: string | null;
  created_at: string;
  updated_at?: string;
  buyer?: User;
  vendor?: { id: number; name: string; avatar?: string | null; avatar_url?: string | null };
  order?: Order;
}

export interface KycDocument {
  id: number;
  user_id?: number;
  buyer_id?: number;
  doc_type: string;
  doc_number: string | null;
  // The API returns a relative `file_path` (+ `original_name`); `file_url` may be absent.
  file_path?: string | null;
  file_url?: string | null;
  original_name?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason: string | null;
  created_at: string;
}
