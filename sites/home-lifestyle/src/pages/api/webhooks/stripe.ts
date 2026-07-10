import type { APIRoute } from 'astro';
import {
  constructWebhookEvent,
  getServiceClient,
  generateDownloadToken,
  downloadExpiry,
  sendDownloadEmail,
} from '@grandfield/shared-backend';
import { siteConfig } from '../../../site.config';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get('stripe-signature');
  if (!signature) return new Response('Missing signature', { status: 400 });

  // Raw body is required for signature verification.
  const payload = await request.text();

  let event;
  try {
    event = constructWebhookEvent(payload, signature);
  } catch {
    return new Response('Invalid signature', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const sb = getServiceClient();

    // Idempotency: never create two orders for the same Stripe session.
    const { data: existing } = await sb
      .from('orders')
      .select('id')
      .eq('stripe_session_id', session.id)
      .maybeSingle();
    if (existing) return new Response('ok (already processed)', { status: 200 });

    const productId = session.metadata?.product_id;
    const siteId = session.metadata?.site_id ?? siteConfig.id;
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const token = generateDownloadToken();

    await sb.from('orders').insert({
      site_id: siteId,
      email,
      product_id: productId,
      stripe_session_id: session.id,
      amount: session.amount_total ?? 0,
      status: 'completed',
      download_token: token,
      expires_at: downloadExpiry(),
    });

    if (email && productId) {
      const { data: product } = await sb
        .from('products')
        .select('name')
        .eq('id', productId)
        .maybeSingle();
      // Stable link to our download endpoint (it mints a fresh signed URL each time).
      const downloadUrl = `${siteConfig.url}/api/download/${token}`;
      try {
        await sendDownloadEmail({
          to: email,
          from: `${siteConfig.brand} <orders@${siteConfig.domain}>`,
          brand: siteConfig.brand,
          productName: product?.name ?? 'your purchase',
          downloadUrl,
        });
      } catch {
        // Email failure shouldn't fail the webhook; order is recorded and
        // recoverable via the resend-link page.
      }
    }
  }

  return new Response('ok', { status: 200 });
};
