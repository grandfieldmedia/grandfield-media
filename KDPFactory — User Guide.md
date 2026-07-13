# KDPFactory — User Guide

**For operators.** How to make a book, and how to set up a new niche. No code — this
is the day-to-day workflow in the admin panel (`admin.grandfieldmedia.com`, sign in
with your whitelisted email). For how it works under the hood see
`KDPFactory — System Reference (as-built).md`.

**The one-line model:** *you* bring the idea and approve the design; *the machine*
writes, checks, assembles, and files the book. Your job is strategic (what book, which
niche, how long) — never the writing.

---

## A. Make a book (start to finish)

### 1. Design the idea — the Idea Workbench
Admin → **KDP → Workbench**.
1. **New idea** → pick the **niche / sub-niche** from the dropdowns, give it a **topic**
   and, in **your box**, write your own thinking: what the book is, who it's for, what it
   must cover. Rough is fine.
2. Click **Improve**. Claude reads your box + the niche context and returns a sharpened
   version in **Claude's box**: title options, a tighter angle, a proposed Table of
   Contents, and gaps to address.
3. **Iterate.** Edit your box, add research **notes**, and — importantly — paste real
   **competitor titles you found on Amazon** (Claude will not invent comps). Re-Improve
   until the design says what you mean.
4. Fill the **differentiation** (why this book beats what already exists — if you can't
   say why, it's not ready). Mark the idea **ready**.

> Ideas live in the library forever. Most never become books — that's the point; the
> Workbench is your thinking space. Park an idea and revive it weeks later anytime.

### 2. Verify & approve the Blueprint
On the idea, click **Verify** → you see the **Blueprint**: the exact design the machine
will build from (title, TOC, niche context, differentiation, word count, pen name).
- Choose **Sample** (a cheap ~2-chapter preview — chapter 1 + one mid-book chapter, a
  few tens of cents; judge voice/depth before committing) or **Full** (the whole book).
- Click **Approve**. That snapshots the Blueprint into a new book and lands you on the
  Production page.

### 3. Run it
On the book's Production page, click **Run**. The pipeline executes automatically:
`contract → outline → chapters → metadata → KDP check → assemble`. Watch the steps
complete on the book page (and the live cost). A full book takes ~10–15 min and ~$2–4.
If it ever stalls, click **Run / Resume** again — it picks up where it stopped.

### 4. Collect the output (Google Drive)
When the book is **ready**, its folder appears in the company Google Drive:
`KDPFactory → Books → <Parent Niche> → <Sub Niche> → <Book Title>/`
with:
- **`<Title>.docx`** — the KDP interior (upload this to Amazon).
- **`<Title>.pdf`** — the sellable 6×9 PDF for the site.
- **`<Title> — Metadata.md`** — your KDP listing sheet (title, description, keywords, categories, price, cover brief).
- `<Title>.html` + per-chapter `.docx` — for repurposing.

### 5. Publish (manual, by you)
1. Open **`— Metadata.md`** → copy the title, subtitle, **HTML description**, the 7
   keywords, and the 3 categories straight into KDP.
2. Upload the **`.docx`** as the interior. **Declare the book AI-generated** at upload
   (standing rule — keeps the account clean).
3. Make the **cover** yourself (Canva/ChatGPT) using the **cover brief** in the metadata.
4. Set the price (the metadata suggests one). Sell the **PDF** on the site.
5. Once live, register it in the Aviary so it gets promoted.

> **First few books per niche = calibration.** Read each finished book before uploading;
> anything that reads off is a prompt to tune (see D). After a couple clean ones, trust
> the gate and spot-check.

---

## B. Set up a NEW niche (do this once per niche, before making books in it)

### 1. Add it in the Registry
Admin → **Registry**.
- **Parent niche:** add it and fill the **pen name**, **pen-name bio** (truthful — no
  invented credentials), and **publisher/imprint**. These appear on every book in the niche.
- **Sub-niche:** add it under its parent, and fill its **context**: audience, what
  they're really buying, voice/tone, reading level, **compliance rules** (strict on
  Money/Health — no regulated advice), do's/don'ts, keyword seeds.

This context is read once when a book starts and baked into the Blueprint — it's what
makes the writing niche-appropriate, so fill it thoughtfully.

### 2. (Optional) Set KDP defaults
Admin → **KDP → Niche Defaults** — set the 2–3 default KDP browse **categories** and a
default **word count / chapter length** for the niche.

### 3. Pre-create the Drive folders (required for filing)
In the company Google Drive → **KDPFactory → Books**, create the folder tree:
`<Parent Niche name>` → inside it `<Sub-niche name>`.
**The folder names must match the Registry names exactly** (e.g. `Money & Finance` →
`Budgeting`) — that's how books auto-nest. (This is a one-time manual step per niche;
the book folder itself is created automatically per book.)

That's it — the niche now appears in the Workbench dropdowns and books will file
themselves into it.

---

## C. Keep an eye on things — the Dashboard
Admin → **KDP → Dashboard**, four lenses:
- **Pipeline** — books in flight, current step, anything stalled.
- **Catalog** — everything published/made, with KDP + Drive links.
- **Money** — spend per book (from real cost logs) vs earnings (from uploaded KDP reports).
- **Search** — "did we already make something like this?" before you design a new idea.

---

## D. Improve quality over time (optional, the real ongoing work)
- **Prompt Editor** (KDP → Prompts) — the B1–B8 prompts are editable rows; refine them
  without any redeploy. This is where quality tuning lives.
- **Reference Library** (KDP → References) — add a real, successful KDP book as the
  gold-standard for a niche/type; the machine matches its structure and pacing and grades
  output against it.
- **KDP Reports** — upload Amazon's monthly sales files so the Money lens and the "what's
  selling" signals feed your next ideas.

---

## Quick reference
| I want to… | Go to |
|---|---|
| Start a book | KDP → Workbench → New idea |
| Approve & run | Idea → Verify → Approve → Run |
| Get the files | Google Drive → KDPFactory → Books → niche → title |
| Publish | Metadata sheet → KDP; upload the .docx; declare AI |
| Add a niche | Registry (context + pen name) → pre-create the two Drive folders |
| Tune quality | KDP → Prompts / References |
| See status & cost | KDP → Dashboard |
