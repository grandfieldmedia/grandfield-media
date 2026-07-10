import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Service-role client — BYPASSES RLS. Server-only.
 * Use for the Stripe webhook, download-token verification, and the admin panel.
 * NEVER import this into client-side code.
 */
let _serviceClient: SupabaseClient | null = null;
export function getServiceClient(): SupabaseClient {
  if (!_serviceClient) {
    _serviceClient = createClient(
      env.SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }
  return _serviceClient;
}

/**
 * Anon (publishable) client — subject to RLS.
 * Safe for reading the public product catalog from the site.
 */
let _anonClient: SupabaseClient | null = null;
export function getAnonClient(): SupabaseClient {
  if (!_anonClient) {
    _anonClient = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
      auth: { persistSession: false },
    });
  }
  return _anonClient;
}

const PDF_BUCKET = 'product-files';

/** Returns a short-lived signed URL for a private PDF in Storage. */
export async function createSignedPdfUrl(
  storagePath: string,
  expiresInSeconds = 60 * 5
): Promise<string> {
  const { data, error } = await getServiceClient()
    .storage.from(PDF_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);

  if (error || !data) {
    throw new Error(`[shared-backend] Failed to sign PDF url: ${error?.message}`);
  }
  return data.signedUrl;
}
