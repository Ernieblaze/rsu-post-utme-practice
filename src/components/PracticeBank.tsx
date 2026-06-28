import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Layers, Sparkles, Clock } from 'lucide-react';
import type { BankQuestion, Test } from '../types';
import { uniqueValues, filterBank, buildTestFromBank } from '../data/questionBank';
import { findCourseById } from '../data/rsuData';
import { relevantBankSubjects } from '../data/subjectMatch';
import { filterForPractice, buildPracticeTest } from '../data/practiceBuilder';
import { getSelectedCourseId, setSelectedCourseId, clearSelectedCourseId } from '../lib/courseSelection';
import { CoursePicker, CourseSummaryCard } from './CourseSelector';

interface PracticeBankProps {
  bank: BankQuestion[];
  onBack: () => void;
  onStart: (test: Test) => void;
}

const UNTIMED_MINUTES = 999;
const DEFAULT_PRACTICE_COUNT = 6;

export function PracticeBank({ bank, onBack, onStart }: PracticeBankProps) {
  const [courseId, setCourseId] = useState<string | null>(() => getSelectedCourseId());
  const selected = courseId ? findCourseById(courseId) : null;

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id);
    setCourseId(id);
  }
  function handleChangeCourse() {
    clearSelectedCourseId();
    setCourseId(null);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button onClick={onBack} className="mb-3 flex items-center gap-1 text-sm font-semibold text-school-green hover:underline">
        <ArrowLeft size={16} /> Back home
      </button>

      <div className="mb-6">
        {selected ? (
          <CourseSummaryCard faculty={selected.faculty} course={selected.course} onChangeCourse={handleChangeCourse} />
        ) : (
          <CoursePicker onSelect={handleSelectCourse} />
        )}
      </div>

      {selected ? (
        <CoursePractice bank={bank} courseId={selected.course.id} onStart={onStart} />
      ) : (
        <FreePractice bank={bank} onStart={onStart} />
      )}
    </main>
  );
}

/** Practice mode once a course is selected: pick subjects + topics from the student's own combo. */
function CoursePractice({
  bank,
  courseId,
  onStart,
}: {
  bank: BankQuestion[];
  courseId: string;
  onStart: (test: Test) => void;
}) {
  const found = findCourseById(courseId);
  const relevantSubjects = useMemo(() => (found ? relevantBankSubjects(bank, found.course) : []), [found, bank]);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(relevantSubjects);
  const [topic, setTopic] = useState('all');
  const [count, setCount] = useState(DEFAULT_PRACTICE_COUNT);
  const [timed, setTimed] = useState(true);
  const [minutes, setMinutes] = useState(15);
  const [error, setError] = useState('');

  useEffect(() => {
    setSelectedSubjects(relevantSubjects);
    setTopic('all');
  }, [relevantSubjects]);

  function toggleSubject(s: string) {
    setSelectedSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  const topics = useMemo(() => {
    const pool = filterForPractice(bank, { subjects: selectedSubjects, topics: [] });
    return Array.from(new Set(pool.map((q) => q.topic).filter((t): t is string => !!t))).sort();
  }, [bank, selectedSubjects]);

  const available = useMemo(
    () => filterForPractice(bank, { subjects: selectedSubjects, topics: topic === 'all' ? [] : [topic] }).length,
    [bank, selectedSubjects, topic]
  );

  function start() {
    const test = buildPracticeTest(
      bank,
      { subjects: selectedSubjects, topics: topic === 'all' ? [] : [topic] },
      count,
      timed ? minutes : UNTIMED_MINUTES,
      `Practice: ${selectedSubjects.join(', ') || 'Your subjects'}`
    );
    if (!test) {
      setError('No questions match these filters yet. Try selecting more subjects or clearing the topic filter.');
      return;
    }
    onStart(test);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-3xl border border-school-green/10 bg-white shadow-md dark:border-school-green/20 dark:bg-school-navy/40"
    >
      <div className="hero-gradient px-6 py-8 text-white">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-school-gold/40 bg-school-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-school-gold">
          <Sparkles size={13} /> Custom practice
        </div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Build a practice set</h1>
        <p className="mt-1 text-white/85">Pick which of your subjects to drill, and how.</p>
      </div>

      <div className="p-6">
        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
          Subjects
        </span>
        <div className="mb-4 flex flex-wrap gap-2">
          {relevantSubjects.map((s) => {
            const active = selectedSubjects.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${
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

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">Topic</span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={topics.length === 0}
              className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green disabled:opacity-50 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <NumberField label="Questions (6 is a calm session)" value={count} min={1} max={50} onChange={setCount} />
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-school-light p-3 dark:bg-school-navy/60">
          <span className="flex items-center gap-2 text-sm font-semibold text-school-navy dark:text-slate-200">
            <Clock size={16} className="text-school-green" /> Timed practice
          </span>
          <button
            onClick={() => setTimed((t) => !t)}
            role="switch"
            aria-checked={timed}
            className={`relative h-6 w-11 rounded-full transition ${timed ? 'bg-school-green' : 'bg-school-navy/20 dark:bg-white/20'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${timed ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
        {timed && (
          <div className="mt-3">
            <NumberField label="Time limit (minutes)" value={minutes} min={1} max={180} onChange={setMinutes} />
          </div>
        )}

        {available === 0 ? (
          <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            No questions match this selection yet. Try a different subject or clear the topic filter.
          </p>
        ) : (
          count > available && (
            <p className="mt-5 rounded-xl bg-school-light p-3 text-sm font-semibold text-school-navy dark:bg-school-navy/60 dark:text-slate-200">
              <Layers size={16} className="mr-2 inline text-school-green" />
              You'll get a shorter set than requested for this selection.
            </p>
          )
        )}

        {error && <p className="mt-3 text-sm font-semibold text-rose-500">{error}</p>}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={start}
          disabled={available === 0 || selectedSubjects.length === 0}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3 font-bold text-white shadow-sm hover:bg-school-green/90 disabled:opacity-40"
        >
          <Play size={18} fill="currentColor" /> Start practice
        </motion.button>
      </div>
    </motion.div>
  );
}

/** Original filter-by-university/year/subject/difficulty flow, unchanged, for anyone who skips course selection. */
function FreePractice({ bank, onStart }: { bank: BankQuestion[]; onStart: (test: Test) => void }) {
  const universities = useMemo(() => uniqueValues(bank, 'university'), [bank]);
  const subjects = useMemo(() => uniqueValues(bank, 'subject'), [bank]);

  const [university, setUniversity] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [count, setCount] = useState(20);
  const [minutes, setMinutes] = useState(20);
  const [error, setError] = useState('');

  const available = useMemo(
    () => filterBank(bank, { university, subject, difficulty }).filter((q) => q.type === 'single').length,
    [bank, university, subject, difficulty]
  );

  function start() {
    const test = buildTestFromBank(bank, { university, subject, difficulty }, count, minutes);
    if (!test) {
      setError('No single-answer questions match these filters. Try widening them.');
      return;
    }
    onStart(test);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-school-green/10 bg-white shadow-md dark:border-school-green/20 dark:bg-school-navy/40">
      <div className="hero-gradient px-6 py-8 text-white">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-school-gold/40 bg-school-gold/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-school-gold">
          <Sparkles size={13} /> Custom practice
        </div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Build a practice set</h1>
        <p className="mt-1 text-white/85">Draw questions from your bank by university, subject and level.</p>
      </div>

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FilterSelect label="University" value={university} onChange={setUniversity} options={universities} all="Any university" />
          <FilterSelect label="Subject" value={subject} onChange={setSubject} options={subjects} all="Any subject" />
          <FilterSelect label="Difficulty" value={difficulty} onChange={setDifficulty} options={['easy', 'medium', 'hard']} all="Any level" />
          <NumberField label="Questions" value={count} min={1} max={100} onChange={setCount} />
          <NumberField label="Time limit (minutes)" value={minutes} min={1} max={180} onChange={setMinutes} />
        </div>

        {available === 0 ? (
          <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            No questions match these filters. Try widening them.
          </p>
        ) : (
          count > available && (
            <p className="mt-5 rounded-xl bg-school-light p-3 text-sm font-semibold text-school-navy dark:bg-school-navy/60 dark:text-slate-200">
              <Layers size={16} className="mr-2 inline text-school-green" />
              You'll get a shorter set than requested for this selection.
            </p>
          )
        )}

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
