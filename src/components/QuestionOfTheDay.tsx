import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CalendarDays, CheckCircle2, XCircle, Lightbulb, Lock, Play, Sunrise } from 'lucide-react';
import type { BankQuestion, OptionKey } from '../types';
import { useAuth } from '../context/AuthContext';
import { findCourseById } from '../data/rsuData';
import { relevantBankSubjects } from '../data/subjectMatch';
import { getSelectedCourseId, setSelectedCourseId, clearSelectedCourseId } from '../lib/courseSelection';
import { visibleOptionKeys } from '../lib/helpers';
import { CoursePicker, CourseSummaryCard } from './CourseSelector';

interface QuestionOfTheDayProps {
  bank: BankQuestion[];
  onRequireAuth: () => void;
}

/** Local YYYY-MM-DD so the daily reset follows the student's own day. */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface DailyRecord {
  date: string;
  questionId: string;
  answered: boolean;
  selected?: OptionKey;
}

function readRecord(userId: string): DailyRecord | null {
  try {
    const raw = localStorage.getItem(`rsu_qotd_${userId}`);
    return raw ? (JSON.parse(raw) as DailyRecord) : null;
  } catch {
    return null;
  }
}

function writeRecord(userId: string, rec: DailyRecord): void {
  try {
    localStorage.setItem(`rsu_qotd_${userId}`, JSON.stringify(rec));
  } catch {
    /* ignore */
  }
}

export function QuestionOfTheDay({ bank, onRequireAuth }: QuestionOfTheDayProps) {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [courseId, setCourseId] = useState<string | null>(() => getSelectedCourseId());
  const [question, setQuestion] = useState<BankQuestion | null>(null);
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [picked, setPicked] = useState<OptionKey | null>(null);
  const [revealed, setRevealed] = useState(false);

  const selectedCourse = courseId ? findCourseById(courseId) : null;
  const userId = user?.id ?? null;

  // Pick today's question and sync the answered/revealed state. Depends ONLY on
  // stable primitives (userId, courseId, bank) — never on freshly-created
  // objects — so selecting an option does NOT re-run this and wipe the choice.
  useEffect(() => {
    if (!userId || !courseId) {
      setQuestion(null);
      return;
    }
    const found = findCourseById(courseId);
    if (!found) {
      setQuestion(null);
      return;
    }
    const subjects = relevantBankSubjects(bank, found.course);
    const today = todayKey();
    let rec = readRecord(userId);
    let chosen: BankQuestion | null = null;

    // Reuse today's stored question if it still exists in the bank.
    if (rec && rec.date === today) {
      chosen = bank.find((q) => q.id === rec!.questionId) ?? null;
    }
    // Otherwise pick a fresh random question from the course's subjects.
    if (!chosen) {
      const pool = bank.filter((q) => q.type === 'single' && subjects.includes(q.subject));
      chosen = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null;
      rec = chosen ? { date: today, questionId: chosen.id, answered: false } : null;
      if (chosen && rec) writeRecord(userId, rec);
    }

    setQuestion(chosen);
    setRecord(rec ?? null);
    if (rec && rec.date === today && rec.answered && rec.selected) {
      setPicked(rec.selected);
      setRevealed(true);
    } else {
      setPicked(null);
      setRevealed(false);
    }
  }, [userId, courseId, bank]);

  function handleSelectCourse(id: string) {
    setSelectedCourseId(id);
    setCourseId(id);
  }
  function handleChangeCourse() {
    clearSelectedCourseId();
    setCourseId(null);
  }

  function submit() {
    if (!user || !question || !picked) return;
    const rec: DailyRecord = { date: todayKey(), questionId: question.id, answered: true, selected: picked };
    writeRecord(user.id, rec);
    setRecord(rec);
    setRevealed(true);
  }

  const alreadyDoneToday = record?.date === todayKey() && record.answered;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-gold/15 text-school-gold">
          <CalendarDays size={24} />
        </div>
        <div>
          <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">Question of the Day</h1>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">
            One free question daily — build the habit, sharpen your edge.
          </p>
        </div>
      </div>

      {/* ── Not logged in ── */}
      {!authLoading && !user ? (
        <div className="rounded-2xl border border-school-border bg-school-surface p-8 text-center shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
          <Lock className="mx-auto mb-3 text-school-green" size={34} />
          <h2 className="font-sora text-lg font-bold text-school-navy dark:text-white">Sign in to play</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-school-navy/70 dark:text-slate-300">
            Create a free account (or log in) to answer today's question — it takes 20 seconds.
          </p>
          <button
            onClick={onRequireAuth}
            className="mt-5 rounded-xl bg-school-green px-6 py-2.5 font-bold text-white shadow-sm hover:bg-school-green/90"
          >
            Sign in / Register free
          </button>
        </div>
      ) : authLoading ? (
        <div className="py-16 text-center text-school-muted">Loading…</div>
      ) : !selectedCourse ? (
        /* ── Pick course first ── */
        <div>
          <p className="mb-3 text-sm font-semibold text-school-navy/70 dark:text-slate-300">
            First, select your course so we can give you a relevant question:
          </p>
          <CoursePicker onSelect={handleSelectCourse} />
        </div>
      ) : (
        <div className="space-y-5">
          <CourseSummaryCard
            faculty={selectedCourse.faculty}
            course={selectedCourse.course}
            onChangeCourse={handleChangeCourse}
          />

          {!question ? (
            <div className="rounded-2xl border border-amber-300/60 bg-amber-50 p-6 text-center text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
              No questions available for this course yet — try another course.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-2xl border border-school-green/10 bg-white shadow-md dark:border-school-green/20 dark:bg-school-navy/40"
            >
              <div className="flex items-center justify-between border-b border-school-border bg-school-pale/50 px-5 py-3 dark:border-school-green/10 dark:bg-school-navy/60">
                <span className="rounded-full bg-school-green/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-school-green">
                  {question.subject}
                </span>
                <span className="text-[11px] font-semibold text-school-muted">Today's question</span>
              </div>

              <div className="p-5">
                <p className="mb-4 font-medium text-school-navy dark:text-white">{question.text}</p>

                <div className="space-y-2.5">
                  {visibleOptionKeys(question.options).map((key) => {
                    const isChosen = picked === key;
                    const isCorrect = key === question.answer;
                    const showCorrect = revealed && isCorrect;
                    const showWrong = revealed && isChosen && !isCorrect;
                    return (
                      <button
                        key={key}
                        disabled={revealed}
                        onClick={() => setPicked(key)}
                        className={`flex w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm transition ${
                          showCorrect
                            ? 'border-school-green bg-school-green/10 font-semibold text-school-green'
                            : showWrong
                            ? 'border-rose-400 bg-rose-50 font-semibold text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                            : isChosen
                            ? 'border-school-green bg-school-green text-white'
                            : 'border-school-green/15 bg-school-light hover:bg-school-pale dark:border-school-green/20 dark:bg-school-navy/60 dark:text-slate-200'
                        } ${revealed ? 'cursor-default' : ''}`}
                      >
                        <span
                          className={`flex h-7 w-7 flex-none items-center justify-center rounded-lg text-xs font-bold ${
                            isChosen && !revealed ? 'bg-white/20 text-white' : 'bg-white text-school-navy dark:bg-school-navy/40 dark:text-slate-200'
                          }`}
                        >
                          {key}
                        </span>
                        <span className="flex-1">{question.options[key]}</span>
                        {showCorrect && <CheckCircle2 size={17} className="text-school-green" />}
                        {showWrong && <XCircle size={17} className="text-rose-500" />}
                      </button>
                    );
                  })}
                </div>

                {!revealed ? (
                  <button
                    onClick={submit}
                    disabled={!picked}
                    className="mt-5 w-full rounded-xl bg-school-green px-6 py-3 font-bold text-white shadow-sm hover:bg-school-green/90 disabled:opacity-40"
                  >
                    Submit answer
                  </button>
                ) : (
                  <AnimatePresence>
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 space-y-4">
                      <div
                        className={`rounded-xl p-4 text-sm ${
                          picked === question.answer
                            ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300'
                        }`}
                      >
                        <p className="mb-1 font-bold">
                          {picked === question.answer ? '🎉 Correct! Well done.' : `Not quite — the answer is ${question.answer}.`}
                        </p>
                        <p className="flex items-start gap-1.5 leading-relaxed">
                          <Lightbulb size={15} className="mt-0.5 flex-none" />
                          <span>{question.explanation?.trim() || 'No detailed explanation for this question yet — the correct answer is shown above.'}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 rounded-xl bg-school-gold/10 px-4 py-3 text-sm font-semibold text-school-navy dark:bg-school-gold/10 dark:text-slate-200">
                        <Sunrise size={16} className="text-school-gold" />
                        Come back tomorrow for a fresh question 🌅
                      </div>

                      <button
                        onClick={() => navigate('/exam-focus')}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-school-green/20 bg-white px-6 py-3 font-bold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200 dark:hover:bg-school-navy/40"
                      >
                        <Play size={16} fill="currentColor" /> Want more? Take a full mock exam →
                      </button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          )}

          {alreadyDoneToday && (
            <p className="text-center text-xs text-school-muted">
              You've completed today's question. See you tomorrow! 🌅
            </p>
          )}
        </div>
      )}
    </main>
  );
}
