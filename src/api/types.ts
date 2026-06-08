export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'buyer' | 'vendor';
  avatar: string | null;
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
  rating: number | null;
  jobs_completed: number;
  is_premium: boolean;
  is_verified: boolean;
  description: string | null;
  avatar: string | null;
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

export interface Quotation {
  id: number;
  service_request_id: number;
  vendor_profile_id: number;
  amount: number;
  notes: string | null;
  valid_until: string | null;
  status: 'submitted' | 'accepted' | 'rejected' | 'withdrawn' | 'expired';
  submitted_at: string;
  accepted_at: string | null;
  vendor?: VendorProfile;
  service_request?: ServiceRequest;
}

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
  room_id: number;
  sender_id: number;
  type: 'text' | 'image' | 'file';
  body: string | null;
  attachment_url: string | null;
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
  vendor_profile_id: number;
  buyer_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  tags: string[];
  created_at: string;
  buyer?: User;
}

export interface KycDocument {
  id: number;
  buyer_id: number;
  doc_type: string;
  doc_number: string | null;
  file_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reject_reason: string | null;
  created_at: string;
}
