import { getServiceClient, env } from '@grandfield/shared-backend';

/**
 * Admin config surfaces for kdp_factory: prompt templates, reference books,
 * per-niche KDP defaults, and KDP rules. Read/edited in the Factory section.
 */
const factory = () => getServiceClient().schema('kdp_factory');

// ---------------------------------------------------------------------------
// Prompt templates (B1..B8) — versioned; editing creates a new active version.
// ---------------------------------------------------------------------------
export interface PromptTemplate {
  id: string; key: string; version: number; text: string;
  model: string | null; notes: string | null; is_active: boolean; updated_at: string;
}

/** Latest ACTIVE prompt per key, ordered B1, B1F, B2… */
export async function getActivePrompts(): Promise<PromptTemplate[]> {
  const { data, error } = await factory()
    .from('prompt_templates')
    .select('id, key, version, text, model, notes, is_active, updated_at')
    .eq('is_active', true)
    .order('key');
  if (error) throw error;
  return (data ?? []) as unknown as PromptTemplate[];
}

export async function getPrompt(key: string): Promise<PromptTemplate | null> {
  const { data, error } = await factory()
    .from('prompt_templates')
    .select('id, key, version, text, model, notes, is_active, updated_at')
    .eq('key', key).eq('is_active', true)
    .order('version', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return (data as unknown as PromptTemplate) ?? null;
}

/** Save an edit as a NEW version: deactivate old, insert version+1 active. */
export async function savePromptVersion(key: string, text: string, model: string, notes: string): Promise<void> {
  const { data: rows } = await factory()
    .from('prompt_templates').select('version').eq('key', key)
    .order('version', { ascending: false }).limit(1);
  const nextVersion = ((rows?.[0] as { version: number } | undefined)?.version ?? 0) + 1;
  await factory().from('prompt_templates').update({ is_active: false }).eq('key', key);
  const { error } = await factory().from('prompt_templates').insert({
    key, version: nextVersion, text, model: model || null, notes: notes || null, is_active: true,
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Reference books — the gold-standard library.
// ---------------------------------------------------------------------------
export interface ReferenceBook {
  id: string; title: string; author: string | null; niche_slug: string | null;
  book_type: string | null; reference_profile: Record<string, unknown>;
  notes: string | null; status: string; updated_at: string;
}

export async function getReferenceBooks(): Promise<ReferenceBook[]> {
  const { data, error } = await factory()
    .from('reference_books')
    .select('id, title, author, niche_slug, book_type, reference_profile, notes, status, updated_at')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ReferenceBook[];
}

export async function createReferenceBook(r: {
  title: string; author?: string; niche_slug?: string; book_type?: string; notes?: string;
}): Promise<string> {
  const { data, error } = await factory().from('reference_books').insert({
    title: r.title, author: r.author || null, niche_slug: r.niche_slug || null,
    book_type: r.book_type || null, notes: r.notes || null, status: 'active',
  }).select('id').single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function setReferenceStatus(id: string, status: string): Promise<void> {
  const { error } = await factory().from('reference_books')
    .update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

/** Analyze a reference into a distilled profile (Claude, Fable). Needs ANTHROPIC key. */
export async function analyzeReference(id: string, description: string): Promise<void> {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set — cannot analyze.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-fable-5', max_tokens: 1500,
      system: 'Distill a benchmark KDP book into a REFERENCE PROFILE (JSON): toc_structure, chapter_open_close, section_rhythm, use_of_examples, tone_fingerprint, front_back_matter, what_makes_it_professional. Analysis only — never reproduce the book\'s text.',
      messages: [{ role: 'user', content: `Reference book described:\n${description}\n\nReturn the reference_profile as JSON.` }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { content: { text: string }[] };
  let profile: unknown = { raw: json.content.map((c) => c.text).join('') };
  try { profile = JSON.parse(json.content[0].text); } catch { /* keep raw */ }
  const { error } = await factory().from('reference_books')
    .update({ reference_profile: profile, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// kdp_niche_defaults — per-niche format defaults (loose slug key).
// ---------------------------------------------------------------------------
export interface NicheDefault {
  niche_slug: string; default_kdp_categories: string[]; default_word_count: number | null;
  default_chapter_length: number | null; book_format_notes: string | null;
}

export async function getNicheDefaults(): Promise<NicheDefault[]> {
  const { data, error } = await factory()
    .from('kdp_niche_defaults')
    .select('niche_slug, default_kdp_categories, default_word_count, default_chapter_length, book_format_notes');
  if (error) throw error;
  return (data ?? []) as unknown as NicheDefault[];
}

export async function upsertNicheDefault(d: {
  niche_slug: string; categories: string[]; word_count: number | null;
  chapter_length: number | null; notes: string;
}): Promise<void> {
  const { error } = await factory().from('kdp_niche_defaults').upsert({
    niche_slug: d.niche_slug,
    default_kdp_categories: d.categories,
    default_word_count: d.word_count,
    default_chapter_length: d.chapter_length,
    book_format_notes: d.notes || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'niche_slug' });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// kdp_rules — read-only view in admin (the KDP Output Contract).
// ---------------------------------------------------------------------------
export interface KdpRule {
  rule_key: string; rule_type: string; value: unknown; description: string | null;
}
export async function getKdpRules(): Promise<KdpRule[]> {
  const { data, error } = await factory()
    .from('kdp_rules').select('rule_key, rule_type, value, description')
    .eq('is_active', true).order('rule_type');
  if (error) throw error;
  return (data ?? []) as unknown as KdpRule[];
}
