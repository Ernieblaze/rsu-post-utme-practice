import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Layers, Sparkles } from 'lucide-react';
import type { BankQuestion, Test } from '../types';
import { uniqueValues, filterBank, buildTestFromBank } from '../data/questionBank';

interface PracticeBankProps {
  bank: BankQuestion[];
  onBack: () => void;
  onStart: (test: Test) => void;
}

export function PracticeBank({ bank, onBack, onStart }: PracticeBankProps) {
  const universities = useMemo(() => uniqueValues(bank, 'university'), [bank]);
  const years = useMemo(() => uniqueValues(bank, 'year'), [bank]);
  const subjects = useMemo(() => uniqueValues(bank, 'subject'), [bank]);

  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(20);
  const [error, setError] = useState('');

  const available = useMemo(
    () => filterBank(bank, { university, year, subject, difficulty }).filter((q) => q.type === 'single').length,
    [bank, university, year, subject, difficulty]
  );

  function start() {
    const test = buildTestFromBank(bank, { university, year, subject, difficulty }, count, minutes);
    if (!test) {
      setError('No single-answer questions match these filters. Try widening them.');
      return;
    }
    onStart(test);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-sm font-semibold text-school-green hover:underline">
        <ArrowLeft size={16} /> Back home
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-school-green/10 bg-white shadow-md dark:border-school-green/20 dark:bg-school-navy/40">
        <div className="hero-gradient px-6 py-8 text-white">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-school-gold/40 bg-school-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-school-gold">
            <Sparkles size={13} /> Custom practice
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Build a practice set</h1>
          <p className="mt-1 text-white/85">Draw questions from your bank by university, year, subject and level.</p>
        </div>

        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FilterSelect label="University" value={university} onChange={setUniversity} options={universities} all="Any university" />
            <FilterSelect label="Year" value={year} onChange={setYear} options={years} all="Any year" />
            <FilterSelect label="Subject" value={subject} onChange={setSubject} options={subjects} all="Any subject" />
            <FilterSelect label="Difficulty" value={difficulty} onChange={setDifficulty} options={['easy', 'medium', 'hard']} all="Any level" />
            <NumberField label="Questions" value={count} min={1} max={100} onChange={setCount} />
            <NumberField label="Time limit (minutes)" value={minutes} min={1} max={180} onChange={setMinutes} />
          </div>

          <div className="mt-5 flex items-center gap-2 rounded-xl bg-school-light p-3 text-sm font-semibold text-school-navy dark:bg-school-navy/60 dark:text-slate-200">
            <Layers size={16} className="text-school-green" />
            {available} matching question(s) available
            {available > 0 && count > available && <span className="text-school-navy/60 dark:text-slate-400"> — you'll get all {available}.</span>}
          </div>

          {error && <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={start}
            disabled={available === 0}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3 font-bold text-white shadow-sm hover:bg-school-green/90 disabled:opacity-40"
          >
            <Play size={18} fill="currentColor" /> Start practice
          </motion.button>
        </div>
      </motion.div>
    </main>
  );
}

function FilterSelect({ label, value, onChange, options, all }: { label: string; value: string; onChange: (v: string) => void; options: string[]; all: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white">
        <option value="">{all}</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

function NumberField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))}
        className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
      />
    </label>
  );
}
