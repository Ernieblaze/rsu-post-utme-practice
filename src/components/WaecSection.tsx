import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, ArrowLeft, ArrowRight, Bell, Clock, PenLine, ListChecks, Sparkles, Star, ShieldCheck,
} from 'lucide-react';
import { COMPANY } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';

/** WAEC's official brand — deep navy blue + gold + white. */
const T = {
  navy: '#1b1b6b',
  deep: '#12124a',
  gold: '#f5b301',
  soft: '#eef1fb',
};

const NOTIFY = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! Please notify me when WAEC (SSCE) is ready on ${COMPANY.name}. 🙏`)}`;

const WHATS_COMING = [
  { icon: ListChecks, title: 'Objective Practice', body: 'Thousands of past objective questions, subject by subject.' },
  { icon: PenLine, title: 'Theory Prep', body: 'Model answers and marking guides for theory questions.' },
  { icon: BookOpen, title: 'Full SS3 Syllabus', body: 'Every WAEC subject, mapped to the real syllabus.' },
  { icon: Star, title: 'Track & Improve', body: 'See your progress and know where to focus next.' },
];

const SUBJECTS = [
  'English Language', 'Mathematics', 'Biology', 'Physics', 'Chemistry', 'Economics',
  'Government', 'Literature-in-English', 'Geography', 'Commerce', 'Financial Accounting',
  'Agricultural Science', 'CRS', 'IRS', 'Civic Education', 'Further Mathematics',
];

export function WaecSection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/admitme')} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: T.navy }}>
              <BookOpen size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight" style={{ color: T.navy }}>WAEC <span style={{ color: T.gold }}>Prep</span></span>
          </button>
          <nav className="flex items-center gap-1">
            <a href="#subjects" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">Subjects</a>
            <a href={NOTIFY} target="_blank" rel="noreferrer" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">Notify me</a>
            <button onClick={() => navigate('/admitme')} className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: T.navy }}>
              <ArrowLeft size={15} /> AdmitMe
            </button>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden text-white" style={{ background: `linear-gradient(150deg, ${T.deep} 0%, ${T.navy} 100%)` }}>
        <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-20">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider" style={{ background: T.gold, color: T.deep }}>
            <Clock size={13} /> Launching soon
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="font-sora text-4xl font-extrabold leading-[1.1] sm:text-5xl">
            Smash Your <span style={{ color: T.gold }}>WAEC</span> 📗
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg">
            Your O-Level, made easy. Practise objectives and theory across every SS3 subject — the focused way to
            pass WAEC and set up your future.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href={NOTIFY} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]" style={{ background: T.gold, color: T.deep }}>
              <Bell size={18} /> Notify me when it's ready
            </a>
            <a href="#subjects" className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/40 px-7 py-3.5 text-lg font-bold text-white transition hover:bg-white/10">
              See subjects
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── What's coming ── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.gold }}>What's coming</p>
          <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">Built to make WAEC easy</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WHATS_COMING.map((f, i) => {
            const Icon = f.icon;
            const gold = i % 2 === 1;
            return (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: gold ? T.gold : T.navy, color: gold ? T.deep : '#fff' }}>
                  <Icon size={24} />
                </div>
                <h3 className="font-sora font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Subjects preview ── */}
      <section id="subjects" className="scroll-mt-20 py-14" style={{ background: T.soft }}>
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.navy }}>Subjects</p>
          <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">Every WAEC subject, covered</h2>
          <p className="mt-2 text-slate-600">Practice is coming for all of these — pick yours and go.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            {SUBJECTS.map((s, i) => (
              <span key={s} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold shadow-sm" style={{ borderColor: `${i % 2 === 0 ? T.navy : T.gold}66`, color: T.navy }}>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-3xl p-8 text-center text-white shadow-xl sm:p-12" style={{ background: `linear-gradient(135deg, ${T.deep}, ${T.navy})` }}>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: T.gold, color: T.deep }}><ShieldCheck size={13} /> Trusted prep</div>
          <h2 className="font-sora text-3xl font-extrabold">WAEC prep is on the way 🚀</h2>
          <p className="mx-auto mt-2 max-w-md text-white/90">Be the first to know when it goes live — we'll message you.</p>
          <a href={NOTIFY} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]" style={{ background: T.gold, color: T.deep }}>
            <Sparkles size={19} /> Notify me <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600">
        <p className="font-bold" style={{ color: T.navy }}>WAEC Prep · <span style={{ color: T.gold }}>AdmitMe</span></p>
        <p className="mt-1">Your O-Level, made easy — coming soon.</p>
        <button onClick={() => navigate('/admitme')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: T.navy }}>
          <ArrowLeft size={13} /> Back to AdmitMe
        </button>
      </footer>
    </div>
  );
}
