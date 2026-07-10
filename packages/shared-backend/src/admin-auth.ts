import { env } from './env.js';

/** Parses the ADMIN_EMAILS whitelist (comma-separated) into a normalized set. */
export function adminEmailWhitelist(): Set<string> {
  return new Set(
    env.ADMIN_EMAILS.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

/** True if the given email is allowed to access the shared admin panel. */
export function isAllowedAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmailWhitelist().has(email.trim().toLowerCase());
}
