import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Mail, KeyRound, XCircle, Wifi, CreditCard, MessageCircle, LifeBuoy,
} from 'lucide-react';
import { WHATSAPP_NUMBER, SUPPORT_EMAIL } from '../lib/support';

const HELP_WHATSAPP = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hi, I need help accessing my RSU Post-UTME Practice account.')}`;

const SECTIONS = [
  {
    icon: ExternalLink,
    title: 'Open in Chrome (the most common fix)',
    steps: [
      'If you opened the site from WhatsApp, TikTok or Facebook, login often fails there.',
      'Tap the ⋮ menu (or the share icon) at the top of that mini-browser.',
      'Choose "Open in Chrome" or "Open in browser".',
      'Log in from there — it will work properly.',
    ],
  },
  {
    icon: Mail,
    title: "Didn't get your confirmation email?",
    steps: [
      'Check your Spam / Junk folder — it often lands there.',
      'On the login box, tap "Resend confirmation email".',
      'Wait 2–3 minutes and refresh your inbox.',
      'Make sure you typed your email correctly when signing up.',
    ],
  },
  {
    icon: KeyRound,
    title: 'Forgot your password?',
    steps: [
      'On the login box, tap "Forgot password?".',
      'Enter the exact email you signed up with.',
      'Check your inbox AND spam folder for the reset link.',
      'Open that link in Chrome, then set a new password.',
    ],
  },
  {
    icon: XCircle,
    title: '"Wrong email or password"',
    steps: [
      'Use the exact email address you registered with.',
      'Tap the 👁️ eye icon to see your password as you type it.',
      'Check that Caps Lock is off.',
      'Still not working? Reset your password (see above).',
    ],
  },
  {
    icon: Wifi,
    title: '"Failed to fetch" or "Can\'t connect"',
    steps: [
      'You are almost always inside an in-app browser — open in Chrome (see the first tip).',
      'Check that your internet connection is working.',
      'Turn off any VPN or ad-blocker, then try again.',
    ],
  },
  {
    icon: CreditCard,
    title: 'Paid but it\'s not unlocked?',
    steps: [
      'Access unlocks immediately after payment (we recommend Bank Transfer).',
      'If it still shows locked, refresh the page.',
      'Or log out and log back in.',
      'Still locked after a few minutes? Message us on WhatsApp with your payment proof.',
    ],
  },
];

export function LoginHelp() {
  const navigate = useNavigate();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <button
        onClick={() => navigate('/')}
        className="mb-6 inline-flex items-center gap-1.5 rounded-xl border border-school-green/20 bg-white px-4 py-2 text-sm font-semibold text-school-navy shadow-sm hover:bg-school-light dark:border-school-green/30 dark:bg-school-navy/40 dark:text-slate-200 dark:hover:bg-school-navy/60"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-school-green/15 text-school-green">
          <LifeBuoy size={24} />
        </div>
        <div>
          <h1 className="font-sora text-2xl font-bold text-school-navy dark:text-white">Login &amp; Account Help</h1>
          <p className="text-sm text-school-navy/60 dark:text-slate-400">Struggling to get in? Follow these quick steps.</p>
        </div>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-school-green/10 bg-white p-5 shadow-sm dark:border-school-green/20 dark:bg-school-navy/40"
            >
              <div className="mb-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-school-pale text-school-green dark:bg-school-green/20">
                  <Icon size={18} />
                </span>
                <h2 className="font-sora font-bold text-school-navy dark:text-white">{s.title}</h2>
              </div>
              <ol className="ml-1 space-y-1.5">
                {s.steps.map((step, idx) => (
                  <li key={idx} className="flex gap-2.5 text-sm text-school-navy/75 dark:text-slate-300">
                    <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-school-green/15 text-[11px] font-bold text-school-green">{idx + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </motion.div>
          );
        })}
      </div>

      {/* Still stuck — contact */}
      <div className="mt-6 rounded-2xl border border-school-gold/30 bg-school-pale/60 p-6 text-center dark:border-school-gold/20 dark:bg-school-navy/60">
        <h2 className="font-sora text-lg font-bold text-school-navy dark:text-white">Still stuck? We're here to help 💚</h2>
        <p className="mt-1 text-sm text-school-navy/70 dark:text-slate-300">Message us and we'll get you in personally.</p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a
            href={HELP_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-school-green px-5 py-2.5 font-bold text-white shadow-sm hover:bg-school-green/90"
          >
            <MessageCircle size={17} /> Chat on WhatsApp
          </a>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-xl border border-school-green/30 px-5 py-2.5 font-bold text-school-navy hover:bg-school-light dark:text-slate-200 dark:hover:bg-school-navy/40"
          >
            <Mail size={16} /> Email us
          </a>
        </div>
      </div>
    </main>
  );
}
