import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, CheckCircle2, Clock, Bell, GraduationCap } from 'lucide-react';
import { COMPANY, postUtmeSchools, type ExamOffering } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';
import { SectionShell } from './SectionShell';

/** Post-UTME is a category hub — a calm navy shell; each school card carries its own accent. */
const T = { primary: '#13294b', light: '#c68a12' };

// Coming-soon schools that already have a dedicated page we can send students to.
const KNOWN_ROUTES = new Set(['/uniport', '/waec', '/jamb']);

function notifyLink(school: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi! Please notify me when ${school} Post-UTME prep is ready on ${COMPANY.name}. 🙏`
  )}`;
}

/**
 * The "pick your school" screen for Post-UTME. Lists every school offering from
 * the config (postUtmeSchools) — RSU is live and routes straight into the
 * existing RSU experience; others show as "coming soon". Adding a new school is
 * purely a config row. Fully additive: the live RSU home at "/" is untouched.
 */
export function PostUtmeSection({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();
  const schools = postUtmeSchools();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SectionShell
        theme={T}
        brandName="AdmitMe " brandAccent="Post-UTME"
        navItems={[{ label: 'All exams', to: '/admitme' }]}
        onLogin={onLogin}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#eef2f9 0%,#ffffff 100%)' }}>
        <div className="mx-auto max-w-5xl px-4 py-14 text-center lg:py-16">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm" style={{ color: T.primary }}>
              <GraduationCap size={13} /> Post-UTME prep
            </span>
            <h1 className="mx-auto mt-4 max-w-2xl font-sora text-4xl font-extrabold leading-[1.1] text-slate-900 sm:text-5xl">
              Which school's Post-UTME are you preparing for?
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-slate-600 sm:text-lg">
              Pick your university and practise in its <strong>exact screening format</strong> — real past questions,
              timed mocks for your course, and an explanation on every answer.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── School picker ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-4 sm:grid-cols-2">
          {schools.map((s, i) => (
            <SchoolCard key={s.id} school={s} index={i} onNavigate={navigate} />
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          More schools are being added. Don't see yours?{' '}
          <a href={notifyLink('my school')} target="_blank" rel="noreferrer" className="font-bold hover:underline" style={{ color: T.primary }}>
            Tell us which one →
          </a>
        </p>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p className="font-bold text-slate-700">Post-UTME · <span style={{ color: T.primary }}>AdmitMe</span></p>
        <p className="mt-1">Real past questions and course-based mocks for every school's screening.</p>
        <button onClick={() => navigate('/admitme')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: T.primary }}>
          <ArrowLeft size={13} /> Back to AdmitMe
        </button>
      </footer>
    </div>
  );
}

function SchoolCard({ school, index, onNavigate }: { school: ExamOffering; index: number; onNavigate: (p: string) => void }) {
  const live = school.status === 'live';
  const accent = school.accent;
  const canOpenPage = !live && school.path && KNOWN_ROUTES.has(school.path);

  function handleClick() {
    if (live && school.path) onNavigate(school.path);         // → into the school's live prep (RSU = "/")
    else if (canOpenPage) onNavigate(school.path!);           // → its dedicated coming-soon page
  }

  const clickable = live || canOpenPage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl text-lg font-extrabold text-white font-sora" style={{ background: accent }}>
              {school.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <h3 className="font-sora text-lg font-extrabold leading-tight">{school.name}</h3>
              {school.school && <p className="text-xs font-medium text-slate-500">{school.school}</p>}
            </div>
          </div>
          {live ? (
            <span className="inline-flex flex-none items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><CheckCircle2 size={10} /> Live</span>
          ) : (
            <span className="inline-flex flex-none items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"><Clock size={10} /> Coming soon</span>
          )}
        </div>

        {school.location && (
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <MapPin size={12} /> {school.location}
          </p>
        )}
        {school.blurb && <p className="mt-2 flex-1 text-sm text-slate-600">{school.blurb}</p>}

        <div className="mt-4">
          {live ? (
            <button
              onClick={handleClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:scale-[1.02]"
              style={{ background: accent }}
            >
              Start practising <ArrowRight size={16} />
            </button>
          ) : canOpenPage ? (
            <button
              onClick={handleClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition hover:bg-slate-50"
              style={{ borderColor: accent, color: accent }}
            >
              See what's coming <ArrowRight size={16} />
            </button>
          ) : (
            <a
              href={notifyLink(school.school ?? school.name)}
              target="_blank" rel="noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-sm font-bold transition hover:bg-slate-50"
              style={{ borderColor: accent, color: accent }}
            >
              <Bell size={15} /> Notify me
            </a>
          )}
        </div>
      </div>
      {!clickable && <span className="sr-only">{school.name} coming soon</span>}
    </motion.div>
  );
}
