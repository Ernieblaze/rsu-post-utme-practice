import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, AlertCircle, Play } from 'lucide-react';
import type { BankQuestion, Test } from '../types';
import { findCourseById } from '../data/rsuData';
import { slotCoverageForCourse } from '../data/subjectMatch';
import { buildExamFocusTest } from '../data/examBlueprint';
import { getSelectedCourseId, setSelectedCourseId, clearSelectedCourseId } from '../lib/courseSelection';
import { CoursePicker, CourseSummaryCard, FacultyBrowseHint } from './CourseSelector';

interface ExamFocusProps {
  bank: BankQuestion[];
  onStart: (test: Test) => void;
}

const MIN_QUESTIONS_PER_SUBJECT = 5;

export function ExamFocus({ bank, onStart }: ExamFocusProps) {
  const navigate = useNavigate();
  const [courseId, setCourseId] = useState<string | null>(() => getSelectedCourseId());

  const selected = courseId ? findCourseById(courseId) : null;

  const slotCoverage = useMemo(
    () => (selected ? slotCoverageForCourse(bank, selected.course) : []),
    [selected, bank]
  );
  const missingSlots = slotCoverage
    .filter(({ available }) => available < MIN_QUESTIONS_PER_SUBJECT)
    .map(({ slot }) => slot.replace(/\//g, ' or '));

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id);
    setCourseId(id);
  }

  function handleChangeCourse() {
    clearSelectedCourseId();
    setCourseId(null);
  }

  function handleStart() {
    if (!selected) return;
    const { test } = buildExamFocusTest(bank, selected.course);
    onStart(test);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-green/15 text-school-green">
          <Target size={24} />
        </div>
        <div>
          <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">Exam Focus</h1>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">
            A personalized 50-question mock exam built around your exact course.
          </p>
        </div>
      </div>

      {!selected ? (
        <>
          <CoursePicker onSelect={handleSelectCourse} />
          <FacultyBrowseHint />
        </>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <CourseSummaryCard faculty={selected.faculty} course={selected.course} onChangeCourse={handleChangeCourse} />

          {missingSlots.length > 0 && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              <AlertCircle size={16} className="mt-0.5 flex-none" />
              <span>
                Still building up the question bank for: <strong>{missingSlots.join(', ')}</strong>. Your exam
                will include what's available now and grow as more questions are added — nothing is broken, this
                course just isn't fully stocked yet.
              </span>
            </div>
          )}

          <div className="rounded-2xl border border-school-border bg-school-surface p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
            <h2 className="font-sora text-lg font-semibold text-school-navy dark:text-white">What to expect</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-school-navy/80 dark:text-slate-300">
              <li>• Up to 50 questions: your JAMB subjects + Current Affairs + RSU General Knowledge</li>
              <li>• Strict 30-minute countdown timer</li>
              <li>• One question at a time, with clear progress</li>
              <li>• Full score breakdown and explanations at the end</li>
            </ul>
            <button
              onClick={handleStart}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3 font-bold text-white shadow-sm hover:bg-school-green/90"
            >
              <Play size={18} fill="currentColor" /> Start my personalized exam
            </button>
          </div>
        </motion.div>
      )}
    </main>
  );
}
