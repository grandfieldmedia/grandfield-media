#!/usr/bin/env python3
"""
KDPFactory — local book assembler (reference twin of kdp-factory-assemble.gs).

Fills the print-ready Master Book Template DOCX with a book's chapters from
Supabase and writes a full package into a nested folder:

    _book-output/<Parent Niche>/<Sub Niche>/<Book Title>/
        <Book Title>.docx          full styled book (KDP upload master)
        <Book Title>.html          full book as one HTML file
        01 - <Chapter>.docx        one styled .docx per chapter
        02 - <Chapter>.docx        ...

Same transform as the Apps Script Web App that runs in the n8n pipeline. Use this
to preview/regenerate any book during calibration (read before upload).

Usage:
    python kdp-factory-assemble-local.py <book_id> [--template PATH]

Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from .env.local (repo root).
Stdlib only. Render a .docx to PDF on Windows with Word COM (SaveAs2 ..., 17).
"""
import re, json, zipfile, os, argparse, urllib.request, tempfile, shutil

ROOT = os.path.dirname(os.path.abspath(__file__))
SEP = '·'
PARA = r'<w:p\b[^>]*>.*?</w:p>'

# ---- Supabase --------------------------------------------------------------
def load_env():
    e = {}
    for line in open(os.path.join(ROOT, '.env.local'), encoding='utf-8'):
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1); e[k] = v
    return e

def sb(env, path):
    key = env['SUPABASE_SERVICE_ROLE_KEY']
    req = urllib.request.Request(
        f"{env['SUPABASE_URL']}/rest/v1{path}",
        headers={'apikey': key, 'Authorization': 'Bearer ' + key, 'Accept-Profile': 'kdp_factory'})
    return json.load(urllib.request.urlopen(req))

# ---- XML text helpers ------------------------------------------------------
def esc(s): return (s or '').replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')

def swap_text(skel, newtext):
    a = skel.rfind('<w:t ')                 # real text element: <w:t xml:space="preserve">
    o = skel.index('>', a) + 1
    c = skel.index('</w:t>', o)
    return skel[:o] + esc(newtext) + skel[c:]

def parse_inline(md):
    runs = []; buf = ''; b = False; i = False; k = 0
    def push():
        nonlocal buf
        if buf: runs.append((buf, b, i)); buf = ''
    while k < len(md):
        if md[k:k+2] == '**': push(); b = not b; k += 2
        elif md[k] == '*': push(); i = not i; k += 1
        else: buf += md[k]; k += 1
    push()
    return runs or [('', False, False)]

# ---- skeletons (borrowed from the template's own paragraphs) ---------------
def skeletons(xml):
    paras = re.findall(PARA, xml, re.S)
    def para_with(sub):
        return next((p for p in paras if sub in p), None)
    s = {
        'toc': para_with('{{TOC}}'),
        'h1': para_with('{{CHAPTER_1_TITLE}}'),
        'ch2body': para_with('{{CHAPTER_2_BODY}}'),
    }
    if not all(s.values()):
        raise SystemExit('template markers missing (TOC / CHAPTER_1_TITLE / CHAPTER_2_BODY)')
    rs = xml.index(s['h1']); re_ = xml.index(s['ch2body']) + len(s['ch2body'])
    region = re.findall(PARA, xml[rs:re_], re.S)
    body = next((p for p in region if '<w:jc w:val="both"/>' in p), None)
    if not body: raise SystemExit('no justified body paragraph in template chapter region')
    s['h2'] = next((p for p in region if '<w:pStyle w:val="Heading2"/>' in p), None)
    s['body_ppr'] = re.search(r'<w:pPr>.*?</w:pPr>', body, re.S).group(0)
    s['body_rpr'] = re.search(r'<w:r\b[^>]*>(<w:rPr>.*?</w:rPr>)', body, re.S).group(1)
    return s

def body_para(s, md, indent):
    ppr = s['body_ppr'].replace('w:firstLine="0"', 'w:firstLine="288"') if indent else s['body_ppr']
    runs = ''
    for txt, b, it in parse_inline(md):
        rpr = s['body_rpr']
        if b: rpr = rpr.replace('<w:b w:val="0"/>', '<w:b w:val="1"/>').replace('<w:bCs w:val="0"/>', '<w:bCs w:val="1"/>')
        if it: rpr = rpr.replace('<w:i w:val="0"/>', '<w:i w:val="1"/>').replace('<w:iCs w:val="0"/>', '<w:iCs w:val="1"/>')
        runs += f'<w:r>{rpr}<w:t xml:space="preserve">{esc(txt)}</w:t></w:r>'
    return f'<w:p>{ppr}{runs}</w:p>'

def chapter_paras(s, c, page_break=True):
    """Chapter heading + body paragraphs. page_break=False drops the leading page
    break (Heading1 style forces one) — used for standalone one-chapter files."""
    head = swap_text(s['h1'], f"Chapter {c['index']} {SEP} {c['title']}")
    if not page_break:
        head = head.replace('<w:pStyle w:val="Heading1"/>',
                            '<w:pStyle w:val="Heading1"/><w:pageBreakBefore w:val="0"/>', 1)
    out = head
    first = True
    for raw in (c['draft_md'] or '').split('\n'):
        l = raw.strip()
        if not l: continue
        if l.startswith('### '):
            out += (swap_text(s['h2'], l[4:].strip()) if s['h2'] else body_para(s, l[4:].strip(), False)); first = True
        elif l.startswith('## ') or l.startswith('# '):
            continue
        else:
            out += body_para(s, l, indent=not first); first = False
    return out

# ---- document.xml builders -------------------------------------------------
def build_full(xml, s, fields, chapters):
    toc = ''.join(swap_text(s['toc'], f"Chapter {c['index']} {SEP} {c['title']}") for c in chapters)
    chaps = ''.join(chapter_paras(s, c, page_break=True) for c in chapters)
    for k, v in fields.items():
        xml = xml.replace(k, esc(v))
    xml = xml.replace(s['toc'], toc)
    a = xml.index(s['h1']); b = xml.index(s['ch2body']) + len(s['ch2body'])
    return xml[:a] + chaps + xml[b:]

def build_chapter_only(xml, s, c):
    """Replace the whole body content with just this one chapter (no front matter)."""
    body_open_end = re.search(r'<w:body[^>]*>', xml).end()
    sect = xml.rindex('<w:sectPr')
    return xml[:body_open_end] + chapter_paras(s, c, page_break=False) + xml[sect:]

def zip_docx(template, new_document_xml, out_path):
    work = tempfile.mkdtemp()
    try:
        with zipfile.ZipFile(template) as z: z.extractall(work)
        with open(os.path.join(work, 'word', 'document.xml'), 'w', encoding='utf-8') as f:
            f.write(new_document_xml)
        with zipfile.ZipFile(out_path, 'w', zipfile.ZIP_DEFLATED) as z:
            for root, _, files in os.walk(work):
                for f in files:
                    fp = os.path.join(root, f)
                    z.write(fp, os.path.relpath(fp, work).replace(os.sep, '/'))
    finally:
        shutil.rmtree(work, ignore_errors=True)

# ---- HTML builder ----------------------------------------------------------
def md_inline_html(md):
    out = ''
    for txt, b, i in parse_inline(md):
        t = esc(txt)
        if b: t = f'<strong>{t}</strong>'
        if i: t = f'<em>{t}</em>'
        out += t
    return out

def build_html(fields, chapters):
    parts = [
        '<!doctype html><html lang="en"><head><meta charset="utf-8">',
        f'<title>{esc(fields["{{BOOK_TITLE}}"])}</title>',
        '<style>',
        'body{font-family:"Libre Baskerville",Georgia,serif;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.6;color:#1a1a1a}',
        'h1,h2{font-family:"EB Garamond",Georgia,serif;font-weight:600}',
        'h1.book{text-align:center;font-size:2.4rem;margin:2rem 0 .3rem}',
        '.subtitle{text-align:center;font-style:italic;color:#555;margin:0 0 1rem}',
        '.byline{text-align:center;margin:0 0 3rem}',
        'h1.chapter{font-size:1.7rem;text-align:center;margin:3rem 0 1.5rem;page-break-before:always}',
        'h2{font-size:1.2rem;font-variant:small-caps;text-align:center;margin:2rem 0 1rem}',
        'p{margin:0 0 .2rem;text-align:justify}',
        '</style></head><body>',
        f'<h1 class="book">{esc(fields["{{BOOK_TITLE}}"])}</h1>',
    ]
    if fields['{{BOOK_SUBTITLE}}']:
        parts.append(f'<p class="subtitle">{esc(fields["{{BOOK_SUBTITLE}}"])}</p>')
    parts.append(f'<p class="byline">{esc(fields["{{PEN_NAME}}"])}</p>')
    for c in chapters:
        parts.append(f'<h1 class="chapter">Chapter {c["index"]} {SEP} {esc(c["title"])}</h1>')
        for raw in (c['draft_md'] or '').split('\n'):
            l = raw.strip()
            if not l: continue
            if l.startswith('### '): parts.append(f'<h2>{esc(l[4:].strip())}</h2>')
            elif l.startswith('## ') or l.startswith('# '): continue
            else: parts.append(f'<p>{md_inline_html(l)}</p>')
    if fields['{{AUTHOR_BIO}}']:
        parts.append(f'<h1 class="chapter">About the Author</h1><p>{esc(fields["{{AUTHOR_BIO}}"])}</p>')
    parts.append('</body></html>')
    return ''.join(parts)

# ---- main ------------------------------------------------------------------
def safe(name): return re.sub(r'[\\/:*?"<>|]', ' ', (name or 'Untitled')).strip() or 'Untitled'

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('book_id')
    ap.add_argument('--template', default=os.path.join(ROOT, 'Grandfield-Master-Book-Template-Final.docx'))
    a = ap.parse_args()
    env = load_env()
    book = sb(env, f"/books?id=eq.{a.book_id}&select=*")[0]
    chapters = sb(env, f"/chapters?book_id=eq.{a.book_id}&order=index&select=index,title,draft_md")
    bp = book.get('blueprint') or {}
    ymyl = bool(re.search('money|finance|health|wellness', book.get('niche_slug') or ''))
    fields = {
        '{{BOOK_TITLE}}': book.get('chosen_title') or bp.get('working_title') or 'Untitled',
        '{{BOOK_SUBTITLE}}': book.get('subtitle') or bp.get('subtitle') or '',
        '{{PEN_NAME}}': bp.get('pen_name') or 'Grandfield Media',
        '{{PUBLISHER_NAME}}': bp.get('publisher_name') or 'Grandfield Media',
        '{{YEAR}}': '2026',
        '{{DEDICATION}}': bp.get('dedication') or '',
        '{{AUTHOR_BIO}}': bp.get('pen_name_bio') or '',
        '{{WEBSITE_URL}}': bp.get('website_url') or 'grandfieldmedia.com',
        '{{LEGAL_DISCLAIMER}}': (
            'This book is for general informational and educational purposes only and does not '
            'constitute professional advice. Consult a qualified professional before acting on any '
            'information contained herein. The publisher assumes no responsibility for decisions made '
            'based on this book.') if ymyl else (
            'This book is provided for general informational and educational purposes only. While every '
            'effort has been made to ensure accuracy, the publisher assumes no responsibility for errors '
            'or omissions, or for outcomes resulting from the use of this information.'),
    }
    title = fields['{{BOOK_TITLE}}']

    # nested folder path: <Parent Niche>/<Sub Niche>/<Book Title>/  (from "Parent > Sub")
    parts = [p.strip() for p in (book.get('niche_name') or 'Uncategorized').split('>')]
    parent_niche = safe(parts[0]); sub_niche = safe(parts[1]) if len(parts) > 1 else 'General'
    folder = os.path.join(ROOT, '_book-output', parent_niche, sub_niche, safe(title))
    os.makedirs(folder, exist_ok=True)

    template_xml = None
    with zipfile.ZipFile(a.template) as z:
        template_xml = z.read('word/document.xml').decode('utf-8')
    s = skeletons(template_xml)

    # full book
    zip_docx(a.template, build_full(template_xml, s, fields, chapters), os.path.join(folder, safe(title) + '.docx'))
    # html
    with open(os.path.join(folder, safe(title) + '.html'), 'w', encoding='utf-8') as f:
        f.write(build_html(fields, chapters))
    # per-chapter docx
    for c in chapters:
        name = f"{c['index']:02d} - {safe(c['title'])}.docx"
        zip_docx(a.template, build_chapter_only(template_xml, s, c), os.path.join(folder, name))

    print(f"OK  {title}")
    print(f"    folder: {os.path.relpath(folder, ROOT)}")
    print(f"    files : {title}.docx, {title}.html, + {len(chapters)} chapter docs")

if __name__ == '__main__':
    main()
