export const prerender = false;
import type { APIRoute } from 'astro';
import { setControl } from '../../../lib/social';

/** Toggle a kill switch. Reached from the Controls page form; auth is enforced by middleware. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const scope = String(form.get('scope') ?? '');
  const brandIdRaw = form.get('brand_id');
  const brandId = brandIdRaw ? String(brandIdRaw) : null;
  const enabled = String(form.get('enabled')) === 'true';

  if (scope !== 'global' && scope !== 'brand') {
    return new Response('Bad scope', { status: 400 });
  }

  await setControl(scope, brandId, enabled, enabled ? 'enabled from admin' : 'disabled from admin');
  return redirect('/social/controls', 303);
};
