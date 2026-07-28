import { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  GraduationCap, Layers, Sparkles, Newspaper, Lock, Check, Play, Clock, Zap, ArrowUpRight,
  Lightbulb, FileText, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight, BookOpen,
} from 'lucide-react';
import type { BankQuestion, Test } from '../../../types';
import {
  WAEC_CORE, WAEC_TRACKS, WAEC_COUNT_OPTIONS, WAEC_TIMED_MINUTES_PER_Q, WAEC_UNTIMED_MINUTES,
  buildWaecMock, waecSubjectCount, type WaecTrack,
} from '../../../data/waecExam';
import { useMitumTheme } from '../useMitumTheme';
import { ExamNav } from './ExamNav';
import { ExamAiChat } from './ExamAiChat';

// WAEC signature colours: deep navy + gold.
const NAVY = '#1B1B6B';
const NAVY_DEEP = '#12124A';
const GOLD = '#F5B301';
const EASE = [0.16, 1, 0.3, 1] as const;
const softNavy = (pct: number) => `color-mix(in srgb, ${NAVY} ${pct}%, transparent)`;
const softGold = (pct: number) => `color-mix(in srgb, ${GOLD} ${pct}%, transparent)`;

const TABS = [
  { id: 'focus', label: 'Focus mock', hint: 'Your track', icon: GraduationCap },
  { id: 'practice', label: 'Practice', hint: 'Any subject', icon: Layers },
  { id: 'ai', label: 'AI Tutor', hint: 'Ask anything', icon: Sparkles },
  { id: 'news', label: 'News', hint: 'Updates', icon: Newspaper },
] as const;

const NEWS = [
  { title: 'WAEC 2026: timetable & registration', body: 'Key dates and what to prepare before the papers begin.', fresh: true },
  { title: 'Objective vs theory: how to study both', body: 'Score the OBJ paper, then build your theory answers.', fresh: false },
  { title: 'Picking your WAEC subject track', body: 'Science, Arts or Commercial — match it to your future course.', fresh: false },
];

// Every WAEC subject a student could practise (core + all tracks), de-duped.
const ALL_SUBJECTS = Array.from(new Set([...WAEC_CORE, ...WAEC_TRACKS.flatMap((t) => t.subjects)]));

export function WaecPage({ bank, onStart, onLogin }: { bank: BankQuestion[]; onStart: (t: Test) => void; onLogin: () => void }) {
  const { theme, toggle } = useMitumTheme();
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<string>('focus');

  const [track, setTrack] = useState<WaecTrack>(WAEC_TRACKS[0]);
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState<number>(20);
  const [timed, setTimed] = useState(true);
  const [practice, setPractice] = useState<string[]>([]);
  const [pCount, setPCount] = useState<number>(20);
  const [pTimed, setPTimed] = useState(true);
  const [err, setErr] = useState('');

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    ALL_SUBJECTS.forEach((s) => { map[s] = waecSubjectCount(bank, s); });
    return map;
  }, [bank]);

  const electives = track.subjects.filter((s) => !WAEC_CORE.includes(s));

  function selectTab(id: string) { setErr(''); setTab(id); }
  function pickTrack(t: WaecTrack) { setTrack(t); setSelected([]); setErr(''); }
  function toggleElective(s: string) { setErr(''); setSelected((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]); }
  function togglePractice(s: string) { setErr(''); setPractice((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]); }

  function startFocus() {
    const subjects = [...WAEC_CORE, ...selected];
    const minutes = timed ? Math.max(10, subjects.length * count * WAEC_TIMED_MINUTES_PER_Q) : WAEC_UNTIMED_MINUTES;
    const t = buildWaecMock(bank, subjects, count, minutes);
    if (!t || !t.questions.length) return setErr('No questions are ready for this selection yet — try another subject or track.');
    onStart(t);
  }
  function startPractice() {
    if (practice.length === 0) return setErr('Pick at least one subject to practise.');
    const minutes = pTimed ? Math.max(10, practice.length * pCount * WAEC_TIMED_MINUTES_PER_Q) : WAEC_UNTIMED_MINUTES;
    const t = buildWaecMock(bank, practice, pCount, minutes);
    if (!t || !t.questions.length) return setErr('No questions are ready for this selection yet.');
    onStart(t);
  }

  const fade = { initial: reduce ? false as const : { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, exit: reduce ? undefined : { opacity: 0, y: -8 }, transition: { duration: 0.35, ease: EASE } };
  const focusSubjects = WAEC_CORE.length + selected.length;
  const focusTotal = focusSubjects * count;

  return (
    <div className="mitum-app" style={{ ['--primary' as string]: NAVY, ['--primary-hover' as string]: NAVY_DEEP, minHeight: '100vh', background: 'var(--bg)' }}>
      <ExamNav examName="WAEC" accent={NAVY} theme={theme} onToggleTheme={toggle} onLogin={onLogin} />

      {/* ── Hero: copy + live OBJ CBT screen ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${NAVY_DEEP} 0%, ${NAVY} 100%)` }}>
        <div className="pointer-events-none absolute inset-0 mt-grid-surface opacity-[0.14]" />
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full blur-3xl" style={{ background: GOLD, opacity: 0.24 }} />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full blur-3xl" style={{ background: '#fff', opacity: 0.08 }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.span initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-label inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: GOLD, color: NAVY_DEEP }}>
              <GraduationCap size={13} /> WASSCE · O-Level
            </motion.span>
            <motion.h1 initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.05 }} className="mt-display mt-4 text-4xl font-extrabold text-white sm:text-5xl" style={{ letterSpacing: '-0.025em' }}>
              Smash your <span style={{ color: GOLD }}>WAEC</span>.
            </motion.h1>
            <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.1 }} className="mt-body mt-3 max-w-lg text-base text-white/90 sm:text-lg">
              Pick your track, choose your subjects and practise real past questions — grouped by subject, timed like the real paper.
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.15 }} className="mt-6 flex flex-wrap gap-2.5">
              {[['9', 'subjects'], ['3', 'tracks'], ['OBJ', 'past Qs'], ['A1', 'target']].map(([v, l]) => (
                <div key={l} className="flex items-baseline gap-1.5 rounded-xl px-3 py-1.5" style={{ background: 'rgba(255,255,255,.14)' }}>
                  <span className="mt-mono text-sm font-extrabold text-white">{v}</span>
                  <span className="mt-body text-[11px] text-white/80">{l}</span>
                </div>
              ))}
            </motion.div>
            <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.2 }} className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => selectTab('focus')} className="mt-btn font-bold" style={{ background: GOLD, color: NAVY_DEEP, fontSize: '1rem', padding: '.85rem 1.4rem', boxShadow: '0 16px 40px -14px rgba(0,0,0,.5)' }}><Play size={17} fill="currentColor" /> Build my track mock</button>
              <button onClick={() => selectTab('practice')} className="mt-btn font-bold text-white" style={{ background: 'rgba(255,255,255,.16)', border: '1px solid rgba(255,255,255,.35)', fontSize: '1rem', padding: '.85rem 1.4rem' }}><Layers size={17} /> Quick practice</button>
            </motion.div>
          </div>

          <motion.div initial={reduce ? false : { opacity: 0, y: 24, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: -1.2 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }} className="mx-auto w-full max-w-md lg:max-w-none">
            <ObjMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Prominent in-page section buttons ── */}
      <div className="relative z-10 mx-auto -mt-7 max-w-6xl px-4">
        <div className="mt-card grid grid-cols-2 gap-2 p-2 sm:grid-cols-4 sm:gap-2.5 sm:p-2.5" style={{ boxShadow: 'var(--mt-shadow)' }}>
          {TABS.map((t) => {
            const on = tab === t.id;
            const Icon = t.icon;
            return (
              <motion.button
                key={t.id} onClick={() => selectTab(t.id)}
                whileTap={reduce ? undefined : { scale: 0.97 }}
                className="group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-colors"
                style={on ? { background: NAVY, boxShadow: `0 12px 26px -12px ${NAVY}` } : { background: 'transparent' }}
              >
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg transition-colors" style={on ? { background: GOLD, color: NAVY_DEEP } : { background: softNavy(12), color: NAVY }}>
                  <Icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="mt-display block text-sm font-extrabold leading-tight" style={{ color: on ? '#fff' : 'var(--text)' }}>{t.label}</span>
                  <span className="mt-body block truncate text-[11px]" style={{ color: on ? 'rgba(255,255,255,.85)' : 'var(--text-muted)' }}>{t.hint}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:py-12">
        <AnimatePresence mode="wait">
          {/* ═══ FOCUS ═══ */}
          {tab === 'focus' && (
            <motion.div key="focus" {...fade} className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="mt-card p-6 sm:p-7" style={{ boxShadow: 'var(--mt-shadow)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: softNavy(12), color: NAVY }}><GraduationCap size={22} /></span>
                  <div>
                    <h2 className="mt-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>Build your track mock</h2>
                    <p className="mt-body text-sm" style={{ color: 'var(--text-muted)' }}>English &amp; Maths are compulsory — add your track subjects.</p>
                  </div>
                </div>

                <p className="mt-label mb-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>Your track</p>
                <div className="grid grid-cols-3 gap-1.5 rounded-2xl p-1.5" style={{ background: 'var(--surface-2)' }}>
                  {WAEC_TRACKS.map((t) => {
                    const on = t.id === track.id;
                    return (
                      <button key={t.id} onClick={() => pickTrack(t)} className="mt-body relative rounded-xl px-2 py-2.5 text-sm font-bold" style={{ color: on ? '#fff' : 'var(--text-muted)' }}>
                        {on && <motion.span layoutId="waec-track" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 38 }} className="absolute inset-0 rounded-xl" style={{ background: NAVY }} />}
                        <span className="relative flex items-center justify-center gap-1.5"><span aria-hidden>{t.emoji}</span> {t.name}</span>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-label mb-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>Compulsory</p>
                <div className="flex flex-wrap gap-2">
                  {WAEC_CORE.map((s) => (
                    <span key={s} className="mt-body inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: NAVY }}><Lock size={13} /> {s}</span>
                  ))}
                </div>

                <div className="mb-2 mt-6 flex items-center justify-between">
                  <p className="mt-label text-xs" style={{ color: 'var(--text-muted)' }}>Add {track.name} subjects</p>
                  <span className="mt-mono text-xs font-bold" style={{ color: NAVY }}>{selected.length} added</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={track.id} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
                    {electives.map((s) => {
                      const on = selected.includes(s);
                      const disabled = (counts[s] ?? 0) === 0;
                      return <Chip key={s} on={on} disabled={disabled} onClick={() => toggleElective(s)} gold>{s}</Chip>;
                    })}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Questions / subject</p>
                    <Segment options={WAEC_COUNT_OPTIONS} value={count} onChange={setCount} render={(v) => String(v)} fill={GOLD} on="dark" />
                  </div>
                  <div>
                    <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Mode</p>
                    <Segment options={[true, false]} value={timed} onChange={setTimed} render={(v) => (v ? 'Timed' : 'Relaxed')} icon={(v) => (v ? Clock : Zap)} fill={NAVY} />
                  </div>
                </div>

                {err && <p className="mt-body mt-4 text-sm font-semibold" style={{ color: '#e11d48' }}>{err}</p>}
                <button onClick={startFocus} className="mt-btn mt-6 w-full text-white" style={{ background: NAVY, fontSize: '1rem', padding: '0.95rem', boxShadow: `0 14px 34px -12px ${NAVY}` }}><Play size={18} fill="currentColor" /> Start WAEC mock</button>
              </div>

              <div className="lg:sticky lg:top-24">
                <PaperPreview core={WAEC_CORE} electives={selected} count={count} total={focusTotal} timed={timed} />
              </div>
            </motion.div>
          )}

          {/* ═══ PRACTICE ═══ */}
          {tab === 'practice' && (
            <motion.div key="practice" {...fade} className="grid items-start gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="mt-card p-6 sm:p-7" style={{ boxShadow: 'var(--mt-shadow)' }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: softNavy(12), color: NAVY }}><Layers size={22} /></span>
                  <div>
                    <h2 className="mt-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>Free practice</h2>
                    <p className="mt-body text-sm" style={{ color: 'var(--text-muted)' }}>Any subject, any paper — your timing, your length.</p>
                  </div>
                </div>

                <p className="mt-label mb-2 mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>Pick any subjects</p>
                <div className="flex flex-wrap gap-2">
                  {ALL_SUBJECTS.map((s) => {
                    const on = practice.includes(s);
                    const disabled = (counts[s] ?? 0) === 0;
                    return <Chip key={s} on={on} disabled={disabled} onClick={() => togglePractice(s)} gold>{s}</Chip>;
                  })}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Questions / subject</p>
                    <Segment options={WAEC_COUNT_OPTIONS} value={pCount} onChange={setPCount} render={(v) => String(v)} fill={GOLD} on="dark" />
                  </div>
                  <div>
                    <p className="mt-label mb-2 text-xs" style={{ color: 'var(--text-muted)' }}>Mode</p>
                    <Segment options={[true, false]} value={pTimed} onChange={setPTimed} render={(v) => (v ? 'Timed' : 'Relaxed')} icon={(v) => (v ? Clock : Zap)} fill={NAVY} />
                  </div>
                </div>

                {err && <p className="mt-body mt-4 text-sm font-semibold" style={{ color: '#e11d48' }}>{err}</p>}
                <button onClick={startPractice} className="mt-btn mt-6 w-full text-white" style={{ background: NAVY, fontSize: '1rem', padding: '0.95rem', boxShadow: `0 14px 34px -12px ${NAVY}` }}><Play size={18} fill="currentColor" /> Start practice</button>
              </div>

              <div className="lg:sticky lg:top-24">
                <SetPreview subjects={practice} count={pCount} timed={pTimed} />
              </div>
            </motion.div>
          )}

          {/* ═══ AI ═══ */}
          {tab === 'ai' && (
            <motion.div key="ai" {...fade}>
              <Head icon={Sparkles} title="AI Tutor" sub="Stuck on a WAEC topic? Ask and get a clear, simple explanation." />
              <ExamAiChat accent={NAVY} examName="WAEC" onLogin={onLogin} suggestions={['Explain photosynthesis', 'How do I solve simultaneous equations?', 'What is an adjective?']} />
            </motion.div>
          )}

          {/* ═══ NEWS ═══ */}
          {tab === 'news' && (
            <motion.div key="news" {...fade}>
              <Head icon={Newspaper} title="WAEC news & updates" sub="Timetables, tips and changes — so you never miss what matters." />
              <div className="grid gap-5 sm:grid-cols-3">
                {NEWS.map((n) => (
                  <a key={n.title} href="#news" className="mt-card group flex h-full flex-col p-6 transition-shadow hover:shadow-lg" style={{ boxShadow: 'var(--mt-shadow-sm)' }}>
                    <div className="flex items-center justify-between">
                      <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: softNavy(12), color: NAVY }}>WAEC</span>
                      {n.fresh && <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: softGold(30), color: '#8a6300' }}>New this week</span>}
                    </div>
                    <h3 className="mt-display mt-4 text-lg font-bold" style={{ color: 'var(--text)' }}>{n.title}</h3>
                    <p className="mt-body mt-1.5 flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                    <span className="mt-body mt-4 inline-flex items-center gap-1 text-sm font-bold transition-transform group-hover:gap-1.5" style={{ color: NAVY }}>Read <ArrowUpRight size={15} /></span>
                  </a>
                ))}
              </div>
              <p className="mt-body mt-6 flex items-center justify-center gap-1.5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                <Lightbulb size={13} /> Real WAEC news will be posted here — this is the structure.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ── Live WAEC objective (OBJ) CBT screen mockup ── */
function ObjMockup() {
  const opts = [
    { k: 'A', t: 'Guard cells' },
    { k: 'B', t: 'Xylem vessels' },
    { k: 'C', t: 'Chloroplasts', on: true },
    { k: 'D', t: 'Root hairs' },
  ];
  const palette = Array.from({ length: 20 }, (_, i) => i + 1);
  const answered = new Set([1, 2, 3, 4, 6, 7, 10, 11]);
  const current = 12;
  const subjects = ['English', 'Maths', 'Biology', 'Chemistry'];
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#fff', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.14)' }}>
      <div className="flex items-center gap-1.5 px-3.5 py-2.5" style={{ background: '#0F172A' }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#EF4444' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F59E0B' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#22C55E' }} />
        <span className="mx-auto text-[11px] font-semibold" style={{ color: '#94A3B8', fontFamily: 'var(--mt-body)' }}>WAEC OBJ · Candidate 4251180263</span>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `linear-gradient(120deg, ${NAVY_DEEP}, ${NAVY})` }}>
        <div className="flex items-center gap-2 text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-extrabold" style={{ background: GOLD, color: NAVY_DEEP, fontFamily: 'var(--mt-display)' }}>A</span>
          <span className="text-xs font-bold" style={{ fontFamily: 'var(--mt-display)' }}>Biology · Paper 1</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1" style={{ background: 'rgba(255,255,255,.18)' }}>
          <motion.span animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
          <span className="text-xs font-bold text-white" style={{ fontFamily: 'var(--mt-mono)' }}>00:48:05</span>
        </div>
      </div>
      <div className="flex gap-1 px-3 pt-3">
        {subjects.map((s, i) => (
          <span key={s} className="rounded-t-lg px-2.5 py-1.5 text-[11px] font-bold" style={i === 2 ? { background: softGold(16), color: NAVY_DEEP, fontFamily: 'var(--mt-body)' } : { color: '#94A3B8', fontFamily: 'var(--mt-body)' }}>{s}</span>
        ))}
      </div>
      <div className="grid gap-3 border-t p-4" style={{ borderColor: '#E2E8F0', gridTemplateColumns: '1fr 84px' }}>
        <div>
          <div className="text-[11px] font-bold" style={{ color: NAVY, fontFamily: 'var(--mt-mono)' }}>QUESTION 12 OF 50</div>
          <p className="mt-1 text-[13px] font-semibold leading-snug" style={{ color: '#0F172A', fontFamily: 'var(--mt-body)' }}>
            In which structures of a leaf does photosynthesis mainly occur?
          </p>
          <div className="mt-3 space-y-1.5">
            {opts.map((o) => (
              <div key={o.k} className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px]" style={o.on ? { borderColor: GOLD, background: softGold(12) } : { borderColor: '#E2E8F0', background: '#fff' }}>
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold" style={o.on ? { background: GOLD, color: NAVY_DEEP } : { background: '#F1F5F9', color: '#64748B' }}>{o.on ? <Check size={12} /> : o.k}</span>
                <span style={{ color: o.on ? NAVY_DEEP : '#475569', fontFamily: 'var(--mt-body)', fontWeight: o.on ? 700 : 500 }}>{o.t}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold" style={{ background: '#F1F5F9', color: '#64748B', fontFamily: 'var(--mt-body)' }}><ChevronLeft size={13} /> Prev</span>
            <span className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: NAVY, fontFamily: 'var(--mt-body)' }}>Next <ChevronRight size={13} /></span>
          </div>
        </div>
        <div className="rounded-lg p-2" style={{ background: '#F8FAFC', border: '1px solid #EEF2F7' }}>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: '#94A3B8', fontFamily: 'var(--mt-label)' }}>Palette</div>
          <div className="grid grid-cols-4 gap-1">
            {palette.map((n) => {
              const isCur = n === current;
              const isDone = answered.has(n);
              return (
                <span key={n} className="flex h-4 w-full items-center justify-center rounded-[3px] text-[8px] font-bold" style={isCur ? { background: '#fff', color: NAVY_DEEP, boxShadow: `0 0 0 1.5px ${GOLD}`, fontFamily: 'var(--mt-mono)' } : isDone ? { background: NAVY, color: '#fff', fontFamily: 'var(--mt-mono)' } : { background: '#E2E8F0', color: '#94A3B8', fontFamily: 'var(--mt-mono)' }}>{n}</span>
              );
            })}
          </div>
          <div className="mt-2 space-y-1">
            <Legend color={NAVY} label="Answered" />
            <Legend color="#E2E8F0" label="Unseen" dark />
          </div>
        </div>
      </div>
    </div>
  );
}
function Legend({ color, label, dark }: { color: string; label: string; dark?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: color }} />
      <span className="text-[9px] font-semibold" style={{ color: dark ? '#94A3B8' : '#64748B', fontFamily: 'var(--mt-body)' }}>{label}</span>
    </div>
  );
}

/* Live WAEC paper preview (Focus) */
function PaperPreview({ core, electives, count, total, timed }: { core: string[]; electives: string[]; count: number; total: number; timed: boolean }) {
  const rows = [...core.map((s) => ({ s, locked: true })), ...electives.map((s) => ({ s, locked: false }))];
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--mt-shadow)' }}>
      <div className="flex items-center justify-between px-5 py-4" style={{ background: `linear-gradient(120deg, ${NAVY_DEEP}, ${NAVY})` }}>
        <div>
          <div className="mt-label text-[10px] text-white/70">Your paper</div>
          <div className="mt-display text-base font-extrabold text-white">WAEC Mock</div>
        </div>
        <div className="mt-mono rounded-lg px-2.5 py-1 text-sm font-bold" style={{ background: softGold(90), color: NAVY_DEEP }}>{timed ? `${total} min` : 'Relaxed'}</div>
      </div>
      <div className="mt-grid-surface p-5">
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.s} className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5" style={{ borderColor: r.locked ? softNavy(30) : 'var(--border)', background: r.locked ? softNavy(6) : 'var(--surface)' }}>
              {r.locked ? <Lock size={14} style={{ color: NAVY }} /> : <Check size={14} style={{ color: GOLD }} />}
              <span className="mt-body flex-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.s}</span>
              <span className="mt-mono text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{count} Qs</span>
            </div>
          ))}
          {electives.length === 0 && (
            <div className="flex items-center gap-3 rounded-xl border border-dashed px-3.5 py-2.5" style={{ borderColor: 'var(--border)' }}>
              <span className="h-3.5 w-3.5 rounded-full border" style={{ borderColor: 'var(--border)' }} />
              <span className="mt-body flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>Add a track subject…</span>
              <span className="mt-mono text-xs" style={{ color: 'var(--text-muted)' }}>{count} Qs</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: 'var(--border)' }}>
          <span className="mt-body text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Total questions</span>
          <span className="mt-mono text-2xl font-extrabold" style={{ color: NAVY }}>{total}</span>
        </div>
        <p className="mt-body mt-3 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}><ShieldCheck size={13} style={{ color: GOLD }} /> Grouped by subject — objectives now, theory prep next.</p>
      </div>
    </div>
  );
}

/* Live practice-set preview (Practice) */
function SetPreview({ subjects, count, timed }: { subjects: string[]; count: number; timed: boolean }) {
  return (
    <div className="mt-card mt-grid-surface p-6" style={{ boxShadow: 'var(--mt-shadow)' }}>
      <div className="flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: softNavy(12), color: NAVY }}><FileText size={20} /></span>
        <h3 className="mt-display text-lg font-extrabold" style={{ color: 'var(--text)' }}>Your practice set</h3>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="Subjects" value={String(subjects.length)} />
        <Stat label="Per subject" value={String(count)} />
        <Stat label="Mode" value={timed ? 'Timed' : 'Relaxed'} />
        <Stat label="Total" value={String(subjects.length * count)} />
      </div>
      {subjects.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {subjects.map((s) => <span key={s} className="mt-body rounded-full px-2.5 py-1 text-[11px] font-semibold" style={{ background: softNavy(10), color: NAVY }}>{s}</span>)}
        </div>
      )}
      <p className="mt-body mt-4 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}><BookOpen size={13} style={{ color: GOLD }} /> Fresh questions each time — grouped by subject.</p>
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

function Head({ icon: Icon, title, sub }: { icon: typeof GraduationCap; title: string; sub: string }) {
  return (
    <div className="mb-6 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: softNavy(12), color: NAVY }}><Icon size={24} /></span>
      <h2 className="mt-display mt-3 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{title}</h2>
      <p className="mt-body mx-auto mt-1.5 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>{sub}</p>
    </div>
  );
}

function Chip({ on, disabled, onClick, gold, children }: { on: boolean; disabled?: boolean; onClick: () => void; gold?: boolean; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const onStyle = gold ? { background: GOLD, borderColor: GOLD, color: NAVY_DEEP } : { background: NAVY, borderColor: NAVY, color: '#fff' };
  return (
    <motion.button
      onClick={onClick} disabled={disabled}
      whileTap={reduce || disabled ? undefined : { scale: 0.95 }} animate={reduce ? undefined : { scale: on ? 1.03 : 1 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="mt-body inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold disabled:opacity-40"
      style={on ? onStyle : { borderColor: 'var(--border)', color: 'var(--text)', background: 'var(--surface)' }}
    >
      {on && <Check size={14} />}{children}
      {disabled && <span className="text-[10px] font-bold uppercase opacity-70">soon</span>}
    </motion.button>
  );
}

function Segment<T extends string | number | boolean>({ options, value, onChange, render, icon, fill, on }: { options: readonly T[]; value: T; onChange: (v: T) => void; render: (v: T) => string; icon?: (v: T) => typeof Clock; fill: string; on?: 'dark' | 'light' }) {
  const reduce = useReducedMotion();
  const activeText = on === 'dark' ? NAVY_DEEP : '#fff';
  return (
    <div className="grid gap-1.5 rounded-2xl p-1.5" style={{ background: 'var(--surface-2)', gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => {
        const active = o === value;
        const Icon = icon?.(o);
        return (
          <button key={String(o)} onClick={() => onChange(o)} className="mt-body relative rounded-xl px-2 py-2 text-sm font-bold" style={{ color: active ? activeText : 'var(--text-muted)' }}>
            {active && <motion.span layoutId={`seg-${render(options[0])}`} transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 480, damping: 38 }} className="absolute inset-0 rounded-xl" style={{ background: fill }} />}
            <span className="relative inline-flex items-center justify-center gap-1.5">{Icon && <Icon size={14} />}{render(o)}</span>
          </button>
        );
      })}
    </div>
  );
}
