import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, BarChart3, Home, Menu, X, GraduationCap, Layers, Trophy, Target, HelpCircle, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { AuthControl } from './AuthControl';
import { ExamCountdown } from './ExamCountdown';

type NavView = 'home' | 'progress' | 'revision' | 'bank' | 'exam-focus' | 'ai-tutor' | 'admin' | 'leaderboard';

interface HeaderProps {
  dark: boolean;
  currentView: string;
  onToggleDark: () => void;
  onNavigate: (view: NavView) => void;
}

export function Header({ dark, currentView, onToggleDark, onNavigate }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-school-green/20 bg-white/95 shadow-sm backdrop-blur-md dark:border-school-green/30 dark:bg-school-navy/95"
    >
      <ExamCountdown />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-school-green to-school-navy text-white shadow-md ring-1 ring-school-gold/40">
            <span className="text-xs font-extrabold tracking-tighter">RSU</span>
            <span className="text-[6px] font-semibold uppercase tracking-widest text-school-gold">Post-UTME</span>
          </div>
          <div className="hidden text-left leading-tight sm:block">
            <div className="text-sm font-extrabold tracking-tight text-school-navy dark:text-white">RSU Post-UTME</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-school-navy/60 dark:text-slate-400">
              Practice Platform
            </div>
          </div>
        </motion.button>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { key: 'home', label: 'Home', icon: <Home size={16} /> },
            { key: 'exam-focus', label: 'Exam Focus', icon: <Target size={16} /> },
            { key: 'bank', label: 'Practice', icon: <Layers size={16} /> },
            { key: 'ai-tutor', label: 'AI Tutor', icon: <Sparkles size={16} /> },
            { key: 'progress', label: 'Progress', icon: <BarChart3 size={16} /> },
            { key: 'revision', label: 'Revision', icon: <GraduationCap size={16} /> },
            { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={16} /> },
          ].map((item) => {
            const active = currentView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key as NavView)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? 'bg-school-green text-white shadow-sm'
                    : 'text-school-navy/80 hover:bg-school-pale dark:text-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {item.icon} {item.label}
              </button>
            );
          })}

          <button
            onClick={() => navigate('/guide')}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-school-green/20 bg-school-light text-school-navy hover:bg-school-pale dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            aria-label="How to use this site"
          >
            <HelpCircle size={16} />
          </button>

          <button
            onClick={onToggleDark}
            className="ml-2 flex h-9 w-9 items-center justify-center rounded-lg border border-school-green/20 bg-school-light text-school-navy hover:bg-school-pale dark:border-white/10 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/20"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="ml-2">
            <AuthControl />
          </div>
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => navigate('/guide')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-school-green/20 bg-school-light text-school-navy dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            aria-label="How to use this site"
          >
            <HelpCircle size={16} />
          </button>
          <button
            onClick={onToggleDark}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-school-green/20 bg-school-light text-school-navy dark:border-white/10 dark:bg-white/10 dark:text-slate-200"
            aria-label="Toggle dark mode"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-school-light text-school-navy dark:bg-school-navy/60 dark:text-white"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-school-green/10 bg-white px-4 py-3 dark:border-school-green/20 dark:bg-school-navy/95 md:hidden"
        >
          <button
            onClick={() => { onNavigate('home'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Home size={16} /> Home
          </button>
          <button
            onClick={() => { onNavigate('exam-focus'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Target size={16} /> Exam Focus
          </button>
          <button
            onClick={() => { onNavigate('bank'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Layers size={16} /> Practice
          </button>
          <button
            onClick={() => { onNavigate('ai-tutor'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Sparkles size={16} /> AI Tutor
          </button>
          <button
            onClick={() => { onNavigate('progress'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <BarChart3 size={16} /> Progress
          </button>
          <button
            onClick={() => { onNavigate('revision'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <GraduationCap size={16} /> Revision
          </button>
          <button
            onClick={() => { onNavigate('leaderboard'); setMobileOpen(false); }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-school-navy hover:bg-school-light dark:text-slate-200"
          >
            <Trophy size={16} /> Leaderboard
          </button>
          <div className="mt-3">
            <AuthControl />
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
