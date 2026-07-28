import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Bot, Send, Newspaper, ArrowRight, ArrowUpRight, Star, ShieldCheck, ChevronDown,
  CalendarClock, Flame, Users, WifiOff, Building2, MessageCircle, Sparkles,
} from 'lucide-react';
import { MitumButton } from './MitumButton';
import { Reveal, Overline, Heading } from './MitumSections';

/* ─────────────────────────  6 · AI Study Helper  ───────────────────────── */
const CHIPS = ['Explain photosynthesis', 'Balance this equation', 'What is a pronoun?', 'Solve simultaneous equations'];
export function AiHelper({ onStart }: { onStart: () => void }) {
  return (
    <section id="ai" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal className="mb-8 text-center">
          <Overline>AI study helper</Overline>
          <Heading>Stuck on a question? Just ask.</Heading>
          <p className="mt-body mt-3 text-base" style={{ color: 'var(--text-muted)' }}>A clear, simple explanation for anything, in any subject — right when you need it.</p>
        </Reveal>
        <Reveal>
          <div className="mt-glass overflow-hidden rounded-2xl" style={{ boxShadow: 'var(--mt-shadow)' }}>
            <div className="flex items-center gap-3 px-5 py-4" style={{ background: 'linear-gradient(120deg,#0F172A,#13294B)' }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: 'rgba(244,180,0,.18)', color: 'var(--primary)' }}><Bot size={20} /></span>
              <div>
                <div className="mt-display text-base font-extrabold text-white">AdmitMe AI Tutor</div>
                <div className="mt-body text-[11px]" style={{ color: '#94A3B8' }}>Clear explanations · any subject</div>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <Bubble role="assistant">Hi! I’m your AI tutor. Ask me anything — I’ll break it down simply.</Bubble>
              <Bubble role="user">Explain how to balance a chemical equation.</Bubble>
              <Bubble role="assistant">Sure 👍 Balancing means making the number of each atom equal on both sides. Count each element, add coefficients (never change formulas), and adjust until both sides match…</Bubble>
              <div className="flex flex-wrap gap-2 pt-1">
                {CHIPS.map((c) => (
                  <button key={c} onClick={onStart} className="mt-body rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)', background: 'var(--surface)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onStart(); }} className="flex items-center gap-2 border-t p-3" style={{ borderColor: 'var(--border)' }}>
              <input placeholder="Ask a study question…" className="mt-body flex-1 rounded-xl border px-3.5 py-2.5 text-sm outline-none" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }} />
              <button type="submit" aria-label="Send" className="mt-btn flex-none text-white" style={{ background: '#0F172A', width: '2.75rem', height: '2.75rem', padding: 0 }}><Send size={16} /></button>
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
function Bubble({ role, children }: { role: 'user' | 'assistant'; children: ReactNode }) {
  const user = role === 'user';
  return (
    <div className={`flex items-start gap-2 ${user ? 'flex-row-reverse' : ''}`}>
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[11px] font-bold" style={user ? { background: '#0F172A', color: '#fff' } : { background: 'var(--primary)', color: '#1B1206' }}>{user ? 'You' : <Bot size={14} />}</span>
      <div className="mt-body max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed" style={user ? { background: '#0F172A', color: '#fff' } : { background: 'var(--surface-2)', color: 'var(--text)' }}>{children}</div>
    </div>
  );
}

/* ─────────────────────────  7 · School News  ───────────────────────── */
const NEWS = [
  { tag: 'JAMB', title: 'JAMB 2026: registration & what to expect', body: 'Key dates, subject combinations, and how the CBT works this year.', fresh: true },
  { tag: 'Post-UTME', title: 'How Post-UTME cut-off marks actually work', body: 'Understand aggregate scoring so you know the mark you need.', fresh: false },
  { tag: 'WAEC', title: 'WAEC timetable: plan your revision', body: 'Map your papers to a revision schedule you can actually keep.', fresh: false },
];
export function SchoolNews() {
  const reduce = useReducedMotion();
  return (
    <section id="news" className="scroll-mt-24 py-16 sm:py-20" style={{ background: 'var(--surface-2)' }}>
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-10 flex flex-col items-center text-center">
          <span className="mt-label mb-2 inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--primary)' }}><Newspaper size={13} /> School news &amp; updates</span>
          <Heading>Stay ahead of every deadline</Heading>
          <p className="mt-body mt-3 text-base" style={{ color: 'var(--text-muted)' }}>Exam news, cut-offs and admission updates — so you never miss what matters.</p>
        </Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {NEWS.map((n, i) => (
            <Reveal key={n.title} delay={i * 0.07}>
              <motion.a href="#news" whileHover={reduce ? undefined : { y: -5 }} transition={{ type: 'spring', stiffness: 400, damping: 26 }} className="mt-card flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)' }}>{n.tag}</span>
                  {n.fresh && <span className="mt-label rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ background: 'color-mix(in srgb, var(--success) 16%, transparent)', color: 'var(--success)' }}>New this week</span>}
                </div>
                <h3 className="mt-display mt-4 text-lg font-bold" style={{ color: 'var(--text)' }}>{n.title}</h3>
                <p className="mt-body mt-1.5 flex-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{n.body}</p>
                <span className="mt-body mt-4 inline-flex items-center gap-1 text-sm font-bold" style={{ color: 'var(--primary)' }}>Read <ArrowUpRight size={15} /></span>
              </motion.a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  8 · How it works  ───────────────────────── */
const STEPS = [
  { n: 1, title: 'Pick your exam', body: 'Choose WAEC, JAMB or your Post-UTME school.' },
  { n: 2, title: 'Practise & mock', body: 'Drill subjects, then sit full timed mock exams.' },
  { n: 3, title: 'Walk in ready', body: 'Learn from every answer and pass with confidence.' },
];
export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-24 py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4">
        <Reveal className="mb-10 text-center"><Overline>How it works</Overline><Heading>Three steps to exam-ready</Heading></Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="mt-card mt-grid-surface h-full p-6 text-center">
                <div className="mt-mono mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold" style={{ background: 'var(--primary)', color: '#1B1206' }}>{s.n}</div>
                <h3 className="mt-display text-lg font-bold" style={{ color: 'var(--text)' }}>{s.title}</h3>
                <p className="mt-body mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  9 · Testimonials  ───────────────────────── */
const TESTIMONIALS = [
  { name: 'Chidinma O.', role: 'Nursing aspirant', quote: 'The mock felt exactly like the real screening. I walked in confident.' },
  { name: 'Emeka N.', role: 'JAMB candidate', quote: 'Every question has an explanation. I stopped cramming and understood.' },
  { name: 'Blessing A.', role: 'Post-UTME', quote: 'Practising daily here is the reason I got my admission.' },
];
export function Testimonials() {
  return (
    <section className="py-16 sm:py-20" style={{ background: 'var(--surface-2)' }}>
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-10 text-center"><Overline>What students say</Overline><Heading>Students who walked in ready</Heading></Reveal>
        <div className="grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.07}>
              <figure className="mt-card h-full p-6">
                <div className="mb-2 flex gap-0.5" style={{ color: 'var(--primary)' }}>{Array.from({ length: 5 }).map((_, j) => <Star key={j} size={15} fill="currentColor" />)}</div>
                <blockquote className="mt-body text-sm leading-relaxed" style={{ color: 'var(--text)' }}>“{t.quote}”</blockquote>
                <figcaption className="mt-display mt-4 text-sm font-bold" style={{ color: 'var(--text)' }}>{t.name} <span className="mt-body font-normal" style={{ color: 'var(--text-muted)' }}>— {t.role}</span></figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  10 · Big stats strip  ───────────────────────── */
const STATS = [['3,000+', 'Questions'], ['16', 'Subjects'], ['2', 'Exams live'], ['100%', 'Real past Qs']];
export function StatsStrip() {
  return (
    <section className="py-14">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-4 sm:grid-cols-4">
        {STATS.map(([v, l], i) => (
          <Reveal key={l} delay={i * 0.06}>
            <div className="mt-glass rounded-2xl px-4 py-6 text-center" style={{ boxShadow: 'var(--mt-shadow-sm)' }}>
              <div className="mt-mono text-3xl font-extrabold sm:text-4xl" style={{ color: 'var(--primary)' }}>{v}</div>
              <div className="mt-label mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>{l}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────  11 · Coming soon  ───────────────────────── */
const SOON = [
  { icon: CalendarClock, title: 'Personalized Study Plans', body: 'A daily plan built around your weakest topics.' },
  { icon: Flame, title: 'Streaks & Badges', body: 'Build a daily habit and earn rewards.' },
  { icon: Users, title: 'Parent / Guardian Dashboard', body: 'Let guardians follow real progress.' },
  { icon: WifiOff, title: 'Offline Mode', body: 'Practise without data — for the mobile app.' },
];
export function ComingSoon() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mb-10 text-center"><Overline>On the way</Overline><Heading>Coming soon to AdmitMe</Heading></Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SOON.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="mt-card relative h-full p-6">
                  <span className="mt-label absolute right-4 top-4 rounded-full px-2 py-0.5 text-[9px] font-bold" style={{ background: 'color-mix(in srgb, var(--accent) 14%, transparent)', color: 'var(--accent)' }}>Soon</span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}><Icon size={22} /></span>
                  <h3 className="mt-display mt-4 text-base font-bold" style={{ color: 'var(--text)' }}>{s.title}</h3>
                  <p className="mt-body mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  12 · FAQ  ───────────────────────── */
const FAQS = [
  { q: 'Is it free to start?', a: 'Yes — sign up free and start practising right away. Premium (₦2,000, one payment) unlocks everything: unlimited mock exams, every subject, and score prediction.' },
  { q: 'Are these real past questions?', a: 'Yes. Every question is structured from real exam syllabi and past questions — the material that actually matters.' },
  { q: 'Which exams do you cover?', a: 'JAMB and Post-UTME (RSU) are live now. WAEC and more Post-UTME schools are on the way.' },
  { q: 'One payment for everything?', a: 'Yes — one AdmitMe account and one ₦2,000 payment unlocks every live exam.' },
  { q: 'Can I use it on my phone?', a: 'Absolutely. AdmitMe works on any phone browser and installs to your home screen like an app.' },
];
export function Faq() {
  return (
    <section id="pricing" className="scroll-mt-24 py-16 sm:py-20" style={{ background: 'var(--surface-2)' }}>
      <div className="mx-auto max-w-3xl px-4">
        <Reveal className="mb-9 text-center"><Overline>FAQ</Overline><Heading>Questions? Answered.</Heading></Reveal>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <Reveal key={f.q}>
              <details className="group mt-card p-5">
                <summary className="mt-display flex cursor-pointer list-none items-center justify-between font-bold" style={{ color: 'var(--text)' }}>
                  {f.q}
                  <ChevronDown size={18} className="transition group-open:rotate-180" style={{ color: 'var(--text-muted)' }} />
                </summary>
                <p className="mt-body mt-3 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────  13 · Schools & Partners  ───────────────────────── */
export function SchoolsPartners({ waLink }: { waLink: string }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <Reveal>
        <div className="mt-card mt-grid-surface grid items-center gap-8 p-8 sm:grid-cols-2 sm:p-10">
          <div>
            <span className="mt-label inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold" style={{ background: 'color-mix(in srgb, var(--primary) 14%, transparent)', color: 'var(--primary)' }}><Building2 size={13} /> For schools &amp; partners</span>
            <h2 className="mt-display mt-3 text-2xl font-extrabold" style={{ color: 'var(--text)' }}>Bring AdmitMe to your students</h2>
            <p className="mt-body mt-2" style={{ color: 'var(--text-muted)' }}>Running a school, tutorial centre or study group? Partner with us to give your students structured exam prep — and grow together.</p>
          </div>
          <div className="flex sm:justify-end">
            <a href={waLink} target="_blank" rel="noreferrer" className="mt-btn text-white" style={{ background: '#0F172A', fontSize: '1rem', padding: '0.9rem 1.5rem' }}><MessageCircle size={18} /> Talk to us</a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────  14 · Final CTA  ───────────────────────── */
export function FinalCta({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-20">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl p-10 text-center sm:p-14" style={{ background: 'linear-gradient(135deg,#0B1120,#13294B)', boxShadow: 'var(--mt-shadow)' }}>
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full blur-3xl" style={{ background: 'var(--primary)', opacity: 0.28 }} />
          <div className="pointer-events-none absolute inset-0 mt-grid-surface opacity-30" />
          <span className="mt-label relative inline-flex items-center gap-1.5 text-xs" style={{ color: 'var(--primary)' }}><Sparkles size={13} /> Start today</span>
          <h2 className="mt-display relative mt-3 text-3xl font-extrabold text-white sm:text-4xl">Ready to get admitted?</h2>
          <p className="mt-body relative mx-auto mt-3 max-w-md" style={{ color: '#94A3B8' }}>One account, every exam. Start practising free — no card needed.</p>
          <div className="relative mt-6 flex justify-center">
            <MitumButton onClick={onStart} style={{ fontSize: '1.05rem', padding: '1rem 1.8rem' }}>Start free <ArrowRight size={19} /></MitumButton>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────  15 · Footer  ───────────────────────── */
export function MitumFooter({ supportEmail }: { supportEmail: string }) {
  const cols = [
    { h: 'Exams', links: ['WAEC', 'JAMB', 'Post-UTME'] },
    { h: 'Platform', links: ['What we offer', 'AI Tutor', 'Pricing', 'News'] },
    { h: 'Company', links: ['About AdmitMe', 'For schools', 'Contact'] },
  ];
  return (
    <footer className="border-t" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="mt-display flex h-9 w-9 items-center justify-center rounded-xl text-lg font-extrabold" style={{ background: 'var(--primary)', color: '#1B1206' }}>A</span>
            <span className="mt-display text-xl font-extrabold" style={{ color: 'var(--text)' }}>Admit<span style={{ color: 'var(--primary)' }}>Me</span></span>
          </div>
          <p className="mt-body mt-3 max-w-xs text-sm" style={{ color: 'var(--text-muted)' }}>Pass WAEC, JAMB &amp; Post-UTME with real past questions, timed mocks and an AI tutor.</p>
        </div>
        {cols.map((c) => (
          <div key={c.h}>
            <p className="mt-label text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>{c.h}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l}><a href="#top" className="mt-body text-sm" style={{ color: 'var(--text)' }}>{l}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t px-4 py-6 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="mt-body inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <ShieldCheck size={13} style={{ color: 'var(--success)' }} /> Support: {supportEmail}
          <span>·</span> © {new Date().getFullYear()} AdmitMe. Not officially affiliated with any university or exam body.
        </p>
      </div>
    </footer>
  );
}
