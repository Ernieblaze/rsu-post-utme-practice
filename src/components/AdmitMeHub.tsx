import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Target, BookOpen, ArrowRight, Bell, CheckCircle2, Clock, Rocket,
  Lightbulb, BarChart3, Sparkles, Star,
} from 'lucide-react';
import { COMPANY, BRAND, EXAMS, type ExamCategory, type ExamOffering } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';

const CATEGORY_META: Record<ExamCategory, { title: string; blurb: string; icon: typeof Target }> = {
  'post-utme': { title: 'Post-UTME', blurb: 'School screening exams — real past questions by department.', icon: GraduationCap },
  jamb: { title: 'JAMB (UTME)', blurb: 'The national UTME — English + your 3 subjects, timed like the real thing.', icon: Target },
  waec: { title: 'WAEC (SSCE)', blurb: 'Your O-Level exams — objectives and theory, by subject.', icon: BookOpen },
};
const ORDER: ExamCategory[] = ['post-utme', 'jamb', 'waec'];

const FEATURES = [
  { icon: BookOpen, title: 'Real past questions', body: 'Structured from real exam syllabi — not generic material.' },
  { icon: Clock, title: 'Timed mock exams', body: 'Practise under true exam conditions so the real day feels familiar.' },
  { icon: Lightbulb, title: 'Explanation on every answer', body: 'Understand why an answer is right — actually learn, not cram.' },
  { icon: BarChart3, title: 'Track your progress', body: 'See your scores climb and know exactly where to improve.' },
];
const STEPS = [
  { n: 1, title: 'Pick your exam', body: 'Choose your exam or school — each with its own home.' },
  { n: 2, title: 'Practise & mock', body: 'Drill subjects and take full timed mock exams.' },
  { n: 3, title: 'Walk in ready', body: 'Learn from every answer and pass with confidence.' },
];
const TESTIMONIALS = [
  { name: 'Chidinma O.', role: 'Nursing aspirant', quote: 'The mock felt exactly like the real screening. I walked in confident.' },
  { name: 'Emeka N.', role: 'JAMB candidate', quote: 'Every question has an explanation. I stopped cramming and understood.' },
  { name: 'Blessing A.', role: 'Post-UTME', quote: 'Practising daily here is the reason I got my admission.' },
];

function notifyLink(exam: ExamOffering): string {
  const msg = `Hi! Please notify me when ${exam.name} is ready on ${COMPANY.name}. 🙏`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function AdmitMeHub() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* ── Own header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/admitme')} className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}
            >
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">
              Admit<span style={{ color: BRAND.secondary }}>Me</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <a href="#exams" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:block">Exams</a>
            <a href="#why" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:block">Why AdmitMe</a>
            <a
              href="#exams"
              className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style={{ background: BRAND.primary }}
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: `linear-gradient(150deg, ${BRAND.deep} 0%, ${BRAND.primary} 55%, ${BRAND.secondary} 100%)` }}
      >
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur"
          >
            <Rocket size={13} /> One platform · every exam
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            className="font-sora text-4xl font-extrabold leading-[1.1] sm:text-6xl"
          >
            Pass WAEC, JAMB &<br className="hidden sm:block" /> Post-UTME. Get admitted. 🎓
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="mx-auto mt-4 max-w-xl text-base text-white/90 sm:text-lg"
          >
            {COMPANY.name} is your all-in-one exam prep — real past questions, timed mock exams, and an
            explanation on every answer. One account, every exam you need.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href="#exams"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]"
              style={{ color: BRAND.primary }}
            >
              Choose your exam <ArrowRight size={19} />
            </a>
          </motion.div>
          {/* Trust chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-semibold text-white/85">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> 3,000+ real questions</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> 2 exams live now</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={13} /> Timed mock exams</span>
          </div>
        </div>
      </section>

      {/* ── Choose your exam ── */}
      <section id="exams" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-14">
        <div className="mb-8 text-center">
          <h2 className="font-sora text-3xl font-extrabold">Choose what you're preparing for</h2>
          <p className="mt-2 text-slate-500 dark:text-slate-400">Each exam has its own home — pick yours and dive in.</p>
        </div>

        {ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const offerings = EXAMS.filter((e) => e.category === cat);
          if (offerings.length === 0) return null;
          return (
            <div key={cat} className="mb-8">
              <div className="mb-3 flex items-center gap-2.5">
                <Icon size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{meta.title}</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {offerings.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} onStart={() => navigate(exam.path ?? '/')} />
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* ── Why AdmitMe ── */}
      <section id="why" className="scroll-mt-20 bg-slate-50 py-14 dark:bg-white/5">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center font-sora text-3xl font-extrabold">Why students choose {COMPANY.name}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: BRAND.soft, color: BRAND.primary }}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-sora font-bold">{f.title}</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-5xl px-4 py-14">
        <h2 className="text-center font-sora text-3xl font-extrabold">How it works</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ background: BRAND.primary }}>
                {s.n}
              </div>
              <h3 className="font-sora font-bold">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-slate-50 py-14 dark:bg-white/5">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center font-sora text-3xl font-extrabold">What students say</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div className="mb-2 flex gap-0.5" style={{ color: '#f59e0b' }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">"{t.quote}"</p>
                <p className="mt-3 text-sm font-bold">{t.name} <span className="font-normal text-slate-400">— {t.role}</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-4xl px-4 py-14">
        <div
          className="rounded-3xl p-8 text-center text-white shadow-xl sm:p-12"
          style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}
        >
          <h2 className="font-sora text-3xl font-extrabold">Ready to get admitted?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">Pick your exam and start practising free today.</p>
          <a
            href="#exams"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]"
            style={{ color: BRAND.primary }}
          >
            <Sparkles size={19} /> Choose your exam
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        <p className="font-bold text-slate-700 dark:text-slate-200">
          Admit<span style={{ color: BRAND.secondary }}>Me</span>
        </p>
        <p className="mt-1">{COMPANY.tagline}</p>
        <p className="mt-2 text-xs">Support: {COMPANY.supportEmail}</p>
        <p className="mt-2 text-xs">© {new Date().getFullYear()} {COMPANY.name}. Not officially affiliated with any university or exam body.</p>
      </footer>
    </div>
  );
}

function ExamCard({ exam, onStart }: { exam: ExamOffering; onStart: () => void }) {
  const live = exam.status === 'live';
  return (
    <div
      className="flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md dark:bg-slate-900"
      style={{ borderColor: `${exam.accent}33` }}
    >
      {/* colour stripe = the section's identity */}
      <div className="h-1.5 w-full" style={{ background: exam.accent }} />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h4 className="font-sora text-lg font-bold text-slate-900 dark:text-white">{exam.name}</h4>
            {live ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: exam.accent }}>
                <CheckCircle2 size={10} /> Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300">
                <Clock size={10} /> Coming soon
              </span>
            )}
          </div>
          {exam.school && <p className="text-sm text-slate-500 dark:text-slate-400">{exam.school}</p>}
        </div>

        {live ? (
          <button
            onClick={onStart}
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
            style={{ background: exam.accent }}
          >
            Start practising <ArrowRight size={15} />
          </button>
        ) : (
          <a
            href={notifyLink(exam)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50 dark:hover:bg-white/5"
            style={{ borderColor: `${exam.accent}55`, color: exam.accent }}
          >
            <Bell size={15} /> Notify me
          </a>
        )}
      </div>
    </div>
  );
}
