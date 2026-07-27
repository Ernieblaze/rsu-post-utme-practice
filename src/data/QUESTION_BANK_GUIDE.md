# AdmitMe — Question Bank Guide (JAMB & WAEC)

This is how we fill the JAMB and WAEC question banks. They use the **exact same
format** as the RSU bank (`bank.json`), so the existing quiz/practice engine
reuses them with zero code changes.

- **JAMB questions →** `src/data/jamb-bank.json`
- **WAEC questions →** `src/data/waec-bank.json`

Both currently hold a few `"year": "Sample"` questions just to prove the format.
**Replace them with real, extracted past questions** using the method below.

---

## 1. The schema (one object per question)

```json
{
  "id": "jamb-2019-phy-014",        // unique string, any format (see naming below)
  "university": "JAMB",             // "JAMB" or "WAEC" (the exam this question belongs to)
  "year": "2019",                   // the exam year, e.g. "2019" (use "Sample" for placeholders)
  "subject": "Physics",             // see the subject-naming list below — must match exactly
  "topic": "Electricity",           // short topic label (optional but recommended)
  "difficulty": "medium",           // "easy" | "medium" | "hard"
  "type": "single",                 // "single" (one answer) or "multiple"
  "text": "The question itself, exactly as written.",
  "options": { "A": "…", "B": "…", "C": "…", "D": "…" },  // D optional; E allowed
  "answer": "B",                    // the correct option key (A–E)
  "explanation": "Why B is correct — one or two clear sentences."
}
```

Rules that keep the engine happy:
- `id` must be **unique** across the file.
- `answer` must be one of the keys present in `options`.
- Keep `type` as `"single"` for normal multiple-choice (almost everything).
- Options can be `A`–`E`; most questions use `A`–`D`.
- Always include an `explanation` — it's a core reason students choose AdmitMe.

### Subject names — use these EXACT strings
Consistent subject names matter (the section groups questions by them).

**JAMB:** `Use of English`, `Mathematics`, `Physics`, `Chemistry`, `Biology`,
`Geography`, `Economics`, `Government`, `Commerce`, `Accounting`, `Literature in English`,
`CRS`, `IRS`, `History`, `Computer Studies`.

**WAEC:** same as above but the language subject is `English Language` (not "Use of English").

---

## 2. The extraction method (paste this into Claude)

Gather real past questions — a PDF, screenshots, or typed text (past-question
booklets, exam sites, etc.). Then start a new chat with Claude, attach/paste the
source, and use this prompt:

> **You are converting Nigerian exam past questions into structured JSON.**
>
> I'll give you raw past questions (text or images) for **[JAMB / WAEC] [SUBJECT] [YEAR]**.
> Convert every question into this exact JSON schema, one object per question:
>
> ```json
> { "id": "", "university": "", "year": "", "subject": "", "topic": "",
>   "difficulty": "", "type": "single", "text": "", "options": {"A":"","B":"","C":"","D":""},
>   "answer": "", "explanation": "" }
> ```
>
> Rules:
> - `university` = "JAMB" or "WAEC"; `year` = the exam year; `subject` = exactly the subject I named.
> - `id` = "`<exam>`-`<year>`-`<subject-abbr>`-`<3-digit number>`", e.g. "jamb-2019-phy-014".
> - Copy the question `text` and `options` faithfully — do not reword the question.
> - Set `answer` to the correct option. If the source gives the answer key, use it; if not,
>   solve it yourself and pick the correct one.
> - Write a clear one–two sentence `explanation` of why the answer is correct.
> - `difficulty`: your best judgement (easy/medium/hard). `topic`: a short label.
> - Output **only** a valid JSON array — no commentary — so it can be pasted straight in.
>
> If any question is ambiguous or an image is unreadable, skip it and list which ones you skipped at the very end (after the JSON).

### Then:
1. Copy the JSON array Claude returns.
2. Open `jamb-bank.json` (or `waec-bank.json`) and paste the objects into the array
   (remove the `"Sample"` ones once you have real content).
3. Spot-check a few answers yourself — **you double-check before it goes live** (our standing rule).

---

## 3. Good practice
- Do **one subject + year per batch** — it's more accurate and easy to review.
- Aim for depth per subject (the RSU bank runs ~200/subject) so retakes stay fresh.
- Keep the `"Sample"` questions out of the final bank — they're only scaffolding.
- These files are **separate from RSU's `bank.json`**, so editing them never affects RSU.
