import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, GraduationCap, Target, BookOpen, ArrowRight, Bell, CheckCircle2, Clock, Rocket,
} from 'lucide-react';
import { COMPANY, EXAMS, type ExamCategory, type ExamOffering } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';

const CATEGORY_META: Record<ExamCategory, { title: string; blurb: string; icon: typeof Target }> = {
  'post-utme': { title: 'Post-UTME', blurb: 'School screening exams — real past questions by department.', icon: GraduationCap },
  jamb: { title: 'JAMB (UTME)', blurb: 'The national UTME — subject-by-subject practice and mock tests.', icon: Target },
  waec: { title: 'WAEC (SSCE)', blurb: 'Your O-Level exams — objectives and theory, by subject.', icon: BookOpen },
};

const ORDER: ExamCategory[] = ['post-utme', 'jamb', 'waec'];

function notifyLink(exam: ExamOffering): string {
  const msg = `Hi! Please notify me when ${exam.name} is ready on ${COMPANY.name}. 🙏`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function AdmitMeHub() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero / pitch */}
      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-gradient-to-br from-school-navy via-[#003a7a] to-school-green px-6 py-12 text-center text-white shadow-xl sm:px-10"
      >
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-school-gold/40 bg-school-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-school-gold">
          <Rocket size={13} /> One platform · every exam
        </div>
        <h1 className="font-sora text-4xl font-extrabold sm:text-5xl">
          Admit<span className="text-school-gold">Me</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-white/90 sm:text-lg">
          {COMPANY.shortPitch} One account, real past questions, timed mocks, and instant explanations —
          built to get you <strong className="text-white">admitted</strong>.
        </p>
      </motion.section>

      {/* Sections */}
      <div className="mt-8 space-y-8">
        {ORDER.map((cat) => {
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const offerings = EXAMS.filter((e) => e.category === cat);
          if (offerings.length === 0) return null;
          return (
            <section key={cat}>
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-school-green/15 text-school-green">
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className="font-sora text-xl font-bold text-school-navy dark:text-white">{meta.title}</h2>
                  <p className="text-xs text-school-navy/60 dark:text-slate-400">{meta.blurb}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {offerings.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} onStart={() => navigate(exam.path ?? '/')} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <p className="mt-10 text-center text-xs text-school-muted">
        {COMPANY.name} — {COMPANY.tagline}. More schools & exams are added regularly.
      </p>
    </main>
  );
}

function ExamCard({ exam, onStart }: { exam: ExamOffering; onStart: () => void }) {
  const live = exam.status === 'live';
  return (
    <div
      className={`flex flex-col justify-between rounded-2xl border p-5 shadow-sm ${
        live
          ? 'border-school-green/30 bg-school-pale/50 dark:border-school-green/30 dark:bg-school-green/10'
          : 'border-school-green/10 bg-white dark:border-school-green/20 dark:bg-school-navy/40'
      }`}
    >
      <div>
        <div className="mb-1 flex items-center gap-2">
          <h3 className="font-sora font-bold text-school-navy dark:text-white">{exam.name}</h3>
          {live ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 size={10} /> Available now
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
              <Clock size={10} /> Coming soon
            </span>
          )}
        </div>
        {exam.school && <p className="text-sm text-school-navy/60 dark:text-slate-400">{exam.school}</p>}
      </div>

      {live ? (
        <button
          onClick={onStart}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-school-green px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-school-green/90"
        >
          Start practising <ArrowRight size={15} />
        </button>
      ) : (
        <a
          href={notifyLink(exam)}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-school-green/30 bg-white px-4 py-2.5 text-sm font-bold text-school-navy shadow-sm transition hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/60 dark:text-slate-200"
        >
          <Bell size={15} /> Notify me
        </a>
      )}
    </div>
  );
}
