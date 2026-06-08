import { Platform } from 'react-native';
import { api } from './client';

export const devicesApi = {
  registerToken: (fcm_token: string) =>
    api<void>('/devices', {
      method: 'POST',
      body: JSON.stringify({ fcm_token, platform: Platform.OS }),
    }),

  removeToken: (fcm_token: string) =>
    api<void>('/devices', {
      method: 'DELETE',
      body: JSON.stringify({ fcm_token }),
    }),
};
