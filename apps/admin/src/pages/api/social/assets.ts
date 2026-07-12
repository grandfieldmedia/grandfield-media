export const prerender = false;
import type { APIRoute } from 'astro';
import { createAsset, setAssetStatus } from '../../../lib/social';

/** Create an asset, or toggle its promote on/off. Auth enforced by middleware. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');

  if (action === 'toggle') {
    const id = String(form.get('id') ?? '');
    const status = String(form.get('status') ?? '');
    if (!id || (status !== 'live' && status !== 'paused')) {
      return new Response('Bad toggle', { status: 400 });
    }
    await setAssetStatus(id, status);
    return redirect('/social/assets', 303);
  }

  if (action === 'create') {
    const brand_id = String(form.get('brand_id') ?? '');
    const name = String(form.get('name') ?? '').trim();
    if (!brand_id || !name) return new Response('Brand and name are required', { status: 400 });

    const priceRaw = String(form.get('price') ?? '').trim();
    const price_cents = priceRaw ? Math.round(parseFloat(priceRaw) * 100) : null;

    await createAsset({
      brand_id,
      name,
      asset_type: String(form.get('asset_type') ?? '').trim() || undefined,
      url: String(form.get('url') ?? '').trim() || undefined,
      price_cents: Number.isFinite(price_cents as number) ? price_cents : null,
      description: String(form.get('description') ?? '').trim() || undefined,
    });
    return redirect('/social/assets', 303);
  }

  return new Response('Bad action', { status: 400 });
};
