import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  GraduationCap, Target, BookOpen, ArrowRight, Bell, CheckCircle2, Clock,
  Lightbulb, BarChart3, Star, ShieldCheck, Wallet, Award, Layers, TrendingUp, Sparkles,
  ChevronDown, Building2, MessageCircle,
} from 'lucide-react';
import { COMPANY, EXAMS, type ExamCategory, type ExamOffering } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';
import { SectionShell } from './SectionShell';

/* ── Brand system: Trust Navy + Gold ── */
const T = {
  navy: '#0F172A',
  navy2: '#13294B',
  gold: '#C68A12',     // accent text on light (WCAG-safe)
  goldFill: '#F4B400', // button fills (navy text on top)
  bg: '#F8FAFC',
  muted: '#475569',
  line: '#E2E8F0',
};
const FONT_BODY = "'Lato', system-ui, -apple-system, 'Segoe UI', sans-serif";
const EASE = [0.16, 1, 0.3, 1] as const;

const CATEGORY_META: Record<ExamCategory, { title: string; icon: typeof Target }> = {
  'post-utme': { title: 'Post-UTME', icon: GraduationCap },
  jamb: { title: 'JAMB (UTME)', icon: Target },
  waec: { title: 'WAEC (SSCE)', icon: BookOpen },
};
const ORDER: ExamCategory[] = ['post-utme', 'jamb', 'waec'];

const EXAM_DETAIL: Record<string, { icon: typeof Target; pitch: string; features: string[]; cta: string }> = {
  'rsu-post-utme': { icon: GraduationCap, pitch: 'Rivers State University screening — the full experience.', features: ['Course-based mock exams', '3,000+ real past questions', 'Score prediction + AI tutor'], cta: 'Enter RSU Post-UTME' },
  'uniport-post-utme': { icon: GraduationCap, pitch: 'University of Port Harcourt screening prep.', features: ['Built for your exact course', 'Real past questions', 'Timed mock exams'], cta: 'Explore UniPort' },
  jamb: { icon: Target, pitch: 'The national UTME — practise the real format.', features: ['English + your 3 subjects', '180-question timed mock', 'Explanation on every answer'], cta: 'Enter JAMB' },
  waec: { icon: BookOpen, pitch: 'Your O-Level (SSCE), made easy.', features: ['Objectives + theory prep', 'Science, Arts & Commercial', 'Practice by subject'], cta: 'Explore WAEC' },
};

const OFFERS = [
  { icon: Layers, title: 'Custom Practice', body: 'Drill any subjects & topics, timed or untimed, as much as you like.' },
  { icon: Clock, title: 'Timed Mock Exams', body: 'Full exams under real conditions, built for your exact course.' },
  { icon: TrendingUp, title: 'Score Prediction', body: 'Enter your JAMB + Post-UTME → see your aggregate and admission chances.' },
  { icon: Lightbulb, title: 'Answer Explanations', body: 'Understand why every answer is right — learn, don’t just cram.' },
  { icon: BarChart3, title: 'Progress Tracking', body: 'Watch your scores climb and know exactly where to improve.' },
  { icon: Sparkles, title: 'AI Study Helper', body: 'Stuck on something? Ask the AI tutor to explain it, anytime.' },
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
const FAQS = [
  { q: 'Is it free to start?', a: 'Yes — sign up free and start practising right away. Premium (₦2,000, one payment) unlocks everything: unlimited mock exams, every subject, and score prediction.' },
  { q: 'Are these real past questions?', a: 'Yes. Every question is structured from real exam syllabi and past questions — the material that actually matters for your exam.' },
  { q: 'Which exams do you cover?', a: 'RSU Post-UTME and JAMB are live now. UniPort Post-UTME and WAEC are coming soon — with more schools on the way.' },
  { q: 'One payment for everything?', a: 'Yes — one AdmitMe account and one ₦2,000 payment unlocks every live exam on the platform.' },
  { q: 'Can I use it on my phone?', a: 'Absolutely. AdmitMe works on any phone browser and can be added to your home screen like an app.' },
  { q: 'How do I pay?', a: 'Securely with Paystack (card or bank transfer) right inside the app — your access unlocks instantly.' },
];

function notifyLink(exam: ExamOffering): string {
  const msg = `Hi! Please notify me when ${exam.name} is ready on ${COMPANY.name}. 🙏`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

export function AdmitMeHub({ onLogin }: { onLogin: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: FONT_BODY }}>
      {/* Utility bar */}
      <div className="text-white" style={{ background: T.navy }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-1.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5">Welcome to {COMPANY.name} — {COMPANY.tagline}</span>
          <button onClick={onLogin} className="hidden font-bold hover:opacity-90 sm:inline" style={{ color: T.goldFill }}>Start free →</button>
        </div>
      </div>

      <SectionShell
        theme={{ primary: T.navy, light: T.goldFill }}
        brandName="Admit" brandAccent="Me"
        currentExamId="admitme"
        navItems={[{ label: 'What we offer', to: '#offers' }, { label: 'Exams', to: '#exams' }, { label: 'How it works', to: '#how' }]}
        onLogin={onLogin}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${T.navy} 0%, ${T.navy2} 62%, #1c3a63 100%)` }}>
        {/* ambient gold glow */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-25 blur-3xl" style={{ background: T.goldFill }} />
        <div className="pointer-events-none absolute right-0 top-1/3 h-80 w-80 rounded-full opacity-10 blur-3xl" style={{ background: '#60a5fa' }} />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-bold text-white backdrop-blur">
              <Sparkles size={13} style={{ color: T.goldFill }} /> Nigeria’s all-in-one exam prep
            </span>
            <h1 className="mt-5 font-sora text-4xl font-extrabold leading-[1.05] text-white sm:text-5xl lg:text-[3.4rem]" style={{ textWrap: 'balance' } as React.CSSProperties}>
              Pass every exam between you and <span style={{ color: T.goldFill }}>admission</span>.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-slate-300 sm:text-lg">
              WAEC, JAMB and Post-UTME in one place — real past questions, timed mock exams that copy the real thing, and an explanation on every answer.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <motion.button
                onClick={onLogin} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 font-sora text-base font-bold shadow-lg"
                style={{ background: T.goldFill, color: T.navy, boxShadow: `0 16px 40px -12px ${T.goldFill}` }}
              >
                Start free <ArrowRight size={18} />
              </motion.button>
              <a href="#exams" className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-7 py-3.5 font-sora text-base font-bold text-white transition hover:bg-white/10">
                Explore exams
              </a>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex items-center gap-0.5" style={{ color: T.goldFill }}>
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={15} fill="currentColor" />)}
              </div>
              <span className="text-sm font-semibold text-slate-300">Trusted by students across Nigeria</span>
            </div>
          </motion.div>

          <HeroPhone />
        </div>
        {/* soft fade into page */}
        <div className="h-8 w-full" style={{ background: 'linear-gradient(180deg, transparent, #fff)' }} />
      </section>

      {/* ── Trust band ── */}
      <section className="border-b border-slate-100 bg-white py-7">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {[
            { icon: BookOpen, label: '3,000+ real questions' },
            { icon: CheckCircle2, label: '2 exams live now' },
            { icon: Clock, label: 'Timed mock exams' },
            { icon: Lightbulb, label: 'Every answer explained' },
          ].map((t, i) => {
            const Icon = t.icon;
            return (
              <Reveal key={t.label} delay={i * 0.06} className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl" style={{ background: '#fdf4dc', color: T.gold }}><Icon size={18} /></span>
                <span className="text-sm font-bold text-slate-700">{t.label}</span>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── What we offer ── */}
      <section id="offers" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-16">
        <Reveal className="mb-10 text-center">
          <p className="font-sora text-xs font-bold uppercase tracking-[0.2em]" style={{ color: T.gold }}>What we offer</p>
          <h2 className="mt-2 font-sora text-3xl font-extrabold text-slate-900 sm:text-4xl">Everything you need to pass — in one place</h2>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((f, i) => {
            const Icon = f.icon;
            return (
              <Reveal key={f.title} delay={i * 0.05}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: T.navy, color: T.goldFill }}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-sora text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.body}</p>
                </motion.div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Choose your exam ── */}
      <section id="exams" className="scroll-mt-24 py-16" style={{ background: T.bg }}>
        <div className="mx-auto max-w-6xl px-4">
          <Reveal className="mb-10 text-center">
            <p className="font-sora text-xs font-bold uppercase tracking-[0.2em]" style={{ color: T.gold }}>Our exams</p>
            <h2 className="mt-2 font-sora text-3xl font-extrabold text-slate-900 sm:text-4xl">Choose your section — step into your exam</h2>
            <p className="mt-2 text-slate-600">Each one is a full, dedicated space built just for that exam.</p>
          </Reveal>
          {ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const offerings = EXAMS.filter((e) => e.category === cat);
            if (offerings.length === 0) return null;
            return (
              <div key={cat} className="mb-9">
                <div className="mb-3 flex items-center gap-2.5">
                  <Icon size={18} style={{ color: T.navy }} />
                  <h3 className="font-sora text-sm font-bold uppercase tracking-widest text-slate-600">{meta.title}</h3>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {cat === 'post-utme' ? (
                    <Reveal className="md:col-span-2"><PostUtmeGateway schools={offerings} onEnter={() => navigate('/post-utme')} /></Reveal>
                  ) : (
                    offerings.map((exam, i) => (
                      <Reveal key={exam.id} delay={i * 0.06}><BigExamCard exam={exam} onEnter={() => navigate(exam.path ?? '/')} /></Reveal>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Why AdmitMe ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-sora text-xs font-bold uppercase tracking-[0.2em]" style={{ color: T.gold }}>About {COMPANY.name}</p>
            <h2 className="mt-2 font-sora text-3xl font-extrabold text-slate-900 sm:text-4xl">A better future starts with the right practice</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              We put you through real exam conditions with questions structured from the actual syllabus — so you
              walk into your exam already familiar with it. One account covers every exam you need.
            </p>
            <div className="mt-7 space-y-3.5">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: T.navy, color: T.goldFill }}><Icon size={17} /></span>
                    <span className="font-bold text-slate-800">{h.label}</span>
                  </div>
                );
              })}
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-4">
            {[['3,000+', 'Questions'], ['2', 'Exams live'], ['16', 'Subjects'], ['100%', 'Real past Qs']].map(([v, l], i) => (
              <Reveal key={l} delay={i * 0.06}>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="font-sora text-3xl font-extrabold sm:text-4xl" style={{ color: T.navy }}>{v}</div>
                  <div className="mt-1 text-sm font-bold text-slate-500">{l}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="scroll-mt-24 py-16" style={{ background: T.bg }}>
        <div className="mx-auto max-w-5xl px-4">
          <Reveal><h2 className="text-center font-sora text-3xl font-extrabold text-slate-900 sm:text-4xl">How it works</h2></Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.08}>
                <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl font-sora text-lg font-extrabold" style={{ background: T.goldFill, color: T.navy }}>{s.n}</div>
                  <h3 className="font-sora text-lg font-bold text-slate-900">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-600">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <Reveal><h2 className="text-center font-sora text-3xl font-extrabold text-slate-900 sm:text-4xl">What students say</h2></Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.07}>
              <figure className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-2 flex gap-0.5" style={{ color: T.goldFill }}>
                  {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={15} fill="currentColor" />)}
                </div>
                <blockquote className="text-sm leading-relaxed text-slate-700">“{t.quote}”</blockquote>
                <figcaption className="mt-4 font-sora text-sm font-bold text-slate-900">{t.name} <span className="font-normal text-slate-500">— {t.role}</span></figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16" style={{ background: T.bg }}>
        <div className="mx-auto max-w-3xl px-4">
          <Reveal className="mb-9 text-center">
            <p className="font-sora text-xs font-bold uppercase tracking-[0.2em]" style={{ color: T.gold }}>FAQ</p>
            <h2 className="mt-2 font-sora text-3xl font-extrabold text-slate-900 sm:text-4xl">Questions? Answered.</h2>
          </Reveal>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between font-sora font-bold text-slate-900">
                  {f.q}
                  <ChevronDown size={18} className="text-slate-400 transition group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── For schools & partners ── */}
      <section className="mx-auto max-w-5xl px-4 py-16">
        <Reveal>
          <div className="grid items-center gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2 sm:p-10">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: '#fdf4dc', color: T.gold }}><Building2 size={13} /> For schools & partners</span>
              <h2 className="mt-3 font-sora text-2xl font-extrabold text-slate-900">Bring AdmitMe to your students</h2>
              <p className="mt-2 text-slate-600">Running a school, tutorial centre or study group? Partner with us to give your students structured exam prep — and grow together.</p>
            </div>
            <div className="flex sm:justify-end">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi AdmitMe — I would like to partner / bring AdmitMe to my students.')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-sora text-base font-bold text-white shadow-lg transition hover:scale-[1.03]" style={{ background: T.navy }}>
                <MessageCircle size={18} /> Talk to us
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl p-10 text-center shadow-xl sm:p-14" style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navy2})` }}>
            <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-25 blur-3xl" style={{ background: T.goldFill }} />
            <h2 className="relative font-sora text-3xl font-extrabold text-white sm:text-4xl">Ready to get admitted?</h2>
            <p className="relative mx-auto mt-3 max-w-md text-slate-300">Start practising free today — one account, every exam.</p>
            <motion.button onClick={onLogin} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="relative mt-6 inline-flex items-center gap-2 rounded-xl px-8 py-4 font-sora text-lg font-bold shadow-lg" style={{ background: T.goldFill, color: T.navy }}>
              Start free <ArrowRight size={19} />
            </motion.button>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-10 text-center text-sm text-slate-600">
        <p className="font-sora text-lg font-extrabold text-slate-900">Admit<span style={{ color: T.gold }}>Me</span></p>
        <p className="mt-1">{COMPANY.tagline}</p>
        <p className="mt-3 text-xs text-slate-500">Support: {COMPANY.supportEmail}</p>
        <p className="mt-1 text-xs text-slate-500">© {new Date().getFullYear()} {COMPANY.name}. Not officially affiliated with any university or exam body.</p>
      </footer>
    </div>
  );
}

/* ── Scroll-reveal wrapper (fade + rise on enter; reduced-motion safe) ── */
function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* ── Hero device mockup: a phone showing the AdmitMe app, gently floating ── */
function HeroPhone() {
  const reduce = useReducedMotion();
  const tiles = [
    { n: 'WAEC', d: 'Science · Arts', c: '#1b1b6b' },
    { n: 'JAMB', d: 'Your combination', c: '#10b981' },
    { n: 'Post-UTME', d: 'Pick your school', c: '#046a38' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.1 }}
      className="relative mx-auto hidden w-[270px] lg:block"
    >
      <motion.div
        animate={reduce ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="rounded-[2.2rem] p-3 shadow-2xl"
        style={{ background: '#0b1526', boxShadow: '0 40px 80px -30px rgba(0,0,0,.7)' }}
      >
        <div className="overflow-hidden rounded-[1.7rem] bg-white">
          <div className="px-4 pb-4 pt-5 text-white" style={{ background: `linear-gradient(135deg, ${T.navy}, ${T.navy2})` }}>
            <div className="font-sora text-[15px] font-extrabold">Admit<span style={{ color: T.goldFill }}>Me</span></div>
            <div className="mt-0.5 text-[11px] text-slate-300">Good evening 👋 Choose your exam</div>
          </div>
          <div className="space-y-2.5 p-3.5">
            {tiles.map((t) => (
              <div key={t.n} className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg font-sora text-xs font-bold text-white" style={{ background: t.c }}>{t.n[0]}</span>
                <div className="min-w-0">
                  <div className="text-[12.5px] font-bold text-slate-800">{t.n}</div>
                  <div className="text-[10px] text-slate-500">{t.d}</div>
                </div>
                <ArrowRight size={13} className="ml-auto text-slate-300" />
              </div>
            ))}
            <div className="mt-1 rounded-xl px-3 py-2 text-center text-[11px] font-bold" style={{ background: T.goldFill, color: T.navy }}>Start free →</div>
          </div>
        </div>
      </motion.div>
      {/* floating stat chips */}
      <FloatChip className="-left-6 top-16" icon={<BookOpen size={14} />} title="3,000+" sub="questions" />
      <FloatChip className="-right-6 bottom-24" icon={<CheckCircle2 size={14} />} title="Real" sub="exam feel" />
    </motion.div>
  );
}

function FloatChip({ className, icon, title, sub }: { className: string; icon: ReactNode; title: string; sub: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, 8, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      className={`absolute flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-xl ${className}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: T.navy, color: T.goldFill }}>{icon}</span>
      <div className="leading-tight">
        <div className="font-sora text-sm font-extrabold text-slate-900">{title}</div>
        <div className="text-[10px] font-semibold text-slate-500">{sub}</div>
      </div>
    </motion.div>
  );
}

function PostUtmeGateway({ schools, onEnter }: { schools: ExamOffering[]; onEnter: () => void }) {
  const accent = '#046a38';
  const liveCount = schools.filter((s) => s.status === 'live').length;
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm hover:shadow-xl" style={{ borderColor: `${accent}22` }}>
      <div className="flex items-center gap-3 px-6 py-5 text-white" style={{ background: `linear-gradient(120deg, ${accent}, ${accent}cc)` }}>
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/20"><GraduationCap size={24} /></div>
        <div className="min-w-0">
          <h4 className="font-sora text-xl font-extrabold leading-tight">Post-UTME</h4>
          <p className="truncate text-sm text-white/90">Prep for your university's exact screening</p>
        </div>
        <span className="ml-auto flex-none rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">{liveCount} live · more soon</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-slate-600">Choose your school and practise in <strong className="text-slate-900">its</strong> real exam format — course-based mocks, real past questions, and score prediction.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {schools.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold" style={{ borderColor: `${s.accent}44`, color: s.accent }}>
              {s.status === 'live' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
              {s.name.replace(' Post-UTME', '')}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-5">
          <button onClick={onEnter} className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-sora text-base font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: accent }}>
            Pick your school <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function BigExamCard({ exam, onEnter }: { exam: ExamOffering; onEnter: () => void }) {
  const live = exam.status === 'live';
  const detail = EXAM_DETAIL[exam.id];
  const Icon = detail?.icon ?? GraduationCap;
  const enterable = live || !!exam.path;
  const cta = live ? (detail?.cta ?? 'Enter section') : 'Take a look';

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="flex h-full flex-col overflow-hidden rounded-3xl border bg-white shadow-sm hover:shadow-xl" style={{ borderColor: `${exam.accent}22` }}>
      <div className="flex items-center gap-3 px-6 py-5 text-white" style={{ background: `linear-gradient(120deg, ${exam.accent}, ${exam.accent}cc)` }}>
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/20"><Icon size={24} /></div>
        <div className="min-w-0">
          <h4 className="font-sora text-xl font-extrabold leading-tight">{exam.name}</h4>
          {exam.school && <p className="truncate text-sm text-white/90">{exam.school}</p>}
        </div>
        <span className="ml-auto flex-none rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">{live ? 'Available now' : 'Coming soon'}</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {detail && <p className="text-slate-600">{detail.pitch}</p>}
        {detail && (
          <ul className="mt-4 space-y-2">
            {detail.features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <CheckCircle2 size={16} style={{ color: exam.accent }} /> {f}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-5">
          {enterable ? (
            <button onClick={onEnter} className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-sora text-base font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: exam.accent }}>
              {cta} <ArrowRight size={17} />
            </button>
          ) : (
            <a href={notifyLink(exam)} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 font-sora text-base font-bold transition hover:bg-slate-50" style={{ borderColor: exam.accent, color: exam.accent }}>
              <Bell size={16} /> Notify me
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
