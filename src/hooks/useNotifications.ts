import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  registerForRemoteMessages,
  requestNotificationPermission,
  setupNotificationListeners,
  syncFCMToken,
  removeFCMToken,
} from '../services/notifications';

/**
 * Wires Firebase Cloud Messaging to the app's auth state.
 *
 * Must be called inside <AuthProvider> (needs useAuth).
 *
 * - On mount       : registers with APNs (iOS), requests permission, sets up listeners
 * - On login       : syncs FCM token with backend
 * - On logout      : removes FCM token from backend + deletes local token
 * - On unmount     : cleans up all listeners
 */
export function useNotifications(): void {
  const { user } = useAuth();
  const prevUserIdRef = useRef<number | null>(null);

  /* isLoggedIn() is passed into setupNotificationListeners so the token-refresh
     handler can guard itself without closing over a stale value. */
  const isLoggedIn = useCallback(() => !!user, [user]);

  /* ── One-time setup ───────────────────────────────────────── */
  useEffect(() => {
    registerForRemoteMessages();   // iOS APNs (no-op on Android)
    requestNotificationPermission(); // OS permission prompt

    const cleanup = setupNotificationListeners(isLoggedIn);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Auth-state change ────────────────────────────────────── */
  useEffect(() => {
    const prevId = prevUserIdRef.current;
    const currId = user?.id ?? null;
    prevUserIdRef.current = currId;

    if (currId !== null && prevId === null) {
      /* User just logged in — register FCM token with backend */
      syncFCMToken();
    } else if (currId === null && prevId !== null) {
      /* User just logged out — clean up FCM token */
      removeFCMToken();
    }
  }, [user?.id]);
}
