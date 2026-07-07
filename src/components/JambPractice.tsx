import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Play, Lock, Clock, BookOpen, ArrowRight, ArrowLeft, Lightbulb, BarChart3,
  CheckCircle2, Layers, TrendingUp,
} from 'lucide-react';
import type { BankQuestion, Test } from '../types';
import {
  JAMB_COMPULSORY, JAMB_SUBJECTS, JAMB_MAX_OTHER_SUBJECTS, JAMB_DURATION_MINUTES,
  buildJambMock, jambSubjectCount,
} from '../data/jambExam';

interface JambPracticeProps {
  bank: BankQuestion[];
  onStart: (test: Test) => void;
}

/** JAMB's own theme — fresh emerald green + white (distinct from RSU's forest green). */
const T = {
  primary: '#059669', // emerald-600
  light: '#10b981', // emerald-500
  deep: '#064e3b', // emerald-900
  soft: '#ecfdf5', // emerald-50
};

const FEATURES = [
  { icon: Target, title: 'Full JAMB Mock', body: 'English + 3 subjects, 180 questions, timed like the real UTME.', to: '#mock' },
  { icon: Layers, title: 'Practice by Subject', body: 'Drill one subject at a time at your own pace.', to: '/bank' },
  { icon: Lightbulb, title: 'Answer Explanations', body: 'Understand why each answer is right — really learn.', to: '#mock' },
  { icon: TrendingUp, title: 'Admission Predictor', body: 'Turn your JAMB score into your admission chances.', to: '/predictor' },
];

export function JambPractice({ bank, onStart }: JambPracticeProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');
  const others = JAMB_SUBJECTS.filter((s) => s !== JAMB_COMPULSORY);

  function toggle(subject: string) {
    setError('');
    setSelected((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : prev.length >= JAMB_MAX_OTHER_SUBJECTS ? prev : [...prev, subject]
    );
  }

  function start() {
    if (selected.length === 0) return setError('Pick at least one subject (plus Use of English) to start.');
    const test = buildJambMock(bank, [JAMB_COMPULSORY, ...selected]);
    if (!test || test.questions.length === 0) return setError('No questions available for this selection yet.');
    onStart(test);
  }

  function goTo(to: string) {
    if (to.startsWith('#')) document.querySelector(to)?.scrollIntoView({ behavior: 'smooth' });
    else navigate(to);
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── JAMB header (own nav) ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/admitme')} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.light})` }}>
              <Target size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">JAMB <span style={{ color: T.primary }}>Prep</span></span>
          </button>
          <nav className="flex items-center gap-1">
            <a href="#mock" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:block">Mock</a>
            <button onClick={() => navigate('/bank')} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:block">Practice</button>
            <button onClick={() => navigate('/predictor')} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 sm:block">Predictor</button>
            <button onClick={() => navigate('/admitme')} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: T.primary }}>
              <ArrowLeft size={15} /> AdmitMe
            </button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(150deg, ${T.deep} 0%, ${T.primary} 60%, ${T.light} 100%)` }}>
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-20">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur">
            <Target size={13} /> National UTME prep
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="font-sora text-4xl font-extrabold leading-[1.1] sm:text-5xl">
            Ace Your JAMB (UTME) 🎯
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            Practise with real past questions, take full timed mock exams — English + your 3 subjects — and learn
            from an explanation on every answer.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#mock" className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]" style={{ color: T.primary }}>
              Start JAMB Mock <ArrowRight size={19} />
            </a>
            <button onClick={() => navigate('/bank')} className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 text-lg font-bold text-white transition hover:bg-white/10">
              Practice by subject
            </button>
          </motion.div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/85">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> Real past questions</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={13} /> Timed 180-question mock</span>
            <span className="inline-flex items-center gap-1.5"><Lightbulb size={13} /> Explanation on every answer</span>
          </div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary }}>What's inside</p>
          <h2 className="mt-1 font-sora text-3xl font-extrabold">Everything for your UTME</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <button key={f.title} onClick={() => goTo(f.to)} className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: T.soft, color: T.primary }}>
                  <Icon size={24} />
                </div>
                <h3 className="font-sora font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{f.body}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── Build your mock (#mock) ── */}
      <section id="mock" className="scroll-mt-20 bg-slate-50 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary }}>Your mock exam</p>
            <h2 className="mt-1 font-sora text-3xl font-extrabold">Build your JAMB mock</h2>
            <p className="mt-2 text-slate-500">Use of English is compulsory — pick your 3 subjects.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-md">
            <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">Compulsory</p>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white" style={{ background: T.primary }}>
              <Lock size={14} /> {JAMB_COMPULSORY}
            </div>

            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Choose your 3 subjects</p>
              <span className="text-xs font-semibold" style={{ color: T.primary }}>{selected.length}/{JAMB_MAX_OTHER_SUBJECTS} selected</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {others.map((s) => {
                const active = selected.includes(s);
                const disabled = (!active && selected.length >= JAMB_MAX_OTHER_SUBJECTS) || jambSubjectCount(bank, s) === 0;
                return (
                  <button
                    key={s}
                    onClick={() => toggle(s)}
                    disabled={disabled}
                    className="rounded-full border px-3.5 py-2 text-sm font-semibold transition disabled:opacity-40"
                    style={active
                      ? { background: T.primary, borderColor: T.primary, color: '#fff' }
                      : { borderColor: '#e2e8f0' }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>

            {error && <p className="mt-4 text-sm font-semibold text-rose-500">{error}</p>}

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl px-4 py-3 text-xs font-semibold" style={{ background: T.soft, color: T.deep }}>
              <span className="inline-flex items-center gap-1.5"><BookOpen size={13} /> English 60 + 40 each</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {JAMB_DURATION_MINUTES} minutes</span>
              <span className="inline-flex items-center gap-1.5"><BarChart3 size={13} /> Up to 180 questions</span>
            </div>

            <button onClick={start} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-lg font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: T.primary }}>
              <Play size={20} fill="currentColor" /> Start JAMB Mock
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Questions are structured from the JAMB syllabus for real exam practice — not a leak of any live paper.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p className="font-bold text-slate-700">JAMB Prep · <span style={{ color: T.primary }}>AdmitMe</span></p>
        <p className="mt-1">Real UTME practice — English + your 3 subjects.</p>
        <button onClick={() => navigate('/admitme')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: T.primary }}>
          <ArrowLeft size={13} /> Back to AdmitMe
        </button>
      </footer>
    </div>
  );
}
