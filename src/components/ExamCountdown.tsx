import { useEffect, useState } from 'react';
import { Flame, GraduationCap } from 'lucide-react';

/**
 * Live countdown to the RSU Post-UTME exam. Shown site-wide (in the Header)
 * to build honest urgency as the real exam date approaches. When the date
 * passes it switches to an encouraging message instead of a negative timer.
 *
 * Exam start: 21 July 2026, 8:00 AM (West Africa Time, UTC+1).
 * Change EXAM_DATE below if the official date/time changes.
 */
const EXAM_DATE = new Date('2026-07-21T08:00:00+01:00');

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

function computeTimeLeft(): TimeLeft {
  const diff = EXAM_DATE.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: false };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export function ExamCountdown() {
  const [t, setT] = useState<TimeLeft>(computeTimeLeft);

  useEffect(() => {
    const id = setInterval(() => setT(computeTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  if (t.done) {
    return (
      <div className="bg-gradient-to-r from-school-green via-school-green to-emerald-600 px-4 py-1.5 text-center text-white">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold sm:text-sm">
          <GraduationCap size={15} /> RSU Post-UTME is here — good luck, you've got this! 🎓
        </span>
      </div>
    );
  }

  const unit = (value: number, label: string) => (
    <span className="inline-flex flex-col items-center leading-none">
      <span className="font-sora text-sm font-extrabold tabular-nums sm:text-base">{pad(value)}</span>
      <span className="text-[8px] font-semibold uppercase tracking-wide opacity-80">{label}</span>
    </span>
  );

  return (
    <div className="bg-gradient-to-r from-school-navy via-[#0a2f5c] to-school-green px-3 py-1.5 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-2 sm:gap-3">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide sm:text-xs">
          <Flame size={14} className="text-school-gold" fill="currentColor" />
          <span className="hidden sm:inline">RSU Post-UTME in</span>
          <span className="sm:hidden">Exam in</span>
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {unit(t.days, 'days')}
          <span className="text-sm font-bold opacity-50">:</span>
          {unit(t.hours, 'hrs')}
          <span className="text-sm font-bold opacity-50">:</span>
          {unit(t.minutes, 'min')}
          <span className="text-sm font-bold opacity-50">:</span>
          {unit(t.seconds, 'sec')}
        </div>
        <span className="hidden text-[11px] font-semibold text-school-gold sm:inline">
          — are you ready?
        </span>
      </div>
    </div>
  );
}
