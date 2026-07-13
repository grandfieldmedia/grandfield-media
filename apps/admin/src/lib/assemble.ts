/**
 * KDPFactory — book assembler (server-side, Node/Vercel).
 *
 * Fills the print-ready Master Book Template DOCX with a book's chapters and
 * returns the package as base64 files, so n8n can create the folders and upload
 * them to Google Drive. The template (embedded EB Garamond + Libre Baskerville,
 * 6x9" trim, named styles) is unzipped, its word/document.xml edited, and rezipped
 * — fonts + layout survive byte-for-byte. Proven end-to-end against a real book.
 *
 * Called by /api/kdp/assemble. The transform logic mirrors the reference Python
 * (kdp-factory-assemble-local.py).
 */
import JSZip from 'jszip';
import { buildBookPdf } from './pdf';

export interface AssembleChapter {
  index: number;
  title: string | null;
  draft_md: string | null;
}
export interface AssembleBook {
  chosen_title: string | null;
  title_suggestion: string | null;
  subtitle: string | null;
  niche_slug: string | null;
  niche_name: string | null;
  blueprint: Record<string, unknown> | null;
  listing: Record<string, unknown> | null;
}
export interface AssembledFile {
  name: string;
  mime: string;
  /** 'base64' for the .docx files (binary), 'utf8' for the .html (text). */
  encoding: 'base64' | 'utf8';
  content: string;
}
export interface AssembleResult {
  folder: { parent: string; sub: string; book: string };
  files: AssembledFile[];
}

const SEP = '·'; // ·
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PARA = /<w:p\b[^>]*>[\s\S]*?<\/w:p>/g;

const esc = (s: unknown): string =>
  (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

interface Skeletons {
  toc: string; h1: string; ch2body: string; h2: string | null;
  bodyPpr: string; bodyRpr: string;
}

function skeletons(xml: string): Skeletons {
  const paras = xml.match(PARA) ?? [];
  const pw = (sub: string) => paras.find((p) => p.indexOf(sub) >= 0) ?? null;
  const toc = pw('{{TOC}}'), h1 = pw('{{CHAPTER_1_TITLE}}'), ch2body = pw('{{CHAPTER_2_BODY}}');
  if (!toc || !h1 || !ch2body) throw new Error('template markers missing (TOC / CHAPTER_1_TITLE / CHAPTER_2_BODY)');
  const rs = xml.indexOf(h1), re = xml.indexOf(ch2body) + ch2body.length;
  const region = xml.substring(rs, re).match(PARA) ?? [];
  let body: string | null = null, h2: string | null = null;
  for (const p of region) {
    if (!body && /<w:jc w:val="both"\/>/.test(p)) body = p;
    if (!h2 && /<w:pStyle w:val="Heading2"\/>/.test(p)) h2 = p;
  }
  if (!body) throw new Error('no justified body paragraph in template chapter region');
  return {
    toc, h1, ch2body, h2,
    bodyPpr: body.match(/<w:pPr>[\s\S]*?<\/w:pPr>/)![0],
    bodyRpr: body.match(/<w:r\b[^>]*>(<w:rPr>[\s\S]*?<\/w:rPr>)/)![1],
  };
}

const swapText = (skel: string, text: string): string => {
  const a = skel.lastIndexOf('<w:t ');
  const o = skel.indexOf('>', a) + 1;
  const c = skel.indexOf('</w:t>', o);
  return skel.substring(0, o) + esc(text) + skel.substring(c);
};

function parseInline(md: string): { t: string; b: boolean; i: boolean }[] {
  const runs: { t: string; b: boolean; i: boolean }[] = [];
  let buf = '', b = false, it = false, k = 0;
  const push = () => { if (buf) { runs.push({ t: buf, b, i: it }); buf = ''; } };
  while (k < md.length) {
    if (md.slice(k, k + 2) === '**') { push(); b = !b; k += 2; }
    else if (md.charAt(k) === '*') { push(); it = !it; k += 1; }
    else { buf += md.charAt(k); k += 1; }
  }
  push();
  return runs.length ? runs : [{ t: '', b: false, i: false }];
}

function bodyPara(s: Skeletons, md: string, indent: boolean): string {
  const ppr = indent ? s.bodyPpr.replace('w:firstLine="0"', 'w:firstLine="288"') : s.bodyPpr;
  let runs = '';
  for (const seg of parseInline(md)) {
    let rpr = s.bodyRpr;
    if (seg.b) rpr = rpr.replace('<w:b w:val="0"/>', '<w:b w:val="1"/>').replace('<w:bCs w:val="0"/>', '<w:bCs w:val="1"/>');
    if (seg.i) rpr = rpr.replace('<w:i w:val="0"/>', '<w:i w:val="1"/>').replace('<w:iCs w:val="0"/>', '<w:iCs w:val="1"/>');
    runs += `<w:r>${rpr}<w:t xml:space="preserve">${esc(seg.t)}</w:t></w:r>`;
  }
  return `<w:p>${ppr}${runs}</w:p>`;
}

function chapterParas(s: Skeletons, c: AssembleChapter, pageBreak: boolean): string {
  let head = swapText(s.h1, `Chapter ${c.index} ${SEP} ${c.title ?? ''}`);
  if (!pageBreak) head = head.replace('<w:pStyle w:val="Heading1"/>', '<w:pStyle w:val="Heading1"/><w:pageBreakBefore w:val="0"/>');
  let out = head, first = true;
  for (const raw of (c.draft_md ?? '').split('\n')) {
    const l = raw.replace(/^\s+|\s+$/g, '');
    if (!l) continue;
    if (l.indexOf('### ') === 0) { out += s.h2 ? swapText(s.h2, l.slice(4)) : bodyPara(s, l.slice(4), false); first = true; }
    else if (l.indexOf('## ') === 0 || l.indexOf('# ') === 0) continue;
    else { out += bodyPara(s, l, !first); first = false; }
  }
  return out;
}

function buildFull(xml: string, s: Skeletons, fields: Record<string, string>, chapters: AssembleChapter[]): string {
  const toc = chapters.map((c) => swapText(s.toc, `Chapter ${c.index} ${SEP} ${c.title ?? ''}`)).join('');
  const chaps = chapters.map((c) => chapterParas(s, c, true)).join('');
  for (const k of Object.keys(fields)) xml = xml.split(k).join(esc(fields[k]));
  xml = xml.split(s.toc).join(toc);
  const a = xml.indexOf(s.h1), b = xml.indexOf(s.ch2body) + s.ch2body.length;
  return xml.substring(0, a) + chaps + xml.substring(b);
}

function buildChapterOnly(xml: string, s: Skeletons, c: AssembleChapter): string {
  const m = xml.match(/<w:body[^>]*>/)!;
  const end = (m.index ?? 0) + m[0].length;
  const sect = xml.lastIndexOf('<w:sectPr');
  return xml.substring(0, end) + chapterParas(s, c, false) + xml.substring(sect);
}

function buildHtml(fields: Record<string, string>, chapters: AssembleChapter[]): string {
  const inl = (md: string) => parseInline(md).map((s) => {
    let t = esc(s.t); if (s.b) t = `<strong>${t}</strong>`; if (s.i) t = `<em>${t}</em>`; return t;
  }).join('');
  const css =
    'body{font-family:"Libre Baskerville",Georgia,serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}' +
    'h1,h2{font-family:"EB Garamond",Georgia,serif;font-weight:600}' +
    'h1.book{text-align:center;font-size:2.4rem;margin:2rem 0 .3rem}' +
    '.subtitle{text-align:center;font-style:italic;color:#555;margin:0 0 1rem}' +
    '.byline{text-align:center;margin:0 0 3rem}' +
    'h1.chapter{font-size:1.7rem;text-align:center;margin:3rem 0 1.5rem;page-break-before:always}' +
    'h2{font-size:1.2rem;font-variant:small-caps;text-align:center;margin:2rem 0 1rem}' +
    'p{margin:0 0 .2rem;text-align:justify}';
  const h: string[] = ['<!doctype html><html lang="en"><head><meta charset="utf-8"><title>',
    esc(fields['{{BOOK_TITLE}}']), '</title><style>', css, '</style></head><body>',
    '<h1 class="book">', esc(fields['{{BOOK_TITLE}}']), '</h1>'];
  if (fields['{{BOOK_SUBTITLE}}']) h.push('<p class="subtitle">', esc(fields['{{BOOK_SUBTITLE}}']), '</p>');
  h.push('<p class="byline">', esc(fields['{{PEN_NAME}}']), '</p>');
  for (const c of chapters) {
    h.push(`<h1 class="chapter">Chapter ${c.index} ${SEP} ${esc(c.title)}</h1>`);
    for (const raw of (c.draft_md ?? '').split('\n')) {
      const l = raw.replace(/^\s+|\s+$/g, '');
      if (!l) continue;
      if (l.indexOf('### ') === 0) h.push('<h2>', esc(l.slice(4)), '</h2>');
      else if (l.indexOf('## ') === 0 || l.indexOf('# ') === 0) continue;
      else h.push('<p>', inl(l), '</p>');
    }
  }
  if (fields['{{AUTHOR_BIO}}']) h.push('<h1 class="chapter">About the Author</h1><p>', esc(fields['{{AUTHOR_BIO}}']), '</p>');
  h.push('</body></html>');
  return h.join('');
}

/** Remove the embedded font binaries from a zip (keeps chapter files ~8KB, not ~1MB). */
async function stripFonts(zip: JSZip): Promise<void> {
  Object.keys(zip.files).filter((f) => f.startsWith('word/fonts/')).forEach((f) => zip.remove(f));
  zip.remove('word/fontTable.xml');
  zip.remove('word/_rels/fontTable.xml.rels');
  const ct = zip.file('[Content_Types].xml');
  if (ct) {
    let s = await ct.async('string');
    s = s.replace(/<Override[^>]*fontTable\.xml[^>]*\/>/, '').replace(/<Default[^>]*Extension="fntdata"[^>]*\/>/, '');
    zip.file('[Content_Types].xml', s);
  }
  const rels = zip.file('word/_rels/document.xml.rels');
  if (rels) {
    let s = await rels.async('string');
    s = s.replace(/<Relationship[^>]*fontTable\.xml[^>]*\/>/, '');
    zip.file('word/_rels/document.xml.rels', s);
  }
  const set = zip.file('word/settings.xml');
  if (set) {
    let s = await set.async('string');
    s = s.replace(/<w:embedTrueTypeFonts[^>]*\/>/, '').replace(/<w:embedSystemFonts[^>]*\/>/, '');
    zip.file('word/settings.xml', s);
  }
}

const safeName = (t: string | null): string =>
  ((t ?? 'Untitled') + '').replace(/[\\/:*?"<>|]/g, ' ').replace(/^\s+|\s+$/g, '') || 'Untitled';
const pad2 = (n: number): string => ('0' + n).slice(-2);

/** KDP listing metadata sheet (Markdown) from the B7 `listing` output. */
function buildMetadata(
  meta: { title: string; subtitle: string; pen: string; publisher: string },
  listing: Record<string, unknown> | null,
): string {
  const L = listing ?? {};
  const g = (k: string): unknown => (L as Record<string, unknown>)[k];
  const str = (v: unknown): string => (v == null ? '' : String(v));
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => String(x)) : []);
  const kw = arr(g('keywords'));
  const cats = arr(g('categories'));
  const cover = (g('cover_brief') as Record<string, unknown>) ?? {};
  const out: string[] = [
    `# ${meta.title} — KDP Listing Metadata`,
    '',
    `**Title:** ${str(g('title')) || meta.title}`,
    `**Subtitle:** ${str(g('subtitle')) || meta.subtitle}`,
    `**Author (pen name):** ${meta.pen}`,
    `**Publisher / imprint:** ${meta.publisher}`,
  ];
  if (g('series_name_idea')) out.push(`**Series idea:** ${str(g('series_name_idea'))}`);
  if (g('price_suggestion')) out.push(`**Suggested price:** ${str(g('price_suggestion'))}`);
  out.push('', '## Description (KDP-supported HTML — paste into the description field)', '',
    str(g('description')) || '_(not generated yet — run the metadata step)_');
  out.push('', '## Keywords (7 slots)', ...(kw.length ? kw.map((k, i) => `${i + 1}. ${k}`) : ['_(none)_']));
  out.push('', '## Categories', ...(cats.length ? cats.map((c, i) => `${i + 1}. ${c}`) : ['_(none)_']));
  if (g('back_cover_blurb')) out.push('', '## Back-cover blurb', '', str(g('back_cover_blurb')));
  const cv: string[] = [];
  if (cover.title_treatment) cv.push(`- **Title treatment:** ${str(cover.title_treatment)}`);
  if (cover.mood) cv.push(`- **Mood:** ${str(cover.mood)}`);
  if (cover.imagery_direction) cv.push(`- **Imagery:** ${str(cover.imagery_direction)}`);
  if (cover.comp_covers) cv.push(`- **Comp covers:** ${str(cover.comp_covers)}`);
  if (cv.length) out.push('', '## Cover brief (for the manual cover step)', ...cv);
  out.push('', '---',
    "_AI-generated content — declare at KDP upload. Re-verify all fields against KDP's current character limits and category list before publishing._");
  return out.join('\n');
}

/**
 * Assemble the package. Returns the niche folder path and the files (base64):
 * full styled .docx (KDP master, fonts embedded), full .html, and one
 * lightweight .docx per chapter (fonts stripped).
 */
export async function assembleBook(
  templateBytes: ArrayBuffer | Uint8Array,
  book: AssembleBook,
  chapters: AssembleChapter[],
): Promise<AssembleResult> {
  const bp = book.blueprint ?? {};
  const g = (k: string) => (bp as Record<string, string | undefined>)[k];
  const ymyl = /money|finance|health|wellness/.test((book.niche_slug ?? '') + '');
  const fields: Record<string, string> = {
    '{{BOOK_TITLE}}': book.chosen_title || g('working_title') || book.title_suggestion || 'Untitled',
    '{{BOOK_SUBTITLE}}': book.subtitle || g('subtitle') || '',
    '{{PEN_NAME}}': g('pen_name') || 'Grandfield Media',
    '{{PUBLISHER_NAME}}': g('publisher_name') || 'Grandfield Media',
    '{{YEAR}}': String(new Date().getFullYear()),
    '{{DEDICATION}}': g('dedication') || '',
    '{{AUTHOR_BIO}}': g('pen_name_bio') || '',
    '{{WEBSITE_URL}}': g('website_url') || 'grandfieldmedia.com',
    '{{LEGAL_DISCLAIMER}}': ymyl
      ? 'This book is for general informational and educational purposes only and does not ' +
        'constitute professional advice. Consult a qualified professional before acting on any ' +
        'information contained herein. The publisher assumes no responsibility for decisions made ' +
        'based on this book.'
      : 'This book is provided for general informational and educational purposes only. While every ' +
        'effort has been made to ensure accuracy, the publisher assumes no responsibility for errors ' +
        'or omissions, or for outcomes resulting from the use of this information.',
  };
  const title = fields['{{BOOK_TITLE}}'];

  const load = () => JSZip.loadAsync(templateBytes);
  const tpl = await load();
  const templateXml = await tpl.file('word/document.xml')!.async('string');
  const s = skeletons(templateXml);
  const gen = (z: JSZip) => z.generateAsync({ type: 'base64', compression: 'DEFLATE' });

  const files: AssembledFile[] = [];

  // full book (fonts embedded)
  const fullZip = await load();
  fullZip.file('word/document.xml', buildFull(templateXml, s, fields, chapters));
  files.push({ name: `${safeName(title)}.docx`, mime: DOCX_MIME, encoding: 'base64', content: await gen(fullZip) });

  const meta = {
    title, subtitle: fields['{{BOOK_SUBTITLE}}'], pen: fields['{{PEN_NAME}}'],
    publisher: fields['{{PUBLISHER_NAME}}'], bio: fields['{{AUTHOR_BIO}}'],
    legal: fields['{{LEGAL_DISCLAIMER}}'], year: fields['{{YEAR}}'],
  };

  // full book PDF (the sellable digital product) — embeds the template's fonts
  const fontBuf = async (n: string): Promise<Buffer> =>
    (await tpl.file(`word/fonts/${n}`)!.async('nodebuffer'));
  const pdfB64 = await buildBookPdf(
    {
      body: await fontBuf('LibreBaskerville-regular.ttf'),
      bodyB: await fontBuf('LibreBaskerville-bold.ttf'),
      bodyI: await fontBuf('LibreBaskerville-italic.ttf'),
      disp: await fontBuf('EBGaramond-regular.ttf'),
      dispB: await fontBuf('EBGaramond-bold.ttf'),
      dispI: await fontBuf('EBGaramond-italic.ttf'),
    },
    meta,
    chapters,
  );
  files.push({ name: `${safeName(title)}.pdf`, mime: 'application/pdf', encoding: 'base64', content: pdfB64 });

  // KDP listing metadata (from the B7 step) — the upload sheet for KDP + the site
  files.push({
    name: `${safeName(title)} — Metadata.md`, mime: 'text/markdown', encoding: 'utf8',
    content: buildMetadata(meta, book.listing),
  });

  // full book HTML (plain text — n8n uploads it directly)
  files.push({ name: `${safeName(title)}.html`, mime: 'text/html', encoding: 'utf8', content: buildHtml(fields, chapters) });

  // one lightweight .docx per chapter (fonts stripped)
  for (const c of chapters) {
    const z = await load();
    z.file('word/document.xml', buildChapterOnly(templateXml, s, c));
    await stripFonts(z);
    files.push({ name: `${pad2(c.index)} - ${safeName(c.title)}.docx`, mime: DOCX_MIME, encoding: 'base64', content: await gen(z) });
  }

  const parts = (book.niche_name || 'Uncategorized').split('>');
  return {
    folder: {
      parent: safeName(parts[0]) || 'Uncategorized',
      sub: parts.length > 1 ? safeName(parts[1]) : 'General',
      book: safeName(title),
    },
    files,
  };
}
