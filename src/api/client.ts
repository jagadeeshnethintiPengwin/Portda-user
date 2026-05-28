import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://portda.in/api';
export const TOKEN_KEY = '@portda:token';

/* ─── Logger ────────────────────────────────────────────────
   All logs are gated on __DEV__ so they're stripped from
   production bundles automatically.
────────────────────────────────────────────────────────────── */

const TAG = '[PORTDA API]';

function logRequest(method: string, url: string, opts: {
  auth: boolean;
  bodyType: 'json' | 'formdata' | 'none';
  body?: any;
}) {
  if (!__DEV__) return;
  const methodPad = method.padEnd(6);
  console.log(
    `\n${TAG} 🚀 REQUEST\n` +
    `  ${methodPad} ${url}\n` +
    `  Auth   : ${opts.auth ? '✓ Bearer token' : '✗ public'}\n` +
    `  Body   : ${
      opts.bodyType === 'formdata'
        ? 'FormData (multipart)'
        : opts.bodyType === 'json' && opts.body
          ? JSON.stringify(opts.body, null, 2).split('\n').join('\n  ')
          : 'none'
    }`,
  );
}

function logResponse(method: string, url: string, status: number, durationMs: number, data: any) {
  if (!__DEV__) return;
  const methodPad = method.padEnd(6);
  const statusIcon = status >= 200 && status < 300 ? '✅' : '⚠️';
  const preview = data === null || data === undefined
    ? 'null'
    : typeof data === 'object'
      ? Array.isArray(data)
        ? `Array(${data.length})`
        : `{${Object.keys(data).join(', ')}}`
      : String(data);

  console.log(
    `${TAG} ${statusIcon} RESPONSE  ${status}  +${durationMs}ms\n` +
    `  ${methodPad} ${url}\n` +
    `  Data   : ${preview}`,
  );
}

function logError(method: string, url: string, status: number, message: string, errors: Record<string, string[]> | undefined, durationMs: number) {
  if (!__DEV__) return;
  const methodPad = method.padEnd(6);
  const lines = [
    `${TAG} ❌ ERROR  ${status}  +${durationMs}ms`,
    `  ${methodPad} ${url}`,
    `  Message: ${message}`,
  ];
  if (errors && Object.keys(errors).length > 0) {
    lines.push('  Errors :');
    for (const [field, msgs] of Object.entries(errors)) {
      lines.push(`    • ${field}: ${msgs.join(', ')}`);
    }
  }
  console.warn(lines.join('\n'));
}

function logNetworkError(method: string, url: string, err: unknown) {
  if (!__DEV__) return;
  const methodPad = method.padEnd(6);
  // Use console.warn (not console.error) — console.error triggers RN's red-screen
  // overlay in dev mode before the calling catch-block can handle the error.
  console.warn(
    `${TAG} 🔴 NETWORK ERROR\n` +
    `  ${methodPad} ${url}\n` +
    `  ${err instanceof Error ? err.message : String(err)}\n` +
    `  Tip: Android emulator → use 10.0.2.2 instead of 127.0.0.1`,
  );
}

function logToken(action: 'STORE' | 'LOAD' | 'CLEAR', hasToken: boolean) {
  if (!__DEV__) return;
  const icon = action === 'STORE' ? '🔑' : action === 'CLEAR' ? '🗑 ' : '🔓';
  console.log(
    `${TAG} ${icon} TOKEN ${action}  ${hasToken ? '(present)' : '(empty)'}`,
  );
}

/* ─── Error class ───────────────────────────────────────── */

export class ApiError extends Error {
  readonly name = 'ApiError';
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

/* ─── Token helpers ─────────────────────────────────────── */

export async function getStoredToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  logToken('LOAD', !!token);
  return token;
}

export async function storeToken(token: string): Promise<void> {
  logToken('STORE', true);
  return AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  logToken('CLEAR', false);
  return AsyncStorage.removeItem(TOKEN_KEY);
}

/* ─── Core fetch wrapper ────────────────────────────────── */

export async function api<T>(
  path: string,
  opts: RequestInit = {},
  skipAuth = false,
): Promise<T> {
  const method = (opts.method ?? 'GET').toUpperCase();
  const url = `${BASE_URL}${path}`;

  const token = skipAuth ? null : await getStoredToken();
  const isFormData = opts.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(!isFormData && opts.body ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((opts.headers as Record<string, string>) ?? {}),
  };

  /* Parse body for logging before sending */
  let parsedBody: any;
  if (!isFormData && opts.body) {
    try { parsedBody = JSON.parse(opts.body as string); } catch { parsedBody = opts.body; }
  }

  logRequest(method, url, {
    auth: !!token,
    bodyType: isFormData ? 'formdata' : opts.body ? 'json' : 'none',
    body: parsedBody,
  });

  const t0 = Date.now();
  let res: Response;

  try {
    res = await fetch(url, { ...opts, headers });
  } catch (netErr) {
    logNetworkError(method, url, netErr);
    throw netErr;
  }

  const durationMs = Date.now() - t0;
  const json: any = await res.json().catch(() => ({}));

  if (!res.ok) {
    logError(method, url, res.status, json.message ?? `HTTP ${res.status}`, json.errors, durationMs);
    throw new ApiError(res.status, json.message ?? `HTTP ${res.status}`, json.errors);
  }

  const data = ('data' in json ? json.data : json) as T;
  logResponse(method, url, res.status, durationMs, data);
  return data;
}
