export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '@grandfield/shared-backend';
import { runStep, type StepType } from '../../../../lib/steps';

/**
 * Machine-to-machine step runner for the n8n runner. POST { book_id, step_type, secret }.
 * n8n claims the step (claim_next_step) and marks it done; this does the WORK for
 * one non-assemble step in versioned code (Claude + DB writes + cost logging).
 * Bypasses the login wall (middleware); guarded by KDP_ASSEMBLE_SECRET.
 */
const STEPS = new Set(['contract', 'outline', 'chapter', 'metadata', 'kdp_check', 'polish']);

export const POST: APIRoute = async ({ request }) => {
  const secret = env.KDP_ASSEMBLE_SECRET;
  if (!secret) return json({ ok: false, error: 'KDP_ASSEMBLE_SECRET not configured' }, 500);

  let body: { book_id?: string; step_type?: string; secret?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, error: 'invalid JSON body' }, 400);
  }

  const provided = body.secret || request.headers.get('x-kdp-secret') || '';
  if (provided !== secret) return json({ ok: false, error: 'unauthorized' }, 401);
  if (!body.book_id) return json({ ok: false, error: 'missing book_id' }, 400);
  if (!body.step_type || !STEPS.has(body.step_type)) {
    return json({ ok: false, error: `bad step_type: ${body.step_type}` }, 400);
  }

  try {
    await runStep(body.book_id, body.step_type as StepType);
    return json({ ok: true, step_type: body.step_type });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return json({ ok: false, error: msg }, 500);
  }
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}
