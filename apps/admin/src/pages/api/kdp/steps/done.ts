export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '@grandfield/shared-backend';
import { completeStep } from '../../../../lib/steps';

/**
 * Mark the book's running step done; finalize the book if nothing remains.
 * POST { book_id, secret } → { has_more }. Replaces n8n's Mark-step-done + Finalize
 * Supabase HTTP nodes. Guarded by KDP_ASSEMBLE_SECRET.
 */
export const POST: APIRoute = async ({ request }) => {
  const secret = env.KDP_ASSEMBLE_SECRET;
  if (!secret) return json({ ok: false, error: 'KDP_ASSEMBLE_SECRET not configured' }, 500);
  let body: { book_id?: string; secret?: string };
  try { body = (await request.json()) as typeof body; } catch { return json({ ok: false, error: 'invalid JSON' }, 400); }
  if ((body.secret || request.headers.get('x-kdp-secret')) !== secret) return json({ ok: false, error: 'unauthorized' }, 401);
  if (!body.book_id) return json({ ok: false, error: 'missing book_id' }, 400);
  try {
    const result = await completeStep(body.book_id);
    return json({ ok: true, ...result });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : 'error' }, 500);
  }
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}
