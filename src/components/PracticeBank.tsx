import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Layers, Sparkles, Clock, X } from 'lucide-react';
import type { BankQuestion, Test } from '../types';
import { findCourseById } from '../data/rsuData';
import { relevantBankSubjects } from '../data/subjectMatch';
import { filterForPractice, buildPracticeTest } from '../data/practiceBuilder';
import { getSelectedCourseId, setSelectedCourseId, clearSelectedCourseId } from '../lib/courseSelection';
import { categoryForSubject } from '../data/questionBank';
import { getSeenQuestionIds, recordSeenQuestionIds } from '../lib/examHistory';
import { useAuth } from '../context/AuthContext';
import { CoursePicker, CourseSummaryCard } from './CourseSelector';

interface PracticeBankProps {
  bank: BankQuestion[];
  onBack: () => void;
  onStart: (test: Test) => void;
}

const UNTIMED_MINUTES = 999;
const DEFAULT_COUNT = 10;

export function PracticeBank({ bank, onBack, onStart }: PracticeBankProps) {
  const [courseId, setCourseId] = useState<string | null>(() => getSelectedCourseId());
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const selected = courseId ? findCourseById(courseId) : null;

  // Every single-answer subject in the bank
  const allSubjects = useMemo(
    () => Array.from(new Set(bank.filter((q) => q.type === 'single').map((q) => q.subject))).sort(),
    [bank]
  );

  // Pre-selected subjects: course subjects when course is set, all subjects otherwise.
  // Depends on courseId (stable string), NOT `selected` (a fresh object each render),
  // so it doesn't recompute every render and reset the user's subject toggles.
  const courseSubjects = useMemo(() => {
    if (!courseId) return null;
    const found = findCourseById(courseId);
    return found ? relevantBankSubjects(bank, found.course) : null;
  }, [courseId, bank]);

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id);
    setCourseId(id);
    setShowCoursePicker(false);
  }
  function handleChangeCourse() {
    clearSelectedCourseId();
    setCourseId(null);
    setShowCoursePicker(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Optional course filter */}
      <div className="mb-6">
        {selected ? (
          <CourseSummaryCard
            faculty={selected.faculty}
            course={selected.course}
            onChangeCourse={handleChangeCourse}
          />
        ) : showCoursePicker ? (
          <div className="space-y-2">
            <CoursePicker onSelect={handleSelectCourse} />
            <button
              onClick={() => setShowCoursePicker(false)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-school-muted hover:text-school-navy dark:hover:text-slate-200"
            >
              <X size={12} /> Cancel — show all subjects
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-xl border border-dashed border-school-green/30 bg-school-light/60 px-4 py-3 dark:border-school-green/20 dark:bg-school-navy/40">
            <span className="text-sm text-school-navy/70 dark:text-slate-400">
              Showing all subjects ·{' '}
              <button
                onClick={() => setShowCoursePicker(true)}
                className="font-semibold text-school-green underline-offset-2 hover:underline"
              >
                Filter to my course
              </button>
            </span>
          </div>
        )}
      </div>

      <PracticeForm
        bank={bank}
        allSubjects={allSubjects}
        courseSubjects={courseSubjects}
        onStart={onStart}
      />
    </main>
  );
}

function PracticeForm({
  bank,
  allSubjects,
  courseSubjects,
  onStart,
}: {
  bank: BankQuestion[];
  allSubjects: string[];
  courseSubjects: string[] | null;
  onStart: (test: Test) => void;
}) {
  const { user } = useAuth();
  const defaultSubjects = courseSubjects ?? allSubjects;
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(defaultSubjects);
  const [topic, setTopic] = useState('all');
  const [count, setCount] = useState(DEFAULT_COUNT);
  const [timed, setTimed] = useState(true);
  const [minutes, setMinutes] = useState(15);
  const [error, setError] = useState('');

  // Re-sync when course changes
  useEffect(() => {
    setSelectedSubjects(courseSubjects ?? allSubjects);
    setTopic('all');
  }, [courseSubjects, allSubjects]);

  function toggleSubject(s: string) {
    setSelectedSubjects((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const topics = useMemo(() => {
    const pool = filterForPractice(bank, { subjects: selectedSubjects, topics: [] });
    return Array.from(new Set(pool.map((q) => q.topic).filter((t): t is string => !!t))).sort();
  }, [bank, selectedSubjects]);

  const available = useMemo(
    () =>
      filterForPractice(bank, {
        subjects: selectedSubjects,
        topics: topic === 'all' ? [] : [topic],
      }).length,
    [bank, selectedSubjects, topic]
  );

  function start() {
    setError('');
    // Serve fresh questions the student hasn't seen before (across Exam Focus AND
    // Practice), so every session keeps rotating through the bank.
    const seen = getSeenQuestionIds(user?.id ?? null);
    const result = buildPracticeTest(
      bank,
      { subjects: selectedSubjects, topics: topic === 'all' ? [] : [topic] },
      count,
      timed ? minutes : UNTIMED_MINUTES,
      `Practice: ${selectedSubjects.length === allSubjects.length ? 'All subjects' : selectedSubjects.join(', ')}`,
      seen
    );
    if (!result) {
      setError('No questions match these filters. Try selecting more subjects or clearing the topic filter.');
      return;
    }
    recordSeenQuestionIds(user?.id ?? null, result.usedIds);
    onStart(result.test);
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
        <p className="mt-1 text-white/85">
          Pick subjects to drill — questions shuffle randomly every session.
        </p>
      </div>

      <div className="p-6">
        {/* Subject toggles — grouped by category */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
            Subjects
          </span>
          <div className="flex gap-3 text-xs font-semibold">
            <button
              onClick={() => setSelectedSubjects(allSubjects)}
              className="text-school-green hover:underline"
            >
              Select all
            </button>
            <button
              onClick={() => setSelectedSubjects([])}
              className="text-school-muted hover:text-school-navy dark:hover:text-slate-200"
            >
              Clear
            </button>
          </div>
        </div>

        {(['General', 'Science', 'Arts'] as const).map((cat) => {
          const catSubjects = allSubjects.filter((s) => categoryForSubject(s) === cat);
          if (catSubjects.length === 0) return null;
          const catColors: Record<string, string> = {
            General: 'text-amber-600 dark:text-amber-400',
            Science: 'text-blue-600 dark:text-blue-400',
            Arts:    'text-purple-600 dark:text-purple-400',
          };
          return (
            <div key={cat} className="mb-4">
              <p className={`mb-1.5 text-[10px] font-bold uppercase tracking-widest ${catColors[cat]}`}>
                {cat === 'General' ? '📋 General (compulsory for all)' : cat === 'Science' ? '🔬 Science' : '📚 Arts & Social Science'}
              </p>
              <div className="flex flex-wrap gap-2">
                {catSubjects.map((s) => {
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
            </div>
          );
        })}

        <div className="mb-1" />

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
              Topic
            </span>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={topics.length === 0}
              className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green disabled:opacity-50 dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
            >
              <option value="all">All topics</option>
              {topics.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <NumberField
            label="Questions per session"
            value={count}
            min={1}
            max={100}
            onChange={setCount}
          />
        </div>

        {/* Timer toggle */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-school-light p-3 dark:bg-school-navy/60">
          <span className="flex items-center gap-2 text-sm font-semibold text-school-navy dark:text-slate-200">
            <Clock size={16} className="text-school-green" /> Timed practice
          </span>
          <button
            onClick={() => setTimed((t) => !t)}
            role="switch"
            aria-checked={timed}
            className={`relative h-6 w-11 rounded-full transition ${
              timed ? 'bg-school-green' : 'bg-school-navy/20 dark:bg-white/20'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                timed ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
        {timed && (
          <div className="mt-3">
            <NumberField
              label="Time limit (minutes)"
              value={minutes}
              min={1}
              max={180}
              onChange={setMinutes}
            />
          </div>
        )}

        {/* Readiness summary — no raw bank counts, just whether the set is ready */}
        <div className="mt-3 rounded-lg bg-school-pale/60 px-3 py-2 text-sm dark:bg-school-navy/40">
          {selectedSubjects.length === 0 ? (
            <span className="text-school-muted">No subjects selected — toggle some above.</span>
          ) : available === 0 ? (
            <span className="text-school-muted">No questions match this selection yet.</span>
          ) : (
            <span className="text-school-navy/70 dark:text-slate-400">
              Ready — you'll answer <strong className="text-school-green">{Math.min(count, available)}</strong> question
              {Math.min(count, available) !== 1 ? 's' : ''} this session.
            </span>
          )}
        </div>

        {available === 0 && selectedSubjects.length > 0 && (
          <p className="mt-2 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            No questions match this selection yet. Try adding more subjects or clearing the topic filter.
          </p>
        )}

        {count > available && available > 0 && (
          <p className="mt-2 flex items-center gap-2 rounded-xl bg-school-light p-3 text-sm font-semibold text-school-navy dark:bg-school-navy/60 dark:text-slate-200">
            <Layers size={16} className="text-school-green" />
            A few subjects have fewer questions right now — you'll get all that are available.
          </p>
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

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) =>
          onChange(Math.max(min, Math.min(max, Number(e.target.value) || min)))
        }
        className="w-full rounded-xl border border-school-green/20 bg-school-light px-3 py-2.5 text-sm font-medium text-school-navy outline-none focus:border-school-green dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
      />
    </label>
  );
}
