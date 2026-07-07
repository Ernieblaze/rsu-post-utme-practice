import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Target, Play, Lock, Clock, BookOpen, ArrowRight, ArrowLeft, Lightbulb, BarChart3,
  CheckCircle2, Layers, TrendingUp, Sparkles,
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

/** JAMB's theme — Nigeria green + white, tuned modern & futuristic. */
const T = {
  primary: '#008751', // Nigeria green
  light: '#10b981',
  deep: '#053d2b',
  soft: '#ecfdf5',
};

const FEATURES = [
  { icon: Target, title: 'Full JAMB Mock', body: 'English + 3 subjects, 180 questions, timed like the real UTME.', to: '#mock' },
  { icon: Layers, title: 'Practice by Subject', body: 'Drill one subject at a time at your own pace.', to: '/bank' },
  { icon: Lightbulb, title: 'Answer Explanations', body: 'Understand why each answer is right — really learn.', to: '#mock' },
  { icon: TrendingUp, title: 'Score Prediction', body: 'Turn your JAMB score into your admission chances.', to: '/predictor' },
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
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/admitme')} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.light})` }}>
              <Target size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">JAMB <span style={{ color: T.primary }}>Prep</span></span>
          </button>
          <nav className="flex items-center gap-1">
            <a href="#mock" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">Mock</a>
            <button onClick={() => navigate('/bank')} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">Practice</button>
            <button onClick={() => navigate('/predictor')} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">Predictor</button>
            <button onClick={() => navigate('/admitme')} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: T.primary }}>
              <ArrowLeft size={15} /> AdmitMe
            </button>
          </nav>
        </div>
      </header>

      {/* ── Hero (modern, light, glowing) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50 to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl" style={{ background: T.light }} />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full opacity-20 blur-3xl" style={{ background: T.primary }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm" style={{ color: T.primary }}>
              <Sparkles size={12} /> National UTME prep
            </span>
            <h1 className="mt-4 font-sora text-4xl font-extrabold leading-[1.08] text-slate-900 sm:text-5xl">
              Ace Your JAMB <span style={{ color: T.primary }}>(UTME)</span> 🎯
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              Real past questions, full timed mock exams — <strong className="text-slate-900">English + your 3 subjects</strong> —
              and an explanation on every answer. Modern practice for the real thing.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#mock" className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-base font-bold text-white transition hover:scale-[1.03]" style={{ background: T.primary, boxShadow: `0 12px 30px -8px ${T.primary}` }}>
                Start JAMB Mock <ArrowRight size={18} />
              </a>
              <button onClick={() => navigate('/bank')} className="inline-flex items-center gap-2 rounded-2xl border-2 px-7 py-3.5 text-base font-bold transition hover:bg-emerald-50" style={{ borderColor: T.primary, color: T.primary }}>
                Practice by subject
              </button>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-600">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} style={{ color: T.primary }} /> Real past questions</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={13} style={{ color: T.primary }} /> 180-question timed mock</span>
              <span className="inline-flex items-center gap-1.5"><Lightbulb size={13} style={{ color: T.primary }} /> Every answer explained</span>
            </div>
          </motion.div>

          {/* Floating visual panel */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block">
            <div className="absolute inset-0 rounded-[2.5rem] shadow-2xl" style={{ background: `linear-gradient(150deg, ${T.deep}, ${T.primary} 60%, ${T.light})` }} />
            <div className="absolute inset-0 flex items-center justify-center text-[9rem]">🎯</div>
            <Float className="left-2 top-8" icon={<BookOpen size={16} />} title="English 60" sub="+ 40 each" />
            <Float className="right-0 top-1/3" icon={<Target size={16} />} title="180 Qs" sub="full mock" />
            <Float className="bottom-8 left-6" icon={<Clock size={16} />} title={`${JAMB_DURATION_MINUTES} min`} sub="timed" />
          </motion.div>
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary }}>What's inside</p>
          <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">Everything for your UTME</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <button key={f.title} onClick={() => goTo(f.to)} className="group rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110" style={{ background: T.soft, color: T.primary }}>
                  <Icon size={24} />
                </div>
                <h3 className="font-sora font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
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
            <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">Build your JAMB mock</h2>
            <p className="mt-2 text-slate-600">Use of English is compulsory — pick your 3 subjects.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
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
                    style={active ? { background: T.primary, borderColor: T.primary, color: '#fff' } : { borderColor: '#e2e8f0', color: '#334155' }}
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

            <button onClick={start} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-lg font-bold text-white transition hover:opacity-90" style={{ background: T.primary, boxShadow: `0 12px 30px -8px ${T.primary}` }}>
              <Play size={20} fill="currentColor" /> Start JAMB Mock
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            Questions are structured from the JAMB syllabus for real exam practice — not a leak of any live paper.
          </p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600">
        <p className="font-bold text-slate-800">JAMB Prep · <span style={{ color: T.primary }}>AdmitMe</span></p>
        <p className="mt-1">Real UTME practice — English + your 3 subjects.</p>
        <button onClick={() => navigate('/admitme')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: T.primary }}>
          <ArrowLeft size={13} /> Back to AdmitMe
        </button>
      </footer>
    </div>
  );
}

function Float({ className, icon, title, sub }: { className: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className={`absolute flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: T.soft, color: T.primary }}>{icon}</span>
      <div className="leading-tight">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        <div className="text-[10px] font-semibold text-slate-500">{sub}</div>
      </div>
    </div>
  );
}
