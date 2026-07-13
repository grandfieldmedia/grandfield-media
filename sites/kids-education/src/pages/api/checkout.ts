import type { APIRoute } from 'astro';

export const prerender = false;

/**
 * Checkout is handled client-side by the Paddle.js overlay on the product page
 * (see src/pages/products/[slug].astro). This endpoint is only reached if the
 * shared form is submitted with JavaScript disabled — send the user back with a
 * hint. No Stripe/Paddle server call happens here.
 */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const slug = String(form.get('slug') ?? '');
  const dest = slug ? `/products/${slug}?error=enable-javascript` : '/products?error=enable-javascript';
  return redirect(dest, 303);
};
