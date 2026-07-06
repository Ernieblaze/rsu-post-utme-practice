import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame, Target, BookOpen, Lightbulb, GraduationCap, Star, CheckCircle2, ArrowRight,
} from 'lucide-react';
import { InAppBrowserNotice } from './InAppBrowserNotice';

/**
 * Dedicated ad landing page (/start). Clean, focused, 100% education —
 * NO money/referral language — so paid-ad reviewers (TikTok, Meta) approve it.
 * One clear message, one clear action: start practicing.
 */

const EXAM_DATE = new Date('2026-07-21T08:00:00+01:00');

function useCountdown() {
  const [t, setT] = useState(() => diff());
  function diff() {
    const ms = EXAM_DATE.getTime() - Date.now();
    if (ms <= 0) return null;
    return {
      d: Math.floor(ms / 86400000),
      h: Math.floor((ms / 3600000) % 24),
      m: Math.floor((ms / 60000) % 60),
    };
  }
  useEffect(() => {
    const id = setInterval(() => setT(diff()), 30000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const FEATURES = [
  { icon: BookOpen, title: '3,000+ Real Past Questions', body: 'Actual RSU Post-UTME questions across all 16 subjects — not generic JAMB material.' },
  { icon: Target, title: 'Timed Mock Exams', body: 'Practice under real exam conditions, built for your exact course, so exam day feels familiar.' },
  { icon: Lightbulb, title: 'Explanation on Every Answer', body: 'Understand why an answer is right — stop cramming and actually learn.' },
  { icon: GraduationCap, title: 'Built for Your Course', body: 'Pick your department and get a mock exam from your exact JAMB subject combination.' },
];

const TESTIMONIALS = [
  { name: 'Chidinma O.', course: 'Nursing', quote: 'The mock exam felt exactly like the real screening — timed, my exact subjects. I walked in confident.' },
  { name: 'Emeka N.', course: 'Computer Science', quote: 'Every question has a full explanation. I stopped just cramming and actually understood the work.' },
];

interface StartLandingProps {
  onGetStarted: () => void;
}

export function StartLanding({ onGetStarted }: StartLandingProps) {
  const t = useCountdown();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-school-light dark:from-school-navy dark:to-[#001a38]">
      {/* Minimal top bar */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-school-green to-school-navy text-white shadow-md ring-1 ring-school-gold/40">
            <span className="text-xs font-extrabold tracking-tighter">RSU</span>
            <span className="text-[6px] font-semibold uppercase tracking-widest text-school-gold">Post-UTME</span>
          </div>
          <span className="text-sm font-extrabold tracking-tight text-school-navy dark:text-white">RSU Post-UTME Practice</span>
        </div>
        <button
          onClick={onGetStarted}
          className="rounded-lg bg-school-green px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-school-green/90"
        >
          Start Free
        </button>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6 text-center">
        {/* Rescue paid TikTok traffic stuck in the in-app browser (sign-up fails there) */}
        <InAppBrowserNotice />

        {t && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-school-gold/40 bg-school-gold/10 px-4 py-1.5 text-sm font-bold text-school-navy dark:text-school-gold"
          >
            <Flame size={15} className="text-school-gold" fill="currentColor" />
            RSU Post-UTME in {t.d}d : {t.h}h : {t.m}m
          </motion.div>
        )}

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sora text-3xl font-extrabold leading-tight text-school-navy dark:text-white sm:text-5xl"
        >
          Pass Your RSU Post-UTME<br className="hidden sm:block" /> with Confidence 🎓
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-school-navy/70 dark:text-slate-300 sm:text-lg"
        >
          Practice with <strong className="text-school-navy dark:text-white">3,000+ real past questions</strong>, take
          timed mock exams built for your exact course, and learn from a full explanation on every answer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-7"
        >
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 rounded-2xl bg-school-green px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.03] hover:bg-school-green/90"
          >
            Start Practicing Free <ArrowRight size={20} />
          </button>
          <p className="mt-2 text-xs text-school-muted">Free to start · Takes 30 seconds · No card needed</p>
        </motion.div>

        {/* Stats */}
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-3 gap-3">
          {[
            ['3,000+', 'Questions'],
            ['16', 'Subjects'],
            ['15 yrs', 'Past Papers'],
          ].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-school-green/10 bg-white p-3 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
              <div className="font-sora text-2xl font-bold text-school-green">{v}</div>
              <div className="text-xs font-semibold uppercase tracking-wide text-school-muted">{l}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="flex items-start gap-3 rounded-2xl border border-school-green/10 bg-white p-5 text-left shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
                <div className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-school-green/10 text-school-green">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-sora font-bold text-school-navy dark:text-white">{f.title}</h3>
                  <p className="mt-0.5 text-sm leading-relaxed text-school-navy/70 dark:text-slate-300">{f.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="mt-12 grid gap-4 sm:grid-cols-2">
          {TESTIMONIALS.map((tt) => (
            <div key={tt.name} className="rounded-2xl border border-school-green/10 bg-white p-5 text-left shadow-sm dark:border-school-green/20 dark:bg-school-navy/40">
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className="text-school-gold" fill="currentColor" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">"{tt.quote}"</p>
              <p className="mt-3 text-sm font-bold text-school-navy dark:text-white">
                {tt.name} <span className="font-normal text-school-muted">— {tt.course}</span>
              </p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <div className="mt-14 rounded-3xl bg-gradient-to-br from-school-navy to-school-green p-8 text-white">
          <h2 className="font-sora text-2xl font-bold">Ready to walk in prepared?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
            Join students getting exam-ready with real RSU past questions and timed practice.
          </p>
          <button
            onClick={onGetStarted}
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-school-navy shadow-lg transition hover:scale-[1.03]"
          >
            Start Practicing Free <ArrowRight size={20} />
          </button>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-white/80">
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={13} /> Real past questions</span>
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={13} /> Timed mock exams</span>
            <span className="inline-flex items-center gap-1"><CheckCircle2 size={13} /> Free to start</span>
          </div>
        </div>

        <p className="mt-10 text-xs text-school-muted">
          © {new Date().getFullYear()} RSU Post-UTME Practice. Not officially affiliated with Rivers State University.
        </p>
      </main>
    </div>
  );
}