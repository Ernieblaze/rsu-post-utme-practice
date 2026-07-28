import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import type { Theme } from '../useMitumTheme';

export interface ExamTab {
  id: string;
  label: string;
  icon: typeof Sun;
}

interface ExamNavProps {
  examName: string;
  accent: string;          // exam signature colour
  theme: Theme;
  onToggleTheme: () => void;
  onLogin: () => void;
  tabs: ExamTab[];
  active: string;
  onTab: (id: string) => void;
}

/**
 * Shared exam-page top bar: AdmitMe brand → exam name (in the exam's colour),
 * a clear tab row (Focus · Practice · AI Tutor · News), theme toggle, and login.
 * The design is AdmitMe's; the accent is per-exam.
 */
export function ExamNav({ examName, accent, theme, onToggleTheme, onLogin, tabs, active, onTab }: ExamNavProps) {
  const navigate = useNavigate();
  return (
    <header className="mt-glass sticky top-0 z-50" style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <button onClick={() => navigate('/')} className="flex flex-none items-center gap-2" aria-label="AdmitMe home">
            <span className="mt-display flex h-8 w-8 items-center justify-center rounded-lg text-base font-extrabold" style={{ background: 'var(--primary)', color: '#1B1206' }}>A</span>
            <span className="mt-display hidden text-base font-extrabold sm:inline" style={{ color: 'var(--text)' }}>Admit<span style={{ color: 'var(--primary)' }}>Me</span></span>
          </button>
          <span className="hidden text-sm sm:inline" style={{ color: 'var(--border)' }}>/</span>
          <span className="mt-display truncate text-base font-extrabold" style={{ color: accent }}>{examName}</span>
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

      {/* Tabs */}
      <div className="border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-3">
          {tabs.map((t) => {
            const on = t.id === active;
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => onTab(t.id)} className="relative flex flex-none items-center gap-1.5 px-3 py-2.5 text-sm font-semibold transition-colors" style={{ color: on ? accent : 'var(--text-muted)', fontFamily: 'var(--mt-body)' }}>
                <Icon size={16} /> {t.label}
                {on && <motion.span layoutId="exam-tab" transition={{ type: 'spring', stiffness: 500, damping: 38 }} className="absolute inset-x-2 -bottom-px h-0.5 rounded-full" style={{ background: accent }} />}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
