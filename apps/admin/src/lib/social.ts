import { getServiceClient } from '@grandfield/shared-backend';

/**
 * Data access for the `social` schema (the Aviary). Generic across ALL brands —
 * nothing brand-specific is hardcoded; it reads whatever brands/posts exist.
 * NOTE: the `social` schema must be added to Supabase → Settings → API → Exposed schemas.
 */
const social = () => getServiceClient().schema('social');

export interface Brand {
  id: string;
  name: string;
  slug: string;
  niche: string | null;
}

export interface SocialPost {
  id: string;
  brand_id: string;
  lane: string | null;
  topic: string | null;
  status: string;
  copy_by_platform: Record<string, string> | null;
  created_at: string;
}

export interface PostFilters {
  brandId?: string;
  lane?: string;
  status?: string;
}

export interface SocialStats {
  total: number;
  qaPassed: number;
  qaFailed: number;
  brands: number;
}

export async function getBrands(): Promise<Brand[]> {
  const { data, error } = await social()
    .from('brands')
    .select('id, name, slug, niche')
    .order('name');
  if (error) throw error;
  return (data ?? []) as Brand[];
}

export async function getPosts(f: PostFilters = {}, limit = 50): Promise<SocialPost[]> {
  let q = social()
    .from('content_items')
    .select('id, brand_id, lane, topic, status, copy_by_platform, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (f.brandId) q = q.eq('brand_id', f.brandId);
  if (f.lane) q = q.eq('lane', f.lane);
  if (f.status) q = q.eq('status', f.status);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as SocialPost[];
}

export async function getSocialStats(f: PostFilters = {}): Promise<SocialStats> {
  const [posts, brands] = await Promise.all([getPosts(f, 1000), getBrands()]);
  return {
    total: posts.length,
    qaPassed: posts.filter((p) => p.status === 'qa_passed' || p.status === 'published').length,
    qaFailed: posts.filter((p) => p.status === 'qa_failed').length,
    brands: brands.length,
  };
}
