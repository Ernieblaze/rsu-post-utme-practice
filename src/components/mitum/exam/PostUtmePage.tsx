import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  GraduationCap, MapPin, CheckCircle2, Clock, Bell, ArrowRight, Check, ChevronLeft, ChevronRight,
  ShieldCheck, FileText, ListChecks, Sparkles,
} from 'lucide-react';
import { COMPANY, postUtmeSchools, type ExamOffering } from '../../../config/admitme';
import { WHATSAPP_NUMBER } from '../../../lib/support';
import { useMitumTheme } from '../useMitumTheme';
import { ExamNav } from './ExamNav';

// Post-UTME is a hub — a calm navy shell; each school card carries its own accent.
const HUB = '#13294B';
const HUB_DEEP = '#0C1B33';
const EASE = [0.16, 1, 0.3, 1] as const;
const softHub = (pct: number) => `color-mix(in srgb, ${HUB} ${pct}%, transparent)`;

// RSU is the live school — its green powers the hero screening mockup.
const RSU = '#046A38';
const RSU_DEEP = '#03502B';

// Coming-soon schools that already have a dedicated page to open.
const KNOWN_ROUTES = new Set(['/uniport', '/waec', '/jamb']);

function notifyLink(school: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi! Please notify me when ${school} Post-UTME prep is ready on ${COMPANY.name}. 🙏`
  )}`;
}

export function PostUtmePage({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const { theme, toggle } = useMitumTheme();
  const reduce = useReducedMotion();
  const schools = postUtmeSchools();
  const liveCount = schools.filter((s) => s.status === 'live').length;

  return (
    <div className="mitum-app" style={{ ['--primary' as string]: HUB, ['--primary-hover' as string]: HUB_DEEP, minHeight: '100vh', background: 'var(--bg)' }}>
      <ExamNav examName="Post-UTME" accent={HUB} theme={theme} onToggleTheme={toggle} onLogin={onLogin} />

      {/* ── Hero: copy + live RSU screening screen ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${HUB_DEEP} 0%, ${HUB} 100%)` }}>
        <div className="pointer-events-none absolute inset-0 mt-grid-surface opacity-[0.14]" />
        <div className="pointer-events-none absolute -right-20 -top-16 h-72 w-72 rounded-full blur-3xl" style={{ background: RSU, opacity: 0.3 }} />
        <div className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full blur-3xl" style={{ background: '#fff', opacity: 0.08 }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:py-16 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <motion.span initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-label inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" style={{ background: 'rgba(255,255,255,.18)', color: '#fff' }}>
              <GraduationCap size={13} /> University screening
            </motion.span>
            <motion.h1 initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.05 }} className="mt-display mt-4 text-4xl font-extrabold text-white sm:text-5xl" style={{ letterSpacing: '-0.025em' }}>
              Pick your school.<br /><span style={{ color: '#93C5A6' }}>Prep in its exact format.</span>
            </motion.h1>
            <motion.p initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.1 }} className="mt-body mt-3 max-w-lg text-base text-white/90 sm:text-lg">
              Each university screens differently. Choose yours and practise its real past questions — timed mocks for your course, with an explanation on every answer.
            </motion.p>
            <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.15 }} className="mt-6 flex flex-wrap gap-2.5">
              {[[String(schools.length), 'schools'], [String(liveCount), 'live now'], ['PQ', 'real past Qs'], ['⏱', 'timed mocks']].map(([v, l], i) => (
                <div key={i} className="flex items-baseline gap-1.5 rounded-xl px-3 py-1.5" style={{ background: 'rgba(255,255,255,.14)' }}>
                  <span className="mt-mono text-sm font-extrabold text-white">{v}</span>
                  <span className="mt-body text-[11px] text-white/80">{l}</span>
                </div>
              ))}
            </motion.div>
            <motion.a href="#schools" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, ease: EASE, delay: 0.2 }} className="mt-btn mt-7 inline-flex font-bold" style={{ background: '#fff', color: HUB_DEEP, fontSize: '1rem', padding: '.85rem 1.4rem', boxShadow: '0 16px 40px -14px rgba(0,0,0,.5)' }}>
              Choose your school <ArrowRight size={17} />
            </motion.a>
          </div>

          <motion.div initial={reduce ? false : { opacity: 0, y: 24, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: -1.2 }} transition={{ duration: 0.7, ease: EASE, delay: 0.15 }} className="mx-auto w-full max-w-md lg:max-w-none">
            <ScreeningMockup />
          </motion.div>
        </div>
      </section>

      {/* ── Floating trust bar ── */}
      <div className="relative z-10 mx-auto -mt-7 max-w-6xl px-4">
        <div className="mt-card grid grid-cols-1 gap-2 p-3 sm:grid-cols-3 sm:gap-3" style={{ boxShadow: 'var(--mt-shadow)' }}>
          {[
            { icon: FileText, t: 'Real past questions', s: "Each school's actual screening" },
            { icon: ListChecks, t: 'Course-based mocks', s: 'Timed, in the exact format' },
            { icon: Sparkles, t: 'Explanation on every answer', s: 'Learn why, not just what' },
          ].map((f) => (
            <div key={f.t} className="flex items-center gap-3 rounded-xl px-3 py-2">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg" style={{ background: softHub(10), color: HUB }}><f.icon size={18} /></span>
              <span className="min-w-0">
                <span className="mt-display block text-sm font-extrabold leading-tight" style={{ color: 'var(--text)' }}>{f.t}</span>
                <span className="mt-body block truncate text-[11px]" style={{ color: 'var(--text-muted)' }}>{f.s}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── School picker ── */}
      <main id="schools" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:py-14">
        <div className="mb-7 text-center">
          <h2 className="mt-display text-2xl font-extrabold sm:text-3xl" style={{ color: 'var(--text)' }}>Choose your university</h2>
          <p className="mt-body mx-auto mt-2 max-w-md text-sm" style={{ color: 'var(--text-muted)' }}>Live schools open straight into practice. More are being added every season.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {schools.map((s, i) => <SchoolCard key={s.id} school={s} index={i} onNavigate={navigate} />)}
        </div>

        <p className="mt-body mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
          Don't see your school?{' '}
          <a href={notifyLink('my school')} target="_blank" rel="noreferrer" className="font-bold hover:underline" style={{ color: HUB }}>Tell us which one →</a>
        </p>

        {/* how screening prep works */}
        <div className="mt-14">
          <h3 className="mt-display mb-6 text-center text-xl font-extrabold" style={{ color: 'var(--text)' }}>How it works</h3>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              { n: '1', t: 'Pick your school & course', s: 'We load its exact screening format and subjects.' },
              { n: '2', t: 'Sit a timed mock', s: 'Real past questions, in the real question count.' },
              { n: '3', t: 'See every explanation', s: 'Learn the why behind each answer and improve fast.' },
            ].map((step) => (
              <div key={step.n} className="mt-card p-6" style={{ boxShadow: 'var(--mt-shadow-sm)' }}>
                <span className="mt-mono flex h-10 w-10 items-center justify-center rounded-2xl text-base font-extrabold" style={{ background: softHub(10), color: HUB }}>{step.n}</span>
                <h4 className="mt-display mt-4 text-lg font-bold" style={{ color: 'var(--text)' }}>{step.t}</h4>
                <p className="mt-body mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>{step.s}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function SchoolCard({ school, index, onNavigate }: { school: ExamOffering; index: number; onNavigate: (p: string) => void }) {
  const reduce = useReducedMotion();
  const live = school.status === 'live';
  const accent = school.accent;
  const canOpenPage = !live && school.path && KNOWN_ROUTES.has(school.path);

  function handleClick() {
    if (live && school.path) onNavigate(school.path);
    else if (canOpenPage) onNavigate(school.path!);
  }

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: EASE }}
      whileHover={reduce ? undefined : { y: -4 }}
      className="mt-card flex flex-col overflow-hidden p-0"
      style={{ boxShadow: 'var(--mt-shadow)', borderTop: `4px solid ${accent}` }}
    >
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="mt-display flex h-12 w-12 flex-none items-center justify-center rounded-xl text-lg font-extrabold text-white" style={{ background: accent }}>{school.name.slice(0, 2).toUpperCase()}</span>
            <div>
              <h3 className="mt-display text-lg font-extrabold leading-tight" style={{ color: 'var(--text)' }}>{school.name}</h3>
              {school.school && <p className="mt-body text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{school.school}</p>}
            </div>
          </div>
          {live
            ? <span className="mt-label inline-flex flex-none items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'color-mix(in srgb, #10b981 16%, transparent)', color: '#059669' }}><CheckCircle2 size={10} /> Live</span>
            : <span className="mt-label inline-flex flex-none items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase" style={{ background: 'color-mix(in srgb, #f59e0b 18%, transparent)', color: '#b45309' }}><Clock size={10} /> Soon</span>}
        </div>

        {school.location && <p className="mt-body mt-3 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}><MapPin size={12} /> {school.location}</p>}
        {school.blurb && <p className="mt-body mt-2 flex-1 text-sm" style={{ color: 'var(--text-muted)' }}>{school.blurb}</p>}

        <div className="mt-5">
          {live ? (
            <button onClick={handleClick} className="mt-btn w-full text-white" style={{ background: accent, boxShadow: `0 14px 30px -14px ${accent}` }}>Start practising <ArrowRight size={16} /></button>
          ) : canOpenPage ? (
            <button onClick={handleClick} className="mt-btn w-full" style={{ border: `2px solid ${accent}`, color: accent, background: 'transparent' }}>See what's coming <ArrowRight size={16} /></button>
          ) : (
            <a href={notifyLink(school.school ?? school.name)} target="_blank" rel="noreferrer" className="mt-btn w-full" style={{ border: `2px solid ${accent}`, color: accent, background: 'transparent' }}><Bell size={15} /> Notify me</a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Live RSU Post-UTME screening CBT mockup (hero visual) ── */
function ScreeningMockup() {
  const opts = [
    { k: 'A', t: 'A change of state at constant temperature', on: true },
    { k: 'B', t: 'A rise in temperature only' },
    { k: 'C', t: 'A fall in pressure' },
    { k: 'D', t: 'A gain in mass' },
  ];
  const palette = Array.from({ length: 25 }, (_, i) => i + 1);
  const answered = new Set([1, 2, 3, 4, 5, 7, 8, 9, 11, 12, 15]);
  const current = 16;
  return (
    <div className="overflow-hidden rounded-2xl" style={{ background: '#fff', boxShadow: '0 40px 80px -30px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.14)' }}>
      <div className="flex items-center gap-1.5 px-3.5 py-2.5" style={{ background: '#0F172A' }}>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#EF4444' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#F59E0B' }} />
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#22C55E' }} />
        <span className="mx-auto text-[11px] font-semibold" style={{ color: '#94A3B8', fontFamily: 'var(--mt-body)' }}>RSU Post-UTME · Screening</span>
      </div>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ background: `linear-gradient(120deg, ${RSU_DEEP}, ${RSU})` }}>
        <div className="flex items-center gap-2 text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-extrabold" style={{ background: 'rgba(255,255,255,.92)', color: RSU_DEEP, fontFamily: 'var(--mt-display)' }}>A</span>
          <span className="text-xs font-bold" style={{ fontFamily: 'var(--mt-display)' }}>Rivers State University</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-lg px-2.5 py-1" style={{ background: 'rgba(255,255,255,.18)' }}>
          <motion.span animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="h-1.5 w-1.5 rounded-full" style={{ background: '#86EFAC' }} />
          <span className="text-xs font-bold text-white" style={{ fontFamily: 'var(--mt-mono)' }}>00:24:37</span>
        </div>
      </div>
      <div className="grid gap-3 p-4" style={{ gridTemplateColumns: '1fr 92px' }}>
        <div>
          <div className="text-[11px] font-bold" style={{ color: RSU, fontFamily: 'var(--mt-mono)' }}>QUESTION 16 OF 50</div>
          <p className="mt-1 text-[13px] font-semibold leading-snug" style={{ color: '#0F172A', fontFamily: 'var(--mt-body)' }}>
            Evaporation of a liquid is best described as which of the following?
          </p>
          <div className="mt-3 space-y-1.5">
            {opts.map((o) => (
              <div key={o.k} className="flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[12px]" style={o.on ? { borderColor: RSU, background: '#ECFDF3' } : { borderColor: '#E2E8F0', background: '#fff' }}>
                <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold" style={o.on ? { background: RSU, color: '#fff' } : { background: '#F1F5F9', color: '#64748B' }}>{o.on ? <Check size={12} /> : o.k}</span>
                <span style={{ color: o.on ? RSU_DEEP : '#475569', fontFamily: 'var(--mt-body)', fontWeight: o.on ? 700 : 500 }}>{o.t}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-bold" style={{ background: '#F1F5F9', color: '#64748B', fontFamily: 'var(--mt-body)' }}><ChevronLeft size={13} /> Prev</span>
            <span className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: RSU, fontFamily: 'var(--mt-body)' }}>Next <ChevronRight size={13} /></span>
          </div>
        </div>
        <div className="rounded-lg p-2" style={{ background: '#F8FAFC', border: '1px solid #EEF2F7' }}>
          <div className="mb-1.5 text-[9px] font-bold uppercase tracking-wide" style={{ color: '#94A3B8', fontFamily: 'var(--mt-label)' }}>50 Qs</div>
          <div className="grid grid-cols-5 gap-1">
            {palette.map((n) => {
              const isCur = n === current;
              const isDone = answered.has(n);
              return (
                <span key={n} className="flex h-4 w-full items-center justify-center rounded-[3px] text-[8px] font-bold" style={isCur ? { background: '#fff', color: RSU_DEEP, boxShadow: `0 0 0 1.5px ${RSU}`, fontFamily: 'var(--mt-mono)' } : isDone ? { background: RSU, color: '#fff', fontFamily: 'var(--mt-mono)' } : { background: '#E2E8F0', color: '#94A3B8', fontFamily: 'var(--mt-mono)' }}>{n}</span>
              );
            })}
          </div>
          <div className="mt-2 flex items-center gap-1.5">
            <ShieldCheck size={11} style={{ color: RSU }} />
            <span className="text-[9px] font-semibold" style={{ color: '#64748B', fontFamily: 'var(--mt-body)' }}>Exact format</span>
          </div>
        </div>
      </div>
    </div>
  );
}
