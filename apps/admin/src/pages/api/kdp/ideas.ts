export const prerender = false;
import type { APIRoute } from 'astro';
import {
  createIdea, updateIdea, setIdeaStatus, deleteIdea, improveIdea, approveIdea,
  type IdeaStatus,
} from '../../../lib/factory';

/** All Idea Workbench mutations. Auth enforced by middleware. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const id = String(form.get('id') ?? '');
  const s = (k: string) => String(form.get(k) ?? '').trim();

  try {
    switch (action) {
      case 'create': {
        const niche = s('niche_slug');
        const newId = await createIdea({
          niche_slug: niche || null,
          niche_name: s('niche_name') || null,
          topic: s('topic') || undefined,
          working_title: s('working_title') || undefined,
        });
        return redirect(`/kdp/${newId}`, 303);
      }

      case 'save': {
        const wordsRaw = s('target_words');
        await updateIdea(id, {
          topic: s('topic') || null,
          working_title: s('working_title') || null,
          niche_slug: s('niche_slug') || null,
          niche_name: s('niche_name') || null,
          user_draft: s('user_draft') || null,
          differentiation: s('differentiation') || null,
          notes: s('notes') || null,
          target_words: wordsRaw ? parseInt(wordsRaw, 10) : null,
        });
        return redirect(`/kdp/${id}`, 303);
      }

      case 'improve':
        await improveIdea(id, false);
        return redirect(`/kdp/${id}`, 303);

      case 'finalize':
        await improveIdea(id, true);
        return redirect(`/kdp/${id}`, 303);

      case 'status': {
        const st = s('status') as IdeaStatus;
        await setIdeaStatus(id, st);
        return redirect(`/kdp/${id}`, 303);
      }

      case 'delete':
        await deleteIdea(id);
        return redirect('/kdp', 303);

      case 'approve': {
        const runType = s('run_type') === 'sample' ? 'sample' : 'full';
        const bookId = await approveIdea(id, runType);
        return redirect(`/kdp/book/${bookId}`, 303);
      }

      default:
        return new Response('Bad action', { status: 400 });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Action failed: ${msg}`, { status: 500 });
  }
};
