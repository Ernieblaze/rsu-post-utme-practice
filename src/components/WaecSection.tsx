import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Play, Lock, Check, Clock, Zap, ListChecks, PenLine, BookOpen, GraduationCap,
} from 'lucide-react';
import type { BankQuestion, Test } from '../types';
import { SectionShell } from './SectionShell';
import {
  WAEC_CORE, WAEC_TRACKS, WAEC_COUNT_OPTIONS, WAEC_TIMED_MINUTES_PER_Q, WAEC_UNTIMED_MINUTES,
  buildWaecMock, waecSubjectCount, type WaecTrack,
} from '../data/waecExam';

interface WaecSectionProps {
  bank: BankQuestion[];
  onStart: (test: Test) => void;
  onLogin: () => void;
}

/** WAEC's official brand — deep navy blue + gold + white. */
const T = { navy: '#1b1b6b', deep: '#12124a', gold: '#f5b301', soft: '#eef1fb' };

export function WaecSection({ bank, onStart, onLogin }: WaecSectionProps) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [track, setTrack] = useState<WaecTrack>(WAEC_TRACKS[0]);
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState<number>(20);
  const [timed, setTimed] = useState(true);
  const [error, setError] = useState('');

  // Availability per subject, recomputed only when the bank changes.
  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    [...WAEC_CORE, ...WAEC_TRACKS.flatMap((t) => t.subjects)].forEach((s) => {
      if (!(s in map)) map[s] = waecSubjectCount(bank, s);
    });
    return map;
  }, [bank]);

  const electives = track.subjects.filter((s) => !WAEC_CORE.includes(s));

  function pickTrack(t: WaecTrack) {
    setTrack(t);
    setSelected([]);
    setError('');
  }
  function toggle(subject: string) {
    setError('');
    setSelected((prev) => (prev.includes(subject) ? prev.filter((s) => s !== subject) : [...prev, subject]));
  }
  function start() {
    const subjects = [...WAEC_CORE, ...selected];
    const minutes = timed ? Math.max(10, subjects.length * count * WAEC_TIMED_MINUTES_PER_Q) : WAEC_UNTIMED_MINUTES;
    const test = buildWaecMock(bank, subjects, count, minutes);
    if (!test || test.questions.length === 0) {
      setError('No questions are ready for this selection yet — try another subject or track.');
      return;
    }
    onStart(test);
  }

  const totalSubjects = WAEC_CORE.length + selected.length;
  const container = { hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.04 } } };
  const item = reduce
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SectionShell
        theme={{ primary: T.navy, light: T.gold }}
        brandName="WAEC " brandAccent="Prep"
        currentExamId="waec"
        navItems={[{ label: 'Build practice', to: '#build' }]}
        onLogin={onLogin}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(150deg, ${T.deep} 0%, ${T.navy} 100%)` }}>
        <div className="pointer-events-none absolute -right-24 -top-20 h-72 w-72 rounded-full opacity-25 blur-3xl" style={{ background: T.gold }} />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
          <motion.span
            initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
            style={{ background: T.gold, color: T.deep }}
          >
            <GraduationCap size={13} /> Your O-Level, made easy
          </motion.span>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="font-sora text-4xl font-extrabold leading-[1.1] sm:text-5xl" style={{ textWrap: 'balance' } as React.CSSProperties}
          >
            Smash Your <span style={{ color: T.gold }}>WAEC</span> 📗
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg"
          >
            Pick your track, choose your subjects, and practise real past questions — objectives now, theory prep on the way.
          </motion.p>
          <motion.a
            href="#build"
            initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}
            className="mt-8 inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-lg font-bold shadow-lg"
            style={{ background: T.gold, color: T.deep }}
          >
            Build my practice <ArrowRight size={18} />
          </motion.a>
        </div>
      </section>

      {/* ── Build your WAEC practice ── */}
      <section id="build" className="scroll-mt-20 py-14" style={{ background: T.soft }}>
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.navy }}>Your practice set</p>
            <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900" style={{ textWrap: 'balance' } as React.CSSProperties}>Build your WAEC practice</h2>
            <p className="mt-2 text-slate-600">English &amp; Mathematics are compulsory — pick your track and add your subjects.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-7">
            {/* Track selector */}
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Your track</p>
            <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
              {WAEC_TRACKS.map((t) => {
                const on = t.id === track.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => pickTrack(t)}
                    className="relative rounded-xl px-2 py-2.5 text-sm font-bold transition"
                    style={{ color: on ? '#fff' : '#475569' }}
                  >
                    {on && (
                      <motion.span
                        layoutId={reduce ? undefined : 'waec-track-pill'}
                        transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                        className="absolute inset-0 rounded-xl"
                        style={{ background: T.navy }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-1.5">
                      <span aria-hidden>{t.emoji}</span> {t.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Core subjects */}
            <p className="mb-2 mt-6 text-xs font-bold uppercase tracking-wider text-slate-500">Compulsory</p>
            <div className="flex flex-wrap gap-2">
              {WAEC_CORE.map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold text-white" style={{ background: T.navy }}>
                  <Lock size={13} /> {s}
                </span>
              ))}
            </div>

            {/* Electives */}
            <div className="mb-2 mt-6 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Add {track.name} subjects</p>
              <span className="text-xs font-semibold tabular-nums" style={{ color: T.navy }}>{selected.length} added</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={track.id} variants={container} initial="hidden" animate="show" className="flex flex-wrap gap-2">
                {electives.map((s) => {
                  const on = selected.includes(s);
                  const avail = counts[s] ?? 0;
                  return (
                    <motion.button
                      key={s}
                      variants={item}
                      onClick={() => toggle(s)}
                      whileTap={reduce ? undefined : { scale: 0.95 }}
                      animate={reduce ? undefined : { scale: on ? 1.03 : 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold"
                      style={on
                        ? { background: T.gold, borderColor: T.gold, color: T.deep }
                        : { borderColor: '#e2e8f0', color: avail > 0 ? '#334155' : '#94a3b8' }}
                    >
                      {on && <Check size={14} />}
                      {s}
                      {avail === 0 && <span className="text-[10px] font-bold uppercase opacity-70">soon</span>}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Customise */}
            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Questions per subject</p>
                <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5">
                  {WAEC_COUNT_OPTIONS.map((c) => {
                    const on = c === count;
                    return (
                      <button key={c} onClick={() => setCount(c)} className="relative rounded-xl px-2 py-2 text-sm font-bold tabular-nums transition" style={{ color: on ? T.deep : '#475569' }}>
                        {on && <motion.span layoutId={reduce ? undefined : 'waec-count-pill'} transition={{ type: 'spring', stiffness: 480, damping: 38 }} className="absolute inset-0 rounded-xl" style={{ background: T.gold }} />}
                        <span className="relative">{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Mode</p>
                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
                  {[{ k: true, label: 'Timed', icon: Clock }, { k: false, label: 'Relaxed', icon: Zap }].map((m) => {
                    const on = m.k === timed;
                    const Icon = m.icon;
                    return (
                      <button key={m.label} onClick={() => setTimed(m.k)} className="relative rounded-xl px-2 py-2 text-sm font-bold transition" style={{ color: on ? '#fff' : '#475569' }}>
                        {on && <motion.span layoutId={reduce ? undefined : 'waec-mode-pill'} transition={{ type: 'spring', stiffness: 480, damping: 38 }} className="absolute inset-0 rounded-xl" style={{ background: T.navy }} />}
                        <span className="relative flex items-center justify-center gap-1.5"><Icon size={14} /> {m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-rose-500">{error}</p>}

            {/* Summary + start */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl px-4 py-3 text-xs font-semibold" style={{ background: T.soft, color: T.navy }}>
              <span className="inline-flex items-center gap-1.5 tabular-nums"><BookOpen size={13} /> {totalSubjects} subjects</span>
              <span className="inline-flex items-center gap-1.5 tabular-nums"><ListChecks size={13} /> up to {totalSubjects * count} questions</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {timed ? 'Timed' : 'Relaxed'}</span>
            </div>

            <motion.button
              onClick={start}
              whileHover={reduce ? undefined : { scale: 1.01 }} whileTap={reduce ? undefined : { scale: 0.99 }}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-lg font-bold text-white"
              style={{ background: T.navy, boxShadow: `0 14px 34px -12px ${T.navy}` }}
            >
              <Play size={20} fill="currentColor" /> Start WAEC practice
            </motion.button>
          </div>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-500">
            <PenLine size={13} /> Theory-answer prep is coming next — objective practice is live now.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600">
        <p className="font-bold" style={{ color: T.navy }}>WAEC Prep · <span style={{ color: T.gold }}>AdmitMe</span></p>
        <p className="mt-1">Your O-Level, made easy — practise real past questions by track.</p>
        <button onClick={() => navigate('/admitme')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: T.navy }}>
          <ArrowLeft size={13} /> Back to AdmitMe
        </button>
      </footer>
    </div>
  );
}
