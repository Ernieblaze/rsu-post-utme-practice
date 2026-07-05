import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Target, CalendarClock, ArrowRight, BookOpen } from 'lucide-react';
import type { Attempt } from '../types';
import { daysUntilExam } from '../lib/examCountdown';
import { getStreak } from '../lib/streak';
import { weakestSubject } from '../lib/studyFocus';

interface StudyPlanCardProps {
  attempts: Attempt[];
  onReviseSubject: (subject: string) => void;
}

/**
 * Home "Study Plan" — the daily driver. Combines the exam countdown, the
 * student's practice streak, and their weakest subject (from past attempts)
 * into one clear "what to do today" card. 100% client-side.
 */
export function StudyPlanCard({ attempts, onReviseSubject }: StudyPlanCardProps) {
  const navigate = useNavigate();

  const days = useMemo(() => daysUntilExam(), []);
  const streak = useMemo(() => getStreak(attempts.map((a) => a.date)), [attempts]);
  const weakest = useMemo(() => weakestSubject(attempts), [attempts]);

  const urgent = days <= 7;
  const examOver = days <= 0;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-6 overflow-hidden rounded-3xl border border-school-gold/30 bg-gradient-to-br from-school-navy via-[#003a7a] to-school-green p-6 text-white shadow-lg sm:p-7"
    >
      {/* Top row: label + streak */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-school-gold ring-1 ring-white/10">
          <Target size={13} /> Your Exam Plan
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ring-1 ${
            streak > 0
              ? 'bg-school-gold/20 text-school-gold ring-school-gold/30'
              : 'bg-white/10 text-white/80 ring-white/15'
          }`}
        >
          <Flame size={14} fill={streak > 0 ? 'currentColor' : 'none'} />
          {streak > 0
            ? `${streak}-day streak`
            : 'Start your streak today'}
        </span>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-2xl ${urgent ? 'bg-school-gold text-school-navy' : 'bg-white/10 text-school-gold'}`}>
          <CalendarClock size={24} />
        </div>
        <div>
          {examOver ? (
            <h2 className="font-sora text-2xl font-extrabold leading-tight">Exam day is here — good luck! 🎓</h2>
          ) : (
            <>
              <h2 className="font-sora text-3xl font-extrabold leading-none">
                {days} {days === 1 ? 'day' : 'days'}{' '}
                <span className="text-lg font-bold text-white/85">to your RSU Post-UTME</span>
              </h2>
              <p className={`mt-1 text-sm font-semibold ${urgent ? 'text-school-gold' : 'text-white/70'}`}>
                {urgent ? 'Final stretch — make every day count.' : 'Steady daily practice is how you pass.'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Today's focus */}
      <div className="mt-5 rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
        {weakest ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-school-gold">Today's focus</p>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-sora text-xl font-bold">{weakest.subject}</p>
                <p className="text-sm text-white/80">
                  Your weakest area so far — <strong className="text-white">{Math.round(weakest.accuracy * 100)}%</strong>. A little drilling here moves your score the most.
                </p>
              </div>
              <button
                onClick={() => onReviseSubject(weakest.subject)}
                className="inline-flex flex-none items-center gap-2 rounded-xl bg-school-gold px-5 py-2.5 font-bold text-school-navy shadow-sm transition hover:opacity-90"
              >
                Practice {weakest.subject} <ArrowRight size={16} />
              </button>
            </div>
            <button
              onClick={() => navigate('/exam-focus')}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 hover:text-white"
            >
              <BookOpen size={15} /> Or take a full mock exam →
            </button>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-widest text-school-gold">Start here</p>
            <p className="mt-1 text-sm text-white/85">
              Take one full mock exam to see exactly where you stand — then we'll point you at your weakest subject each day.
            </p>
            <button
              onClick={() => navigate('/exam-focus')}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-school-gold px-5 py-2.5 font-bold text-school-navy shadow-sm transition hover:opacity-90"
            >
              Start my mock exam <ArrowRight size={16} />
            </button>
          </>
        )}
      </div>
    </motion.section>
  );
}
