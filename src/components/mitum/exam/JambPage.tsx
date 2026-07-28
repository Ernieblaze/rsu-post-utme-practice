import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Target, Layers, Sparkles, Newspaper, Lock, Check, Play, Clock, Zap, ArrowUpRight, BookOpen, Lightbulb } from 'lucide-react';
import type { BankQuestion, Test } from '../../../types';
import { JAMB_COMPULSORY, JAMB_SUBJECTS, JAMB_MAX_OTHER_SUBJECTS, JAMB_DURATION_MINUTES, buildJambMock, jambSubjectCount } from '../../../data/jambExam';
import { buildPracticeTest } from '../../../data/practiceBuilder';
import { useMitumTheme } from '../useMitumTheme';
import { ExamNav } from './ExamNav';
import { ExamAiChat } from './ExamAiChat';

const A = '#10B981';          // JAMB green (signature colour)
const A_HOVER = '#059669';
const EASE = [0.16, 1, 0.3, 1] as const;

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

  const fade = { initial: reduce ? false as const : { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: reduce ? undefined : { opacity: 0, y: -8 }, transition: { duration: 0.3, ease: EASE } };

  return (
    <div className="mitum-app" style={{ ['--primary' as string]: A, ['--primary-hover' as string]: A_HOVER }}>
      <ExamNav examName="JAMB" accent={A} theme={theme} onToggleTheme={toggle} onLogin={onLogin} tabs={TABS} active={tab} onTab={setTab} />

      {/* JAMB header band */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${A_HOVER}, ${A})` }}>
        <div className="pointer-events-none absolute inset-0 mt-grid-surface opacity-20" />
        <div className="relative mx-auto max-w-6xl px-4 py-10">
          <span className="mt-label inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>National UTME</span>
          <h1 className="mt-display mt-3 text-3xl font-extrabold text-white sm:text-4xl" style={{ letterSpacing: '-0.02em' }}>Your JAMB, mastered.</h1>
          <p className="mt-body mt-2 max-w-xl text-white/90">Pick your combination and sit a full CBT mock — or build your own practice from any subject.</p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <AnimatePresence mode="wait">
          {/* ── FOCUS ── */}
          {tab === 'focus' && (
            <motion.div key="focus" {...fade}>
              <div className="mx-auto max-w-2xl">
                <Head icon={Target} title="Focus mock" sub="A full UTME-style CBT on your exact combination — timed like the real thing." />
                <div className="mt-card p-6">
                  <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Compulsory</p>
                  <span className="mt-body inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: A }}><Lock size={14} /> {JAMB_COMPULSORY}</span>

                  <div className="mb-2 mt-6 flex items-center justify-between">
                    <p className="mt-label text-xs" style={{ color: 'var(--text-muted)' }}>Choose your 3 subjects</p>
                    <span className="mt-mono text-xs font-bold" style={{ color: A }}>{focus.length}/{JAMB_MAX_OTHER_SUBJECTS}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {others.map((s) => {
                      const on = focus.includes(s);
                      const disabled = (!on && focus.length >= JAMB_MAX_OTHER_SUBJECTS) || jambSubjectCount(bank, s) === 0;
                      return <Chip key={s} on={on} disabled={disabled} onClick={() => toggleFocus(s)} accent={A}>{s}</Chip>;
                    })}
                  </div>

                  <p className="mt-label mb-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>Intended course <span style={{ textTransform: 'none', letterSpacing: 0 }}>(optional)</span></p>
                  <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. Medicine, Computer Science…" className="mt-body w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />

                  {err && <p className="mt-body mt-4 text-sm font-semibold" style={{ color: '#e11d48' }}>{err}</p>}

                  <div className="mt-body mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl px-4 py-3 text-xs font-semibold" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>
                    <span className="inline-flex items-center gap-1.5"><BookOpen size={13} /> English 60 + 40 each</span>
                    <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {JAMB_DURATION_MINUTES} minutes</span>
                    <span className="mt-mono inline-flex items-center gap-1.5">Up to 180 Qs</span>
                  </div>
                  <button onClick={startFocus} className="mt-btn mt-5 w-full text-white" style={{ background: A, fontSize: '1rem', padding: '0.9rem' }}><Play size={18} fill="currentColor" /> Start focus mock</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PRACTICE ── */}
          {tab === 'practice' && (
            <motion.div key="practice" {...fade}>
              <div className="mx-auto max-w-2xl">
                <Head icon={Layers} title="Free practice" sub="Drill any subjects — even outside your combination — on your own timing and length." />
                <div className="mt-card p-6">
                  <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Pick any subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {JAMB_SUBJECTS.map((s) => {
                      const on = practice.includes(s);
                      const disabled = jambSubjectCount(bank, s) === 0;
                      return <Chip key={s} on={on} disabled={disabled} onClick={() => togglePractice(s)} accent={A}>{s}</Chip>;
                    })}
                  </div>

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Questions</p>
                      <Segment options={[10, 20, 40]} value={count} onChange={setCount} accent={A} render={(v) => String(v)} />
                    </div>
                    <div>
                      <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Mode</p>
                      <Segment options={[true, false]} value={timed} onChange={setTimed} accent={A} render={(v) => (v ? 'Timed' : 'Relaxed')} icon={(v) => (v ? Clock : Zap)} />
                    </div>
                  </div>

                  {err && <p className="mt-body mt-4 text-sm font-semibold" style={{ color: '#e11d48' }}>{err}</p>}
                  <button onClick={startPractice} className="mt-btn mt-5 w-full text-white" style={{ background: A, fontSize: '1rem', padding: '0.9rem' }}><Play size={18} fill="currentColor" /> Start practice</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── AI ── */}
          {tab === 'ai' && (
            <motion.div key="ai" {...fade}>
              <Head icon={Sparkles} title="AI Tutor" sub="Stuck on a JAMB topic? Ask and get a clear explanation." />
              <ExamAiChat accent={A} examName="JAMB" onLogin={onLogin} suggestions={['Explain projectile motion', 'How do I solve quadratic equations?', 'What is a metaphor?']} />
            </motion.div>
          )}

          {/* ── NEWS ── */}
          {tab === 'news' && (
            <motion.div key="news" {...fade}>
              <Head icon={Newspaper} title="JAMB news & updates" sub="Deadlines, tips and changes — so you never miss what matters." />
              <div className="grid gap-5 sm:grid-cols-3">
                {NEWS.map((n) => (
                  <a key={n.title} href="#news" className="mt-card flex h-full flex-col p-6">
                    <div className="flex items-center justify-between">
                      <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: 'color-mix(in srgb, ' + A + ' 14%, transparent)', color: A }}>JAMB</span>
                      {n.fresh && <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: 'color-mix(in srgb, ' + A + ' 16%, transparent)', color: A }}>New this week</span>}
                    </div>
                    <h3 className="mt-display mt-4 text-lg font-bold" style={{ color: 'var(--text)' }}>{n.title}</h3>
                    <p className="mt-body mt-1.5 flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                    <span className="mt-body mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: A }}>Read <ArrowUpRight size={15} /></span>
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

function Head({ icon: Icon, title, sub }: { icon: typeof Target; title: string; sub: string }) {
  return (
    <div className="mb-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: 'color-mix(in srgb, ' + A + ' 14%, transparent)', color: A }}><Icon size={24} /></span>
      <h2 className="mt-display mt-3 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{title}</h2>
      <p className="mt-body mx-auto mt-1.5 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

function Chip({ on, disabled, onClick, accent, children }: { on: boolean; disabled?: boolean; onClick: () => void; accent: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.95 }} animate={reduce ? undefined : { scale: on ? 1.03 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="mt-body inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold disabled:opacity-40"
      style={on ? { background: accent, borderColor: accent, color: '#fff' } : { borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)' }}
    >
      {on && <Check size={14} />}{children}
    </motion.button>
  );
}

function Segment<T extends string | number | boolean>({ options, value, onChange, accent, render, icon }: { options: readonly T[]; value: T; onChange: (v: T) => void; accent: string; render: (v: T) => string; icon?: (v: T) => typeof Clock }) {
  const reduce = useReducedMotion();
  return (
    <div className="grid gap-2 rounded-2xl p-1.5" style={{ background: 'var(--surface-2)', gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const on = o === value;
        const Icon = icon?.(o);
        return (
          <button key={String(o)} onClick={() => onChange(o)} className="mt-body relative rounded-xl px-2 py-2 text-sm font-bold" style={{ color: on ? '#fff' : 'var(--text-muted)' }}>
            {on && <motion.span layoutId={`seg-${accent}-${render(options[0])}`} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 38 }} className="absolute inset-0 rounded-xl" style={{ background: accent }} />}
            <span className="relative inline-flex items-center justify-center gap-1.5">{Icon && <Icon size={14} />}{render(o)}</span>
          </button>
        );
      })}
    </div>
  );
}
