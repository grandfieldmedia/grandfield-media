import { getServiceClient, type Order } from '@grandfield/shared-backend';

export interface OrderFilters {
  siteId?: string;
  status?: string;
  from?: string;
  to?: string;
}

function applyFilters(query: any, f: OrderFilters) {
  if (f.siteId) query = query.eq('site_id', f.siteId);
  if (f.status) query = query.eq('status', f.status);
  if (f.from) query = query.gte('created_at', f.from);
  if (f.to) query = query.lte('created_at', f.to);
  return query;
}

export interface Stats {
  total: number;
  completed: number;
  refunded: number;
  revenueCents: number;
  refundRate: number;
}

export async function getStats(f: OrderFilters = {}): Promise<Stats> {
  const sb = getServiceClient();
  const { data, error } = await applyFilters(
    sb.from('orders').select('amount,status'),
    f
  );
  if (error) throw error;
  const orders = (data ?? []) as Pick<Order, 'amount' | 'status'>[];
  const completed = orders.filter((o) => o.status === 'completed');
  const refunded = orders.filter((o) => o.status === 'refunded');
  const revenueCents = completed.reduce((sum, o) => sum + (o.amount ?? 0), 0);
  return {
    total: orders.length,
    completed: completed.length,
    refunded: refunded.length,
    revenueCents,
    refundRate: orders.length ? refunded.length / orders.length : 0,
  };
}

export async function getOrders(f: OrderFilters = {}, limit = 100): Promise<Order[]> {
  const sb = getServiceClient();
  const { data, error } = await applyFilters(
    sb.from('orders').select('*').order('created_at', { ascending: false }).limit(limit),
    f
  );
  if (error) throw error;
  return (data ?? []) as Order[];
}

export async function getOrderById(id: string): Promise<Order | null> {
  const sb = getServiceClient();
  const { data, error } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as Order) ?? null;
}

/** Distinct site_ids that have orders — powers the niche filter dropdown. */
export async function getSiteIds(): Promise<string[]> {
  const sb = getServiceClient();
  const { data, error } = await sb.from('orders').select('site_id');
  if (error) throw error;
  return [...new Set((data ?? []).map((r: { site_id: string }) => r.site_id))].sort();
}
