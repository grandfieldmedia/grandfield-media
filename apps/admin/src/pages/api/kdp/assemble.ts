export const prerender = false;
import type { APIRoute } from 'astro';
import { env } from '@grandfield/shared-backend';
import { getBook, getChapters } from '../../../lib/factory';
import { assembleBook } from '../../../lib/assemble';

/**
 * Machine-to-machine assembler for n8n. POST { book_id, secret }.
 * Reads the book + chapters, fills the Master Book Template DOCX, and returns
 * the package as base64 files. n8n creates the Drive folders and uploads them.
 * Bypasses the login wall (see middleware) — guarded by KDP_ASSEMBLE_SECRET.
 */
export const POST: APIRoute = async ({ request }) => {
  const secret = env.KDP_ASSEMBLE_SECRET;
  if (!secret) return json({ ok: false, error: 'KDP_ASSEMBLE_SECRET not configured' }, 500);

  let body: { book_id?: string; secret?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return json({ ok: false, error: 'invalid JSON body' }, 400);
  }

  const provided = body.secret || request.headers.get('x-kdp-secret') || '';
  if (provided !== secret) return json({ ok: false, error: 'unauthorized' }, 401);
  if (!body.book_id) return json({ ok: false, error: 'missing book_id' }, 400);

  try {
    const [book, chapters] = await Promise.all([getBook(body.book_id), getChapters(body.book_id)]);
    if (!book) return json({ ok: false, error: 'book not found' }, 404);
    if (!chapters.length) return json({ ok: false, error: 'no chapters for book' }, 400);

    const tplRes = await fetch(new URL('/kdp-book-template.docx', request.url));
    if (!tplRes.ok) return json({ ok: false, error: `template fetch ${tplRes.status}` }, 500);
    const templateBytes = await tplRes.arrayBuffer();

    const result = await assembleBook(templateBytes, book, chapters);
    return json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return json({ ok: false, error: msg }, 500);
  }
};

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
