# KDPFactory — `assemble` step (admin route builds, n8n uploads to Drive)

**STATUS: ✅ LIVE & PROVEN end-to-end (2026-07-13).** Endpoint deployed at
`https://admin.grandfieldmedia.com/api/kdp/assemble`; n8n branch built + published;
test book produced a full 11-file package niche-nested in Drive. Part 1 below is the
historical deploy record; **Part 2 is the current working flow.**

**Approach (LOCKED 2026-07-13): the admin app assembles the files; n8n handles all
of Google Drive.** No Apps Script, no Google credential inside a script, no secret
keys in a browser context.

- **Assembly →** admin API route **`POST /api/kdp/assemble`** (Vercel, already
  deployed). Reads the book + chapters, fills the Master Book Template DOCX with
  **jszip**, and returns the files as base64/text. Guarded by `KDP_ASSEMBLE_SECRET`.
- **Google Drive →** n8n's **native Google Drive nodes** (n8n's own verified OAuth
  connection to grandfieldmedia@gmail.com). n8n creates the folder tree and uploads.

Files: `apps/admin/src/lib/assemble.ts`, `apps/admin/src/pages/api/kdp/assemble.ts`,
template at `apps/admin/public/kdp-book-template.docx`. Local preview twin:
`kdp-factory-assemble-local.py`.

---

## Part 1 — Deploy the admin route (your normal git push)

1. In the **admin app's Vercel project → Settings → Environment Variables**, add:
   - `KDP_ASSEMBLE_SECRET` = `lH7_0SFZvwDtNhPFsyWpi5eNT3210sjy` (or any long random string)
2. Commit + push the repo → the admin app redeploys with the new route.
3. Verify (replace `<admin-domain>`):
   ```bash
   curl -s -X POST https://<admin-domain>/api/kdp/assemble \
     -H "content-type: application/json" \
     -d '{"book_id":"d6b5770f-d620-471a-9c2e-fab973e775a4","secret":"lH7_0SFZvwDtNhPFsyWpi5eNT3210sjy"}' | head -c 400
   ```
   Expect `{"ok":true,"folder":{"parent":"Money & Finance","sub":"Budgeting","book":"The 15-Minute Budget"},"files":[...]}`.

**Response shape:**
```json
{
  "ok": true,
  "folder": { "parent": "Money & Finance", "sub": "Budgeting", "book": "The 15-Minute Budget" },
  "files": [
    { "name": "The 15-Minute Budget.docx", "mime": "application/…wordprocessingml.document", "encoding": "base64", "content": "UEsDB…" },
    { "name": "The 15-Minute Budget.html", "mime": "text/html", "encoding": "utf8", "content": "<!doctype html>…" },
    { "name": "01 - Why Budgeting Usually Fails….docx", "encoding": "base64", "content": "UEsDB…" }
    // … one per chapter (fonts stripped, ~11KB each)
  ]
}
```

---

## Part 2 — the n8n `assemble` branch (AS-BUILT & WORKING)

The `is assemble (true)` branch is this exact chain (delete the old `assemble prep`):

```
is assemble(true) → Assemble → Find Parent Niche → Find Sub Niche
   → Create Book Folder → To Binary → Upload File → Limit → Mark step done
```

**1. Assemble** (HTTP Request)
- Method **POST**, URL `https://admin.grandfieldmedia.com/api/kdp/assemble`
- Body → JSON: `{ "book_id": "{{ $node['got a step'].json.book_id }}", "secret": "lH7_0SFZvwDtNhPFsyWpi5eNT3210sjy" }`
- Returns `{ folder:{parent,sub,book}, files:[…] }` (11 files).

**2. Find Parent Niche** (Google Drive → File/Folder → Search) — Query String:
```
mimeType = 'application/vnd.google-apps.folder' and name = '{{ $('Assemble').first().json.folder.parent }}' and '11Rf8JqALy-505QYJiemlTlBCxNUS-s8c' in parents and trashed = false
```

**3. Find Sub Niche** (Google Drive → Search) — Query String:
```
mimeType = 'application/vnd.google-apps.folder' and name = '{{ $('Assemble').first().json.folder.sub }}' and '{{ $('Find Parent Niche').first().json.id }}' in parents and trashed = false
```
> The 11-parent / 54-sub niche folder tree is **pre-created by hand** in the Books
> folder, so these just look up the right sub-niche folder (no create-if-missing).

**4. Create Book Folder** (Google Drive → Folder → Create)
- Name: `{{ $('Assemble').first().json.folder.book }}`
- Parent Folder → **By ID**: `{{ $('Find Sub Niche').first().json.id }}`

**5. To Binary** (Code — "Run Once for All Items") — turns the 11 files into upload items:
```js
const out = [];
for (const f of $node['Assemble'].json.files) {
  const buffer = Buffer.from(f.content, f.encoding === 'base64' ? 'base64' : 'utf8');
  const data = await this.helpers.prepareBinaryData(buffer, f.name, f.mime);
  out.push({ json: { name: f.name }, binary: { data } });
}
return out;
```

**6. Upload File** (Google Drive → File → Upload) — runs once per item:
- Input Binary Field: `data` · File Name: `{{ $json.name }}`
- Parent Folder → **By ID**: `{{ $('Create Book Folder').first().json.id }}`

**7. Limit** (Max Items = 1) — collapses the 11 upload items back to 1, so
**Mark step done → Self-call** each fire **once** (not 11 times).

**8. → Mark step done** (URL `{{ $node['got a step'].json.id }}`) → the runner continues.

### Gotchas that bit us (all fixed above)
- Use **`$('Node').first().json.x`**, never `$node['Node'].first()` → the latter errors
  *"first() is only callable on type Array"*.
- The `.first()` also fixes the paired-item error on Upload File
  (*"Create Book Folder node has 1 item but you're trying to access item 1"*).
- **Limit(1) is mandatory** — without it, the fan-out fires N Self-calls.

> Still open: confirm the runner **auto-enqueues** an `assemble` book_step for new
> books (tests reset it by hand). To fire a test: reset the assemble book_step to
> `pending` and POST `{book_id}` to `KDP_RUN_WEBHOOK_URL`.

---

## Result — 11 files per book, niche-nested
```
Books/Money & Finance/Budgeting/The 15-Minute Budget/
    The 15-Minute Budget.docx          KDP interior (template, filled — embedded fonts, 6×9)
    The 15-Minute Budget.pdf           sellable 6×9 PDF (site product)
    The 15-Minute Budget — Metadata.md KDP listing sheet (title/desc/keywords/categories/price/cover brief)
    The 15-Minute Budget.html          full book HTML (repurposing)
    01–07 - <Chapter>.docx             per-chapter docs (fonts stripped, lightweight)
```

## Known minor polish (non-blocking)
- Re-running a book makes a **new** book folder (no dedupe) — make "Create Book Folder"
  get-or-create instead.
- `books.master_doc_url` isn't written back — add an n8n PATCH after Limit.
- Markdown `- ` bullet lines render as literal dashes; empty `{{DEDICATION}}` = near-blank page.
