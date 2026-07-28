import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Target, Layers, Sparkles, Newspaper, Lock, Check, Play, Clock, Zap, ArrowUpRight,
  BookOpen, Lightbulb, FileText, ShieldCheck, ArrowRight,
} from 'lucide-react';
import type { BankQuestion, Test } from '../../../types';
import { JAMB_COMPULSORY, JAMB_SUBJECTS, JAMB_MAX_OTHER_SUBJECTS, JAMB_DURATION_MINUTES, buildJambMock, jambSubjectCount } from '../../../data/jambExam';
import { buildPracticeTest } from '../../../data/practiceBuilder';
import { useMitumTheme } from '../useMitumTheme';
import { ExamNav } from './ExamNav';
import { ExamAiChat } from './ExamAiChat';

const A = '#10B981';        // JAMB green (signature colour)
const A_HOVER = '#059669';
const A_DEEP = '#065F46';
const EASE = [0.16, 1, 0.3, 1] as const;
const soft = (pct: number) => `color-mix(in srgb, ${A} ${pct}%, transparent)`;

const TABS = [
  { id: 'focus', label: 'Focus', icon: Target },
  { id: 'practice', label: 'Practice', icon: Layers },
  { id: 'ai', label: 'AI Tutor', icon: Sparkles },
  { id: 'news', label: 'News', icon: Newspaper },
];
const NEWS = [
  { title: 'JAMB 2026: registration & key dates', body: 'Everything to prepare before the CBT window opens.', fresh: true },
  { title: 'How UTME scoring works', body: 'English 60 + 3 subjects × 40 = 400. Here’s the maths.', fresh: false },
  { title: 'Choosing the right subject combination', body: 'Match your combination to the course you want.', fresh: false },
];

export function JambPage({ bank, onStart, onLogin }: { bank: BankQuestion[]; onStart: (t: Test) => void; onLogin: () => void }) {
  const { theme, toggle } = useMitumTheme();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState('focus');

  const others = JAMB_SUBJECTS.filter((s) => s !== JAMB_COMPULSORY);
  const [focus, setFocus] = useState<string[]>([]);
  const [course, setCourse] = useState('');
  const [practice, setPractice] = useState<string[]>([]);
  const [count, setCount] = useState(20);
  const [timed, setTimed] = useState(true);
  const [err, setErr] = useState('');

  function toggleFocus(s: string) { setErr(''); setFocus((p) => p.includes(s) ? p.filter((x) => x !== s) : p.length >= JAMB_MAX_OTHER_SUBJECTS ? p : [...p, s]); }
  function togglePractice(s: string) { setErr(''); setPractice((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]); }

  function startFocus() {
    if (focus.length === 0) return setErr('Pick at least one subject (plus Use of English) to start your mock.');
    const t = buildJambMock(bank, [JAMB_COMPULSORY, ...focus]);
    if (!t || !t.questions.length) return setErr('No questions are ready for this selection yet.');
    onStart(t);
  }
  function startPractice() {
    if (practice.length === 0) return setErr('Pick at least one subject to practise.');
    const r = buildPracticeTest(bank, { subjects: practice, topics: [] }, count, timed ? count : 999, 'JAMB Practice');
    if (!r || !r.test.questions.length) return setErr('No questions are ready for this selection yet.');
    onStart(r.test);
  }

  const fade = { initial: reduce ? false as const : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: reduce ? undefined : { opacity: 0, y: -8 }, transition: { duration: 0.35, ease: EASE } };
  const focusTotal = 60 + focus.length * 40;

  return (
    <div className="mitum-app" style={{ ['--primary' as string]: A, ['--primary-hover' as string]: A_HOVER }}>
      <ExamNav examName="JAMB" accent={A} theme={theme} onToggleTheme={toggle} onLogin={onLogin} tabs={TABS} active={tab} onTab={setTab} />

      {/* ── Hero band ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${A_DEEP} 0%, ${A_HOVER} 55%, ${A} 100%)` }}>
        <div className="pointer-events-none absolute inset-0 mt-grid-surface opacity-[0.18]" />
        <div className="pointer-events-none absolute -right-10 -top-16 opacity-10"><Target size={340} color="#fff" strokeWidth={1} /></div>
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full blur-3xl" style={{ background: '#fff', opacity: 0.12 }} />
        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-14">
          <motion.span initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-label inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>
            <Target size={13} /> National UTME
          </motion.span>
          <motion.h1 initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.05 }} className="mt-display mt-4 text-4xl font-extrabold text-white sm:text-5xl" style={{ letterSpacing: '-0.025em' }}>
            Your JAMB, <span style={{ color: '#D1FAE5' }}>mastered</span>.
          </motion.h1>
          <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.1 }} className="mt-body mt-3 max-w-lg text-base text-white/90 sm:text-lg">
            Sit a full UTME-style CBT on your exact combination, or build your own practice from any subject. Real past questions, timed like the real thing.
          </motion.p>
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.15 }} className="mt-6 flex flex-wrap gap-2.5">
            {[['180', 'questions'], ['120', 'minutes'], ['4', 'subjects'], ['400', 'max score']].map(([v, l]) => (
              <div key={l} className="flex items-baseline gap-1.5 rounded-xl px-3 py-1.5" style={{ background: 'rgba(255,255,255,.14)' }}>
                <span className="mt-mono text-sm font-extrabold text-white">{v}</span>
                <span className="mt-body text-[11px] text-white/80">{l}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <AnimatePresence mode="wait">
          {/* ═══ FOCUS ═══ */}
          {tab === 'focus' && (
            <motion.div key="focus" {...fade} className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              {/* setup */}
              <div className="mt-card p-6 sm:p-7" style={{ boxShadow: 'var(--mt-shadow)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: soft(14), color: A }}><Target size={22} /></span>
                  <div>
                    <h2 className="mt-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>Build your focus mock</h2>
                    <p className="mt-body text-sm" style={{ color: 'var(--text-muted)' }}>Your exact JAMB combination — timed CBT.</p>
                  </div>
                </div>

                <p className="mt-label mb-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>Compulsory</p>
                <span className="mt-body inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: A }}><Lock size={14} /> {JAMB_COMPULSORY}</span>

                <div className="mb-2 mt-6 flex items-center justify-between">
                  <p className="mt-label text-xs" style={{ color: 'var(--text-muted)' }}>Choose your 3 subjects</p>
                  <span className="mt-mono text-xs font-bold" style={{ color: A }}>{focus.length}/{JAMB_MAX_OTHER_SUBJECTS}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {others.map((s) => {
                    const on = focus.includes(s);
                    const disabled = (!on && focus.length >= JAMB_MAX_OTHER_SUBJECTS) || jambSubjectCount(bank, s) === 0;
                    return <Chip key={s} on={on} disabled={disabled} onClick={() => toggleFocus(s)}>{s}</Chip>;
                  })}
                </div>

                <p className="mt-label mb-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>Intended course <span style={{ textTransform: 'none', letterSpacing: 0, opacity: .8 }}>(optional)</span></p>
                <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Medicine, Computer Science…" className="mt-body w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />

                {err && <p className="mt-body mt-4 text-sm font-semibold" style={{ color: '#e11d48' }}>{err}</p>}
                <button onClick={startFocus} className="mt-btn mt-6 w-full text-white" style={{ background: A, fontSize: '1rem', padding: '0.95rem', boxShadow: `0 14px 34px -12px ${A}` }}><Play size={18} fill="currentColor" /> Start focus mock</button>
              </div>

              {/* live exam-paper preview */}
              <div className="lg:sticky lg:top-28">
                <PaperPreview focus={focus} total={focusTotal} />
              </div>
            </motion.div>
          )}

          {/* ═══ PRACTICE ═══ */}
          {tab === 'practice' && (
            <motion.div key="practice" {...fade} className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="mt-card p-6 sm:p-7" style={{ boxShadow: 'var(--mt-shadow)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: soft(14), color: A }}><Layers size={22} /></span>
                  <div>
                    <h2 className="mt-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>Free practice</h2>
                    <p className="mt-body text-sm" style={{ color: 'var(--text-muted)' }}>Any subjects, your timing, your length.</p>
                  </div>
                </div>

                <p className="mt-label mb-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>Pick any subjects</p>
                <div className="flex flex-wrap gap-2">
                  {JAMB_SUBJECTS.map((s) => {
                    const on = practice.includes(s);
                    const disabled = jambSubjectCount(bank, s) === 0;
                    return <Chip key={s} on={on} disabled={disabled} onClick={() => togglePractice(s)}>{s}</Chip>;
                  })}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Questions</p>
                    <Segment options={[10, 20, 40]} value={count} onChange={setCount} render={(v) => String(v)} />
                  </div>
                  <div>
                    <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Mode</p>
                    <Segment options={[true, false]} value={timed} onChange={setTimed} render={(v) => (v ? 'Timed' : 'Relaxed')} icon={(v) => (v ? Clock : Zap)} />
                  </div>
                </div>

                {err && <p className="mt-body mt-4 text-sm font-semibold" style={{ color: '#e11d48' }}>{err}</p>}
                <button onClick={startPractice} className="mt-btn mt-6 w-full text-white" style={{ background: A, fontSize: '1rem', padding: '0.95rem', boxShadow: `0 14px 34px -12px ${A}` }}><Play size={18} fill="currentColor" /> Start practice</button>
              </div>

              <div className="lg:sticky lg:top-28">
                <SetPreview subjects={practice} count={count} timed={timed} />
              </div>
            </motion.div>
          )}

          {/* ═══ AI ═══ */}
          {tab === 'ai' && (
            <motion.div key="ai" {...fade}>
              <Head icon={Sparkles} title="AI Tutor" sub="Stuck on a JAMB topic? Ask and get a clear explanation." />
              <ExamAiChat accent={A} examName="JAMB" onLogin={onLogin} suggestions={['Explain projectile motion', 'How do I solve quadratic equations?', 'What is a metaphor?']} />
            </motion.div>
          )}

          {/* ═══ NEWS ═══ */}
          {tab === 'news' && (
            <motion.div key="news" {...fade}>
              <Head icon={Newspaper} title="JAMB news & updates" sub="Deadlines, tips and changes — so you never miss what matters." />
              <div className="grid gap-5 sm:grid-cols-3">
                {NEWS.map((n) => (
                  <a key={n.title} href="#news" className="mt-card group flex h-full flex-col p-6 transition-shadow hover:shadow-lg" style={{ boxShadow: 'var(--mt-shadow-sm)' }}>
                    <div className="flex items-center justify-between">
                      <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: soft(14), color: A }}>JAMB</span>
                      {n.fresh && <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: soft(16), color: A }}>New this week</span>}
                    </div>
                    <h3 className="mt-display mt-4 text-lg font-bold" style={{ color: 'var(--text)' }}>{n.title}</h3>
                    <p className="mt-body mt-1.5 flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                    <span className="mt-body mt-4 inline-flex items-center gap-1 text-sm font-bold transition-transform group-hover:gap-1.5" style={{ color: A }}>Read <ArrowUpRight size={15} /></span>
                  </a>
                ))}
              </div>
              <p className="mt-body mt-6 flex items-center justify-center gap-1.5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                <Lightbulb size={13} /> Real JAMB news will be posted here — this is the structure.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* Live exam-paper preview (Focus) */
function PaperPreview({ focus, total }: { focus: string[]; total: number }) {
  const rows = [{ s: 'Use of English', q: 60, locked: true }, ...focus.map((s) => ({ s, q: 40, locked: false }))];
  const empty = Math.max(0, JAMB_MAX_OTHER_SUBJECTS - focus.length);
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--mt-shadow)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ background: `linear-gradient(120deg, ${A_DEEP}, ${A_HOVER})` }}>
        <div>
          <div className="mt-label text-[10px] text-white/70">Your paper</div>
          <div className="mt-display text-base font-extrabold text-white">JAMB Mock</div>
        </div>
        <div className="mt-mono rounded-lg px-2.5 py-1 text-sm font-bold" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>{JAMB_DURATION_MINUTES}:00</div>
      </div>
      <div className="mt-grid-surface p-5">
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.s} className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5" style={{ borderColor: r.locked ? soft(35) : 'var(--border)', background: r.locked ? soft(8) : 'var(--surface)' }}>
              {r.locked ? <Lock size={14} style={{ color: A }} /> : <Check size={14} style={{ color: A }} />}
              <span className="mt-body flex-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.s}</span>
              <span className="mt-mono text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{r.q} Qs</span>
            </div>
          ))}
          {Array.from({ length: empty }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-dashed px-3.5 py-2.5" style={{ borderColor: 'var(--border)' }}>
              <span className="h-3.5 w-3.5 rounded-full border" style={{ borderColor: 'var(--border)' }} />
              <span className="mt-body flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>Pick a subject…</span>
              <span className="mt-mono text-xs" style={{ color: 'var(--text-muted)' }}>40 Qs</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <span className="mt-body text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Total questions</span>
          <span className="mt-mono text-2xl font-extrabold" style={{ color: A }}>{total}</span>
        </div>
        <p className="mt-body mt-3 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}><ShieldCheck size={13} style={{ color: A }} /> Grouped by subject, just like the real CBT.</p>
      </div>
    </div>
  );
}

/* Live practice-set preview (Practice) */
function SetPreview({ subjects, count, timed }: { subjects: string[]; count: number; timed: boolean }) {
  return (
    <div className="mt-card mt-grid-surface p-6" style={{ boxShadow: 'var(--mt-shadow)' }}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: soft(14), color: A }}><FileText size={20} /></span>
        <h3 className="mt-display text-lg font-extrabold" style={{ color: 'var(--text)' }}>Your practice set</h3>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Subjects" value={String(subjects.length)} />
        <Stat label="Questions" value={String(count)} />
        <Stat label="Mode" value={timed ? 'Timed' : 'Relaxed'} />
        <Stat label="Timer" value={timed ? `${count} min` : '—'} />
      </div>
      {subjects.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {subjects.map((s) => <span key={s} className="mt-body rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: soft(12), color: A }}>{s}</span>)}
        </div>
      )}
      <p className="mt-body mt-4 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}><ArrowRight size={13} style={{ color: A }} /> Fresh questions each time — no repeats until you’ve seen them all.</p>
    </div>
  );
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: 'var(--surface-2)' }}>
      <div className="mt-mono text-xl font-extrabold" style={{ color: 'var(--text)' }}>{value}</div>
      <div className="mt-label text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}

function Head({ icon: Icon, title, sub }: { icon: typeof Target; title: string; sub: string }) {
  return (
    <div className="mb-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: soft(14), color: A }}><Icon size={24} /></span>
      <h2 className="mt-display mt-3 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{title}</h2>
      <p className="mt-body mx-auto mt-1.5 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

function Chip({ on, disabled, onClick, children }: { on: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.95 }} animate={reduce ? undefined : { scale: on ? 1.03 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="mt-body inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold disabled:opacity-40"
      style={on ? { background: A, borderColor: A, color: '#fff' } : { borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)' }}
    >
      {on && <Check size={14} />}{children}
    </motion.button>
  );
}

function Segment<T extends string | number | boolean>({ options, value, onChange, render, icon }: { options: readonly T[]; value: T; onChange: (v: T) => void; render: (v: T) => string; icon?: (v: T) => typeof Clock }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-1.5 rounded-2xl p-1.5" style={{ background: 'var(--surface-2)', gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const on = o === value;
        const Icon = icon?.(o);
        return (
          <button key={String(o)} onClick={() => onChange(o)} className="mt-body relative rounded-xl px-2 py-2 text-sm font-bold" style={{ color: on ? '#fff' : 'var(--text-muted)' }}>
            {on && <motion.span layoutId={`seg-${render(options[0])}`} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 38 }} className="absolute inset-0 rounded-xl" style={{ background: A }} />}
            <span className="relative inline-flex items-center justify-center gap-1.5">{Icon && <Icon size={14} />}{render(o)}</span>
          </button>
        );
      })}
    </div>
  );
}
