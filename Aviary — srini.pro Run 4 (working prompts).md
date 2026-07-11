# Aviary — srini.pro Run 4 (Entertainer / Engagement lane) — WORKING PROMPTS

**Status:** LIVE and touchless on srini.pro LinkedIn (2026-07-11). This is the proven,
dialed-in setup — the **template every future brand inherits** (swap voice + niche only).

Goal that shaped everything: **like-and-repost content, NOT read-and-scroll.**
Plain "share my experience / here's a lesson" posts get read and skipped. Short, punchy,
engagement-first posts (relatable / opinion / interactive) earn likes, comments, reposts.

---

## n8n flow (one Run 4 workflow)

```
Schedule Trigger (daily 09:00 IST)  +  Manual Trigger
        ↓
Get Post from Prompt   — HTTP POST https://api.anthropic.com/v1/messages
                         (Header Auth cred "x-api-key" = Srini's Anthropic key;
                          header anthropic-version: 2023-06-01; body = the JSON below)
        ↓
Prep                   — Code: parse the text block → post; build the QA (P6) body
        ↓
QA Check               — HTTP POST /v1/messages, body = {{ $json.qaBody }} (Haiku reviewer)
        ↓
Prepare SQL            — Code: strip ```json fences, parse verdict; GATE: if(!passed) return [];
                         build INSERT into social.content_items
        ↓
Insert into Supabase Dev — Postgres Execute Query: {{ $json.sql }}
        ↓
Prepare Postiz         — Code: build Postiz body; GATE again on passed; type:"now" (live)
        ↓
Publish to LinkedIn    — HTTP POST https://api.postiz.com/public/v1/posts
                         (Header Auth cred "Authorization" = Postiz API key)
```

- **Models:** generation `claude-sonnet-5` (max_tokens **2000** so adaptive thinking doesn't
  eat the budget and cut off the post); QA `claude-haiku-4-5`.
- **Postiz:** srini.pro LinkedIn (personal profile "Srini Vanamala"),
  integration id `cmrgewrqm09npk90yqhpjhcnl`, settings `__type: "linkedin"`.
- **Kill switch (current):** toggle the n8n workflow Inactive. (DB switch = future upgrade.)

---

## 1) GENERATION prompt — "Get Post from Prompt" node body (static JSON)

```json
{
  "model": "claude-sonnet-5",
  "max_tokens": 2000,
  "messages": [
    { "role": "user", "content": "You are the voice of srini.pro — Srinivas Vanamala, an SAP Integration expert with 20+ years hands-on experience (SAP PO, BTP, Integration Suite, CPI). Plain, simple English. Explain any technical term in a few plain words.\n\nWrite ONE SHORT LinkedIn post that people want to LIKE and REPOST — not just read and scroll past. Make it either so relatable people share it, so useful people save it, or a take people want to co-sign. Keep it punchy: 30-70 words. NOT a long lesson or story.\n\nPick ONE angle at random and write that type:\n- Relatable pain (works in DEV, breaks in PROD)\n- Hot take (a bold SAP integration opinion)\n- This or that (IDoc vs REST, sync vs async)\n- Validation (reassure them, make them feel seen)\n- Spot the mistake (a scenario with a hidden bug)\n- Shoutout (celebrate the audience)\n- Fill in the blank (worst SAP surprise: ___)\n- Quick list (3 things I check before go-live)\n\nRules:\n- First line = a scroll-stopping hook.\n- Last line = a short question or ask that pulls a reaction (agree? who else? vote below? your turn?).\n- Short chunks with a BLANK LINE between each, scannable on a phone.\n- Stay on SAP Integration. No selling, no links, no hashtags, no certification or job guarantees.\n\nReturn JSON only: {\"linkedin\":\"...\",\"idea_label\":\"...\",\"image_concept\":\"...\"}" }
  ]
}
```

**To reuse for another brand:** replace the identity/voice sentence, the niche ("SAP Integration"),
and the angle examples with that brand's world. Keep the structure, the "like & repost" goal,
the length, and the formatting rules identical.

---

## 2) QA (P6) prompt — built inside the "Prep" node (calibrated)

Runs on Haiku. Calibrated so it HARD-fails only real problems and does NOT reject good posts
over style or intentional formats. (First version over-rejected: it misread the intentional
"___" hook as a broken placeholder and flagged "2 AM" as fabricated. Fixed below.)

```
You are the pre-publish reviewer for srini.pro, a SAP Integration personal brand. No human sees the post before it goes live, so block anything genuinely unsafe or off-brand — but do NOT reject good posts over style nitpicks. Default to PASS when the post is on-niche, safe, accurate, and readable.

Judge this post: {POST_JSON}

HARD-FAIL checks (fail only if one is truly violated):
(1) ON-NICHE & AUDIENCE-SAFE: squarely inside SAP Integration, fine for consultants, developers, architects, and anyone working in or learning SAP integration. Forbidden: off-niche topics; certification/job/salary guarantees; fabricated specific stats or percentages; made-up testimonials or named clients; financial/medical/legal advice; selling; links; hashtags.
(2) FACTUALLY SANE: no fabricated specific numbers, fake testimonials, or named clients. IMPORTANT: generic relatable scenarios like "failed at 2 AM" or "broke on a Friday" are ILLUSTRATIVE and totally fine — NOT fabrication.
(3) NOT BROKEN: no leftover template tokens like {NAME} or {BRAND}; post is complete. IMPORTANT: an intentional fill-in-the-blank "___" used as an engagement hook (e.g. "Worst SAP surprise: ___") is a VALID format, NOT a placeholder error — do not fail it for that.

SOFT (note only — do NOT fail unless it is genuinely a boring wall of text):
(4) short, plain English, has a hook, ends with a question/ask.

Return JSON only: {"verdict":"pass|fail","failures":[{"check":n,"reason":"...","suggested_fix":"..."}]}
```

---

## Proven output examples (srini.pro voice)

- **Spot the mistake:** "Spot the mistake before it costs you a 2 AM call. / IFlow: IDoc to REST. / Sender timeout 60s. / Receiver sometimes takes 90s… / What breaks first — timeout, retry logic, or someone's patience?"
- **Hot take:** "Hot take: IDoc is not dead. Everyone calls it 'legacy'… I still pick IDoc over REST for SAP-to-SAP. It retries on its own, keeps order, rarely surprises me at 2 AM. New isn't always better."
- **Fill in the blank:** "Worst SAP integration surprise: ___ … SAP integration doesn't break loudly. It breaks quietly, in production, on a Friday. What's yours? Drop it below."
