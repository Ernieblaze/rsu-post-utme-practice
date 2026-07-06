import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Play, Lock, Clock, BookOpen, ArrowRight } from 'lucide-react';
import type { BankQuestion, Test } from '../types';
import {
  JAMB_COMPULSORY, JAMB_SUBJECTS, JAMB_MAX_OTHER_SUBJECTS, JAMB_DURATION_MINUTES,
  buildJambMock, jambSubjectCount,
} from '../data/jambExam';

interface JambPracticeProps {
  bank: BankQuestion[];
  onStart: (test: Test) => void;
}

export function JambPractice({ bank, onStart }: JambPracticeProps) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState('');

  const others = JAMB_SUBJECTS.filter((s) => s !== JAMB_COMPULSORY);

  function toggle(subject: string) {
    setError('');
    setSelected((prev) => {
      if (prev.includes(subject)) return prev.filter((s) => s !== subject);
      if (prev.length >= JAMB_MAX_OTHER_SUBJECTS) return prev; // cap at 3
      return [...prev, subject];
    });
  }

  function start() {
    if (selected.length === 0) {
      setError('Pick at least one subject (plus Use of English) to start.');
      return;
    }
    const test = buildJambMock(bank, [JAMB_COMPULSORY, ...selected]);
    if (!test || test.questions.length === 0) {
      setError('No questions available for this selection yet. Try different subjects.');
      return;
    }
    onStart(test);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate('/admitme')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back to AdmitMe
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-green/15 text-school-green">
          <Target size={24} />
        </div>
        <div>
          <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">JAMB (UTME) Practice 🎯</h1>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">
            Use of English + your 3 subjects. Timed like the real UTME.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-school-green/10 bg-white p-6 shadow-md dark:border-school-green/20 dark:bg-school-navy/40">
        {/* Compulsory */}
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
          Compulsory
        </p>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-school-green bg-school-green px-4 py-2 text-sm font-semibold text-white">
          <Lock size={14} /> {JAMB_COMPULSORY}
        </div>

        {/* Choose 3 */}
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
            Choose your 3 subjects
          </p>
          <span className="text-xs font-semibold text-school-green">{selected.length}/{JAMB_MAX_OTHER_SUBJECTS} selected</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {others.map((s) => {
            const active = selected.includes(s);
            const disabled = !active && selected.length >= JAMB_MAX_OTHER_SUBJECTS;
            const count = jambSubjectCount(bank, s);
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                disabled={disabled || count === 0}
                className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                  active
                    ? 'border-school-green bg-school-green text-white'
                    : 'border-school-green/20 bg-school-light text-school-navy hover:bg-school-pale dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-rose-500">{error}</p>}

        {/* Format note */}
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl bg-school-light px-4 py-3 text-xs font-semibold text-school-navy/70 dark:bg-school-navy/60 dark:text-slate-300">
          <span className="inline-flex items-center gap-1.5"><BookOpen size={13} /> English 60 + 40 each</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {JAMB_DURATION_MINUTES} minutes</span>
          <span className="inline-flex items-center gap-1.5"><Target size={13} /> Up to 180 questions</span>
        </div>

        <button
          onClick={start}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3.5 text-lg font-bold text-white shadow-sm transition hover:bg-school-green/90"
        >
          <Play size={20} fill="currentColor" /> Start JAMB Mock
        </button>
      </div>

      {/* Secondary: drill single subjects via the existing Practice engine */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/bank')}
        className="mt-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-school-green/20 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:hover:bg-school-navy/60"
      >
        <span className="text-sm text-school-navy/80 dark:text-slate-300">
          Want to drill one subject at a time instead? <strong className="text-school-navy dark:text-white">Open Practice</strong>
        </span>
        <ArrowRight size={16} className="flex-none text-school-green" />
      </motion.button>

      <p className="mt-6 text-center text-xs text-school-muted">
        Questions are structured from the JAMB syllabus for real exam practice — not a leak of any live paper.
      </p>
    </main>
  );
}
