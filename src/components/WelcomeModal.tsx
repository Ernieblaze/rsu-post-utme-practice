import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Target, Crown, X } from 'lucide-react';

const SEEN_KEY = 'rsu_seen_welcome';

const STEPS = [
  {
    icon: <GraduationCap size={20} />,
    title: '1. Pick your course',
    body: 'Choose your faculty, department and course once — we build practice around your exact JAMB subjects.',
  },
  {
    icon: <Target size={20} />,
    title: '2. Take a free test',
    body: 'Answer your free questions and see how the real, timed RSU Post-UTME exam feels.',
  },
  {
    icon: <Crown size={20} />,
    title: '3. Unlock everything',
    body: 'Upgrade for ₦2,000 to unlock full results, explanations, all subjects, and unlimited mock exams for a year.',
  },
];

/** One-time welcome shown to brand-new visitors so they know how to start. */
export function WelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  function close() {
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[998] flex items-center justify-center bg-black/60 px-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-school-navy"
          >
            <div className="relative bg-gradient-to-br from-school-navy to-school-green px-6 py-6 text-white">
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-3 top-3 rounded-full p-1 text-white/70 hover:bg-white/10"
              >
                <X size={18} />
              </button>
              <h2 className="font-sora text-xl font-bold">Welcome! 👋</h2>
              <p className="mt-1 text-sm text-white/85">
                Get exam-ready for RSU Post-UTME in 3 simple steps:
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              {STEPS.map((s) => (
                <div key={s.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-school-pale text-school-green dark:bg-school-green/20">
                    {s.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-school-navy dark:text-white">{s.title}</p>
                    <p className="text-sm leading-relaxed text-school-navy/70 dark:text-slate-300">{s.body}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={close}
                className="mt-2 w-full rounded-xl bg-school-green px-6 py-3 font-bold text-white shadow-sm hover:bg-school-green/90"
              >
                Let's go 🚀
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
