# RSU Post-UTME Practice

A free, fast, mobile-friendly web app for practising the Rivers State University (RSU)
Post-UTME screening exam. Students take **timed tests**, get **instant scoring with
explanations**, track **progress**, revise by subject, and practise from a growing
**question bank** you control. It runs entirely in the browser — no server, no costs.

> Built to be hosted **100% free on GitHub Pages**. There is no backend and no paid
> service anywhere in this project.

---

## What you can do

- **Timed practice tests** with a live countdown, question navigator, flagging, and auto-save.
- **Instant results**: score ring, pass/fail, per-subject breakdown, and explanations for every missed question.
- **Custom practice** ("Practice" tab): generate a test from the question bank filtered by university, year, subject, difficulty, length, and time limit.
- **Question Manager** (admin): add, edit, delete, search and filter questions; mark single- or multiple-answer; organise by university / year / subject / topic / difficulty.
- **Bulk import**: paste or upload `.txt`, `.csv`, or `.json`, with validation and a preview before anything is added.
- **Export & publish**: download an updated `bank.json` to commit and redeploy — your new questions then go live for every student.
- **Progress** tracking and a device-local **Leaderboard**.
- **Dark mode**, responsive layout, and basic **SEO** (meta tags, Open Graph, sitemap, structured data).

---

## Run it locally (VS Code)

You need [Node.js](https://nodejs.org) 18+ installed.

```bash
npm install      # install dependencies
npm run dev      # start the dev server (prints a localhost URL)
```

Open the printed URL in your browser. To make a production build:

```bash
npm run build    # type-checks then builds into dist/
npm run preview  # preview the production build locally
```

---

## Host it free on GitHub Pages

1. Create a new GitHub repository and push this project to the `main` branch.
2. In the repo: **Settings -> Pages -> Build and deployment -> Source -> GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`. The first push triggers it automatically.
4. Your site goes live at `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

The build uses a **relative base path** (`base: './'` in `vite.config.ts`), so it works
under the `/YOUR-REPO/` subpath without extra configuration.

**After deploying, update these two files with your real URL** (used by search engines):
`public/robots.txt` and `public/sitemap.xml` — replace `USERNAME` and `REPO`. You can
also set the real address in the `<link rel="canonical">` tag in `index.html`.

---

## Adding past questions (the important part)

Because this is a static site, questions are shipped inside the build. The workflow is:

1. Open the site and click the **Admin** (shield) button. Enter the PIN.
2. Add questions one by one, or use **Bulk import** to paste/upload many at once.
   Your edits are saved in **your browser only** at this stage.
3. Go to **Export & publish** -> **Download `bank.json`**.
4. Replace `src/data/bank.json` in your project with the downloaded file.
5. Commit and push to GitHub. The site rebuilds and the new questions are now live for everyone.
6. Back in Admin -> **Reset local copy** so your browser tracks the published bank again.

When `src/data/bank.json` is empty (the starting state), the bank is automatically
seeded from the 100 built-in questions in `src/data/tests.ts`, so you never start from nothing.

### Admin PIN

The default admin PIN is `1234`. Change it in `src/lib/bankStorage.ts` (`ADMIN_PIN`).
This only hides the admin screens on a shared device — **it is not real security**, because
a static site has no server. Don't rely on it to protect anything sensitive.

### Import formats

**TXT** — blocks separated by a blank line or a line of `---`:

```
Subject: Mathematics
Year: 2024
Q: If 2x + 3 = 11, what is x?
A) 2
B) 3
C) 4
D) 5
Answer: C
Explanation: 2x = 8, so x = 4.
```

**CSV** — a header row, then one question per row:

```
subject,year,text,A,B,C,D,answer,explanation
Mathematics,2024,"What is 25% of 80?",15,20,25,30,B,"0.25 x 80 = 20."
```

**JSON** — an array of objects with `text`, `options` (A-E), `answer`, and optional metadata.

Working examples for all three are in the `sample-imports/` folder.

---

## Honest limitations

This app has **no backend**, by design (so it stays free). That means:

- **Multiple-answer questions** can be created and managed in the Admin, but the **timed
  practice engine currently grades single-answer questions only**. Generated practice sets
  use single-answer questions. (Most Post-UTME questions are single-answer A-E.)
- The **leaderboard is per-device** — it ranks the attempts saved in that browser. A true
  shared leaderboard across students would require a backend (e.g. a free Supabase tier),
  which is outside this free-only setup.
- The **admin PIN is not real security** (see above).
- Progress, attempts, and unpublished edits live in the browser's `localStorage`. Clearing
  browser data clears them.

---

## Project structure

```
src/
  data/
    tests.ts          # the 100 built-in questions (seed)
    bank.json         # published question bank (edit + redeploy to publish)
    questionBank.ts   # bank seeding, filtering, test generation
    revision.ts       # revision notes
  lib/
    storage.ts        # attempts, dark mode, in-progress test state
    bankStorage.ts    # question bank CRUD, import/export, admin gate
    importParsers.ts  # TXT / CSV / JSON parsers + validation
    helpers.ts        # scoring and formatting helpers
  components/          # Home, Quiz, Results, Progress, Revision,
                       # PracticeBank, Admin, Leaderboard, Header, Footer, Toast
.github/workflows/deploy.yml   # free GitHub Pages deployment
sample-imports/                # example import files
```

## Tech

React 19 - TypeScript - Vite - Tailwind CSS v4 - Framer Motion - lucide-react.
