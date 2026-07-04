import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Search,
  Filter,
  X,
  CheckCircle,
  Lightbulb,
  Play,
  Shuffle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BankQuestion, Test } from '../types';
import { subjectColor, visibleOptionKeys } from '../lib/helpers';
import { findCourseById } from '../data/rsuData';
import { relevantBankSubjects } from '../data/subjectMatch';
import { categoryForSubject } from '../data/questionBank';
import { getSelectedCourseId, setSelectedCourseId, clearSelectedCourseId } from '../lib/courseSelection';
import { CoursePicker, CourseSummaryCard } from './CourseSelector';

interface RevisionProps {
  bank: BankQuestion[];
  onBack: () => void;
  initialSubject?: string;
  onStart?: (test: Test) => void;
}

const SESSION_BATCH_SIZE = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildRevisionTest(questions: BankQuestion[], title: string): Test {
  const picked = shuffle(questions);
  return {
    id: `revision-practice-${Date.now()}`,
    title,
    description: `${picked.length} question${picked.length === 1 ? '' : 's'} from Revision.`,
    durationMinutes: 999,
    questions: picked.map((q, idx) => ({
      id: idx + 1,
      subject: q.subject,
      topic: q.topic || undefined,
      text: q.text,
      options: { ...q.options },
      answer: q.answer,
      explanation: q.explanation,
    })),
  };
}

export function Revision({ bank, onBack, initialSubject, onStart }: RevisionProps) {
  const [courseId, setCourseId] = useState<string | null>(() => getSelectedCourseId());
  const [showCoursePicker, setShowCoursePicker] = useState(false);
  const selectedCourse = courseId ? findCourseById(courseId) : null;

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState<string>(initialSubject || 'all');
  const [topic, setTopic] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(SESSION_BATCH_SIZE);

  const allItems = useMemo(() => bank.filter((q) => q.type === 'single'), [bank]);

  const relevantSubjects = useMemo(
    () => (selectedCourse ? relevantBankSubjects(bank, selectedCourse.course) : null),
    [selectedCourse, bank]
  );

  const allSubjects = useMemo(
    () => Array.from(new Set(allItems.map((q) => q.subject))).sort(),
    [allItems]
  );
  const subjects = relevantSubjects && relevantSubjects.length > 0 ? relevantSubjects : allSubjects;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter((item) => {
      const matchesSearch =
        item.text.toLowerCase().includes(q) ||
        Object.values(item.options).some((o) => o.toLowerCase().includes(q));
      const matchesSubject = subject === 'all' || item.subject === subject;
      const matchesTopic = topic === 'all' || item.topic === topic;
      return matchesSearch && matchesSubject && matchesTopic;
    });
  }, [allItems, search, subject, topic]);

  const topics = useMemo(() => {
    const pool = subject === 'all' ? allItems : allItems.filter((i) => i.subject === subject);
    return Array.from(new Set(pool.map((i) => i.topic).filter((t): t is string => !!t && t.trim() !== ''))).sort();
  }, [allItems, subject]);

  useEffect(() => {
    setVisibleCount(SESSION_BATCH_SIZE);
  }, [search, subject, topic]);

  function clearFilters() {
    setSearch('');
    setSubject('all');
    setTopic('all');
  }

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id);
    setCourseId(id);
    setShowCoursePicker(false);
  }

  function handleChangeCourse() {
    clearSelectedCourseId();
    setCourseId(null);
    setSubject('all');
    setShowCoursePicker(false);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <motion.button
        whileHover={{ x: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-green/20 bg-white px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-school-navy dark:text-white">Question Bank & Revision</h1>
        <p className="text-school-navy/70 dark:text-slate-400">
          Study and understand questions organized by department, subject, and topic.
        </p>
      </motion.div>

      <div className="mb-6">
        {selectedCourse ? (
          <CourseSummaryCard
            faculty={selectedCourse.faculty}
            course={selectedCourse.course}
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
              Showing all questions ·{' '}
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

      {/* Mobile filter toggle */}
      <div className="mb-4 md:hidden">
        <button
          onClick={() => setShowFilters((s) => !s)}
          className="flex w-full items-center justify-between rounded-xl border border-school-green/20 bg-white px-4 py-3 text-sm font-bold text-school-navy shadow-sm dark:border-school-green/30 dark:bg-school-navy/40 dark:text-slate-200"
        >
          <span className="flex items-center gap-2">
            <Filter size={16} /> Filters
          </span>
          {showFilters ? <X size={16} /> : <Filter size={16} />}
        </button>
      </div>

      {/* Filters */}
      <motion.div
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
        className="mb-6 overflow-hidden rounded-2xl border border-school-green/10 bg-white p-4 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 md:h-auto md:opacity-100 md:overflow-visible"
      >
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 pl-9 pr-3 text-sm text-school-navy placeholder:text-school-navy/40 focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <select
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setTopic('all'); }}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">{relevantSubjects ? 'All your subjects' : 'All subjects'}</option>
            {(['General', 'Science', 'Arts'] as const).map((cat) => {
              const catSubs = subjects.filter((s) => categoryForSubject(s) === cat);
              if (catSubs.length === 0) return null;
              return (
                <optgroup key={cat} label={cat === 'General' ? '📋 General' : cat === 'Science' ? '🔬 Science' : '📚 Arts & Social Science'}>
                  {catSubs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={topics.length === 0}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green disabled:opacity-50 focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 text-sm font-bold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
          >
            <X size={14} /> Clear Filters
          </button>
        </div>
      </motion.div>

      {/* Desktop filters always visible */}
      <div className="mb-6 hidden rounded-2xl border border-school-green/10 bg-white p-4 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40 md:block">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-school-navy/40 dark:text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 pl-9 pr-3 text-sm text-school-navy placeholder:text-school-navy/40 focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white dark:placeholder:text-slate-500"
            />
          </div>
          <select
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setTopic('all'); }}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">{relevantSubjects ? 'All your subjects' : 'All subjects'}</option>
            {(['General', 'Science', 'Arts'] as const).map((cat) => {
              const catSubs = subjects.filter((s) => categoryForSubject(s) === cat);
              if (catSubs.length === 0) return null;
              return (
                <optgroup key={cat} label={cat === 'General' ? '📋 General' : cat === 'Science' ? '🔬 Science' : '📚 Arts & Social Science'}>
                  {catSubs.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </optgroup>
              );
            })}
          </select>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={topics.length === 0}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green disabled:opacity-50 focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={clearFilters}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-school-green/20 bg-white px-4 py-2.5 text-sm font-bold text-school-navy hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
          >
            <X size={14} /> Clear Filters
          </button>
        </div>
      </div>

      {/* ── Practice bar ── shown whenever there are questions to practice */}
      {onStart && filtered.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-school-green/20 bg-school-pale/60 px-4 py-3 dark:border-school-green/20 dark:bg-school-navy/60"
        >
          <span className="text-sm font-semibold text-school-navy dark:text-slate-200">
            <span className="font-bold text-school-green">{filtered.length}</span> question{filtered.length !== 1 ? 's' : ''} match your filter
          </span>
          <button
            onClick={() => onStart(buildRevisionTest(filtered, `Practice — ${subject !== 'all' ? subject : 'All subjects'}`))}
            className="flex items-center gap-1.5 rounded-xl bg-school-green px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-school-green/90"
          >
            <Shuffle size={14} /> Practice all {filtered.length} (shuffled)
          </button>
        </motion.div>
      )}

      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center rounded-3xl border border-dashed border-school-green/30 bg-white p-12 text-center dark:border-school-green/20 dark:bg-school-navy/40"
        >
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-school-light dark:bg-school-navy/60">
            <Search className="text-school-green" size={40} />
          </div>
          <p className="text-lg font-bold text-school-navy dark:text-white">No questions found</p>
          <p className="mb-6 text-school-navy/70 dark:text-slate-400">Try adjusting your search or filters.</p>
          <button
            onClick={clearFilters}
            className="rounded-xl bg-school-green px-5 py-2.5 font-bold text-white hover:bg-school-green/90"
          >
            Clear Filters
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filtered.slice(0, visibleCount).map((q, idx) => {
            const isExpanded = expanded[q.id] ?? false;
            const subjectIdx = subjects.indexOf(q.subject);
            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={q.id}
                className="overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
              >
                <div className={`h-1 w-full ${subjectColor(subjectIdx)}`} />
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-school-pale px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-school-green dark:bg-school-green/20">
                      {q.subject}
                    </span>
                    {q.topic && (
                      <span className="rounded-full bg-school-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                        {q.topic}
                      </span>
                    )}
                    <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <CheckCircle size={10} className="mr-1 inline" />
                      Ans: {q.answer}
                    </span>
                  </div>

                  <p className="mb-4 font-medium text-school-navy dark:text-white">{q.text}</p>

                  <div className="mb-4 grid gap-2 sm:grid-cols-2">
                    {visibleOptionKeys(q.options).map((opt) => (
                      <div
                        key={opt}
                        className={`rounded-lg border px-3 py-2 text-sm ${
                          opt === q.answer
                            ? 'border-school-green/30 bg-school-pale font-semibold text-school-green dark:bg-school-green/10'
                            : 'border-school-green/10 bg-school-light/50 text-school-navy/80 dark:bg-school-navy/60 dark:text-slate-300'
                        }`}
                      >
                        {opt}: {q.options[opt]}
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setExpanded((prev) => ({ ...prev, [q.id]: !prev[q.id] }))}
                      className="flex items-center gap-1.5 rounded-lg bg-school-light px-3 py-1.5 text-xs font-bold text-school-navy hover:bg-school-pale dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
                    >
                      <Lightbulb size={14} />
                      {isExpanded ? 'Hide explanation' : 'Show explanation'}
                    </button>
                    {onStart && (
                      <button
                        onClick={() => onStart(buildRevisionTest([q], `Practice: ${q.subject}`))}
                        className="flex items-center gap-1.5 rounded-lg bg-school-green/10 px-3 py-1.5 text-xs font-bold text-school-green hover:bg-school-green/20 dark:bg-school-green/15 dark:hover:bg-school-green/25"
                      >
                        <Play size={12} fill="currentColor" /> Practice this question
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 rounded-lg bg-school-light p-3 text-sm text-school-navy/80 dark:bg-school-navy/60 dark:text-slate-300">
                          <span className="font-semibold">Explanation:</span> {q.explanation}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {visibleCount < filtered.length && (
        <button
          onClick={() => setVisibleCount((c) => c + SESSION_BATCH_SIZE)}
          className="mx-auto mt-6 block rounded-xl border border-school-green/20 bg-white px-6 py-2.5 text-sm font-bold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
        >
          Show {Math.min(SESSION_BATCH_SIZE, filtered.length - visibleCount)} more questions
        </button>
      )}
    </main>
  );
}
