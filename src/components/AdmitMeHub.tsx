import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap, Target, BookOpen, ArrowRight, Bell, CheckCircle2, Clock,
  Lightbulb, BarChart3, Star, ShieldCheck, Wallet, Award, Layers, TrendingUp, Sparkles,
  ChevronDown, Building2, MessageCircle,
} from 'lucide-react';
import { COMPANY, BRAND, EXAMS, type ExamCategory, type ExamOffering } from '../config/admitme';
import { WHATSAPP_NUMBER } from '../lib/support';
import { SectionShell } from './SectionShell';

const CATEGORY_META: Record<ExamCategory, { title: string; icon: typeof Target }> = {
  'post-utme': { title: 'Post-UTME', icon: GraduationCap },
  jamb: { title: 'JAMB (UTME)', icon: Target },
  waec: { title: 'WAEC (SSCE)', icon: BookOpen },
};
const ORDER: ExamCategory[] = ['post-utme', 'jamb', 'waec'];

// Rich detail for the big gateway cards
const EXAM_DETAIL: Record<string, { icon: typeof Target; pitch: string; features: string[]; cta: string }> = {
  'rsu-post-utme': { icon: GraduationCap, pitch: 'Rivers State University screening — the full experience.', features: ['Course-based mock exams', '3,000+ real past questions', 'Score prediction + AI tutor'], cta: 'Enter RSU Post-UTME' },
  'uniport-post-utme': { icon: GraduationCap, pitch: 'University of Port Harcourt screening prep.', features: ['Built for your exact course', 'Real past questions', 'Timed mock exams'], cta: 'Explore UniPort' },
  jamb: { icon: Target, pitch: 'The national UTME — practise the real format.', features: ['English + your 3 subjects', '180-question timed mock', 'Explanation on every answer'], cta: 'Enter JAMB' },
  waec: { icon: BookOpen, pitch: 'Your O-Level (SSCE), made easy and fun.', features: ['Objectives + theory', 'Every SS3 subject', 'Fun, focused practice'], cta: 'Explore WAEC' },
};

// "What we offer" — real, usable capabilities of the platform
const OFFERS = [
  { icon: Layers, title: 'Custom Practice', body: 'Drill any subjects & topics, timed or untimed, as much as you like.' },
  { icon: Clock, title: 'Timed Mock Exams', body: 'Full exams under real conditions, built for your exact course.' },
  { icon: TrendingUp, title: 'Post-UTME Score Prediction', body: 'Enter your JAMB + Post-UTME → see your aggregate and admission chances.' },
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
    <div className="min-h-screen bg-white text-slate-900">
      {/* ── Top utility bar ── */}
      <div className="text-white" style={{ background: BRAND.deep }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-1.5 text-[11px] font-medium">
          <span className="inline-flex items-center gap-1.5">🎓 Welcome to {COMPANY.name} — {COMPANY.tagline}</span>
          <a href="#exams" className="hidden font-bold text-white hover:opacity-90 sm:inline">Get started →</a>
        </div>
      </div>

      <SectionShell
        theme={{ primary: BRAND.primary, light: BRAND.secondary }}
        brandName="Admit" brandAccent="Me"
        currentExamId="admitme"
        navItems={[{ label: 'What we offer', to: '#offers' }, { label: 'Exams', to: '#exams' }, { label: 'How it works', to: '#how' }]}
        onLogin={onLogin}
      />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden" style={{ background: `linear-gradient(180deg, ${BRAND.soft} 0%, #ffffff 100%)` }}>
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-bold shadow-sm" style={{ color: BRAND.primary }}>
              ⭐ Nigeria’s all-in-one exam prep
            </span>
            <h1 className="mt-4 font-sora text-4xl font-extrabold leading-[1.08] text-slate-900 sm:text-5xl">
              Grow into the school of your <span style={{ color: BRAND.primary }}>dreams</span> 🎓
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
              {COMPANY.name} is your all-in-one prep for <strong className="text-slate-900">WAEC, JAMB &amp; Post-UTME</strong> —
              real past questions, timed mock exams, and an explanation on every answer.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#exams" className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-[1.03]" style={{ background: BRAND.primary }}>
                Choose your exam <ArrowRight size={18} />
              </a>
              <a href="#offers" className="inline-flex items-center gap-2 rounded-2xl border-2 px-6 py-3.5 text-base font-bold transition hover:bg-slate-50" style={{ borderColor: BRAND.primary, color: BRAND.primary }}>
                What we offer
              </a>
            </div>
            <div className="mt-6 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['#4f46e5', '#7c3aed', '#10b981', '#1d4ed8'].map((c) => (
                  <span key={c} className="h-8 w-8 rounded-full border-2 border-white" style={{ background: c }} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}
                </div>
                <span className="text-xs font-semibold text-slate-600">Trusted by students across Nigeria</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block">
            <div className="absolute inset-0 rounded-[2.5rem] shadow-xl" style={{ background: `linear-gradient(150deg, ${BRAND.primary}, ${BRAND.secondary})` }} />
            <div className="absolute inset-0 flex items-center justify-center text-[9rem]">🎓</div>
            <FloatCard className="left-2 top-8" icon={<BookOpen size={16} />} title="3,000+" sub="questions" />
            <FloatCard className="right-0 top-1/3" icon={<CheckCircle2 size={16} />} title="2 exams" sub="live now" />
            <FloatCard className="bottom-8 left-6" icon={<Award size={16} />} title="Real" sub="exam feel" />
          </motion.div>
        </div>
      </section>

      {/* ── Trust band ── */}
      <section className="border-y border-slate-100 bg-white py-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
          {[
            { icon: BookOpen, label: '3,000+ real questions' },
            { icon: CheckCircle2, label: '2 exams live now' },
            { icon: Clock, label: 'Timed mock exams' },
            { icon: Lightbulb, label: 'Every answer explained' },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <div key={t.label} className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl" style={{ background: BRAND.soft, color: BRAND.primary }}><Icon size={18} /></span>
                <span className="text-sm font-semibold text-slate-700">{t.label}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── What we offer ── */}
      <section id="offers" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.primary }}>What we offer</p>
          <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">Everything you need to pass — in one place</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: BRAND.soft, color: BRAND.primary }}>
                  <Icon size={24} />
                </div>
                <h3 className="font-sora font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Choose your exam — BIG detailed gateways ── */}
      <section id="exams" className="scroll-mt-24 bg-slate-50 py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.primary }}>Our exams</p>
            <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">Choose your section — step into your exam</h2>
            <p className="mt-2 text-slate-600">Each one is a full, dedicated space built just for that exam.</p>
          </div>
          {ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            const Icon = meta.icon;
            const offerings = EXAMS.filter((e) => e.category === cat);
            if (offerings.length === 0) return null;
            return (
              <div key={cat} className="mb-8">
                <div className="mb-3 flex items-center gap-2.5">
                  <Icon size={18} className="text-slate-500" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-600">{meta.title}</h3>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  {offerings.map((exam) => (
                    <BigExamCard key={exam.id} exam={exam} onEnter={() => navigate(exam.path ?? '/')} />
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
            <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">A better future starts with the right practice</h2>
            <p className="mt-4 text-slate-600">
              We put you through real exam conditions with questions structured from the actual syllabus — so you
              walk into your exam already familiar with it. One account covers every exam you need.
            </p>
            <div className="mt-6 space-y-3">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.label} className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: BRAND.soft, color: BRAND.primary }}><Icon size={18} /></span>
                    <span className="font-semibold text-slate-800">{h.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[['3,000+', 'Questions'], ['2', 'Exams live'], ['16', 'Subjects'], ['100%', 'Real past Qs']].map(([v, l]) => (
              <div key={l} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="font-sora text-3xl font-extrabold" style={{ color: BRAND.primary }}>{v}</div>
                <div className="mt-1 text-sm font-semibold text-slate-600">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="scroll-mt-24 bg-slate-50 py-14">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center font-sora text-3xl font-extrabold text-slate-900">How it works</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white" style={{ background: BRAND.primary }}>{s.n}</div>
                <h3 className="font-sora font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center font-sora text-3xl font-extrabold text-slate-900">What students say</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-2 flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
              </div>
              <p className="text-sm leading-relaxed text-slate-700">"{t.quote}"</p>
              <p className="mt-3 text-sm font-bold text-slate-900">{t.name} <span className="font-normal text-slate-500">— {t.role}</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-slate-50 py-14">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND.primary }}>FAQ</p>
            <h2 className="mt-1 font-sora text-3xl font-extrabold text-slate-900">Questions? Answered.</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900">
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
      <section className="mx-auto max-w-5xl px-4 py-14">
        <div className="grid items-center gap-8 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:grid-cols-2 sm:p-10">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold" style={{ background: BRAND.soft, color: BRAND.primary }}><Building2 size={13} /> For schools & partners</span>
            <h2 className="mt-3 font-sora text-2xl font-extrabold text-slate-900">Bring AdmitMe to your students</h2>
            <p className="mt-2 text-slate-600">Running a school, tutorial centre or study group? Partner with us to give your students structured exam prep — and grow together.</p>
          </div>
          <div className="flex sm:justify-end">
            <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi AdmitMe — I would like to partner / bring AdmitMe to my students.')}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold text-white shadow-lg transition hover:scale-[1.03]" style={{ background: BRAND.primary }}>
              <MessageCircle size={18} /> Talk to us
            </a>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="mx-auto max-w-5xl px-4 pb-16">
        <div className="rounded-3xl p-8 text-center text-white shadow-xl sm:p-12" style={{ background: `linear-gradient(135deg, ${BRAND.primary}, ${BRAND.secondary})` }}>
          <h2 className="font-sora text-3xl font-extrabold">Ready to get admitted?</h2>
          <p className="mx-auto mt-2 max-w-md text-white">Pick your exam and start practising free today.</p>
          <a href="#exams" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 text-lg font-bold shadow-lg transition hover:scale-[1.03]" style={{ color: BRAND.primary }}>
            Choose your exam <ArrowRight size={19} />
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-600">
        <p className="font-bold text-slate-800">Admit<span style={{ color: BRAND.secondary }}>Me</span></p>
        <p className="mt-1">{COMPANY.tagline}</p>
        <p className="mt-2 text-xs text-slate-500">Support: {COMPANY.supportEmail}</p>
        <p className="mt-2 text-xs text-slate-500">© {new Date().getFullYear()} {COMPANY.name}. Not officially affiliated with any university or exam body.</p>
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

function BigExamCard({ exam, onEnter }: { exam: ExamOffering; onEnter: () => void }) {
  const live = exam.status === 'live';
  const detail = EXAM_DETAIL[exam.id];
  const Icon = detail?.icon ?? GraduationCap;
  const enterable = live || !!exam.path;
  const cta = live ? (detail?.cta ?? 'Enter section') : 'Take a look';

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl" style={{ borderColor: `${exam.accent}22` }}>
      {/* Coloured gateway banner */}
      <div className="flex items-center gap-3 px-6 py-5 text-white" style={{ background: `linear-gradient(120deg, ${exam.accent}, ${exam.accent}cc)` }}>
        <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/20"><Icon size={24} /></div>
        <div className="min-w-0">
          <h4 className="font-sora text-xl font-extrabold leading-tight">{exam.name}</h4>
          {exam.school && <p className="truncate text-sm text-white/90">{exam.school}</p>}
        </div>
        <span className="ml-auto flex-none rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">
          {live ? 'Available now' : 'Coming soon'}
        </span>
      </div>

      {/* Body */}
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
            <button onClick={onEnter} className="flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold text-white shadow-sm transition hover:opacity-90" style={{ background: exam.accent }}>
              {cta} <ArrowRight size={17} />
            </button>
          ) : (
            <a href={notifyLink(exam)} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 text-base font-bold transition hover:bg-slate-50" style={{ borderColor: exam.accent, color: exam.accent }}>
              <Bell size={16} /> Notify me
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
