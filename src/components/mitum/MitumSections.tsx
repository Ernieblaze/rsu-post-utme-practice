import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Clock, Sparkles, Layers, TrendingUp, Lightbulb, BarChart3,
  BookOpen, Target, GraduationCap, ArrowRight, CheckCircle2, FileText, ShieldCheck, Zap,
} from 'lucide-react';
import { MitumButton } from './MitumButton';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Scroll-reveal (fade + rise, once). Reduced-motion safe. */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: 0.55, delay, ease: EASE }}>
      {children}
    </motion.div>
  );
}

export function Overline({ children }: { children: ReactNode }) {
  return <p className="mt-label text-xs font-semibold" style={{ color: 'var(--gold-ink)' }}>{children}</p>;
}
export function Heading({ children }: { children: ReactNode }) {
  return <h2 className="mt-display mt-2 text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--text)', letterSpacing: '-0.02em', textWrap: 'balance' }}>{children}</h2>;
}

/* ─────────────────────────  3 · Floating trust bar  ───────────────────────── */
export function FloatingTrustBar() {
  const items = [
    { icon: FileText, label: 'Real past questions' },
    { icon: Clock, label: 'Timed CBT mocks' },
    { icon: Lightbulb, label: 'AI explanations' },
    { icon: Zap, label: 'Free to start' },
  ];
  return (
    <div className="relative z-10 mx-auto -mt-8 max-w-4xl px-4">
      <Reveal>
        <div className="mt-glass grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl px-6 py-4 shadow-xl sm:grid-cols-4" style={{ boxShadow: 'var(--mt-shadow)' }}>
          {items.map((it) => {
            const Icon = it.icon;
            return (
              <div key={it.label} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl" style={{ background: 'color-mix(in srgb, var(--primary) 15%, transparent)', color: 'var(--primary)' }}><Icon size={17} /></span>
                <span className="mt-body text-sm font-bold" style={{ color: 'var(--text)' }}>{it.label}</span>
              </div>
            );
          })}
        </div>
      </Reveal>
    </div>
  );
}

/* ─────────────────────────  4 · Bento feature grid  ───────────────────────── */
export function BentoGrid() {
  return (
    <section id="offers" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16 sm:py-20">
      <Reveal className="mb-10 text-center">
        <Overline>Everything you need</Overline>
        <Heading>One platform, built to make you pass</Heading>
      </Reveal>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4">
        {/* Large: Timed Mock Exams */}
        <Reveal className="lg:col-span-2 lg:row-span-2">
          <BentoCard large accent="var(--primary)" icon={Clock} title="Timed Mock Exams" body="Full exams under real conditions — your exact subjects, a live countdown, and instant scoring. It feels like the real hall, so exam day feels familiar.">
            <div className="mt-5 flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
              <span className="mt-mono rounded-lg px-2.5 py-1 text-sm font-bold" style={{ background: 'color-mix(in srgb, var(--primary) 16%, transparent)', color: 'var(--primary)' }}>48:12</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{ width: '62%', background: 'var(--primary)' }} />
              </div>
              <span className="mt-mono text-xs font-bold" style={{ color: 'var(--text-muted)' }}>25/40</span>
            </div>
          </BentoCard>
        </Reveal>

        {/* Wide: AI Study Helper */}
        <Reveal className="lg:col-span-2" delay={0.05}>
          <BentoCard accent="var(--accent)" icon={Sparkles} title="AI Study Helper" body="Stuck on a question? Ask the AI tutor for a clear, simple explanation in any subject — anytime.">
            <div className="mt-4 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <span className="mt-body text-xs" style={{ color: 'var(--text-muted)' }}>“Explain how to balance this equation…”</span>
            </div>
          </BentoCard>
        </Reveal>

        <Reveal delay={0.1}><BentoCard accent="var(--success)" icon={Layers} title="Custom Practice" body="Drill any subject or topic, timed or relaxed, as much as you like." /></Reveal>
        <Reveal delay={0.12}><BentoCard accent="var(--primary)" icon={TrendingUp} title="Score Prediction" body="See your aggregate and real admission chances before exam day." /></Reveal>
        <Reveal className="lg:col-span-2" delay={0.14}><BentoCard accent="var(--accent)" icon={Lightbulb} title="Answer Explanations" body="Every answer explained clearly — understand it, don’t just memorise it." /></Reveal>
        <Reveal className="lg:col-span-2" delay={0.16}><BentoCard accent="var(--success)" icon={BarChart3} title="Progress Tracking" body="Watch your scores climb and know exactly which topics to fix next." /></Reveal>
      </div>
    </section>
  );
}

function BentoCard({ icon: Icon, title, body, accent, large, children }: { icon: typeof Clock; title: string; body: string; accent: string; large?: boolean; children?: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      className={`mt-card mt-grid-surface flex h-full flex-col p-6 ${large ? 'sm:p-8' : ''}`}
    >
      <span className={`flex items-center justify-center rounded-2xl ${large ? 'h-14 w-14' : 'h-12 w-12'}`} style={{ background: `color-mix(in srgb, ${accent} 14%, transparent)`, color: accent }}>
        <Icon size={large ? 28 : 24} />
      </span>
      <h3 className={`mt-display mt-4 font-extrabold ${large ? 'text-2xl' : 'text-lg'}`} style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="mt-body mt-1.5 flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{body}</p>
      {children}
    </motion.div>
  );
}

/* ─────────────────────────  5 · Choose your exam  ───────────────────────── */
const EXAM_CARDS = [
  { key: 'waec', name: 'WAEC', tag: 'SSCE', accent: 'var(--accent)', icon: BookOpen, badge: 'SOON', path: '/waec', flow: ['Pick a track — Science / Arts / Commercial', 'Choose your subjects', 'Practice or timed mock'], cta: 'Preview WAEC' },
  { key: 'jamb', name: 'JAMB', tag: 'UTME', accent: 'var(--success)', icon: Target, badge: 'LIVE', path: '/jamb', flow: ['Select your 4-subject combination', 'Full CBT mock — 180 questions', 'Explanation on every answer'], cta: 'Start JAMB' },
  { key: 'post-utme', name: 'Post-UTME', tag: 'By school', accent: 'var(--primary)', icon: GraduationCap, badge: 'LIVE', path: '/post-utme', flow: ['Choose your school', 'Then faculty & department', 'That school’s exact format + AI help'], cta: 'Pick your school' },
];

export function ChooseExam() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  return (
    <section id="exams" className="scroll-mt-24 py-16 sm:py-20" style={{ background: 'var(--surface-2)' }}>
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-10 text-center">
          <Overline>Choose your exam</Overline>
          <Heading>Three exams. One account. Straight in.</Heading>
        </Reveal>
        <div className="grid gap-5 lg:grid-cols-3">
          {EXAM_CARDS.map((e, i) => {
            const Icon = e.icon;
            return (
              <Reveal key={e.key} delay={i * 0.08}>
                <motion.div whileHover={reduce ? undefined : { y: -6 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="mt-card flex h-full flex-col overflow-hidden">
                  <div className="h-1.5 w-full" style={{ background: e.accent }} />
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `color-mix(in srgb, ${e.accent} 15%, transparent)`, color: e.accent }}><Icon size={24} /></span>
                      <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${e.accent} 15%, transparent)`, color: e.accent }}>{e.badge}</span>
                    </div>
                    <h3 className="mt-display mt-4 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>{e.name}</h3>
                    <p className="mt-label mt-0.5 text-[11px]" style={{ color: e.accent }}>{e.tag}</p>
                    <ul className="mt-4 flex-1 space-y-2">
                      {e.flow.map((f, j) => (
                        <li key={f} className="mt-body flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                          <span className="mt-mono mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-md text-[10px] font-bold" style={{ background: `color-mix(in srgb, ${e.accent} 14%, transparent)`, color: e.accent }}>{j + 1}</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => navigate(e.path)}
                      className="mt-btn mt-5 w-full text-white"
                      style={{ background: e.accent, boxShadow: 'var(--mt-shadow-sm)' }}
                    >
                      {e.cta} <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-8 flex items-center justify-center gap-2 text-center">
          <span className="mt-body inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            <ShieldCheck size={15} style={{ color: 'var(--success)' }} /> One ₦2,000 payment unlocks every live exam
            <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
          </span>
        </Reveal>
      </div>
    </section>
  );
}

/* Convenience export used by MitumHome to render Phase-3 in order. */
export function MitumPhase3({ onStart }: { onStart?: () => void }) {
  void onStart;
  return (
    <>
      <FloatingTrustBar />
      <BentoGrid />
      <ChooseExam />
    </>
  );
}
