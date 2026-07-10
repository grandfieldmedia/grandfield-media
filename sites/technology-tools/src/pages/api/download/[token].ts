import type { APIRoute } from 'astro';
import { getServiceClient, createSignedPdfUrl, isExpired } from '@grandfield/shared-backend';

export const prerender = false;

export const GET: APIRoute = async ({ params, redirect }) => {
  const { token } = params;
  if (!token) return new Response('Invalid link', { status: 400 });

  const sb = getServiceClient();
  const { data: order } = await sb
    .from('orders')
    .select('*')
    .eq('download_token', token)
    .maybeSingle();

  if (!order || order.status !== 'completed') {
    return new Response('This download link is invalid.', { status: 404 });
  }
  if (isExpired(order.expires_at)) {
    return new Response('This download link has expired. Please request a new one.', { status: 410 });
  }

  const { data: product } = await sb
    .from('products')
    .select('storage_path')
    .eq('id', order.product_id)
    .maybeSingle();
  if (!product?.storage_path) {
    return new Response('File not found.', { status: 404 });
  }

  const signedUrl = await createSignedPdfUrl(product.storage_path, 60);

  // Best-effort download tracking.
  await sb
    .from('orders')
    .update({ downloaded: true, downloaded_at: new Date().toISOString() })
    .eq('id', order.id);

  return redirect(signedUrl, 302);
};
