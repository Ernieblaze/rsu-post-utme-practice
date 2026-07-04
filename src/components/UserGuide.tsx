import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  UserPlus,
  Mail,
  GraduationCap,
  Target,
  Layers,
  BookOpen,
  TrendingUp,
  Crown,
  Gift,
  Moon,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  CreditCard,
} from 'lucide-react';

export function UserGuide() {
  const navigate = useNavigate();

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-border bg-school-surface px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/20 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-school-green/15 text-school-green">
          <BookOpen size={28} />
        </div>
        <h1 className="font-sora text-3xl font-bold text-school-navy dark:text-white">How to Use This Platform</h1>
        <p className="mt-2 text-school-muted">
          A complete walkthrough — from creating your account to passing your RSU Post-UTME.
        </p>
      </div>

      {/* Step-by-step getting started */}
      <Section title="Getting Started" icon={<UserPlus size={20} />}>
        <Step
          number={1}
          title="Create your account"
          body='Tap "Sign up / Log in" at the top of the page, enter your email and a password, and submit.'
        />
        <Step
          number={2}
          title="Confirm your email"
          icon={<Mail size={16} />}
          body="Check your inbox (and spam folder) for a confirmation email, and click the link inside. You'll land on an Email Verified page and can log straight in."
        />
        <Step
          number={3}
          title="Pick your course"
          icon={<GraduationCap size={16} />}
          body="The first time you open Exam Focus, Practice, or Revision, you'll choose your Faculty, Department, and exact Course. This is what personalizes everything to your real JAMB subject combination — you only need to do it once; it's remembered for next time. You can change it anytime with the 'Change course' button."
        />
        <Step
          number={4}
          title="Use your free trial test"
          body="Every new account gets one free test, no payment required. Use it to see exactly how the platform works before deciding to upgrade."
        />
      </Section>

      {/* The three main sections */}
      <Section title="The Three Practice Modes" icon={<Layers size={20} />}>
        <FeatureCard
          icon={<Target size={20} />}
          title="Exam Focus"
          accent="bg-school-green text-white"
          body="The main feature. Once you've picked your course, this builds one full personalized mock exam: your exact JAMB subjects, plus Current Affairs and RSU General Knowledge, all under a strict 30-minute timer — just like the real screening. At the end you get your score, a breakdown by subject, and full explanations for every question."
          cta="Try Exam Focus"
          onClick={() => navigate('/exam-focus')}
        />
        <FeatureCard
          icon={<Layers size={20} />}
          title="Practice"
          accent="bg-school-blue text-white"
          body="For targeted drilling. Choose exactly which subjects and topics you want to focus on, how many questions, and whether you want a timer or not. Good for hammering a weak subject rather than a full mock exam."
          cta="Try Practice"
          onClick={() => navigate('/bank')}
        />
        <FeatureCard
          icon={<GraduationCap size={20} />}
          title="Revision"
          accent="bg-school-gold text-school-navy"
          body="For calm studying, not testing. Browse questions filtered by subject and topic, with the explanation right there — no timer, no pressure. Six questions show at a time so it never feels overwhelming; tap 'Show more' for the next batch."
          cta="Try Revision"
          onClick={() => navigate('/revision')}
        />
        <FeatureCard
          icon={<TrendingUp size={20} />}
          title="Progress"
          accent="bg-amber-500 text-white"
          body="Every attempt you complete, in any mode, is saved here automatically — your scores over time, your average, and your weakest subjects, so you know exactly what to revise next."
          cta="View Progress"
          onClick={() => navigate('/progress')}
        />
      </Section>

      {/* Subscription / payment */}
      <Section title="Subscription & Payment" icon={<Crown size={20} />}>
        <p className="mb-3 text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">
          After your one free test, continuing requires a subscription:
        </p>
        <ul className="mb-4 space-y-2 text-sm text-school-navy/80 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 flex-none text-school-green" />
            <span><strong className="text-school-navy dark:text-white">₦2,000</strong> for one full year of unlimited access to Exam Focus, Practice, and Revision.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 flex-none text-school-green" />
            <span>Payment is handled securely by <strong className="text-school-navy dark:text-white">Paystack</strong> — card, bank transfer, or USSD. You'll see the standard Paystack payment popup; we never see or store your card details.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 flex-none text-school-green" />
            <span>Access unlocks automatically within a few seconds of a successful payment — no manual approval needed.</span>
          </li>
        </ul>

        {/* Step-by-step payment guide — recommends bank transfer */}
        <div className="mb-4 rounded-xl border border-school-green/20 bg-school-pale/50 p-4 dark:border-school-green/20 dark:bg-school-navy/60">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-school-navy dark:text-white">
            <CreditCard size={15} className="text-school-green" /> How to make payment — we recommend Bank Transfer 💡
          </p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm text-school-navy/80 dark:text-slate-300">
            <li>Tap <strong className="text-school-navy dark:text-white">Upgrade to Premium</strong> — the secure Paystack window opens.</li>
            <li>Choose <strong className="text-school-navy dark:text-white">Bank Transfer</strong> — it's the fastest and smoothest way to pay.</li>
            <li>Paystack shows you a one-time account number. Open your bank app and transfer the exact amount to that account.</li>
            <li>Once your transfer is confirmed, your Premium access <strong className="text-school-navy dark:text-white">unlocks automatically</strong> — no waiting for manual approval.</li>
          </ol>
          <p className="mt-2 text-xs text-school-muted">
            Card and USSD also work, but Bank Transfer is the most reliable and stress-free option.
          </p>
        </div>

        <button
          onClick={() => navigate('/upgrade')}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-school-green px-6 py-3 font-bold text-white shadow-sm hover:bg-school-green/90 sm:w-auto"
        >
          <Crown size={18} /> Get Premium <ChevronRight size={16} />
        </button>
      </Section>

      {/* Referral program */}
      <Section title="Earn by Referring Friends" icon={<Gift size={20} />}>
        <p className="text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">
          From your Dashboard, copy your personal referral link and share it. When someone signs up through your
          link and pays for premium, you earn <strong className="text-school-navy dark:text-white">25% of what they paid</strong> as
          a balance you can withdraw to your bank account once it reaches <strong className="text-school-navy dark:text-white">₦5,000</strong>.
        </p>
      </Section>

      {/* Quick tips */}
      <Section title="A Few Quick Tips" icon={<KeyRound size={20} />}>
        <ul className="space-y-3 text-sm text-school-navy/80 dark:text-slate-300">
          <li className="flex items-start gap-2">
            <Moon size={16} className="mt-0.5 flex-none text-school-green" />
            <span>Toggle <strong className="text-school-navy dark:text-white">light/dark mode</strong> with the sun/moon icon in the top navigation bar — your choice is remembered.</span>
          </li>
          <li className="flex items-start gap-2">
            <KeyRound size={16} className="mt-0.5 flex-none text-school-green" />
            <span>Forgot your password? On the log in popup, tap <strong className="text-school-navy dark:text-white">"Forgot password?"</strong> and a reset link will be emailed to you.</span>
          </li>
          <li className="flex items-start gap-2">
            <Target size={16} className="mt-0.5 flex-none text-school-green" />
            <span>During any timed test, your progress auto-saves — if your connection drops or you accidentally close the tab, reopening the site picks up where you left off.</span>
          </li>
        </ul>
      </Section>

      {/* Contact / support */}
      <Section title="Need Help? Contact Us" icon={<Mail size={20} />}>
        <p className="text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">
          Having any issue or difficulty — with payment, your account, or anything at all? Reach our
          support team directly and we'll help you out as fast as we can:
        </p>
        <a
          href="mailto:rsupostutmepractice@gmail.com"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-school-green px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-school-green/90"
        >
          <Mail size={16} /> rsupostutmepractice@gmail.com
        </a>
      </Section>

      <p className="mt-10 text-center text-sm text-school-muted">
        Still stuck on something? Email us at{' '}
        <a href="mailto:rsupostutmepractice@gmail.com" className="font-semibold text-school-green hover:underline">
          rsupostutmepractice@gmail.com
        </a>{' '}
        and we'll sort it out.
      </p>
    </main>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 rounded-2xl border border-school-border bg-school-surface p-6 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-school-pale text-school-green dark:bg-school-green/20">
          {icon}
        </div>
        <h2 className="font-sora text-xl font-bold text-school-navy dark:text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

function Step({ number, title, icon, body }: { number: number; title: string; icon?: React.ReactNode; body: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-school-green text-sm font-bold text-white">
        {number}
      </div>
      <div>
        <div className="flex items-center gap-1.5 font-semibold text-school-navy dark:text-white">
          {icon}
          {title}
        </div>
        <p className="mt-0.5 text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">{body}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  cta,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-school-border bg-white p-4 dark:border-school-green/20 dark:bg-school-navy/30">
      <div className="mb-2 flex items-center gap-2.5">
        <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-lg ${accent}`}>{icon}</div>
        <h3 className="font-sora font-bold text-school-navy dark:text-white">{title}</h3>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-school-navy/80 dark:text-slate-300">{body}</p>
      <button
        onClick={onClick}
        className="flex items-center gap-1 text-sm font-semibold text-school-green hover:underline"
      >
        {cta} <ChevronRight size={14} />
      </button>
    </div>
  );
}
