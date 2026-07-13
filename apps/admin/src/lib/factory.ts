import { getServiceClient, env } from '@grandfield/shared-backend';
import { getNicheContext } from './registry';

/**
 * Data access for the `kdp_factory` schema (KDPFactory). State only — the
 * manuscript never lives here. NOTE: `kdp_factory` must be added to
 * Supabase -> Settings -> Data API -> Exposed schemas.
 */
const factory = () => getServiceClient().schema('kdp_factory');

export type IdeaStatus =
  | 'draft' | 'researching' | 'ready' | 'in_production' | 'produced' | 'parked' | 'deleted';

export interface Idea {
  id: string;
  niche_slug: string | null;
  niche_name: string | null;
  topic: string | null;
  working_title: string | null;
  user_draft: string | null;
  claude_draft: string | null;
  agreed_toc: unknown[];
  differentiation: string | null;
  payload: Record<string, unknown>;
  notes: string | null;
  research: Record<string, unknown>;
  target_words: number | null;
  status: IdeaStatus;
  created_at: string;
  updated_at: string;
}

const IDEA_COLS =
  'id, niche_slug, niche_name, topic, working_title, user_draft, claude_draft, ' +
  'agreed_toc, differentiation, payload, notes, research, target_words, status, ' +
  'created_at, updated_at';

export interface IdeaFilters {
  nicheSlug?: string;
  status?: string;
  q?: string;
}

/** The Workbench library — all ideas, filterable, newest-first. Excludes deleted. */
export async function getIdeas(f: IdeaFilters = {}): Promise<Idea[]> {
  let q = factory()
    .from('ideas')
    .select(IDEA_COLS)
    .neq('status', 'deleted')
    .order('updated_at', { ascending: false });
  if (f.nicheSlug) q = q.eq('niche_slug', f.nicheSlug);
  if (f.status) q = q.eq('status', f.status);
  if (f.q) q = q.or(`topic.ilike.%${f.q}%,working_title.ilike.%${f.q}%`);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as unknown as Idea[];
}

export async function getIdea(id: string): Promise<Idea | null> {
  const { data, error } = await factory()
    .from('ideas').select(IDEA_COLS).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as unknown as Idea) ?? null;
}

export async function createIdea(input: {
  niche_slug?: string | null;
  niche_name?: string | null;
  topic?: string;
  working_title?: string;
  user_draft?: string;
}): Promise<string> {
  const { data, error } = await factory()
    .from('ideas')
    .insert({
      niche_slug: input.niche_slug ?? null,
      niche_name: input.niche_name ?? null,
      topic: input.topic ?? null,
      working_title: input.working_title ?? null,
      user_draft: input.user_draft ?? null,
      status: 'draft',
    })
    .select('id')
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

export async function updateIdea(id: string, patch: Partial<Idea>): Promise<void> {
  const { error } = await factory().from('ideas').update(patch).eq('id', id);
  if (error) throw error;
}

export async function setIdeaStatus(id: string, status: IdeaStatus): Promise<void> {
  await updateIdea(id, { status });
}

/** Soft-delete (status = deleted) — ideas are long-lived; never hard-deleted here. */
export async function deleteIdea(id: string): Promise<void> {
  await setIdeaStatus(id, 'deleted');
}

// ---------------------------------------------------------------------------
// Claude "Improve" — the two-box mechanic. B1 (Haiku) plays; B1F (Fable) finalizes.
// If ANTHROPIC_API_KEY is absent, callers get a clear, non-fatal error.
// ---------------------------------------------------------------------------
const MODELS = { play: 'claude-haiku-4-5-20251001', finalize: 'claude-fable-5' } as const;

export function aiEnabled(): boolean {
  return Boolean(env.ANTHROPIC_API_KEY);
}

async function callClaude(model: string, system: string, user: string): Promise<string> {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set — add it to enable the Improve button.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 2000,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  });
  if (!res.ok) throw new Error(`Claude API ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { content: { text: string }[] };
  return json.content.map((c) => c.text).join('').trim();
}

/**
 * Take the user's box + niche context, return Claude's improved version (the other box):
 * sharpened title options, tightened angle, a proposed TOC, gaps flagged.
 * `finalize=true` uses Fable (the boss) for the blueprint-ready pass.
 */
export async function improveIdea(id: string, finalize = false): Promise<string> {
  const idea = await getIdea(id);
  if (!idea) throw new Error('Idea not found');
  const ctx = idea.niche_slug ? await getNicheContext(idea.niche_slug) : null;

  const system =
    'You are a KDP non-fiction book strategist for Grandfield Media. Turn the author\'s ' +
    'rough thinking into a sharp, structured book blueprint. Be concrete and honest — if ' +
    'the idea is weak, say so. NEVER invent competitor books or statistics.';

  const user = [
    ctx && `NICHE CONTEXT:\n${ctx.compiled}`,
    `TOPIC: ${idea.topic ?? '(none given)'}`,
    `WORKING TITLE: ${idea.working_title ?? '(none)'}`,
    `THE AUTHOR'S THINKING (his own words):\n${idea.user_draft ?? '(empty)'}`,
    idea.notes && `RESEARCH NOTES / PASTED COMPS:\n${idea.notes}`,
    '',
    'Return a structured improved version with these sections:',
    '1) TITLE OPTIONS (3, KDP-savvy)',
    '2) TARGET READER & ANGLE (tightened)',
    '3) PROPOSED TABLE OF CONTENTS (chapter list)',
    '4) DIFFERENTIATION (only from comps the author pasted; if none, say what to research)',
    '5) GAPS / RISKS to address',
  ]
    .filter(Boolean)
    .join('\n');

  const improved = await callClaude(finalize ? MODELS.finalize : MODELS.play, system, user);
  await updateIdea(id, { claude_draft: improved });
  return improved;
}

// ---------------------------------------------------------------------------
// Books (read + Run/Resume the n8n flow).
// ---------------------------------------------------------------------------
export interface Book {
  id: string;
  idea_id: string | null;
  version: number;
  run_type: 'sample' | 'full';
  niche_slug: string | null;
  niche_name: string | null;
  topic: string | null;
  title_suggestion: string | null;
  chosen_title: string | null;
  subtitle: string | null;
  target_words: number | null;
  actual_words: number | null;
  blueprint: Record<string, unknown>;
  style_contract: Record<string, unknown>;
  listing: Record<string, unknown>;
  qa: Record<string, unknown>;
  status: string;
  current_step: string | null;
  error: string | null;
  drive_folder_url: string | null;
  master_doc_url: string | null;
  docx_url: string | null;
  metadata_doc_url: string | null;
  kdp_url: string | null;
  created_at: string;
}

const BOOK_COLS =
  'id, idea_id, version, run_type, niche_slug, niche_name, topic, title_suggestion, ' +
  'chosen_title, subtitle, target_words, actual_words, blueprint, style_contract, listing, qa, ' +
  'status, current_step, error, ' +
  'drive_folder_url, master_doc_url, docx_url, metadata_doc_url, kdp_url, created_at';

export interface Chapter {
  id: string; index: number; title: string | null; target_words: number | null;
  actual_words: number | null; summary: string | null; draft_md: string | null;
  status: string; cost_usd: number | null;
}
export async function getChapters(bookId: string): Promise<Chapter[]> {
  const { data, error } = await factory()
    .from('chapters')
    .select('id, index, title, target_words, actual_words, summary, draft_md, status, cost_usd')
    .eq('book_id', bookId).order('index');
  if (error) throw error;
  return (data ?? []) as unknown as Chapter[];
}

export interface BookStep {
  step_type: string; index: number; status: string; attempts: number;
  started_at: string | null; finished_at: string | null; error: string | null;
}
export async function getBookSteps(bookId: string): Promise<BookStep[]> {
  const { data, error } = await factory()
    .from('book_steps')
    .select('step_type, index, status, attempts, started_at, finished_at, error')
    .eq('book_id', bookId).order('index');
  if (error) throw error;
  return (data ?? []) as unknown as BookStep[];
}

export async function getBook(id: string): Promise<Book | null> {
  const { data, error } = await factory()
    .from('books').select(BOOK_COLS).eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as unknown as Book) ?? null;
}

export function runWebhookConfigured(): boolean {
  return Boolean(env.KDP_RUN_WEBHOOK_URL);
}

export interface BookRow {
  id: string; version: number; run_type: string; niche_name: string | null;
  niche_slug: string | null; chosen_title: string | null; title_suggestion: string | null;
  topic: string | null; status: string; current_step: string | null;
  kdp_url: string | null; master_doc_url: string | null; created_at: string;
}
const BOOKROW_COLS =
  'id, version, run_type, niche_name, niche_slug, chosen_title, title_suggestion, ' +
  'topic, status, current_step, kdp_url, master_doc_url, created_at';

export async function getBooks(): Promise<BookRow[]> {
  const { data, error } = await factory()
    .from('books').select(BOOKROW_COLS).order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as BookRow[];
}

/** Dashboard rollups: pipeline counts, in-flight, failed, catalog, and spend. */
export interface FactoryDashboard {
  books: BookRow[];
  counts: Record<string, number>;
  inFlight: BookRow[];
  failed: BookRow[];
  catalog: BookRow[];
  totalSpendUsd: number;
  spendByBook: Record<string, number>;
}
export async function getDashboard(): Promise<FactoryDashboard> {
  const [books, gen] = await Promise.all([
    getBooks(),
    factory().from('generation_log').select('book_id, cost_usd'),
  ]);
  const genRows = (gen.data ?? []) as unknown as { book_id: string | null; cost_usd: number | null }[];
  const spendByBook: Record<string, number> = {};
  let totalSpendUsd = 0;
  for (const r of genRows) {
    const c = Number(r.cost_usd ?? 0);
    totalSpendUsd += c;
    if (r.book_id) spendByBook[r.book_id] = (spendByBook[r.book_id] ?? 0) + c;
  }
  const counts: Record<string, number> = {};
  for (const b of books) counts[b.status] = (counts[b.status] ?? 0) + 1;
  const terminal = new Set(['draft', 'ready', 'failed']);
  return {
    books,
    counts,
    inFlight: books.filter((b) => !terminal.has(b.status)),
    failed: books.filter((b) => b.status === 'failed'),
    catalog: books.filter((b) => b.status === 'ready'),
    totalSpendUsd,
    spendByBook,
  };
}

/** Fire the n8n Runner: POST {book_id} to the webhook. Used by Run and Resume. */
export async function runBook(bookId: string): Promise<void> {
  const url = env.KDP_RUN_WEBHOOK_URL;
  if (!url) throw new Error('KDP_RUN_WEBHOOK_URL not set — add the n8n webhook URL to enable Run.');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ book_id: bookId }),
  });
  if (!res.ok) throw new Error(`Webhook ${res.status}: ${await res.text()}`);
}

// ---------------------------------------------------------------------------
// Approve — snapshot the Blueprint into a NEW book row (Stage 2 -> Stage 3).
// ---------------------------------------------------------------------------
export async function approveIdea(id: string, runType: 'sample' | 'full'): Promise<string> {
  const idea = await getIdea(id);
  if (!idea) throw new Error('Idea not found');
  const ctx = idea.niche_slug ? await getNicheContext(idea.niche_slug) : null;

  // next version number for this idea
  const { data: prior } = await factory()
    .from('books').select('version').eq('idea_id', id).order('version', { ascending: false }).limit(1);
  const version = ((prior?.[0] as { version: number } | undefined)?.version ?? 0) + 1;

  const blueprint = {
    topic: idea.topic,
    working_title: idea.working_title,
    user_draft: idea.user_draft,
    claude_draft: idea.claude_draft,
    agreed_toc: idea.agreed_toc,
    differentiation: idea.differentiation,
    payload: idea.payload,
    target_words: idea.target_words,
    niche_context: ctx?.compiled ?? null,
    pen_name: ctx?.pen_name ?? null,
    pen_name_bio: ctx?.pen_name_bio ?? null,
    publisher_name: ctx?.publisher_name ?? null,
    snapshot_at: new Date().toISOString(),
  };

  const { data, error } = await factory()
    .from('books')
    .insert({
      idea_id: id,
      version,
      run_type: runType,
      niche_slug: idea.niche_slug,
      niche_name: ctx?.niche_name ?? idea.niche_name,
      topic: idea.topic,
      title_suggestion: idea.working_title,
      target_words: idea.target_words,
      blueprint,
      status: 'draft',
    })
    .select('id')
    .single();
  if (error) throw error;
  const bookId = (data as { id: string }).id;

  // Seed the OPENING steps so n8n just claims (chapters + tail are added by n8n
  // after the outline exists). contract=index 0, outline=index 1.
  const { error: stepErr } = await factory().from('book_steps').insert([
    { book_id: bookId, step_type: 'contract', index: 0, status: 'pending' },
    { book_id: bookId, step_type: 'outline', index: 1, status: 'pending' },
  ]);
  if (stepErr) throw stepErr;

  await setIdeaStatus(id, 'in_production');
  return bookId;
}
