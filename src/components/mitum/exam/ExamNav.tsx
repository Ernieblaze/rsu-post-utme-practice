import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ChevronDown, Home, Check } from 'lucide-react';
import type { Theme } from '../useMitumTheme';

export interface ExamTab {
  id: string;
  label: string;
  icon: typeof Sun;
}

/** The exams a student can jump between, for the cross-exam switcher. */
const EXAM_LINKS = [
  { name: 'JAMB', path: '/jamb', color: '#10B981' },
  { name: 'WAEC', path: '/waec', color: '#1B1B6B' },
  { name: 'Post-UTME', path: '/post-utme', color: '#13294B' },
];

interface ExamNavProps {
  examName: string;
  accent: string;          // exam signature colour
  theme: Theme;
  onToggleTheme: () => void;
  onLogin: () => void;
  /** Optional in-nav tabs. Omit to keep the nav clean and put section tabs in-page. */
  tabs?: ExamTab[];
  active?: string;
  onTab?: (id: string) => void;
}

/**
 * Shared exam-page top bar: AdmitMe brand → exam name (in the exam's colour),
 * a clear tab row (Focus · Practice · AI Tutor · News), theme toggle, and login.
 * The design is AdmitMe's; the accent is per-exam.
 */
export function ExamNav({ examName, accent, theme, onToggleTheme, onLogin, tabs, active, onTab }: ExamNavProps) {
  const navigate = useNavigate();
  const [switcher, setSwitcher] = useState(false);
  const switchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!switcher) return;
    const onDoc = (e: MouseEvent) => { if (switchRef.current && !switchRef.current.contains(e.target as Node)) setSwitcher(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [switcher]);

  return (
    <header className="mt-glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button onClick={() => navigate('/')} className="flex flex-none items-center gap-2" aria-label="AdmitMe home">
            <span className="mt-display flex h-8 w-8 items-center justify-center rounded-lg text-base font-extrabold" style={{ background: 'var(--primary)', color: '#1B1206' }}>A</span>
            <span className="mt-display hidden text-base font-extrabold sm:inline" style={{ color: 'var(--text)' }}>Admit<span style={{ color: 'var(--primary)' }}>Me</span></span>
          </button>
          <span className="hidden text-sm sm:inline" style={{ color: 'var(--border)' }}>/</span>

          {/* Exam name → cross-exam switcher */}
          <div ref={switchRef} className="relative">
            <button onClick={() => setSwitcher((v) => !v)} className="mt-display flex items-center gap-1 truncate rounded-lg px-1.5 py-1 text-base font-extrabold transition-colors" style={{ color: accent }} aria-haspopup="menu" aria-expanded={switcher}>
              {examName}
              <motion.span animate={{ rotate: switcher ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex"><ChevronDown size={16} /></motion.span>
            </button>
            <AnimatePresence>
              {switcher && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.16 }}
                  role="menu" className="absolute left-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl p-1.5"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--mt-shadow)' }}
                >
                  <p className="mt-label px-2.5 pb-1 pt-1.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>Switch exam</p>
                  {EXAM_LINKS.map((e) => {
                    const current = e.name === examName;
                    return (
                      <button key={e.name} role="menuitem" onClick={() => { setSwitcher(false); if (!current) navigate(e.path); }} className="mt-body flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors" style={{ color: 'var(--text)', background: current ? 'var(--surface-2)' : 'transparent' }}>
                        <span className="h-2.5 w-2.5 flex-none rounded-full" style={{ background: e.color }} />
                        <span className="flex-1 text-left">{e.name}</span>
                        {current && <Check size={15} style={{ color: accent }} />}
                      </button>
                    );
                  })}
                  <div className="my-1 h-px" style={{ background: 'var(--border)' }} />
                  <button role="menuitem" onClick={() => { setSwitcher(false); navigate('/'); }} className="mt-body flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold transition-colors" style={{ color: 'var(--text-muted)' }}>
                    <Home size={15} /> All exams
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button onClick={onToggleTheme} aria-label="Toggle theme" className="mt-btn mt-btn-secondary" style={{ padding: '0.45rem', width: '2.35rem', height: '2.35rem' }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }} className="flex items-center justify-center">
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>
          <button onClick={onLogin} className="mt-btn text-white" style={{ background: accent, fontSize: '.9rem', padding: '.5rem 1rem' }}>Log in</button>
        </div>
      </div>

      {/* Optional in-nav tabs (kept for pages that want them) */}
      {tabs && tabs.length > 0 && (
        <div className="border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3">
            {tabs.map((t) => {
              const on = t.id === active;
              const Icon = t.icon;
              return (
                <button key={t.id} onClick={() => onTab?.(t.id)} className="relative flex flex-none items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors" style={{ color: on ? accent : 'var(--text-muted)', fontFamily: 'var(--mt-body)' }}>
                  <Icon size={16} /> {t.label}
                  {on && <motion.span layoutId="exam-tab" transition={{ type: 'spring', stiffness: 500, damping: 38 }} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: accent }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
