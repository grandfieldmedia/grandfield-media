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
  today: number;
  brands: number;
}

export interface BrandSummary {
  id: string;
  name: string;
  niche: string | null;
  total: number;
  qaPassed: number;
  lastAt: string | null;
}

export interface Control {
  scope: string;
  brand_id: string | null;
  enabled: boolean;
  reason: string | null;
  updated_at: string | null;
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
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return {
    total: posts.length,
    qaPassed: posts.filter((p) => p.status === 'qa_passed' || p.status === 'published').length,
    qaFailed: posts.filter((p) => p.status === 'qa_failed').length,
    today: posts.filter((p) => new Date(p.created_at) >= startOfToday).length,
    brands: brands.length,
  };
}

/** Kill switches: the `global` row + one row per brand. */
export async function getControls(): Promise<Control[]> {
  const { data, error } = await social()
    .from('automation_controls')
    .select('scope, brand_id, enabled, reason, updated_at');
  if (error) throw error;
  return (data ?? []) as Control[];
}

/** Flip a kill switch on/off. brandId = null for the global (master) switch. */
export async function setControl(scope: string, brandId: string | null, enabled: boolean, reason: string) {
  let q = social()
    .from('automation_controls')
    .update({ enabled, reason, updated_at: new Date().toISOString() })
    .eq('scope', scope);
  q = brandId ? q.eq('brand_id', brandId) : q.is('brand_id', null);
  const { error } = await q;
  if (error) throw error;
}

/** Per-brand rollup for the dashboard summary (all brands, newest-first activity). */
export async function getBrandSummary(): Promise<BrandSummary[]> {
  const [posts, brands] = await Promise.all([getPosts({}, 2000), getBrands()]);
  return brands
    .map((b) => {
      const bp = posts.filter((p) => p.brand_id === b.id); // already ordered newest-first
      return {
        id: b.id,
        name: b.name,
        niche: b.niche,
        total: bp.length,
        qaPassed: bp.filter((p) => p.status === 'qa_passed' || p.status === 'published').length,
        lastAt: bp[0]?.created_at ?? null,
      };
    })
    .sort((a, b) => b.total - a.total);
}
