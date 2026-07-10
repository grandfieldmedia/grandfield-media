import type { APIRoute } from 'astro';
import { getServiceClient, sendDownloadEmail } from '@grandfield/shared-backend';
import { siteConfig } from '../../site.config';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let email = '';
  try {
    const body = await request.json();
    email = String(body.email ?? '').trim();
  } catch {
    const form = await request.formData();
    email = String(form.get('email') ?? '').trim();
  }

  // Look up the most recent completed order and re-send its link.
  // Always respond 200 with the same message so we never reveal which emails exist.
  if (email) {
    try {
      const sb = getServiceClient();
      const { data: order } = await sb
        .from('orders')
        .select('*')
        .eq('email', email)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (order?.download_token) {
        const { data: product } = await sb
          .from('products')
          .select('name')
          .eq('id', order.product_id)
          .maybeSingle();
        const downloadUrl = `${siteConfig.url}/api/download/${order.download_token}`;
        await sendDownloadEmail({
          to: email,
          from: `${siteConfig.brand} <orders@${siteConfig.domain}>`,
          brand: siteConfig.brand,
          productName: product?.name ?? 'your purchase',
          downloadUrl,
        });
      }
    } catch {
      // Swallow — never leak whether the email/order exists or that sending failed.
    }
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
