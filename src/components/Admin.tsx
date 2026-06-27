import { useMemo, useRef, useState } from 'react';
import type { ReactNode, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Pencil, Trash2, Upload, Download, Search, X, Save, ArrowLeft,
  Lock, FileText, CheckCircle2, AlertTriangle, ListChecks, RotateCcw,
} from 'lucide-react';
import type { BankQuestion, Difficulty, OptionKey, QuestionType } from '../types';
import { OPTION_KEYS, uniqueValues } from '../data/questionBank';
import {
  getBank, addQuestion, updateQuestion, deleteQuestion, addManyQuestions,
  exportBankJson, genId, isAdminUnlocked, unlockAdmin, lockAdmin, resetLocalBank,
  hasLocalBank, ADMIN_PIN,
} from '../lib/bankStorage';
import { parseByExtension, type ParseResult } from '../lib/importParsers';
import { useToast } from './Toast';

interface AdminProps {
  onBack: () => void;
  onBankChanged: () => void;
}

const emptyQuestion = (): BankQuestion => ({
  id: genId(),
  university: 'Rivers State University',
  year: '',
  subject: '',
  topic: '',
  difficulty: 'medium',
  type: 'single',
  text: '',
  options: { A: '', B: '', C: '', D: '', E: '' },
  answer: 'A',
  answers: [],
  explanation: '',
});

type Tab = 'questions' | 'import' | 'publish';

export function Admin({ onBack, onBankChanged }: AdminProps) {
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  if (!unlocked) return <AdminGate onUnlock={() => setUnlocked(true)} onBack={onBack} />;

  return <AdminPanel onBack={onBack} onBankChanged={onBankChanged} onLock={() => { lockAdmin(); setUnlocked(false); }} />;
}

function AdminGate({ onUnlock, onBack }: { onUnlock: () => void; onBack: () => void }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  function submit() {
    if (unlockAdmin(pin)) onUnlock();
    else setError(true);
  }
  return (
    <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20">
      <div className="w-full rounded-3xl border border-school-green/10 bg-white p-8 shadow-md dark:border-school-green/20 dark:bg-school-navy/40">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-school-navy text-school-gold">
          <Lock size={26} />
        </div>
        <h1 className="text-2xl font-bold text-school-navy dark:text-white">Admin sign-in</h1>
        <p className="mt-1 mb-5 text-sm text-school-navy/70 dark:text-slate-400">
          Enter the admin PIN to manage questions. The default is{' '}
          <code className="rounded bg-school-light px-1.5 py-0.5 font-mono dark:bg-school-navy/60">{ADMIN_PIN}</code>{' '}
          — change it in <code className="font-mono">src/lib/bankStorage.ts</code>.
        </p>
        <input
          type="password"
          value={pin}
          onChange={(e) => { setPin(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Enter PIN"
          className="mb-3 w-full rounded-xl border border-school-green/20 bg-school-light px-4 py-3 text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
        />
        {error && <p className="mb-3 text-sm font-semibold text-rose-500">Incorrect PIN. Try again.</p>}
        <div className="flex gap-2">
          <button onClick={onBack} className="flex-1 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 font-semibold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200">
            Back
          </button>
          <button onClick={submit} className="flex-1 rounded-xl bg-school-green px-4 py-2.5 font-bold text-white hover:bg-school-green/90">
            Unlock
          </button>
        </div>
        <p className="mt-4 text-xs text-school-navy/50 dark:text-slate-500">
          Note: this only hides the screens on a shared device. A static site has no server, so it is not real security.
        </p>
      </div>
    </main>
  );
}

function AdminPanel({ onBack, onBankChanged, onLock }: AdminProps & { onLock: () => void }) {
  const notify = useToast();
  const [tab, setTab] = useState<Tab>('questions');
  const [bank, setBank] = useState<BankQuestion[]>(() => getBank());

  function refresh(next: BankQuestion[]) {
    setBank(next);
    onBankChanged();
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={onBack} className="mb-2 flex items-center gap-1 text-sm font-semibold text-school-green hover:underline">
            <ArrowLeft size={16} /> Back to site
          </button>
          <h1 className="text-3xl font-extrabold text-school-navy dark:text-white">Question Manager</h1>
          <p className="text-sm text-school-navy/70 dark:text-slate-400">{bank.length} question(s) in your working bank</p>
        </div>
        <button onClick={onLock} className="rounded-xl border border-school-green/20 bg-white px-4 py-2 text-sm font-semibold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200">
          Lock admin
        </button>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-school-green/10 bg-white p-1.5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
        {([
          { key: 'questions', label: 'Questions', icon: <ListChecks size={16} /> },
          { key: 'import', label: 'Bulk import', icon: <Upload size={16} /> },
          { key: 'publish', label: 'Export & publish', icon: <Download size={16} /> },
        ] as { key: Tab; label: string; icon: ReactNode }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === t.key ? 'bg-school-green text-white shadow-sm' : 'text-school-navy/80 hover:bg-school-light dark:text-slate-200 dark:hover:bg-school-navy/60'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'questions' && <QuestionsTab bank={bank} onChange={refresh} notify={notify} />}
      {tab === 'import' && <ImportTab onChange={refresh} notify={notify} />}
      {tab === 'publish' && <PublishTab bank={bank} onChange={refresh} notify={notify} />}
    </main>
  );
}

/* ------------- Questions tab ------------- */

function QuestionsTab({
  bank, onChange, notify,
}: { bank: BankQuestion[]; onChange: (b: BankQuestion[]) => void; notify: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [search, setSearch] = useState('');
  const [fSubject, setFSubject] = useState('');
  const [fYear, setFYear] = useState('');
  const [fDifficulty, setFDifficulty] = useState('');
  const [editing, setEditing] = useState<BankQuestion | null>(null);

  const subjects = useMemo(() => uniqueValues(bank, 'subject'), [bank]);
  const years = useMemo(() => uniqueValues(bank, 'year'), [bank]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return bank.filter((q) => {
      if (fSubject && q.subject !== fSubject) return false;
      if (fYear && q.year !== fYear) return false;
      if (fDifficulty && q.difficulty !== fDifficulty) return false;
      if (s && !q.text.toLowerCase().includes(s)) return false;
      return true;
    });
  }, [bank, search, fSubject, fYear, fDifficulty]);

  function remove(q: BankQuestion) {
    if (window.confirm('Delete this question? This affects your local working copy only.')) {
      onChange(deleteQuestion(q.id));
      notify('Question deleted', 'info');
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search question text…"
            className="w-full rounded-xl border border-school-green/20 bg-white py-2.5 pl-9 pr-3 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/40 dark:text-white"
          />
        </div>
        <Select value={fSubject} onChange={setFSubject} placeholder="All subjects" options={subjects} />
        <Select value={fYear} onChange={setFYear} placeholder="All years" options={years} />
        <Select value={fDifficulty} onChange={setFDifficulty} placeholder="All levels" options={['easy', 'medium', 'hard']} />
        <button
          onClick={() => setEditing(emptyQuestion())}
          className="flex items-center gap-1.5 rounded-xl bg-school-green px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-school-green/90"
        >
          <Plus size={16} /> Add question
        </button>
      </div>

      <p className="mb-3 text-sm text-school-navy/60 dark:text-slate-400">{filtered.length} shown</p>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-school-green/30 bg-white p-10 text-center text-school-navy/70 dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-400">
            No questions match. Add one, or clear the filters.
          </div>
        )}
        {filtered.map((q) => (
          <div key={q.id} className="rounded-2xl border border-school-green/10 bg-white p-4 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                  <Tag>{q.subject || '—'}</Tag>
                  <Tag>{q.year || '—'}</Tag>
                  <Tag>{q.difficulty}</Tag>
                  {q.type === 'multiple' && <Tag tone="gold">multi-answer</Tag>}
                  {q.topic && <Tag tone="muted">{q.topic}</Tag>}
                </div>
                <p className="font-medium text-school-navy dark:text-white">{q.text}</p>
                <p className="mt-1 text-xs text-school-green">
                  Correct: {(q.answers && q.answers.length ? q.answers : [q.answer]).join(', ')}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditing(q)} className="rounded-lg p-2 text-school-navy/70 hover:bg-school-light dark:text-slate-300 dark:hover:bg-school-navy/60" aria-label="Edit">
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(q)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20" aria-label="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <QuestionEditor
          initial={editing}
          isNew={!bank.some((q) => q.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={(q, isNew) => {
            onChange(isNew ? addQuestion(q) : updateQuestion(q));
            notify(isNew ? 'Question added' : 'Question updated', 'success');
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function Tag({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'gold' | 'muted' }) {
  const tones = {
    default: 'bg-school-pale text-school-green dark:bg-school-green/20',
    gold: 'bg-school-gold/15 text-amber-700 dark:text-school-gold',
    muted: 'bg-school-light text-school-navy/60 dark:bg-school-navy/60 dark:text-slate-400',
  };
  return <span className={`rounded px-2 py-0.5 ${tones[tone]}`}>{children}</span>;
}

function Select({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-xl border border-school-green/20 bg-white px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/40 dark:text-white"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

/* ------------- Question editor modal ------------- */

function QuestionEditor({
  initial, isNew, onClose, onSave,
}: { initial: BankQuestion; isNew: boolean; onClose: () => void; onSave: (q: BankQuestion, isNew: boolean) => void }) {
  const [q, setQ] = useState<BankQuestion>({ ...initial, answers: initial.answers ?? [] });
  const [error, setError] = useState('');

  function setField<K extends keyof BankQuestion>(key: K, val: BankQuestion[K]) {
    setQ((prev) => ({ ...prev, [key]: val }));
  }
  function setOption(key: OptionKey, val: string) {
    setQ((prev) => ({ ...prev, options: { ...prev.options, [key]: val } }));
  }
  function toggleCorrect(key: OptionKey) {
    setQ((prev) => {
      if (prev.type === 'single') return { ...prev, answer: key };
      const set = new Set(prev.answers ?? []);
      if (set.has(key)) set.delete(key); else set.add(key);
      const arr = Array.from(set);
      return { ...prev, answers: arr, answer: arr[0] ?? prev.answer };
    });
  }
  const isCorrect = (key: OptionKey) =>
    q.type === 'single' ? q.answer === key : (q.answers ?? []).includes(key);

  function save() {
    if (!q.text.trim()) return setError('Question text is required.');
    const filled = OPTION_KEYS.filter((k) => q.options[k].trim());
    if (filled.length < 2) return setError('Add at least two options.');
    const corrects = q.type === 'single' ? [q.answer] : (q.answers ?? []);
    if (corrects.length === 0) return setError('Mark at least one correct answer.');
    if (corrects.some((c) => !q.options[c].trim())) return setError('A correct answer points to an empty option.');
    const clean: BankQuestion = {
      ...q,
      subject: q.subject.trim() || 'General',
      year: q.year.trim() || 'General',
      university: q.university.trim() || 'Rivers State University',
      answers: q.type === 'multiple' ? (q.answers ?? []) : undefined,
    };
    onSave(clean, isNew);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-school-navy/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="my-8 w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-school-navy"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-school-navy dark:text-white">{isNew ? 'Add question' : 'Edit question'}</h3>
          <button onClick={onClose} className="rounded-full bg-school-light p-2 text-school-navy dark:bg-school-navy/60 dark:text-slate-200"><X size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Field label="University" className="col-span-2"><input value={q.university} onChange={(e) => setField('university', e.target.value)} className={inputCls} /></Field>
          <Field label="Year"><input value={q.year} onChange={(e) => setField('year', e.target.value)} placeholder="2023" className={inputCls} /></Field>
          <Field label="Subject"><input value={q.subject} onChange={(e) => setField('subject', e.target.value)} placeholder="Mathematics" className={inputCls} /></Field>
          <Field label="Topic"><input value={q.topic} onChange={(e) => setField('topic', e.target.value)} placeholder="Algebra" className={inputCls} /></Field>
          <Field label="Difficulty">
            <select value={q.difficulty} onChange={(e) => setField('difficulty', e.target.value as Difficulty)} className={inputCls}>
              <option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option>
            </select>
          </Field>
          <Field label="Type">
            <select value={q.type} onChange={(e) => setField('type', e.target.value as QuestionType)} className={inputCls}>
              <option value="single">single answer</option><option value="multiple">multiple answers</option>
            </select>
          </Field>
        </div>

        <Field label="Question text" className="mt-3">
          <textarea value={q.text} onChange={(e) => setField('text', e.target.value)} rows={3} className={inputCls} />
        </Field>

        <div className="mt-3">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
            Options — tap the circle to mark the correct {q.type === 'single' ? 'answer' : 'answers'}
          </p>
          <div className="space-y-2">
            {OPTION_KEYS.map((key) => (
              <div key={key} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCorrect(key)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition ${
                    isCorrect(key) ? 'bg-school-green text-white' : 'bg-school-light text-school-navy dark:bg-school-navy/60 dark:text-slate-300'
                  }`}
                  aria-label={`Mark ${key} correct`}
                >
                  {isCorrect(key) ? <CheckCircle2 size={18} /> : key}
                </button>
                <input value={q.options[key]} onChange={(e) => setOption(key, e.target.value)} placeholder={`Option ${key}`} className={inputCls} />
              </div>
            ))}
          </div>
        </div>

        <Field label="Explanation" className="mt-3">
          <textarea value={q.explanation} onChange={(e) => setField('explanation', e.target.value)} rows={2} placeholder="Shown after the test when reviewing." className={inputCls} />
        </Field>

        {error && <p className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-rose-500"><AlertTriangle size={15} /> {error}</p>}

        <div className="mt-5 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 font-semibold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200">Cancel</button>
          <button onClick={save} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-school-green px-4 py-2.5 font-bold text-white hover:bg-school-green/90"><Save size={16} /> Save question</button>
        </div>
      </motion.div>
    </div>
  );
}

const inputCls =
  'w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white';

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">{label}</span>
      {children}
    </label>
  );
}

/* ------------- Import tab ------------- */

function ImportTab({
  onChange, notify,
}: { onChange: (b: BankQuestion[]) => void; notify: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  const [text, setText] = useState('');
  const [filename, setFilename] = useState('paste.txt');
  const [result, setResult] = useState<ParseResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? '');
      setText(content);
      setFilename(file.name);
      setResult(parseByExtension(file.name, content));
    };
    reader.readAsText(file);
  }

  function preview() {
    setResult(parseByExtension(filename, text));
  }

  function confirmImport() {
    if (!result || result.questions.length === 0) return;
    const before = getBank().length;
    const nextBank = addManyQuestions(result.questions);
    const added = nextBank.length - before;
    const skipped = result.questions.length - added;
    onChange(nextBank);
    notify(
      skipped > 0
        ? `${added} question(s) imported, ${skipped} duplicate(s) skipped`
        : `${added} question(s) imported`,
      'success'
    );
    setText('');
    setResult(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-school-green/10 bg-white p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
        <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-school-navy dark:text-white"><Upload size={18} /> Import questions</h3>
        <div className="mb-3 flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".txt,.json,.csv" onChange={handleFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-xl bg-school-navy px-4 py-2.5 text-sm font-bold text-white hover:bg-school-navy/90"><FileText size={16} /> Choose file (.txt .json .csv)</button>
        </div>
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">…or paste below</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder={TXT_TEMPLATE}
          className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 font-mono text-xs text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
        />
        <div className="mt-3 flex gap-2">
          <button onClick={preview} disabled={!text.trim()} className="flex-1 rounded-xl bg-school-green px-4 py-2.5 text-sm font-bold text-white hover:bg-school-green/90 disabled:opacity-40">Validate &amp; preview</button>
        </div>
        <details className="mt-4 text-xs text-school-navy/70 dark:text-slate-400">
          <summary className="cursor-pointer font-semibold">Accepted formats</summary>
          <p className="mt-2"><strong>TXT</strong> — blocks separated by a blank line or <code>---</code>. Use <code>Subject:</code>, <code>Year:</code>, <code>Q:</code>, <code>A) …</code> … <code>Answer:</code>, <code>Explanation:</code>.</p>
          <p className="mt-1"><strong>CSV</strong> — header row with columns: <code>subject, year, text, A, B, C, D, E, answer, explanation</code> (extra columns: university, topic, difficulty, type).</p>
          <p className="mt-1"><strong>JSON</strong> — an array of objects with <code>text</code>, <code>options</code> (A–E), <code>answer</code>, and optional metadata.</p>
        </details>
      </div>

      <div className="rounded-2xl border border-school-green/10 bg-white p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
        <h3 className="mb-3 text-lg font-bold text-school-navy dark:text-white">Preview</h3>
        {!result && <p className="text-sm text-school-navy/60 dark:text-slate-400">Validate a file or pasted text to preview the questions found.</p>}
        {result && (
          <>
            <div className="mb-3 flex flex-wrap gap-2 text-sm">
              <span className="flex items-center gap-1.5 rounded-lg bg-school-pale px-3 py-1.5 font-bold text-school-green dark:bg-school-green/20"><CheckCircle2 size={15} /> {result.questions.length} valid</span>
              {result.errors.length > 0 && <span className="flex items-center gap-1.5 rounded-lg bg-rose-100 px-3 py-1.5 font-bold text-rose-600 dark:bg-rose-900/20"><AlertTriangle size={15} /> {result.errors.length} error(s)</span>}
              {result.warnings.length > 0 && <span className="rounded-lg bg-amber-100 px-3 py-1.5 font-bold text-amber-700 dark:bg-amber-900/20">{result.warnings.length} warning(s)</span>}
            </div>

            {(result.errors.length > 0 || result.warnings.length > 0) && (
              <div className="mb-3 max-h-32 space-y-1 overflow-auto rounded-xl bg-school-light p-3 text-xs dark:bg-school-navy/60">
                {result.errors.map((e, i) => <p key={`e${i}`} className="text-rose-600 dark:text-rose-400">⛔ {e}</p>)}
                {result.warnings.map((w, i) => <p key={`w${i}`} className="text-amber-700 dark:text-amber-400">⚠ {w}</p>)}
              </div>
            )}

            <div className="max-h-80 space-y-2 overflow-auto">
              {result.questions.slice(0, 50).map((q, i) => (
                <div key={q.id} className="rounded-xl border border-school-green/10 bg-school-light p-3 text-sm dark:border-school-green/20 dark:bg-school-navy/60">
                  <p className="font-medium text-school-navy dark:text-white">{i + 1}. {q.text}</p>
                  <p className="mt-1 text-xs text-school-navy/60 dark:text-slate-400">{q.subject} • {q.year} • answer {(q.answers?.length ? q.answers : [q.answer]).join(', ')}</p>
                </div>
              ))}
            </div>

            <button onClick={confirmImport} disabled={result.questions.length === 0} className="mt-4 w-full rounded-xl bg-school-green px-4 py-2.5 font-bold text-white hover:bg-school-green/90 disabled:opacity-40">
              Add {result.questions.length} question(s) to bank
            </button>
            <p className="mt-2 text-xs text-school-navy/50 dark:text-slate-500">Exact-duplicate questions (same text) are skipped automatically.</p>
          </>
        )}
      </div>
    </div>
  );
}

const TXT_TEMPLATE = `Subject: Mathematics
Year: 2023
Q: What is 2 + 2?
A) 3
B) 4
C) 5
D) 6
Answer: B
Explanation: Basic addition.
---
Subject: English
Q: Choose the synonym of "happy".
A) sad
B) joyful
C) angry
D) tired
Answer: B`;

/* ------------- Publish tab ------------- */

function PublishTab({
  bank, onChange, notify,
}: { bank: BankQuestion[]; onChange: (b: BankQuestion[]) => void; notify: (m: string, t?: 'success' | 'error' | 'info' | 'warning') => void }) {
  function download() {
    const blob = new Blob([exportBankJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    const filename = `bank-${stamp}.json`;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    notify(`${filename} downloaded`, 'success');
  }
  function reset() {
    if (window.confirm('Discard your local working copy and track the published bank again?')) {
      resetLocalBank();
      onChange(getBank());
      notify('Local copy reset to published bank', 'info');
    }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-school-green/10 bg-white p-6 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
        <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-school-navy dark:text-white"><Download size={18} /> Publish to students</h3>
        <p className="mb-4 text-sm text-school-navy/70 dark:text-slate-400">
          Your edits live in this browser only. To make them live for everyone, export the bank and commit it.
        </p>
        <ol className="mb-5 space-y-2 text-sm text-school-navy/80 dark:text-slate-300">
          <li><strong>1.</strong> Click <em>Download bank.json</em> ({bank.length} questions). The file is named with today's date and time, so it never collides with an older download.</li>
          <li><strong>2.</strong> Replace <code className="rounded bg-school-light px-1 dark:bg-school-navy/60">src/data/bank.json</code> in your project with it.</li>
          <li><strong>3.</strong> Commit &amp; push to GitHub. The deploy action rebuilds the site.</li>
          <li><strong>4.</strong> Once live, click <em>Reset local copy</em> so this browser tracks the published bank.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <button onClick={download} className="flex items-center gap-1.5 rounded-xl bg-school-green px-5 py-2.5 font-bold text-white hover:bg-school-green/90"><Download size={16} /> Download bank.json</button>
          <button onClick={reset} disabled={!hasLocalBank()} className="flex items-center gap-1.5 rounded-xl border border-school-green/20 bg-white px-5 py-2.5 font-semibold text-school-navy hover:bg-school-light disabled:opacity-40 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200"><RotateCcw size={16} /> Reset local copy</button>
        </div>
        <p className="mt-3 text-xs text-school-navy/50 dark:text-slate-500">
          {hasLocalBank() ? 'You have unpublished local edits.' : 'No local edits — you are viewing the published bank.'}
        </p>
      </div>
    </div>
  );
}
