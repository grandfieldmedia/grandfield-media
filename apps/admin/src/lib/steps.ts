/**
 * KDPFactory — the step engine (server-side, versioned, testable).
 *
 * This replaces the giant n8n "Run step" Code node. n8n still claims the next
 * step (claim_next_step RPC), routes on step_type, and marks it done — but the
 * WORK for each non-assemble step happens here, in real TypeScript, with:
 *   - prompts read from kdp_factory.prompt_templates (versioned; the product)
 *   - every Claude call logged to generation_log (fixes the $0 cost lens)
 *   - no 60s limit → full-length chapters, B8 sees the whole book
 *   - secrets from env only
 *
 * One handler per step_type: contract (B2) · outline (B3, enqueues chapters +
 * tail) · chapter (B4 draft + B5 summary) · metadata (B7) · kdp_check (B8).
 * `assemble` stays in n8n (Google Drive). `polish` (B6) deferred — see runStep.
 */
import { getServiceClient, env } from '@grandfield/shared-backend';

const db = () => getServiceClient().schema('kdp_factory');

// ---- Claude + cost ---------------------------------------------------------
/** Input/output USD per 1M tokens (checked 2026-07-12; re-verify at build time). */
const PRICING: Record<string, { in: number; out: number }> = {
  'claude-fable-5': { in: 10, out: 50 },
  'claude-opus-4-8': { in: 5, out: 25 },
  'claude-sonnet-5': { in: 3, out: 15 },
  'claude-haiku-4-5-20251001': { in: 1, out: 5 },
};
function costUsd(model: string, tokensIn: number, tokensOut: number): number {
  const p = PRICING[model] ?? { in: 3, out: 15 };
  return (tokensIn / 1e6) * p.in + (tokensOut / 1e6) * p.out;
}

interface ClaudeResult { text: string; tokensIn: number; tokensOut: number; cost: number; }

/** Call Claude and log the call to generation_log. Returns text + usage + cost. */
async function callClaudeLogged(opts: {
  bookId: string; step: string; promptKey: string; promptVersion: number;
  model: string; system?: string; user: string; maxTokens: number;
}): Promise<ClaudeResult> {
  const key = env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set');
  const started = Date.now();
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: opts.model,
      max_tokens: opts.maxTokens,
      ...(opts.system ? { system: opts.system } : {}),
      messages: [{ role: 'user', content: opts.user }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as {
    content: { text: string }[];
    usage: { input_tokens: number; output_tokens: number };
  };
  const text = json.content.map((c) => c.text).join('').trim();
  const tokensIn = json.usage?.input_tokens ?? 0;
  const tokensOut = json.usage?.output_tokens ?? 0;
  const cost = costUsd(opts.model, tokensIn, tokensOut);
  await db().from('generation_log').insert({
    book_id: opts.bookId, step: opts.step, prompt_key: opts.promptKey,
    prompt_version: opts.promptVersion, model: opts.model,
    tokens_in: tokensIn, tokens_out: tokensOut, cost_usd: cost,
    duration_ms: Date.now() - started,
  });
  return { text, tokensIn, tokensOut, cost };
}

// ---- prompts + templating --------------------------------------------------
interface Prompt { text: string; model: string; version: number; }
async function getPrompt(key: string): Promise<Prompt> {
  const { data, error } = await db()
    .from('prompt_templates')
    .select('text, model, version')
    .eq('key', key).eq('is_active', true)
    .order('version', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`prompt ${key} not found`);
  return data as unknown as Prompt;
}

/** Replace {PLACEHOLDER} tokens. Missing/undefined → ''. */
function fill(text: string, vars: Record<string, unknown>): string {
  return text.replace(/\{([A-Z0-9_]+)\}/g, (_m, k: string) => {
    const v = vars[k];
    if (v == null) return '';
    return typeof v === 'string' ? v : JSON.stringify(v);
  });
}

/** Pull the first {...} JSON object out of a model response (handles code fences). */
function extractJson<T = Record<string, unknown>>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('no JSON object in model output');
  return JSON.parse(raw.slice(start, end + 1)) as T;
}

const wordCount = (s: string): number => (s.trim().match(/\S+/g) ?? []).length;

// ---- book/context helpers --------------------------------------------------
type Json = Record<string, unknown>;
async function loadBook(bookId: string): Promise<Json> {
  const { data, error } = await db().from('books').select('*').eq('id', bookId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(`book not found: ${bookId}`);
  return data as Json;
}
async function loadChapters(bookId: string): Promise<Json[]> {
  const { data, error } = await db().from('chapters')
    .select('*').eq('book_id', bookId).order('index');
  if (error) throw error;
  return (data ?? []) as Json[];
}
/** The compiled niche context snapshot lives in the blueprint (no registry re-read). */
function nicheContext(book: Json): string {
  const bp = (book.blueprint ?? {}) as Json;
  return String(bp.niche_context ?? '');
}
function bannedPhrases(book: Json): string {
  const sc = (book.style_contract ?? {}) as Json;
  const b = sc.banned_stock_phrases ?? sc.banned_phrases;
  return Array.isArray(b) ? b.join('; ')
    : 'in today\'s fast-paced world; at the end of the day; it\'s important to note; in conclusion';
}

// ===========================================================================
// Handlers
// ===========================================================================

/** B2 — style contract + fact sheet → books.style_contract / fact_sheet. */
async function runContract(bookId: string): Promise<void> {
  const book = await loadBook(bookId);
  const p = await getPrompt('B2');
  const { text } = await callClaudeLogged({
    bookId, step: 'contract', promptKey: 'B2', promptVersion: p.version, model: p.model, maxTokens: 4000,
    user: fill(p.text, {
      BLUEPRINT: book.blueprint,
      NICHE_CONTEXT: nicheContext(book),
      REFERENCE_PROFILE: book.reference_profile ?? '',
      SUPPORT_DOCS: '', // support-doc parsing is a later add
    }),
  });
  const out = extractJson<{ style_contract?: Json; fact_sheet?: Json }>(text);
  await db().from('books').update({
    style_contract: out.style_contract ?? {},
    fact_sheet: out.fact_sheet ?? {},
    status: 'outlining',
  }).eq('id', bookId);
}

/** B3 — production outline → creates chapter rows + enqueues chapter & tail steps. */
async function runOutline(bookId: string): Promise<void> {
  const book = await loadBook(bookId);
  const p = await getPrompt('B3');
  const { text } = await callClaudeLogged({
    bookId, step: 'outline', promptKey: 'B3', promptVersion: p.version, model: p.model, maxTokens: 4000,
    user: fill(p.text, {
      AGREED_TOC: (book.blueprint as Json)?.agreed_toc ?? [],
      STYLE_CONTRACT: book.style_contract,
      NICHE_CONTEXT: nicheContext(book),
      TARGET_WORDS: book.target_words ?? '',
    }),
  });
  const out = extractJson<{ chapters?: { index: number; title: string; key_points?: unknown; coverage_boundaries?: unknown; target_words?: number }[] }>(text);
  let chapters = (out.chapters ?? []).filter((c) => c && c.title);
  if (!chapters.length) throw new Error('outline produced no chapters');
  chapters = chapters.map((c, i) => ({ ...c, index: c.index ?? i + 1 }));

  // Sample runs: chapter 1 + one mid-book chapter only.
  if (book.run_type === 'sample' && chapters.length > 2) {
    const mid = chapters[Math.floor(chapters.length * 0.6)];
    chapters = [chapters[0], mid];
  }

  // Create chapter rows (pending).
  await db().from('chapters').insert(chapters.map((c) => ({
    book_id: bookId, index: c.index, title: c.title,
    goals: c.key_points ?? [], target_words: c.target_words ?? null, status: 'pending',
  })));

  // Enqueue: one 'chapter' step per chapter (index 100 — claimed in creation order),
  // then the tail. `assemble` runs last so the Drive package reflects final content.
  const steps = [
    ...chapters.map(() => ({ book_id: bookId, step_type: 'chapter', index: 100, status: 'pending' })),
    { book_id: bookId, step_type: 'metadata', index: 800, status: 'pending' },
    { book_id: bookId, step_type: 'kdp_check', index: 810, status: 'pending' },
    { book_id: bookId, step_type: 'assemble', index: 820, status: 'pending' },
  ];
  await db().from('book_steps').insert(steps);
  await db().from('books').update({ status: 'drafting' }).eq('id', bookId);
}

/** B4 draft + B5 summary for the next pending chapter → chapters.draft_md / summary. */
async function runChapter(bookId: string): Promise<void> {
  const book = await loadBook(bookId);
  const chapters = await loadChapters(bookId);
  const ch = chapters.find((c) => c.status === 'pending');
  if (!ch) return; // all chapters done — nothing to do
  const i = Number(ch.index);
  const N = chapters.length;
  const prior = chapters.filter((c) => Number(c.index) < i);
  const next = chapters.find((c) => Number(c.index) === i + 1);
  await db().from('chapters').update({ status: 'running' }).eq('id', ch.id);

  const outline = chapters.map((c) =>
    `Ch ${c.index}: ${c.title} — ${JSON.stringify(c.goals ?? [])} (~${c.target_words ?? '?'}w)`).join('\n');
  const rolling = prior.map((c) => `Ch ${c.index} (${c.title}): ${c.summary ?? '(no summary)'}`).join('\n\n')
    || '(this is the first chapter)';

  // B4 — draft
  const b4 = await getPrompt('B4');
  const draft = await callClaudeLogged({
    bookId, step: 'chapter', promptKey: 'B4', promptVersion: b4.version,
    model: (book.model_tier as string) || b4.model, maxTokens: 5000,
    user: fill(b4.text, {
      i, N, i_minus_1: i - 1,
      TITLE: book.chosen_title ?? '', NICHE_NAME: book.niche_name ?? '',
      STYLE_CONTRACT: book.style_contract, NICHE_CONTEXT: nicheContext(book),
      COMPLIANCE_RULES: nicheContext(book), OUTLINE: outline,
      ROLLING_SUMMARIES: rolling, REFERENCE_PROFILE: book.reference_profile ?? '',
      CH_TITLE: ch.title ?? '', CH_GOALS: ch.goals ?? [], CH_WORDS: ch.target_words ?? '',
      FACT_SHEET_EXCERPT: book.fact_sheet, NEXT_CH_TITLE: next?.title ?? 'the conclusion',
      BANNED_PHRASES: bannedPhrases(book),
    }),
  });

  // B5 — rolling summary
  const b5 = await getPrompt('B5');
  const summary = await callClaudeLogged({
    bookId, step: 'chapter', promptKey: 'B5', promptVersion: b5.version, model: b5.model, maxTokens: 500,
    user: fill(b5.text, { i, CH_TITLE: ch.title ?? '', CHAPTER_TEXT: draft.text }),
  });

  await db().from('chapters').update({
    draft_md: draft.text, actual_words: wordCount(draft.text), summary: summary.text,
    status: 'done', tokens_in: draft.tokensIn, tokens_out: draft.tokensOut,
    cost_usd: draft.cost + summary.cost,
  }).eq('id', ch.id);
}

/** B7 — KDP listing pack → books.listing. */
async function runMetadata(bookId: string): Promise<void> {
  const book = await loadBook(bookId);
  const [defaults, rules] = await Promise.all([
    db().from('kdp_niche_defaults').select('*').eq('niche_slug', book.niche_slug ?? '').maybeSingle(),
    db().from('kdp_rules').select('*'),
  ]);
  const p = await getPrompt('B7');
  const { text } = await callClaudeLogged({
    bookId, step: 'metadata', promptKey: 'B7', promptVersion: p.version, model: p.model, maxTokens: 3000,
    user: fill(p.text, {
      BLUEPRINT: book.blueprint,
      BOOK: { title: book.chosen_title, niche: book.niche_name, pen_name: (book.blueprint as Json)?.pen_name, publisher: (book.blueprint as Json)?.publisher_name },
      KDP_NICHE_DEFAULTS: defaults.data ?? {},
      KDP_RULES: rules.data ?? [],
    }),
  });
  await db().from('books').update({ listing: extractJson(text), status: 'metadata' }).eq('id', bookId);
}

/** B8 — KDP Check → books.qa. Reads the FULL draft (no truncation → no false fails). */
async function runKdpCheck(bookId: string): Promise<void> {
  const book = await loadBook(bookId);
  const chapters = await loadChapters(bookId);
  const rules = await db().from('kdp_rules').select('*');
  const fullDraft = chapters.map((c) => c.draft_md ?? '').join('\n\n');
  const p = await getPrompt('B8');
  const { text } = await callClaudeLogged({
    bookId, step: 'kdp_check', promptKey: 'B8', promptVersion: p.version, model: p.model, maxTokens: 3000,
    user: fill(p.text, {
      REFERENCE_PROFILE: book.reference_profile ?? '', COMPLIANCE_RULES: nicheContext(book),
      KDP_RULES: rules.data ?? [], FULL_DRAFT: fullDraft, METADATA: book.listing,
    }),
  });
  await db().from('books').update({ qa: extractJson(text) }).eq('id', bookId);
}

// ===========================================================================
// Dispatch
// ===========================================================================
export type StepType = 'contract' | 'outline' | 'chapter' | 'metadata' | 'kdp_check' | 'polish';

/** Run one claimed step's work. `assemble` is n8n's job (Drive); `polish` is a
 * documented no-op for now (B6 edits aren't auto-applied yet). */
export async function runStep(bookId: string, stepType: StepType): Promise<void> {
  switch (stepType) {
    case 'contract': return runContract(bookId);
    case 'outline': return runOutline(bookId);
    case 'chapter': return runChapter(bookId);
    case 'metadata': return runMetadata(bookId);
    case 'kdp_check': return runKdpCheck(bookId);
    case 'polish': return; // deferred — B6 edits not auto-applied yet
    default: throw new Error(`unhandled step_type: ${stepType}`);
  }
}
