import { randomBytes } from 'node:crypto';

/**
 * Opaque, unguessable download token placed in the email link.
 * Verification is a DB lookup on orders.download_token (see verifyDownloadToken).
 */
export function generateDownloadToken(): string {
  return randomBytes(32).toString('base64url');
}

const DEFAULT_EXPIRY_DAYS = 30;

/** ISO timestamp for when a download link should stop working. */
export function downloadExpiry(days = DEFAULT_EXPIRY_DAYS): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/** True if the given ISO expiry timestamp is in the past. */
export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}
