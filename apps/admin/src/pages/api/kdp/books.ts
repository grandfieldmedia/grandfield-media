export const prerender = false;
import type { APIRoute } from 'astro';
import { runBook } from '../../../lib/factory';

/** Run / Resume the n8n KDPFactory Runner for a book. Auth enforced by middleware. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const id = String(form.get('id') ?? '');

  try {
    if (action === 'run' || action === 'resume') {
      await runBook(id);
      return redirect(`/kdp/book/${id}`, 303);
    }
    return new Response('Bad action', { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Action failed: ${msg}`, { status: 500 });
  }
};
