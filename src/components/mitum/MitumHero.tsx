import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Star, ShieldCheck } from 'lucide-react';
import { MitumButton } from './MitumButton';

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Phase 2 — Hero. Always-dark navy band (regardless of theme) with a soft gold +
 * indigo ambient glow, a strong headline, two CTAs, a floating realistic CBT
 * exam-interface phone mockup, and a thin trust strip along the bottom.
 */
export function MitumHero({ onStart }: { onStart: () => void }) {
  const reduce = useReducedMotion();
  const up = (delay = 0) =>
    reduce
      ? { initial: false as const, animate: { opacity: 1, y: 0 } }
      : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: EASE, delay } };

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #0B1120 0%, #0F172A 55%, #13233f 100%)' }}
    >
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-32 -top-24 h-96 w-96 rounded-full blur-3xl" style={{ background: 'var(--primary)', opacity: 0.22 }} />
      <div className="pointer-events-none absolute -right-24 top-1/4 h-96 w-96 rounded-full blur-3xl" style={{ background: 'var(--accent)', opacity: 0.18 }} />
      <div className="pointer-events-none absolute inset-0 mt-grid-surface opacity-30" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-14 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pb-16 lg:pt-20">
        {/* Left */}
        <div>
          <motion.span {...up(0)} className="mt-label inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold" style={{ borderColor: 'rgba(255,255,255,.16)', background: 'rgba(255,255,255,.05)', color: '#E2E8F0' }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--primary)' }} /> Nigeria’s all-in-one exam prep
          </motion.span>

          <motion.h1 {...up(0.06)} className="mt-display mt-5 text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-[3.4rem]" style={{ letterSpacing: '-0.025em', textWrap: 'balance' }}>
            Walk into the exam hall <span style={{ color: 'var(--primary)' }}>already ready</span>.
          </motion.h1>

          <motion.p {...up(0.12)} className="mt-body mt-5 max-w-md text-base leading-relaxed sm:text-lg" style={{ color: '#94A3B8' }}>
            WAEC, JAMB and Post-UTME in one place — real past questions and timed mock exams that mirror the real thing, question for question.
          </motion.p>

          <motion.div {...up(0.18)} className="mt-8 flex flex-wrap gap-3">
            <MitumButton onClick={onStart} style={{ fontSize: '1rem', padding: '0.95rem 1.6rem' }}>
              Start free <ArrowRight size={18} />
            </MitumButton>
            <a href="#exams" className="mt-btn" style={{ fontSize: '1rem', padding: '0.95rem 1.6rem', color: '#fff', border: '1px solid rgba(255,255,255,.25)', background: 'rgba(255,255,255,.04)' }}>
              Explore exams
            </a>
          </motion.div>
        </div>

        {/* Right — floating CBT exam phone */}
        <ExamPhone />
      </div>

      {/* Thin trust strip */}
      <div className="relative border-t" style={{ borderColor: 'rgba(255,255,255,.08)' }}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3.5 text-sm">
          <span className="flex items-center gap-0.5" style={{ color: 'var(--primary)' }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
          </span>
          <span className="mt-body font-semibold" style={{ color: '#CBD5E1' }}>Trusted by students across Nigeria</span>
          <span className="mx-1 hidden h-3 w-px sm:inline-block" style={{ background: 'rgba(255,255,255,.15)' }} />
          <span className="mt-body hidden items-center gap-1.5 text-xs sm:inline-flex" style={{ color: '#94A3B8' }}>
            <ShieldCheck size={13} style={{ color: 'var(--success)' }} /> Real past questions only
          </span>
        </div>
      </div>
    </section>
  );
}

/** A realistic CBT exam interface, gently floating — reinforces the "exam hall" feel. */
function ExamPhone() {
  const reduce = useReducedMotion();
  const options = [
    { k: 'A', t: '9.8 m/s²', on: true },
    { k: 'B', t: '10 N/kg', on: false },
    { k: 'C', t: '6.0 m/s²', on: false },
    { k: 'D', t: '9.8 J', on: false },
  ];
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      className="relative mx-auto w-[280px]"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-[2.4rem] p-3"
        style={{ background: '#0a1526', boxShadow: '0 50px 90px -30px rgba(0,0,0,.75)' }}
      >
        <div className="overflow-hidden rounded-[1.9rem] bg-white">
          {/* exam top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: 'linear-gradient(120deg,#0F172A,#13294B)' }}>
            <div>
              <div className="mt-label text-[9px]" style={{ color: '#94A3B8' }}>JAMB · Physics</div>
              <div className="mt-body text-[12px] font-bold">Question 14 of 40</div>
            </div>
            <div className="mt-mono rounded-lg px-2.5 py-1 text-[13px] font-bold" style={{ background: 'rgba(244,180,0,.16)', color: 'var(--primary)' }}>
              48:12
            </div>
          </div>

          {/* question */}
          <div className="px-4 pb-4 pt-3.5">
            <p className="mt-body text-[13px] font-semibold leading-snug" style={{ color: '#0F172A' }}>
              What is the acceleration due to gravity on Earth?
            </p>
            <div className="mt-3 space-y-2">
              {options.map((o) => (
                <div
                  key={o.k}
                  className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5"
                  style={o.on
                    ? { borderColor: 'var(--primary)', background: 'color-mix(in srgb, var(--primary) 12%, #fff)' }
                    : { borderColor: '#E2E8F0', background: '#fff' }}
                >
                  <span
                    className="mt-mono flex h-6 w-6 flex-none items-center justify-center rounded-lg text-[11px] font-bold"
                    style={o.on ? { background: 'var(--primary)', color: '#1B1206' } : { background: '#F1F5F9', color: '#64748B' }}
                  >
                    {o.k}
                  </span>
                  <span className="mt-body text-[12.5px] font-semibold" style={{ color: '#0F172A' }}>{o.t}</span>
                </div>
              ))}
            </div>

            {/* progress + next */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-1.5 rounded-full" style={{ width: i < 3 ? 14 : 8, background: i < 3 ? 'var(--primary)' : '#E2E8F0' }} />
                ))}
              </div>
              <div className="mt-label flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: '#0F172A' }}>
                Next <ArrowRight size={12} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* floating score chip */}
      <motion.div
        animate={reduce ? undefined : { y: [0, 9, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="mt-glass absolute -right-5 bottom-16 flex items-center gap-2 rounded-2xl px-3 py-2 shadow-xl"
        style={{ background: '#fff', border: '1px solid #E2E8F0' }}
      >
        <span className="mt-mono text-lg font-extrabold" style={{ color: 'var(--success)' }}>92%</span>
        <span className="mt-body text-[10px] font-semibold leading-tight" style={{ color: '#64748B' }}>mock<br />score</span>
      </motion.div>
    </motion.div>
  );
}
