import { createMMKV } from 'react-native-mmkv';

/**
 * App-wide synchronous key-value store (MMKV — fast, persisted to disk).
 * Use this for small UI/preference state. Auth tokens stay in AsyncStorage
 * (see api/client.ts) so we don't change the existing session contract.
 */
export const storage = createMMKV({ id: 'portda' });

const SELECTED_PORT_KEY = 'selected_port';

export interface StoredPort {
  id: number;
  name: string;
}

/** The buyer's last-chosen port location, or null if none saved yet. */
export function getSelectedPort(): StoredPort | null {
  const raw = storage.getString(SELECTED_PORT_KEY);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return v && typeof v.id === 'number' ? (v as StoredPort) : null;
  } catch {
    return null;
  }
}

export function setSelectedPort(port: StoredPort | null): void {
  if (port) storage.set(SELECTED_PORT_KEY, JSON.stringify(port));
  else storage.remove(SELECTED_PORT_KEY);
}

/** Boolean preference (e.g. notification toggles). Returns `fallback` if unset. */
export function getBoolPref(key: string, fallback = true): boolean {
  const v = storage.getBoolean(key);
  return v === undefined ? fallback : v;
}

export function setBoolPref(key: string, value: boolean): void {
  storage.set(key, value);
}
