import { getServiceClient } from '@grandfield/shared-backend';

/**
 * Data access for the shared `registry` schema (the Niche Master Registry).
 * Read by ALL Factories. NOTE: the `registry` schema must be added to
 * Supabase -> Settings -> Data API -> Exposed schemas.
 */
const registry = () => getServiceClient().schema('registry');

export interface Niche {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  pen_name: string | null;
  pen_name_bio: string | null;
  publisher_name: string | null;
  audience: string | null;
  buying_motivation: string | null;
  voice_tone: string | null;
  reading_level: string | null;
  compliance_rules: string | null;
  dos: string[];
  donts: string[];
  keywords: string[];
  context_notes: string | null;
  sort_order: number;
  status: string;
}

export interface NicheTreeNode extends Niche {
  children: Niche[];
}

const NICHE_COLS =
  'id, parent_id, slug, name, pen_name, pen_name_bio, publisher_name, audience, ' +
  'buying_motivation, voice_tone, reading_level, compliance_rules, dos, donts, ' +
  'keywords, context_notes, sort_order, status';

/** All active niches (parents + sub-niches), flat. */
export async function getNiches(): Promise<Niche[]> {
  const { data, error } = await registry()
    .from('niches')
    .select(NICHE_COLS)
    .eq('status', 'active')
    .order('sort_order');
  if (error) throw error;
  return (data ?? []) as unknown as Niche[];
}

/** Parent niches with their sub-niches nested — powers the two-level dropdown. */
export async function getNicheTree(): Promise<NicheTreeNode[]> {
  const all = await getNiches();
  const parents = all.filter((n) => n.parent_id === null);
  return parents.map((p) => ({
    ...p,
    children: all
      .filter((c) => c.parent_id === p.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }));
}

/** One niche by slug. */
export async function getNiche(slug: string): Promise<Niche | null> {
  const { data, error } = await registry()
    .from('niches')
    .select(NICHE_COLS)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as Niche) ?? null;
}

/** Update a niche's editable context fields (by id). */
export async function updateNiche(id: string, patch: Partial<Niche>): Promise<void> {
  const { error } = await registry().from('niches').update(patch).eq('id', id);
  if (error) throw error;
}

/** Add a sub-niche under a parent. */
export async function createSubNiche(input: {
  parent_id: string; slug: string; name: string; sort_order?: number;
}): Promise<void> {
  const { error } = await registry().from('niches').insert({
    parent_id: input.parent_id, slug: input.slug, name: input.name,
    sort_order: input.sort_order ?? 0, status: 'active',
  });
  if (error) throw error;
}

/**
 * The compiler: merge a sub-niche with its parent into ONE context block, the way
 * every Factory reads it. Parent is the base; the sub-niche refines it; compliance
 * accumulates down the tree; pen name / publisher resolve to the parent.
 * Returns both the resolved fields and a ready-to-inject {NICHE_CONTEXT} text.
 */
export async function getNicheContext(slug: string): Promise<{
  niche_slug: string;
  niche_name: string;
  pen_name: string | null;
  pen_name_bio: string | null;
  publisher_name: string | null;
  compiled: string;
} | null> {
  const node = await getNiche(slug);
  if (!node) return null;
  const parent = node.parent_id
    ? (await getNiches()).find((n) => n.id === node.parent_id) ?? null
    : null;

  // resolve: sub value wins, else parent's
  const pick = (k: keyof Niche) =>
    ((node[k] as string) || (parent?.[k] as string) || '') as string;
  const pickArr = (k: 'dos' | 'donts' | 'keywords') => {
    const merged = [...(parent?.[k] ?? []), ...(node[k] ?? [])];
    return [...new Set(merged)];
  };

  const penName = node.pen_name || parent?.pen_name || null;
  const penBio = node.pen_name_bio || parent?.pen_name_bio || null;
  const publisher = node.publisher_name || parent?.publisher_name || null;

  // compliance accumulates: parent rules + sub rules
  const compliance = [parent?.compliance_rules, node.compliance_rules]
    .filter(Boolean)
    .join('\n');

  const lines = [
    `NICHE: ${parent ? `${parent.name} > ${node.name}` : node.name}`,
    pick('audience') && `AUDIENCE: ${pick('audience')}`,
    pick('buying_motivation') && `WHAT THEY'RE BUYING: ${pick('buying_motivation')}`,
    pick('voice_tone') && `VOICE & TONE: ${pick('voice_tone')}`,
    pick('reading_level') && `READING LEVEL: ${pick('reading_level')}`,
    compliance && `COMPLIANCE (hard rules): ${compliance}`,
    pickArr('dos').length && `DO: ${pickArr('dos').join('; ')}`,
    pickArr('donts').length && `DON'T: ${pickArr('donts').join('; ')}`,
    pickArr('keywords').length && `KEYWORDS: ${pickArr('keywords').join(', ')}`,
    pick('context_notes') && `NOTES: ${pick('context_notes')}`,
  ].filter(Boolean);

  return {
    niche_slug: node.slug,
    niche_name: parent ? `${parent.name} > ${node.name}` : node.name,
    pen_name: penName,
    pen_name_bio: penBio,
    publisher_name: publisher,
    compiled: lines.join('\n'),
  };
}
