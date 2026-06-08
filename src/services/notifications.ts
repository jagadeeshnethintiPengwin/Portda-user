/**
 * Firebase Cloud Messaging service.
 *
 * Split into two groups:
 *   - AUTH-FREE  : permission request, listener setup, cold-start check
 *   - AUTH-GATED : syncFCMToken / removeFCMToken  (call only when logged in)
 */
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import { devicesApi } from '../api/devices';
import { navigationRef } from '../navigation/navigationRef';

const TAG = '[FCM]';

/* ─────────────────────── AUTH-FREE ───────────────────────── */

/**
 * iOS only: register with APNs so we can receive remote messages.
 * No-op on Android. Safe to call before login.
 */
export async function registerForRemoteMessages(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    await messaging().registerDeviceForRemoteMessages();
  } catch (err) {
    if (__DEV__) console.warn(TAG, 'registerDeviceForRemoteMessages failed:', err);
  }
}

/**
 * Ask the OS for notification permission.
 * Returns true if AUTHORIZED or PROVISIONAL.
 * Safe to call before login.
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const status = await messaging().requestPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch (err) {
    if (__DEV__) console.warn(TAG, 'requestPermission failed:', err);
    return false;
  }
}

/**
 * Check the current permission status without prompting.
 */
export async function hasNotificationPermission(): Promise<boolean> {
  try {
    const status = await messaging().hasPermission();
    return (
      status === messaging.AuthorizationStatus.AUTHORIZED ||
      status === messaging.AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

/* ─────────────────────── NAVIGATION ──────────────────────── */

function navigateFromMessage(data?: Record<string, string>): void {
  if (!data || !navigationRef.isReady()) return;
  const { type, id, room_id, vendor_name } = data;

  switch (type) {
    case 'quotation.received':
      if (id) navigationRef.navigate('QuotationDetails', { quotationId: id });
      break;
    case 'order.started':
    case 'order.completed':
    case 'order.cancelled':
      if (id) navigationRef.navigate('OrderDetails', { orderId: id });
      break;
    case 'chat.message':
      if (room_id)
        navigationRef.navigate('ChatThread', {
          threadId: room_id,
          vendorName: vendor_name ?? '',
        });
      break;
    case 'payment.received':
      navigationRef.navigate('TransactionHistory', undefined);
      break;
    default:
      navigationRef.navigate('Notifications', undefined);
      break;
  }
}

/* ─────────────────────── LISTENERS ───────────────────────── */

/**
 * Set up foreground + background-to-foreground listeners.
 * Returns a cleanup function — call it on unmount.
 * Safe to call before login (no API calls inside).
 *
 * The token-refresh listener updates the backend only if a previous
 * registration existed; it is a no-op when isLoggedIn is false.
 */
export function setupNotificationListeners(
  isLoggedIn: () => boolean,
): () => void {
  const cleanups: Array<() => void> = [];

  try {
    /* Foreground message → in-app alert with "View" tap-to-navigate */
    cleanups.push(
      messaging().onMessage(async (msg: FirebaseMessagingTypes.RemoteMessage) => {
        const title = msg.notification?.title ?? 'Portda';
        const body = msg.notification?.body ?? '';
        Alert.alert(title, body, [
          { text: 'Dismiss', style: 'cancel' },
          {
            text: 'View',
            onPress: () =>
              navigateFromMessage(msg.data as Record<string, string>),
          },
        ]);
      }),
    );
  } catch (err) {
    if (__DEV__) console.warn(TAG, 'onMessage setup failed:', err);
  }

  try {
    /* Background → foreground tap */
    cleanups.push(
      messaging().onNotificationOpenedApp(
        (msg: FirebaseMessagingTypes.RemoteMessage) => {
          navigateFromMessage(msg.data as Record<string, string>);
        },
      ),
    );
  } catch (err) {
    if (__DEV__) console.warn(TAG, 'onNotificationOpenedApp setup failed:', err);
  }

  try {
    /* Token refresh — only re-register when the user is authenticated */
    cleanups.push(
      messaging().onTokenRefresh(async (token: string) => {
        if (!isLoggedIn()) return;
        await devicesApi.registerToken(token).catch(() => {});
      }),
    );
  } catch (err) {
    if (__DEV__) console.warn(TAG, 'onTokenRefresh setup failed:', err);
  }

  return () => cleanups.forEach(fn => fn());
}

/**
 * Check if the app was opened by tapping a notification (cold start).
 * Call this after the NavigationContainer is ready.
 */
export async function handleInitialNotification(): Promise<void> {
  try {
    const msg = await messaging().getInitialNotification();
    if (msg) {
      navigateFromMessage(msg.data as Record<string, string>);
    }
  } catch (err) {
    if (__DEV__) console.warn(TAG, 'getInitialNotification failed:', err);
  }
}

/* ─────────────────────── AUTH-GATED ──────────────────────── */

/**
 * Get FCM token and register it with the backend.
 * MUST be called only when the user is authenticated.
 */
export async function syncFCMToken(): Promise<void> {
  try {
    const token = await messaging().getToken();
    if (token) {
      await devicesApi.registerToken(token);
    }
  } catch (err) {
    /* Silently absorb — app works without push if this fails */
    if (__DEV__) console.warn(TAG, 'syncFCMToken failed:', err);
  }
}

/**
 * Unregister the FCM token from the backend and delete it locally.
 * MUST be called when the user logs out.
 */
export async function removeFCMToken(): Promise<void> {
  try {
    const token = await messaging().getToken();
    if (token) {
      await devicesApi.removeToken(token).catch(() => {});
      await messaging().deleteToken();
    }
  } catch (err) {
    if (__DEV__) console.warn(TAG, 'removeFCMToken failed:', err);
  }
}
