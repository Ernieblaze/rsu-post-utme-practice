import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, ArrowLeft, ArrowRight, Bell, Clock, BookOpen, Target, Lightbulb,
  BarChart3, TrendingUp, Layers, CheckCircle2, Star, ShieldCheck,
} from 'lucide-react';
import { COMPANY } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';
import { SectionShell } from './SectionShell';

/** UniPort's official brand — deep navy/royal blue + white. */
const T = {
  primary: '#1b3f70', // UniPort deep navy blue
  light: '#3b82f6', // brighter blue for accents/gradients
  deep: '#102544', // darkest navy
  soft: '#eef3fb', // very light blue
};

const NOTIFY = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi! Please notify me when UniPort Post-UTME is ready on ${COMPANY.name}. 🙏`)}`;

const FEATURES = [
  { icon: Target, title: 'Course-Based Mock', body: 'A mock built from your exact department — your JAMB subjects, timed.' },
  { icon: BookOpen, title: 'Real Past Questions', body: 'Structured from real UniPort screening — the questions that matter.' },
  { icon: Lightbulb, title: 'Answer Explanations', body: 'Understand every answer, not just memorise it.' },
  { icon: TrendingUp, title: 'Admission Predictor', body: 'Turn your JAMB + Post-UTME score into your admission chances.' },
  { icon: Layers, title: 'Practice by Subject', body: 'Drill any subject at your own pace, as many times as you like.' },
  { icon: BarChart3, title: 'Track Your Progress', body: 'See your scores climb and know exactly where to improve.' },
];
const STEPS = [
  { n: 1, title: 'Pick your department', body: 'Choose your exact course and get its JAMB subject combination.' },
  { n: 2, title: 'Practise & mock', body: 'Drill subjects, then take full timed Post-UTME mock exams.' },
  { n: 3, title: 'Walk in ready', body: 'Learn from every answer and pass your screening with confidence.' },
];
const FACULTIES = [
  'Medicine & Surgery', 'Pharmacy', 'Nursing', 'Law', 'Engineering', 'Computer Science',
  'Accounting', 'Economics', 'Mass Communication', 'Political Science', 'Microbiology',
  'Biochemistry', 'Petroleum Engineering', 'Architecture', 'English', 'Geology',
];

export function UniportSection({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SectionShell
        theme={{ primary: T.primary, light: T.light }}
        brandName="UniPort " brandAccent="Prep"
        currentExamId="uniport-post-utme"
        navItems={[{ label: 'Features', to: '#features' }, { label: 'Courses', to: '#courses' }]}
        onLogin={onLogin}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${T.soft} 0%, #ffffff 100%)` }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm" style={{ color: T.primary }}>
              <Clock size={12} /> Launching soon
            </span>
            <h1 className="mt-4 font-sora text-4xl font-extrabold leading-[1.08] text-slate-900 sm:text-5xl">
              Ace Your UniPort <span style={{ color: T.primary }}>Post-UTME</span> 🎓
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              Practice built for the <strong>University of Port Harcourt</strong> screening — real past questions,
              timed mock exams for your exact course, and an explanation on every answer.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href={NOTIFY} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-[1.03]" style={{ background: T.primary }}>
                <Bell size={18} /> Notify me when it's ready
              </a>
              <a href="#features" className="inline-flex items-center gap-2 rounded-2xl border-2 px-6 py-3.5 text-base font-bold transition hover:bg-slate-50" style={{ borderColor: T.primary, color: T.primary }}>
                See what's coming
              </a>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <span className="text-xs font-semibold text-slate-500">Same trusted prep as our RSU students love</span>
            </div>
          </motion.div>

          {/* Decorative hero panel */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block">
            <div className="absolute inset-0 rounded-[2.5rem] shadow-xl" style={{ background: `linear-gradient(150deg, ${T.deep}, ${T.light})` }} />
            <div className="absolute inset-0 flex items-center justify-center text-[9rem]">🎓</div>
            <Float className="left-2 top-8" icon={<BookOpen size={16} />} title="Real" sub="past questions" />
            <Float className="right-0 top-1/3" icon={<Target size={16} />} title="Course" sub="based mock" />
            <Float className="bottom-8 left-6" icon={<CheckCircle2 size={16} />} title="Explained" sub="every answer" />
          </motion.div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary }}>What's coming</p>
          <h2 className="mt-1 font-sora text-3xl font-extrabold">Everything for your UniPort screening</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: T.soft, color: T.primary }}>
                  <Icon size={24} />
                </div>
                <h3 className="font-sora font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center font-sora text-3xl font-extrabold">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ background: T.primary }}>{s.n}</div>
                <h3 className="font-sora font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses preview ── */}
      <section id="courses" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-14 text-center">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: T.primary }}>Built for your course</p>
        <h2 className="mt-1 font-sora text-3xl font-extrabold">Every UniPort department, covered</h2>
        <p className="mt-2 text-slate-500">Pick your exact course and get a mock from its JAMB subject combination.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          {FACULTIES.map((f) => (
            <span key={f} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold shadow-sm" style={{ borderColor: `${T.primary}33`, color: T.primary }}>
              {f}
            </span>
          ))}
        </div>
      </section>

      {/* ── Stats / trust ── */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {[['Real', 'past questions'], ['Timed', 'mock exams'], ['Every', 'answer explained'], ['Course', 'based prep']].map(([v, l]) => (
            <div key={l} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="font-sora text-2xl font-extrabold" style={{ color: T.primary }}>{v}</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="rounded-3xl p-8 text-center text-white shadow-xl sm:p-12" style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.light})` }}>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold"><ShieldCheck size={13} /> Trusted prep</div>
          <h2 className="font-sora text-3xl font-extrabold">UniPort prep is on the way 🚀</h2>
          <p className="mx-auto mt-2 max-w-md text-white/90">Be the first to know when it goes live — we'll message you.</p>
          <a href={NOTIFY} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]" style={{ color: T.primary }}>
            <Bell size={19} /> Notify me <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <p className="font-bold text-slate-700">UniPort Prep · <span style={{ color: T.primary }}>AdmitMe</span></p>
        <p className="mt-1">Post-UTME practice for the University of Port Harcourt — coming soon.</p>
        <button onClick={() => navigate('/admitme')} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold hover:underline" style={{ color: T.primary }}>
          <ArrowLeft size={13} /> Back to AdmitMe
        </button>
      </footer>
    </div>
  );
}

function Float({ className, icon, title, sub }: { className: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className={`absolute flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: T.soft, color: T.primary }}>{icon}</span>
      <div className="leading-tight">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        <div className="text-[10px] font-semibold text-slate-500">{sub}</div>
      </div>
    </div>
  );
}
