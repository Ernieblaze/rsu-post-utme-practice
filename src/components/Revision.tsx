import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Search,
  Filter,
  X,
  CheckCircle,
  Lightbulb,
  Play,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Test } from '../types';
import { flattenQuestions, subjectColor } from '../lib/helpers';

interface RevisionProps {
  tests: Test[];
  onBack: () => void;
  onStartTest: (testId: string) => void;
  initialSubject?: string;
}

export function Revision({ tests, onBack, onStartTest, initialSubject }: RevisionProps) {
  const [search, setSearch] = useState('');
  const [exam, setExam] = useState<string>('all');
  const [subject, setSubject] = useState<string>(initialSubject || 'all');
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const allItems = useMemo(() => flattenQuestions(tests), [tests]);

  const subjects = useMemo(
    () => Array.from(new Set(allItems.map((i) => i.question.subject))).sort(),
    [allItems]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allItems.filter((item) => {
      const matchesSearch =
        item.question.text.toLowerCase().includes(q) ||
        Object.values(item.question.options).some((o) => o.toLowerCase().includes(q));
      const matchesExam = exam === 'all' || item.testId === exam;
      const matchesSubject = subject === 'all' || item.question.subject === subject;
      return matchesSearch && matchesExam && matchesSubject;
    });
  }, [allItems, search, exam, subject]);

  function clearFilters() {
    setSearch('');
    setExam('all');
    setSubject('all');
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
          Study and understand every question from all RSU Post-UTME past papers.
        </p>
      </motion.div>

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
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">All exams</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
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
            value={exam}
            onChange={(e) => setExam(e.target.value)}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">All exams</option>
            {tests.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-school-green/20 bg-school-light py-2.5 px-3 text-sm text-school-navy focus:border-school-green focus:outline-none dark:border-school-green/30 dark:bg-school-navy/60 dark:text-white"
          >
            <option value="all">All subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
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

      <div className="mb-4 text-sm font-medium text-school-navy/70 dark:text-slate-400">
        Showing {filtered.length} of {allItems.length} questions
      </div>

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
          {filtered.map((item, idx) => {
            const q = item.question;
            const isExpanded = expanded[q.id] ?? false;
            const subjectIdx = subjects.indexOf(q.subject);
            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                key={`${item.testId}-${q.id}`}
                className="overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
              >
                <div className={`h-1 w-full ${subjectColor(subjectIdx)}`} />
                <div className="p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-school-light px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-school-navy dark:bg-school-navy/60 dark:text-slate-300">
                      {item.testTitle.replace('Rivers State Post UTME ', '')}
                    </span>
                    <span className="rounded-full bg-school-pale px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-school-green dark:bg-school-green/20">
                      {q.subject}
                    </span>
                    <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <CheckCircle size={10} className="mr-1 inline" />
                      Ans: {q.answer}
                    </span>
                  </div>

                  <p className="mb-4 font-medium text-school-navy dark:text-white">Q{q.id}. {q.text}</p>

                  <div className="mb-4 grid gap-2 sm:grid-cols-2">
                    {(['A', 'B', 'C', 'D', 'E'] as const).map((opt) => (
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
                    <button
                      onClick={() => onStartTest(item.testId)}
                      className="flex items-center gap-1.5 rounded-lg bg-school-green px-3 py-1.5 text-xs font-bold text-white hover:bg-school-green/90"
                    >
                      <Play size={14} fill="currentColor" /> Practice this exam
                    </button>
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
    </main>
  );
}
