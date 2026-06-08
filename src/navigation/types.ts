/**
 * Portda — typed navigation param lists.
 *
 * Every screen that receives route params lists them here.
 * Screens that take NO params are typed as `undefined`.
 *
 * Usage:
 *   import type { NativeStackScreenProps } from '@react-navigation/native-stack';
 *   import type { AuthStackParamList } from '@navigation/types';
 *
 *   type Props = NativeStackScreenProps<AuthStackParamList, 'Otp'>;
 */

import type { NavigatorScreenParams } from '@react-navigation/native';

/* ─────────────────────────  Auth Stack  ───────────────────────── */

export type AuthStackParamList = {
  Login: undefined;
  Otp: { identifier: string; display: string };
  EmailLogin: { email?: string } | undefined;
  Forgot: undefined;
  /** `token` is optional – deep-link resets may or may not pre-supply it */
  ResetPassword: { token?: string };
  Register: undefined;
  SessionExpired: undefined;
};

/* ─────────────────────────  Main Tab  ─────────────────────────── */

export type MainTabParamList = {
  Home: undefined;
  Requests: undefined;
  Vendors: { q?: string; category_id?: number; subcategory_id?: number; categoryName?: string } | undefined;
  Chat: undefined;
  Orders: undefined;
};

/* ─────────────────────────  Root Stack  ───────────────────────── */

export type RootStackParamList = {
  // ── Onboarding ──────────────────────────────────────────────
  Splash: undefined;
  WelcomePitch: undefined;
  NotificationPermission: undefined;
  GetStarted: undefined;

  // ── Nested navigators ────────────────────────────────────────
  Auth: NavigatorScreenParams<AuthStackParamList> | undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;

  // ── Home stack ───────────────────────────────────────────────
  Search: undefined;
  Categories: undefined;
  Subcategory: { categoryId: string; name: string };

  // ── Chat ─────────────────────────────────────────────────────
  ChatThread: { threadId: string; vendorName: string };

  // ── Notifications ────────────────────────────────────────────
  Notifications: undefined;
  NotificationDetails: { notificationId: string; title?: string; body?: string; notificationType?: string; refId?: string };
  PushPreview: undefined;

  // ── Reviews ──────────────────────────────────────────────────
  RateVendor: { vendorId: string; orderId: string };
  WriteReview: { vendorId: string; orderId: string; rating: number };
  ReviewsList: { vendorId: string };

  // ── Service request flow ─────────────────────────────────────
  CreateRequest: { serviceId: string; serviceName: string } | undefined;
  SelectServiceType: undefined;
  SelectSubservice: { serviceTypeId: string };
  AttachDocs: undefined;
  ScheduleWindow: undefined;
  PortBerth: undefined;
  RequestPreview: undefined;
  RequestSuccess: { requestId: string };

  // ── Quotations ───────────────────────────────────────────────
  RequestDetails: { requestId: string };
  QuotationsList: { requestId: string };
  QuotationDetails: { quotationId: string };
  VendorProfile: { vendorId: string };
  ApproveQuotation: { quotationId: string };
  RejectQuotation: { quotationId: string };
  CounterOffer: { quotationId: string };

  // ── Orders ───────────────────────────────────────────────────
  OrderDetails: { orderId: string };
  OrderStatus: { orderId: string };
  InProgress: { orderId: string };
  CompletedOrder: { orderId: string };
  CancelOrder: { orderId: string };
  Reschedule: { orderId: string };

  // ── Payments ─────────────────────────────────────────────────
  PaymentSummary: { orderId: string };
  PaymentMethods: { orderId: string };
  NeftTransfer: { orderId: string };
  PendingVerification: { orderId: string };
  Razorpay: { orderId: string; amount: number; paymentId: string };
  PaymentSuccess: { orderId: string };
  PaymentFailed: { orderId: string };
  TransactionHistory: undefined;

  // ── Profile ──────────────────────────────────────────────────
  Profile: undefined;
  EditProfile: undefined;
  ChangeContact: { field: 'phone' | 'email' };
  ChangePassword: undefined;
  HelpFaq: undefined;
  ContactSupport: undefined;

  // ── Settings ─────────────────────────────────────────────────
  Terms: undefined;
  Privacy: undefined;
  About: undefined;
  LogoutConfirm: undefined;
  DeleteAccount: undefined;
};
