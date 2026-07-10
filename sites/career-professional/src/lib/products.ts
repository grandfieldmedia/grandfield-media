import { getAnonClient, type Product } from '@grandfield/shared-backend';
import type { ProductSummary } from '@grandfield/shared-ui/types';

export const SITE_ID = 'career-professional';

/** Active products for this site (public catalog — anon key, RLS-allowed). */
export async function getProducts(): Promise<Product[]> {
  const sb = getAnonClient();
  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('site_id', SITE_ID)
    .eq('active', true)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sb = getAnonClient();
  const { data, error } = await sb
    .from('products')
    .select('*')
    .eq('site_id', SITE_ID)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return (data as Product) ?? null;
}

/** Maps a DB product row to the shared-ui card/sales summary shape. */
export function toSummary(p: Product): ProductSummary {
  return { name: p.name, slug: p.slug, description: p.description, price: p.price };
}
