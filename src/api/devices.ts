import { Platform } from 'react-native';
import { api } from './client';

const DEVICE_NAME = Platform.select({ ios: 'iPhone', android: 'Android device', default: 'Device' });

export const devicesApi = {
  // POST /devices { token, platform, name } (api-user.md §4).
  registerToken: (token: string) =>
    api<void>('/devices', {
      method: 'POST',
      body: JSON.stringify({ token, platform: Platform.OS, name: DEVICE_NAME }),
    }),

  // POST /devices/remove { token } — call on logout.
  removeToken: (token: string) =>
    api<void>('/devices/remove', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};
