import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Target, BookOpen, ArrowRight, Bell, CheckCircle2, Clock,
  Lightbulb, BarChart3, Star, ShieldCheck, Wallet, Award,
} from 'lucide-react';
import { COMPANY, BRAND, EXAMS, type ExamCategory, type ExamOffering } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';

const CATEGORY_META: Record<ExamCategory, { title: string; icon: typeof Target }> = {
  'post-utme': { title: 'Post-UTME', icon: GraduationCap },
  jamb: { title: 'JAMB (UTME)', icon: Target },
  waec: { title: 'WAEC (SSCE)', icon: BookOpen },
};
const ORDER: ExamCategory[] = ['post-utme', 'jamb', 'waec'];

const FEATURES = [
  { icon: BookOpen, title: 'Real Past Questions', body: 'Structured from real exam syllabi — the questions that actually matter.' },
  { icon: Clock, title: 'Timed Mock Exams', body: 'Practise under true exam conditions so the real day feels familiar.' },
  { icon: Lightbulb, title: 'Answer Explanations', body: 'Understand why every answer is right — learn, don’t just cram.' },
  { icon: BarChart3, title: 'Track Your Progress', body: 'Watch your scores climb and know exactly where to improve.' },
];
const HIGHLIGHTS = [
  { icon: Award, label: 'Real exam experience' },
  { icon: ShieldCheck, label: 'Trusted & verified questions' },
  { icon: Wallet, label: 'Friendly, student pricing' },
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
      {/* ── Top utility bar ── */}
      <div className="text-white" style={{ background: BRAND.deep }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-1.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5">🎓 Welcome to {COMPANY.name} — {COMPANY.tagline}</span>
          <a href="#exams" className="hidden font-bold text-white/90 hover:text-white sm:inline">Get started →</a>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => navigate('/admitme')} className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
              <GraduationCap size={18} />
            </div>
            <span className="text-lg font-extrabold tracking-tight">Admit<span style={{ color: BRAND.secondary }}>Me</span></span>
          </button>
          <nav className="flex items-center gap-1">
            <a href="#exams" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:block">Exams</a>
            <a href="#features" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:block">Features</a>
            <a href="#how" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:block">How it works</a>
            <a href="#exams" className="rounded-xl px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: BRAND.primary }}>Get started</a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${BRAND.soft} 0%, #ffffff 100%)` }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: '#ffffff', color: BRAND.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              ⭐ Nigeria’s all-in-one exam prep
            </span>
            <h1 className="mt-4 font-sora text-4xl font-extrabold leading-[1.08] text-slate-900 dark:text-white sm:text-5xl">
              Grow into the school of your <span style={{ color: BRAND.primary }}>dreams</span> 🎓
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
              {COMPANY.name} is your all-in-one prep for <strong>WAEC, JAMB &amp; Post-UTME</strong> — real past
              questions, timed mock exams, and an explanation on every answer.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#exams" className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-[1.03]" style={{ background: BRAND.primary }}>
                Choose your exam <ArrowRight size={18} />
              </a>
              <a href="#how" className="inline-flex items-center gap-2 rounded-2xl border-2 px-6 py-3.5 text-base font-bold transition hover:bg-slate-50 dark:hover:bg-white/5" style={{ borderColor: BRAND.primary, color: BRAND.primary }}>
                How it works
              </a>
            </div>
            {/* rating strip */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['#4f46e5', '#7c3aed', '#10b981', '#1d4ed8'].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Trusted by students across Nigeria</span>
              </div>
            </div>
          </motion.div>

          {/* Decorative hero panel with floating stat cards (no external images) */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block">
            <div className="absolute inset-0 rounded-[2.5rem] shadow-xl" style={{ background: `linear-gradient(150deg, ${BRAND.primary}, ${BRAND.secondary})` }} />
            <div className="absolute inset-0 flex items-center justify-center text-[9rem]">🎓</div>
            <FloatCard className="left-2 top-8" icon={<BookOpen size={16} />} title="3,000+" sub="questions" />
            <FloatCard className="right-0 top-1/3" icon={<CheckCircle2 size={16} />} title="2 exams" sub="live now" />
            <FloatCard className="bottom-8 left-6" icon={<Award size={16} />} title="Real" sub="exam feel" />
          </motion.div>
        </div>
      </section>

      {/* ── Core features ── */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.primary }}>Core features</p>
          <h2 className="mt-1 font-sora text-3xl font-extrabold">Everything you need to pass</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-slate-900">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: BRAND.soft, color: BRAND.primary }}>
                  <Icon size={24} />
                </div>
                <h3 className="font-sora font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Choose your exam (programs) ── */}
      <section id="exams" className="scroll-mt-24 bg-slate-50 py-14 dark:bg-white/5">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.primary }}>Our exams</p>
            <h2 className="mt-1 font-sora text-3xl font-extrabold">Choose what you're preparing for</h2>
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
        </div>
      </section>

      {/* ── Why AdmitMe ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.primary }}>About {COMPANY.name}</p>
            <h2 className="mt-1 font-sora text-3xl font-extrabold">A better future starts with the right practice</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-300">
              We put you through real exam conditions with questions structured from the actual syllabus — so you
              walk into your exam already familiar with it. One account covers every exam you need.
            </p>
            <div className="mt-6 space-y-3">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: BRAND.soft, color: BRAND.primary }}><Icon size={18} /></span>
                    <span className="font-semibold">{h.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Stats panel */}
          <div className="grid grid-cols-2 gap-4">
            {[['3,000+', 'Questions'], ['2', 'Exams live'], ['16', 'Subjects'], ['100%', 'Real past Qs']].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div className="font-sora text-3xl font-extrabold" style={{ color: BRAND.primary }}>{v}</div>
                <div className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="scroll-mt-24 bg-slate-50 py-14 dark:bg-white/5">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center font-sora text-3xl font-extrabold">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-slate-900">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ background: BRAND.primary }}>{s.n}</div>
                <h3 className="font-sora font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-sora text-3xl font-extrabold">What students say</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <div className="mb-2 flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">"{t.quote}"</p>
              <p className="mt-3 text-sm font-bold">{t.name} <span className="font-normal text-slate-400">— {t.role}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-3xl p-8 text-center text-white shadow-xl sm:p-12" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
          <h2 className="font-sora text-3xl font-extrabold">Ready to get admitted?</h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">Pick your exam and start practising free today.</p>
          <a href="#exams" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]" style={{ color: BRAND.primary }}>
            Choose your exam <ArrowRight size={19} />
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        <p className="font-bold text-slate-700 dark:text-slate-200">Admit<span style={{ color: BRAND.secondary }}>Me</span></p>
        <p className="mt-1">{COMPANY.tagline}</p>
        <p className="mt-2 text-xs">Support: {COMPANY.supportEmail}</p>
        <p className="mt-2 text-xs">© {new Date().getFullYear()} {COMPANY.name}. Not officially affiliated with any university or exam body.</p>
      </footer>
    </div>
  );
}

function FloatCard({ className, icon, title, sub }: { className: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className={`absolute flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg ${className}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: BRAND.soft, color: BRAND.primary }}>{icon}</span>
      <div className="leading-tight">
        <div className="text-sm font-extrabold text-slate-900">{title}</div>
        <div className="text-[10px] font-semibold text-slate-500">{sub}</div>
      </div>
    </div>
  );
}

function ExamCard({ exam, onStart }: { exam: ExamOffering; onStart: () => void }) {
  const live = exam.status === 'live';
  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:bg-slate-900" style={{ borderColor: `${exam.accent}33` }}>
      <div className="h-1.5 w-full" style={{ background: exam.accent }} />
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <h4 className="font-sora text-lg font-bold text-slate-900 dark:text-white">{exam.name}</h4>
            {live ? (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: exam.accent }}><CheckCircle2 size={10} /> Live</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300"><Clock size={10} /> Coming soon</span>
            )}
          </div>
          {exam.school && <p className="text-sm text-slate-500 dark:text-slate-400">{exam.school}</p>}
        </div>
        {live ? (
          <button onClick={onStart} className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: exam.accent }}>
            Start practising <ArrowRight size={15} />
          </button>
        ) : (
          <a href={notifyLink(exam)} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition hover:bg-slate-50 dark:hover:bg-white/5" style={{ borderColor: `${exam.accent}55`, color: exam.accent }}>
            <Bell size={15} /> Notify me
          </a>
        )}
      </div>
    </div>
  );
}
