import type { APIRoute } from 'astro';
import { getAnonClient, createCheckoutSession, isStripeConfigured } from '@grandfield/shared-backend';
import { SITE_ID } from '../../lib/products';

export const prerender = false;

export const POST: APIRoute = async ({ request, url, redirect }) => {
  if (!isStripeConfigured()) {
    return redirect('/products?error=checkout-unavailable');
  }

  const form = await request.formData();
  const slug = String(form.get('slug') ?? '');

  const sb = getAnonClient();
  const { data: product } = await sb
    .from('products')
    .select('*')
    .eq('site_id', SITE_ID)
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (!product) {
    return redirect('/products?error=not-found');
  }

  const origin = url.origin;
  const session = await createCheckoutSession({
    productName: product.name,
    amount: product.price,
    successUrl: `${origin}/thank-you`,
    cancelUrl: `${origin}/products/${slug}`,
    metadata: { site_id: SITE_ID, product_id: product.id },
  });

  return redirect(session.url!, 303);
};
