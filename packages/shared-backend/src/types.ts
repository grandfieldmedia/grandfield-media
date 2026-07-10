/** Shared domain types, mirroring the Supabase schema (supabase/migrations). */

export type OrderStatus = 'pending' | 'completed' | 'refunded' | 'failed';

export interface Product {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number; // cents
  storage_path: string | null;
  active: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  site_id: string;
  email: string;
  product_id: string | null;
  stripe_session_id: string | null;
  amount: number; // cents
  status: OrderStatus;
  download_token: string | null;
  downloaded: boolean;
  downloaded_at: string | null;
  refund_status: string | null;
  refund_reason: string | null;
  refund_notes: string | null;
  created_at: string;
  expires_at: string | null;
}

/** Formats a cents amount as a currency string, e.g. 2900 -> "$29.00". */
export function formatPrice(cents: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    cents / 100
  );
}
