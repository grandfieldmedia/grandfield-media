export const prerender = false;
import type { APIRoute } from 'astro';
import { updateNiche, createSubNiche } from '../../lib/registry';

/** Niche Master Registry edits (shared infra). Auth enforced by middleware. */
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const s = (k: string) => String(form.get(k) ?? '').trim();
  const arr = (k: string) => s(k).split('\n').map((x) => x.trim()).filter(Boolean);

  try {
    if (action === 'update_niche') {
      const isParent = s('is_parent') === '1';
      const patch: Record<string, unknown> = {
        audience: s('audience') || null,
        buying_motivation: s('buying_motivation') || null,
        voice_tone: s('voice_tone') || null,
        reading_level: s('reading_level') || null,
        compliance_rules: s('compliance_rules') || null,
        context_notes: s('context_notes') || null,
        dos: arr('dos'),
        donts: arr('donts'),
        keywords: arr('keywords'),
      };
      // pen name / publisher live on the parent only
      if (isParent) {
        patch.pen_name = s('pen_name') || null;
        patch.pen_name_bio = s('pen_name_bio') || null;
        patch.publisher_name = s('publisher_name') || null;
      }
      await updateNiche(s('id'), patch);
      return redirect('/registry', 303);
    }

    if (action === 'add_subniche') {
      await createSubNiche({
        parent_id: s('parent_id'), slug: s('slug'), name: s('name'),
        sort_order: s('sort_order') ? parseInt(s('sort_order'), 10) : 0,
      });
      return redirect('/registry', 303);
    }

    return new Response('Bad action', { status: 400 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    return new Response(`Action failed: ${msg}`, { status: 500 });
  }
};
