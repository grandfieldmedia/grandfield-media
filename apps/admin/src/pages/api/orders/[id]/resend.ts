import type { APIRoute } from 'astro';
import {
  getServiceClient,
  createSignedPdfUrl,
  sendDownloadEmail,
} from '@grandfield/shared-backend';

export const prerender = false;

export const POST: APIRoute = async ({ params, redirect }) => {
  const { id } = params;
  const back = (flash: string, msg: string) =>
    redirect(`/orders/${id}?flash=${flash}&msg=${encodeURIComponent(msg)}`);

  const sb = getServiceClient();
  const { data: order } = await sb.from('orders').select('*').eq('id', id).maybeSingle();
  if (!order) return back('error', 'Order not found.');

  const { data: product } = await sb
    .from('products')
    .select('*')
    .eq('id', order.product_id)
    .maybeSingle();
  if (!product?.storage_path) return back('error', 'Product file not found.');

  try {
    const downloadUrl = await createSignedPdfUrl(product.storage_path, 60 * 60);
    await sendDownloadEmail({
      to: order.email,
      from: 'Grandfield Money <orders@grandfieldmoney.com>',
      brand: 'Grandfield Money',
      productName: product.name,
      downloadUrl,
    });
  } catch (err) {
    return back('error', err instanceof Error ? err.message : 'Failed to resend email.');
  }

  return back('ok', 'Download email re-sent.');
};
