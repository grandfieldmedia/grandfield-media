export const prerender = false;
import type { APIRoute } from 'astro';
import {
  savePromptVersion, createReferenceBook, setReferenceStatus, analyzeReference,
  upsertNicheDefault,
} from '../../../lib/factory-config';

/** Prompt / reference / niche-default mutations. Auth enforced by middleware. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const s = (k: string) => String(form.get(k) ?? '').trim();
  const num = (k: string) => { const v = s(k); return v ? parseInt(v, 10) : null; };

  try {
    switch (action) {
      case 'save_prompt':
        await savePromptVersion(s('key'), s('text'), s('model'), s('notes'));
        return redirect('/kdp/prompts', 303);

      case 'create_reference':
        await createReferenceBook({
          title: s('title'), author: s('author'), niche_slug: s('niche_slug'),
          book_type: s('book_type'), notes: s('notes'),
        });
        return redirect('/kdp/references', 303);

      case 'analyze_reference':
        await analyzeReference(s('id'), s('description'));
        return redirect('/kdp/references', 303);

      case 'archive_reference':
        await setReferenceStatus(s('id'), s('status') === 'active' ? 'active' : 'archived');
        return redirect('/kdp/references', 303);

      case 'save_niche_default':
        await upsertNicheDefault({
          niche_slug: s('niche_slug'),
          categories: s('categories').split(',').map((c) => c.trim()).filter(Boolean),
          word_count: num('word_count'),
          chapter_length: num('chapter_length'),
          notes: s('notes'),
        });
        return redirect('/kdp/niche-defaults', 303);

      default:
        return new Response('Bad action', { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Action failed: ${msg}`, { status: 500 });
  }
};
