import type { APIRoute } from 'astro';
import { getServiceClient, refundBySession } from '@grandfield/shared-backend';

export const prerender = false;

export const POST: APIRoute = async ({ params, redirect }) => {
  const { id } = params;
  const back = (flash: string, msg: string) =>
    redirect(`/orders/${id}?flash=${flash}&msg=${encodeURIComponent(msg)}`);

  const sb = getServiceClient();
  const { data: order } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) return back('error', 'Order not found.');
  if (order.status !== 'completed') return back('error', 'Only completed orders can be refunded.');
  if (!order.stripe_session_id) return back('error', 'Order has no Stripe session.');

  try {
    // Guarded: throws a clear error until STRIPE_SECRET_KEY is configured.
    await refundBySession(order.stripe_session_id);
  } catch (err) {
    return back('error', err instanceof Error ? err.message : 'Refund failed.');
  }

  await sb
    .from('orders')
    .update({ status: 'refunded', refund_status: 'refunded' })
    .eq('id', id);

  return back('ok', 'Order refunded successfully.');
};
