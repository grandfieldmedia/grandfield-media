/** Client-safe helpers for shared-ui (no server/backend imports). */

/** Formats a cents amount, e.g. 2900 -> "$29". Drops cents when whole. */
export function formatPrice(cents: number, currency = 'USD', locale = 'en-US'): string {
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
  }).format(cents / 100);
}

/** Formats an ISO/date as "July 10, 2026". */
export function formatDate(date: Date | string, locale = 'en-US'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });
}
