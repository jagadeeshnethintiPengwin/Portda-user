import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabBar } from '@components/TabBar';
import type { AuthStackParamList, MainTabParamList, RootStackParamList } from './types';

import {
  SplashScreen,
  WelcomePitchScreen,
  NotificationPermissionScreen,
  GetStartedScreen,
} from '@screens/onboarding';
import {
  LoginScreen,
  OtpScreen,
  EmailLoginScreen,
  ForgotScreen,
  ResetPasswordScreen,
  RegisterScreen,
  SessionExpiredScreen,
} from '@screens/auth';
import {
  HomeDashboardScreen,
  SearchScreen,
  CategoriesScreen,
  SubcategoryScreen,
  FeaturedVendorsScreen,
} from '@screens/home';
import { ChatListScreen, ChatThreadScreen } from '@screens/chat';
import {
  NotificationsScreen,
  NotificationDetailsScreen,
  PushPreviewScreen,
} from '@screens/notification';
import {
  RateVendorScreen,
  WriteReviewScreen,
  ReviewsListScreen,
} from '@screens/review';
import {
  CreateRequestScreen,
  SelectServiceTypeScreen,
  SelectSubserviceScreen,
  AttachDocsScreen,
  ScheduleWindowScreen,
  PortBerthScreen,
  RequestPreviewScreen,
  RequestSuccessScreen,
} from '@screens/request';
import {
  MyRequestsScreen,
  RequestDetailsScreen,
  QuotationsListScreen,
  QuotationDetailsScreen,
  VendorProfileScreen,
  ApproveQuotationScreen,
  RejectQuotationScreen,
  CounterOfferScreen,
} from '@screens/quotation';
import {
  MyOrdersScreen,
  OrderDetailsScreen,
  OrderStatusScreen,
  InProgressScreen,
  CompletedOrderScreen,
  CancelOrderScreen,
  RescheduleScreen,
} from '@screens/order';
import {
  PaymentSummaryScreen,
  PaymentMethodsScreen,
  NeftTransferScreen,
  PendingVerificationScreen,
  RazorpayScreen,
  PaymentSuccessScreen,
  PaymentFailedScreen,
  TransactionHistoryScreen,
} from '@screens/payment';
import {
  ProfileScreen,
  EditProfileScreen,
  ChangeContactScreen,
  ChangePasswordScreen,
  HelpFaqScreen,
  ContactSupportScreen,
} from '@screens/profile';
import {
  TermsScreen,
  PrivacyScreen,
  AboutScreen,
  LogoutConfirmScreen,
  DeleteAccountScreen,
} from '@screens/settings';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const screenOpts = { headerShown: false, animation: 'slide_from_right' as const };

const AuthNavigator = () => (
  <AuthStack.Navigator screenOptions={{ headerShown: false }}>
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Otp" component={OtpScreen} />
    <AuthStack.Screen name="EmailLogin" component={EmailLoginScreen} />
    <AuthStack.Screen name="Forgot" component={ForgotScreen} />
    <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    <AuthStack.Screen name="Register" component={RegisterScreen} />
    <AuthStack.Screen name="SessionExpired" component={SessionExpiredScreen} />
  </AuthStack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator tabBar={props => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Home" component={HomeDashboardScreen} />
    <Tab.Screen name="Requests" component={MyRequestsScreen} />
    <Tab.Screen name="Vendors" component={FeaturedVendorsScreen} />
    <Tab.Screen name="Chat" component={ChatListScreen} />
    <Tab.Screen name="Orders" component={MyOrdersScreen} />
  </Tab.Navigator>
);

export const RootNavigator: React.FC = () => (
  <RootStack.Navigator screenOptions={screenOpts} initialRouteName="Splash">
    <RootStack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
    <RootStack.Screen name="WelcomePitch" component={WelcomePitchScreen} />
    <RootStack.Screen name="NotificationPermission" component={NotificationPermissionScreen} />
    <RootStack.Screen name="GetStarted" component={GetStartedScreen} />

    <RootStack.Screen name="Auth" component={AuthNavigator} />

    <RootStack.Screen name="Main" component={MainTabs} />

    <RootStack.Screen name="Search" component={SearchScreen} options={{ animation: 'fade' }} />
    <RootStack.Screen name="Categories" component={CategoriesScreen} />
    <RootStack.Screen name="Subcategory" component={SubcategoryScreen} />

    <RootStack.Screen name="ChatThread" component={ChatThreadScreen} />

    <RootStack.Screen name="Notifications" component={NotificationsScreen} />
    <RootStack.Screen name="NotificationDetails" component={NotificationDetailsScreen} />
    <RootStack.Screen name="PushPreview" component={PushPreviewScreen} />

    <RootStack.Screen name="RateVendor" component={RateVendorScreen} />
    <RootStack.Screen name="WriteReview" component={WriteReviewScreen} />
    <RootStack.Screen name="ReviewsList" component={ReviewsListScreen} />

    <RootStack.Screen name="CreateRequest" component={CreateRequestScreen} />
    <RootStack.Screen name="SelectServiceType" component={SelectServiceTypeScreen} />
    <RootStack.Screen name="SelectSubservice" component={SelectSubserviceScreen} />
    <RootStack.Screen name="AttachDocs" component={AttachDocsScreen} />
    <RootStack.Screen name="ScheduleWindow" component={ScheduleWindowScreen} />
    <RootStack.Screen name="PortBerth" component={PortBerthScreen} />
    <RootStack.Screen name="RequestPreview" component={RequestPreviewScreen} />
    <RootStack.Screen name="RequestSuccess" component={RequestSuccessScreen} />

    <RootStack.Screen name="RequestDetails" component={RequestDetailsScreen} />
    <RootStack.Screen name="QuotationsList" component={QuotationsListScreen} />
    <RootStack.Screen name="QuotationDetails" component={QuotationDetailsScreen} />
    <RootStack.Screen name="VendorProfile" component={VendorProfileScreen} />
    <RootStack.Screen name="ApproveQuotation" component={ApproveQuotationScreen} />
    <RootStack.Screen name="RejectQuotation" component={RejectQuotationScreen} options={{ animation: 'fade', presentation: 'transparentModal' }} />
    <RootStack.Screen name="CounterOffer" component={CounterOfferScreen} />

    <RootStack.Screen name="OrderDetails" component={OrderDetailsScreen} />
    <RootStack.Screen name="OrderStatus" component={OrderStatusScreen} />
    <RootStack.Screen name="InProgress" component={InProgressScreen} />
    <RootStack.Screen name="CompletedOrder" component={CompletedOrderScreen} />
    <RootStack.Screen name="CancelOrder" component={CancelOrderScreen} />
    <RootStack.Screen name="Reschedule" component={RescheduleScreen} />

    <RootStack.Screen name="PaymentSummary" component={PaymentSummaryScreen} />
    <RootStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
    <RootStack.Screen name="NeftTransfer" component={NeftTransferScreen} />
    <RootStack.Screen name="PendingVerification" component={PendingVerificationScreen} />
    <RootStack.Screen name="Razorpay" component={RazorpayScreen} options={{ animation: 'slide_from_bottom', presentation: 'transparentModal' }} />
    <RootStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} options={{ animation: 'fade' }} />
    <RootStack.Screen name="PaymentFailed" component={PaymentFailedScreen} options={{ animation: 'fade' }} />
    <RootStack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />

    {/* Profile */}
    <RootStack.Screen name="Profile" component={ProfileScreen} />
    <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
    <RootStack.Screen name="ChangeContact" component={ChangeContactScreen} />
    <RootStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    <RootStack.Screen name="HelpFaq" component={HelpFaqScreen} />
    <RootStack.Screen name="ContactSupport" component={ContactSupportScreen} />

    {/* Settings */}
    <RootStack.Screen name="Terms" component={TermsScreen} />
    <RootStack.Screen name="Privacy" component={PrivacyScreen} />
    <RootStack.Screen name="About" component={AboutScreen} />
    <RootStack.Screen name="LogoutConfirm" component={LogoutConfirmScreen} options={{ animation: 'fade', presentation: 'transparentModal' }} />
    <RootStack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
  </RootStack.Navigator>
);
