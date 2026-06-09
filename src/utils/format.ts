/**
 * Format a service date for display. The API returns `service_date` as an ISO
 * datetime (e.g. "2026-06-30T18:30:00.000000Z"), but it may also be a plain
 * "YYYY-MM-DD" string — handle both, and fall back to the raw value if it can't
 * be parsed. Returns "" for empty input.
 */
export function formatServiceDate(d?: string | null): string {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** `formatServiceDate` plus an optional time suffix ("1 Jul 2026 · 14:00"). */
export function formatServiceDateTime(d?: string | null, time?: string | null): string {
  const date = formatServiceDate(d);
  if (!date) return '';
  return time ? `${date} · ${time}` : date;
}
